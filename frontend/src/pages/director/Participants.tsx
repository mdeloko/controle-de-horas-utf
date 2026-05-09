import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, UserPlus, GraduationCap, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUsuarios, createUsuario, resetarSenha as resetarSenhaApi } from "@/services/api";
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
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<"participante" | "diretor">("participante");

  const { data: usuarios = [], isLoading } = useQuery({
    queryKey: ["usuarios"],
    queryFn: getUsuarios,
  });

  const filtered = usuarios.filter(
    (u) =>
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase()),
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const createMutation = useMutation({
    mutationFn: (data: FormData) => createUsuario({ nome: data.nome, email: data.email, perfil: role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });
      toast.success("Participante cadastrada! Uma senha temporária foi gerada.");
      reset();
      setRole("participante");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const resetMutation = useMutation({
    mutationFn: resetarSenhaApi,
    onSuccess: () => toast.success("Senha resetada! Uma nova senha temporária foi gerada."),
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-3xl font-bold">Gestão de Participantes</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie os acessos, atribua perfis de diretoria e acompanhe o engajamento.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card className="p-6 shadow-card">
          <div className="flex flex-wrap gap-3 mb-5">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou e-mail..."
                className="pl-9"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : (
              filtered.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center gap-4 p-4 rounded-xl border bg-card hover:shadow-card transition-shadow"
                >
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
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          u.role === "Diretor"
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground"
                        }`}
                      >
                        {u.role}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground"
                    disabled={resetMutation.isPending}
                    onClick={() => resetMutation.mutate(u.id)}
                  >
                    Resetar senha
                  </Button>
                </div>
              ))
            )}
            {!isLoading && filtered.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">Nenhum participante encontrado.</div>
            )}
          </div>
        </Card>

        <Card className="p-6 shadow-card h-fit">
          <div className="flex items-center gap-2 mb-1">
            <UserPlus className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">Novo Participante</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-5">
            Preencha os dados abaixo para convidar um novo membro para a plataforma.
          </p>

          <form onSubmit={handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nome Completo</Label>
              <Input placeholder="Ex: Maria Antonieta" {...register("nome")} />
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
                onClick={() => { reset(); setRole("participante"); }}
              >
                Limpar
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="flex-1 gradient-primary text-primary-foreground"
              >
                {createMutation.isPending ? "Cadastrando..." : "Cadastrar"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
