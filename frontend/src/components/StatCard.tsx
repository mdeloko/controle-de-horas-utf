import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  hint?: ReactNode;
  accent?: "primary" | "success" | "warning" | "destructive";
}

const accentMap = {
  primary: "bg-primary-soft text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
};

export function StatCard({ label, value, icon, hint, accent = "primary" }: StatCardProps) {
  return (
    <Card className="p-5 shadow-card border-border/60 hover:shadow-elegant transition-shadow">
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
        <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center", accentMap[accent])}>{icon}</div>
      </div>
      <div className="mt-4 text-3xl font-bold text-foreground">{value}</div>
      {hint && <div className="mt-2 text-xs text-muted-foreground">{hint}</div>}
    </Card>
  );
}
