import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PasswordInput from "@/components/PasswordInput";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { KeyRound } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { trocarSenha } from "@/services/api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z
  .object({
    senhaAtual: z.string().min(1, "Informe sua senha atual"),
    senhaNova: z.string().min(8, "A nova senha deve ter pelo menos 8 caracteres"),
    confirmar: z.string().min(1, "Confirme a nova senha"),
  })
  .refine((d) => d.senhaNova === d.confirmar, {
    message: "As senhas não coincidem",
    path: ["confirmar"],
  });

type FormData = z.infer<typeof schema>;

export default function Profile() {
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      trocarSenha({ senha_atual: data.senhaAtual, senha_nova: data.senhaNova }),
    onSuccess: () => {
      toast.success("Senha alterada com sucesso!");
      reset();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Perfil</h1>
        <p className="text-muted-foreground mt-1">Visualize seus dados e gerencie sua senha.</p>
      </div>

      <Card className="p-6 shadow-card">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="gradient-primary text-primary-foreground text-lg font-bold">
              {user.initials}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-0.5">
            <p className="font-bold text-lg">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <p className="text-sm text-muted-foreground">{user.role}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 shadow-card">
        <div className="flex items-center gap-2 mb-1">
          <KeyRound className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold">Trocar senha</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-5">
          Troque a senha temporária por uma de sua preferência.
        </p>

        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4 max-w-md">
          <div className="space-y-1.5">
            <Label>Senha atual</Label>
            <PasswordInput {...register("senhaAtual")} />
            {errors.senhaAtual && <p className="text-xs text-destructive">{errors.senhaAtual.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Nova senha</Label>
            <PasswordInput {...register("senhaNova")} />
            {errors.senhaNova && <p className="text-xs text-destructive">{errors.senhaNova.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Confirmar nova senha</Label>
            <PasswordInput {...register("confirmar")} />
            {errors.confirmar && <p className="text-xs text-destructive">{errors.confirmar.message}</p>}
          </div>
          <Button
            type="submit"
            disabled={mutation.isPending}
            className="gradient-primary text-primary-foreground"
          >
            {mutation.isPending ? "Salvando..." : "Alterar senha"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
