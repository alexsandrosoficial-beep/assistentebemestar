import { useState, useRef, useEffect } from 'react';
import { Send, Trash2, Sparkles, Lock, Clock, Bot, User, Crown, Zap } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ReactMarkdown from 'react-markdown';
import { supabaseTyped as supabase } from '@/integrations/supabase/client-typed';

const Chat = () => {
  const [input, setInput] = useState('');
  const { messages, isLoading, sendMessage, clearChat } = useChat();
  const { user, loading, checkSubscription } = useAuth();
  const { subscription, isPremium, isVip, isFree } = useSubscription();
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
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-6 md:py-8 flex flex-col max-w-5xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 md:w-7 md:h-7 text-primary-foreground" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Assistente ConnectAI
              </h1>
              <p className="text-sm text-muted-foreground">
                Gemini Pro & GPT-5 • Sempre disponível
              </p>
            </div>
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            {daysRemaining !== null && daysRemaining <= 7 && (
              <div className="flex items-center gap-2 bg-gradient-to-r from-primary/10 to-accent/10 text-primary px-3 py-2 rounded-full border border-primary/20 shadow-sm animate-scale-in">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-semibold">
                  {daysRemaining} {daysRemaining === 1 ? 'dia' : 'dias'} restantes
                </span>
              </div>
            )}
            {messages.length > 0 && (
              <Button
                onClick={clearChat}
                variant="outline"
                size="sm"
                className="gap-2 hover:bg-destructive hover:text-destructive-foreground transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Limpar</span>
              </Button>
            )}
          </div>
        </div>

        {/* Plan Info Banner */}
        {subscription && (
          <Alert className="mb-4 animate-fade-in border-primary/20 bg-primary/5">
            <AlertDescription className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                {isPremium && <Crown className="w-4 h-4 text-primary" />}
                {isVip && <Sparkles className="w-4 h-4 text-primary" />}
                {isFree && <Zap className="w-4 h-4 text-primary" />}
                <span className="font-medium">
                  Plano {isPremium ? 'Premium' : isVip ? 'VIP' : 'Gratuito'}
                </span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">
                  {isPremium && 'GPT-5, Gemini Pro e Chat de Voz'}
                  {isVip && 'Gemini Flash'}
                  {isFree && 'Acesso completo (teste de 7 dias)'}
                </span>
              </div>
              {!isPremium && (
                <Button 
                  variant="link" 
                  size="sm"
                  onClick={() => navigate('/planos')}
                  className="h-auto p-0 text-primary hover:text-primary/80"
                >
                  Fazer upgrade →
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Chat Container */}
        <div className="flex-1 backdrop-blur-sm bg-card/50 rounded-2xl border shadow-xl flex flex-col overflow-hidden animate-fade-in-up">
          <ScrollArea className="flex-1 p-4 md:p-6" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 md:p-8">
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center animate-scale-in">
                    <Sparkles className="w-10 h-10 text-primary animate-pulse" />
                  </div>
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary to-accent opacity-20 blur-xl animate-pulse" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-3 text-foreground">
                  Como posso ajudar você hoje?
                </h2>
                <p className="text-muted-foreground max-w-md mb-8">
                  Faça perguntas sobre saúde, fitness, nutrição, bem-estar mental e muito mais. Estou aqui para te ajudar!
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
                  {[
                    { text: 'Como posso melhorar minha rotina de sono?', icon: '😴' },
                    { text: 'Dicas para começar a meditar', icon: '🧘' },
                    { text: 'Alimentação saudável para o dia a dia', icon: '🥗' },
                    { text: 'Exercícios para iniciantes', icon: '💪' }
                  ].map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(suggestion.text)}
                      className="group p-4 text-sm text-left rounded-xl border bg-card hover:bg-accent/50 hover:border-primary/30 transition-all hover:shadow-md hover:scale-[1.02] animate-fade-in-up"
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform">{suggestion.icon}</span>
                      <span className="text-foreground font-medium">{suggestion.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 items-start animate-fade-in ${
                      message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    {/* Avatar */}
                    <div className={`flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-md ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-primary to-accent'
                        : 'bg-gradient-to-br from-muted to-muted/50 border-2 border-primary/20'
                    }`}>
                      {message.role === 'user' ? (
                        <User className="w-4 h-4 md:w-5 md:h-5 text-primary-foreground" />
                      ) : (
                        <Bot className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                      )}
                    </div>

                    {/* Message Content */}
                    <div className={`flex-1 max-w-[85%] md:max-w-[80%]`}>
                      <div
                        className={`rounded-2xl p-4 shadow-md ${
                          message.role === 'user'
                            ? 'bg-gradient-to-br from-primary to-primary-dark text-primary-foreground'
                            : 'bg-gradient-to-br from-card to-muted/30 text-foreground border border-border/50'
                        }`}
                      >
                        {message.role === 'assistant' ? (
                          <div className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                            <ReactMarkdown
                              components={{
                                h1: ({node, ...props}) => <h1 className="text-xl font-bold mb-2 text-foreground" {...props} />,
                                h2: ({node, ...props}) => <h2 className="text-lg font-semibold mb-2 mt-3 text-foreground" {...props} />,
                                h3: ({node, ...props}) => <h3 className="text-base font-medium mb-1 mt-2 text-foreground" {...props} />,
                                p: ({node, ...props}) => <p className="mb-2 text-sm leading-relaxed text-foreground/90" {...props} />,
                                ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2 space-y-1 text-foreground/90" {...props} />,
                                ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-2 space-y-1 text-foreground/90" {...props} />,
                                li: ({node, ...props}) => <li className="text-sm leading-relaxed" {...props} />,
                                strong: ({node, ...props}) => <strong className="font-semibold text-primary" {...props} />,
                                em: ({node, ...props}) => <em className="italic" {...props} />,
                                code: ({node, ...props}) => <code className="bg-primary/10 px-1.5 py-0.5 rounded text-xs font-mono text-primary" {...props} />,
                                blockquote: ({node, ...props}) => <blockquote className="border-l-3 border-primary pl-3 italic my-2 text-muted-foreground text-sm" {...props} />,
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
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3 items-start animate-fade-in">
                    <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-muted to-muted/50 border-2 border-primary/20 flex items-center justify-center shadow-md">
                      <Bot className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                    </div>
                    <div className="bg-gradient-to-br from-card to-muted/30 border border-border/50 rounded-2xl p-4 shadow-md">
                      <div className="flex gap-1.5">
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

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="p-4 md:p-5 border-t bg-card/80 backdrop-blur-sm">
            <div className="flex gap-2 md:gap-3">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite sua mensagem aqui..."
                className="resize-none min-h-[56px] md:min-h-[60px] rounded-xl border-2 focus:border-primary transition-colors"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isLoading}
                className="h-[56px] w-[56px] md:h-[60px] md:w-[60px] rounded-xl bg-gradient-to-br from-primary to-accent hover:from-primary-dark hover:to-primary shadow-lg hover:shadow-xl transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <span className="hidden sm:inline">💡 Pressione</span>
              <kbd className="px-1.5 py-0.5 text-[10px] font-semibold bg-muted rounded border">Enter</kbd>
              <span className="hidden sm:inline">para enviar</span>
            </p>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Chat;
