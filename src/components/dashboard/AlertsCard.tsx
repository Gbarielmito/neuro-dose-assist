import { AlertTriangle, TrendingDown, Clock, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface Alert {
  id: string;
  type: "warning" | "danger" | "info";
  title: string;
  description: string;
  time: string;
}

interface AlertsCardProps {
  alerts: Alert[];
  className?: string;
}

export function AlertsCard({ alerts, className }: AlertsCardProps) {
  const navigate = useNavigate();
  const typeStyles = {
    warning: {
      bg: "bg-warning/10",
      border: "border-warning/20",
      icon: "text-warning",
    },
    danger: {
      bg: "bg-destructive/10",
      border: "border-destructive/20",
      icon: "text-destructive",
    },
    info: {
      bg: "bg-info/10",
      border: "border-info/20",
      icon: "text-info",
    },
  };

  const getIcon = (type: Alert["type"]) => {
    switch (type) {
      case "warning":
        return TrendingDown;
      case "danger":
        return AlertTriangle;
      default:
        return Clock;
    }
  };

  return (
    <div className={cn("glass-card rounded-2xl p-6", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">
          Alertas e Recomendações
        </h3>
        <span className="px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-xs font-medium">
          {alerts.length} pendentes
        </span>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => {
          const styles = typeStyles[alert.type];
          const Icon = getIcon(alert.type);

          return (
            <div
              key={alert.id}
              className={cn(
                "p-4 rounded-xl border transition-all duration-200 hover:shadow-md cursor-pointer",
                styles.bg,
                styles.border
              )}
              onClick={() => navigate('/history')}
            >
              <div className="flex items-start gap-3">
                <div className={cn("mt-0.5", styles.icon)}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{alert.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                    {alert.description}
                  </p>
                  <span className="text-xs text-muted-foreground mt-1 block">
                    {alert.time}
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
              </div>
            </div>
          );
        })}
      </div>

      <Button variant="ghost" className="w-full mt-4 text-primary" onClick={() => navigate('/history')}>
        Ver todos os alertas
        <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );
}
