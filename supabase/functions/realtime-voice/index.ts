import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, upgrade",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  console.log("WebSocket upgrade request received");

  const { socket, response } = Deno.upgradeWebSocket(req);
  
  let openAISocket: WebSocket | null = null;
  let sessionConfigured = false;

  socket.onopen = () => {
    console.log("Client WebSocket connected");
    
    // Connect to OpenAI Realtime API
    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIKey) {
      console.error("OPENAI_API_KEY not configured");
      socket.close(1011, "Server configuration error");
      return;
    }

    const model = "gpt-4o-realtime-preview-2024-12-17";
    const url = `wss://api.openai.com/v1/realtime?model=${model}`;
    
    console.log("Connecting to OpenAI Realtime API:", url);
    
    openAISocket = new WebSocket(url, {
      headers: {
        "Authorization": `Bearer ${openAIKey}`,
        "OpenAI-Beta": "realtime=v1"
      }
    });

    openAISocket.onopen = () => {
      console.log("Connected to OpenAI Realtime API");
    };

    openAISocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("OpenAI message type:", data.type);

        // Configure session after receiving session.created
        if (data.type === 'session.created' && !sessionConfigured) {
          console.log("Session created, configuring...");
          
          const sessionConfig = {
            type: 'session.update',
            session: {
              modalities: ['text', 'audio'],
              instructions: `Você é o Assistente ConnectAI, um assistente de saúde e bem-estar amigável e profissional que fala português brasileiro.

Suas responsabilidades:
- Fornecer informações gerais sobre saúde, nutrição, exercícios e bem-estar
- Oferecer dicas práticas e baseadas em evidências
- Incentivar hábitos saudáveis
- Ser empático, acolhedor e conversacional

Importante:
- NUNCA forneça diagnósticos médicos
- NUNCA prescreva medicamentos
- SEMPRE recomende consultar um profissional de saúde para questões médicas específicas
- Seja natural e conversacional no modo de voz
- Use uma linguagem simples e acessível`,
              voice: 'alloy',
              input_audio_format: 'pcm16',
              output_audio_format: 'pcm16',
              input_audio_transcription: {
                model: 'whisper-1'
              },
              turn_detection: {
                type: 'server_vad',
                threshold: 0.5,
                prefix_padding_ms: 300,
                silence_duration_ms: 1000
              },
              temperature: 0.8,
              max_response_output_tokens: 4096
            }
          };

          openAISocket!.send(JSON.stringify(sessionConfig));
          sessionConfigured = true;
          console.log("Session configuration sent");
        }

        // Forward all messages to client
        socket.send(event.data);
      } catch (error) {
        console.error("Error processing OpenAI message:", error);
      }
    };

    openAISocket.onerror = (error) => {
      console.error("OpenAI WebSocket error:", error);
      socket.close(1011, "OpenAI connection error");
    };

    openAISocket.onclose = (event) => {
      console.log("OpenAI WebSocket closed:", event.code, event.reason);
      socket.close(1000, "OpenAI connection closed");
    };
  };

  socket.onmessage = (event) => {
    try {
      if (openAISocket && openAISocket.readyState === WebSocket.OPEN) {
        // Forward client messages to OpenAI
        openAISocket.send(event.data);
        
        const data = JSON.parse(event.data);
        console.log("Client message type:", data.type);
      }
    } catch (error) {
      console.error("Error forwarding client message:", error);
    }
  };

  socket.onerror = (error) => {
    console.error("Client WebSocket error:", error);
  };

  socket.onclose = () => {
    console.log("Client WebSocket closed");
    if (openAISocket) {
      openAISocket.close();
    }
  };

  return response;
});
