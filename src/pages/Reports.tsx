import { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useClinic } from "@/contexts/ClinicContext";
import { Button } from "@/components/ui/button";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { EfficacyChart } from "@/components/dashboard/EfficacyChart";
import {
  FileText,
  Download,
  Calendar as CalendarIcon,
  User,
  Pill,
  Brain,
  Activity,
  FileSpreadsheet,
  FileType,
  Loader2,
} from "lucide-react";
import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { getDoses, DoseRecord } from "@/lib/doses";
import { getMedications, Medication } from "@/lib/medications";
import { getPatients, Patient } from "@/lib/patients";

const reportTypes = [
  {
    id: "complete",
    title: "Relatório Completo",
    description: "Histórico, eficácia e recomendações",
    icon: FileText,
  },
];

export default function Reports() {
  const { user } = useAuth();
  const { effectiveUserId } = useClinic();
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [selectedPatient, setSelectedPatient] = useState<string>("all");
  const [selectedReport, setSelectedReport] = useState<string>("complete");
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeRecommendations, setIncludeRecommendations] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // Data states
  const [doses, setDoses] = useState<DoseRecord[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data
  useEffect(() => {
    let mounted = true;

    async function loadData() {
      if (!user || !effectiveUserId) {
        if (mounted) setLoading(false);
        return;
      }

      try {
        if (mounted) setLoading(true);
        const [dosesData, medicationsData, patientsData] = await Promise.all([
          getDoses(effectiveUserId),
          getMedications(effectiveUserId),
          getPatients(effectiveUserId)
        ]);

        if (mounted) {
          setDoses(dosesData || []);
          setMedications(medicationsData || []);
          setPatients(patientsData || []);
        }
      } catch (error) {
        console.error("Failed to load report data:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadData();

    return () => {
      mounted = false;
    };
  }, [user, effectiveUserId]);

  // Filtered data calculation
  const getFilteredDoses = () => {
    if (!doses) return [];
    return doses.filter(dose => {
      if (!dose) return false;
      const doseDate = new Date(dose.timestamp);

      // Filter by date range
      if (startDate && endDate) {
        if (!isWithinInterval(doseDate, { start: startOfDay(startDate), end: endOfDay(endDate) })) {
          return false;
        }
      } else if (startDate) {
        if (doseDate < startOfDay(startDate)) return false;
      }

      // Filter by patient
      if (selectedPatient && selectedPatient !== "all") {
        if (dose.patientId !== selectedPatient) {
          return false;
        }
      }

      return true;
    });
  };

  const filteredDoses = getFilteredDoses();

  // Statistics
  const totalDoses = filteredDoses.length;

  const avgEfficacy = totalDoses > 0
    ? Math.round(filteredDoses.reduce((acc, dose) => {
      // Use efficacyPrediction from AnalysisResult
      const efficacy = dose?.analysis?.efficacyPrediction ||
        ((dose?.subjectiveState?.energy || 0) * 10);
      return acc + (efficacy || 0);
    }, 0) / totalDoses)
    : 0;

  // Chart Data Preparation
  const chartData = filteredDoses
    .slice(0, 50) // Limit to last 50 points for readability if too many
    .reverse() // Chronological order
    .map(dose => ({
      date: format(new Date(dose.timestamp), 'dd/MM'),
      efficacy: dose?.analysis?.efficacyPrediction || ((dose?.subjectiveState?.energy || 0) * 10) || 0,
      dose: parseInt(dose?.doseAmount) || 0
    }));

  const handleGenerate = (formatType: "pdf" | "csv") => {
    if (isGenerating) return;
    setIsGenerating(true);

    try {
      if (formatType === 'csv') {
        generateCSV();
      } else {
        generatePDF();
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao gerar relatório. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const patientName = selectedPatient !== 'all'
      ? patients.find(p => p.id === selectedPatient)?.name || 'Desconhecido'
      : 'Todos os Pacientes';

    const reportTitle = reportTypes.find(r => r.id === selectedReport)?.title || "Relatório";

    // Header
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text("NeuroDose - Análise de Eficácia", 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 28);
    doc.text(`Paciente: ${patientName}`, 14, 33);
    doc.text(`Tipo de Relatório: ${reportTitle}`, 14, 38);

    // Stats Section
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 45, 196, 45);

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("Resumo de Eficácia", 14, 55);

    doc.setFontSize(10);
    doc.text(`Total de Doses: ${totalDoses}`, 14, 62);
    doc.text(`Eficácia Média Geral: ${avgEfficacy}%`, 14, 67);
    const lowMoodCount = doses && doses.filter(d => d && d.subjectiveState && d.subjectiveState.mood < 5).length || 0;
    doc.text(`Registros com Humor Baixo: ${lowMoodCount}`, 14, 72);

    // Filter info if relevant
    if (startDate && endDate) {
      doc.text(`Período: ${format(startDate, 'dd/MM/yyyy')} a ${format(endDate, 'dd/MM/yyyy')}`, 14, 77);
    }

    // Data Table for Efficacy
    const tableData = filteredDoses.map(dose => {
      const efficacy = dose?.analysis?.efficacyPrediction ||
        ((dose?.subjectiveState?.energy || 0) * 10) || 0;
      const medName = medications.find(m => m.id === dose.medicationId)?.name || 'Desconhecido';

      return [
        format(new Date(dose.timestamp), 'dd/MM/yyyy HH:mm'),
        medName,
        `${dose.doseAmount}mg`,
        `${efficacy}%`,
        dose.subjectiveState?.mood ? dose.subjectiveState.mood.toString() : '-',
        dose.subjectiveState?.energy ? dose.subjectiveState.energy.toString() : '-'
      ];
    });

    autoTable(doc, {
      startY: 85,
      head: [['Data/Hora', 'Medicamento', 'Dose', 'Eficácia', 'Humor', 'Energia']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [63, 81, 181], textColor: 255 }, // NeuroDose like color
      styles: { fontSize: 9 },
      alternateRowStyles: { fillColor: [245, 245, 255] }
    });

    // Disclaimer footer
    // Cast doc to any to avoid TS error with strict getNumberOfPages definitions if present
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('NeuroDose Assist - Relatório Gerado Automaticamente', 14, doc.internal.pageSize.height - 10);
      doc.text(`Página ${i} de ${pageCount}`, 196, doc.internal.pageSize.height - 10, { align: 'right' });
    }

    doc.save(`neurodose_eficacia_${selectedPatient !== 'all' ? selectedPatient : 'geral'}_${format(new Date(), 'yyyyMMdd')}.pdf`);
  };

  const generateCSV = () => {
    // Header
    let csvContent = "data:text/csv;charset=utf-8,";

    // Section 1: Summary
    const patientName = selectedPatient !== 'all'
      ? patients.find(p => p.id === selectedPatient)?.name || 'Desconhecido'
      : 'Todos os Pacientes';

    csvContent += "RELATÓRIO DE PACIENTE\n";
    csvContent += `Paciente: ${patientName}\n`;
    csvContent += `Gerado em: ${new Date().toLocaleString('pt-BR')}\n`;
    csvContent += `Total de Doses: ${totalDoses}\n`;
    csvContent += `Eficácia Média: ${avgEfficacy}%\n\n`;

    // Section 2: Medications
    csvContent += "MEDICAMENTOS CADASTRADOS\n";
    csvContent += "Nome,Nome Comercial,Princípio Ativo,Classe,Dose Mín,Dose Máx\n";
    medications.forEach(med => {
      csvContent += `"${med.name}","${med.brandName}","${med.activeIngredient}","${med.therapeuticClass}",${med.minDose},${med.maxDose}\n`;
    });
    csvContent += "\n";

    // Section 3: Doses History
    csvContent += "HISTÓRICO DE DOSES\n";
    csvContent += "Data/Hora,Paciente,Medicamento,Dose,Indicação,Energia,Humor,Eficácia Estimada\n";
    filteredDoses.forEach(dose => {
      const pName = patients.find(p => p.id === dose.patientId)?.name || "N/A";
      const medName = medications.find(m => m.id === dose.medicationId)?.name || "Desconhecido";
      const dateStr = new Date(dose.timestamp).toLocaleString('pt-BR');
      const efficacy = dose.analysis?.efficacyPrediction || "N/A";

      // Fixed: Removed dose.subjectiveState?.focus as it doesn't exist on type
      csvContent += `"${dateStr}","${pName}","${medName}","${dose.doseAmount}","${dose.indication}",${dose.subjectiveState?.energy},${dose.subjectiveState?.mood},${efficacy}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `relatorio_${selectedPatient === 'all' ? 'geral' : selectedPatient}_${format(new Date(), 'yyyyMMdd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate additional statistics
  const uniqueMedications = new Set(filteredDoses.map(d => d.medicationId)).size;
  const avgMood = totalDoses > 0
    ? Math.round(filteredDoses.reduce((acc, dose) => acc + (dose?.subjectiveState?.mood || 0), 0) / totalDoses * 10) / 10
    : 0;
  const avgEnergy = totalDoses > 0
    ? Math.round(filteredDoses.reduce((acc, dose) => acc + (dose?.subjectiveState?.energy || 0), 0) / totalDoses * 10) / 10
    : 0;

  return (
    <MainLayout>
      <div className="space-y-8 pb-8">
        {/* Header Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-neuro-gradient flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
                Relatórios e Análises
              </h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                Gere relatórios profissionais e exporte dados detalhados para análise
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats Bar */}
        {!loading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card rounded-xl p-4 border-l-4 border-l-primary">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total de Doses</p>
                  <p className="text-2xl font-display font-bold mt-1">{totalDoses}</p>
                </div>
                <Pill className="w-8 h-8 text-primary/60" />
              </div>
            </div>
            <div className="glass-card rounded-xl p-4 border-l-4 border-l-success">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Eficácia Média</p>
                  <p className={cn("text-2xl font-display font-bold mt-1", avgEfficacy > 70 ? "text-success" : avgEfficacy > 50 ? "text-warning" : "text-destructive")}>
                    {avgEfficacy}%
                  </p>
                </div>
                <Activity className="w-8 h-8 text-success/60" />
              </div>
            </div>
            <div className="glass-card rounded-xl p-4 border-l-4 border-l-info">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Medicamentos</p>
                  <p className="text-2xl font-display font-bold mt-1">{uniqueMedications}</p>
                </div>
                <Brain className="w-8 h-8 text-info/60" />
              </div>
            </div>
            <div className="glass-card rounded-xl p-4 border-l-4 border-l-warning">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Alertas</p>
                  <p className="text-2xl font-display font-bold mt-1 text-warning">
                    {doses && doses.filter(d => d && d.subjectiveState && d.subjectiveState.mood < 5).length || 0}
                  </p>
                </div>
                <Activity className="w-8 h-8 text-warning/60" />
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Report Type Selection */}
            <div className="glass-card rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-primary" />
                </div>
                <h2 className="font-display font-semibold text-lg">Tipo de Relatório</h2>
              </div>
              <div className="space-y-3">
                {reportTypes.map((type) => (
                  <div
                    key={type.id}
                    onClick={() => setSelectedReport(type.id)}
                    className={cn(
                      "p-4 rounded-xl border-2 cursor-pointer transition-all duration-200",
                      selectedReport === type.id
                        ? "border-primary bg-primary/5 shadow-md scale-[1.02]"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                          selectedReport === type.id
                            ? "bg-primary/20 text-primary shadow-sm"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        <type.icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{type.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{type.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Filters */}
            <div className="glass-card rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center">
                  <CalendarIcon className="w-4 h-4 text-info" />
                </div>
                <h2 className="font-display font-semibold text-lg">Filtros</h2>
              </div>
              <div className="space-y-5">
                {/* Patient */}
                <div className="space-y-2.5">
                  <Label className="flex items-center gap-2 text-sm font-semibold">
                    <User className="w-4 h-4 text-primary" />
                    Paciente
                  </Label>
                  <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Selecionar paciente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os pacientes</SelectItem>
                      {patients && patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id || ""}>
                          {patient.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Range */}
                <div className="space-y-2.5">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-primary" />
                    Período
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left h-11">
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          {startDate ? format(startDate, "dd/MM/yy") : "Início"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left h-11">
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          {endDate ? format(endDate, "dd/MM/yy") : "Fim"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-3 pt-2 border-t border-border">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Opções</p>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <Checkbox
                        id="charts"
                        checked={includeCharts}
                        onCheckedChange={(checked) => setIncludeCharts(!!checked)}
                      />
                      <Label htmlFor="charts" className="text-sm cursor-pointer flex-1">
                        Incluir gráficos e visualizações
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <Checkbox
                        id="recommendations"
                        checked={includeRecommendations}
                        onCheckedChange={(checked) => setIncludeRecommendations(!!checked)}
                      />
                      <Label htmlFor="recommendations" className="text-sm cursor-pointer flex-1">
                        Incluir recomendações da IA
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Export Buttons */}
            <div className="glass-card rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                  <Download className="w-4 h-4 text-success" />
                </div>
                <h2 className="font-display font-semibold text-lg">Exportar</h2>
              </div>
              <div className="space-y-3">
                <Button
                  variant="neuro"
                  className="w-full h-12 text-base font-semibold shadow-md hover:shadow-lg transition-all"
                  onClick={() => handleGenerate("pdf")}
                  disabled={isGenerating || loading}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <FileType className="w-5 h-5 mr-2" />
                      Gerar PDF
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-12 text-base font-semibold border-2 hover:bg-muted/50 transition-all"
                  onClick={() => handleGenerate("csv")}
                  disabled={isGenerating || loading}
                >
                  <FileSpreadsheet className="w-5 h-5 mr-2" />
                  Exportar CSV
                </Button>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card rounded-2xl p-8 shadow-lg">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
                <div>
                  <h2 className="font-display font-semibold text-xl mb-1">
                    Prévia do Relatório
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Visualize como o relatório será gerado
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleGenerate("pdf")}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              </div>

              {/* Report Preview Content */}
              <div className="border-2 border-border rounded-2xl p-8 bg-gradient-to-br from-background to-muted/20 shadow-inner">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                    <span className="text-muted-foreground font-medium">Carregando dados...</span>
                  </div>
                ) : (
                  <>
                    {/* Header */}
                    <div className="text-center pb-8 border-b-2 border-border mb-8">
                      <div className="w-20 h-20 rounded-2xl bg-neuro-gradient flex items-center justify-center mx-auto mb-5 shadow-lg">
                        <Brain className="w-10 h-10 text-primary-foreground" />
                      </div>
                      <h3 className="font-display text-2xl font-bold mb-2">NeuroDose Assist</h3>
                      <p className="text-base text-muted-foreground font-medium">
                        {reportTypes.find((r) => r.id === selectedReport)?.title}
                      </p>
                      <div className="mt-4 pt-4 border-t border-border/50">
                        <p className="text-sm text-muted-foreground">
                          Gerado em {format(new Date(), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                        {selectedPatient !== 'all' && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Paciente: {patients.find(p => p.id === selectedPatient)?.name || 'N/A'}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Summary Stats - Enhanced */}
                    <div className="mb-8">
                      <h4 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-primary" />
                        Resumo Executivo
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-5 border border-primary/20">
                          <div className="flex items-center gap-2 mb-2">
                            <Pill className="w-4 h-4 text-primary" />
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Doses</p>
                          </div>
                          <p className="text-3xl font-display font-bold text-primary">{totalDoses}</p>
                          <p className="text-xs text-muted-foreground mt-1">Registradas</p>
                        </div>
                        <div className={cn(
                          "bg-gradient-to-br rounded-xl p-5 border",
                          avgEfficacy > 70
                            ? "from-success/10 to-success/5 border-success/20"
                            : avgEfficacy > 50
                              ? "from-warning/10 to-warning/5 border-warning/20"
                              : "from-destructive/10 to-destructive/5 border-destructive/20"
                        )}>
                          <div className="flex items-center gap-2 mb-2">
                            <Activity className={cn(
                              "w-4 h-4",
                              avgEfficacy > 70 ? "text-success" : avgEfficacy > 50 ? "text-warning" : "text-destructive"
                            )} />
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Eficácia</p>
                          </div>
                          <p className={cn(
                            "text-3xl font-display font-bold",
                            avgEfficacy > 70 ? "text-success" : avgEfficacy > 50 ? "text-warning" : "text-destructive"
                          )}>
                            {avgEfficacy}%
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">Média geral</p>
                        </div>
                        <div className="bg-gradient-to-br from-info/10 to-info/5 rounded-xl p-5 border border-info/20">
                          <div className="flex items-center gap-2 mb-2">
                            <Brain className="w-4 h-4 text-info" />
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Humor</p>
                          </div>
                          <p className="text-3xl font-display font-bold text-info">{avgMood}</p>
                          <p className="text-xs text-muted-foreground mt-1">Média (1-10)</p>
                        </div>
                        <div className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-xl p-5 border border-accent/20">
                          <div className="flex items-center gap-2 mb-2">
                            <Activity className="w-4 h-4 text-accent" />
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Energia</p>
                          </div>
                          <p className="text-3xl font-display font-bold text-accent">{avgEnergy}</p>
                          <p className="text-xs text-muted-foreground mt-1">Média (1-10)</p>
                        </div>
                      </div>
                    </div>

                    {/* Chart Preview */}
                    {includeCharts && chartData.length > 0 && (
                      <div className="mb-8">
                        <h4 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                          <Activity className="w-5 h-5 text-primary" />
                          Evolução da Eficácia
                        </h4>
                        <EfficacyChart data={chartData} className="border-0 p-0 bg-transparent shadow-none" />
                      </div>
                    )}

                    {includeCharts && chartData.length === 0 && (
                      <div className="mb-8 text-center text-muted-foreground py-12 border-2 border-dashed rounded-xl bg-muted/20">
                        <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="font-medium">Nenhum dado suficiente para gráficos</p>
                        <p className="text-sm mt-1">no período selecionado.</p>
                      </div>
                    )}

                    {/* Recommendations Preview */}
                    {includeRecommendations && (
                      <div className="mb-8">
                        <h4 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                          <Brain className="w-5 h-5 text-primary" />
                          Recomendações da IA
                        </h4>
                        <div className="space-y-3">
                          <div className="p-4 rounded-xl bg-success/10 border-2 border-success/20 shadow-sm">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-lg bg-success/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Activity className="w-4 h-4 text-success" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-success mb-1">Análise de Dados Reais</p>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  Baseado em {totalDoses} registros analisados. Continue registrando doses para obter insights mais precisos e recomendações personalizadas.
                                </p>
                              </div>
                            </div>
                          </div>
                          {avgEfficacy < 60 && totalDoses > 5 && (
                            <div className="p-4 rounded-xl bg-warning/10 border-2 border-warning/20 shadow-sm">
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-warning/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <Activity className="w-4 h-4 text-warning" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-warning mb-1">Atenção à Eficácia</p>
                                  <p className="text-xs text-muted-foreground leading-relaxed">
                                    A eficácia média está abaixo de 60%. Considere revisar os horários das doses, ajustar a dosagem ou consultar um profissional de saúde.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                          {avgMood < 5 && totalDoses > 3 && (
                            <div className="p-4 rounded-xl bg-destructive/10 border-2 border-destructive/20 shadow-sm">
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-destructive/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <Activity className="w-4 h-4 text-destructive" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-destructive mb-1">Monitoramento de Humor</p>
                                  <p className="text-xs text-muted-foreground leading-relaxed">
                                    O humor médio está abaixo do ideal. Recomenda-se acompanhamento próximo e possível ajuste no tratamento.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Medications List */}
                    {(selectedReport === "medications" || selectedReport === "complete") && (
                      <div className="mt-8 pt-8 border-t-2 border-border">
                        <h4 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                          <Pill className="w-5 h-5 text-primary" />
                          Medicamentos Ativos
                        </h4>
                        <div className="space-y-2">
                          {medications && medications.length > 0 ? medications.map(med => (
                            <div key={med.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/50 hover:bg-muted/50 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                  <Pill className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                  <span className="font-medium text-sm">{med.name}</span>
                                  <p className="text-xs text-muted-foreground">{med.brandName}</p>
                                </div>
                              </div>
                              <span className="text-sm font-semibold text-muted-foreground bg-muted px-3 py-1 rounded-lg">
                                {med.minDose}-{med.maxDose}{med.unit}
                              </span>
                            </div>
                          )) : (
                            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-xl bg-muted/20">
                              <Pill className="w-12 h-12 mx-auto mb-3 opacity-50" />
                              <p className="text-sm font-medium">Nenhum medicamento cadastrado.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
