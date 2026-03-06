import { useState, useEffect, useMemo } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Plus,
    Calendar as CalendarIcon,
    Clock,
    User,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Check,
    X,
    MoreHorizontal,
    Edit,
    Trash2,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { getPatients, type Patient } from "@/lib/patients";
import {
    saveAppointment,
    getAppointments,
    deleteAppointment,
    updateAppointmentStatus,
    type Appointment,
    type AppointmentType,
    type AppointmentStatus,
} from "@/lib/appointments";
import { toast } from "@/hooks/use-toast";

const appointmentTypeStyles: Record<AppointmentType, string> = {
    Consulta: "bg-primary/10 text-primary border-primary/20",
    Retorno: "bg-info/10 text-info border-info/20",
    Exame: "bg-warning/10 text-warning border-warning/20",
    Outro: "bg-muted text-muted-foreground border-muted",
};

const appointmentStatusStyles: Record<AppointmentStatus, string> = {
    Agendada: "bg-muted text-muted-foreground",
    Confirmada: "bg-info/10 text-info",
    Concluída: "bg-success/10 text-success",
    Cancelada: "bg-destructive/10 text-destructive",
};

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export default function Appointments() {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

    // Calendar state
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        patientId: "",
        date: "",
        time: "",
        duration: "30",
        type: "Consulta" as AppointmentType,
        notes: "",
    });

    // Load data
    useEffect(() => {
        const loadData = async () => {
            if (!user) return;

            try {
                setLoading(true);
                const [appointmentsData, patientsData] = await Promise.all([
                    getAppointments(user.uid),
                    getPatients(user.uid),
                ]);
                setAppointments(appointmentsData);
                setPatients(patientsData);
            } catch (error) {
                console.error("Error loading data:", error);
                toast({
                    title: "Erro ao carregar dados",
                    description: "Não foi possível carregar a agenda.",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [user]);

    // Calendar helpers
    const calendarDays = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startingDay = firstDay.getDay();
        const totalDays = lastDay.getDate();

        const days: (number | null)[] = [];

        // Empty cells before first day
        for (let i = 0; i < startingDay; i++) {
            days.push(null);
        }

        // Days of the month
        for (let i = 1; i <= totalDays; i++) {
            days.push(i);
        }

        return days;
    }, [currentDate]);

    const getAppointmentsForDate = (day: number) => {
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        return appointments.filter(apt => apt.date === dateStr);
    };

    const selectedDateAppointments = useMemo(() => {
        if (!selectedDate) return [];
        return appointments.filter(apt => apt.date === selectedDate)
            .sort((a, b) => a.time.localeCompare(b.time));
    }, [selectedDate, appointments]);

    // Navigation
    const goToPrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
        const today = new Date().toISOString().split("T")[0];
        setSelectedDate(today);
    };

    // Form handlers
    const resetForm = () => {
        setFormData({
            patientId: "",
            date: selectedDate || "",
            time: "",
            duration: "30",
            type: "Consulta",
            notes: "",
        });
        setEditingAppointment(null);
    };

    const handleEditClick = (appointment: Appointment) => {
        setEditingAppointment(appointment);
        setFormData({
            patientId: appointment.patientId,
            date: appointment.date,
            time: appointment.time,
            duration: appointment.duration.toString(),
            type: appointment.type,
            notes: appointment.notes || "",
        });
        setIsDialogOpen(true);
    };

    // Helper: converte "HH:mm" em minutos desde meia-noite
    const timeToMinutes = (time: string) => {
        const [h, m] = time.split(":").map(Number);
        return h * 60 + m;
    };

    // Verifica se há conflito de horário com consultas existentes
    const checkTimeConflict = (date: string, time: string, duration: number, excludeId?: string) => {
        const newStart = timeToMinutes(time);
        const newEnd = newStart + duration;

        const conflicting = appointments.find(apt => {
            // Ignorar a própria consulta que está sendo editada
            if (excludeId && apt.id === excludeId) return false;
            // Ignorar canceladas e concluídas
            if (apt.status === "Cancelada" || apt.status === "Concluída") return false;
            // Só verificar no mesmo dia
            if (apt.date !== date) return false;

            const existingStart = timeToMinutes(apt.time);
            const existingEnd = existingStart + (apt.duration || 30);

            // Verifica sobreposição: novo começa antes do existente acabar E novo acaba depois do existente começar
            return newStart < existingEnd && newEnd > existingStart;
        });

        return conflicting || null;
    };

    const handleSaveAppointment = async () => {
        if (!user) return;

        if (!formData.patientId || !formData.date || !formData.time) {
            toast({
                title: "Campos obrigatórios",
                description: "Selecione paciente, data e horário.",
                variant: "destructive",
            });
            return;
        }

        // Verificar se a data é no passado
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selectedDateObj = new Date(formData.date + "T00:00:00");
        if (selectedDateObj < today) {
            toast({
                title: "Data inválida",
                description: "Não é possível agendar consultas em datas passadas.",
                variant: "destructive",
            });
            return;
        }

        // Verificar conflito de horário
        const conflict = checkTimeConflict(
            formData.date,
            formData.time,
            parseInt(formData.duration),
            editingAppointment?.id
        );

        if (conflict) {
            toast({
                title: "Conflito de horário",
                description: `Já existe uma consulta com ${conflict.patientName} às ${conflict.time} (${conflict.duration} min) neste horário. Escolha outro horário.`,
                variant: "destructive",
            });
            return;
        }

        try {
            setSaving(true);
            const patient = patients.find(p => p.id === formData.patientId);

            const appointmentData: Appointment = {
                id: editingAppointment?.id,
                patientId: formData.patientId,
                patientName: patient?.name || "Paciente",
                date: formData.date,
                time: formData.time,
                duration: parseInt(formData.duration),
                type: formData.type,
                status: editingAppointment?.status || "Agendada",
                notes: formData.notes || undefined,
            };

            await saveAppointment(appointmentData, user.uid);

            toast({
                title: editingAppointment ? "Consulta atualizada!" : "Consulta agendada!",
                description: `${patient?.name} - ${formData.date} às ${formData.time}`,
            });

            const updatedAppointments = await getAppointments(user.uid);
            setAppointments(updatedAppointments);
            setIsDialogOpen(false);
            resetForm();
        } catch (error) {
            console.error("Error saving appointment:", error);
            toast({
                title: "Erro ao salvar",
                description: "Não foi possível salvar a consulta.",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAppointment = async (appointmentId: string) => {
        if (!user) return;

        if (!confirm("Tem certeza que deseja excluir esta consulta?")) return;

        try {
            await deleteAppointment(appointmentId, user.uid);
            toast({ title: "Consulta excluída" });
            const updatedAppointments = await getAppointments(user.uid);
            setAppointments(updatedAppointments);
        } catch (error) {
            console.error("Error deleting appointment:", error);
            toast({
                title: "Erro ao excluir",
                variant: "destructive",
            });
        }
    };

    const handleStatusChange = async (appointmentId: string, status: AppointmentStatus) => {
        if (!user) return;

        try {
            await updateAppointmentStatus(appointmentId, status, user.uid);
            toast({ title: `Status atualizado: ${status}` });
            const updatedAppointments = await getAppointments(user.uid);
            setAppointments(updatedAppointments);
        } catch (error) {
            console.error("Error updating status:", error);
            toast({
                title: "Erro ao atualizar status",
                variant: "destructive",
            });
        }
    };

    const handleDayClick = (day: number) => {
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        setSelectedDate(dateStr);
    };

    const openNewAppointmentDialog = () => {
        resetForm();
        if (selectedDate) {
            setFormData(prev => ({ ...prev, date: selectedDate }));
        }
        setIsDialogOpen(true);
    };

    const isToday = (day: number) => {
        const today = new Date();
        return (
            day === today.getDate() &&
            currentDate.getMonth() === today.getMonth() &&
            currentDate.getFullYear() === today.getFullYear()
        );
    };

    const isPastDay = (day: number) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        return checkDate < today;
    };

    const isSelectedDatePast = useMemo(() => {
        if (!selectedDate) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selected = new Date(selectedDate + "T00:00:00");
        return selected < today;
    }, [selectedDate]);

    return (
        <MainLayout>
            <div className="space-y-8 pb-8">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-neuro-gradient flex items-center justify-center shadow-md">
                            <CalendarIcon className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
                                Agenda
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Gerencie consultas e compromissos
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={goToToday}>
                            Hoje
                        </Button>
                        <Dialog open={isDialogOpen} onOpenChange={(open) => {
                            setIsDialogOpen(open);
                            if (!open) resetForm();
                        }}>
                            <DialogTrigger asChild>
                                <Button variant="neuro" onClick={openNewAppointmentDialog}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Nova Consulta
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                    <DialogTitle className="font-display">
                                        {editingAppointment ? "Editar Consulta" : "Agendar Consulta"}
                                    </DialogTitle>
                                    <DialogDescription>
                                        {editingAppointment ? "Atualize os dados da consulta" : "Preencha os dados para agendar"}
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="apt-patient">Paciente *</Label>
                                        <Select
                                            value={formData.patientId}
                                            onValueChange={(value) => setFormData({ ...formData, patientId: value })}
                                        >
                                            <SelectTrigger id="apt-patient">
                                                <SelectValue placeholder="Selecione o paciente..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {patients.map(patient => (
                                                    <SelectItem key={patient.id} value={patient.id!}>
                                                        {patient.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="apt-date">Data *</Label>
                                            <Input
                                                id="apt-date"
                                                type="date"
                                                value={formData.date}
                                                min={new Date().toISOString().split("T")[0]}
                                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="apt-time">Horário *</Label>
                                            <Input
                                                id="apt-time"
                                                type="time"
                                                value={formData.time}
                                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="apt-duration">Duração (min)</Label>
                                            <Select
                                                value={formData.duration}
                                                onValueChange={(value) => setFormData({ ...formData, duration: value })}
                                            >
                                                <SelectTrigger id="apt-duration">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="15">15 min</SelectItem>
                                                    <SelectItem value="30">30 min</SelectItem>
                                                    <SelectItem value="45">45 min</SelectItem>
                                                    <SelectItem value="60">1 hora</SelectItem>
                                                    <SelectItem value="90">1h30</SelectItem>
                                                    <SelectItem value="120">2 horas</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="apt-type">Tipo</Label>
                                            <Select
                                                value={formData.type}
                                                onValueChange={(value) => setFormData({ ...formData, type: value as AppointmentType })}
                                            >
                                                <SelectTrigger id="apt-type">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Consulta">Consulta</SelectItem>
                                                    <SelectItem value="Retorno">Retorno</SelectItem>
                                                    <SelectItem value="Exame">Exame</SelectItem>
                                                    <SelectItem value="Outro">Outro</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="apt-notes">Observações</Label>
                                        <Textarea
                                            id="apt-notes"
                                            placeholder="Anotações sobre a consulta..."
                                            rows={3}
                                            value={formData.notes}
                                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={saving}>
                                        Cancelar
                                    </Button>
                                    <Button variant="neuro" onClick={handleSaveAppointment} disabled={saving}>
                                        {saving ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Salvando...
                                            </>
                                        ) : (
                                            <>
                                                <CalendarIcon className="w-4 h-4 mr-2" />
                                                {editingAppointment ? "Atualizar" : "Agendar"}
                                            </>
                                        )}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {loading ? (
                    <div className="glass-card rounded-2xl p-12 flex items-center justify-center gap-3">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        <span className="text-muted-foreground font-medium">Carregando agenda...</span>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Calendar */}
                        <div className="lg:col-span-2 glass-card rounded-2xl p-6">
                            {/* Month navigation */}
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="font-display text-xl font-semibold">
                                    {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                                </h2>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" onClick={goToPrevMonth}>
                                        <ChevronLeft className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={goToNextMonth}>
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Weekday headers */}
                            <div className="grid grid-cols-7 gap-1 mb-2">
                                {WEEKDAYS.map(day => (
                                    <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar grid */}
                            <div className="grid grid-cols-7 gap-1">
                                {calendarDays.map((day, index) => {
                                    if (day === null) {
                                        return <div key={`empty-${index}`} className="aspect-square" />;
                                    }

                                    const dayAppointments = getAppointmentsForDate(day);
                                    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                                    const isSelected = selectedDate === dateStr;
                                    const isPast = isPastDay(day);

                                    return (
                                        <button
                                            key={day}
                                            onClick={() => handleDayClick(day)}
                                            className={cn(
                                                "aspect-square rounded-lg flex flex-col items-center justify-center relative transition-all",
                                                "hover:bg-primary/10",
                                                isToday(day) && "ring-2 ring-primary",
                                                isSelected && "bg-primary text-primary-foreground hover:bg-primary/90",
                                                !isSelected && "hover:bg-muted",
                                                isPast && !isSelected && "opacity-40"
                                            )}
                                        >
                                            <span className={cn(
                                                "text-sm font-medium",
                                                isSelected && "text-primary-foreground"
                                            )}>
                                                {day}
                                            </span>
                                            {dayAppointments.length > 0 && (
                                                <div className={cn(
                                                    "absolute bottom-1 flex gap-0.5",
                                                )}>
                                                    {dayAppointments.slice(0, 3).map((_, i) => (
                                                        <div
                                                            key={i}
                                                            className={cn(
                                                                "w-1.5 h-1.5 rounded-full",
                                                                isSelected ? "bg-primary-foreground" : "bg-primary"
                                                            )}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Selected date appointments */}
                        <div className="glass-card rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-display font-semibold">
                                    {selectedDate
                                        ? new Date(selectedDate + "T00:00:00").toLocaleDateString("pt-BR", {
                                            weekday: "long",
                                            day: "numeric",
                                            month: "long",
                                        })
                                        : "Selecione um dia"}
                                </h3>
                            </div>

                            {selectedDate ? (
                                selectedDateAppointments.length > 0 ? (
                                    <div className="space-y-3">
                                        {selectedDateAppointments.map(apt => (
                                            <div
                                                key={apt.id}
                                                className="p-4 rounded-xl border bg-card hover:shadow-md transition-shadow"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                                                            <Clock className="w-4 h-4 text-primary mb-0.5" />
                                                            <span className="text-xs font-medium">{apt.time}</span>
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">{apt.patientName}</p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <Badge variant="outline" className={appointmentTypeStyles[apt.type]}>
                                                                    {apt.type}
                                                                </Badge>
                                                                <Badge className={appointmentStatusStyles[apt.status]}>
                                                                    {apt.status}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <MoreHorizontal className="w-4 h-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => handleStatusChange(apt.id!, "Confirmada")}>
                                                                <Check className="w-4 h-4 mr-2" />
                                                                Confirmar
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleStatusChange(apt.id!, "Concluída")}>
                                                                <Check className="w-4 h-4 mr-2" />
                                                                Concluir
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleStatusChange(apt.id!, "Cancelada")}>
                                                                <X className="w-4 h-4 mr-2" />
                                                                Cancelar
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleEditClick(apt)}>
                                                                <Edit className="w-4 h-4 mr-2" />
                                                                Editar
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                className="text-destructive"
                                                                onClick={() => apt.id && handleDeleteAppointment(apt.id)}
                                                            >
                                                                <Trash2 className="w-4 h-4 mr-2" />
                                                                Excluir
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>

                                                {apt.notes && (
                                                    <p className="text-sm text-muted-foreground mt-2 pl-15">
                                                        {apt.notes}
                                                    </p>
                                                )}

                                                <p className="text-xs text-muted-foreground mt-2">
                                                    Duração: {apt.duration} min
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                        <p>Nenhuma consulta neste dia</p>
                                        {!isSelectedDatePast && (
                                            <Button
                                                variant="link"
                                                className="mt-2"
                                                onClick={openNewAppointmentDialog}
                                            >
                                                Agendar consulta
                                            </Button>
                                        )}
                                    </div>
                                )
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>Clique em um dia para ver as consultas</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
