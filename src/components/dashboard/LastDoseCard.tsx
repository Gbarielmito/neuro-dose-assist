import { Clock, Pill, AlertTriangle, Activity } from "lucide-react";
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
    <div className={cn("glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 overflow-hidden relative", className)}>
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

      {/* Header */}
      <div className="flex items-start justify-between mb-4 sm:mb-5 relative z-10">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/10 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5 text-teal-500" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">
              Última Dose Registrada
            </h3>
            <div className="flex items-center gap-2">
              <Pill className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
              <span className="font-display font-semibold text-base sm:text-lg truncate">{medication}</span>
            </div>
          </div>
        </div>
        <EfficacyRing value={efficacy} size="md" />
      </div>

      {/* Details */}
      <div className="space-y-3 relative z-10">
        <div className="flex items-center justify-between text-sm p-2.5 sm:p-3 rounded-lg bg-muted/30">
          <span className="text-muted-foreground">Dosagem</span>
          <span className="font-medium">{dose}</span>
        </div>
        <div className="flex items-center justify-between text-sm p-2.5 sm:p-3 rounded-lg bg-muted/30">
          <span className="text-muted-foreground">Horário</span>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{time}</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm p-2.5 sm:p-3 rounded-lg bg-muted/30">
          <span className="text-muted-foreground text-xs sm:text-sm">Risco Efeito Colateral</span>
          <div
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-full border",
              risk.bg,
              risk.border
            )}
          >
            <AlertTriangle className={cn("w-3 h-3 sm:w-3.5 sm:h-3.5", risk.text)} />
            <span className={cn("text-xs font-medium", risk.text)}>
              {risk.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
