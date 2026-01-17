import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EfficacyRing } from "@/components/dashboard/EfficacyRing";
import {
  Search,
  Calendar as CalendarIcon,
  Filter,
  Pill,
  Activity,
  AlertTriangle,
  Brain,
  Clock,
  ChevronRight,
  Download,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Mock data
const mockHistory = [
  {
    id: "1",
    type: "dose",
    patient: "João Silva",
    medication: "Metilfenidato 20mg",
    date: new Date(2024, 0, 15, 8, 30),
    efficacy: 85,
    details: "Dose matinal, paciente reportou boa concentração",
  },
  {
    id: "2",
    type: "symptom",
    patient: "Maria Santos",
    symptom: "Insônia leve",
    date: new Date(2024, 0, 15, 22, 0),
    intensity: 3,
    details: "Dificuldade para iniciar o sono, durou cerca de 1 hora",
  },
  {
    id: "3",
    type: "recommendation",
    patient: "Pedro Oliveira",
    recommendation: "Ajuste de horário",
    date: new Date(2024, 0, 14, 14, 0),
    priority: "medium",
    details: "IA sugere antecipar dose de Quetiapina para 20h",
  },
  {
    id: "4",
    type: "dose",
    patient: "Ana Costa",
    medication: "Sertralina 50mg",
    date: new Date(2024, 0, 14, 7, 0),
    efficacy: 91,
    details: "Manutenção de dose, paciente estável",
  },
  {
    id: "5",
    type: "alert",
    patient: "Carlos Ferreira",
    alert: "Eficácia em declínio",
    date: new Date(2024, 0, 13, 16, 30),
    severity: "high",
    details: "Queda de 15% na eficácia nos últimos 5 dias",
  },
  {
    id: "6",
    type: "dose",
    patient: "João Silva",
    medication: "Metilfenidato 20mg",
    date: new Date(2024, 0, 13, 8, 45),
    efficacy: 82,
    details: "Dose matinal, leve sonolência reportada",
  },
  {
    id: "7",
    type: "recommendation",
    patient: "Maria Santos",
    recommendation: "Aumento de dose",
    date: new Date(2024, 0, 12, 10, 0),
    priority: "low",
    details: "Considerar aumento de Venlafaxina para 112.5mg",
  },
];

const typeConfig = {
  dose: {
    icon: Pill,
    label: "Dose",
    color: "bg-primary/10 text-primary border-primary/20",
  },
  symptom: {
    icon: Activity,
    label: "Sintoma",
    color: "bg-warning/10 text-warning border-warning/20",
  },
  recommendation: {
    icon: Brain,
    label: "Recomendação",
    color: "bg-info/10 text-info border-info/20",
  },
  alert: {
    icon: AlertTriangle,
    label: "Alerta",
    color: "bg-destructive/10 text-destructive border-destructive/20",
  },
};

export default function History() {
  const [searchTerm, setSearchTerm] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [activeTab, setActiveTab] = useState("all");

  const filteredHistory = mockHistory.filter((item) => {
    const matchesSearch =
      item.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = activeTab === "all" || item.type === activeTab;
    return matchesSearch && matchesType;
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold">
              Histórico
            </h1>
            <p className="text-muted-foreground mt-1">
              Registro completo de doses, sintomas e recomendações
            </p>
          </div>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar no histórico..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[200px] justify-start">
                <CalendarIcon className="w-4 h-4 mr-2" />
                {date ? format(date, "dd/MM/yyyy") : "Selecionar data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Paciente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="joao">João Silva</SelectItem>
              <SelectItem value="maria">Maria Santos</SelectItem>
              <SelectItem value="pedro">Pedro Oliveira</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-muted/50">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="dose">
              <Pill className="w-4 h-4 mr-1" />
              Doses
            </TabsTrigger>
            <TabsTrigger value="symptom">
              <Activity className="w-4 h-4 mr-1" />
              Sintomas
            </TabsTrigger>
            <TabsTrigger value="recommendation">
              <Brain className="w-4 h-4 mr-1" />
              Recomendações
            </TabsTrigger>
            <TabsTrigger value="alert">
              <AlertTriangle className="w-4 h-4 mr-1" />
              Alertas
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <div className="space-y-4">
              {filteredHistory.map((item) => {
                const config = typeConfig[item.type as keyof typeof typeConfig];
                const Icon = config.icon;

                return (
                  <div
                    key={item.id}
                    className="glass-card rounded-xl p-4 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                          config.color.split(" ")[0]
                        )}
                      >
                        <Icon className={cn("w-5 h-5", config.color.split(" ")[1])} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className={cn("text-xs", config.color)}>
                            {config.label}
                          </Badge>
                          <span className="text-sm font-medium">{item.patient}</span>
                        </div>

                        <p className="font-medium">
                          {item.type === "dose" && (item as any).medication}
                          {item.type === "symptom" && (item as any).symptom}
                          {item.type === "recommendation" && (item as any).recommendation}
                          {item.type === "alert" && (item as any).alert}
                        </p>

                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {item.details}
                        </p>

                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {format(item.date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {item.type === "dose" && (
                          <EfficacyRing value={(item as any).efficacy} size="sm" showLabel={false} />
                        )}
                        {item.type === "symptom" && (
                          <div className="text-center">
                            <p className="text-lg font-bold text-warning">{(item as any).intensity}/5</p>
                            <p className="text-xs text-muted-foreground">Intensidade</p>
                          </div>
                        )}
                        {item.type === "recommendation" && (
                          <Badge
                            variant="outline"
                            className={cn(
                              (item as any).priority === "high"
                                ? "bg-destructive/10 text-destructive border-destructive/20"
                                : (item as any).priority === "medium"
                                ? "bg-warning/10 text-warning border-warning/20"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            {(item as any).priority === "high"
                              ? "Alta"
                              : (item as any).priority === "medium"
                              ? "Média"
                              : "Baixa"}
                          </Badge>
                        )}
                        {item.type === "alert" && (
                          <Badge
                            variant="outline"
                            className="bg-destructive/10 text-destructive border-destructive/20"
                          >
                            {(item as any).severity === "high" ? "Crítico" : "Atenção"}
                          </Badge>
                        )}
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
