-- Criar tabela para rate limiting
CREATE TABLE IF NOT EXISTS public.chat_rate_limits (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  request_count integer NOT NULL DEFAULT 1,
  window_start timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.chat_rate_limits ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam apenas seus próprios limites
CREATE POLICY "Users can view their own rate limits"
ON public.chat_rate_limits
FOR SELECT
USING (auth.uid() = user_id);

-- Política para permitir que usuários insiram seus próprios limites
CREATE POLICY "Users can insert their own rate limits"
ON public.chat_rate_limits
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Política para permitir que usuários atualizem seus próprios limites
CREATE POLICY "Users can update their own rate limits"
ON public.chat_rate_limits
FOR UPDATE
USING (auth.uid() = user_id);

-- Índice para buscar rapidamente por user_id
CREATE INDEX IF NOT EXISTS idx_chat_rate_limits_user_id ON public.chat_rate_limits(user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_chat_rate_limits_updated_at
BEFORE UPDATE ON public.chat_rate_limits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();