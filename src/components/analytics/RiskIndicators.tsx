import { cn } from "@/lib/utils";
import { RiskAlert } from "@/lib/analytics";
import {
    AlertTriangle,
    TrendingDown,
    Clock,
    Activity,
    Brain,
    CheckCircle2,
    XCircle
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface RiskIndicatorsProps {
    alerts: RiskAlert[];
    className?: string;
    maxVisible?: number;
}

const riskIcons = {
    low_efficacy: Activity,
    low_mood: Brain,
    irregular_doses: Clock,
    low_adherence: AlertTriangle,
    declining_trend: TrendingDown
};

const riskLabels = {
    low_efficacy: "Eficácia Baixa",
    low_mood: "Humor Baixo",
    irregular_doses: "Doses Irregulares",
    low_adherence: "Adesão Baixa",
    declining_trend: "Tendência de Queda"
};

const severityStyles = {
    low: {
        bg: "bg-warning/10",
        border: "border-warning/20",
        icon: "text-warning",
        badge: "bg-warning/20 text-warning"
    },
    medium: {
        bg: "bg-orange-500/10",
        border: "border-orange-500/20",
        icon: "text-orange-500",
        badge: "bg-orange-500/20 text-orange-500"
    },
    high: {
        bg: "bg-destructive/10",
        border: "border-destructive/20",
        icon: "text-destructive",
        badge: "bg-destructive/20 text-destructive"
    }
};

export function RiskIndicators({
    alerts,
    className,
    maxVisible = 5
}: RiskIndicatorsProps) {
    const visibleAlerts = alerts.slice(0, maxVisible);
    const hasMore = alerts.length > maxVisible;

    return (
        <div className={cn("glass-card rounded-2xl p-6", className)}>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                        <AlertTriangle className="w-4 h-4 text-destructive" />
                    </div>
                    <div>
                        <h3 className="font-display font-semibold text-lg">Indicadores de Risco</h3>
                        <p className="text-xs text-muted-foreground">
                            {alerts.length} {alerts.length === 1 ? "alerta identificado" : "alertas identificados"}
                        </p>
                    </div>
                </div>

                {alerts.length > 0 && (
                    <div className={cn(
                        "px-3 py-1 rounded-full text-xs font-semibold",
                        alerts.some(a => a.severity === "high")
                            ? "bg-destructive/20 text-destructive"
                            : alerts.some(a => a.severity === "medium")
                                ? "bg-orange-500/20 text-orange-500"
                                : "bg-warning/20 text-warning"
                    )}>
                        {alerts.filter(a => a.severity === "high").length > 0
                            ? `${alerts.filter(a => a.severity === "high").length} crítico(s)`
                            : alerts.filter(a => a.severity === "medium").length > 0
                                ? `${alerts.filter(a => a.severity === "medium").length} médio(s)`
                                : "Apenas avisos"}
                    </div>
                )}
            </div>

            {alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
                        <CheckCircle2 className="w-8 h-8 text-success" />
                    </div>
                    <p className="font-medium text-success">Nenhum risco identificado</p>
                    <p className="text-sm text-muted-foreground mt-1">
                        Todos os indicadores estão dentro do esperado
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {visibleAlerts.map((alert) => {
                        const Icon = riskIcons[alert.type];
                        const style = severityStyles[alert.severity];

                        return (
                            <div
                                key={alert.id}
                                className={cn(
                                    "flex items-start gap-3 p-4 rounded-xl border-2 transition-all hover:scale-[1.01]",
                                    style.bg,
                                    style.border
                                )}
                            >
                                <div className={cn(
                                    "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                                    style.bg
                                )}>
                                    <Icon className={cn("w-5 h-5", style.icon)} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-semibold text-sm">
                                            {riskLabels[alert.type]}
                                        </span>
                                        <span className={cn(
                                            "px-2 py-0.5 rounded-full text-xs font-medium uppercase",
                                            style.badge
                                        )}>
                                            {alert.severity === "high" ? "Alto" : alert.severity === "medium" ? "Médio" : "Baixo"}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {alert.message}
                                    </p>
                                    {alert.patientName && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Paciente: {alert.patientName}
                                        </p>
                                    )}
                                </div>

                                <span className="text-xs text-muted-foreground flex-shrink-0">
                                    {format(new Date(alert.timestamp), "HH:mm", { locale: ptBR })}
                                </span>
                            </div>
                        );
                    })}

                    {hasMore && (
                        <p className="text-sm text-center text-muted-foreground pt-2">
                            +{alerts.length - maxVisible} outros alertas
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
