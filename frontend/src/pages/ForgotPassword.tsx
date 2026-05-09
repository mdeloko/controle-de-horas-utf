import { Link } from "react-router-dom";
import { ArrowLeft, KeyRound } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ForgotPassword() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-soft">
      <Card className="w-full max-w-md p-8 shadow-elegant overflow-hidden">
        <div className="h-1.5 gradient-primary -mx-8 -mt-8 mb-6" />
        <Link
          to="/login"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar ao login
        </Link>

        <div className="flex flex-col items-center text-center space-y-4 py-4">
          <div className="h-14 w-14 rounded-2xl bg-primary-soft flex items-center justify-center">
            <KeyRound className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Recuperar Senha</h1>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs">
              Para redefinir sua senha, entre em contato com a coordenação do projeto Meninas Digitais.
              A coordenação poderá gerar uma nova senha temporária para você.
            </p>
          </div>
          <div className="w-full bg-muted/40 rounded-lg p-4 text-left text-sm text-muted-foreground">
            <p className="font-semibold text-foreground mb-1">Como proceder:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Contate a coordenação do projeto</li>
              <li>Solicite o reset da sua senha</li>
              <li>Acesse o sistema com a senha temporária fornecida</li>
              <li>Altere sua senha no seu perfil</li>
            </ol>
          </div>
          <Button asChild className="gradient-primary text-primary-foreground w-full">
            <Link to="/login">Voltar ao login</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
