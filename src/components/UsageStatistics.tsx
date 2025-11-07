import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";
import { MessageSquare, TrendingUp, Calendar } from "lucide-react";

interface UsageStats {
  totalMessages: number;
  userMessages: number;
  topTopics: { topic: string; count: number }[];
  dailyActivity: { date: string; count: number }[];
  weeklyActivity: { week: string; count: number }[];
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
  'hsl(var(--accent))',
  'hsl(var(--muted))',
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
];

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

      // Tópicos mais consultados
      const { data: topicsData } = await supabase
        .from("chat_messages")
        .select("topic")
        .eq("user_id", userId)
        .eq("role", "user")
        .not("topic", "is", null);

      const topicCounts: Record<string, number> = {};
      topicsData?.forEach((item) => {
        if (item.topic) {
          topicCounts[item.topic] = (topicCounts[item.topic] || 0) + 1;
        }
      });

      const topTopics = Object.entries(topicCounts)
        .map(([topic, count]) => ({ topic, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);

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

      // Atividade semanal (últimas 4 semanas)
      const { data: weeklyData } = await supabase
        .from("chat_messages")
        .select("created_at")
        .eq("user_id", userId)
        .eq("role", "user")
        .gte("created_at", new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString());

      const weeklyCounts: Record<string, number> = {};
      weeklyData?.forEach((item) => {
        const date = new Date(item.created_at);
        const weekNumber = Math.ceil((date.getDate() - date.getDay() + 1) / 7);
        const month = date.toLocaleDateString("pt-BR", { month: "short" });
        const weekKey = `Sem ${weekNumber} - ${month}`;
        weeklyCounts[weekKey] = (weeklyCounts[weekKey] || 0) + 1;
      });

      const weeklyActivity = Object.entries(weeklyCounts)
        .map(([week, count]) => ({ week, count }));

      setStats({
        totalMessages: totalCount || 0,
        userMessages: userCount || 0,
        topTopics,
        dailyActivity,
        weeklyActivity,
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
            Acompanhe sua atividade e tópicos mais consultados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-primary" />
                <p className="text-sm text-muted-foreground">Tópicos Explorados</p>
              </div>
              <p className="text-3xl font-bold">{stats.topTopics.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tópicos Mais Consultados */}
      {stats.topTopics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tópicos Mais Consultados</CardTitle>
            <CardDescription>
              Áreas de saúde que você mais busca informações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.topTopics}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="topic" 
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: 'hsl(var(--foreground))' }}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: 'hsl(var(--foreground))' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--popover-foreground))'
                      }}
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.topTopics}
                      dataKey="count"
                      nameKey="topic"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={(entry) => entry.topic}
                    >
                      {stats.topTopics.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--popover-foreground))'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Atividade Diária */}
      {stats.dailyActivity.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Atividade dos Últimos 7 Dias</CardTitle>
            <CardDescription>
              Número de mensagens enviadas por dia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.dailyActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fill: 'hsl(var(--foreground))' }}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fill: 'hsl(var(--foreground))' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--popover-foreground))'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="Mensagens"
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
