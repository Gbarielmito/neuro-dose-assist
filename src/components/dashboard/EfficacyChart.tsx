import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";
import { TrendingUp } from "lucide-react";

interface DataPoint {
  date: string;
  efficacy: number;
  dose: number;
}

interface EfficacyChartProps {
  data: DataPoint[];
  className?: string;
}

export function EfficacyChart({ data, className }: EfficacyChartProps) {
  return (
    <div className={cn("glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-base sm:text-lg">
              Eficácia ao Longo do Tempo
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Análise dos últimos 7 dias
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-chart-efficacy" />
            <span className="text-muted-foreground">Eficácia</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-chart-dose" />
            <span className="text-muted-foreground">Dose</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-48 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="efficacyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-efficacy))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--chart-efficacy))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="doseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-dose))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--chart-dose))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              domain={[0, 100]}
              width={35}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.75rem",
                boxShadow: "0 10px 25px -5px hsl(var(--primary) / 0.1)",
                padding: "12px",
              }}
              labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600, marginBottom: "4px" }}
              itemStyle={{ padding: "2px 0" }}
            />
            <Area
              type="monotone"
              dataKey="efficacy"
              stroke="hsl(var(--chart-efficacy))"
              strokeWidth={2}
              fill="url(#efficacyGradient)"
              name="Eficácia (%)"
            />
            <Area
              type="monotone"
              dataKey="dose"
              stroke="hsl(var(--chart-dose))"
              strokeWidth={2}
              fill="url(#doseGradient)"
              name="Dose (mg)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
