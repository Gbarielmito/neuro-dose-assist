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
import { PostDoseInsightCard } from "@/components/dashboard/PostDoseInsightCard";
import { Link } from "react-router-dom";
import { Brain, Pill, User, Sparkles, AlertTriangle, CheckCircle, Loader2, ClipboardCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useClinic } from "@/contexts/ClinicContext";
import { getPatients, Patient } from "@/lib/patients";
import { getMedications, Medication } from "@/lib/medications";
import { analyzeDose, AnalysisResult, type ConfidenceLevel } from "@/services/aiService";
import { saveDose } from "@/lib/doses";
import { getUserSettings } from "@/lib/firestore";
import { toast } from "@/hooks/use-toast";

export default function DoseRegister() {
  const { user } = useAuth();
  const { effectiveUserId } = useClinic();
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
  const [confidenceLevel, setConfidenceLevel] = useState<ConfidenceLevel>('high');

  useEffect(() => {
    async function loadData() {
      if (!user || !effectiveUserId) return;
      try {
        const [patientsData, medicationsData] = await Promise.all([
          getPatients(effectiveUserId),
          getMedications(effectiveUserId)
        ]);
        setPatients(patientsData);
        setMedications(medicationsData);

        // Carregar nível de confiança da IA das configurações
        try {
          const settings = await getUserSettings(user.uid);
          if (settings?.ai?.confidence) {
            setConfidenceLevel(settings.ai.confidence);
          }
        } catch {
          // Usar padrão 'high' se não conseguir carregar
        }
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
    if (!selectedPatientId || !selectedMedicationId || !doseAmount || Number(doseAmount) <= 0 || !indication) {
      toast({
        title: "Campos obrigatórios",
        description: "Selecione paciente, medicamento, dose e indicação.",
        variant: "destructive"
      });
      return;
    }

    // Verificar se a dose ultrapassa o limite máximo do medicamento
    if (selectedMedication?.maxDose && Number(doseAmount) > selectedMedication.maxDose) {
      toast({
        title: "Dose acima do limite",
        description: `A dose informada (${doseAmount} mg) excede o limite máximo de ${selectedMedication.maxDose} mg cadastrado para ${selectedMedication.name}. Corrija antes de continuar.`,
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      // Preparar contexto do medicamento para a IA
      const medicationContext = selectedMedication ? {
        name: selectedMedication.name,
        brandName: selectedMedication.brandName,
        activeIngredient: selectedMedication.activeIngredient,
        therapeuticClass: selectedMedication.therapeuticClass,
        minDose: selectedMedication.minDose,
        maxDose: selectedMedication.maxDose,
        unit: selectedMedication.unit,
      } : undefined;

      // Preparar lista de todos medicamentos para verificação de interações
      const allMedsForCheck = medications.map(m => ({
        id: m.id,
        name: m.name,
        therapeuticClass: m.therapeuticClass,
        activeIngredient: m.activeIngredient,
      }));

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
        },
        medicationContext,
        allMedsForCheck,
        confidenceLevel
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
        }, effectiveUserId,
          { patientName: selectedPatient?.name, medicationName: selectedMedication?.name },
          { name: user.displayName || undefined, email: user.email || undefined }
        );

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

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);
  const selectedMedication = medications.find((m) => m.id === selectedMedicationId);

  const isDoseOverLimit = !!(selectedMedication?.maxDose && Number(doseAmount) > selectedMedication.maxDose);

  const canContinueStep1 =
    !!selectedPatientId &&
    !!selectedMedicationId &&
    !!doseAmount &&
    Number(doseAmount) > 0 &&
    !!doseTime &&
    !!indication &&
    !isDoseOverLimit;

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-8 pb-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-neuro-gradient flex items-center justify-center shadow-md">
            <Pill className="w-6 h-6 text-primary-foreground" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-balance">
              Registrar Dose
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Registre uma nova dose com contexto clínico, estado subjetivo e análise por IA
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Etapa {step} de 3
              </p>
              <p className="font-display font-semibold text-base truncate">
                {step === 1 ? "Informações da Dose" : step === 2 ? "Estado Subjetivo" : "Confirmação & IA"}
              </p>
            </div>
            <ol className="flex items-center gap-2" aria-label="Progresso">
              {[1, 2, 3].map((s) => (
                <li key={s} className="flex items-center">
                  <div
                    aria-current={step === s ? "step" : undefined}
                    className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold",
                      "transition-[background-color,color,box-shadow] duration-200",
                      step >= s
                        ? "bg-neuro-gradient text-primary-foreground shadow-sm"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {s}
                  </div>
                  {s < 3 && (
                    <div
                      className={cn(
                        "w-10 sm:w-14 h-0.5 mx-2 rounded-full",
                        step > s ? "bg-primary" : "bg-muted"
                      )}
                      aria-hidden="true"
                    />
                  )}
                </li>
              ))}
            </ol>
          </div>
        </div>

        {!showResult ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main form */}
            <div className="lg:col-span-8 glass-card rounded-2xl p-6 sm:p-8">
              {/* Step 1: Dose Info */}
              {step === 1 && (
                <div className="space-y-6 animate-fade-up">
                  <div className="flex items-center gap-3 pb-4 border-b border-border">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Pill className="w-5 h-5 text-primary" aria-hidden="true" />
                    </div>
                    <div>
                      <h2 className="font-display font-semibold text-lg">
                        Informações da Dose
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Selecione paciente, medicamento e contexto da dose
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="patientId">Paciente</Label>
                      <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                        <SelectTrigger id="patientId" className="h-11">
                          <SelectValue placeholder={loadingData ? "Carregando…" : "Selecione…"} />
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
                              {loadingData ? "Carregando…" : "Nenhum paciente cadastrado"}
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="medicationId">Medicamento</Label>
                      <Select value={selectedMedicationId} onValueChange={setSelectedMedicationId}>
                        <SelectTrigger id="medicationId" className="h-11">
                          <SelectValue placeholder={loadingData ? "Carregando…" : "Selecione…"} />
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
                              {loadingData ? "Carregando…" : "Nenhum medicamento cadastrado"}
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="doseAmount">Dose (mg)</Label>
                      <Input
                        id="doseAmount"
                        name="doseAmount"
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step="any"
                        autoComplete="off"
                        placeholder="Ex.: 20…"
                        value={doseAmount}
                        onChange={(e) => {
                          let val = e.target.value;
                          // Limitar a 2 casas decimais
                          const dotIndex = val.indexOf('.');
                          if (dotIndex !== -1 && val.length - dotIndex - 1 > 2) {
                            val = val.slice(0, dotIndex + 3);
                          }
                          setDoseAmount(val);
                        }}
                        className="h-11"
                      />
                      {isDoseOverLimit ? (
                        <p className="text-xs text-destructive font-medium">
                          ⚠ Dose excede o limite máximo de {selectedMedication?.maxDose} mg para {selectedMedication?.name}.
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          Use o valor em mg (ex.: 20). Evite texto.
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="adminForm">Forma de Administração</Label>
                      <Select value={adminForm} onValueChange={setAdminForm}>
                        <SelectTrigger id="adminForm" className="h-11">
                          <SelectValue placeholder="Selecione…" />
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
                      <Label htmlFor="doseTime">Horário</Label>
                      <Input
                        id="doseTime"
                        name="doseTime"
                        type="time"
                        autoComplete="off"
                        value={doseTime}
                        onChange={(e) => {
                          let val = e.target.value;
                          // Validar que minutos não ultrapassem 59 e horas não ultrapassem 23
                          const parts = val.split(':');
                          if (parts.length === 2) {
                            let hours = Math.min(23, Math.max(0, parseInt(parts[0]) || 0));
                            let minutes = Math.min(59, Math.max(0, parseInt(parts[1]) || 0));
                            val = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
                          }
                          setDoseTime(val);
                        }}
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="indication">Indicação</Label>
                      <Input
                        id="indication"
                        name="indication"
                        autoComplete="off"
                        placeholder="Ex.: TDAH, depressão…"
                        value={indication}
                        onChange={(e) => setIndication(e.target.value)}
                        className="h-11"
                      />
                      <p className="text-xs text-muted-foreground">
                        Informe o motivo clínico (uma ou mais condições).
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Subjective State */}
              {step === 2 && (
                <div className="space-y-6 animate-fade-up">
                  <div className="flex items-center gap-3 pb-4 border-b border-border">
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                      <User className="w-5 h-5 text-secondary-foreground" aria-hidden="true" />
                    </div>
                    <div>
                      <h2 className="font-display font-semibold text-lg">
                        Estado Subjetivo
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Registre o estado atual para contextualizar a análise
                      </p>
                    </div>
                  </div>

                  <div className="space-y-8">
                    {/* Mood */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Humor</Label>
                        <span className="text-3xl" aria-hidden="true">{moods[mood[0] - 1]}</span>
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
                        <span className="font-medium tabular-nums">{energy[0]}/10</span>
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
                        <span className="font-medium tabular-nums">{sleep[0]}/10</span>
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
                      <Label htmlFor="effects">Efeitos Percebidos</Label>
                      <Textarea
                        id="effects"
                        name="effects"
                        autoComplete="off"
                        placeholder="Descreva efeitos observados (se houver)…"
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
                      <Brain className="w-5 h-5 text-primary-foreground" aria-hidden="true" />
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
                            {selectedPatient?.name || "Não selecionado"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Medicamento</span>
                          <span className="font-medium">
                            {selectedMedication?.name || "Não selecionado"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Dose</span>
                          <span className="font-medium tabular-nums">{doseAmount || "-"} mg</span>
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
                          <span className="text-xl" aria-hidden="true">{moods[mood[0] - 1]}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Energia</span>
                          <span className="font-medium tabular-nums">{energy[0]}/10</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Sono</span>
                          <span className="font-medium tabular-nums">{sleep[0]}/10</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-neuro-gradient-subtle border border-primary/20">
                    <div className="flex items-center gap-2 text-primary mb-2">
                      <Sparkles className="w-4 h-4" aria-hidden="true" />
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
                  <Button
                    variant="neuro"
                    onClick={() => setStep(step + 1)}
                    disabled={step === 1 ? !canContinueStep1 : false}
                  >
                    Continuar
                  </Button>
                ) : (
                  <Button variant="neuro" onClick={handleSubmit} disabled={isAnalyzing}>
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analisando…
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4 mr-2" aria-hidden="true" />
                        Registrar e Analisar
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Side summary */}
            <aside className="lg:col-span-4 space-y-6">
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <ClipboardCheck className="w-5 h-5 text-primary" aria-hidden="true" />
                  </div>
                  <h2 className="font-display font-semibold text-base">Resumo</h2>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Paciente</span>
                    <span className="font-medium truncate">{selectedPatient?.name || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Medicamento</span>
                    <span className="font-medium truncate">{selectedMedication?.name || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Dose</span>
                    <span className="font-medium tabular-nums">{doseAmount ? `${doseAmount} mg` : "—"}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Horário</span>
                    <span className="font-medium tabular-nums">{doseTime || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Indicação</span>
                    <span className="font-medium truncate">{indication || "—"}</span>
                  </div>
                </div>

                {!loadingData && (patients.length === 0 || medications.length === 0) && (
                  <div className="mt-5 pt-5 border-t border-border space-y-3">
                    <p className="text-sm font-medium">Faltam cadastros para registrar doses.</p>
                    <div className="flex flex-col gap-2">
                      {patients.length === 0 && (
                        <Button asChild variant="outline" className="justify-start">
                          <Link to="/patients">Cadastrar Paciente</Link>
                        </Button>
                      )}
                      {medications.length === 0 && (
                        <Button asChild variant="outline" className="justify-start">
                          <Link to="/medications">Cadastrar Medicamento</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center gap-2 text-primary mb-2">
                  <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                  <p className="text-sm font-semibold">Dica</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Para uma análise melhor, preencha indicação e efeitos percebidos (se houver).
                </p>
              </div>
            </aside>
          </div>
        ) : (
          /* Result Card */
          <div className="glass-card rounded-2xl p-8 animate-fade-up">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-success" aria-hidden="true" />
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
                <Brain className="w-5 h-5 text-primary mt-0.5" aria-hidden="true" />
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

            {/* Post-Dose AI Insights */}
            {analysisResult?.postDoseInsights && analysisResult.postDoseInsights.length > 0 && (
              <div className="mt-6">
                <PostDoseInsightCard insights={analysisResult.postDoseInsights} />
              </div>
            )}

            <div className="flex justify-center gap-4 mt-8">
              <Button variant="outline" onClick={() => { setStep(1); setShowResult(false); }}>
                Novo Registro
              </Button>
              <Button asChild variant="neuro">
                <Link to="/history">Ver Histórico</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
