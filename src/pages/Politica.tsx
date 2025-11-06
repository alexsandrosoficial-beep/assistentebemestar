import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Politica = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-20">
        <div className="container max-w-4xl">
          <h1 className="text-4xl font-bold mb-8">Política de Privacidade</h1>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>1. Informações que Coletamos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Coletamos informações que você nos fornece diretamente, como nome, email, 
                e dados de saúde quando você utiliza nosso assistente.
              </p>
              <p>
                Também coletamos informações automaticamente sobre seu uso do serviço, 
                incluindo dados de navegação e interações com o assistente.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>2. Como Usamos Suas Informações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Utilizamos suas informações para:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Fornecer e melhorar nossos serviços</li>
                <li>Personalizar sua experiência</li>
                <li>Enviar comunicações importantes</li>
                <li>Garantir a segurança da plataforma</li>
                <li>Cumprir obrigações legais</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>3. Compartilhamento de Dados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Não vendemos suas informações pessoais. Podemos compartilhar seus dados apenas:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Com seu consentimento explícito</li>
                <li>Para cumprir obrigações legais</li>
                <li>Com prestadores de serviços que nos auxiliam</li>
                <li>Em caso de fusão ou aquisição da empresa</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>4. Segurança dos Dados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Implementamos medidas de segurança técnicas e organizacionais para proteger 
                suas informações, incluindo criptografia, controles de acesso e 
                monitoramento contínuo.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>5. Seus Direitos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                De acordo com a LGPD, você tem direito a:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Acessar seus dados pessoais</li>
                <li>Corrigir dados incompletos ou incorretos</li>
                <li>Solicitar a exclusão de dados</li>
                <li>Revogar consentimento</li>
                <li>Portabilidade de dados</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>6. Cookies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Utilizamos cookies e tecnologias similares para melhorar sua experiência, 
                analisar o uso do serviço e personalizar conteúdo.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>7. Alterações na Política</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Podemos atualizar esta política periodicamente. Notificaremos você sobre 
                mudanças significativas por email ou através da plataforma.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Contato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Para questões sobre privacidade, entre em contato:
              </p>
              <p>
                Email: suporte.empresarialvip@gmail.com<br />
                WhatsApp: +55 (35) 99716-8761
              </p>
            </CardContent>
          </Card>

          <p className="text-sm text-muted-foreground mt-8">
            Última atualização: Janeiro de 2025
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Politica;
