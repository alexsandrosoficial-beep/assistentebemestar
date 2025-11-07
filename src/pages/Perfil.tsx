import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UsageStatistics } from "@/components/UsageStatistics";
import { 
  User, 
  Calendar, 
  CreditCard, 
  LogOut, 
  Trash2,
  Clock,
  Mail,
  AlertCircle
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Perfil = () => {
  const navigate = useNavigate();
  const { user, loading, signOut, checkSubscription } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [daysActive, setDaysActive] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
      return;
    }

    if (user) {
      loadProfile();
      loadSubscription();
    }
  }, [user, loading, navigate]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setProfile(data);
        
        // Calcular dias desde o cadastro
        const createdDate = new Date(data.created_at);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - createdDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setDaysActive(diffDays);
      }
    } catch (error: any) {
      console.error("Erro ao carregar perfil:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as informações do perfil",
        variant: "destructive",
      });
    }
  };

  const loadSubscription = async () => {
    try {
      const sub = await checkSubscription();
      setSubscription(sub);
    } catch (error: any) {
      console.error("Erro ao carregar assinatura:", error);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      const { error } = await supabase
        .from("user_subscriptions")
        .update({ status: "cancelled" })
        .eq("user_id", user?.id)
        .eq("status", "active");

      if (error) throw error;

      toast({
        title: "Plano cancelado",
        description: "Seu plano foi cancelado com sucesso",
      });

      loadSubscription();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Não foi possível cancelar o plano",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // Deletar perfil (cascade vai deletar subscription)
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", user?.id);

      if (profileError) throw profileError;

      toast({
        title: "Conta deletada",
        description: "Sua conta foi deletada com sucesso",
      });

      await signOut();
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Não foi possível deletar a conta",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getPlanName = (planType: string) => {
    const plans: Record<string, string> = {
      free: "Gratuito",
      basic: "Básico",
      premium: "Premium",
      enterprise: "Empresarial",
    };
    return plans[planType] || planType;
  };

  const getStatusName = (status: string) => {
    const statuses: Record<string, string> = {
      active: "Ativo",
      cancelled: "Cancelado",
      expired: "Expirado",
    };
    return statuses[status] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-lg text-muted-foreground">Carregando...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-12 bg-muted/30">
        <div className="container max-w-4xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Meu Perfil</h1>
            <p className="text-muted-foreground">
              Gerencie suas informações e configurações
            </p>
          </div>

          <div className="space-y-6">
            {/* Informações Pessoais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Nome</p>
                    <p className="font-medium">{profile?.name || "Não informado"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{profile?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Tempo de uso</p>
                    <p className="font-medium">{daysActive} dias</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Membro desde</p>
                    <p className="font-medium">
                      {profile?.created_at ? formatDate(profile.created_at) : "N/A"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informações do Plano */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Plano Atual
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {subscription ? (
                  <>
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Plano</p>
                        <p className="font-medium text-lg">
                          {getPlanName(subscription.plan_type)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <p className="font-medium">
                          {getStatusName(subscription.status)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Início</p>
                        <p className="font-medium">
                          {formatDate(subscription.started_at)}
                        </p>
                      </div>
                    </div>
                    {subscription.expires_at && (
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Validade</p>
                          <p className="font-medium">
                            {formatDate(subscription.expires_at)}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {subscription.status === "active" && subscription.plan_type !== "free" && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" className="w-full mt-4">
                            Cancelar Plano
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Cancelar plano?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja cancelar seu plano? Você perderá acesso aos
                              recursos premium.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Voltar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleCancelSubscription}>
                              Confirmar Cancelamento
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </>
                ) : (
                  <p className="text-muted-foreground">Nenhum plano ativo</p>
                )}
              </CardContent>
            </Card>

            {/* Estatísticas de Uso */}
            {user && <UsageStatistics userId={user.id} />}

            {/* Ações da Conta */}
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Conta</CardTitle>
                <CardDescription>
                  Configurações e ações da sua conta
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={signOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair da Conta
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="w-full justify-start"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Deletar Conta
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Deletar conta permanentemente?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação não pode ser desfeita. Todos os seus dados serão
                        permanentemente removidos de nossos servidores.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Sim, deletar conta
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Perfil;
