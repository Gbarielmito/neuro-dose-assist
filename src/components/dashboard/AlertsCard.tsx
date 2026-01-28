import { AlertTriangle, TrendingDown, Clock, ChevronRight, Bell } from "lucide-react";
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
      iconBg: "bg-warning/20",
    },
    danger: {
      bg: "bg-destructive/10",
      border: "border-destructive/20",
      icon: "text-destructive",
      iconBg: "bg-destructive/20",
    },
    info: {
      bg: "bg-info/10",
      border: "border-info/20",
      icon: "text-info",
      iconBg: "bg-info/20",
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

  const dangerCount = alerts.filter(a => a.type === "danger").length;
  const warningCount = alerts.filter(a => a.type === "warning").length;

  return (
    <div className={cn("glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 flex items-center justify-center">
            <Bell className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-base sm:text-lg">
              Alertas
            </h3>
            <p className="text-xs text-muted-foreground">
              {dangerCount > 0 && `${dangerCount} crítico${dangerCount > 1 ? 's' : ''}`}
              {dangerCount > 0 && warningCount > 0 && ' • '}
              {warningCount > 0 && `${warningCount} aviso${warningCount > 1 ? 's' : ''}`}
              {dangerCount === 0 && warningCount === 0 && 'Nenhum alerta crítico'}
            </p>
          </div>
        </div>
        <span className={cn(
          "px-2.5 py-1 rounded-full text-xs font-medium",
          dangerCount > 0
            ? "bg-destructive/10 text-destructive"
            : warningCount > 0
              ? "bg-warning/10 text-warning"
              : "bg-success/10 text-success"
        )}>
          {alerts.length}
        </span>
      </div>

      {/* Alert list */}
      <div className="space-y-2 sm:space-y-3">
        {alerts.map((alert, index) => {
          const styles = typeStyles[alert.type];
          const Icon = getIcon(alert.type);

          return (
            <div
              key={alert.id}
              className={cn(
                "p-3 sm:p-4 rounded-xl border transition-all duration-200 hover:shadow-md cursor-pointer group",
                styles.bg,
                styles.border
              )}
              onClick={() => navigate('/history')}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start gap-3">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", styles.iconBg)}>
                  <Icon className={cn("w-4 h-4", styles.icon)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{alert.title}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 line-clamp-2">
                    {alert.description}
                  </p>
                  <span className="text-xs text-muted-foreground mt-1.5 block">
                    {alert.time}
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          );
        })}
      </div>

      <Button
        variant="ghost"
        className="w-full mt-4 text-primary hover:text-primary/80"
        onClick={() => navigate('/history')}
      >
        <span className="text-sm">Ver todos os alertas</span>
        <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );
}
