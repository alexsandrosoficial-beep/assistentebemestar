import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

interface WhatsAppButtonProps {
  message?: string;
  className?: string;
  variant?: "default" | "outline" | "gradient";
  size?: "default" | "sm" | "lg";
}

const WhatsAppButton = ({ 
  message = "Olá! Estou precisando de suporte no seu site. Pode me ajudar?",
  className = "",
  variant = "gradient",
  size = "default"
}: WhatsAppButtonProps) => {
  const phoneNumber = "5535997168761"; // +55 35 99716-8761
  
  const handleWhatsAppClick = () => {
    const encodedMessage = encodeURIComponent(message);
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
