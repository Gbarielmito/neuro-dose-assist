import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  const [selectedPatientId, setSelectedPatientId] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [isExporting, setIsExporting] = useState(false);

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
        // Por enquanto, mapeamos cada DOSE para um HistoryItem.
        // No futuro, podemos transformar uma dose em múltiplos itens (alerta, recomendação etc.)
        // para uma visão de linha do tempo mais rica.

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
    if (isExporting || historyItems.length === 0) return;
    setIsExporting(true);

    try {
      const doc = new jsPDF();

      // Header
      doc.setFontSize(18);
      doc.text("NeuroDose Assist - Histórico", 14, 22);
      doc.setFontSize(10);
      doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 14, 30);

      // Prepare table data
      const tableData = historyItems.map((item) => {
        const dateStr = format(new Date(item.timestamp), "dd/MM/yyyy HH:mm");
        const mood = item.subjectiveState?.mood ?? "-";
        const energy = item.subjectiveState?.energy ?? "-";
        const sleep = item.subjectiveState?.sleep ?? "-";
        const subjective = `Humor: ${mood}/5 | Energia: ${energy}/5 | Sono: ${sleep}/5`;
        const rec = item.analysis?.recommendation ?? "-";
        const efficacy = item.analysis?.efficacyPrediction ?? "-";
        const analysis = `Recomendação: ${rec}\nEficácia prevista: ${efficacy}%`;
        const details = item.subjectiveState?.effects || "Sem efeitos colaterais relatados";

        return [
          dateStr,
          item.patientName,
          item.medicationName,
          `${item.doseAmount}mg`,
          `${subjective}\n${details}\n\n${analysis}`,
        ];
      });

      autoTable(doc, {
        head: [["Data/Hora", "Paciente", "Medicamento", "Dose", "Detalhes e Análise"]],
        body: tableData,
        startY: 35,
        headStyles: { fillColor: [63, 81, 181] },
        styles: { fontSize: 8, cellPadding: 3 },
        columnStyles: {
          4: { cellWidth: 80 },
        },
      });

      // Save
      doc.save(`neurodose-historico-${format(new Date(), "yyyy-MM-dd")}.pdf`);

      toast({
        title: "Exportação concluída",
        description: "O PDF foi baixado com sucesso.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const dtfShort = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });
  const dtfLong = new Intl.DateTimeFormat("pt-BR", { dateStyle: "full", timeStyle: "short" });
  const tfShort = new Intl.DateTimeFormat("pt-BR", { timeStyle: "short" });

  const filteredHistory = historyItems.filter((item) => {
    const matchesSearch =
      item.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.medicationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.analysis?.recommendation || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDate = date ? new Date(item.timestamp).toDateString() === date.toDateString() : true;

    const matchesPatient =
      selectedPatientId === "all" ? true : item.patientId === selectedPatientId;

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
      matchesType =
        !!item.analysis?.riskAssessment &&
        item.analysis.riskAssessment.length > 0 &&
        item.analysis.riskAssessment.some(r => r.level !== 'Baixo');
    }

    return matchesSearch && matchesDate && matchesPatient && matchesType;
  });

  const filteredTotal = filteredHistory.length;
  const uniquePatients = new Set(filteredHistory.map(i => i.patientId)).size;
  const avgEfficacy =
    filteredTotal > 0
      ? Math.round(filteredHistory.reduce((acc, i) => acc + (i.analysis?.efficacyPrediction || 0), 0) / filteredTotal)
      : 0;
  const riskCount =
    filteredHistory.filter(i => i.analysis?.riskAssessment?.some(r => r.level !== "Baixo")).length;

  return (
    <MainLayout>
      <div className="space-y-8 pb-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-neuro-gradient flex items-center justify-center shadow-md">
              <Clock className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-balance">
                Histórico
              </h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                Linha do tempo de doses, sintomas, recomendações e alertas
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handleExport}
            disabled={loading || isExporting || historyItems.length === 0}
            className="h-11"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Exportando…
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Exportar PDF
              </>
            )}
          </Button>
        </div>

        {/* Stats */}
        {!loading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card rounded-xl p-4 border-l-4 border-l-primary">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Registros</p>
                  <p className="text-2xl font-display font-bold mt-1">{filteredTotal}</p>
                </div>
                <Clock className="w-8 h-8 text-primary/60" />
              </div>
            </div>
            <div className="glass-card rounded-xl p-4 border-l-4 border-l-info">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Pacientes</p>
                  <p className="text-2xl font-display font-bold mt-1">{uniquePatients}</p>
                </div>
                <Brain className="w-8 h-8 text-info/60" />
              </div>
            </div>
            <div className="glass-card rounded-xl p-4 border-l-4 border-l-success">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Eficácia</p>
                  <p className={cn("text-2xl font-display font-bold mt-1", avgEfficacy >= 70 ? "text-success" : avgEfficacy >= 50 ? "text-warning" : "text-destructive")}>
                    {avgEfficacy}%
                  </p>
                </div>
                <Activity className="w-8 h-8 text-success/60" />
              </div>
            </div>
            <div className="glass-card rounded-xl p-4 border-l-4 border-l-warning">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Alertas</p>
                  <p className="text-2xl font-display font-bold mt-1 text-warning">{riskCount}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-warning/60" />
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="glass-card rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Filter className="w-4 h-4 text-primary" />
            </div>
            <h2 className="font-display font-semibold text-lg">Filtros</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
            <div className="lg:col-span-5 space-y-2">
              <Label htmlFor="history-search" className="text-sm font-semibold">
                Busca
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="history-search"
                  name="historySearch"
                  autoComplete="off"
                  placeholder="Buscar por paciente, medicamento ou recomendação…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
            </div>

            <div className="lg:col-span-3 space-y-2">
              <Label className="text-sm font-semibold">Paciente</Label>
              <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Selecionar paciente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {patients.map((p) => (
                    <SelectItem key={p.id} value={p.id || ""}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="lg:col-span-3 space-y-2">
              <Label className="text-sm font-semibold">Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start h-11">
                    <CalendarIcon className="w-4 h-4 mr-2" aria-hidden="true" />
                    {date ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(date) : "Selecionar data"}
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
            </div>

            <div className="lg:col-span-1 flex gap-2">
              <Button
                variant="ghost"
                className="w-full h-11"
                onClick={() => {
                  setSearchTerm("");
                  setDate(undefined);
                  setSelectedPatientId("all");
                }}
                disabled={!searchTerm && !date && selectedPatientId === "all"}
              >
                Limpar
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs + Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="glass-card rounded-2xl p-2 shadow-lg">
            <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full bg-transparent gap-1">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="dose">
                <Pill className="w-4 h-4 mr-1" aria-hidden="true" />
                Doses
              </TabsTrigger>
              <TabsTrigger value="symptom">
                <Activity className="w-4 h-4 mr-1" aria-hidden="true" />
                Sintomas
              </TabsTrigger>
              <TabsTrigger value="recommendation">
                <Brain className="w-4 h-4 mr-1" aria-hidden="true" />
                Recomendações
              </TabsTrigger>
              <TabsTrigger value="alert">
                <AlertTriangle className="w-4 h-4 mr-1" aria-hidden="true" />
                Alertas
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={activeTab} className="mt-6">
            {loading ? (
              <div className="glass-card rounded-2xl p-12 flex items-center justify-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="text-muted-foreground font-medium">Carregando histórico…</span>
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="glass-card rounded-2xl p-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <Search className="w-7 h-7 text-muted-foreground" aria-hidden="true" />
                </div>
                <p className="font-display font-semibold text-lg">Nenhum registro encontrado</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Ajuste os filtros ou registre uma nova dose para começar.
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {filteredHistory.map((item) => {
                  const hasRisk = !!item.analysis?.riskAssessment?.some(r => r.level !== "Baixo");
                  const hasSymptoms =
                    !!item.subjectiveState?.effects ||
                    (item.subjectiveState?.mood ?? 5) <= 3 ||
                    (item.subjectiveState?.sleep ?? 5) <= 4;
                  const hasRecommendation = !!item.analysis?.recommendation;

                  const inferredType: keyof typeof typeConfig =
                    activeTab !== "all"
                      ? (activeTab as keyof typeof typeConfig)
                      : hasRisk
                        ? "alert"
                        : hasSymptoms
                          ? "symptom"
                          : hasRecommendation
                            ? "recommendation"
                            : "dose";

                  const config = typeConfig[inferredType] || typeConfig.dose;
                  const Icon = config.icon;

                  const dt = new Date(item.timestamp);
                  const timeLabel = tfShort.format(dt);
                  const dateTimeLabel = dtfShort.format(dt);

                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedItem(item)}
                        className={cn(
                          "w-full text-left glass-card rounded-2xl p-5 transition-[transform,box-shadow,background-color] duration-200 hover:shadow-md hover:bg-card/90",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        )}
                        aria-label={`Abrir detalhes do registro de ${item.patientName} em ${dateTimeLabel}`}
                        style={{ contentVisibility: "auto" }}
                      >
                        <div className="flex items-start gap-4">
                          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border", config.color)}>
                            <Icon className="w-6 h-6" aria-hidden="true" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="outline" className={cn("text-xs", config.color)}>
                                {config.label}
                              </Badge>
                              <span className="text-sm font-semibold truncate">{item.patientName}</span>
                              <span className="text-xs text-muted-foreground">• {timeLabel}</span>
                            </div>

                            <p className="font-medium mt-1 truncate">
                              {item.medicationName} <span className="text-muted-foreground font-semibold">•</span>{" "}
                              <span className="font-semibold tabular-nums">{item.doseAmount}mg</span>
                            </p>

                            <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                              {item.subjectiveState?.effects && (
                                <p className="line-clamp-2 break-words">
                                  “{item.subjectiveState.effects}”
                                </p>
                              )}
                              {item.analysis?.recommendation && (
                                <p className="text-xs line-clamp-2 break-words">
                                  <span className="font-semibold text-foreground/80">Recomendação:</span>{" "}
                                  {item.analysis.recommendation}
                                </p>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-2 mt-3">
                              <div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                <CalendarIcon className="w-3.5 h-3.5" aria-hidden="true" />
                                {dateTimeLabel}
                              </div>
                              {typeof item.subjectiveState?.mood === "number" && (
                                <Badge variant="outline" className="bg-secondary/50">
                                  Humor: <span className="ml-1 font-semibold tabular-nums">{item.subjectiveState.mood}/5</span>
                                </Badge>
                              )}
                              {typeof item.subjectiveState?.energy === "number" && (
                                <Badge variant="outline" className="bg-secondary/50">
                                  Energia: <span className="ml-1 font-semibold tabular-nums">{item.subjectiveState.energy}/5</span>
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            {typeof item.analysis?.efficacyPrediction === "number" && (
                              <EfficacyRing value={item.analysis.efficacyPrediction} size="sm" showLabel={false} />
                            )}

                            {hasRisk && (
                              <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 hidden sm:inline-flex">
                                Risco
                              </Badge>
                            )}
                            <ChevronRight className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </TabsContent>
        </Tabs>

        <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
          <DialogContent className="max-w-2xl">
            {selectedItem && (
              <div className="space-y-4">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" aria-hidden="true" />
                    Detalhes do Registro
                  </DialogTitle>
                  <DialogDescription>
                    {dtfLong.format(new Date(selectedItem.timestamp))}
                  </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-xl border bg-card p-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Paciente</p>
                    <p className="mt-1 font-semibold">{selectedItem.patientName}</p>
                  </div>
                  <div className="rounded-xl border bg-card p-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Medicamento & Dose</p>
                    <p className="mt-1 font-semibold">
                      {selectedItem.medicationName} • <span className="tabular-nums">{selectedItem.doseAmount}mg</span>
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border bg-card p-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Estado Subjetivo</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {typeof selectedItem.subjectiveState?.mood === "number" && (
                      <Badge variant="outline" className="bg-secondary/50">
                        Humor: <span className="ml-1 font-semibold tabular-nums">{selectedItem.subjectiveState.mood}/5</span>
                      </Badge>
                    )}
                    {typeof selectedItem.subjectiveState?.energy === "number" && (
                      <Badge variant="outline" className="bg-secondary/50">
                        Energia: <span className="ml-1 font-semibold tabular-nums">{selectedItem.subjectiveState.energy}/5</span>
                      </Badge>
                    )}
                    {typeof selectedItem.subjectiveState?.sleep === "number" && (
                      <Badge variant="outline" className="bg-secondary/50">
                        Sono: <span className="ml-1 font-semibold tabular-nums">{selectedItem.subjectiveState.sleep}/5</span>
                      </Badge>
                    )}
                  </div>
                  {selectedItem.subjectiveState?.effects && (
                    <p className="mt-3 text-sm text-muted-foreground break-words">
                      <span className="font-semibold text-foreground/80">Efeitos:</span>{" "}
                      {selectedItem.subjectiveState.effects}
                    </p>
                  )}
                </div>

                <div className="rounded-xl border bg-card p-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Análise</p>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    {typeof selectedItem.analysis?.efficacyPrediction === "number" && (
                      <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                        Eficácia prevista: <span className="ml-1 font-semibold tabular-nums">{selectedItem.analysis.efficacyPrediction}%</span>
                      </Badge>
                    )}
                  </div>
                  {selectedItem.analysis?.recommendation && (
                    <p className="mt-3 text-sm break-words">
                      <span className="font-semibold">Recomendação:</span>{" "}
                      {selectedItem.analysis.recommendation}
                    </p>
                  )}
                  {selectedItem.analysis?.riskAssessment?.length ? (
                    <div className="mt-3">
                      <p className="text-sm font-semibold">Risco</p>
                      <ul className="mt-2 space-y-2">
                        {selectedItem.analysis.riskAssessment.map((r, idx) => (
                          <li key={`${r.type}-${idx}`} className="text-sm text-muted-foreground break-words">
                            <span className="font-semibold text-foreground/80">{r.type}:</span>{" "}
                            {r.level} — {r.description}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
