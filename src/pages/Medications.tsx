import { useState, useEffect, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import {
  saveMedication,
  getMedications,
  deleteMedication,
  type Medication,
} from "@/lib/medications";
import { toast } from "@/hooks/use-toast";
import { checkInteractions, InteractionAlert } from "@/services/drugInteractions";
import { InteractionAlertPanel } from "@/components/alerts/InteractionAlert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  Pill,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Filter,
  Beaker,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const therapeuticClassColors: Record<string, string> = {
  Psicoestimulante: "bg-info/10 text-info border-info/20",
  "Antidepressivo IRSN": "bg-secondary text-secondary-foreground",
  "Antipsicótico Atípico": "bg-warning/10 text-warning border-warning/20",
  "Antidepressivo ISRS": "bg-success/10 text-success border-success/20",
  "Estabilizador de Humor": "bg-primary/10 text-primary border-primary/20",
  Benzodiazepínico: "bg-destructive/10 text-destructive border-destructive/20",
};

// Mapeamento de valores para labels
const therapeuticClassMap: Record<string, string> = {
  stimulant: "Psicoestimulante",
  "antidepressant-irsn": "Antidepressivo IRSN",
  "antidepressant-isrs": "Antidepressivo ISRS",
  antipsychotic: "Antipsicótico Atípico",
  stabilizer: "Estabilizador de Humor",
  benzo: "Benzodiazepínico",
};

const formMap: Record<string, string> = {
  tablet: "Comprimido",
  capsule: "Cápsula",
  solution: "Solução",
  injection: "Injetável",
};

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Check, ChevronDown } from "lucide-react";

