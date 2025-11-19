-- Adicionar coluna de preferência de voz na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN preferred_voice text DEFAULT 'alloy' CHECK (
  preferred_voice IN ('alloy', 'echo', 'shimmer', 'ash', 'ballad', 'coral', 'sage', 'verse')
);

-- Criar índice para melhorar performance de consultas
CREATE INDEX idx_profiles_preferred_voice ON public.profiles(preferred_voice);

-- Comentário explicativo
COMMENT ON COLUMN public.profiles.preferred_voice IS 'Voz preferida do usuário para o assistente de voz (OpenAI Realtime API)';