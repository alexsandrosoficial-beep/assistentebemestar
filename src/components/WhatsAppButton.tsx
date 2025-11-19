import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";

interface WhatsAppButtonProps {
  message?: string;
  className?: string;
  variant?: "default" | "outline" | "gradient";
  size?: "default" | "sm" | "lg";
  autoFillUserData?: boolean;
}

const WhatsAppButton = ({ 
  message = "Olá! Estou precisando de suporte no seu site. Pode me ajudar?",
  className = "",
  variant = "gradient",
  size = "default",
  autoFillUserData = false
}: WhatsAppButtonProps) => {
  const phoneNumber = "5535997168761"; // +55 35 99716-8761
  const { user } = useAuth();
  const { subscription } = useSubscription();
  
  const handleWhatsAppClick = () => {
    let finalMessage = message;
    
    // Auto-fill user data if requested
    if (autoFillUserData && user) {
      const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'Não informado';
      const userEmail = user.email || 'Não informado';
      const planType = subscription?.plan_type 
        ? (subscription.plan_type === 'free' ? 'Gratuito (7 dias)' : 
           subscription.plan_type === 'vip' ? 'VIP' : 'Premium')
        : 'Não informado';
      
      finalMessage = `Olá, preciso de suporte referente ao meu plano no site.
Nome: ${userName}
Email: ${userEmail}
Plano: ${planType}`;
    }
    
    const encodedMessage = encodeURIComponent(finalMessage);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Button
      onClick={handleWhatsAppClick}
      variant={variant}
      size={size}
      className={className}
    >
      <MessageCircle className="mr-2 h-5 w-5" />
      Suporte via WhatsApp
    </Button>
  );
};

export default WhatsAppButton;
