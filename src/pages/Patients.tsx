import { useState, useEffect } from "react";
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
  Upload,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  savePatient,
  uploadPatientPhoto,
  getPatients,
  deletePatient,
  type Patient,
} from "@/lib/patients";
import { toast } from "@/hooks/use-toast";

const statusStyles = {
  active: { label: "Ativo", className: "bg-success/10 text-success border-success/20" },
  monitoring: { label: "Monitorando", className: "bg-warning/10 text-warning border-warning/20" },
  critical: { label: "Crítico", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

export default function Patients() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Estados do formulário
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "" as "Masculino" | "Feminino" | "Outro" | "",
    condition: "",
    clinicalHistory: "",
    allergies: "",
    currentMedications: "",
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Carregar pacientes do Firebase
  useEffect(() => {
    const loadPatients = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const patientsData = await getPatients(user.uid);
        setPatients(patientsData);
      } catch (error: any) {
        console.error("Erro ao carregar pacientes:", error);
        
        // Só mostrar erro se não for erro de permissão/configuração
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
            title: "Erro ao carregar pacientes",
            description: "Não foi possível carregar a lista de pacientes.",
            variant: "destructive",
          });
        }
        
        // Mesmo com erro, usar lista vazia
        setPatients([]);
      } finally {
        setLoading(false);
      }
    };

    loadPatients();
  }, [user]);

  // Filtrar pacientes
  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Resetar formulário
  const resetForm = () => {
    setFormData({
      name: "",
      age: "",
      gender: "",
      condition: "",
      clinicalHistory: "",
      allergies: "",
      currentMedications: "",
    });
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  // Handle file change
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Arquivo inválido",
          description: "Por favor, selecione uma imagem.",
          variant: "destructive",
        });
        return;
      }

      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "A imagem deve ter no máximo 5MB.",
          variant: "destructive",
        });
        return;
      }

      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Salvar paciente
  const handleSavePatient = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para cadastrar pacientes.",
        variant: "destructive",
      });
      return;
    }

    // Validação
    if (!formData.name || !formData.age || !formData.gender || !formData.condition) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      // Criar objeto do paciente
      const patientData: Patient = {
        name: formData.name,
        age: parseInt(formData.age),
        gender: formData.gender as "Masculino" | "Feminino" | "Outro",
        condition: formData.condition,
        clinicalHistory: formData.clinicalHistory || undefined,
        allergies: formData.allergies || undefined,
        currentMedications: formData.currentMedications || undefined,
      };

      // Salvar paciente no Realtime Database
      const patientId = await savePatient(patientData, user.uid);

      // Upload da foto se houver
      if (photoFile && patientId) {
        try {
          const photoURL = await uploadPatientPhoto(photoFile, user.uid, patientId);
          // Atualizar paciente com URL da foto
          await savePatient({ ...patientData, id: patientId, photoURL }, user.uid);
        } catch (error) {
          console.error("Erro ao fazer upload da foto:", error);
          toast({
            title: "Aviso",
            description: "Paciente cadastrado, mas houve erro ao fazer upload da foto.",
            variant: "default",
          });
        }
      }

      toast({
        title: "Paciente cadastrado!",
        description: `${formData.name} foi cadastrado com sucesso.`,
      });

      // Recarregar lista de pacientes
      const patientsData = await getPatients(user.uid);
      setPatients(patientsData);

      // Fechar dialog e resetar formulário
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      console.error("Erro ao salvar paciente:", error);
      
      let errorMessage = "Não foi possível cadastrar o paciente. Tente novamente.";
      
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
        title: "Erro ao cadastrar paciente",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Deletar paciente
  const handleDeletePatient = async (patientId: string) => {
    if (!user) return;

    if (!confirm("Tem certeza que deseja excluir este paciente?")) {
      return;
    }

    try {
      await deletePatient(patientId, user.uid);
      toast({
        title: "Paciente excluído",
        description: "O paciente foi excluído com sucesso.",
      });

      // Recarregar lista
      const patientsData = await getPatients(user.uid);
      setPatients(patientsData);
    } catch (error) {
      console.error("Erro ao deletar paciente:", error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o paciente.",
        variant: "destructive",
      });
    }
  };

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
              <Button variant="neuro" onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Paciente
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-display">Cadastrar Paciente</DialogTitle>
                <DialogDescription>
                  Preencha os dados do novo paciente
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {/* Upload de Foto */}
                <div className="space-y-2">
                  <Label>Foto do Paciente</Label>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {photoPreview ? (
                        <Avatar className="w-20 h-20">
                          <AvatarImage src={photoPreview} alt="Preview" />
                          <AvatarFallback>
                            <User className="w-10 h-10" />
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                          <ImageIcon className="w-10 h-10 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                        id="photo-upload"
                      />
                      <Label
                        htmlFor="photo-upload"
                        className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-input rounded-md hover:bg-accent"
                      >
                        <Upload className="w-4 h-4" />
                        {photoFile ? "Alterar Foto" : "Adicionar Foto"}
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        JPG, PNG ou GIF. Máximo 5MB.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome Completo *</Label>
                    <Input
                      placeholder="Nome do paciente"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Idade *</Label>
                    <Input
                      type="number"
                      placeholder="Idade"
                      value={formData.age}
                      onChange={(e) =>
                        setFormData({ ...formData, age: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Gênero *</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          gender: value as "Masculino" | "Feminino" | "Outro",
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Masculino">Masculino</SelectItem>
                        <SelectItem value="Feminino">Feminino</SelectItem>
                        <SelectItem value="Outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Condição Principal *</Label>
                    <Input
                      placeholder="Ex: TDAH, Depressão"
                      value={formData.condition}
                      onChange={(e) =>
                        setFormData({ ...formData, condition: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Histórico Clínico</Label>
                  <Textarea
                    placeholder="Descreva o histórico clínico relevante"
                    rows={3}
                    value={formData.clinicalHistory}
                    onChange={(e) =>
                      setFormData({ ...formData, clinicalHistory: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sensibilidades / Alergias</Label>
                  <Input
                    placeholder="Listar sensibilidades conhecidas"
                    value={formData.allergies}
                    onChange={(e) =>
                      setFormData({ ...formData, allergies: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Medicamentos em Uso</Label>
                  <Textarea
                    placeholder="Liste os medicamentos atuais"
                    rows={2}
                    value={formData.currentMedications}
                    onChange={(e) =>
                      setFormData({ ...formData, currentMedications: e.target.value })
                    }
                  />
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
                <Button variant="neuro" onClick={handleSavePatient} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Cadastrando...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Cadastrar
                    </>
                  )}
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
            <p className="text-2xl font-display font-bold mt-1">{patients.length}</p>
          </div>
          <div className="glass-card rounded-xl p-4">
            <p className="text-sm text-muted-foreground">Ativos</p>
            <p className="text-2xl font-display font-bold mt-1 text-success">
              {patients.filter((p) => (p as any).status === "active").length}
            </p>
          </div>
          <div className="glass-card rounded-xl p-4">
            <p className="text-sm text-muted-foreground">Em Monitoramento</p>
            <p className="text-2xl font-display font-bold mt-1 text-warning">
              {patients.filter((p) => (p as any).status === "monitoring").length}
            </p>
          </div>
          <div className="glass-card rounded-xl p-4">
            <p className="text-sm text-muted-foreground">Críticos</p>
            <p className="text-2xl font-display font-bold mt-1 text-destructive">
              {patients.filter((p) => (p as any).status === "critical").length}
            </p>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
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
                {filteredPatients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Nenhum paciente cadastrado ainda.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPatients.map((patient) => (
                    <TableRow key={patient.id} className="cursor-pointer">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={patient.photoURL} alt={patient.name} />
                            <AvatarFallback className="bg-neuro-gradient">
                              <User className="w-5 h-5 text-primary-foreground" />
                            </AvatarFallback>
                          </Avatar>
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
                        {patient.currentMedications ? (
                          <div className="flex flex-wrap gap-1">
                            {patient.currentMedications.split(",").map((med, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {med.trim()}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {patient.createdAt
                          ? new Date(patient.createdAt).toLocaleDateString("pt-BR")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <EfficacyRing value={85} size="sm" showLabel={false} />
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusStyles.active.className}>
                          {statusStyles.active.label}
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
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => patient.id && handleDeletePatient(patient.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
