import { User, ChevronRight, UserCircle } from "lucide-react";
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
    <div className={cn("glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 flex items-center justify-center">
            <UserCircle className="w-5 h-5 text-violet-500" />
          </div>
          <h3 className="font-display font-semibold text-base sm:text-lg">
            Pacientes Recentes
          </h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-primary hover:text-primary/80 text-xs sm:text-sm"
          onClick={() => navigate("/patients")}
        >
          <span className="hidden sm:inline">Ver todos</span>
          <span className="sm:hidden">Ver</span>
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {/* Patient list */}
      <div className="space-y-2 sm:space-y-3">
        {patients.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <User className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm font-medium">Nenhum paciente cadastrado</p>
            <p className="text-xs mt-1">Adicione pacientes para visualizar aqui.</p>
          </div>
        ) : (
          patients.map((patient, index) => (
            <div
              key={patient.id}
              onClick={() => navigate("/patients")}
              className={cn(
                "flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all duration-200 cursor-pointer group",
                "border border-transparent hover:border-border/50"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Avatar */}
              <Avatar className="w-10 h-10 sm:w-12 sm:h-12 ring-2 ring-background shadow-sm">
                <AvatarImage src={patient.photoURL} alt={patient.name} />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-medium">
                  {patient.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm sm:text-base truncate group-hover:text-primary transition-colors">
                  {patient.name}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  {patient.age} anos • {patient.medication}
                </p>
              </div>

              {/* Last dose - hidden on very small screens */}
              <div className="text-right hidden xs:block sm:block">
                <p className="text-xs text-muted-foreground">Última dose</p>
                <p className="text-sm font-medium">{patient.lastDose}</p>
              </div>

              {/* Efficacy ring */}
              <div className="shrink-0">
                <EfficacyRing value={patient.efficacy} size="sm" showLabel={false} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
