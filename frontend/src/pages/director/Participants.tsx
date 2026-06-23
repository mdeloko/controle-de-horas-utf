import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, UserPlus, GraduationCap, ShieldCheck, Copy } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUsuarios, createUsuario, resetarSenha as resetarSenhaApi, editUsuario, type Usuario } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("E-mail inválido"),
});

type FormData = z.infer<typeof schema>;

export default function ParticipantsPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<"participante" | "diretor">("participante");

  const [editing, setEditing] = useState<Usuario | null>(null);
  const [editNome, setEditNome] = useState("");
  const [editRole, setEditRole] = useState<"participante" | "diretor">("participante");
  const [credencial, setCredencial] = useState<{ nome: string; senha: string } | null>(null);
  const [confirmacao, setConfirmacao] = useState<{ acao: "reset" | "toggle"; usuario: Usuario } | null>(null);

  const { data: usuarios = [], isLoading } = useQuery({
    queryKey: ["usuarios"],
    queryFn: getUsuarios,
  });

  const filtered = usuarios.filter((u) => u.name.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase()));

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const createMutation = useMutation({
    mutationFn: (data: FormData) => createUsuario({ nome: data.nome, email: data.email, perfil: role }),
    onSuccess: (usuario) => {
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });
      setCredencial({ nome: usuario.name, senha: usuario.senhaTemporaria });
      reset();
      setRole("participante");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const resetMutation = useMutation({
    mutationFn: (u: Usuario) => resetarSenhaApi(u.id),
    onSuccess: (data, u) => {
      setCredencial({ nome: u.name, senha: data.senhaTemporaria });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const editMutation = useMutation({
    mutationFn: (dados: { id: number; nome: string; perfil: "participante" | "diretor" }) => editUsuario(dados.id, { nome: dados.nome, perfil: dados.perfil }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });
      toast.success("Dados atualizados!");
      setEditing(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const toggleMutation = useMutation({
    mutationFn: (u: Usuario) => editUsuario(u.id, { ativo: !u.ativo }),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });
      toast.success(updated.ativo ? "Acesso reativado!" : "Acesso desativado!");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const openEdit = (u: Usuario) => {
    setEditing(u);
    setEditNome(u.name);
    setEditRole(u.role === "Diretor" ? "diretor" : "participante");
  };

  const editingSelf = !!editing && editing.id === user?.id;

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-3xl font-bold">Gestão de Participantes</h1>
        <p className="text-muted-foreground mt-1">Gerencie os acessos, atribua perfis de diretoria e acompanhe o engajamento.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card className="p-6 shadow-card">
          <div className="flex flex-wrap gap-3 mb-5">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por nome ou e-mail..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : (
              filtered.map((u) => (
                <div key={u.id} className={`flex items-center gap-4 p-4 rounded-xl border bg-card hover:shadow-card transition-shadow ${u.ativo ? "" : "opacity-60"}`}>
                  <Avatar className="h-11 w-11">
                    <AvatarFallback className="bg-primary-soft text-primary font-semibold">
                      {u.name
                        .split(" ")
                        .map((w) => w[0])
                        .slice(0, 2)
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold">{u.name}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${u.role === "Diretor" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                        {u.role}
                      </span>
                      {!u.ativo && <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-destructive/10 text-destructive">Inativa</span>}
                    </div>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="text-xs" onClick={() => openEdit(u)}>
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                      disabled={toggleMutation.isPending || user?.id === u.id}
                      title={user?.id === u.id ? "Você não pode inativar a própria conta" : undefined}
                      onClick={() => setConfirmacao({ acao: "toggle", usuario: u })}
                    >
                      {u.ativo ? "Inativar" : "Ativar"}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" disabled={resetMutation.isPending} onClick={() => setConfirmacao({ acao: "reset", usuario: u })}>
                      Resetar senha
                    </Button>
                  </div>
                </div>
              ))
            )}
            {!isLoading && filtered.length === 0 && <div className="text-center py-8 text-muted-foreground">Nenhum participante encontrado.</div>}
          </div>
        </Card>

        <Card className="p-6 shadow-card h-fit">
          <div className="flex items-center gap-2 mb-1">
            <UserPlus className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">Novo Participante</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-5">Preencha os dados abaixo para convidar um novo membro para a plataforma.</p>

          <form onSubmit={handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nome Completo</Label>
              <Input placeholder="Ex: Maria" {...register("nome")} />
              {errors.nome && <p className="text-xs text-destructive">{errors.nome.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>E-mail</Label>
              <Input type="email" placeholder="nome@alunos.utfpr.edu.br" {...register("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Perfil de Acesso</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole("participante")}
                  className={`p-3 rounded-lg border text-sm font-medium flex flex-col items-center gap-1 transition-all ${
                    role === "participante" ? "border-primary bg-primary-soft text-primary" : "border-border"
                  }`}
                >
                  <GraduationCap className="h-4 w-4" /> Participante
                </button>
                <button
                  type="button"
                  onClick={() => setRole("diretor")}
                  className={`p-3 rounded-lg border text-sm font-medium flex flex-col items-center gap-1 transition-all ${
                    role === "diretor" ? "border-primary bg-primary-soft text-primary" : "border-border"
                  }`}
                >
                  <ShieldCheck className="h-4 w-4" /> Diretor
                </button>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  reset();
                  setRole("participante");
                }}
              >
                Limpar
              </Button>
              <Button type="submit" disabled={createMutation.isPending} className="flex-1 gradient-primary text-primary-foreground">
                {createMutation.isPending ? "Cadastrando..." : "Cadastrar"}
              </Button>
            </div>
          </form>
        </Card>
      </div>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar usuário</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nome</Label>
              <Input value={editNome} onChange={(e) => setEditNome(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>E-mail</Label>
              <Input value={editing?.email ?? ""} disabled />
            </div>
            <div className="space-y-1.5">
              <Label>Perfil de Acesso</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={editingSelf}
                  onClick={() => setEditRole("participante")}
                  className={`p-3 rounded-lg border text-sm font-medium flex flex-col items-center gap-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    editRole === "participante" ? "border-primary bg-primary-soft text-primary" : "border-border"
                  }`}
                >
                  <GraduationCap className="h-4 w-4" /> Participante
                </button>
                <button
                  type="button"
                  disabled={editingSelf}
                  onClick={() => setEditRole("diretor")}
                  className={`p-3 rounded-lg border text-sm font-medium flex flex-col items-center gap-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    editRole === "diretor" ? "border-primary bg-primary-soft text-primary" : "border-border"
                  }`}
                >
                  <ShieldCheck className="h-4 w-4" /> Diretor
                </button>
              </div>
              {editingSelf && <p className="text-xs text-muted-foreground">Você não pode alterar o próprio perfil.</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
            <Button
              className="gradient-primary text-primary-foreground"
              disabled={editMutation.isPending || editNome.trim().length < 2}
              onClick={() => editing && editMutation.mutate({ id: editing.id, nome: editNome, perfil: editRole })}
            >
              {editMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!credencial} onOpenChange={(open) => !open && setCredencial(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Senha temporária gerada</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Repasse a senha abaixo para <span className="font-medium text-foreground">{credencial?.nome}</span>. Ela não será exibida novamente. A pessoa poderá trocá-la depois no perfil.
            </p>
            <div className="flex items-center justify-between gap-2 rounded-lg border bg-muted/40 px-3 py-2">
              <code className="text-sm font-mono">{credencial?.senha}</code>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 text-xs"
                onClick={() => {
                  navigator.clipboard.writeText(credencial?.senha ?? "");
                  toast.success("Senha copiada!");
                }}
              >
                <Copy className="h-3.5 w-3.5" /> Copiar
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button className="gradient-primary text-primary-foreground" onClick={() => setCredencial(null)}>
              Concluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!confirmacao} onOpenChange={(open) => !open && setConfirmacao(null)}>
        <DialogContent className="max-w-md">
          {confirmacao && (
            <>
              <DialogHeader>
                <DialogTitle>{confirmacao.acao === "reset" ? "Resetar senha" : confirmacao.usuario.ativo ? "Inativar acesso" : "Reativar acesso"}</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">
                {confirmacao.acao === "reset" ? (
                  <>
                    Será gerada uma nova senha temporária para <span className="font-medium text-foreground">{confirmacao.usuario.name}</span>. A senha atual deixará de funcionar.
                  </>
                ) : confirmacao.usuario.ativo ? (
                  <>
                    Deseja inativar o acesso de <span className="font-medium text-foreground">{confirmacao.usuario.name}</span>? A pessoa não conseguirá mais entrar no sistema.
                  </>
                ) : (
                  <>
                    Deseja reativar o acesso de <span className="font-medium text-foreground">{confirmacao.usuario.name}</span>?
                  </>
                )}
              </p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setConfirmacao(null)}>
                  Cancelar
                </Button>
                <Button
                  className="gradient-primary text-primary-foreground"
                  disabled={resetMutation.isPending || toggleMutation.isPending}
                  onClick={() => {
                    if (confirmacao.acao === "reset") resetMutation.mutate(confirmacao.usuario);
                    else toggleMutation.mutate(confirmacao.usuario);
                    setConfirmacao(null);
                  }}
                >
                  Confirmar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
