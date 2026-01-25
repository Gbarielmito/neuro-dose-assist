import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { EfficacyRing } from "@/components/dashboard/EfficacyRing";
import { Brain, Pill, Clock, User, Sparkles, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { getPatients, Patient } from "@/lib/patients";
import { getMedications, Medication } from "@/lib/medications";
import { analyzeDose, AnalysisResult } from "@/services/aiService";
import { saveDose } from "@/lib/doses";
import { toast } from "@/hooks/use-toast";

export default function DoseRegister() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [showResult, setShowResult] = useState(false);

  // Data State
  const [patients, setPatients] = useState<Patient[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Form State
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [selectedMedicationId, setSelectedMedicationId] = useState<string>("");
  const [doseAmount, setDoseAmount] = useState("");
  const [adminForm, setAdminForm] = useState("");
  const [doseTime, setDoseTime] = useState("08:00");
  const [indication, setIndication] = useState("");

  // Subjective State
  const [mood, setMood] = useState([3]);
  const [energy, setEnergy] = useState([5]);
  const [sleep, setSleep] = useState([7]);
  const [effects, setEffects] = useState("");

  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        const [patientsData, medicationsData] = await Promise.all([
          getPatients(user.uid),
          getMedications(user.uid)
        ]);
        setPatients(patientsData);
        setMedications(medicationsData);
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar pacientes ou medicamentos.",
          variant: "destructive"
        });
      } finally {
        setLoadingData(false);
      }
    }
    loadData();
  }, [user]);

  const handleSubmit = async () => {
    if (!selectedPatientId || !selectedMedicationId) {
      toast({
        title: "Campos obrigatórios",
        description: "Selecione um paciente e um medicamento.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analyzeDose(
        {
          patientId: selectedPatientId,
          medicationId: selectedMedicationId,
          dose: doseAmount,
          time: doseTime,
          indication: indication
        },
        {
          mood: mood[0],
          energy: energy[0],
          sleep: sleep[0],
          effects: effects
        }
      );
      setAnalysisResult(result);

      // Save to Firebase
      try {
        await saveDose({
          patientId: selectedPatientId,
          medicationId: selectedMedicationId,
          doseAmount: doseAmount,
          time: doseTime,
          indication: indication,
          subjectiveState: {
            mood: mood[0],
            energy: energy[0],
            sleep: sleep[0],
            effects: effects
          },
          analysis: result,
          timestamp: new Date().toISOString(),
          createdAt: new Date().toISOString()
        }, user.uid);

        setShowResult(true);
        toast({
          title: "Dose Registrada!",
          description: "Dados salvos com sucesso no histórico.",
        });

      } catch (saveError) {
        console.error("Failed to save dose:", saveError);
        toast({
          title: "Erro ao salvar",
          description: "Análise concluída, mas falha ao salvar no histórico.",
          variant: "destructive"
        });
        // Still show result even if save failed? Perhaps yes, to not lose data visibility
        setShowResult(true);
      }

    } catch (error) {
      toast({
        title: "Erro na análise",
        description: "Falha ao processar análise da dose.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const moods = ["😞", "😔", "😐", "🙂", "😊"];

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">
            Registrar Dose
          </h1>
          <p className="text-muted-foreground mt-1">
            Registre uma nova dose com contexto clínico e subjetivo
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                  step >= s
                    ? "bg-neuro-gradient text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {s}
              </div>
              {s < 3 && (
                <div
                  className={cn(
                    "w-16 h-0.5 mx-2",
                    step > s ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {!showResult ? (
          <div className="glass-card rounded-2xl p-8">
            {/* Step 1: Dose Info */}
            {step === 1 && (
              <div className="space-y-6 animate-fade-up">
                <div className="flex items-center gap-3 pb-4 border-b border-border">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Pill className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-display font-semibold text-lg">
                      Informações da Dose
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Dados do medicamento e dosagem
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Paciente</Label>
                    <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                      <SelectTrigger>
                        <SelectValue placeholder={loadingData ? "Carregando..." : "Selecione o paciente"} />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.length > 0 ? (
                          patients.map((p) => (
                            <SelectItem key={p.id} value={p.id || "unknown"}>
                              {p.name}, {p.age} anos
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>
                            {loadingData ? "Carregando..." : "Nenhum paciente cadastrado"}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Medicamento</Label>
                    <Select value={selectedMedicationId} onValueChange={setSelectedMedicationId}>
                      <SelectTrigger>
                        <SelectValue placeholder={loadingData ? "Carregando..." : "Selecione o medicamento"} />
                      </SelectTrigger>
                      <SelectContent>
                        {medications.length > 0 ? (
                          medications.map((m) => (
                            <SelectItem key={m.id} value={m.id || "unknown"}>
                              {m.name} ({m.brandName})
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>
                            {loadingData ? "Carregando..." : "Nenhum medicamento cadastrado"}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Dose (mg)</Label>
                    <Input
                      type="number"
                      placeholder="Ex: 20"
                      value={doseAmount}
                      onChange={(e) => setDoseAmount(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Forma de Administração</Label>
                    <Select value={adminForm} onValueChange={setAdminForm}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="oral">Oral</SelectItem>
                        <SelectItem value="sublingual">Sublingual</SelectItem>
                        <SelectItem value="injection">Injetável</SelectItem>
                        <SelectItem value="topical">Tópico</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Horário</Label>
                    <Input
                      type="time"
                      value={doseTime}
                      onChange={(e) => setDoseTime(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Indicação</Label>
                    <Input
                      placeholder="Ex: TDAH, Depressão"
                      value={indication}
                      onChange={(e) => setIndication(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Subjective State */}
            {step === 2 && (
              <div className="space-y-6 animate-fade-up">
                <div className="flex items-center gap-3 pb-4 border-b border-border">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                    <User className="w-5 h-5 text-secondary-foreground" />
                  </div>
                  <div>
                    <h2 className="font-display font-semibold text-lg">
                      Estado Subjetivo
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Como o paciente está se sentindo
                    </p>
                  </div>
                </div>

                <div className="space-y-8">
                  {/* Mood */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Humor</Label>
                      <span className="text-3xl">{moods[mood[0] - 1]}</span>
                    </div>
                    <Slider
                      value={mood}
                      onValueChange={setMood}
                      min={1}
                      max={5}
                      step={1}
                      className="py-4"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Muito baixo</span>
                      <span>Neutro</span>
                      <span>Ótimo</span>
                    </div>
                  </div>

                  {/* Energy */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Nível de Energia</Label>
                      <span className="font-medium">{energy[0]}/10</span>
                    </div>
                    <Slider
                      value={energy}
                      onValueChange={setEnergy}
                      min={0}
                      max={10}
                      step={1}
                      className="py-4"
                    />
                  </div>

                  {/* Sleep */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Qualidade do Sono (noite anterior)</Label>
                      <span className="font-medium">{sleep[0]}/10</span>
                    </div>
                    <Slider
                      value={sleep}
                      onValueChange={setSleep}
                      min={0}
                      max={10}
                      step={1}
                      className="py-4"
                    />
                  </div>

                  {/* Effects */}
                  <div className="space-y-2">
                    <Label>Efeitos Percebidos</Label>
                    <Textarea
                      placeholder="Descreva quaisquer efeitos observados..."
                      rows={3}
                      value={effects}
                      onChange={(e) => setEffects(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {step === 3 && (
              <div className="space-y-6 animate-fade-up">
                <div className="flex items-center gap-3 pb-4 border-b border-border">
                  <div className="w-10 h-10 rounded-xl bg-neuro-gradient flex items-center justify-center">
                    <Brain className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="font-display font-semibold text-lg">
                      Confirmação e Análise IA
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Revise os dados antes de enviar para análise
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4 p-4 rounded-xl bg-muted/30">
                    <h3 className="font-medium text-sm text-muted-foreground">
                      Dados da Dose
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Paciente</span>
                        <span className="font-medium">
                          {patients.find(p => p.id === selectedPatientId)?.name || "Não selecionado"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Medicamento</span>
                        <span className="font-medium">
                          {medications.find(m => m.id === selectedMedicationId)?.name || "Não selecionado"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Dose</span>
                        <span className="font-medium">{doseAmount || "-"} mg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Horário</span>
                        <span className="font-medium">{doseTime}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 p-4 rounded-xl bg-muted/30">
                    <h3 className="font-medium text-sm text-muted-foreground">
                      Estado Subjetivo
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Humor</span>
                        <span className="text-xl">{moods[mood[0] - 1]}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Energia</span>
                        <span className="font-medium">{energy[0]}/10</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sono</span>
                        <span className="font-medium">{sleep[0]}/10</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-neuro-gradient-subtle border border-primary/20">
                  <div className="flex items-center gap-2 text-primary mb-2">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-medium">Análise de IA</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Ao confirmar, os dados serão enviados para o módulo de IA que
                    irá prever a eficácia esperada e identificar possíveis riscos.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 mt-6 border-t border-border">
              <Button
                variant="ghost"
                onClick={() => setStep(Math.max(1, step - 1))}
                disabled={step === 1}
              >
                Voltar
              </Button>
              {step < 3 ? (
                <Button variant="neuro" onClick={() => setStep(step + 1)}>
                  Continuar
                </Button>
              ) : (
                <Button variant="neuro" onClick={handleSubmit} disabled={isAnalyzing}>
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analisando...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
                      Registrar e Analisar
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        ) : (
          /* Result Card */
          <div className="glass-card rounded-2xl p-8 animate-fade-up">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <h2 className="font-display font-bold text-2xl mb-2">
                Dose Registrada com Sucesso
              </h2>
              <p className="text-muted-foreground">
                A análise de IA foi concluída
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Efficacy Prediction */}
              <div className="text-center p-6 rounded-xl bg-muted/30">
                <h3 className="text-sm font-medium text-muted-foreground mb-4">
                  Eficácia Prevista
                </h3>
                <div className="flex justify-center mb-4">
                  <EfficacyRing value={analysisResult?.efficacyPrediction || 0} size="lg" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Baseado no histórico do paciente e condições atuais
                </p>
              </div>

              {/* Risk Assessment */}
              <div className="p-6 rounded-xl bg-muted/30">
                <h3 className="text-sm font-medium text-muted-foreground mb-4">
                  Avaliação de Risco
                </h3>
                <div className="space-y-4">
                  {analysisResult?.riskAssessment.map((risk, index) => (
                    <div key={index} className={cn(
                      "flex items-center justify-between p-3 rounded-lg border",
                      risk.level === "Baixo" ? "bg-success/10 border-success/20" :
                        risk.level === "Médio" ? "bg-warning/10 border-warning/20" :
                          "bg-destructive/10 border-destructive/20"
                    )}>
                      <div className="flex flex-col text-left">
                        <span className="text-sm font-medium">{risk.category}</span>
                        <span className="text-xs text-muted-foreground">{risk.description}</span>
                      </div>
                      <span className={cn(
                        "text-sm font-medium ml-2",
                        risk.level === "Baixo" ? "text-success" :
                          risk.level === "Médio" ? "text-warning" :
                            "text-destructive"
                      )}>
                        {risk.level}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Recommendation */}
            <div className="mt-6 p-4 rounded-xl bg-neuro-gradient-subtle border border-primary/20">
              <div className="flex items-start gap-3">
                <Brain className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm mb-1">
                    Recomendação da IA
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {analysisResult?.recommendation}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4 mt-8">
              <Button variant="outline" onClick={() => { setStep(1); setShowResult(false); }}>
                Novo Registro
              </Button>
              <Button variant="neuro">Ver Histórico</Button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
