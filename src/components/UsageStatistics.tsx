import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, TrendingUp, Calendar } from "lucide-react";

interface UsageStats {
  totalMessages: number;
  userMessages: number;
  dailyActivity: { date: string; count: number }[];
  weeklyTotal: number;
  monthlyTotal: number;
}

export const UsageStatistics = ({ userId }: { userId: string }) => {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, [userId]);

  const loadStatistics = async () => {
    try {
      // Total de mensagens
      const { count: totalCount } = await supabase
        .from("chat_messages")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      // Mensagens do usuário
      const { count: userCount } = await supabase
        .from("chat_messages")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("role", "user");

      // Atividade diária (últimos 7 dias)
      const { data: dailyData } = await supabase
        .from("chat_messages")
        .select("created_at")
        .eq("user_id", userId)
        .eq("role", "user")
        .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      const dailyCounts: Record<string, number> = {};
      dailyData?.forEach((item) => {
        const date = new Date(item.created_at).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
        });
        dailyCounts[date] = (dailyCounts[date] || 0) + 1;
      });

      const dailyActivity = Object.entries(dailyCounts)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => {
          const [dayA, monthA] = a.date.split("/").map(Number);
          const [dayB, monthB] = b.date.split("/").map(Number);
          return new Date(2024, monthA - 1, dayA).getTime() - new Date(2024, monthB - 1, dayB).getTime();
        });

      // Atividade semanal
      const { count: weeklyCount } = await supabase
        .from("chat_messages")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("role", "user")
        .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      // Atividade mensal
      const { count: monthlyCount } = await supabase
        .from("chat_messages")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("role", "user")
        .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      setStats({
        totalMessages: totalCount || 0,
        userMessages: userCount || 0,
        dailyActivity,
        weeklyTotal: weeklyCount || 0,
        monthlyTotal: monthlyCount || 0,
      });
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Estatísticas de Uso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Carregando estatísticas...</p>
        </CardContent>
      </Card>
    );
  }

  if (!stats || stats.totalMessages === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Estatísticas de Uso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Comece a usar o assistente para ver suas estatísticas aqui.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumo Geral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Estatísticas de Uso
          </CardTitle>
          <CardDescription>
            Acompanhe sua atividade no assistente de saúde
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <p className="text-sm text-muted-foreground">Total de Mensagens</p>
              </div>
              <p className="text-3xl font-bold">{stats.totalMessages}</p>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <p className="text-sm text-muted-foreground">Suas Perguntas</p>
              </div>
              <p className="text-3xl font-bold">{stats.userMessages}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Relatório de Atividade */}
      <Card>
        <CardHeader>
          <CardTitle>Relatório de Atividade</CardTitle>
          <CardDescription>
            Resumo das suas consultas recentes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Resumo por Período */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Última Semana</h3>
                  </div>
                  <span className="text-2xl font-bold text-primary">{stats.weeklyTotal}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Perguntas nos últimos 7 dias
                </p>
              </div>
              
              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Último Mês</h3>
                  </div>
                  <span className="text-2xl font-bold text-primary">{stats.monthlyTotal}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Perguntas nos últimos 30 dias
                </p>
              </div>
            </div>

            {/* Atividade Diária Simplificada */}
            {stats.dailyActivity.length > 0 && (
              <div className="border border-border rounded-lg p-4">
                <h3 className="font-semibold mb-4">Atividade Diária (Últimos 7 dias)</h3>
                <div className="space-y-2">
                  {stats.dailyActivity.map((day, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <span className="text-sm font-medium">{day.date}</span>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 max-w-[200px] bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary rounded-full h-2 transition-all"
                            style={{ width: `${Math.min((day.count / Math.max(...stats.dailyActivity.map(d => d.count))) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold min-w-[30px] text-right">{day.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
