import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatCard } from "@/components/StatCard";
import { Check, Pencil, Filter, Hourglass, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRegistros, getTipos, aprovarRegistro, editarRegistro, type Registro } from "@/services/api";

export default function Validation() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Registro | null>(null);
  const [acceptedHours, setAcceptedHours] = useState("");
  const [editTipoId, setEditTipoId] = useState("");
  const [feedback, setFeedback] = useState("");

  const { data: registros = [], isLoading } = useQuery({
    queryKey: ["registros", "all"],
    queryFn: () => getRegistros(),
  });

  const { data: tipos = [] } = useQuery({ queryKey: ["tipos"], queryFn: getTipos });

  const pendentes = registros.filter((r) => r.status === "Pendente");
  const aprovadas = registros.filter((r) => r.status === "Aprovada");

  const aprovarMutation = useMutation({
    mutationFn: aprovarRegistro,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registros"] });
      toast.success("Registro aprovado!");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const editarMutation = useMutation({
    mutationFn: ({ id, dados }: { id: string; dados: Parameters<typeof editarRegistro>[1] }) =>
      editarRegistro(id, dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registros"] });
      toast.success("Alterações salvas!");
      setEditing(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleSaveEdit = () => {
    if (!editing) return;
    const horas = parseFloat(acceptedHours);
    if (!acceptedHours || isNaN(horas) || horas <= 0) {
      toast.error("Informe uma quantidade de horas válida");
      return;
    }
    editarMutation.mutate({
      id: editing.id,
      dados: {
        tipo_atividade_id: editTipoId ? parseInt(editTipoId) : undefined,
        horas,
        descricao: feedback.trim() || undefined,
        aprovar: true,
      },
    });
  };

  const openEdit = (r: Registro) => {
    setEditing(r);
    setAcceptedHours(String(r.hours));
    setFeedback(r.description);
    const tipo = tipos.find((t) => t.nome === r.type);
    setEditTipoId(tipo ? String(tipo.id) : "");
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-3xl font-bold">Validação de Horas</h1>
        <p className="text-muted-foreground mt-1">
          Revise e aprove os registros de horas complementares submetidos pelas participantes.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Pendentes" value={pendentes.length} icon={<Hourglass className="h-5 w-5" />} accent="warning" />
        <StatCard label="Aprovadas" value={aprovadas.length} icon={<CheckCircle2 className="h-5 w-5" />} accent="success" />
      </div>

      <Card className="p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Fila de validação</h2>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" /> Filtros
          </Button>
        </div>
        <div className="space-y-2">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : (
            pendentes.map((r) => (
              <div key={r.id} className="flex items-center gap-4 p-4 rounded-xl border bg-card">
                <Avatar>
                  <AvatarFallback className="bg-primary-soft text-primary text-xs">
                    {r.participantName
                      .split(" ")
                      .map((w) => w[0])
                      .slice(0, 2)
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{r.participantName}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {r.type} • {r.description}
                  </p>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold">{r.hours}h</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(r.date + "T12:00:00").toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-9 w-9 text-success border-success/30 hover:bg-success/10"
                    disabled={aprovarMutation.isPending}
                    onClick={() => aprovarMutation.mutate(r.id)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-9 w-9 text-primary"
                    onClick={() => openEdit(r)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
          {!isLoading && pendentes.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              Nenhum registro aguardando validação.
            </div>
          )}
        </div>
      </Card>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Registro</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40">
                <Avatar>
                  <AvatarFallback className="bg-primary-soft text-primary">
                    {editing.participantName
                      .split(" ")
                      .map((w) => w[0])
                      .slice(0, 2)
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm">{editing.participantName}</p>
                  <p className="text-xs text-muted-foreground">{editing.description}</p>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Categoria da Atividade</Label>
                <Select value={editTipoId} onValueChange={setEditTipoId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tipos.map((t) => (
                      <SelectItem key={t.id} value={String(t.id)}>
                        {t.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Horas Solicitadas</Label>
                  <Input value={editing.hours} readOnly className="bg-muted/40" />
                </div>
                <div className="space-y-1.5">
                  <Label>Horas Aceitas</Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={acceptedHours}
                    onChange={(e) => setAcceptedHours(e.target.value)}
                  />
                  <p className="text-xs text-warning">Ajustado conforme regulamento</p>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Observações / Feedback</Label>
                <Textarea
                  rows={3}
                  placeholder="Mensagem para a participante..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
            <Button
              className="gradient-primary text-primary-foreground"
              disabled={editarMutation.isPending}
              onClick={handleSaveEdit}
            >
              {editarMutation.isPending ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
