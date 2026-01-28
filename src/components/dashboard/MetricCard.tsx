import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: {
    value: number;
    label: string;
  };
  variant?: "default" | "success" | "warning" | "danger";
  className?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = "default",
  className,
}: MetricCardProps) {
  const variantStyles = {
    default: {
      accent: "from-primary/20 to-primary/5",
      iconBg: "bg-primary/10",
      iconText: "text-primary",
    },
    success: {
      accent: "from-success/20 to-success/5",
      iconBg: "bg-success/10",
      iconText: "text-success",
    },
    warning: {
      accent: "from-warning/20 to-warning/5",
      iconBg: "bg-warning/10",
      iconText: "text-warning",
    },
    danger: {
      accent: "from-destructive/20 to-destructive/5",
      iconBg: "bg-destructive/10",
      iconText: "text-destructive",
    },
  };

  const styles = variantStyles[variant];

  const TrendIcon = trend
    ? trend.value > 0
      ? TrendingUp
      : trend.value < 0
        ? TrendingDown
        : Minus
    : null;

  const trendColor = trend
    ? trend.value > 0
      ? "text-success"
      : trend.value < 0
        ? "text-destructive"
        : "text-muted-foreground"
    : "";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl sm:rounded-2xl bg-card border border-border/50 p-4 sm:p-6 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 group",
        className
      )}
    >
      {/* Gradient accent */}
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300", styles.accent)} />

      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="space-y-1 min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{title}</p>
            <p className="text-2xl sm:text-3xl font-display font-bold tracking-tight">
              {value}
            </p>
            {subtitle && (
              <p className="text-xs sm:text-sm text-muted-foreground truncate">{subtitle}</p>
            )}
          </div>
          <div className={cn(
            "w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110",
            styles.iconBg,
            styles.iconText
          )}>
            {icon}
          </div>
        </div>

        {trend && TrendIcon && (
          <div className={cn("flex items-center gap-1 mt-3 sm:mt-4 text-xs sm:text-sm", trendColor)}>
            <TrendIcon className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="font-medium">{Math.abs(trend.value)}%</span>
            <span className="text-muted-foreground truncate hidden sm:inline">{trend.label}</span>
          </div>
        )}
      </div>
    </div>
  );
}
