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
    <div className={cn("glass-card rounded-2xl p-6", className)}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display font-semibold text-lg">
            Eficácia ao Longo do Tempo
          </h3>
          <p className="text-sm text-muted-foreground">
            Análise dos últimos 7 dias
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-chart-efficacy" />
            <span className="text-muted-foreground">Eficácia (%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-chart-dose" />
            <span className="text-muted-foreground">Dose (mg)</span>
          </div>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.75rem",
                boxShadow: "0 10px 25px -5px hsl(var(--primary) / 0.1)",
              }}
              labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
            />
            <Area
              type="monotone"
              dataKey="efficacy"
              stroke="hsl(var(--chart-efficacy))"
              strokeWidth={2}
              fill="url(#efficacyGradient)"
              name="Eficácia"
            />
            <Area
              type="monotone"
              dataKey="dose"
              stroke="hsl(var(--chart-dose))"
              strokeWidth={2}
              fill="url(#doseGradient)"
              name="Dose"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
