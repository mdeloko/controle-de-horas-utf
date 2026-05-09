import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTipos, getUsuarios, atribuirRegistro } from "@/services/api";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  usuarioId: z.string().min(1, "Selecione a participante"),
  tipoId: z.string().min(1, "Selecione o tipo de atividade"),
  data: z.string().min(1, "Informe a data"),
  horas: z.coerce
    .number({ invalid_type_error: "Informe um número válido" })
    .min(0.5, "Mínimo de 0.5 horas")
    .max(24, "Máximo de 24 horas por registro"),
  descricao: z.string().min(10, "Descreva a atividade com pelo menos 10 caracteres"),
});

type FormData = z.infer<typeof schema>;

export default function ManualAssign() {
  const queryClient = useQueryClient();

  const { data: usuarios = [] } = useQuery({ queryKey: ["usuarios"], queryFn: getUsuarios });
  const { data: tipos = [] } = useQuery({ queryKey: ["tipos"], queryFn: getTipos });

  const participantes = usuarios.filter((u) => u.role === "Participante");

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: atribuirRegistro,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registros"] });
      toast.success("Horas atribuídas e aprovadas com sucesso!");
      reset();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate({
      usuario_id: parseInt(data.usuarioId),
      tipo_atividade_id: parseInt(data.tipoId),
      data_atividade: data.data,
      horas: data.horas,
      descricao: data.descricao,
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Atribuição Manual de Horas</h1>
        <p className="text-muted-foreground mt-1">Adicione horas já validadas diretamente para uma participante.</p>
      </div>
      <Card className="p-8 shadow-card">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label>Participante</Label>
            <Controller
              name="usuarioId"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Selecione a participante" />
                  </SelectTrigger>
                  <SelectContent>
                    {participantes.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.usuarioId && <p className="text-xs text-destructive">{errors.usuarioId.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Tipo de Atividade</Label>
            <Controller
              name="tipoId"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Selecione o tipo" />
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data</Label>
              <Input type="date" className="h-11" {...register("data")} />
              {errors.data && <p className="text-xs text-destructive">{errors.data.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Quantidade de Horas</Label>
              <Input type="number" step="0.5" placeholder="Ex: 4" className="h-11" {...register("horas")} />
              {errors.horas && <p className="text-xs text-destructive">{errors.horas.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea rows={3} placeholder="Detalhe a atividade..." {...register("descricao")} />
            {errors.descricao && <p className="text-xs text-destructive">{errors.descricao.message}</p>}
          </div>

          <Button
            type="submit"
            disabled={mutation.isPending}
            className="w-full gradient-primary text-primary-foreground gap-2 h-11"
          >
            <Plus className="h-4 w-4" /> {mutation.isPending ? "Salvando..." : "Adicionar Horas Aprovadas"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
