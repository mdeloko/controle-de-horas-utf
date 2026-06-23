import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Tag } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTipos, createTipo, editTipo, deleteTipo, type TipoAtividade } from "@/services/api";
import { z } from "zod";

const nomeSchema = z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(50, "Máximo de 50 caracteres").trim();

export default function ActivityTypesPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TipoAtividade | null>(null);
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [removendo, setRemovendo] = useState<TipoAtividade | null>(null);

  const { data: tipos = [], isLoading } = useQuery({ queryKey: ["tipos"], queryFn: getTipos });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["tipos"] });

  const createMutation = useMutation({
    mutationFn: createTipo,
    onSuccess: () => { invalidate(); toast.success("Tipo criado"); closeDialog(); },
    onError: (err: Error) => toast.error(err.message),
  });

  const editMutation = useMutation({
    mutationFn: ({ id, nome }: { id: number; nome: string }) => editTipo(id, nome),
    onSuccess: () => { invalidate(); toast.success("Tipo atualizado"); closeDialog(); },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTipo,
    onSuccess: () => { invalidate(); toast.success("Tipo removido"); },
    onError: (err: Error) => toast.error(err.message),
  });

  const closeDialog = () => {
    setOpen(false);
    setEditing(null);
    setName("");
    setNameError("");
  };

  const handleSave = () => {
    const result = nomeSchema.safeParse(name);
    if (!result.success) {
      setNameError(result.error.errors[0]?.message ?? "Nome inválido");
      return;
    }
    setNameError("");
    if (editing) {
      editMutation.mutate({ id: editing.id, nome: result.data });
    } else {
      createMutation.mutate(result.data);
    }
  };

  const openEdit = (t: TipoAtividade) => {
    setEditing(t);
    setName(t.nome);
    setNameError("");
    setOpen(true);
  };

  const isPending = createMutation.isPending || editMutation.isPending;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Tipos de Atividade</h1>
          <p className="text-muted-foreground mt-1">Gerencie as categorias usadas no registro de horas.</p>
        </div>
        <Dialog
          open={open}
          onOpenChange={(o) => {
            if (!o) closeDialog();
            else setOpen(true);
          }}
        >
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground gap-2">
              <Plus className="h-4 w-4" /> Novo Tipo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Editar Tipo" : "Novo Tipo"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={name}
                onChange={(e) => { setName(e.target.value); setNameError(""); }}
                placeholder="Ex: Palestra"
              />
              {nameError && <p className="text-xs text-destructive">{nameError}</p>}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeDialog}>
                Cancelar
              </Button>
              <Button className="gradient-primary text-primary-foreground" disabled={isPending} onClick={handleSave}>
                {isPending ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Carregando...</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tipos.map((t) => (
            <Card key={t.id} className="p-4 shadow-card flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary-soft text-primary flex items-center justify-center">
                <Tag className="h-5 w-5" />
              </div>
              <div className="flex-1 font-medium">{t.nome}</div>
              <Button variant="ghost" size="icon" onClick={() => openEdit(t)}>
                <Pencil className="h-4 w-4 text-primary" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                disabled={deleteMutation.isPending}
                onClick={() => setRemovendo(t)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </Card>
          ))}
          {tipos.length === 0 && (
            <p className="text-muted-foreground text-sm col-span-3">Nenhum tipo cadastrado ainda.</p>
          )}
        </div>
      )}

      <Dialog open={!!removendo} onOpenChange={(o) => !o && setRemovendo(null)}>
        <DialogContent>
          {removendo && (
            <>
              <DialogHeader>
                <DialogTitle>Remover tipo</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">
                Deseja remover o tipo <span className="font-medium text-foreground">{removendo.nome}</span>? Tipos já
                usados em registros não podem ser removidos.
              </p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setRemovendo(null)}>
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  disabled={deleteMutation.isPending}
                  onClick={() => {
                    deleteMutation.mutate(removendo.id);
                    setRemovendo(null);
                  }}
                >
                  Remover
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
