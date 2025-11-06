import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MessageCircle } from "lucide-react";

const Contato = () => {

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <section className="py-20 bg-gradient-to-b from-background via-secondary/30 to-background">
          <div className="container">
            <div className="max-w-2xl mx-auto text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Entre em Contato
              </h1>
              <p className="text-xl text-muted-foreground">
                Estamos aqui para ajudar. Entre em contato conosco e responderemos o mais breve possível.
              </p>
            </div>

            <div className="max-w-2xl mx-auto grid md:grid-cols-2 gap-6">
              <Card className="border-2 hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4">
                    <Mail className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-2xl">Email</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <a 
                    href="mailto:suporte.empresarialvip@gmail.com"
                    className="text-lg text-primary hover:underline break-all"
                  >
                    suporte.empresarialvip@gmail.com
                  </a>
                  <p className="text-sm text-muted-foreground mt-2">
                    Respondemos em até 24 horas
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl">Suporte</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <a 
                    href="https://wa.me/5535997168761" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-lg text-primary hover:underline inline-block"
                  >
                    (35) 99716-8761
                  </a>
                  <p className="text-sm text-muted-foreground mt-2">
                    Atendimento via WhatsApp
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contato;
