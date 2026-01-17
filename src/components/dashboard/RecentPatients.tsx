import { User, ChevronRight, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EfficacyRing } from "./EfficacyRing";

interface Patient {
  id: string;
  name: string;
  age: number;
  lastDose: string;
  medication: string;
  efficacy: number;
}

interface RecentPatientsProps {
  patients: Patient[];
  className?: string;
}

export function RecentPatients({ patients, className }: RecentPatientsProps) {
  return (
    <div className={cn("glass-card rounded-2xl p-6", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-lg">
          Pacientes Recentes
        </h3>
        <Button variant="ghost" size="sm" className="text-primary">
          Ver todos
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      <div className="space-y-3">
        {patients.map((patient) => (
          <div
            key={patient.id}
            className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-neuro-gradient flex items-center justify-center">
              <User className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{patient.name}</p>
              <p className="text-xs text-muted-foreground">
                {patient.age} anos • {patient.medication}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs text-muted-foreground">Última dose</p>
                <p className="text-sm font-medium">{patient.lastDose}</p>
              </div>
              <EfficacyRing value={patient.efficacy} size="sm" showLabel={false} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
