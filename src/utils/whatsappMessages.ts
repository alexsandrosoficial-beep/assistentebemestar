/**
 * Sistema de mensagens dinâmicas para WhatsApp
 * Personaliza a mensagem baseada no contexto do usuário
 */

export type WhatsAppContext = 
  | "default"
  | "plano-free"
  | "plano-vip" 
  | "plano-premium"
  | "pagamento"
  | "login"
  | "assistente-ia"
  | "chat-voz"
  | "configuracoes"
  | "metas"
  | "perfil";

export const whatsappMessages: Record<WhatsAppContext, string> = {
  "default": "Olá! Estou precisando de suporte no seu site. Pode me ajudar?",
  "plano-free": "Olá! Preciso de suporte sobre o plano Gratuito.",
  "plano-vip": "Olá! Preciso de suporte sobre o plano VIP.",
  "plano-premium": "Olá! Preciso de suporte sobre o plano Premium.",
  "pagamento": "Olá! Tenho dúvidas sobre pagamento.",
  "login": "Olá! Não estou conseguindo fazer login.",
  "assistente-ia": "Olá! Tenho dúvidas sobre o assistente de IA.",
  "chat-voz": "Olá! Tenho dúvidas sobre o chat de voz.",
  "configuracoes": "Olá! Preciso de ajuda com as configurações.",
  "metas": "Olá! Tenho dúvidas sobre a central de metas.",
  "perfil": "Olá! Preciso de ajuda com meu perfil."
};

/**
 * Obtém a mensagem apropriada baseada no contexto
 */
export const getWhatsAppMessage = (context: WhatsAppContext = "default"): string => {
  return whatsappMessages[context] || whatsappMessages.default;
};

/**
 * Cria uma mensagem personalizada
 */
export const createCustomMessage = (message: string): string => {
  return message;
};
