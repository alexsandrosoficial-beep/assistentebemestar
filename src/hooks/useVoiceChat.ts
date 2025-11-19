import { useState, useRef, useCallback, useEffect } from 'react';
import { AudioRecorder, AudioQueue, encodeAudioForAPI } from '@/utils/audioUtils';
import { supabase } from '@/integrations/supabase/client';

interface VoiceChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const useVoiceChat = (userId?: string) => {
  const [messages, setMessages] = useState<VoiceChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preferredVoice, setPreferredVoice] = useState<string>('alloy');

  const wsRef = useRef<WebSocket | null>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<AudioQueue | null>(null);
  const currentTranscriptRef = useRef<string>('');
  const currentResponseRef = useRef<string>('');

  // Load preferred voice from user profile
  useEffect(() => {
    const loadPreferredVoice = async () => {
      if (!userId) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('preferred_voice')
          .eq('id', userId)
          .single();

        if (error) {
          console.error('Error loading preferred voice:', error);
          return;
        }

        if (data?.preferred_voice) {
          setPreferredVoice(data.preferred_voice);
          console.log('Loaded preferred voice:', data.preferred_voice);
        }
      } catch (err) {
        console.error('Failed to load preferred voice:', err);
      }
    };

    loadPreferredVoice();
  }, [userId]);

  // Initialize audio context
  useEffect(() => {
    audioContextRef.current = new AudioContext({ sampleRate: 24000 });
    audioQueueRef.current = new AudioQueue(audioContextRef.current);

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const connect = useCallback(async () => {
    try {
      setError(null);
      console.log('Connecting to voice chat...');

      // Request microphone access first
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Connect to WebSocket relay with preferred voice
      const wsUrl = `wss://eutknxcaiepkkbrbpina.supabase.co/functions/v1/realtime-voice?voice=${preferredVoice}`;
      console.log('Connecting to:', wsUrl, 'with voice:', preferredVoice);
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setIsRecording(true);

        // Start recording audio
        const recorder = new AudioRecorder((audioData) => {
          if (ws.readyState === WebSocket.OPEN) {
            const base64Audio = encodeAudioForAPI(audioData);
            ws.send(JSON.stringify({
              type: 'input_audio_buffer.append',
              audio: base64Audio
            }));
          }
        });

        recorder.start().then(() => {
          recorderRef.current = recorder;
          console.log('Audio recording started');
        }).catch((err) => {
          console.error('Failed to start recording:', err);
          setError('Não foi possível acessar o microfone');
        });
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received message type:', data.type);

          switch (data.type) {
            case 'session.created':
              console.log('Session created');
              break;

            case 'session.updated':
              console.log('Session updated');
              break;

            case 'input_audio_buffer.speech_started':
              console.log('User started speaking');
              currentTranscriptRef.current = '';
              break;

            case 'input_audio_buffer.speech_stopped':
              console.log('User stopped speaking');
              break;

            case 'conversation.item.input_audio_transcription.completed':
              const userTranscript = data.transcript;
              console.log('User transcript:', userTranscript);
              currentTranscriptRef.current = userTranscript;
              
              setMessages(prev => [...prev, {
                role: 'user',
                content: userTranscript,
                timestamp: new Date()
              }]);
              break;

            case 'response.created':
              console.log('AI response started');
              setIsSpeaking(true);
              currentResponseRef.current = '';
              break;

            case 'response.audio_transcript.delta':
              // Accumulate transcript
              currentResponseRef.current += data.delta;
              break;

            case 'response.audio_transcript.done':
              console.log('AI transcript done:', currentResponseRef.current);
              
              setMessages(prev => [...prev, {
                role: 'assistant',
                content: currentResponseRef.current,
                timestamp: new Date()
              }]);
              break;

            case 'response.audio.delta':
              // Decode and play audio
              const binaryString = atob(data.delta);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              
              if (audioQueueRef.current) {
                audioQueueRef.current.addToQueue(bytes);
              }
              break;

            case 'response.audio.done':
              console.log('AI audio done');
              break;

            case 'response.done':
              console.log('Response complete');
              setIsSpeaking(false);
              break;

            case 'error':
              console.error('OpenAI error:', data.error);
              setError(data.error.message || 'Erro no serviço de voz');
              break;
          }
        } catch (err) {
          console.error('Error parsing message:', err);
        }
      };

      ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        setError('Erro na conexão de voz');
      };

      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        setIsConnected(false);
        setIsRecording(false);
        setIsSpeaking(false);

        if (recorderRef.current) {
          recorderRef.current.stop();
          recorderRef.current = null;
        }
      };

    } catch (err) {
      console.error('Failed to connect:', err);
      setError('Falha ao conectar com o serviço de voz');
    }
  }, []);

  const disconnect = useCallback(() => {
    console.log('Disconnecting voice chat...');

    if (recorderRef.current) {
      recorderRef.current.stop();
      recorderRef.current = null;
    }

    if (audioQueueRef.current) {
      audioQueueRef.current.clear();
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
    setIsRecording(false);
    setIsSpeaking(false);
  }, []);

  const sendTextMessage = useCallback((text: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log('Sending text message:', text);
      
      const event = {
        type: 'conversation.item.create',
        item: {
          type: 'message',
          role: 'user',
          content: [
            {
              type: 'input_text',
              text
            }
          ]
        }
      };

      wsRef.current.send(JSON.stringify(event));
      wsRef.current.send(JSON.stringify({ type: 'response.create' }));

      setMessages(prev => [...prev, {
        role: 'user',
        content: text,
        timestamp: new Date()
      }]);
    }
  }, []);

  return {
    messages,
    isConnected,
    isRecording,
    isSpeaking,
    error,
    preferredVoice,
    connect,
    disconnect,
    sendTextMessage
  };
};
