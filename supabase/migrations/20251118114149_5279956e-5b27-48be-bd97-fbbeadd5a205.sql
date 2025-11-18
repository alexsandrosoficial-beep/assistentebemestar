-- Corrigir função identify_topic para ter search_path seguro
DROP FUNCTION IF EXISTS public.identify_topic(text);

CREATE OR REPLACE FUNCTION public.identify_topic(message_content text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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