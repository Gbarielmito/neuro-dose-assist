import { useState } from "react";
import { cn } from "@/lib/utils";
import { RiskAlert } from "@/lib/analytics";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    AlertTriangle,
    TrendingDown,
    Clock,
    Activity,
    Brain,
    CheckCircle2,
    XCircle,
    ChevronRight,
    User,
    ShieldAlert,
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

function AlertCard({ alert }: { alert: RiskAlert }) {
    const Icon = riskIcons[alert.type];
    const style = severityStyles[alert.severity];

    return (
        <div
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
                    <div className="flex items-center gap-1.5 mt-1.5">
                        <User className="w-3 h-3 text-muted-foreground" />
                        <p className="text-xs font-medium text-muted-foreground">
                            {alert.patientName}
                        </p>
                    </div>
                )}
            </div>

            <span className="text-xs text-muted-foreground flex-shrink-0">
                {format(new Date(alert.timestamp), "HH:mm", { locale: ptBR })}
            </span>
        </div>
    );
}

export function RiskIndicators({
    alerts,
    className,
    maxVisible = 5
}: RiskIndicatorsProps) {
    const [isAllAlertsOpen, setIsAllAlertsOpen] = useState(false);
    const visibleAlerts = alerts.slice(0, maxVisible);
    const hasMore = alerts.length > maxVisible;
    const remainingCount = alerts.length - maxVisible;

    const highCount = alerts.filter(a => a.severity === "high").length;
    const mediumCount = alerts.filter(a => a.severity === "medium").length;
    const lowCount = alerts.filter(a => a.severity === "low").length;

    return (
        <>
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
                            {highCount > 0
                                ? `${highCount} crítico(s)`
                                : mediumCount > 0
                                    ? `${mediumCount} médio(s)`
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
                        {visibleAlerts.map((alert) => (
                            <AlertCard key={alert.id} alert={alert} />
                        ))}

                        {hasMore && (
                            <button
                                onClick={() => setIsAllAlertsOpen(true)}
                                className={cn(
                                    "w-full flex items-center justify-center gap-2 pt-3 pb-1",
                                    "text-sm font-medium text-primary",
                                    "hover:text-primary/80 transition-colors",
                                    "cursor-pointer group"
                                )}
                            >
                                <span>+{remainingCount} {remainingCount === 1 ? "outro alerta" : "outros alertas"}</span>
                                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Modal com todos os alertas */}
            <Dialog open={isAllAlertsOpen} onOpenChange={setIsAllAlertsOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
                    {/* Header com gradiente */}
                    <div className="px-6 pt-6 pb-4 border-b border-border/50 bg-gradient-to-b from-destructive/5 to-transparent">
                        <DialogHeader>
                            <div className="flex items-center gap-3 mb-1">
                                <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                                    <ShieldAlert className="w-5 h-5 text-destructive" />
                                </div>
                                <div>
                                    <DialogTitle className="font-display text-xl">
                                        Todos os Alertas
                                    </DialogTitle>
                                    <DialogDescription className="text-sm">
                                        {alerts.length} {alerts.length === 1 ? "alerta identificado" : "alertas identificados"} no sistema
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        {/* Resumo de severidades */}
                        <div className="flex items-center gap-2 mt-4">
                            {highCount > 0 && (
                                <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-xs">
                                    {highCount} Crítico{highCount > 1 ? "s" : ""}
                                </Badge>
                            )}
                            {mediumCount > 0 && (
                                <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20 text-xs">
                                    {mediumCount} Médio{mediumCount > 1 ? "s" : ""}
                                </Badge>
                            )}
                            {lowCount > 0 && (
                                <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 text-xs">
                                    {lowCount} Baixo{lowCount > 1 ? "s" : ""}
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Lista de alertas scrollável */}
                    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                        {alerts.map((alert) => (
                            <AlertCard key={alert.id} alert={alert} />
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-border/50 bg-muted/30">
                        <Button
                            variant="outline"
                            className="w-full h-11"
                            onClick={() => setIsAllAlertsOpen(false)}
                        >
                            Fechar
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
