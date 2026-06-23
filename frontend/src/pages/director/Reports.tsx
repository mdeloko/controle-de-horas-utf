import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Award, Clock, Download, Users, FileText } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { getRegistros, getUsuarios, exportarCSV } from "@/services/api";
import { gerarCertificadoPDF } from "@/lib/certificado";

export default function Reports() {
  const [exportOpen, setExportOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("all");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  const { data: registros = [] } = useQuery({
    queryKey: ["registros", "all"],
    queryFn: () => getRegistros(),
  });
  const { data: usuarios = [] } = useQuery({ queryKey: ["usuarios"], queryFn: getUsuarios });

  const participantes = usuarios.filter((u) => u.role === "Participante");

  const certRecords = registros.filter(
    (r) =>
      r.status === "Aprovada" &&
      (selectedUserId === "all" || r.participantId === selectedUserId) &&
      (!dataInicio || r.date >= dataInicio) &&
      (!dataFim || r.date <= dataFim),
  );
  const totalHours = certRecords.reduce((s, r) => s + r.hours, 0);

  const periodoInvalido = !!dataInicio && !!dataFim && dataInicio > dataFim;

  const aprovadas = registros.filter((r) => r.status === "Aprovada");
  const pendentes = registros.filter((r) => r.status === "Pendente");
  const totalAprovadas = aprovadas.reduce((s, r) => s + r.hours, 0);

  const handleExportCSV = async (usuarioId?: number) => {
    if (periodoInvalido) {
      toast.error("A data inicial não pode ser maior que a final.");
      return;
    }
    try {
      await exportarCSV({
        usuario_id: usuarioId,
        data_inicio: dataInicio || undefined,
        data_fim: dataFim || undefined,
      });
      toast.success("CSV exportado com sucesso!");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleGenerateCertificate = () => {
    if (selectedUserId === "all") {
      toast.error("Selecione uma participante para gerar o certificado.");
      return;
    }
    if (periodoInvalido) {
      toast.error("A data inicial não pode ser maior que a final.");
      return;
    }
    const participante = participantes.find((u) => String(u.id) === selectedUserId);
    if (!participante) return;
    if (certRecords.length === 0) {
      toast.error(
        dataInicio || dataFim
          ? "Nenhuma hora aprovada no período selecionado."
          : "Esta participante não tem horas aprovadas para certificar.",
      );
      return;
    }
    try {
      gerarCertificadoPDF({
        participante: participante.name,
        horasTotais: totalHours,
        registros: certRecords,
        dataInicio,
        dataFim,
      });
      toast.success("Certificado gerado!");
      setExportOpen(false);
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Relatórios e Exportação</h1>
          <p className="text-muted-foreground mt-1">Consolidação de horas e emissão de certificados.</p>
        </div>
        <Dialog open={exportOpen} onOpenChange={setExportOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground gap-2"><Award className="h-4 w-4" /> Gerar Certificado</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Exportar Dados para Certificado</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Participante</Label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os participantes</SelectItem>
                    {participantes.map((u) => <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Início</Label><Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} /></div>
                <div className="space-y-1.5"><Label>Fim</Label><Input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} /></div>
              </div>
              <Card className="p-4 bg-primary-soft border-primary/20">
                <p className="text-sm text-muted-foreground">Total de horas aprovadas</p>
                <p className="text-3xl font-bold text-primary">{totalHours}h</p>
                <p className="text-xs text-muted-foreground mt-1">{certRecords.length} atividades incluídas</p>
              </Card>
              <div className="max-h-40 overflow-auto space-y-1 text-sm">
                {certRecords.map((r) => (
                  <div key={r.id} className="flex justify-between p-2 rounded bg-muted/40">
                    <span className="truncate">{r.description}</span>
                    <span className="font-bold ml-2">{r.hours}h</span>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setExportOpen(false)}>Cancelar</Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={async () => {
                  await handleExportCSV(selectedUserId !== "all" ? Number(selectedUserId) : undefined);
                  setExportOpen(false);
                }}
              >
                <Download className="h-4 w-4" /> Exportar CSV
              </Button>
              <Button className="gradient-primary text-primary-foreground gap-2" onClick={handleGenerateCertificate}>
                <Award className="h-4 w-4" /> Gerar Certificado (PDF)
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total Horas Aprovadas" value={<>{totalAprovadas}<span className="text-base text-muted-foreground"> h</span></>} icon={<Clock className="h-5 w-5" />} hint="horas aprovadas" />
        <StatCard label="Participantes" value={participantes.length} icon={<Users className="h-5 w-5" />} accent="success" hint="cadastrados" />
        <StatCard label="Aguardando Validação" value={pendentes.length} icon={<FileText className="h-5 w-5" />} accent="warning" hint="registros pendentes" />
      </div>

      <Card className="p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Horas Consolidadas</h2>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => handleExportCSV()}>
            <Download className="h-4 w-4" /> Exportar CSV
          </Button>
        </div>
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Participante</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Horas</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registros.slice(0, 10).map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="bg-primary-soft text-primary text-xs">
                          {r.participantName.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{r.participantName}</span>
                    </div>
                  </TableCell>
                  <TableCell>{r.type}</TableCell>
                  <TableCell>{new Date(r.date + "T12:00:00").toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell className="font-bold">{r.hours}h</TableCell>
                  <TableCell><StatusBadge status={r.status} /></TableCell>
                </TableRow>
              ))}
              {registros.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Nenhum registro encontrado.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
