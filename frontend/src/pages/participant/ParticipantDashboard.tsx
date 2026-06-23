import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, CheckCircle2, Hourglass, Plus, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { getRegistros } from "@/services/api";
import { META_HORAS } from "@/lib/constants";
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const CHART_COLORS = [
  "hsl(262 70% 45%)",
  "hsl(280 75% 60%)",
  "hsl(265 80% 75%)",
  "hsl(250 60% 55%)",
  "hsl(290 65% 50%)",
];

export default function ParticipantDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: registros = [], isLoading } = useQuery({
    queryKey: ["registros"],
    queryFn: () => getRegistros(),
  });

  const total = registros.reduce((s, r) => s + r.hours, 0);
  const aprovadas = registros.filter((r) => r.status === "Aprovada").reduce((s, r) => s + r.hours, 0);
  const pendentes = registros.filter((r) => r.status === "Pendente").reduce((s, r) => s + r.hours, 0);

  const monthlyEvolution = useMemo(() => {
    const map = new Map<string, number>();
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    for (const r of registros) {
      const d = new Date(r.date + "T12:00:00");
      const key = months[d.getMonth()] ?? String(d.getMonth() + 1);
      map.set(key, (map.get(key) ?? 0) + r.hours);
    }
    return Array.from(map.entries())
      .slice(-6)
      .map(([month, horas]) => ({ month, horas }));
  }, [registros]);

  const distributionByType = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of registros.filter((r) => r.status === "Aprovada")) {
      map.set(r.type, (map.get(r.type) ?? 0) + r.hours);
    }
    return Array.from(map.entries()).map(([name, value], i) => ({
      name,
      value,
      color: CHART_COLORS[i % CHART_COLORS.length] ?? CHART_COLORS[0],
    }));
  }, [registros]);

  if (isLoading) {
    return <div className="text-muted-foreground py-8 text-center">Carregando...</div>;
  }

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Visão Geral</h1>
          <p className="text-muted-foreground mt-1">Olá, {user?.name.split(" ")[0]}! Acompanhe seu progresso e últimas atividades.</p>
        </div>
        <Button onClick={() => navigate("/app/registrar")} className="gradient-primary text-primary-foreground gap-2 shadow-elegant">
          <Plus className="h-4 w-4" /> Nova Atividade
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Total de Horas"
          value={<span>{total}<span className="text-lg text-muted-foreground"> h</span></span>}
          icon={<Clock className="h-5 w-5" />}
          hint={<span className="flex items-center gap-1 text-success font-medium"><TrendingUp className="h-3 w-3" /> registradas</span>}
        />
        <StatCard
          label="Aprovadas"
          value={<span>{aprovadas}<span className="text-lg text-muted-foreground"> h</span></span>}
          icon={<CheckCircle2 className="h-5 w-5" />}
          accent="success"
          hint={<><Progress value={Math.min((aprovadas / META_HORAS) * 100, 100)} className="h-1.5 mt-1" /><span className="block mt-1">{Math.round((aprovadas / META_HORAS) * 100)}% de 120h</span></>}
        />
        <StatCard
          label="Pendentes"
          value={<span>{pendentes}<span className="text-lg text-muted-foreground"> h</span></span>}
          icon={<Hourglass className="h-5 w-5" />}
          accent="warning"
          hint="Aguardando validação"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Evolução de Horas (por mês)</h2>
          </div>
          {monthlyEvolution.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={monthlyEvolution}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                <Area type="monotone" dataKey="horas" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#colorHours)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[260px] flex items-center justify-center text-muted-foreground text-sm">Nenhum registro ainda.</div>
          )}
        </Card>

        <Card className="p-6 shadow-card">
          <h2 className="text-lg font-semibold mb-4">Distribuição por Tipo</h2>
          {distributionByType.length > 0 ? (
            <>
              <div className="relative">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={distributionByType} dataKey="value" innerRadius={55} outerRadius={75} paddingAngle={4}>
                      {distributionByType.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold">{aprovadas}</span>
                  <span className="text-xs text-muted-foreground">h aprovadas</span>
                </div>
              </div>
              <div className="space-y-2 mt-4">
                {distributionByType.map((d) => (
                  <div key={d.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                      <span>{d.name}</span>
                    </div>
                    <span className="font-semibold">{d.value}h</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[180px] flex items-center justify-center text-muted-foreground text-sm">Sem horas aprovadas ainda.</div>
          )}
        </Card>
      </div>

      <Card className="p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Últimos Registros</h2>
          <Button variant="link" className="text-primary" onClick={() => navigate("/app/historico")}>Ver todos</Button>
        </div>
        <div className="divide-y">
          {registros.slice(0, 4).map((r) => (
            <div key={r.id} className="flex items-center gap-4 py-3">
              <div className="h-10 w-10 rounded-lg bg-primary-soft text-primary flex items-center justify-center text-xs font-bold">
                {r.type.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{r.description}</p>
                <p className="text-xs text-muted-foreground">{r.type} • {new Date(r.date + "T12:00:00").toLocaleDateString("pt-BR")}</p>
              </div>
              <span className="text-sm font-bold text-foreground">{r.hours}h</span>
              <StatusBadge status={r.status} />
            </div>
          ))}
          {registros.length === 0 && (
            <p className="text-center py-8 text-muted-foreground text-sm">Nenhuma atividade registrada ainda.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
