import { cn } from "@/lib/utils";

export type Status = "Aprovada" | "Pendente";

const styles: Record<Status, string> = {
  Aprovada: "bg-success/10 text-success border-success/20",
  Pendente: "bg-warning/10 text-warning border-warning/30",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border",
        styles[status],
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
