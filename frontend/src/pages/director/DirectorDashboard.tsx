import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/StatCard";
import { Users, Clock, AlertCircle, ArrowRight } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getRegistros, getRanking } from "@/services/api";

export default function DirectorDashboard() {
  const navigate = useNavigate();

  const { data: registros = [] } = useQuery({
    queryKey: ["registros", "all"],
    queryFn: () => getRegistros(),
  });

  const { data: ranking = [] } = useQuery({
    queryKey: ["ranking"],
    queryFn: getRanking,
  });

  const pendentes = registros.filter((r) => r.status === "Pendente");
  const totalHoras = registros.filter((r) => r.status === "Aprovada").reduce((s, r) => s + r.hours, 0);

  const topParticipantes = ranking.slice(0, 5);
  const maxHoras = topParticipantes[0]?.total_horas ?? 1;

  const activityData = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of registros.filter((r) => r.status === "Aprovada")) {
      map.set(r.type, (map.get(r.type) ?? 0) + r.hours);
    }
    const colors = [
      "hsl(262 70% 45%)",
      "hsl(280 75% 60%)",
      "hsl(260 15% 35%)",
      "hsl(265 80% 75%)",
      "hsl(250 60% 55%)",
    ];
    return Array.from(map.entries()).map(([name, value], i) => ({
      name,
      value,
      color: colors[i % colors.length] ?? colors[0],
    }));
  }, [registros]);

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-3xl font-bold">Visão Geral</h1>
        <p className="text-muted-foreground mt-1">Resumo das atividades e engajamento do projeto Meninas Digitais.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Participantes" value={ranking.length} icon={<Users className="h-5 w-5" />} hint="cadastrados no sistema" />
        <StatCard label="Horas Totais Aprovadas" value={<>{totalHoras}<span className="text-lg text-muted-foreground"> h</span></>} icon={<Clock className="h-5 w-5" />} hint="acumulado geral" />
        <StatCard
          label="Registros Pendentes"
          value={pendentes.length}
          icon={<AlertCircle className="h-5 w-5" />}
          accent="destructive"
          hint={
            <button onClick={() => navigate("/app/validacao")} className="text-destructive font-medium inline-flex items-center gap-1 hover:underline">
              Revisar <ArrowRight className="h-3 w-3" />
            </button>
          }
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-6 shadow-card">
          <h2 className="text-lg font-semibold mb-4">Top Participantes (Horas)</h2>
          <div className="space-y-3">
            {topParticipantes.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhum dado disponível ainda.</p>
            ) : topParticipantes.map((entry) => (
              <div key={entry.usuario.id} className="grid grid-cols-[140px_1fr_60px] items-center gap-3">
                <span className="text-sm font-medium truncate">{entry.usuario.nome}</span>
                <div className="h-6 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full gradient-primary rounded-full"
                    style={{ width: `${(entry.total_horas / maxHoras) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-right">{entry.total_horas}h</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 shadow-card">
          <h2 className="text-lg font-semibold mb-4">Distribuição por Atividade</h2>
          {activityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))" }} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {activityData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">Sem dados ainda.</div>
          )}
        </Card>
      </div>

      <Card className="p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Aguardando Validação</h2>
          <Button variant="link" className="text-primary" onClick={() => navigate("/app/validacao")}>Ver Todos</Button>
        </div>
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-muted-foreground text-xs uppercase">
              <tr>
                <th className="text-left p-3 font-medium">Participante</th>
                <th className="text-left p-3 font-medium">Atividade</th>
                <th className="text-left p-3 font-medium">Data</th>
                <th className="text-left p-3 font-medium">Horas</th>
                <th className="text-right p-3 font-medium">Ação</th>
              </tr>
            </thead>
            <tbody>
              {pendentes.slice(0, 5).map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="bg-primary-soft text-primary text-xs">
                          {r.participantName.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{r.participantName}</span>
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground">{r.description}</td>
                  <td className="p-3">{new Date(r.date + "T12:00:00").toLocaleDateString("pt-BR")}</td>
                  <td className="p-3 font-semibold">{r.hours}h</td>
                  <td className="p-3 text-right">
                    <Button size="sm" variant="outline" onClick={() => navigate("/app/validacao")}>Revisar</Button>
                  </td>
                </tr>
              ))}
              {pendentes.length === 0 && (
                <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">Nenhum registro pendente.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
