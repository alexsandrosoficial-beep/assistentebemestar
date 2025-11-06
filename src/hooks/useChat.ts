import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (userMessage: string) => {
    if (!userMessage.trim()) return;

    const newUserMessage: Message = { role: 'user', content: userMessage };
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    let assistantMessage = '';

    try {
      // Obter token de autenticação
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Não autenticado",
          description: "Faça login para usar o chat.",
          variant: "destructive",
        });
        setMessages(prev => prev.slice(0, -1));
        setIsLoading(false);
        return;
      }

      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
      
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ 
          messages: [...messages, newUserMessage] 
        }),
      });

      if (!response.ok) {
        try {
          const err = await response.json();
          const msg = err?.error || 'Falha ao enviar mensagem';
          toast({ title: 'Erro', description: msg, variant: 'destructive' });
        } catch {
          if (response.status === 429) {
            toast({
              title: "Limite atingido",
              description: "Muitas requisições. Aguarde um momento e tente novamente.",
              variant: "destructive",
            });
          } else if (response.status === 402) {
            toast({
              title: "Créditos insuficientes",
              description: "Por favor, recarregue seus créditos para continuar.",
              variant: "destructive",
            });
          } else {
            toast({ title: 'Erro', description: 'Falha ao enviar mensagem', variant: 'destructive' });
          }
        }
        return;
      }

      if (!response.body) throw new Error('Resposta sem conteúdo');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      const processChunk = () => {
        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') return true;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantMessage += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant') {
                  return prev.map((m, i) => 
                    i === prev.length - 1 ? { ...m, content: assistantMessage } : m
                  );
                }
                return [...prev, { role: 'assistant', content: assistantMessage }];
              });
            }
          } catch {
            buffer = line + '\n' + buffer;
            return false;
          }
        }
        return false;
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        if (processChunk()) break;
      }

      // Processar buffer final
      if (buffer.trim()) {
        processChunk();
      }

    } catch (error) {
      console.error('Erro no chat:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem. Tente novamente.",
        variant: "destructive",
      });
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  const clearChat = useCallback(() => {
    setMessages([]);
  }, []);

  return { messages, isLoading, sendMessage, clearChat };
};
