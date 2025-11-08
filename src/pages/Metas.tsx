import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Target, TrendingUp, Calendar, Crown } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";

interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  target_value: number;
  current_value: number;
  unit: string;
  start_date: string;
  target_date: string;
  status: string;
  reminder_enabled: boolean;
  reminder_frequency: string;
}

const Metas = () => {
  const { user, loading: authLoading } = useAuth();
  const { isPremium, loading: subLoading } = useSubscription();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    category: "",
    target_value: "",
    unit: "",
    target_date: "",
    reminder_enabled: false,
    reminder_frequency: "daily"
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!authLoading && !subLoading && !isPremium) {
      toast({
        title: "Acesso Restrito",
        description: "Esta funcionalidade é exclusiva para assinantes Premium.",
        variant: "destructive",
      });
      navigate('/planos');
    }
  }, [isPremium, authLoading, subLoading, navigate, toast]);

  useEffect(() => {
    if (user && isPremium) {
      fetchGoals();
    }
  }, [user, isPremium]);

  const fetchGoals = async () => {
    try {
      const { data, error } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar metas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async () => {
    if (!newGoal.title || !newGoal.category || !newGoal.target_value) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha título, categoria e valor alvo.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from('user_goals').insert({
        user_id: user?.id,
        title: newGoal.title,
        description: newGoal.description,
        category: newGoal.category,
        target_value: parseFloat(newGoal.target_value),
        unit: newGoal.unit,
        target_date: newGoal.target_date || null,
        reminder_enabled: newGoal.reminder_enabled,
        reminder_frequency: newGoal.reminder_frequency,
      });

      if (error) throw error;

      toast({
        title: "Meta criada!",
        description: "Sua meta foi adicionada com sucesso.",
      });

      setDialogOpen(false);
      setNewGoal({
        title: "",
        description: "",
        category: "",
        target_value: "",
        unit: "",
        target_date: "",
        reminder_enabled: false,
        reminder_frequency: "daily"
      });
      fetchGoals();
    } catch (error: any) {
      toast({
        title: "Erro ao criar meta",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateProgress = async (goalId: string, newValue: number) => {
    try {
      const { error } = await supabase
        .from('user_goals')
        .update({ current_value: newValue })
        .eq('id', goalId);

      if (error) throw error;

      await supabase.from('goal_progress').insert({
        goal_id: goalId,
        user_id: user?.id,
        value: newValue,
      });

      toast({
        title: "Progresso atualizado!",
        description: "Seu progresso foi registrado.",
      });

      fetchGoals();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar progresso",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (authLoading || subLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p>Carregando...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isPremium) {
    return null;
  }

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Header */}
        <section className="py-12 bg-gradient-to-b from-primary/10 to-background">
          <div className="container">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="h-6 w-6 text-primary" />
                  <span className="text-sm font-semibold text-primary">Premium</span>
                </div>
                <h1 className="text-4xl font-bold mb-2">Metas e Objetivos</h1>
                <p className="text-muted-foreground">
                  Defina e acompanhe suas metas de saúde e bem-estar
                </p>
              </div>
              
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="gap-2">
                    <Plus className="h-5 w-5" />
                    Nova Meta
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Criar Nova Meta</DialogTitle>
                    <DialogDescription>
                      Defina uma nova meta para acompanhar seu progresso
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Título *</Label>
                      <Input
                        id="title"
                        placeholder="Ex: Perder peso"
                        value={newGoal.title}
                        onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Categoria *</Label>
                      <Select
                        value={newGoal.category}
                        onValueChange={(value) => setNewGoal({ ...newGoal, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="peso">Peso</SelectItem>
                          <SelectItem value="exercicio">Exercício</SelectItem>
                          <SelectItem value="alimentacao">Alimentação</SelectItem>
                          <SelectItem value="sono">Sono</SelectItem>
                          <SelectItem value="hidratacao">Hidratação</SelectItem>
                          <SelectItem value="outros">Outros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="target_value">Valor Alvo *</Label>
                        <Input
                          id="target_value"
                          type="number"
                          placeholder="Ex: 70"
                          value={newGoal.target_value}
                          onChange={(e) => setNewGoal({ ...newGoal, target_value: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="unit">Unidade</Label>
                        <Input
                          id="unit"
                          placeholder="Ex: kg"
                          value={newGoal.unit}
                          onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="target_date">Data Alvo</Label>
                      <Input
                        id="target_date"
                        type="date"
                        value={newGoal.target_date}
                        onChange={(e) => setNewGoal({ ...newGoal, target_date: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea
                        id="description"
                        placeholder="Descreva sua meta..."
                        value={newGoal.description}
                        onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="reminder">Ativar Lembretes</Label>
                      <Switch
                        id="reminder"
                        checked={newGoal.reminder_enabled}
                        onCheckedChange={(checked) => setNewGoal({ ...newGoal, reminder_enabled: checked })}
                      />
                    </div>

                    {newGoal.reminder_enabled && (
                      <div className="space-y-2">
                        <Label>Frequência dos Lembretes</Label>
                        <Select
                          value={newGoal.reminder_frequency}
                          onValueChange={(value) => setNewGoal({ ...newGoal, reminder_frequency: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Diário</SelectItem>
                            <SelectItem value="weekly">Semanal</SelectItem>
                            <SelectItem value="monthly">Mensal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
                      Cancelar
                    </Button>
                    <Button onClick={handleCreateGoal} className="flex-1">
                      Criar Meta
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </section>

        {/* Goals List */}
        <section className="py-12">
          <div className="container">
            {goals.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Target className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">Nenhuma meta cadastrada</h3>
                  <p className="text-muted-foreground mb-6">
                    Comece criando sua primeira meta de saúde e bem-estar
                  </p>
                  <Button onClick={() => setDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeira Meta
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {goals.map((goal) => {
                  const progress = calculateProgress(goal.current_value, goal.target_value);
                  return (
                    <Card key={goal.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <Target className="h-5 w-5 text-primary" />
                              {goal.title}
                            </CardTitle>
                            <CardDescription className="mt-1">
                              {goal.category.charAt(0).toUpperCase() + goal.category.slice(1)}
                            </CardDescription>
                          </div>
                          {goal.reminder_enabled && (
                            <Calendar className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {goal.description && (
                          <p className="text-sm text-muted-foreground">{goal.description}</p>
                        )}
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progresso</span>
                            <span className="font-semibold">
                              {goal.current_value} / {goal.target_value} {goal.unit}
                            </span>
                          </div>
                          <Progress value={progress} className="h-2" />
                          <p className="text-xs text-muted-foreground text-right">
                            {progress.toFixed(0)}% concluído
                          </p>
                        </div>

                        {goal.target_date && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>Meta até: {new Date(goal.target_date).toLocaleDateString('pt-BR')}</span>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Input
                            type="number"
                            placeholder="Novo valor"
                            className="flex-1"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const input = e.target as HTMLInputElement;
                                if (input.value) {
                                  updateProgress(goal.id, parseFloat(input.value));
                                  input.value = '';
                                }
                              }
                            }}
                          />
                          <Button
                            size="sm"
                            onClick={(e) => {
                              const input = (e.currentTarget.previousSibling as HTMLInputElement);
                              if (input.value) {
                                updateProgress(goal.id, parseFloat(input.value));
                                input.value = '';
                              }
                            }}
                          >
                            <TrendingUp className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Statistics */}
        {goals.length > 0 && (
          <section className="py-12 bg-muted/30">
            <div className="container">
              <h2 className="text-2xl font-bold mb-6">Relatório de Desempenho</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Metas Ativas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-primary">
                      {goals.filter(g => g.status === 'active').length}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Progresso Médio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-primary">
                      {(goals.reduce((acc, goal) => acc + calculateProgress(goal.current_value, goal.target_value), 0) / goals.length).toFixed(0)}%
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Lembretes Ativos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-primary">
                      {goals.filter(g => g.reminder_enabled).length}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Metas;
