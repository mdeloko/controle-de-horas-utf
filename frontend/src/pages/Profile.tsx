import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function Profile() {
  const { user } = useAuth();

  const [nome, setNome] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");

  if (!user) return null;

  const isParticipante = user.role === "Participante";

  const handleSave = () => {
    if (isParticipante) {
      toast.info("Edição de perfil disponível na próxima versão. Solicite alterações à coordenação.");
      return;
    }
    toast.success("Perfil atualizado!");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Perfil</h1>
        <p className="text-muted-foreground mt-1">Visualize e atualize seus dados de conta.</p>
      </div>
      <Card className="p-6 shadow-card">
        <div className="flex items-center gap-4 mb-6">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="gradient-primary text-primary-foreground text-lg font-bold">
              {user.initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-bold text-lg">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.role}</p>
          </div>
        </div>

        {isParticipante && (
          <p className="text-xs text-muted-foreground bg-muted/40 rounded-lg px-4 py-3 mb-4">
            Para alterar seus dados, entre em contato com a coordenação do projeto.
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Nome</Label>
            <Input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              disabled={isParticipante}
            />
          </div>
          <div className="space-y-1.5">
            <Label>E-mail</Label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isParticipante}
            />
          </div>
        </div>

        {!isParticipante && (
          <Button
            className="mt-5 gradient-primary text-primary-foreground"
            onClick={handleSave}
          >
            Salvar alterações
          </Button>
        )}
      </Card>
    </div>
  );
}
