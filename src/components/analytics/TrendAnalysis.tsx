import { cn } from "@/lib/utils";
import { TrendDataPoint } from "@/lib/analytics";
import { Activity, Brain, Zap } from "lucide-react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from "recharts";

interface TrendAnalysisProps {
    data: TrendDataPoint[];
    className?: string;
    showLegend?: boolean;
    height?: number;
}

export function TrendAnalysis({
    data,
    className,
    showLegend = true,
    height = 300
}: TrendAnalysisProps) {
    if (data.length === 0) {
        return (
            <div className={cn("glass-card rounded-2xl p-6", className)}>
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Activity className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="font-display font-semibold text-lg">Análise de Tendências</h3>
                </div>
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Activity className="w-12 h-12 mb-3 opacity-50" />
                    <p className="text-sm font-medium">Dados insuficientes para análise</p>
                    <p className="text-xs mt-1">Registre mais doses para ver tendências</p>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("glass-card rounded-2xl p-6", className)}>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Activity className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-display font-semibold text-lg">Análise de Tendências</h3>
                        <p className="text-xs text-muted-foreground">Últimos {data.length} registros</p>
                    </div>
                </div>

                {/* Legend indicators */}
                <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-primary" />
                        <span className="text-muted-foreground">Eficácia</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-info" />
                        <span className="text-muted-foreground">Humor</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-warning" />
                        <span className="text-muted-foreground">Energia</span>
                    </div>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={height}>
                <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <defs>
                        <linearGradient id="efficacyGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                    </defs>

                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                        vertical={false}
                    />

                    <XAxis
                        dataKey="date"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                    />

                    <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        domain={[0, 100]}
                        tickFormatter={(value) => `${value}%`}
                    />

                    <Tooltip
                        contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "12px",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                        }}
                        labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                        formatter={(value: number, name: string) => {
                            const labels: Record<string, string> = {
                                efficacy: "Eficácia",
                                mood: "Humor",
                                energy: "Energia"
                            };
                            return [`${Math.round(value)}%`, labels[name] || name];
                        }}
                    />

                    <Line
                        type="monotone"
                        dataKey="efficacy"
                        stroke="hsl(var(--primary))"
                        strokeWidth={3}
                        dot={{ fill: "hsl(var(--primary))", strokeWidth: 0, r: 4 }}
                        activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
                    />

                    <Line
                        type="monotone"
                        dataKey="mood"
                        stroke="hsl(var(--info))"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ fill: "hsl(var(--info))", strokeWidth: 0, r: 3 }}
                        activeDot={{ r: 5, fill: "hsl(var(--info))" }}
                    />

                    <Line
                        type="monotone"
                        dataKey="energy"
                        stroke="hsl(var(--warning))"
                        strokeWidth={2}
                        strokeDasharray="3 3"
                        dot={{ fill: "hsl(var(--warning))", strokeWidth: 0, r: 3 }}
                        activeDot={{ r: 5, fill: "hsl(var(--warning))" }}
                    />
                </LineChart>
            </ResponsiveContainer>

            {/* Summary stats below chart */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-border">
                <div className="text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                        <Activity className="w-4 h-4 text-primary" />
                        <span className="text-xs font-medium text-muted-foreground">Eficácia Média</span>
                    </div>
                    <p className="text-xl font-display font-bold text-primary">
                        {Math.round(data.reduce((a, b) => a + b.efficacy, 0) / data.length)}%
                    </p>
                </div>
                <div className="text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                        <Brain className="w-4 h-4 text-info" />
                        <span className="text-xs font-medium text-muted-foreground">Humor Médio</span>
                    </div>
                    <p className="text-xl font-display font-bold text-info">
                        {Math.round(data.reduce((a, b) => a + b.mood, 0) / data.length)}%
                    </p>
                </div>
                <div className="text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                        <Zap className="w-4 h-4 text-warning" />
                        <span className="text-xs font-medium text-muted-foreground">Energia Média</span>
                    </div>
                    <p className="text-xl font-display font-bold text-warning">
                        {Math.round(data.reduce((a, b) => a + b.energy, 0) / data.length)}%
                    </p>
                </div>
            </div>
        </div>
    );
}
