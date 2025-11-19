import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { VoiceChat as VoiceChatComponent } from '@/components/VoiceChat';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Loader2 } from 'lucide-react';

const VoiceChatPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { subscription, loading: subLoading, isPremium } = useSubscription();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || subLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!subscription || !isPremium) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md animate-fade-in-up">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl gradient-text">Recurso Premium</CardTitle>
              <CardDescription>
                O modo de voz está disponível apenas para assinantes Premium
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>✨ Converse por voz com o Assistente ConnectAI</p>
                <p>🎤 Interação natural e fluida</p>
                <p>🤖 Powered by OpenAI Realtime API</p>
              </div>
              <Button
                onClick={() => navigate('/planos')}
                className="w-full hover-lift"
              >
                Ver Planos Premium
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
        <VoiceChatComponent userId={user?.id} />
      </main>
      <Footer />
    </div>
  );
};

export default VoiceChatPage;
