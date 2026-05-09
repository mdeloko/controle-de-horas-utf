import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getRegistros, getTipos } from "@/services/api";

export default function History() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("all");
  const [tipo, setTipo] = useState("all");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  const { data: registros = [], isLoading } = useQuery({
    queryKey: ["registros"],
    queryFn: () => getRegistros(),
  });

  const { data: tipos = [] } = useQuery({ queryKey: ["tipos"], queryFn: getTipos });

  const records = useMemo(
    () =>
      registros
        .filter((r) => status === "all" || r.status === status)
        .filter((r) => tipo === "all" || r.type === tipo)
        .filter((r) => !dataInicio || r.date >= dataInicio)
        .filter((r) => !dataFim || r.date <= dataFim),
    [registros, status, tipo, dataInicio, dataFim],
  );

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Histórico de Atividades</h1>
          <p className="text-muted-foreground mt-1">Acompanhe seus registros de horas e status de aprovação.</p>
        </div>
        <Button onClick={() => navigate("/app/registrar")} className="gradient-primary text-primary-foreground gap-2">
          <Plus className="h-4 w-4" /> Nova Atividade
        </Button>
      </div>

      <Card className="p-6 shadow-card">
        <div className="grid gap-4 md:grid-cols-4 mb-5">
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="Aprovada">Aprovada</SelectItem>
                <SelectItem value="Pendente">Pendente</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Tipo de Atividade</Label>
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                {tipos.map((t) => <SelectItem key={t.id} value={t.nome}>{t.nome}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Período Inicial</Label>
            <Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Período Final</Label>
            <Input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
          </div>
        </div>

        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Horas</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : records.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Nenhum registro encontrado.</TableCell></TableRow>
              ) : records.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{new Date(r.date + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}</TableCell>
                  <TableCell><span className="text-primary font-medium">● {r.type}</span></TableCell>
                  <TableCell className="max-w-xs truncate">{r.description}</TableCell>
                  <TableCell className="text-right font-bold">{r.hours}h</TableCell>
                  <TableCell><StatusBadge status={r.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
          <span>Mostrando {records.length} registros</span>
        </div>
      </Card>
    </div>
  );
}
