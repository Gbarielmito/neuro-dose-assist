import { Clock, Pill, AlertTriangle } from "lucide-react";
import { EfficacyRing } from "./EfficacyRing";
import { cn } from "@/lib/utils";

interface LastDoseCardProps {
  medication: string;
  dose: string;
  time: string;
  efficacy: number;
  riskLevel: "low" | "medium" | "high";
  className?: string;
}

export function LastDoseCard({
  medication,
  dose,
  time,
  efficacy,
  riskLevel,
  className,
}: LastDoseCardProps) {
  const riskStyles = {
    low: {
      bg: "bg-success/10",
      text: "text-success",
      border: "border-success/20",
      label: "Risco Baixo",
    },
    medium: {
      bg: "bg-warning/10",
      text: "text-warning",
      border: "border-warning/20",
      label: "Risco Moderado",
    },
    high: {
      bg: "bg-destructive/10",
      text: "text-destructive",
      border: "border-destructive/20",
      label: "Risco Alto",
    },
  };

  const risk = riskStyles[riskLevel];

  return (
    <div className={cn("glass-card rounded-2xl p-6", className)}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">
            Última Dose Registrada
          </h3>
          <div className="flex items-center gap-2">
            <Pill className="w-5 h-5 text-primary" />
            <span className="font-display font-semibold text-lg">{medication}</span>
          </div>
        </div>
        <EfficacyRing value={efficacy} size="md" />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Dosagem</span>
          <span className="font-medium">{dose}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Horário</span>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{time}</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Risco de Efeito Colateral</span>
          <div
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-full border",
              risk.bg,
              risk.border
            )}
          >
            <AlertTriangle className={cn("w-3.5 h-3.5", risk.text)} />
            <span className={cn("text-xs font-medium", risk.text)}>
              {risk.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
