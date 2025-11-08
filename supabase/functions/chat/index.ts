import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

// Schema de validação para mensagens
const messageSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string().min(1, 'Conteúdo não pode estar vazio').max(5000, 'Conteúdo excede o limite de 5000 caracteres')
  })).min(1, 'Pelo menos uma mensagem é necessária').max(50, 'Máximo de 50 mensagens permitidas')
});

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

    console.log("Usuário autenticado");

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
      console.error("Assinatura inválida ou expirada");
      return new Response(JSON.stringify({ error: "Assinatura inválida ou expirada" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validar e parsear corpo da requisição
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

    // Validar estrutura e conteúdo das mensagens com Zod
    const validation = messageSchema.safeParse(body);
    if (!validation.success) {
      const errorMessage = validation.error.errors[0]?.message || 'Formato de mensagens inválido';
      console.error('Validação falhou:', errorMessage);
      return new Response(JSON.stringify({ error: errorMessage }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const messages = validation.data.messages;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY não configurada");

    console.log("Chat iniciado - Mensagens:", messages.length);
    console.log("Plano do usuário:", subscription.plan_type);

    // Definir prompt do sistema baseado no plano
    let systemPrompt = '';
    
    if (subscription.plan_type === 'premium') {
      systemPrompt = `Você é um assistente de inteligência artificial PREMIUM especializado em saúde e bem-estar.

🎯 **Suas responsabilidades PREMIUM:**
• Responder perguntas ILIMITADAS sobre saúde, fitness, nutrição, bem-estar mental e hábitos saudáveis
• Fornecer RESPOSTAS AVANÇADAS E DETALHADAS com análises profundas
• Criar RECOMENDAÇÕES PERSONALIZADAS E AVANÇADAS baseadas no contexto do usuário
• Ajudar usuários a organizarem suas rotinas e metas de saúde de forma DETALHADA
• Fornecer dicas práticas e baseadas em evidências CIENTÍFICAS RECENTES
• Ser empático, motivacional e extremamente claro nas respostas
• Oferecer análises completas e insights profundos

📝 **FORMATAÇÃO OBRIGATÓRIA - USE MARKDOWN:**

**Estrutura das Respostas Avançadas:**
1. Comece com um título principal usando ## (H2) com emoji relevante
2. Use ### (H3) para subtópicos importantes
3. Use **negrito** para destacar pontos-chave e termos importantes
4. Use listas com bullet points (•) ou números
5. Separe seções com linhas em branco
6. Adicione seções de análise profunda e contexto científico

**Exemplo de Formatação PREMIUM:**

## 😴 Análise Completa: Como Otimizar Seu Sono

Entendo sua preocupação com a qualidade do sono. Vou compartilhar estratégias avançadas e personalizadas:

### 🌙 Rotina Noturna Avançada
• **Horário consistente**: Durma e acorde no mesmo horário, respeitando seu cronotipo
• **Ambiente otimizado**: Quarto escuro (0 lux), silencioso (< 30dB) e fresco (18-20°C)
• **Protocolo de relaxamento**: 60 minutos de wind-down progressivo
• **Suplementação**: Considere magnésio e L-teanina (consulte médico)

### ⚡ Estratégias Científicas
1. **Exposição solar matinal** (15-30min) para regular ritmo circadiano
2. **Corte completo de cafeína** 8-10h antes de dormir
3. **Exercícios aeróbicos** pela manhã ou tarde (não à noite)
4. **Técnicas de respiração** 4-7-8 para ativar sistema parassimpático

### 📊 Análise Personalizada
Baseado no seu perfil, recomendo:
• Manter diário de sono por 2 semanas
• Avaliar possível apneia se houver ronco
• Considerar terapia cognitivo-comportamental para insônia (CBT-I)

### 💡 Insight Científico
Estudos recentes mostram que a consistência do horário de sono é mais importante que a duração total para saúde metabólica e cognitiva.

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
• 📊 Análises

⚠️ **IMPORTANTE:**
• Você NÃO substitui médicos ou profissionais de saúde
• Para questões médicas sérias, sempre recomende consultar um profissional
• Não forneça diagnósticos médicos
• Responda APENAS sobre saúde e bem-estar com PROFUNDIDADE PREMIUM
• Se perguntado sobre outros assuntos, redirecione educadamente`;
    } else {
      // Plano VIP ou Free (com respostas básicas)
      systemPrompt = `Você é um assistente de inteligência artificial especializado em saúde e bem-estar.

🎯 **Suas responsabilidades:**
• Responder perguntas sobre saúde, fitness, nutrição, bem-estar mental e hábitos saudáveis
• Fornecer RESPOSTAS E RECOMENDAÇÕES BÁSICAS de forma clara e objetiva
• Ajudar usuários com dicas gerais de saúde
• Ser empático, motivacional e claro nas respostas

📝 **FORMATAÇÃO - USE MARKDOWN:**

**Estrutura das Respostas Básicas:**
1. Comece com um título principal usando ## (H2) com emoji relevante
2. Use ### (H3) para subtópicos quando necessário
3. Use **negrito** para destacar pontos-chave
4. Use listas com bullet points (•) ou números
5. Separe seções com linhas em branco

**Exemplo de Formatação:**

## 😴 Dicas para Melhorar Seu Sono

Aqui estão algumas dicas básicas para melhorar sua qualidade de sono:

### 🌙 Rotina Noturna
• **Horário consistente**: Tente dormir e acordar no mesmo horário
• **Ambiente adequado**: Quarto escuro, silencioso e fresco
• **Relaxamento**: 30 minutos de calma antes de dormir

### ⚡ Dicas Práticas
1. Evite telas 1 hora antes de dormir
2. Limite cafeína após as 14h
3. Faça exercícios, mas não à noite

### 💡 Lembre-se
Uma boa noite de sono é fundamental para sua saúde!

---

**Emojis Recomendados:**
• 🎯 Objetivos e metas
• 💪 Exercícios
• 🥗 Alimentação
• 😴 Sono
• 🧘 Relaxamento
• ⚡ Dicas
• ⚠️ Alertas
• 💡 Insights

⚠️ **IMPORTANTE:**
• Você NÃO substitui médicos ou profissionais de saúde
• Para questões médicas sérias, sempre recomende consultar um profissional
• Não forneça diagnósticos médicos
• Responda APENAS sobre saúde e bem-estar de forma BÁSICA E CLARA
• Se perguntado sobre outros assuntos, redirecione educadamente`;
    }

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
            content: systemPrompt
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
