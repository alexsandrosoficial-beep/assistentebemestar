import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Validar autenticação
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      console.error("Authorization header ausente");
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extrair o token JWT
    const token = authHeader.replace('Bearer ', '');
    
    // Criar cliente Supabase com service role para validação
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Verificar usuário com o JWT token
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      console.error("Erro de autenticação:", authError);
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Usuário autenticado:", user.id);

    // Verificar assinatura ativa
    const { data: subscription, error: subError } = await supabaseAdmin
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    if (subError) {
      console.error("Erro ao verificar assinatura:", subError);
      return new Response(JSON.stringify({ error: "Erro ao verificar assinatura" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!subscription) {
      console.error("Assinatura inválida para usuário:", user.id);
      return new Response(JSON.stringify({ error: "Assinatura inválida ou expirada" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let body: any;
    try {
      body = await req.json();
    } catch (err) {
      console.error('Body inválido:', err);
      return new Response(JSON.stringify({ error: 'Corpo da requisição inválido' }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const messages = Array.isArray(body?.messages) ? body.messages : [];
    if (messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Mensagens ausentes' }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY não configurada");

    console.log("Chat iniciado - Usuário:", user.id, "- Mensagens:", messages.length);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: `Você é um assistente de inteligência artificial especializado em saúde e bem-estar.

🎯 **Suas responsabilidades:**
• Responder perguntas sobre saúde, fitness, nutrição, bem-estar mental e hábitos saudáveis
• Ajudar usuários a organizarem suas rotinas e metas de saúde
• Fornecer dicas práticas e baseadas em evidências
• Ser empático, motivacional e claro nas respostas

📝 **FORMATAÇÃO OBRIGATÓRIA - USE MARKDOWN:**

**Estrutura das Respostas:**
1. Comece com um título principal usando ## (H2) com emoji relevante
2. Use ### (H3) para subtópicos importantes
3. Use **negrito** para destacar pontos-chave e termos importantes
4. Use listas com bullet points (•) ou números
5. Separe seções com linhas em branco

**Exemplo de Formatação Ideal:**

## 😴 Como Melhorar Seu Sono

Entendo sua preocupação com a qualidade do sono. Vou compartilhar algumas estratégias comprovadas:

### 🌙 Rotina Noturna
• **Horário consistente**: Durma e acorde no mesmo horário
• **Ambiente adequado**: Quarto escuro, silencioso e fresco
• **Relaxamento**: 30 minutos de atividades calmas antes de dormir

### ⚡ Dicas Práticas
1. **Evite telas** 1 hora antes de dormir
2. **Limite cafeína** após as 14h
3. **Exercícios regulares**, mas não à noite

### 💡 Lembre-se
Uma boa noite de sono é fundamental para sua saúde física e mental!

---

**Emojis Recomendados:**
• 🎯 Objetivos e metas
• 💪 Exercícios e força
• 🥗 Alimentação
• 😴 Sono
• 🧘 Meditação/relaxamento
• ⚡ Dicas importantes
• ⚠️ Alertas
• 💡 Insights
• ✅ Checklist

⚠️ **IMPORTANTE:**
• Você NÃO substitui médicos ou profissionais de saúde
• Para questões médicas sérias, sempre recomende consultar um profissional
• Não forneça diagnósticos médicos
• Responda APENAS sobre saúde e bem-estar
• Se perguntado sobre outros assuntos, redirecione educadamente` 
          },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error("Rate limit excedido");
        return new Response(JSON.stringify({ error: "Limite de requisições atingido. Tente novamente em breve." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        console.error("Pagamento necessário");
        return new Response(JSON.stringify({ error: "Créditos insuficientes. Por favor, recarregue seus créditos." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("Erro na API:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Erro ao processar requisição" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Erro no chat:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
