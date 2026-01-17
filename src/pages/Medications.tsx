import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Mock data
const mockMedications = [
  {
    id: "1",
    name: "Metilfenidato",
    brandName: "Ritalina",
    activeIngredient: "Cloridrato de Metilfenidato",
    therapeuticClass: "Psicoestimulante",
    form: "Comprimido",
    minDose: 5,
    maxDose: 60,
    unit: "mg",
    patientsUsing: 8,
    avgEfficacy: 82,
  },
  {
    id: "2",
    name: "Venlafaxina",
    brandName: "Effexor",
    activeIngredient: "Cloridrato de Venlafaxina",
    therapeuticClass: "Antidepressivo IRSN",
    form: "Cápsula",
    minDose: 37.5,
    maxDose: 225,
    unit: "mg",
    patientsUsing: 12,
    avgEfficacy: 75,
  },
  {
    id: "3",
    name: "Quetiapina",
    brandName: "Seroquel",
    activeIngredient: "Fumarato de Quetiapina",
    therapeuticClass: "Antipsicótico Atípico",
    form: "Comprimido",
    minDose: 25,
    maxDose: 800,
    unit: "mg",
    patientsUsing: 6,
    avgEfficacy: 68,
  },
  {
    id: "4",
    name: "Sertralina",
    brandName: "Zoloft",
    activeIngredient: "Cloridrato de Sertralina",
    therapeuticClass: "Antidepressivo ISRS",
    form: "Comprimido",
    minDose: 25,
    maxDose: 200,
    unit: "mg",
    patientsUsing: 15,
    avgEfficacy: 88,
  },
  {
    id: "5",
    name: "Lítio",
    brandName: "Carbolitium",
    activeIngredient: "Carbonato de Lítio",
    therapeuticClass: "Estabilizador de Humor",
    form: "Comprimido",
    minDose: 300,
    maxDose: 1800,
    unit: "mg",
    patientsUsing: 4,
    avgEfficacy: 72,
  },
  {
    id: "6",
    name: "Clonazepam",
    brandName: "Rivotril",
    activeIngredient: "Clonazepam",
    therapeuticClass: "Benzodiazepínico",
    form: "Comprimido",
    minDose: 0.25,
    maxDose: 6,
    unit: "mg",
    patientsUsing: 10,
    avgEfficacy: 79,
  },
];

const therapeuticClassColors: Record<string, string> = {
  Psicoestimulante: "bg-info/10 text-info border-info/20",
  "Antidepressivo IRSN": "bg-secondary text-secondary-foreground",
  "Antipsicótico Atípico": "bg-warning/10 text-warning border-warning/20",
  "Antidepressivo ISRS": "bg-success/10 text-success border-success/20",
  "Estabilizador de Humor": "bg-primary/10 text-primary border-primary/20",
  Benzodiazepínico: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function Medications() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredMedications = mockMedications.filter(
    (med) =>
      med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.brandName.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="neuro">
                <Plus className="w-4 h-4 mr-2" />
                Novo Medicamento
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle className="font-display">Cadastrar Medicamento</DialogTitle>
                <DialogDescription>
                  Adicione um novo medicamento ao catálogo
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome Genérico</Label>
                    <Input placeholder="Ex: Metilfenidato" />
                  </div>
                  <div className="space-y-2">
                    <Label>Nome Comercial</Label>
                    <Input placeholder="Ex: Ritalina" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Princípio Ativo</Label>
                  <Input placeholder="Ex: Cloridrato de Metilfenidato" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Classe Terapêutica</Label>
                    <Select>
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
                    <Label>Forma Farmacêutica</Label>
                    <Select>
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
                    <Label>Dose Mínima</Label>
                    <Input type="number" placeholder="Ex: 5" />
                  </div>
                  <div className="space-y-2">
                    <Label>Dose Máxima</Label>
                    <Input type="number" placeholder="Ex: 60" />
                  </div>
                  <div className="space-y-2">
                    <Label>Unidade</Label>
                    <Select>
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
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button variant="neuro" onClick={() => setIsDialogOpen(false)}>
                  Cadastrar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
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
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filtrar por Classe
          </Button>
        </div>

        {/* Grid of Medication Cards */}
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
                    <DropdownMenuItem>
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Detalhes
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
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
                    <span className="text-muted-foreground">Pacientes</span>
                    <span className="font-medium">{med.patientsUsing} ativos</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Eficácia Média</span>
                    <span
                      className={cn(
                        "font-medium",
                        med.avgEfficacy >= 80
                          ? "text-success"
                          : med.avgEfficacy >= 60
                          ? "text-warning"
                          : "text-destructive"
                      )}
                    >
                      {med.avgEfficacy}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
