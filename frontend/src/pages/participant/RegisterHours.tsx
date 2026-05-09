import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Info } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTipos, createRegistro } from "@/services/api";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  tipoId: z.string().min(1, "Selecione o tipo de atividade"),
  data: z.string().min(1, "Informe a data da atividade"),
  horas: z.coerce
    .number({ invalid_type_error: "Informe um número válido" })
    .min(0.5, "Mínimo de 0.5 horas")
    .max(24, "Máximo de 24 horas por registro"),
  descricao: z.string().min(10, "Descreva a atividade com pelo menos 10 caracteres"),
});

type FormData = z.infer<typeof schema>;

export default function RegisterHours() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: tipos = [] } = useQuery({ queryKey: ["tipos"], queryFn: getTipos });

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: createRegistro,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registros"] });
      toast.success("Registro enviado para aprovação!", {
        description: "Você será notificada quando for validado.",
      });
      navigate("/app/historico");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate({
      tipo_atividade_id: parseInt(data.tipoId),
      data_atividade: data.data,
      horas: data.horas,
      descricao: data.descricao,
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="p-8 shadow-card">
        <h1 className="text-2xl font-bold">Registrar Horas</h1>
        <p className="text-sm text-muted-foreground mt-1 mb-6">
          Preencha os detalhes da sua atividade para submeter à validação.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label>Tipo de Atividade</Label>
            <Controller
              name="tipoId"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Selecione o tipo de atividade" />
                  </SelectTrigger>
                  <SelectContent>
                    {tipos.map((t) => (
                      <SelectItem key={t.id} value={String(t.id)}>
                        {t.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.tipoId && <p className="text-xs text-destructive">{errors.tipoId.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data">Data da Atividade</Label>
              <Input id="data" type="date" className="h-11" {...register("data")} />
              {errors.data && <p className="text-xs text-destructive">{errors.data.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="horas">Quantidade de Horas</Label>
              <Input id="horas" type="number" step="0.5" placeholder="Ex: 4.5" className="h-11" {...register("horas")} />
              {errors.horas && <p className="text-xs text-destructive">{errors.horas.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição da Atividade</Label>
            <Textarea
              id="descricao"
              placeholder="Descreva brevemente a atividade realizada e seu papel..."
              rows={4}
              {...register("descricao")}
            />
            {errors.descricao && <p className="text-xs text-destructive">{errors.descricao.message}</p>}
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Info className="h-3 w-3" /> Forneça detalhes suficientes para facilitar a validação pelo coordenador.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="gradient-primary text-primary-foreground gap-2"
            >
              <Send className="h-4 w-4" /> {mutation.isPending ? "Enviando..." : "Enviar para aprovação"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
