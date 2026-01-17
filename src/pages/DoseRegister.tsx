import { useState } from "react";
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
import { Brain, Pill, Clock, User, Sparkles, AlertTriangle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DoseRegister() {
  const [step, setStep] = useState(1);
  const [showResult, setShowResult] = useState(false);
  const [mood, setMood] = useState([3]);
  const [energy, setEnergy] = useState([5]);
  const [sleep, setSleep] = useState([7]);

  const handleSubmit = () => {
    setShowResult(true);
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
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o paciente" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">João Silva, 45 anos</SelectItem>
                        <SelectItem value="2">Maria Santos, 32 anos</SelectItem>
                        <SelectItem value="3">Pedro Oliveira, 58 anos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Medicamento</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o medicamento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Metilfenidato (Ritalina)</SelectItem>
                        <SelectItem value="2">Venlafaxina (Effexor)</SelectItem>
                        <SelectItem value="3">Quetiapina (Seroquel)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Dose (mg)</Label>
                    <Input type="number" placeholder="Ex: 20" />
                  </div>

                  <div className="space-y-2">
                    <Label>Forma de Administração</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="oral">Oral</SelectItem>
                        <SelectItem value="sublingual">Sublingual</SelectItem>
                        <SelectItem value="injection">Injetável</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Horário</Label>
                    <Input type="time" defaultValue="08:00" />
                  </div>

                  <div className="space-y-2">
                    <Label>Indicação</Label>
                    <Input placeholder="Ex: TDAH, Depressão" />
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
                        <span className="font-medium">João Silva</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Medicamento</span>
                        <span className="font-medium">Metilfenidato</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Dose</span>
                        <span className="font-medium">20mg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Horário</span>
                        <span className="font-medium">08:00</span>
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
                <Button variant="neuro" onClick={handleSubmit}>
                  <Brain className="w-4 h-4 mr-2" />
                  Registrar e Analisar
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
                  <EfficacyRing value={85} size="lg" />
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
                  <div className="flex items-center justify-between p-3 rounded-lg bg-success/10 border border-success/20">
                    <span className="text-sm">Efeitos Colaterais</span>
                    <span className="text-sm font-medium text-success">
                      Risco Baixo (12%)
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-warning/10 border border-warning/20">
                    <span className="text-sm">Interação Medicamentosa</span>
                    <span className="text-sm font-medium text-warning">
                      Monitorar
                    </span>
                  </div>
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
                    Manter a dosagem atual. Considere adiantar o horário para 07:30
                    com base no padrão de sono do paciente para otimizar a absorção.
                    Próxima revisão sugerida em 5 dias.
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
