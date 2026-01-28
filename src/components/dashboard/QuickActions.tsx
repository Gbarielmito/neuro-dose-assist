import { Plus, History, FileText, Brain, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export function QuickActions() {
  const actions = [
    {
      icon: Plus,
      label: "Registrar Dose",
      description: "Nova entrada",
      href: "/dose",
      gradient: "from-teal-500 to-cyan-500",
      bgGlow: "bg-teal-500/20",
      primary: true,
    },
    {
      icon: Brain,
      label: "Consultar IA",
      description: "Recomendações",
      href: "/dose",
      gradient: "from-violet-500 to-purple-500",
      bgGlow: "bg-violet-500/10",
    },
    {
      icon: History,
      label: "Histórico",
      description: "Ver registros",
      href: "/history",
      gradient: "from-blue-500 to-indigo-500",
      bgGlow: "bg-blue-500/10",
    },
    {
      icon: FileText,
      label: "Relatório",
      description: "Exportar PDF",
      href: "/reports",
      gradient: "from-amber-500 to-orange-500",
      bgGlow: "bg-amber-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {actions.map((action) => (
        <Link key={action.label} to={action.href} className="group">
          <div
            className={cn(
              "relative overflow-hidden rounded-xl sm:rounded-2xl p-4 sm:p-5 transition-all duration-300",
              "border border-border/50 hover:border-border",
              "hover:shadow-lg hover:-translate-y-0.5",
              action.primary
                ? "bg-gradient-to-br from-slate-900 to-slate-800 border-white/10"
                : "bg-card"
            )}
          >
            {/* Background glow */}
            <div className={cn(
              "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
              action.bgGlow
            )} />

            {/* Icon with gradient */}
            <div className={cn(
              "w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4 transition-transform duration-300 group-hover:scale-110",
              action.primary ? "bg-white/10" : "bg-muted/50"
            )}>
              <action.icon className={cn(
                "w-5 h-5 sm:w-6 sm:h-6",
                action.primary
                  ? "text-white"
                  : `bg-gradient-to-br ${action.gradient} bg-clip-text text-transparent`
              )}
                style={!action.primary ? {
                  background: `linear-gradient(to bottom right, var(--tw-gradient-from), var(--tw-gradient-to))`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                } : undefined}
              />
            </div>

            {/* Text */}
            <div className="relative z-10">
              <div className="flex items-center justify-between gap-2">
                <h3 className={cn(
                  "font-semibold text-sm sm:text-base",
                  action.primary ? "text-white" : "text-foreground"
                )}>
                  {action.label}
                </h3>
                <ArrowRight className={cn(
                  "w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300",
                  action.primary ? "text-white/60" : "text-muted-foreground"
                )} />
              </div>
              <p className={cn(
                "text-xs sm:text-sm mt-0.5",
                action.primary ? "text-white/60" : "text-muted-foreground"
              )}>
                {action.description}
              </p>
            </div>

            {/* Primary action indicator */}
            {action.primary && (
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-teal-500/30 to-cyan-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
