import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EfficacyRing } from "@/components/dashboard/EfficacyRing";
import {
  Plus,
  Search,
  User,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Filter,
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
const mockPatients = [
  {
    id: "1",
    name: "João Silva",
    age: 45,
    gender: "Masculino",
    condition: "TDAH",
    medications: ["Metilfenidato 20mg"],
    lastVisit: "2024-01-15",
    efficacy: 85,
    status: "active",
  },
  {
    id: "2",
    name: "Maria Santos",
    age: 32,
    gender: "Feminino",
    condition: "Depressão",
    medications: ["Venlafaxina 75mg", "Clonazepam 0.5mg"],
    lastVisit: "2024-01-14",
    efficacy: 72,
    status: "active",
  },
  {
    id: "3",
    name: "Pedro Oliveira",
    age: 58,
    gender: "Masculino",
    condition: "Insônia",
    medications: ["Quetiapina 25mg"],
    lastVisit: "2024-01-12",
    efficacy: 68,
    status: "monitoring",
  },
  {
    id: "4",
    name: "Ana Costa",
    age: 28,
    gender: "Feminino",
    condition: "Ansiedade",
    medications: ["Sertralina 50mg"],
    lastVisit: "2024-01-10",
    efficacy: 91,
    status: "active",
  },
  {
    id: "5",
    name: "Carlos Ferreira",
    age: 63,
    gender: "Masculino",
    condition: "Bipolar",
    medications: ["Lítio 300mg", "Lamotrigina 100mg"],
    lastVisit: "2024-01-08",
    efficacy: 45,
    status: "critical",
  },
];

const statusStyles = {
  active: { label: "Ativo", className: "bg-success/10 text-success border-success/20" },
  monitoring: { label: "Monitorando", className: "bg-warning/10 text-warning border-warning/20" },
  critical: { label: "Crítico", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

export default function Patients() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredPatients = mockPatients.filter((patient) =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold">
              Pacientes
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerenciar cadastro e perfil dos pacientes
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="neuro">
                <Plus className="w-4 h-4 mr-2" />
                Novo Paciente
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle className="font-display">Cadastrar Paciente</DialogTitle>
                <DialogDescription>
                  Preencha os dados do novo paciente
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome Completo</Label>
                    <Input placeholder="Nome do paciente" />
                  </div>
                  <div className="space-y-2">
                    <Label>Idade</Label>
                    <Input type="number" placeholder="Idade" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Gênero</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Masculino</SelectItem>
                        <SelectItem value="female">Feminino</SelectItem>
                        <SelectItem value="other">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Condição Principal</Label>
                    <Input placeholder="Ex: TDAH, Depressão" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Histórico Clínico</Label>
                  <Textarea placeholder="Descreva o histórico clínico relevante" rows={3} />
                </div>
                <div className="space-y-2">
                  <Label>Sensibilidades / Alergias</Label>
                  <Input placeholder="Listar sensibilidades conhecidas" />
                </div>
                <div className="space-y-2">
                  <Label>Medicamentos em Uso</Label>
                  <Textarea placeholder="Liste os medicamentos atuais" rows={2} />
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
              placeholder="Buscar paciente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="glass-card rounded-xl p-4">
            <p className="text-sm text-muted-foreground">Total de Pacientes</p>
            <p className="text-2xl font-display font-bold mt-1">{mockPatients.length}</p>
          </div>
          <div className="glass-card rounded-xl p-4">
            <p className="text-sm text-muted-foreground">Ativos</p>
            <p className="text-2xl font-display font-bold mt-1 text-success">
              {mockPatients.filter((p) => p.status === "active").length}
            </p>
          </div>
          <div className="glass-card rounded-xl p-4">
            <p className="text-sm text-muted-foreground">Em Monitoramento</p>
            <p className="text-2xl font-display font-bold mt-1 text-warning">
              {mockPatients.filter((p) => p.status === "monitoring").length}
            </p>
          </div>
          <div className="glass-card rounded-xl p-4">
            <p className="text-sm text-muted-foreground">Críticos</p>
            <p className="text-2xl font-display font-bold mt-1 text-destructive">
              {mockPatients.filter((p) => p.status === "critical").length}
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Paciente</TableHead>
                <TableHead>Condição</TableHead>
                <TableHead>Medicamentos</TableHead>
                <TableHead>Última Visita</TableHead>
                <TableHead>Eficácia</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.map((patient) => (
                <TableRow key={patient.id} className="cursor-pointer">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-neuro-gradient flex items-center justify-center">
                        <User className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{patient.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {patient.age} anos • {patient.gender}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{patient.condition}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {patient.medications.map((med, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {med}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{new Date(patient.lastVisit).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell>
                    <EfficacyRing value={patient.efficacy} size="sm" showLabel={false} />
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(statusStyles[patient.status as keyof typeof statusStyles].className)}
                    >
                      {statusStyles[patient.status as keyof typeof statusStyles].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          Ver Perfil
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </MainLayout>
  );
}
