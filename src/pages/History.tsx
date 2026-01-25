import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";
import { getDoses, DoseRecord } from "@/lib/doses";
import { getPatients, Patient } from "@/lib/patients";
import { getMedications, Medication } from "@/lib/medications";
import { toast } from "@/hooks/use-toast";

// Interface for enriched history item to display
interface HistoryItem extends DoseRecord {
  patientName: string;
  medicationName: string;
  displayType: 'dose' | 'symptom' | 'recommendation' | 'alert';
}

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
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [activeTab, setActiveTab] = useState("all");

  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      try {
        setLoading(true);
        const [dosesData, patientsData, medicationsData] = await Promise.all([
          getDoses(user.uid),
          getPatients(user.uid),
          getMedications(user.uid)
        ]);

        setPatients(patientsData);

        // Process and enrich data
        // For now, we मैप each DOSE to a HistoryItem. 
        // In a more complex version, we could split one Dose into multiple items (one for Alert, one for Recommendation)
        // providing a "Timeline" view. 
        // Here we will just map Doses, but filtering will change what we emphasize.

        const enrichedItems: HistoryItem[] = dosesData.map(dose => {
          const patient = patientsData.find(p => p.id === dose.patientId);
          const medication = medicationsData.find(m => m.id === dose.medicationId);

          return {
            ...dose,
            patientName: patient ? patient.name : 'Paciente Removido',
            medicationName: medication ? medication.name : 'Medicamento Removido',
            displayType: 'dose' // Default
          };
        });

        setHistoryItems(enrichedItems);

      } catch (error) {
        console.error("Error fetching history:", error);
        toast({
          title: "Erro ao carregar histórico",
          description: "Não foi possível buscar os dados.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  // Handle Export
  const handleExport = () => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.text("Neuro Dose Assist - Histórico de Doses", 14, 22);
    doc.setFontSize(10);
    doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 14, 30);

    // Prepare table data
    const tableData = historyItems.map((item) => {
      const dateStr = format(new Date(item.timestamp), "dd/MM/yyyy HH:mm");
      const subjective = `Mood: ${item.subjectiveState.mood}/5 | Energia: ${item.subjectiveState.energy}/5 | Sono: ${item.subjectiveState.sleep}/5`;
      const analysis = `Rec: ${item.analysis.recommendation}\nEficácia Previsto: ${item.analysis.efficacyPrediction}%`;
      const details = item.subjectiveState.effects || "Sem efeitos colaterais relatados";

      return [
        dateStr,
        item.patientName,
        item.medicationName,
        `${item.doseAmount}mg`,
        `${subjective}\n${details}\n\n${analysis}`
      ];
    });

    autoTable(doc, {
      head: [["Data/Hora", "Paciente", "Medicamento", "Dose", "Detalhes e Análise"]],
      body: tableData,
      startY: 35,
      headStyles: { fillColor: [66, 153, 225] },
      styles: { fontSize: 8, cellPadding: 3 },
      columnStyles: {
        4: { cellWidth: 80 }
      }
    });

    // Save
    doc.save(`neuro-dose-history-${format(new Date(), "yyyy-MM-dd")}.pdf`);

    toast({
      title: "Exportação concluída",
      description: "O PDF foi baixado com sucesso."
    });
  };

  const filteredHistory = historyItems.filter((item) => {
    const matchesSearch =
      item.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.medicationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.analysis?.recommendation || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDate = date ? new Date(item.timestamp).toDateString() === date.toDateString() : true;

    // Tab logic: For 'dose', show everything. 
    // For 'symptom', show items where subjective state has significant data (e.g. low mood/energy or effects text)
    // For 'recommendation', show items where recommendation is not empty (always true for current logic, maybe filter by "significant" changes?)
    // For 'alert', show items with risks.
    let matchesType = true;
    if (activeTab === 'symptom') {
      matchesType = !!item.subjectiveState.effects || item.subjectiveState.mood <= 3 || item.subjectiveState.sleep <= 4;
    } else if (activeTab === 'recommendation') {
      matchesType = !!item.analysis.recommendation;
    } else if (activeTab === 'alert') {
      matchesType = item.analysis.riskAssessment && item.analysis.riskAssessment.length > 0 && item.analysis.riskAssessment.some(r => r.level !== 'Baixo');
    }

    return matchesSearch && matchesDate && matchesType;
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
          <Button variant="outline" onClick={handleExport} disabled={historyItems.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
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
          {/* Note: Patient filter could be implemented here, currently just visual placeholder in original design, 
              but since we have search, let's keep it simple or implement fully later. For now, search covers names. */}
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
              {loading ? (
                <div className="flex justify-center p-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : filteredHistory.length === 0 ? (
                <div className="text-center p-12 text-muted-foreground">
                  Nenhum registro encontrado.
                </div>
              ) : (
                filteredHistory.map((item) => {
                  // Determine icon/style based on current tab or content
                  const typeKey = activeTab === 'all' ? 'dose' : activeTab as keyof typeof typeConfig;
                  const config = typeConfig[typeKey] || typeConfig['dose'];
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
                            <span className="text-sm font-medium">{item.patientName}</span>
                            <span className="text-xs text-muted-foreground">• {format(new Date(item.timestamp), "HH:mm")}</span>
                          </div>

                          <p className="font-medium">
                            {item.medicationName} {item.doseAmount}mg
                          </p>

                          {/* Display subtle details based on available data */}
                          <div className="text-sm text-muted-foreground mt-1 space-y-1">
                            {item.subjectiveState.effects && (
                              <p className="line-clamp-2">" {item.subjectiveState.effects} "</p>
                            )}
                            <p className="text-xs">
                              Recomendação: {item.analysis.recommendation}
                            </p>
                          </div>

                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {format(new Date(item.timestamp), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {/* Always show efficacy ring */}
                          <EfficacyRing value={item.analysis.efficacyPrediction} size="sm" showLabel={false} />

                          {/* Show Risk Badge if High/Medium Risk exists */}
                          {item.analysis.riskAssessment.some(r => r.level !== 'Baixo') && (
                            <Badge
                              variant="outline"
                              className="bg-warning/10 text-warning border-warning/20"
                            >
                              Risco Identificado
                            </Badge>
                          )}
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
