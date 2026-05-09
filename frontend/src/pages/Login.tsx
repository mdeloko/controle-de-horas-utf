import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, ArrowRight, PlaySquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

type FormData = z.infer<typeof schema>;

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await login(data.email, data.password);
      navigate("/app/dashboard");
    } catch (err) {
      toast.error((err as Error).message || "Credenciais inválidas");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-soft relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, hsl(var(--primary) / 0.15), transparent 40%), radial-gradient(circle at 80% 80%, hsl(var(--primary-glow) / 0.2), transparent 40%)",
        }}
      />

      <Card className="w-full max-w-md relative shadow-elegant border-border/40 overflow-hidden">
        <div className="h-1.5 gradient-primary" />
        <div className="p-8 sm:p-10">
          <div className="flex flex-col items-center text-center mb-7">
            <div className="h-14 w-14 rounded-2xl gradient-primary flex items-center justify-center shadow-elegant mb-4">
              <PlaySquare className="h-7 w-7 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Meninas Digitais</h1>
            <p className="text-primary font-semibold text-sm mt-0.5">Controle de Horas</p>
            <p className="text-xs text-muted-foreground mt-3 max-w-xs">
              Acesso exclusivo para participantes e coordenação do projeto.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-primary uppercase tracking-wide">
                E-mail
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="aluna@alunos.utfpr.edu.br"
                  className="pl-9 h-11"
                  {...register("email")}
                />
              </div>
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold text-primary uppercase tracking-wide">
                Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-9 h-11"
                  {...register("password")}
                />
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-muted-foreground cursor-pointer">
                <Checkbox /> Lembrar-me
              </label>
              <Link to="/forgot-password" className="text-primary font-medium hover:underline">
                Esqueci minha senha
              </Link>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 gradient-primary text-primary-foreground font-semibold gap-2 hover:opacity-95 shadow-elegant"
            >
              {isSubmitting ? "Entrando..." : <><span>Entrar no Sistema</span> <ArrowRight className="h-4 w-4" /></>}
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t text-center">
            <p className="text-xs text-muted-foreground font-medium">
              Projeto Meninas Digitais
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
