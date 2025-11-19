import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Users, CreditCard, Settings, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useRole();
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }

    if (!roleLoading && !isAdmin) {
      toast.error("Acesso negado. Apenas administradores podem acessar esta área.");
      navigate("/");
      return;
    }
  }, [user, isAdmin, authLoading, roleLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

  const loadAdminData = async () => {
    try {
      // Load users with their profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Load subscriptions
      const { data: subsData, error: subsError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (subsError) throw subsError;

      setUsers(profilesData || []);
      setSubscriptions(subsData || []);
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast.error("Erro ao carregar dados administrativos");
    } finally {
      setLoadingData(false);
    }
  };

  if (authLoading || roleLoading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Verificando permissões...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Painel Administrativo</h1>
          </div>
          <p className="text-muted-foreground">
            Área exclusiva para gerenciamento do sistema
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">
              <Activity className="h-4 w-4 mr-2" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Usuários
            </TabsTrigger>
            <TabsTrigger value="plans">
              <CreditCard className="h-4 w-4 mr-2" />
              Planos
            </TabsTrigger>
            <TabsTrigger value="subscriptions">
              <CreditCard className="h-4 w-4 mr-2" />
              Assinaturas
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Total de Usuários
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{users.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Assinaturas Ativas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">
                    {subscriptions.filter(s => s.status === 'active').length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Planos Premium
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">
                    {subscriptions.filter(s => s.plan_type === 'premium' && s.status === 'active').length}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciamento de Usuários</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingData ? (
                  <div className="text-center py-8">Carregando usuários...</div>
                ) : (
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div key={user.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">{user.name || 'Sem nome'}</h3>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Criado em: {new Date(user.created_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="plans">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciamento de Planos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg">Plano Gratuito (7 dias)</h3>
                    <ul className="mt-2 space-y-1 text-sm">
                      <li>✓ 7 dias de acesso completo</li>
                      <li>✓ Teste todas as funcionalidades</li>
                      <li>✓ Sem compromisso</li>
                    </ul>
                  </div>

                  <div className="border rounded-lg p-4 border-primary">
                    <h3 className="font-semibold text-lg">Plano VIP</h3>
                    <ul className="mt-2 space-y-1 text-sm">
                      <li>✓ Chat com IA Gemini Flash</li>
                      <li>✓ Perguntas ilimitadas</li>
                      <li>✓ Central de metas</li>
                      <li>✓ Suporte padrão</li>
                    </ul>
                  </div>

                  <div className="border rounded-lg p-4 border-accent">
                    <h3 className="font-semibold text-lg">Plano Premium</h3>
                    <ul className="mt-2 space-y-1 text-sm">
                      <li>✓ Chat com GPT-5 e Gemini Pro</li>
                      <li>✓ Chat de voz em tempo real</li>
                      <li>✓ Vozes personalizadas</li>
                      <li>✓ Central de metas avançada</li>
                      <li>✓ Suporte Premium prioritário</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscriptions">
            <Card>
              <CardHeader>
                <CardTitle>Assinaturas</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingData ? (
                  <div className="text-center py-8">Carregando assinaturas...</div>
                ) : (
                  <div className="space-y-4">
                    {subscriptions.map((sub) => (
                      <div key={sub.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold capitalize">{sub.plan_type}</h3>
                            <p className="text-sm text-muted-foreground">
                              Status: <span className="capitalize">{sub.status}</span>
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Início: {new Date(sub.started_at).toLocaleDateString('pt-BR')}
                            </p>
                            {sub.expires_at && (
                              <p className="text-xs text-muted-foreground">
                                Expira: {new Date(sub.expires_at).toLocaleDateString('pt-BR')}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Configurações do Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <h3 className="font-semibold mb-2">Segurança</h3>
                    <p className="text-sm text-muted-foreground">
                      O sistema está protegido por Row Level Security (RLS) e funções SECURITY DEFINER.
                      Apenas você, como admin, pode acessar esta área.
                    </p>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <h3 className="font-semibold mb-2">Roles e Permissões</h3>
                    <p className="text-sm text-muted-foreground">
                      O role 'admin' está totalmente protegido e não pode ser alterado.
                      Novos usuários recebem automaticamente o role 'user'.
                    </p>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <h3 className="font-semibold mb-2">Planos</h3>
                    <p className="text-sm text-muted-foreground">
                      Os usuários são automaticamente atribuídos ao plano Free (7 dias) ao se cadastrarem.
                      Após pagamento, o plano é atualizado automaticamente para Premium ou VIP.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default Admin;
