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
import { Plus, Target, TrendingUp, Calendar, Crown, Sparkles, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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

interface GoalRecommendation {
  title: string;
  description: string;
  category: string;
  target_value: number;
  unit: string;
  duration_days: number;
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
  const [questionnaireOpen, setQuestionnaireOpen] = useState(false);
  const [recommendationsOpen, setRecommendationsOpen] = useState(false);
  const [generatingRecommendations, setGeneratingRecommendations] = useState(false);
  const [recommendations, setRecommendations] = useState<GoalRecommendation[]>([]);

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

  const [questionnaireAnswers, setQuestionnaireAnswers] = useState({
    objective: "",
    currentActivity: "",
    sleepHours: "",
    waterIntake: "",
    dietQuality: "",
    stressLevel: "",
    healthConcerns: "",
    availableTime: ""
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

  const handleGenerateRecommendations = async () => {
    const hasEmptyAnswers = Object.values(questionnaireAnswers).some(answer => !answer);
    if (hasEmptyAnswers) {
      toast({
        title: "Questionário incompleto",
        description: "Por favor, responda todas as perguntas.",
        variant: "destructive",
      });
      return;
    }

    setGeneratingRecommendations(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-goal-recommendations', {
        body: { answers: questionnaireAnswers }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setRecommendations(data.recommendations);
      setQuestionnaireOpen(false);
      setRecommendationsOpen(true);
      
      toast({
        title: "Recomendações geradas!",
        description: "Confira as metas sugeridas pela IA.",
      });
    } catch (error: any) {
      console.error('Error generating recommendations:', error);
      toast({
        title: "Erro ao gerar recomendações",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setGeneratingRecommendations(false);
    }
  };

  const handleAddRecommendation = async (recommendation: GoalRecommendation) => {
    try {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + recommendation.duration_days);

      const { error } = await supabase.from('user_goals').insert({
        user_id: user?.id,
        title: recommendation.title,
        description: recommendation.description,
        category: recommendation.category,
        target_value: recommendation.target_value,
        unit: recommendation.unit,
        target_date: targetDate.toISOString().split('T')[0],
        reminder_enabled: true,
        reminder_frequency: recommendation.reminder_frequency,
      });

      if (error) throw error;

      toast({
        title: "Meta adicionada!",
        description: "A meta recomendada foi adicionada às suas metas.",
      });

      fetchGoals();
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar meta",
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
              
              <div className="flex gap-3">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="gap-2"
                  onClick={() => setQuestionnaireOpen(true)}
                >
                  <Sparkles className="h-5 w-5" />
                  Recomendações IA
                </Button>
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
          </div>
        </section>

        {/* Questionnaire Dialog */}
        <Dialog open={questionnaireOpen} onOpenChange={setQuestionnaireOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Questionário de Saúde e Rotina
              </DialogTitle>
              <DialogDescription>
                Responda as perguntas abaixo para receber recomendações personalizadas de metas
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-3">
                <Label>Qual é seu principal objetivo?</Label>
                <RadioGroup value={questionnaireAnswers.objective} onValueChange={(value) => setQuestionnaireAnswers({ ...questionnaireAnswers, objective: value })}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="perder_peso" id="obj1" />
                    <Label htmlFor="obj1" className="font-normal cursor-pointer">Perder peso</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ganhar_massa" id="obj2" />
                    <Label htmlFor="obj2" className="font-normal cursor-pointer">Ganhar massa muscular</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="melhorar_saude" id="obj3" />
                    <Label htmlFor="obj3" className="font-normal cursor-pointer">Melhorar saúde geral</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mais_energia" id="obj4" />
                    <Label htmlFor="obj4" className="font-normal cursor-pointer">Ter mais energia</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label>Qual seu nível atual de atividade física?</Label>
                <RadioGroup value={questionnaireAnswers.currentActivity} onValueChange={(value) => setQuestionnaireAnswers({ ...questionnaireAnswers, currentActivity: value })}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sedentario" id="act1" />
                    <Label htmlFor="act1" className="font-normal cursor-pointer">Sedentário (pouco ou nenhum exercício)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="leve" id="act2" />
                    <Label htmlFor="act2" className="font-normal cursor-pointer">Leve (1-2 dias/semana)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="moderado" id="act3" />
                    <Label htmlFor="act3" className="font-normal cursor-pointer">Moderado (3-5 dias/semana)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="intenso" id="act4" />
                    <Label htmlFor="act4" className="font-normal cursor-pointer">Intenso (6-7 dias/semana)</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label>Quantas horas você dorme por noite?</Label>
                <RadioGroup value={questionnaireAnswers.sleepHours} onValueChange={(value) => setQuestionnaireAnswers({ ...questionnaireAnswers, sleepHours: value })}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="menos_5" id="sleep1" />
                    <Label htmlFor="sleep1" className="font-normal cursor-pointer">Menos de 5 horas</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="5_6" id="sleep2" />
                    <Label htmlFor="sleep2" className="font-normal cursor-pointer">5-6 horas</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="7_8" id="sleep3" />
                    <Label htmlFor="sleep3" className="font-normal cursor-pointer">7-8 horas</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mais_8" id="sleep4" />
                    <Label htmlFor="sleep4" className="font-normal cursor-pointer">Mais de 8 horas</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label>Quantos copos de água você bebe por dia?</Label>
                <RadioGroup value={questionnaireAnswers.waterIntake} onValueChange={(value) => setQuestionnaireAnswers({ ...questionnaireAnswers, waterIntake: value })}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="menos_4" id="water1" />
                    <Label htmlFor="water1" className="font-normal cursor-pointer">Menos de 4 copos</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="4_6" id="water2" />
                    <Label htmlFor="water2" className="font-normal cursor-pointer">4-6 copos</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="7_8" id="water3" />
                    <Label htmlFor="water3" className="font-normal cursor-pointer">7-8 copos</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mais_8" id="water4" />
                    <Label htmlFor="water4" className="font-normal cursor-pointer">Mais de 8 copos</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label>Como você avalia sua alimentação?</Label>
                <RadioGroup value={questionnaireAnswers.dietQuality} onValueChange={(value) => setQuestionnaireAnswers({ ...questionnaireAnswers, dietQuality: value })}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ruim" id="diet1" />
                    <Label htmlFor="diet1" className="font-normal cursor-pointer">Ruim (muitos processados e fast food)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="regular" id="diet2" />
                    <Label htmlFor="diet2" className="font-normal cursor-pointer">Regular (algumas refeições saudáveis)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="boa" id="diet3" />
                    <Label htmlFor="diet3" className="font-normal cursor-pointer">Boa (maioria das refeições balanceadas)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="excelente" id="diet4" />
                    <Label htmlFor="diet4" className="font-normal cursor-pointer">Excelente (sempre balanceada e nutritiva)</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label>Qual seu nível de estresse diário?</Label>
                <RadioGroup value={questionnaireAnswers.stressLevel} onValueChange={(value) => setQuestionnaireAnswers({ ...questionnaireAnswers, stressLevel: value })}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="baixo" id="stress1" />
                    <Label htmlFor="stress1" className="font-normal cursor-pointer">Baixo</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="moderado" id="stress2" />
                    <Label htmlFor="stress2" className="font-normal cursor-pointer">Moderado</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="alto" id="stress3" />
                    <Label htmlFor="stress3" className="font-normal cursor-pointer">Alto</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="muito_alto" id="stress4" />
                    <Label htmlFor="stress4" className="font-normal cursor-pointer">Muito Alto</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label htmlFor="health_concerns">Tem alguma preocupação específica com a saúde?</Label>
                <Textarea
                  id="health_concerns"
                  placeholder="Ex: pressão alta, diabetes, problemas nas articulações..."
                  value={questionnaireAnswers.healthConcerns}
                  onChange={(e) => setQuestionnaireAnswers({ ...questionnaireAnswers, healthConcerns: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-3">
                <Label>Quanto tempo você tem disponível por dia para se dedicar às suas metas?</Label>
                <RadioGroup value={questionnaireAnswers.availableTime} onValueChange={(value) => setQuestionnaireAnswers({ ...questionnaireAnswers, availableTime: value })}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="menos_15" id="time1" />
                    <Label htmlFor="time1" className="font-normal cursor-pointer">Menos de 15 minutos</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="15_30" id="time2" />
                    <Label htmlFor="time2" className="font-normal cursor-pointer">15-30 minutos</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="30_60" id="time3" />
                    <Label htmlFor="time3" className="font-normal cursor-pointer">30-60 minutos</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mais_60" id="time4" />
                    <Label htmlFor="time4" className="font-normal cursor-pointer">Mais de 60 minutos</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setQuestionnaireOpen(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleGenerateRecommendations} className="flex-1 gap-2" disabled={generatingRecommendations}>
                {generatingRecommendations ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Gerar Recomendações
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Recommendations Dialog */}
        <Dialog open={recommendationsOpen} onOpenChange={setRecommendationsOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Recomendações Personalizadas de Metas
              </DialogTitle>
              <DialogDescription>
                Baseado nas suas respostas, a IA gerou estas recomendações para você
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {recommendations.map((rec, index) => (
                <Card key={index} className="border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span>{rec.title}</span>
                      <Button size="sm" onClick={() => handleAddRecommendation(rec)}>
                        <Plus className="h-4 w-4 mr-1" />
                        Adicionar
                      </Button>
                    </CardTitle>
                    <CardDescription>
                      {rec.category.charAt(0).toUpperCase() + rec.category.slice(1)} • {rec.duration_days} dias
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
                    <div className="flex gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Meta:</span>{' '}
                        <span className="font-semibold">{rec.target_value} {rec.unit}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Lembretes:</span>{' '}
                        <span className="font-semibold">
                          {rec.reminder_frequency === 'daily' ? 'Diário' : 
                           rec.reminder_frequency === 'weekly' ? 'Semanal' : 'Mensal'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Button variant="outline" onClick={() => setRecommendationsOpen(false)} className="w-full">
              Fechar
            </Button>
          </DialogContent>
        </Dialog>

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
