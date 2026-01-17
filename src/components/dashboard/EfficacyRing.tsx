import { cn } from "@/lib/utils";

interface EfficacyRingProps {
  value: number; // 0-100
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function EfficacyRing({
  value,
  size = "md",
  showLabel = true,
  className,
}: EfficacyRingProps) {
  const sizes = {
    sm: { width: 60, stroke: 6 },
    md: { width: 80, stroke: 8 },
    lg: { width: 120, stroke: 10 },
  };

  const { width, stroke } = sizes[size];
  const radius = (width - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = ((100 - value) / 100) * circumference;

  // Color based on efficacy
  const getColor = (val: number) => {
    if (val >= 70) return "hsl(var(--success))";
    if (val >= 40) return "hsl(var(--warning))";
    return "hsl(var(--destructive))";
  };

  return (
    <div className={cn("efficacy-ring relative", className)} style={{ width, height: width }}>
      <svg width={width} height={width} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={width / 2}
          cy={width / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={stroke}
        />
        {/* Progress circle */}
        <circle
          cx={width / 2}
          cy={width / 2}
          r={radius}
          fill="none"
          stroke={getColor(value)}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          className="transition-all duration-700 ease-out"
          style={{
            filter: `drop-shadow(0 0 6px ${getColor(value)})`,
          }}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-display font-bold">{value}%</span>
          {size !== "sm" && (
            <span className="text-xs text-muted-foreground">Eficácia</span>
          )}
        </div>
      )}
    </div>
  );
}
