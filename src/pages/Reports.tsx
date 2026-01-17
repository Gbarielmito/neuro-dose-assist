import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
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
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

// Mock chart data
const mockChartData = [
  { date: "01/01", efficacy: 72, dose: 50 },
  { date: "02/01", efficacy: 75, dose: 50 },
  { date: "03/01", efficacy: 78, dose: 50 },
  { date: "04/01", efficacy: 82, dose: 55 },
  { date: "05/01", efficacy: 80, dose: 55 },
  { date: "06/01", efficacy: 85, dose: 55 },
  { date: "07/01", efficacy: 88, dose: 60 },
  { date: "08/01", efficacy: 86, dose: 60 },
  { date: "09/01", efficacy: 89, dose: 60 },
  { date: "10/01", efficacy: 91, dose: 60 },
];

const reportTypes = [
  {
    id: "complete",
    title: "Relatório Completo",
    description: "Histórico, eficácia e recomendações",
    icon: FileText,
  },
  {
    id: "efficacy",
    title: "Análise de Eficácia",
    description: "Gráficos e tendências de eficácia",
    icon: Activity,
  },
  {
    id: "recommendations",
    title: "Recomendações IA",
    description: "Sugestões de ajuste de dose",
    icon: Brain,
  },
  {
    id: "medications",
    title: "Histórico de Medicamentos",
    description: "Registro detalhado de doses",
    icon: Pill,
  },
];

export default function Reports() {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [selectedReport, setSelectedReport] = useState<string>("complete");
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeRecommendations, setIncludeRecommendations] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = (formatType: "pdf" | "csv") => {
    setIsGenerating(true);
    // Simular geração
    setTimeout(() => {
      setIsGenerating(false);
    }, 2000);
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
            Gerar e exportar relatórios personalizados
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
                      <SelectItem value="all">Todos os pacientes</SelectItem>
                      <SelectItem value="joao">João Silva</SelectItem>
                      <SelectItem value="maria">Maria Santos</SelectItem>
                      <SelectItem value="pedro">Pedro Oliveira</SelectItem>
                      <SelectItem value="ana">Ana Costa</SelectItem>
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
                  disabled={isGenerating}
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
                  disabled={isGenerating}
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
                <Button variant="ghost" size="sm">
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

                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 rounded-lg bg-muted/30">
                    <p className="text-2xl font-display font-bold text-primary">24</p>
                    <p className="text-xs text-muted-foreground">Doses Registradas</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/30">
                    <p className="text-2xl font-display font-bold text-success">85%</p>
                    <p className="text-xs text-muted-foreground">Eficácia Média</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/30">
                    <p className="text-2xl font-display font-bold text-warning">3</p>
                    <p className="text-xs text-muted-foreground">Ajustes Sugeridos</p>
                  </div>
                </div>

                {/* Chart Preview */}
                {includeCharts && (
                  <div className="mb-6">
                    <h4 className="font-medium mb-4">Evolução da Eficácia</h4>
                    <EfficacyChart data={mockChartData} className="border-0 p-0 bg-transparent" />
                  </div>
                )}

                {/* Recommendations Preview */}
                {includeRecommendations && (
                  <div>
                    <h4 className="font-medium mb-4">Recomendações da IA</h4>
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                        <p className="text-sm font-medium text-success">Manter dosagem atual</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Paciente apresenta boa resposta com 20mg de Metilfenidato
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                        <p className="text-sm font-medium text-warning">Ajustar horário</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Considerar antecipar dose para 07:30 para melhor absorção
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
