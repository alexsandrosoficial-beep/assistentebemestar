import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Check } from "lucide-react";

interface PlanBenefitsProps {
  planType: 'free' | 'vip' | 'premium';
}

export const PlanBenefits = ({ planType }: PlanBenefitsProps) => {
  const benefits = {
    free: {
      title: "Plano Gratuito - 7 dias",
      description: "Teste todas as funcionalidades por 7 dias",
      features: [
        "Acesso completo por 7 dias",
        "Chat com IA Gemini Flash",
        "Chat com GPT-5",
        "Chat de voz incluído",
        "Central de metas básica",
        "Sem compromisso"
      ],
      color: "border-secondary"
    },
    vip: {
      title: "Plano VIP",
      description: "Recursos essenciais para seu dia a dia",
      features: [
        "Chat de texto com IA Gemini Flash",
        "Perguntas ilimitadas",
        "Recomendações personalizadas",
        "Central de metas e objetivos",
        "Análises de progresso",
        "Suporte padrão"
      ],
      color: "border-primary"
    },
    premium: {
      title: "Plano Premium",
      description: "O melhor da tecnologia de IA para você",
      features: [
        "Chat com GPT-5 (modelo mais avançado)",
        "Chat com Gemini Pro (Google)",
        "Chat de voz em tempo real",
        "Escolha de vozes personalizadas",
        "Central de metas com IA avançada",
        "Respostas e análises aprofundadas",
        "Recomendações ultra-personalizadas",
        "Suporte Premium prioritário"
      ],
      color: "border-accent"
    }
  };

  const config = benefits[planType];

  return (
    <Card className={`${config.color} border-2`}>
      <CardHeader>
        <CardTitle className="text-2xl">{config.title}</CardTitle>
        <p className="text-muted-foreground">{config.description}</p>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {config.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};
