import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const Planos = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [showPixDialog, setShowPixDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'premium' | 'family' | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleSelectPlan = async (planType: 'free' | 'premium' | 'family') => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // For paid plans, show Pix payment dialog
    if (planType === 'premium' || planType === 'family') {
      setSelectedPlan(planType);
      setShowPixDialog(true);
      return;
    }

    // For free plan, activate immediately
    try {
      const { data: existingSubscription } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (existingSubscription) {
        const { error } = await supabase
          .from('user_subscriptions')
          .update({
            plan_type: planType,
            status: 'active',
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_subscriptions')
          .insert({
            user_id: user.id,
            plan_type: planType,
            status: 'active'
          });

        if (error) throw error;
      }

      toast({
        title: "Plano ativado!",
        description: "Seu plano Gratuito foi ativado com sucesso.",
      });

      navigate('/chat');
    } catch (error: any) {
      toast({
        title: "Erro ao ativar plano",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  const plans = [
    {
      name: "Gratuito",
      price: "R$ 0",
      period: "/7 dias",
      description: "Teste gratuito de 7 dias",
      features: [
        "7 dias de acesso completo",
        "Todas as funcionalidades",
        "Conversas ilimitadas",
        "Sem compromisso"
      ],
      cta: "Começar Teste Grátis",
      highlighted: false
    },
    {
      name: "Premium",
      price: "R$ 29,90",
      period: "/mês",
      description: "Para uso individual completo",
      features: [
        "Conversas ilimitadas",
        "Rotinas personalizadas",
        "Lembretes inteligentes",
        "Histórico completo",
        "Suporte prioritário"
      ],
      cta: "Assinar Premium",
      highlighted: true
    },
    {
      name: "Família",
      price: "R$ 49,90",
      period: "/mês",
      description: "Perfeito para toda a família",
      features: [
        "Tudo do plano Premium",
        "Até 5 pessoas",
        "Dashboard familiar",
        "Rotinas por pessoa",
        "Suporte Premium"
      ],
      cta: "Assinar Família",
      highlighted: false
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Header */}
        <section className="py-20 bg-gradient-to-b from-background via-secondary/30 to-background">
          <div className="container text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Escolha Seu Plano
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comece gratuitamente ou escolha um plano premium para aproveitar todos os recursos
            </p>
          </div>
        </section>

        {/* Plans */}
        <section className="py-16 -mt-10">
          <div className="container">
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {plans.map((plan, index) => (
                <Card 
                  key={index}
                  className={`relative ${
                    plan.highlighted 
                      ? 'border-primary border-2 shadow-lg scale-105' 
                      : 'border-2'
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                        Mais Popular
                      </span>
                    </div>
                  )}
                  
                  <CardHeader>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      variant={plan.highlighted ? "gradient" : "outline"}
                      size="lg"
                      onClick={() => handleSelectPlan(
                        plan.name === 'Gratuito' ? 'free' : 
                        plan.name === 'Premium' ? 'premium' : 'family'
                      )}
                    >
                      {plan.cta}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {/* Trial Info */}
            <div className="mt-16 text-center">
              <Card className="max-w-2xl mx-auto border-2 bg-gradient-to-br from-primary/5 to-accent/5">
                <CardHeader>
                  <CardTitle className="flex items-center justify-center gap-2">
                    ⏰ Período de Teste
                  </CardTitle>
                  <CardDescription className="text-base space-y-2">
                    <p className="text-foreground font-medium">
                      Ao criar sua conta, você ganha 7 dias grátis para testar todas as funcionalidades!
                    </p>
                    <p className="text-sm">
                      Após o período de teste, escolha o plano que melhor se adequa às suas necessidades.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Sem cobrança automática • Sem dados de pagamento necessários
                    </p>
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Preview */}
        <section className="py-20 bg-muted/30">
          <div className="container max-w-4xl">
            <h2 className="text-3xl font-bold text-center mb-12">Perguntas Frequentes</h2>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Posso mudar de plano depois?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. 
                    As mudanças são aplicadas imediatamente.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Como funciona o teste gratuito?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Você tem 7 dias para experimentar todos os recursos premium sem nenhum custo. 
                    Se cancelar antes do fim do período, não será cobrado.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">O assistente substitui médicos?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Não. Nosso assistente é uma ferramenta de apoio ao bem-estar, mas não substitui 
                    consultas médicas ou diagnósticos profissionais.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Pix Payment Dialog */}
      <Dialog open={showPixDialog} onOpenChange={setShowPixDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              💳 Pagamento via PIX
            </DialogTitle>
            <DialogDescription className="space-y-4 pt-4">
              <div className="text-center space-y-3">
                <p className="text-base font-medium text-foreground">
                  Plano selecionado: <span className="text-primary font-bold">
                    {selectedPlan === 'premium' ? 'Premium - R$ 29,90/mês' : 'Família - R$ 49,90/mês'}
                  </span>
                </p>
                
                <div className="bg-gradient-to-br from-primary/5 to-accent/5 p-6 rounded-lg border-2">
                  <p className="text-sm mb-2">Entre em contato para realizar o pagamento:</p>
                  <p className="text-2xl font-bold text-primary mb-1">
                    📱 (35) 99716-8761
                  </p>
                  <p className="text-xs text-muted-foreground">WhatsApp</p>
                </div>

                <div className="space-y-2 text-sm text-left">
                  <p className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>Pagamento rápido e seguro via PIX</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>Ativação imediata após confirmação</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>Acesso completo aos benefícios do plano</span>
                  </p>
                </div>

                <Button 
                  className="w-full mt-4" 
                  onClick={() => {
                    window.open(`https://wa.me/5535997168761?text=Olá! Gostaria de assinar o plano ${selectedPlan === 'premium' ? 'Premium' : 'Família'}.`, '_blank');
                  }}
                >
                  Enviar mensagem no WhatsApp
                </Button>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Planos;
