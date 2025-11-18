import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Schema de validação para as respostas do questionário
const answersSchema = z.object({
  objective: z.string().max(500, "Objetivo muito longo"),
  currentActivity: z.string().max(500, "Resposta muito longa"),
  sleepHours: z.string().max(100, "Resposta muito longa"),
  waterIntake: z.string().max(100, "Resposta muito longa"),
  dietQuality: z.string().max(500, "Resposta muito longa"),
  stressLevel: z.string().max(200, "Resposta muito longa"),
  healthConcerns: z.string().max(1000, "Resposta muito longa"),
  availableTime: z.string().max(200, "Resposta muito longa"),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_PUBLISHABLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verificar se o usuário é Premium
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .eq('plan_type', 'premium')
      .maybeSingle();

    if (subError || !subscription) {
      return new Response(JSON.stringify({ error: 'Premium subscription required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Rate limiting para geração de metas (operação mais cara)
    const maxRecommendations = 5; // 5 gerações de recomendações por hora
    const windowMinutes = 60;
    const windowStart = new Date();
    windowStart.setMinutes(windowStart.getMinutes() - windowMinutes);

    // Verificar rate limit do usuário
    const { data: rateLimitData, error: rateLimitError } = await supabase
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
      if (rateLimitData.request_count >= maxRecommendations) {
        console.warn(`Rate limit excedido para usuário ${user.id}`);
        return new Response(JSON.stringify({ 
          error: "Limite de gerações de metas atingido. Tente novamente em uma hora.",
          retryAfter: windowMinutes * 60
        }), {
          status: 429,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Retry-After': String(windowMinutes * 60)
          },
        });
      }

      // Incrementar contador
      await supabase
        .from('chat_rate_limits')
        .update({ 
          request_count: rateLimitData.request_count + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', rateLimitData.id);
    } else {
      // Criar novo registro de rate limit
      await supabase
        .from('chat_rate_limits')
        .insert({
          user_id: user.id,
          request_count: 1,
          window_start: new Date().toISOString()
        });
    }

    const requestBody = await req.json();
    
    // Validar os dados do questionário
    const validation = answersSchema.safeParse(requestBody.answers);
    if (!validation.success) {
      console.error('Validation error:', validation.error);
      return new Response(JSON.stringify({ 
        error: 'Invalid questionnaire data', 
        details: validation.error.issues[0].message 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const answers = validation.data;
    console.log('Generating goal recommendations for user:', user.id);

    const systemPrompt = `Você é um assistente de saúde e bem-estar especializado em criar planos personalizados de metas.
Baseado nas respostas do usuário sobre sua saúde e rotina, você deve sugerir 3-5 metas SMART (específicas, mensuráveis, alcançáveis, relevantes e com prazo).

Para cada meta, forneça:
- title: título claro e motivador
- description: descrição detalhada da meta e benefícios
- category: uma das seguintes: peso, exercicio, alimentacao, sono, hidratacao, outros
- target_value: valor numérico alvo
- unit: unidade de medida (kg, minutos, copos, horas, vezes, etc)
- duration_days: duração recomendada em dias para atingir a meta
- reminder_frequency: daily, weekly ou monthly

Responda APENAS com um JSON array válido, sem texto adicional.`;

    const userPrompt = `Respostas do questionário de saúde e rotina:
${Object.entries(answers).map(([key, value]) => `${key}: ${value}`).join('\n')}

Gere recomendações de metas personalizadas baseadas nessas respostas.`;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('Failed to generate recommendations');
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    console.log('AI Response:', aiResponse);

    // Parse JSON response
    let recommendations;
    try {
      // Remove markdown code blocks if present
      const cleanedResponse = aiResponse.replace(/```json\n?|\n?```/g, '').trim();
      recommendations = JSON.parse(cleanedResponse);
    } catch (e) {
      console.error('Failed to parse AI response:', aiResponse);
      throw new Error('Invalid AI response format');
    }

    return new Response(JSON.stringify({ recommendations }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-goal-recommendations:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
