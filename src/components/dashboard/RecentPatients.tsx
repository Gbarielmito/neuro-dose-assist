import { User, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EfficacyRing } from "./EfficacyRing";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Patient {
  id: string;
  name: string;
  age: number;
  lastDose: string;
  medication: string;

  efficacy: number;
  photoURL?: string;
}

interface RecentPatientsProps {
  patients: Patient[];
  className?: string;
}

export function RecentPatients({ patients, className }: RecentPatientsProps) {
  const navigate = useNavigate();
  return (
    <div className={cn("glass-card rounded-2xl p-6", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-lg">
          Pacientes Recentes
        </h3>
        <Button variant="ghost" size="sm" className="text-primary" onClick={() => navigate("/patients")}>
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
            <Avatar className="w-10 h-10">
              <AvatarImage src={patient.photoURL} alt={patient.name} />
              <AvatarFallback className="bg-neuro-gradient">
                <User className="w-5 h-5 text-primary-foreground" />
              </AvatarFallback>
            </Avatar>
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
