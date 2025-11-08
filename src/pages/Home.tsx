import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { 
  Heart, 
  Brain, 
  Activity, 
  Calendar, 
  MessageSquare, 
  Shield,
  CheckCircle2,
  ArrowRight
} from "lucide-react";

const Home = () => {
  const features = [
    {
      icon: MessageSquare,
      title: "Chat Inteligente",
      description: "Converse naturalmente com nosso assistente de IA treinado em saúde e bem-estar"
    },
    {
      icon: Calendar,
      title: "Rotinas Personalizadas",
      description: "Organize suas metas e receba lembretes personalizados para seu dia"
    },
    {
      icon: Brain,
      title: "Dicas Especializadas",
      description: "Receba orientações baseadas em conhecimento científico atualizado"
    },
    {
      icon: Activity,
      title: "Acompanhamento",
      description: "Monitore seu progresso e evolução ao longo do tempo"
    },
    {
      icon: Shield,
      title: "Seguro e Privado",
      description: "Seus dados são protegidos com criptografia de ponta"
    },
    {
      icon: Heart,
      title: "Suporte ao Cliente",
      description: "Disponível sempre que você precisar, a qualquer hora"
    }
  ];

  const benefits = [
    "Respostas instantâneas para suas dúvidas",
    "Personalização baseada no seu perfil",
    "Sem necessidade de agendamento",
    "Informações baseadas em evidências"
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-b from-background via-secondary/30 to-background">
        <div className="container relative z-10">
          <div className="mx-auto max-w-3xl text-center animate-fade-in-up">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 mb-6">
              <Heart className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Seu bem-estar em primeiro lugar</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Seu Assistente Pessoal de Saúde e Bem-Estar
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8">
              Inteligência artificial avançada para ajudar você a viver de forma mais saudável. 
              Receba orientações, organize rotinas e tire dúvidas a qualquer momento.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" variant="gradient" className="text-lg px-8">
                  Começar Agora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/planos">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Ver Planos
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Recursos Pensados Para Você
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tudo que você precisa para cuidar da sua saúde em um só lugar
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Por Que Escolher Nosso Assistente?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Desenvolvido com inteligência artificial de ponta e conhecimento especializado 
                para proporcionar a melhor experiência em saúde e bem-estar.
              </p>
              
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-lg">{benefit}</span>
                  </li>
                ))}
              </ul>
              
              <Link to="/auth" className="inline-block mt-8">
                <Button size="lg" variant="gradient">
                  Experimentar Gratuitamente
                </Button>
              </Link>
            </div>
            
            <div className="relative">
              <Card className="p-8 border-2">
                <CardContent className="space-y-6 p-0">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <MessageSquare className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Você</p>
                      <p className="text-sm text-muted-foreground">
                        Como posso melhorar minha rotina de sono?
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 flex-row-reverse">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                      <Heart className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div className="text-right">
                      <p className="font-medium">Assistente</p>
                      <p className="text-sm text-muted-foreground">
                        Vou criar uma rotina personalizada para você com base em suas necessidades...
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-accent">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Pronto Para Começar Sua Jornada?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de pessoas que já estão cuidando melhor da saúde
          </p>
          <Link to="/auth">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Criar Conta Grátis
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
