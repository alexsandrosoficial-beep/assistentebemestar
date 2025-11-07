-- Tabela para armazenar mensagens do chat
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  topic TEXT, -- Tópico identificado automaticamente
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their own messages"
  ON public.chat_messages
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own messages"
  ON public.chat_messages
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Índices para melhorar performance
CREATE INDEX idx_chat_messages_user_id ON public.chat_messages(user_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at);
CREATE INDEX idx_chat_messages_topic ON public.chat_messages(topic);

-- Função para categorizar tópicos (simplificada baseada em palavras-chave)
CREATE OR REPLACE FUNCTION public.identify_topic(message_content TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  -- Categorização básica por palavras-chave
  IF message_content ~* '(sono|dormir|insônia|descanso)' THEN
    RETURN 'Sono';
  ELSIF message_content ~* '(alimentação|comida|nutrição|dieta|comer)' THEN
    RETURN 'Alimentação';
  ELSIF message_content ~* '(exercício|treino|academia|fitness|atividade física)' THEN
    RETURN 'Exercícios';
  ELSIF message_content ~* '(mental|ansiedade|estresse|depressão|meditação|mindfulness)' THEN
    RETURN 'Saúde Mental';
  ELSIF message_content ~* '(peso|emagrecer|engordar|massa muscular)' THEN
    RETURN 'Controle de Peso';
  ELSIF message_content ~* '(medicamento|remédio|tratamento|sintoma|doença)' THEN
    RETURN 'Saúde Geral';
  ELSE
    RETURN 'Outros';
  END IF;
END;
$$;