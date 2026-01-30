import { cn } from "@/lib/utils";
import { PredictiveInsights } from "@/lib/analytics";
import {
    Brain,
    TrendingUp,
    Shield,
    Sparkles,
    Lightbulb,
    Calendar,
    AlertTriangle,
    CheckCircle2
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    ResponsiveContainer,
    Cell,
    Tooltip
} from "recharts";

interface PredictiveCardProps {
    insights: PredictiveInsights;
    className?: string;
}

export function PredictiveCard({ insights, className }: PredictiveCardProps) {
    const getRiskColor = (score: number) => {
        if (score < 30) return "text-success";
        if (score < 60) return "text-warning";
        return "text-destructive";
    };

    const getRiskBg = (score: number) => {
        if (score < 30) return "bg-success/10 border-success/20";
        if (score < 60) return "bg-warning/10 border-warning/20";
        return "bg-destructive/10 border-destructive/20";
    };

    const getRiskLabel = (score: number) => {
        if (score < 30) return "Baixo";
        if (score < 60) return "Moderado";
        return "Elevado";
    };

    const getBarColor = (efficacy: number) => {
        if (efficacy >= 80) return "hsl(var(--success))";
        if (efficacy >= 60) return "hsl(var(--primary))";
        if (efficacy >= 40) return "hsl(var(--warning))";
        return "hsl(var(--destructive))";
    };

    return (
        <div className={cn("glass-card rounded-2xl p-6", className)}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-neuro-gradient flex items-center justify-center">
                        <Brain className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <div>
                        <h3 className="font-display font-semibold text-lg">Previsões de IA</h3>
                        <p className="text-xs text-muted-foreground">Análise preditiva baseada em dados</p>
                    </div>
                </div>
                <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            </div>

            {/* Main metrics */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Adherence Prediction */}
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        <span className="text-xs font-medium text-muted-foreground">Previsão de Adesão</span>
                    </div>
                    <p className={cn(
                        "text-3xl font-display font-bold",
                        insights.adherencePrediction >= 80 ? "text-success" :
                            insights.adherencePrediction >= 60 ? "text-primary" : "text-warning"
                    )}>
                        {insights.adherencePrediction}%
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">próximos 7 dias</p>
                </div>

                {/* Risk Score */}
                <div className={cn(
                    "p-4 rounded-xl border",
                    getRiskBg(insights.riskScore)
                )}>
                    <div className="flex items-center gap-2 mb-2">
                        <Shield className={cn("w-4 h-4", getRiskColor(insights.riskScore))} />
                        <span className="text-xs font-medium text-muted-foreground">Score de Risco</span>
                    </div>
                    <p className={cn("text-3xl font-display font-bold", getRiskColor(insights.riskScore))}>
                        {insights.riskScore}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Nível: {getRiskLabel(insights.riskScore)}
                    </p>
                </div>
            </div>

            {/* Weekly Forecast Chart */}
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold">Previsão Semanal de Eficácia</span>
                </div>

                <ResponsiveContainer width="100%" height={120}>
                    <BarChart data={insights.weeklyForecast} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                        <XAxis
                            dataKey="day"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                        />
                        <YAxis hide domain={[0, 100]} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "hsl(var(--card))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "8px",
                                fontSize: 12
                            }}
                            formatter={(value: number) => [`${value}%`, "Eficácia"]}
                            labelFormatter={(label) => `${label}`}
                        />
                        <Bar dataKey="predictedEfficacy" radius={[4, 4, 0, 0]}>
                            {insights.weeklyForecast.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={getBarColor(entry.predictedEfficacy)}
                                    opacity={0.9}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Suggested Adjustment */}
            {insights.suggestedDoseAdjustment && (
                <div className="p-4 rounded-xl bg-neuro-gradient-subtle border border-primary/20 mb-4">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <AlertTriangle className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold mb-1">Sugestão de Ajuste</p>
                            <p className="text-xs text-muted-foreground">
                                {insights.suggestedDoseAdjustment}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* AI Insights */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-4 h-4 text-warning" />
                    <span className="text-sm font-semibold">Insights da IA</span>
                </div>

                <div className="space-y-2">
                    {insights.insights.map((insight, index) => (
                        <div
                            key={index}
                            className="flex items-start gap-2 p-3 rounded-lg bg-muted/30 border border-border/50"
                        >
                            <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-muted-foreground">{insight}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
