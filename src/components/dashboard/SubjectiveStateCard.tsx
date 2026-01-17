import { Smile, Battery, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubjectiveStateCardProps {
  mood: number; // 1-5
  energy: number; // 0-10
  sleep: number; // 0-10
  className?: string;
}

function MoodEmoji({ value }: { value: number }) {
  const moods = [
    { emoji: "😞", label: "Muito baixo", color: "text-destructive" },
    { emoji: "😔", label: "Baixo", color: "text-warning" },
    { emoji: "😐", label: "Neutro", color: "text-muted-foreground" },
    { emoji: "🙂", label: "Bom", color: "text-success" },
    { emoji: "😊", label: "Ótimo", color: "text-success" },
  ];
  const mood = moods[Math.min(value - 1, 4)];
  return (
    <div className="flex items-center gap-2">
      <span className="text-2xl">{mood.emoji}</span>
      <span className={cn("text-sm font-medium", mood.color)}>{mood.label}</span>
    </div>
  );
}

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const percentage = (value / max) * 100;
  return (
    <div className="h-2 bg-muted rounded-full overflow-hidden">
      <div
        className={cn("h-full rounded-full transition-all duration-500", color)}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

export function SubjectiveStateCard({
  mood,
  energy,
  sleep,
  className,
}: SubjectiveStateCardProps) {
  return (
    <div className={cn("glass-card rounded-2xl p-6", className)}>
      <h3 className="text-sm font-medium text-muted-foreground mb-4">
        Estado Subjetivo Atual
      </h3>

      <div className="space-y-5">
        {/* Mood */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Smile className="w-4 h-4" />
              <span>Humor</span>
            </div>
            <MoodEmoji value={mood} />
          </div>
        </div>

        {/* Energy */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Battery className="w-4 h-4" />
              <span>Energia</span>
            </div>
            <span className="font-medium">{energy}/10</span>
          </div>
          <ProgressBar
            value={energy}
            max={10}
            color={energy >= 7 ? "bg-success" : energy >= 4 ? "bg-warning" : "bg-destructive"}
          />
        </div>

        {/* Sleep */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Moon className="w-4 h-4" />
              <span>Qualidade do Sono</span>
            </div>
            <span className="font-medium">{sleep}/10</span>
          </div>
          <ProgressBar
            value={sleep}
            max={10}
            color={sleep >= 7 ? "bg-success" : sleep >= 4 ? "bg-warning" : "bg-destructive"}
          />
        </div>
      </div>
    </div>
  );
}
