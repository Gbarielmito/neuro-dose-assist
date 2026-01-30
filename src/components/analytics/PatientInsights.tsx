import { cn } from "@/lib/utils";
import { PatientAnalytics } from "@/lib/analytics";
import {
    User,
    TrendingUp,
    TrendingDown,
    Minus,
    Clock,
    Activity,
    Brain,
    Zap,
    AlertTriangle,
    CheckCircle2,
    Shield
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PatientInsightsProps {
    analytics: PatientAnalytics[];
    className?: string;
    maxVisible?: number;
}

const trendIcons = {
    improving: TrendingUp,
    declining: TrendingDown,
    stable: Minus
};

const trendColors = {
    improving: "text-success",
    declining: "text-destructive",
    stable: "text-muted-foreground"
};

const riskColors = {
    low: { bg: "bg-success/10", border: "border-success/20", text: "text-success", icon: CheckCircle2 },
    medium: { bg: "bg-warning/10", border: "border-warning/20", text: "text-warning", icon: AlertTriangle },
    high: { bg: "bg-destructive/10", border: "border-destructive/20", text: "text-destructive", icon: Shield }
};

export function PatientInsights({
    analytics,
    className,
    maxVisible = 6
}: PatientInsightsProps) {
    const visiblePatients = analytics.slice(0, maxVisible);

    if (analytics.length === 0) {
        return (
            <div className={cn("glass-card rounded-2xl p-6", className)}>
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center">
                        <User className="w-4 h-4 text-info" />
                    </div>
                    <h3 className="font-display font-semibold text-lg">Insights por Paciente</h3>
                </div>
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <User className="w-12 h-12 mb-3 opacity-50" />
                    <p className="text-sm font-medium">Nenhum paciente com dados</p>
                    <p className="text-xs mt-1">Registre doses para ver insights</p>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("glass-card rounded-2xl p-6", className)}>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center">
                        <User className="w-4 h-4 text-info" />
                    </div>
                    <div>
                        <h3 className="font-display font-semibold text-lg">Insights por Paciente</h3>
                        <p className="text-xs text-muted-foreground">{analytics.length} pacientes analisados</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {visiblePatients.map((patient) => {
                    const TrendIcon = trendIcons[patient.trend];
                    const riskStyle = riskColors[patient.riskLevel];
                    const RiskIcon = riskStyle.icon;

                    return (
                        <div
                            key={patient.patientId}
                            className={cn(
                                "p-4 rounded-xl border-2 transition-all hover:shadow-md hover:scale-[1.01]",
                                riskStyle.bg,
                                riskStyle.border
                            )}
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                                        <User className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm truncate max-w-[120px]">
                                            {patient.patientName}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {patient.totalDoses} doses
                                        </p>
                                    </div>
                                </div>
                                <div className={cn("p-1.5 rounded-lg", riskStyle.bg)}>
                                    <RiskIcon className={cn("w-4 h-4", riskStyle.text)} />
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="space-y-2 mb-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="flex items-center gap-1.5 text-muted-foreground">
                                        <Activity className="w-3.5 h-3.5" />
                                        Eficácia
                                    </span>
                                    <span className={cn(
                                        "font-semibold",
                                        patient.avgEfficacy >= 70 ? "text-success" :
                                            patient.avgEfficacy >= 50 ? "text-warning" : "text-destructive"
                                    )}>
                                        {patient.avgEfficacy}%
                                    </span>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <span className="flex items-center gap-1.5 text-muted-foreground">
                                        <Brain className="w-3.5 h-3.5" />
                                        Humor
                                    </span>
                                    <span className="font-semibold">{patient.avgMood}/5</span>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <span className="flex items-center gap-1.5 text-muted-foreground">
                                        <Zap className="w-3.5 h-3.5" />
                                        Adesão
                                    </span>
                                    <span className={cn(
                                        "font-semibold",
                                        patient.adherenceRate >= 80 ? "text-success" :
                                            patient.adherenceRate >= 60 ? "text-warning" : "text-destructive"
                                    )}>
                                        {patient.adherenceRate}%
                                    </span>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="pt-3 border-t border-border/50 flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <TrendIcon className={cn("w-3.5 h-3.5", trendColors[patient.trend])} />
                                    <span className={trendColors[patient.trend]}>
                                        {patient.trend === "improving" ? "Melhorando" :
                                            patient.trend === "declining" ? "Declinando" : "Estável"}
                                    </span>
                                </div>

                                {patient.bestDoseTime && (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Clock className="w-3 h-3" />
                                        <span>{patient.bestDoseTime}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {analytics.length > maxVisible && (
                <p className="text-sm text-center text-muted-foreground mt-4">
                    +{analytics.length - maxVisible} outros pacientes
                </p>
            )}
        </div>
    );
}
