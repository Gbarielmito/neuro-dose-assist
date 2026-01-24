import { useState, useEffect } from "react";
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
      } catch (error: any) {
        console.error("Erro ao carregar medicamentos:", error);

        const errorCode = error?.code || "";
        const errorMessage = error?.message || "";
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
      await deleteMedication(medicationToDelete.id, user.uid);

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
      await saveMedication(medicationData, user.uid);

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
    } catch (error: any) {
      console.error("Erro ao salvar medicamento:", error);

      let errorMessage = "Não foi possível cadastrar o medicamento. Tente novamente.";

      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.code) {
        if (error.code.includes("permission")) {
          errorMessage = "Permissão negada. Verifique as regras do Realtime Database no Firebase Console.";
        } else if (error.code.includes("database")) {
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold">
              Medicamentos
            </h1>
            <p className="text-muted-foreground mt-1">
              Catálogo de medicamentos disponíveis
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button variant="neuro">
                <Plus className="w-4 h-4 mr-2" />
                Novo Medicamento
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle className="font-display">
                  {editingId ? "Editar Medicamento" : "Cadastrar Medicamento"}
                </DialogTitle>
                <DialogDescription>
                  {editingId ? "Atualize os dados do medicamento" : "Adicione um novo medicamento ao catálogo"}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome Genérico *</Label>
                    <Input
                      placeholder="Ex: Metilfenidato"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nome Comercial *</Label>
                    <Input
                      placeholder="Ex: Ritalina"
                      value={formData.brandName}
                      onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Princípio Ativo *</Label>
                  <Input
                    placeholder="Ex: Cloridrato de Metilfenidato"
                    value={formData.activeIngredient}
                    onChange={(e) =>
                      setFormData({ ...formData, activeIngredient: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Classe Terapêutica *</Label>
                    <Select
                      value={formData.therapeuticClass}
                      onValueChange={(value) =>
                        setFormData({ ...formData, therapeuticClass: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
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
                    <Label>Forma Farmacêutica *</Label>
                    <Select
                      value={formData.form}
                      onValueChange={(value) => setFormData({ ...formData, form: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
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
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Dose Mínima *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Ex: 5"
                      value={formData.minDose}
                      onChange={(e) => setFormData({ ...formData, minDose: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Dose Máxima *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Ex: 60"
                      value={formData.maxDose}
                      onChange={(e) => setFormData({ ...formData, maxDose: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Unidade *</Label>
                    <Select
                      value={formData.unit}
                      onValueChange={(value) => setFormData({ ...formData, unit: value })}
                    >
                      <SelectTrigger>
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
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                  disabled={saving}
                >
                  Cancelar
                </Button>
                <Button variant="neuro" onClick={handleSaveMedication} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
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
                      <Pill className="w-8 h-8 text-primary" />
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
                      Cadastrado em: {viewingMedication.createdAt ? new Date(viewingMedication.createdAt).toLocaleDateString() : "-"}
                    </span>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button onClick={() => setViewingMedication(null)}>Fechar</Button>
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
                <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
                  Cancelar
                </Button>
                <Button variant="destructive" onClick={confirmDelete}>
                  Excluir
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar medicamento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Collapsible
              open={isFilterOpen}
              onOpenChange={setIsFilterOpen}
              className="w-full sm:w-auto"
            >
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtrar por Classe
                  <ChevronDown className={cn("w-4 h-4 ml-2 transition-transform duration-200", isFilterOpen ? "rotate-180" : "")} />
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          </div>

          <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <CollapsibleContent className="space-y-2 data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp overflow-hidden">
              <div className="bg-muted/30 p-4 rounded-xl border border-border">
                <p className="text-sm font-medium mb-3">Selecione as classes terapêuticas:</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(therapeuticClassMap).map(([key, label]) => {
                    const isSelected = selectedClasses.includes(label);
                    return (
                      <div
                        key={key}
                        onClick={() => toggleClass(label)}
                        className={cn(
                          "cursor-pointer inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                          isSelected
                            ? "border-transparent bg-primary text-primary-foreground hover:bg-primary/80"
                            : "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
                          // Use a cor correspondente se disponível
                          !isSelected && therapeuticClassColors[label] ? therapeuticClassColors[label] + " bg-opacity-10 border-opacity-20 hover:bg-opacity-20" : ""
                        )}
                      >
                        {isSelected && <Check className="w-3 h-3 mr-1" />}
                        {label}
                      </div>
                    );
                  })}
                </div>
                {selectedClasses.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedClasses([])}
                    className="mt-3 h-8 text-xs text-muted-foreground hover:text-foreground p-0"
                  >
                    Limpar filtros
                  </Button>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Grid of Medication Cards */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredMedications.length === 0 ? (
          <div className="text-center py-12">
            <Pill className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Nenhum medicamento cadastrado ainda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMedications.map((med) => (
              <div key={med.id} className="glass-card rounded-2xl p-6 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Pill className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold">{med.name}</h3>
                      <p className="text-sm text-muted-foreground">{med.brandName}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleView(med)}>
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Detalhes
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(med)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDelete(med)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Beaker className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{med.activeIngredient}</span>
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
                      <span className="font-medium">
                        {med.minDose} - {med.maxDose} {med.unit}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Cadastrado em</span>
                      <span className="font-medium">
                        {med.createdAt
                          ? new Date(med.createdAt).toLocaleDateString("pt-BR")
                          : "-"}
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
