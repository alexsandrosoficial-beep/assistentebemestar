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

// Função para detectar tipo de tarefa e selecionar modelo
function selectModel(userMessage: string): { model: string; taskType: string } {
  const message = userMessage.toLowerCase();
  
  // Palavras-chave para GPT-5 (tarefas criativas e complexas)
  const gpt5Keywords = [
    'escrever', 'redação', 'artigo', 'post', 'criativo', 'história',
    'script', 'roteiro', 'carta', 'email formal', 'relatório',
    'analisar profundamente', 'raciocínio', 'argumento', 'filosofia',
    'marketing', 'vendas', 'comercial', 'pitch', 'proposta',
    'plano detalhado', 'estratégia', 'análise complexa'
  ];
  
  // Detectar se precisa do GPT-5
  const needsGPT5 = gpt5Keywords.some(keyword => message.includes(keyword)) ||
                     message.length > 500; // Mensagens longas = resposta longa esperada
  
  if (needsGPT5) {
    return { model: 'openai/gpt-5', taskType: 'creative_long_form' };
  }
  
  // Caso padrão: Gemini Pro (rápido, eficiente, multimodal)
  return { model: 'google/gemini-2.5-pro', taskType: 'quick_response' };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const startTime = Date.now();

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
      console.error("Assinatura inválida ou expirada");
      return new Response(JSON.stringify({ error: "Assinatura inválida ou expirada" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Assinatura verificada:", subscription.plan_type);

    // Rate limiting: verificar limites baseados no plano
    const RATE_LIMITS: Record<string, number> = {
      free: 10,     // Free: 10 mensagens por 10 minutos
      vip: 50,      // VIP: 50 mensagens por 10 minutos
      premium: 100  // Premium: 100 mensagens por 10 minutos
    };
    
    const maxRequests = RATE_LIMITS[subscription.plan_type] || 10;
    const windowMinutes = 10;
    const windowStart = new Date();
    windowStart.setMinutes(windowStart.getMinutes() - windowMinutes);

    // Verificar rate limit do usuário
    const { data: rateLimitData, error: rateLimitError } = await supabaseAdmin
      .from('chat_rate_limits')
      .select('*')
      .eq('user_id', user.id)
      .gte('window_start', windowStart.toISOString())
      .maybeSingle();

    if (rateLimitError && rateLimitError.code !== 'PGRST116') {
      console.error("Erro ao verificar rate limit:", rateLimitError);
    }

    if (rateLimitData) {
      // Verificar se excedeu o limite
      if (rateLimitData.request_count >= maxRequests) {
        console.warn(`Rate limit excedido para usuário ${user.id}`);
        return new Response(
          JSON.stringify({ 
            error: `Limite de ${maxRequests} mensagens em ${windowMinutes} minutos atingido. Por favor, aguarde alguns minutos.`,
            code: 'RATE_LIMIT_EXCEEDED'
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Incrementar contador
      await supabaseAdmin
        .from('chat_rate_limits')
        .update({ 
          request_count: rateLimitData.request_count + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', rateLimitData.id);
    } else {
      // Criar novo registro de rate limit
      await supabaseAdmin
        .from('chat_rate_limits')
        .insert({
          user_id: user.id,
          window_start: new Date().toISOString(),
          request_count: 1
        });
    }

    // Obter corpo da requisição
    const body = await req.json();
    const { messages } = body;

    // Validar corpo da requisição
    const validationResult = messageSchema.safeParse({ messages });
    if (!validationResult.success) {
      console.error('Validation error:', validationResult.error);
      return new Response(
        JSON.stringify({ error: 'Invalid request format', details: validationResult.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Selecionar modelo baseado no tipo de tarefa
    const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop()?.content || '';
    const { model: selectedModel, taskType } = selectModel(lastUserMessage);
    
    // Definir modelos permitidos por plano
    const ALLOWED_MODELS: Record<string, string[]> = {
      free: ['openai/gpt-5', 'google/gemini-2.5-pro', 'google/gemini-2.5-flash'], // Teste completo
      vip: ['google/gemini-2.5-flash'], // Apenas Gemini Flash
      premium: ['openai/gpt-5', 'google/gemini-2.5-pro', 'google/gemini-2.5-flash'] // Todos
    };
    
    const allowedModels = ALLOWED_MODELS[subscription.plan_type] || ['google/gemini-2.5-flash'];
    let modelToUse = selectedModel;
    
    // Verificar se o modelo selecionado está disponível no plano
    if (!allowedModels.includes(selectedModel)) {
      console.log(`Modelo ${selectedModel} não disponível para plano ${subscription.plan_type}`);
      
      // Para plano VIP que tentou usar modelos premium
      if (subscription.plan_type === 'vip' && (selectedModel === 'openai/gpt-5' || selectedModel === 'google/gemini-2.5-pro')) {
        return new Response(JSON.stringify({ 
          error: "Esta consulta requer modelos de IA avançados (GPT-5 ou Gemini Pro) disponíveis apenas no plano Premium. Faça upgrade para desbloquear.",
          code: 'UPGRADE_REQUIRED'
        }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      // Fallback para modelo disponível
      modelToUse = allowedModels[0];
    }
    
    console.log('Selected model:', modelToUse, 'for task type:', taskType, 'user plan:', subscription.plan_type);

    // Configurar prompt do sistema baseado no plano e modelo
    let systemPrompt = `Você é o Assistente ConnectAI, um assistente de saúde e bem-estar amigável e profissional.
    
Suas responsabilidades:
- Fornecer informações gerais sobre saúde, nutrição, exercícios e bem-estar
- Oferecer dicas práticas e baseadas em evidências
- Incentivar hábitos saudáveis
- Ser empático e acolhedor

Importante:
- NUNCA forneça diagnósticos médicos
- NUNCA prescreva medicamentos
- SEMPRE recomende consultar um profissional de saúde para questões médicas específicas
- Mantenha suas respostas claras, concisas e úteis`;

    if (subscription.plan_type === 'premium') {
      systemPrompt += `

✨ Como usuário Premium com acesso ao ConnectAI completo, você tem:
- Acesso aos modelos mais avançados (Gemini Pro e GPT-5)
- Análises mais detalhadas e personalizadas
- Recomendações avançadas baseadas em suas necessidades específicas
- Sugestões de metas e acompanhamento progressivo
- Insights mais profundos sobre saúde e bem-estar
- Respostas mais elaboradas e criativas quando necessário`;
    } else if (subscription.plan_type === 'vip') {
      systemPrompt += `

⭐ Como usuário VIP, você tem:
- Acesso completo ao Gemini Pro para respostas rápidas e precisas
- Recomendações personalizadas
- Suporte prioritário`;
    }
    
    // Ajustar prompt baseado no modelo
    if (modelToUse === 'openai/gpt-5') {
      systemPrompt += `\n\n🤖 Você está usando o modelo GPT-5, otimizado para:
- Respostas criativas e detalhadas
- Análises profundas e raciocínio complexo
- Geração de textos longos e bem estruturados
- Tarefas que requerem criatividade e nuance`;
    } else {
      systemPrompt += `\n\n⚡ Você está usando o Gemini Pro, otimizado para:
- Respostas rápidas e objetivas
- Análise multimodal eficiente
- Informações precisas e concisas`;
    }

    // Obter chave da API do Lovable AI
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      console.error('LOVABLE_API_KEY não configurada');
      return new Response(
        JSON.stringify({ error: 'Serviço temporariamente indisponível' }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let primarySuccess = false;
    let aiResponse: Response | null = null;
    let usedModel = modelToUse;

    // Tentar com o modelo primário
    try {
      console.log('Calling AI API with model:', modelToUse);
      
      aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelToUse,
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages
          ],
          stream: true,
        }),
      });

      if (!aiResponse.ok) {
        throw new Error(`Primary model failed: ${aiResponse.status}`);
      }
      primarySuccess = true;
    } catch (primaryError) {
      console.error('Primary model failed:', primaryError);
      
      // Fallback para outro modelo
      const fallbackModel = modelToUse === 'openai/gpt-5' 
        ? 'google/gemini-2.5-pro' 
        : 'google/gemini-2.5-flash';
      console.log('Attempting fallback to:', fallbackModel);
      
      try {
        aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${lovableApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: fallbackModel,
            messages: [
              { role: 'system', content: systemPrompt },
              ...messages
            ],
            stream: true,
          }),
        });
        
        if (!aiResponse.ok) {
          throw new Error(`Fallback model also failed: ${aiResponse.status}`);
        }
        usedModel = fallbackModel;
        console.log('Fallback successful, using:', fallbackModel);
      } catch (fallbackError) {
        console.error('Fallback model also failed:', fallbackError);
        
        // Registrar log de falha
        const responseTime = Date.now() - startTime;
        await supabaseAdmin.from('ai_usage_logs').insert({
          user_id: user.id,
          model_used: usedModel,
          response_time_ms: responseTime,
          task_type: taskType,
          success: false,
          error_message: String(primaryError).substring(0, 500)
        });
        
        throw primaryError; // Lançar erro original
      }
    }

    if (!aiResponse || !aiResponse.ok) {
      const errorText = aiResponse ? await aiResponse.text() : 'No response';
      console.error('AI API error:', aiResponse?.status, errorText);
      
      // Registrar log de falha
      const responseTime = Date.now() - startTime;
      await supabaseAdmin.from('ai_usage_logs').insert({
        user_id: user.id,
        model_used: usedModel,
        response_time_ms: responseTime,
        task_type: taskType,
        success: false,
        error_message: errorText.substring(0, 500)
      });
      
      // Tratar erros específicos de rate limiting
      if (aiResponse?.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: 'Limite de requisições excedido. Por favor, tente novamente em alguns momentos.',
            code: 'AI_RATE_LIMIT_EXCEEDED'
          }),
          { 
            status: 429, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }

      // Tratar erro de créditos insuficientes
      if (aiResponse?.status === 402) {
        return new Response(
          JSON.stringify({ 
            error: 'Créditos insuficientes. Por favor, adicione mais créditos para continuar.',
            code: 'INSUFFICIENT_CREDITS'
          }),
          { 
            status: 402, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }

      return new Response(
        JSON.stringify({ 
          error: 'Serviço de IA temporariamente indisponível',
          details: errorText 
        }),
        { 
          status: aiResponse?.status || 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Registrar log de sucesso
    const responseTime = Date.now() - startTime;
    await supabaseAdmin.from('ai_usage_logs').insert({
      user_id: user.id,
      model_used: usedModel,
      response_time_ms: responseTime,
      task_type: taskType,
      success: true
    });

    console.log(`Request completed: model=${usedModel}, time=${responseTime}ms, fallback=${!primarySuccess}`);

    // Retornar stream de resposta
    return new Response(aiResponse.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error("Erro na função de chat:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
