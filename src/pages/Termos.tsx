import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Termos = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-20">
        <div className="container max-w-4xl">
          <h1 className="text-4xl font-bold mb-8">Termos de Uso</h1>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>1. Aceitação dos Termos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Ao acessar e usar o Assistente, você concorda em cumprir estes Termos de Uso. 
                Se você não concordar com qualquer parte destes termos, não utilize nossos serviços.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>2. Descrição do Serviço</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                O Assistente é uma plataforma de inteligência artificial que fornece informações 
                e orientações sobre saúde e bem-estar. O serviço NÃO substitui consultas médicas, 
                diagnósticos ou tratamentos profissionais.
              </p>
              <p className="font-semibold text-foreground">
                Em caso de emergência médica, procure atendimento profissional imediatamente.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>3. Uso Adequado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>Você concorda em:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Fornecer informações verdadeiras e precisas</li>
                <li>Manter a confidencialidade de sua conta</li>
                <li>Não compartilhar sua conta com terceiros</li>
                <li>Usar o serviço apenas para fins pessoais e legais</li>
                <li>Não tentar acessar sistemas ou dados não autorizados</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>4. Limitações do Serviço</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                O Assistente fornece informações gerais e não deve ser usado como:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Substituto de consulta médica profissional</li>
                <li>Ferramenta de diagnóstico médico</li>
                <li>Recomendação de tratamento específico</li>
                <li>Aconselhamento em situações de emergência</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>5. Planos e Pagamentos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Os planos pagos são cobrados mensalmente. Você pode cancelar sua assinatura 
                a qualquer momento. O cancelamento entrará em vigor no próximo ciclo de cobrança.
              </p>
              <p>
                Oferecemos um período de teste gratuito de 7 dias para novos usuários. 
                Você não será cobrado se cancelar antes do fim do período de teste.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>6. Propriedade Intelectual</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Todo o conteúdo, design, código e funcionalidades do Assistente são de 
                propriedade exclusiva da empresa e protegidos por leis de propriedade intelectual.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>7. Limitação de Responsabilidade</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                O Assistente é fornecido "como está". Não garantimos que o serviço será 
                ininterrupto ou livre de erros. Não nos responsabilizamos por:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Decisões tomadas com base nas informações fornecidas</li>
                <li>Danos diretos ou indiretos resultantes do uso</li>
                <li>Perda de dados ou interrupção do serviço</li>
                <li>Problemas de saúde não diagnosticados corretamente</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>8. Modificações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Reservamo-nos o direito de modificar estes termos a qualquer momento. 
                Mudanças significativas serão comunicadas com antecedência de 30 dias.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>9. Cancelamento de Conta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Você pode cancelar sua conta a qualquer momento. Podemos suspender ou encerrar 
                sua conta se você violar estes termos.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Contato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Para dúvidas sobre estes termos:
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

export default Termos;
