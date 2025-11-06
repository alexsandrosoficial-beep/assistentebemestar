import { useState, useRef, useEffect } from 'react';
import { Send, Trash2, Sparkles, Lock, Clock } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ReactMarkdown from 'react-markdown';
import { supabaseTyped as supabase } from '@/integrations/supabase/client-typed';

const Chat = () => {
  const [input, setInput] = useState('');
  const { messages, isLoading, sendMessage, clearChat } = useChat();
  const { user, loading, checkSubscription } = useAuth();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [checkingSubscription, setCheckingSubscription] = useState(true);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Check authentication and subscription
  useEffect(() => {
    const checkAccess = async () => {
      if (!loading) {
        if (!user) {
          navigate('/auth');
          return;
        }

        const subscription = await checkSubscription();
        if (!subscription) {
          navigate('/planos');
          return;
        }

        // Calculate days remaining for free trial
        if ((subscription as any).plan_type === 'free' && (subscription as any).expires_at) {
          const expiresAt = new Date((subscription as any).expires_at);
          const now = new Date();
          const diffTime = expiresAt.getTime() - now.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          setDaysRemaining(diffDays > 0 ? diffDays : 0);
        }

        setHasSubscription(true);
        setCheckingSubscription(false);
      }
    };

    checkAccess();
  }, [user, loading, navigate, checkSubscription]);

  if (loading || checkingSubscription) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!hasSubscription) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Acesso Restrito</CardTitle>
              <CardDescription>
                Você precisa escolher um plano para acessar o assistente de saúde
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button 
                onClick={() => navigate('/planos')} 
                variant="gradient"
                className="w-full"
              >
                Ver Planos
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Assistente de Saúde</h1>
            <p className="text-muted-foreground">
              Converse sobre saúde, bem-estar e organize suas rotinas
            </p>
          </div>
          <div className="flex gap-2">
            {daysRemaining !== null && daysRemaining <= 7 && (
              <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-lg">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {daysRemaining} {daysRemaining === 1 ? 'dia restante' : 'dias restantes'}
                </span>
              </div>
            )}
            {messages.length > 0 && (
              <Button
                onClick={clearChat}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Limpar
              </Button>
            )}
          </div>
        </div>

        <div className="flex-1 bg-card rounded-lg border shadow-sm flex flex-col overflow-hidden">
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold mb-2 text-foreground">
                  Olá! Como posso ajudar?
                </h2>
                <p className="text-muted-foreground max-w-md">
                  Faça perguntas sobre saúde, fitness, nutrição, bem-estar mental e muito mais.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6 w-full max-w-2xl">
                  {[
                    'Como posso melhorar minha rotina de sono?',
                    'Dicas para começar a meditar',
                    'Alimentação saudável para o dia a dia',
                    'Exercícios para iniciantes'
                  ].map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(suggestion)}
                      className="p-3 text-sm text-left rounded-lg border bg-card hover:bg-accent transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      {message.role === 'assistant' ? (
                        <div className="prose prose-sm max-w-none">
                          <ReactMarkdown
                            components={{
                              h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-3 text-foreground" {...props} />,
                              h2: ({node, ...props}) => <h2 className="text-xl font-semibold mb-2 mt-4 text-foreground" {...props} />,
                              h3: ({node, ...props}) => <h3 className="text-lg font-medium mb-2 mt-3 text-foreground" {...props} />,
                              p: ({node, ...props}) => <p className="mb-3 text-base leading-relaxed text-foreground" {...props} />,
                              ul: ({node, ...props}) => <ul className="list-disc list-inside mb-3 space-y-1 text-foreground" {...props} />,
                              ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-3 space-y-1 text-foreground" {...props} />,
                              li: ({node, ...props}) => <li className="text-base leading-relaxed text-foreground" {...props} />,
                              strong: ({node, ...props}) => <strong className="font-semibold text-primary" {...props} />,
                              em: ({node, ...props}) => <em className="italic text-foreground" {...props} />,
                              code: ({node, ...props}) => <code className="bg-background px-1.5 py-0.5 rounded text-sm font-mono text-primary" {...props} />,
                              blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-primary pl-4 italic my-3 text-muted-foreground" {...props} />,
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">
                          {message.content}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-4">
                      <div className="flex gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          <form onSubmit={handleSubmit} className="p-4 border-t bg-card">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite sua pergunta sobre saúde e bem-estar..."
                className="resize-none min-h-[60px]"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isLoading}
                className="h-[60px] w-[60px]"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Pressione Enter para enviar, Shift + Enter para nova linha
            </p>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Chat;