export default function Medications() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Estados para ações
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingMedication, setViewingMedication] = useState<Medication | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [medicationToDelete, setMedicationToDelete] = useState<Medication | null>(null);

  // Estados para filtro
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  // Detectar interações medicamentosas
  const interactionAlerts = useMemo(() => {
    if (medications.length < 2) return [];
    const alerts = checkInteractions(medications);
    return alerts.filter(alert => !dismissedAlerts.includes(alert.id));
  }, [medications, dismissedAlerts]);

  const handleDismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => [...prev, alertId]);
  };

  // Estados do formulário
  const [formData, setFormData] = useState({
    name: "",
    brandName: "",
    activeIngredient: "",
    therapeuticClass: "",
    form: "",
    minDose: "",
    maxDose: "",
    unit: "mg",
  });

  // Carregar medicamentos do Firebase
  useEffect(() => {
    const loadMedications = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const medicationsData = await getMedications(user.uid);
        setMedications(medicationsData);
      } catch (error: unknown) {
        console.error("Erro ao carregar medicamentos:", error);

        const errorObj = (typeof error === "object" && error !== null ? error : {}) as Record<string, unknown>;
        const errorCode = typeof errorObj.code === "string" ? errorObj.code : "";
        const errorMessage = typeof errorObj.message === "string" ? errorObj.message : "";
        const isPermissionError =
          errorCode.includes("permission") ||
          errorCode.includes("PERMISSION") ||
          errorMessage.includes("permission") ||
          errorCode.includes("database") ||
          errorMessage.includes("database");

        if (!isPermissionError) {
          toast({
            title: "Erro ao carregar medicamentos",
            description: "Não foi possível carregar a lista de medicamentos.",
            variant: "destructive",
          });
        }

        setMedications([]);
      } finally {
        setLoading(false);
      }
    };

    loadMedications();
  }, [user]);

  // Toggle de seleção de classe
  const toggleClass = (className: string) => {
    setSelectedClasses(prev =>
      prev.includes(className)
        ? prev.filter(c => c !== className)
        : [...prev, className]
    );
  };

  // Filtrar medicamentos
  const filteredMedications = medications.filter(
    (med) => {
      const matchesSearch =
        med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        med.brandName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesClass =
        selectedClasses.length === 0 ||
        selectedClasses.includes(med.therapeuticClass);

      return matchesSearch && matchesClass;
    }
  );

  const dtf = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });
  const totalMedications = medications.length;
  const filteredTotal = filteredMedications.length;
  const uniqueClasses = new Set(medications.map((m) => m.therapeuticClass)).size;
  const hasActiveFilters = !!searchTerm || selectedClasses.length > 0;

  // Resetar formulário
  const resetForm = () => {
    setFormData({
      name: "",
      brandName: "",
      activeIngredient: "",
      therapeuticClass: "",
      form: "",
      minDose: "",
      maxDose: "",
      unit: "mg",
    });
    setEditingId(null);
  };

  // Abrir modal de edição
  const handleEdit = (medication: Medication) => {
    setEditingId(medication.id || null);

    // Encontrar chave da classe terapêutica pelo valor (nome legível)
    const therapeuticClassKey = Object.keys(therapeuticClassMap).find(
      key => therapeuticClassMap[key] === medication.therapeuticClass
    ) || medication.therapeuticClass;

    // Encontrar chave da forma farmacêutica pelo valor
    const formKey = Object.keys(formMap).find(
      key => formMap[key] === medication.form
    ) || medication.form;

    setFormData({
      name: medication.name,
      brandName: medication.brandName,
      activeIngredient: medication.activeIngredient,
      therapeuticClass: therapeuticClassKey,
      form: formKey,
      minDose: medication.minDose.toString(),
      maxDose: medication.maxDose.toString(),
      unit: medication.unit,
    });
    setIsDialogOpen(true);
  };

  // Abrir modal de visualização
  const handleView = (medication: Medication) => {
    setViewingMedication(medication);
  };

  // Abrir modal de exclusão
  const handleDelete = (medication: Medication) => {
    setMedicationToDelete(medication);
    setIsDeleteOpen(true);
  };

  // Confirmar exclusão
  const confirmDelete = async () => {
    if (!user || !medicationToDelete?.id) return;

    try {
      const userInfo = { name: user.displayName || undefined, email: user.email || undefined };
      await deleteMedication(medicationToDelete.id, user.uid, medicationToDelete.name, userInfo);

      toast({
        title: "Medicamento excluído",
        description: "O medicamento foi removido com sucesso.",
      });

      // Atualizar lista localmente
      setMedications(medications.filter(m => m.id !== medicationToDelete.id));
    } catch (error) {
      console.error("Erro ao excluir medicamento:", error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o medicamento.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteOpen(false);
      setMedicationToDelete(null);
    }
  };

  // Salvar medicamento
  const handleSaveMedication = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para cadastrar medicamentos.",
        variant: "destructive",
      });
      return;
    }

    // Validação
    if (
      !formData.name ||
      !formData.brandName ||
      !formData.activeIngredient ||
      !formData.therapeuticClass ||
      !formData.form ||
      !formData.minDose ||
      !formData.maxDose ||
      !formData.unit
    ) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    // Validar doses
    const minDose = parseFloat(formData.minDose);
    const maxDose = parseFloat(formData.maxDose);

    if (isNaN(minDose) || isNaN(maxDose)) {
      toast({
        title: "Doses inválidas",
        description: "As doses devem ser números válidos.",
        variant: "destructive",
      });
      return;
    }

    if (minDose >= maxDose) {
      toast({
        title: "Doses inválidas",
        description: "A dose mínima deve ser menor que a dose máxima.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      // Criar objeto do medicamento
      const medicationData: Medication = {
        ...(editingId ? { id: editingId } : {}),
        name: formData.name,
        brandName: formData.brandName,
        activeIngredient: formData.activeIngredient,
        therapeuticClass: therapeuticClassMap[formData.therapeuticClass] || formData.therapeuticClass,
        form: formMap[formData.form] || formData.form,
        minDose: minDose,
        maxDose: maxDose,
        unit: formData.unit,
      };

      // Salvar medicamento no Realtime Database
      const userInfo = { name: user.displayName || undefined, email: user.email || undefined };
      await saveMedication(medicationData, user.uid, userInfo);

      toast({
        title: editingId ? "Medicamento atualizado!" : "Medicamento cadastrado!",
        description: `${formData.name} foi ${editingId ? "atualizado" : "cadastrado"} com sucesso.`,
      });

      // Recarregar lista de medicamentos
      const medicationsData = await getMedications(user.uid);
      setMedications(medicationsData);

      // Fechar dialog e resetar formulário
      setIsDialogOpen(false);
      resetForm();
    } catch (error: unknown) {
      console.error("Erro ao salvar medicamento:", error);

      const errorObj = (typeof error === "object" && error !== null ? error : {}) as Record<string, unknown>;
      const code = typeof errorObj.code === "string" ? errorObj.code : "";
      const message = typeof errorObj.message === "string" ? errorObj.message : "";

      let errorMessage = "Não foi possível cadastrar o medicamento. Tente novamente.";

      if (message) {
        errorMessage = message;
      } else if (code) {
        if (code.includes("permission")) {
          errorMessage = "Permissão negada. Verifique as regras do Realtime Database no Firebase Console.";
        } else if (code.includes("database")) {
          errorMessage = "Realtime Database não está configurado. Configure no Firebase Console.";
        }
      }

      toast({
        title: "Erro ao salvar medicamento",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-8 pb-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-neuro-gradient flex items-center justify-center shadow-md">
              <Pill className="w-6 h-6 text-primary-foreground" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-balance">
                Medicamentos
              </h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                Catálogo de medicamentos com classes, dosagens e formas farmacêuticas
              </p>
            </div>
          </div>

          {/* Alertas de Interação Medicamentosa */}
          {interactionAlerts.length > 0 && (
            <div className="glass-card rounded-2xl p-6">
              <InteractionAlertPanel
                alerts={interactionAlerts}
                onDismiss={handleDismissAlert}
              />
            </div>
          )}

          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button variant="neuro" className="h-11">
                <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
                Novo Medicamento
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[650px]">
              <DialogHeader>
                <DialogTitle className="font-display">
                  {editingId ? "Editar Medicamento" : "Cadastrar Medicamento"}
                </DialogTitle>
                <DialogDescription>
                  {editingId ? "Atualize os dados do medicamento." : "Adicione um novo medicamento ao catálogo."}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-5 py-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="med-name">Nome Genérico *</Label>
                    <Input
                      id="med-name"
                      name="medName"
                      autoComplete="off"
                      placeholder="Ex.: Metilfenidato…"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="med-brand">Nome Comercial *</Label>
                    <Input
                      id="med-brand"
                      name="medBrand"
                      autoComplete="off"
                      placeholder="Ex.: Ritalina…"
                      value={formData.brandName}
                      onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="med-active">Princípio Ativo *</Label>
                  <Input
                    id="med-active"
                    name="medActiveIngredient"
                    autoComplete="off"
                    placeholder="Ex.: Cloridrato de metilfenidato…"
                    value={formData.activeIngredient}
                    onChange={(e) => setFormData({ ...formData, activeIngredient: e.target.value })}
                    className="h-11"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="med-class">Classe Terapêutica *</Label>
                    <Select
                      value={formData.therapeuticClass}
                      onValueChange={(value) => setFormData({ ...formData, therapeuticClass: value })}
                    >
                      <SelectTrigger id="med-class" className="h-11">
                        <SelectValue placeholder="Selecione…" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stimulant">Psicoestimulante</SelectItem>
                        <SelectItem value="antidepressant-irsn">Antidepressivo IRSN</SelectItem>
                        <SelectItem value="antidepressant-isrs">Antidepressivo ISRS</SelectItem>
                        <SelectItem value="antipsychotic">Antipsicótico Atípico</SelectItem>
                        <SelectItem value="stabilizer">Estabilizador de Humor</SelectItem>
                        <SelectItem value="benzo">Benzodiazepínico</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="med-form">Forma Farmacêutica *</Label>
                    <Select
                      value={formData.form}
                      onValueChange={(value) => setFormData({ ...formData, form: value })}
                    >
                      <SelectTrigger id="med-form" className="h-11">
                        <SelectValue placeholder="Selecione…" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tablet">Comprimido</SelectItem>
                        <SelectItem value="capsule">Cápsula</SelectItem>
                        <SelectItem value="solution">Solução</SelectItem>
                        <SelectItem value="injection">Injetável</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="med-min">Dose Mínima *</Label>
                    <Input
                      id="med-min"
                      name="medMinDose"
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      autoComplete="off"
                      placeholder="Ex.: 5…"
                      value={formData.minDose}
                      onChange={(e) => setFormData({ ...formData, minDose: e.target.value })}
                      className="h-11 tabular-nums"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="med-max">Dose Máxima *</Label>
                    <Input
                      id="med-max"
                      name="medMaxDose"
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      autoComplete="off"
                      placeholder="Ex.: 60…"
                      value={formData.maxDose}
                      onChange={(e) => setFormData({ ...formData, maxDose: e.target.value })}
                      className="h-11 tabular-nums"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="med-unit">Unidade *</Label>
                    <Select
                      value={formData.unit}
                      onValueChange={(value) => setFormData({ ...formData, unit: value })}
                    >
                      <SelectTrigger id="med-unit" className="h-11">
                        <SelectValue placeholder="mg" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mg">mg</SelectItem>
                        <SelectItem value="g">g</SelectItem>
                        <SelectItem value="ml">ml</SelectItem>
                        <SelectItem value="mcg">mcg</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                  disabled={saving}
                  className="h-11"
                >
                  Cancelar
                </Button>
                <Button variant="neuro" onClick={handleSaveMedication} disabled={saving} className="h-11">
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                      Salvando…
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
                      {editingId ? "Atualizar" : "Cadastrar"}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Dialog de Visualização */}
          <Dialog open={!!viewingMedication} onOpenChange={(open) => !open && setViewingMedication(null)}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle className="font-display">Detalhes do Medicamento</DialogTitle>
              </DialogHeader>
              {viewingMedication && (
                <div className="grid gap-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Pill className="w-8 h-8 text-primary" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-bold">{viewingMedication.name}</h3>
                      <p className="text-muted-foreground">{viewingMedication.brandName}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Princípio Ativo</Label>
                      <p className="font-medium">{viewingMedication.activeIngredient}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Classe Terapêutica</Label>
                      <Badge variant="outline" className={therapeuticClassColors[viewingMedication.therapeuticClass]}>
                        {viewingMedication.therapeuticClass}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Forma Farmacêutica</Label>
                      <p className="font-medium">{viewingMedication.form}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Dosagem</Label>
                      <p className="font-medium">
                        {viewingMedication.minDose} - {viewingMedication.maxDose} {viewingMedication.unit}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t text-sm text-muted-foreground flex justify-between">
                    <span>ID: {viewingMedication.id}</span>
                    <span>
                      Cadastrado em: {viewingMedication.createdAt ? dtf.format(new Date(viewingMedication.createdAt)) : "—"}
                    </span>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button onClick={() => setViewingMedication(null)} className="h-11">Fechar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Dialog de Confirmação de Exclusão */}
          <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Excluir Medicamento</DialogTitle>
                <DialogDescription>
                  Tem certeza que deseja excluir o medicamento <strong>{medicationToDelete?.name}</strong>?
                  Esta ação não pode ser desfeita.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDeleteOpen(false)} className="h-11">
                  Cancelar
                </Button>
                <Button variant="destructive" onClick={confirmDelete} className="h-11">
                  Excluir
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        {!loading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card rounded-xl p-4 border-l-4 border-l-primary">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total</p>
                  <p className="text-2xl font-display font-bold mt-1 tabular-nums">{totalMedications}</p>
                </div>
                <Pill className="w-8 h-8 text-primary/60" aria-hidden="true" />
              </div>
            </div>
            <div className="glass-card rounded-xl p-4 border-l-4 border-l-info">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Classes</p>
                  <p className="text-2xl font-display font-bold mt-1 tabular-nums">{uniqueClasses}</p>
                </div>
                <Beaker className="w-8 h-8 text-info/60" aria-hidden="true" />
              </div>
            </div>
            <div className="glass-card rounded-xl p-4 border-l-4 border-l-success">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Exibindo</p>
                  <p className="text-2xl font-display font-bold mt-1 tabular-nums">{filteredTotal}</p>
                </div>
                <Search className="w-8 h-8 text-success/60" aria-hidden="true" />
              </div>
            </div>
            <div className="glass-card rounded-xl p-4 border-l-4 border-l-warning">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Filtros</p>
                  <p className="text-2xl font-display font-bold mt-1 tabular-nums">{hasActiveFilters ? selectedClasses.length + (searchTerm ? 1 : 0) : 0}</p>
                </div>
                <Filter className="w-8 h-8 text-warning/60" aria-hidden="true" />
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="glass-card rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Filter className="w-4 h-4 text-primary" aria-hidden="true" />
            </div>
            <h2 className="font-display font-semibold text-lg">Busca e Filtros</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
            <div className="lg:col-span-8 space-y-2">
              <Label htmlFor="med-search" className="text-sm font-semibold">Busca</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="med-search"
                  name="medSearch"
                  autoComplete="off"
                  placeholder="Buscar por nome genérico ou comercial…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
            </div>

            <div className="lg:col-span-4 flex items-center gap-2">
              <Collapsible
                open={isFilterOpen}
                onOpenChange={setIsFilterOpen}
                className="w-full"
              >
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full h-11 justify-between">
                    <span className="inline-flex items-center">
                      <Filter className="w-4 h-4 mr-2" aria-hidden="true" />
                      Filtrar por Classe
                    </span>
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 transition-[transform] duration-200",
                        isFilterOpen ? "rotate-180" : ""
                      )}
                      aria-hidden="true"
                    />
                  </Button>
                </CollapsibleTrigger>
              </Collapsible>

              <Button
                variant="ghost"
                className="h-11"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedClasses([]);
                }}
                disabled={!hasActiveFilters}
              >
                Limpar
              </Button>
            </div>
          </div>

          <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <CollapsibleContent className="overflow-hidden pt-4">
              <div className="bg-muted/20 p-4 rounded-xl border border-border">
                <p className="text-sm font-medium mb-3">
                  Selecione as classes terapêuticas:
                </p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(therapeuticClassMap).map(([key, label]) => {
                    const isSelected = selectedClasses.includes(label);
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => toggleClass(label)}
                        className={cn(
                          "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
                          "transition-[background-color,color,border-color] duration-200",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                          isSelected
                            ? "border-transparent bg-primary text-primary-foreground hover:bg-primary/90"
                            : "border-border bg-background hover:bg-muted/50"
                        )}
                        aria-pressed={isSelected}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 mr-1" aria-hidden="true" />}
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Grid of Medication Cards */}
        {loading ? (
          <div className="glass-card rounded-2xl p-12 flex items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-primary" aria-hidden="true" />
            <span className="text-muted-foreground font-medium">Carregando medicamentos…</span>
          </div>
        ) : filteredMedications.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Pill className="w-7 h-7 text-muted-foreground" aria-hidden="true" />
            </div>
            <p className="font-display font-semibold text-lg">
              {hasActiveFilters ? "Nenhum resultado para os filtros" : "Nenhum medicamento cadastrado"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {hasActiveFilters ? "Tente ajustar a busca ou remover filtros." : "Cadastre o primeiro medicamento para começar."}
            </p>
            <div className="mt-6 flex justify-center">
              <Button variant="neuro" onClick={() => setIsDialogOpen(true)} className="h-11">
                <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
                Cadastrar Medicamento
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMedications.map((med) => (
              <div
                key={med.id}
                className={cn(
                  "glass-card rounded-2xl p-6",
                  "transition-[transform,box-shadow,background-color] duration-200",
                  "hover:shadow-lg hover:bg-card/90"
                )}
                style={{ contentVisibility: "auto" }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Pill className="w-6 h-6 text-primary" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display font-semibold truncate">{med.name}</h3>
                      <p className="text-sm text-muted-foreground truncate">{med.brandName}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label={`Ações para ${med.name}`}>
                        <MoreHorizontal className="w-4 h-4" aria-hidden="true" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleView(med)}>
                        <Eye className="w-4 h-4 mr-2" aria-hidden="true" />
                        Ver Detalhes
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(med)}>
                        <Edit className="w-4 h-4 mr-2" aria-hidden="true" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDelete(med)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" aria-hidden="true" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Beaker className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                    <span className="text-sm text-muted-foreground line-clamp-2 break-words">{med.activeIngredient}</span>
                  </div>

                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      therapeuticClassColors[med.therapeuticClass] || "bg-muted"
                    )}
                  >
                    {med.therapeuticClass}
                  </Badge>

                  <div className="pt-3 border-t border-border space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Forma</span>
                      <span className="font-medium">{med.form}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Dose</span>
                      <span className="font-medium tabular-nums">
                        {med.minDose} - {med.maxDose} {med.unit}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Cadastrado em</span>
                      <span className="font-medium tabular-nums">
                        {med.createdAt ? dtf.format(new Date(med.createdAt)) : "—"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
