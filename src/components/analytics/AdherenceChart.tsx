import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface AdherenceChartProps {
    value: number;
    size?: "sm" | "md" | "lg";
    showLabel?: boolean;
    trend?: "up" | "down" | "stable";
    className?: string;
}

export function AdherenceChart({
    value,
    size = "md",
    showLabel = true,
    trend,
    className
}: AdherenceChartProps) {
    const sizeClasses = {
        sm: { container: "w-24 h-24", text: "text-xl", label: "text-xs" },
        md: { container: "w-36 h-36", text: "text-3xl", label: "text-sm" },
        lg: { container: "w-48 h-48", text: "text-4xl", label: "text-base" }
    };

    const { container, text, label } = sizeClasses[size];

    // Calcula a porcentagem do círculo a ser preenchida
    const circumference = 2 * Math.PI * 45; // raio = 45
    const strokeDashoffset = circumference - (value / 100) * circumference;

    // Determina a cor baseada no valor
    const getColor = () => {
        if (value >= 80) return "stroke-success";
        if (value >= 60) return "stroke-warning";
        return "stroke-destructive";
    };

    const getGradientId = () => {
        if (value >= 80) return "adherence-gradient-success";
        if (value >= 60) return "adherence-gradient-warning";
        return "adherence-gradient-danger";
    };

    return (
        <div className={cn("relative flex items-center justify-center", container, className)}>
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <defs>
                    <linearGradient id="adherence-gradient-success" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="hsl(var(--success))" />
                        <stop offset="100%" stopColor="hsl(var(--primary))" />
                    </linearGradient>
                    <linearGradient id="adherence-gradient-warning" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="hsl(var(--warning))" />
                        <stop offset="100%" stopColor="hsl(var(--warning) / 0.7)" />
                    </linearGradient>
                    <linearGradient id="adherence-gradient-danger" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="hsl(var(--destructive))" />
                        <stop offset="100%" stopColor="hsl(var(--destructive) / 0.7)" />
                    </linearGradient>
                </defs>

                {/* Background circle */}
                <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    strokeWidth="8"
                    className="stroke-muted"
                />

                {/* Progress circle */}
                <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    strokeWidth="8"
                    strokeLinecap="round"
                    stroke={`url(#${getGradientId()})`}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-700 ease-out"
                />
            </svg>

            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={cn("font-display font-bold tabular-nums", text)}>
                    {value}%
                </span>
                {showLabel && (
                    <div className="flex items-center gap-1 mt-1">
                        <span className={cn("text-muted-foreground", label)}>Adesão</span>
                        {trend && (
                            <span className="ml-1">
                                {trend === "up" && <TrendingUp className="w-4 h-4 text-success" />}
                                {trend === "down" && <TrendingDown className="w-4 h-4 text-destructive" />}
                                {trend === "stable" && <Minus className="w-4 h-4 text-muted-foreground" />}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
