import { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
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
      if (!user) {
        if (mounted) setLoading(false);
        return;
      }

      try {
        if (mounted) setLoading(true);
        // Em um app real, o ID do usuário viria da autenticação
        const [dosesData, medicationsData, patientsData] = await Promise.all([
          getDoses(user.uid),
          getMedications(user.uid),
          getPatients(user.uid)
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
  }, [user]);

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

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">
            Relatórios
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerar e exportar relatórios personalizados com dados em tempo real
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Report Type Selection */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="font-display font-semibold mb-4">Tipo de Relatório</h2>
              <div className="space-y-3">
                {reportTypes.map((type) => (
                  <div
                    key={type.id}
                    onClick={() => setSelectedReport(type.id)}
                    className={cn(
                      "p-4 rounded-xl border cursor-pointer transition-all",
                      selectedReport === type.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center",
                          selectedReport === type.id
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        <type.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{type.title}</p>
                        <p className="text-xs text-muted-foreground">{type.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Filters */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="font-display font-semibold mb-4">Filtros</h2>
              <div className="space-y-4">
                {/* Patient */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Paciente
                  </Label>
                  <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar paciente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os pacientes (Atual)</SelectItem>
                      {patients && patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id || ""}>
                          {patient.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Range */}
                <div className="space-y-2">
                  <Label>Período</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left">
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
                        <Button variant="outline" className="w-full justify-start text-left">
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
                <div className="space-y-3 pt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="charts"
                      checked={includeCharts}
                      onCheckedChange={(checked) => setIncludeCharts(!!checked)}
                    />
                    <Label htmlFor="charts" className="text-sm">
                      Incluir gráficos
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="recommendations"
                      checked={includeRecommendations}
                      onCheckedChange={(checked) => setIncludeRecommendations(!!checked)}
                    />
                    <Label htmlFor="recommendations" className="text-sm">
                      Incluir recomendações IA
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            {/* Export Buttons */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="font-display font-semibold mb-4">Exportar</h2>
              <div className="space-y-3">
                <Button
                  variant="neuro"
                  className="w-full"
                  onClick={() => handleGenerate("pdf")}
                  disabled={isGenerating || loading}
                >
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <FileType className="w-4 h-4 mr-2" />
                  )}
                  Gerar PDF
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleGenerate("csv")}
                  disabled={isGenerating || loading}
                >
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Exportar CSV
                </Button>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display font-semibold text-lg">
                  Prévia do Relatório
                </h2>
                <Button variant="ghost" size="sm" onClick={() => handleGenerate("csv")}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>

              {/* Report Preview Content */}
              <div className="border border-border rounded-xl p-6 bg-background/50">
                {/* Header */}
                <div className="text-center pb-6 border-b border-border mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-neuro-gradient flex items-center justify-center mx-auto mb-4">
                    <Brain className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="font-display text-xl font-bold">NeuroDose</h3>
                  <p className="text-sm text-muted-foreground">
                    Relatório de {reportTypes.find((r) => r.id === selectedReport)?.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Gerado em {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                </div>

                {loading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <span className="ml-2">Carregando dados...</span>
                  </div>
                ) : (
                  <>
                    {/* Summary Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center p-4 rounded-lg bg-muted/30">
                        <p className="text-2xl font-display font-bold text-primary">{totalDoses}</p>
                        <p className="text-xs text-muted-foreground">Doses Registradas</p>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-muted/30">
                        <p className={cn("text-2xl font-display font-bold", avgEfficacy > 70 ? "text-success" : "text-warning")}>
                          {avgEfficacy}%
                        </p>
                        <p className="text-xs text-muted-foreground">Eficácia Média</p>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-muted/30">
                        <p className="text-2xl font-display font-bold text-warning">
                          {doses && doses.filter(d => d && d.subjectiveState && d.subjectiveState.mood < 5).length || 0}
                        </p>
                        <p className="text-xs text-muted-foreground">Alertas de Humor</p>
                      </div>
                    </div>

                    {/* Chart Preview */}
                    {includeCharts && chartData.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-medium mb-4">Evolução da Eficácia</h4>
                        <EfficacyChart data={chartData} className="border-0 p-0 bg-transparent" />
                      </div>
                    )}

                    {includeCharts && chartData.length === 0 && (
                      <div className="mb-6 text-center text-muted-foreground py-8 border rounded-lg border-dashed">
                        Nenhum dado suficiente para gráficos no período selecionado.
                      </div>
                    )}

                    {/* Recommendations Preview - keeping static for now as AI service integration is separate */}
                    {includeRecommendations && (
                      <div>
                        <h4 className="font-medium mb-4">Recomendações da IA</h4>
                        <div className="space-y-3">
                          <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                            <p className="text-sm font-medium text-success">Análise de Dados Reais</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Baseado em {totalDoses} registros. Continue registrando para melhores insights.
                            </p>
                          </div>
                          {avgEfficacy < 60 && totalDoses > 5 && (
                            <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                              <p className="text-sm font-medium text-warning">Atenção à Eficácia</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                A eficácia média está abaixo de 60%. Considere revisar os horários das doses.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Medications List */}
                    {selectedReport === "medications" || selectedReport === "complete" ? (
                      <div className="mt-8">
                        <h4 className="font-medium mb-4">Medicamentos Ativos</h4>
                        <div className="space-y-2">
                          {medications && medications.length > 0 ? medications.map(med => (
                            <div key={med.id} className="flex justify-between p-3 bg-muted/20 rounded-lg text-sm">
                              <span>{med.name} ({med.brandName})</span>
                              {/* Fixed doseAmount error */}
                              <span className="text-muted-foreground">{med.minDose}-{med.maxDose}{med.unit}</span>
                            </div>
                          )) : (
                            <p className="text-sm text-muted-foreground">Nenhum medicamento cadastrado.</p>
                          )}
                        </div>
                      </div>
                    ) : null}
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
