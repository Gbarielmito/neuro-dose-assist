import { useState, useEffect } from "react";
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
    Building2,
    Plus,
    Users,
    Mail,
    Crown,
    Shield,
    User,
    Loader2,
    Trash2,
    Check,
    X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
    createClinic,
    getUserClinic,
    sendClinicInvite,
    getPendingInvites,
    acceptClinicInvite,
    removeClinicMember,
    type Clinic,
    type ClinicInvite,
    type MemberRole,
} from "@/lib/clinics";
import { toast } from "@/hooks/use-toast";

const roleIcons: Record<MemberRole, React.ElementType> = {
    owner: Crown,
    admin: Shield,
    member: User,
};

const roleLabels: Record<MemberRole, string> = {
    owner: "Proprietário",
    admin: "Administrador",
    member: "Membro",
};

const roleStyles: Record<MemberRole, string> = {
    owner: "bg-warning/10 text-warning border-warning/20",
    admin: "bg-primary/10 text-primary border-primary/20",
    member: "bg-muted text-muted-foreground",
};

export default function ClinicPage() {
    const { user } = useAuth();
    const [clinic, setClinic] = useState<Clinic | null>(null);
    const [pendingInvites, setPendingInvites] = useState<ClinicInvite[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Dialogs
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

    // Form states
    const [clinicName, setClinicName] = useState("");
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState<MemberRole>("member");

    // Load data
    useEffect(() => {
        const loadData = async () => {
            if (!user?.email) return;

            try {
                setLoading(true);
                const [clinicData, invitesData] = await Promise.all([
                    getUserClinic(user.uid),
                    getPendingInvites(user.email),
                ]);
                setClinic(clinicData);
                setPendingInvites(invitesData);
            } catch (error) {
                console.error("Error loading clinic data:", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [user]);

    const handleCreateClinic = async () => {
        if (!user?.email || !clinicName.trim()) return;

        try {
            setSaving(true);
            await createClinic(clinicName.trim(), user.uid, user.email);
            toast({
                title: "Clínica criada!",
                description: `${clinicName} foi criada com sucesso.`,
            });

            const updatedClinic = await getUserClinic(user.uid);
            setClinic(updatedClinic);
            setIsCreateDialogOpen(false);
            setClinicName("");
        } catch (error) {
            console.error("Error creating clinic:", error);
            toast({
                title: "Erro ao criar clínica",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleSendInvite = async () => {
        if (!user || !clinic?.id || !inviteEmail.trim()) return;

        if (!inviteEmail.includes("@")) {
            toast({
                title: "Email inválido",
                description: "O email deve conter @. Verifique e tente novamente.",
                variant: "destructive",
            });
            return;
        }

        try {
            setSaving(true);
            const result = await sendClinicInvite(
                clinic.id,
                clinic.name,
                inviteEmail.trim(),
                inviteRole,
                user.uid,
                user.displayName || user.email || undefined
            );

            if (result.emailSent) {
                toast({
                    title: "Convite enviado por email! 📧",
                    description: `Um email de convite foi enviado para ${inviteEmail}`,
                });
            } else {
                toast({
                    title: "Convite criado!",
                    description: `Convite para ${inviteEmail} foi salvo. Configure o EmailJS para enviar por email.`,
                });
            }

            setIsInviteDialogOpen(false);
            setInviteEmail("");
            setInviteRole("member");
        } catch (error) {
            console.error("Error sending invite:", error);
            toast({
                title: "Erro ao enviar convite",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleAcceptInvite = async (invite: ClinicInvite) => {
        if (!user || !invite.id) return;

        try {
            await acceptClinicInvite(invite.id, user.uid, user.displayName || undefined);
            toast({
                title: "Convite aceito!",
                description: `Você agora faz parte de ${invite.clinicName}`,
            });

            const [updatedClinic, updatedInvites] = await Promise.all([
                getUserClinic(user.uid),
                getPendingInvites(user.email!),
            ]);
            setClinic(updatedClinic);
            setPendingInvites(updatedInvites);
        } catch (error) {
            console.error("Error accepting invite:", error);
            toast({
                title: "Erro ao aceitar convite",
                variant: "destructive",
            });
        }
    };

    const handleRemoveMember = async (memberUserId: string) => {
        if (!clinic?.id) return;

        if (!confirm("Tem certeza que deseja remover este membro?")) return;

        try {
            await removeClinicMember(clinic.id, memberUserId);
            toast({ title: "Membro removido" });

            const updatedClinic = await getUserClinic(user!.uid);
            setClinic(updatedClinic);
        } catch (error) {
            console.error("Error removing member:", error);
            toast({
                title: "Erro ao remover membro",
                variant: "destructive",
            });
        }
    };

    const isOwner = clinic?.ownerId === user?.uid;

    return (
        <MainLayout>
            <div className="space-y-8 pb-8">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-neuro-gradient flex items-center justify-center shadow-md">
                            <Building2 className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
                                Clínica
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Gerencie sua equipe e colaboradores
                            </p>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="glass-card rounded-2xl p-12 flex items-center justify-center gap-3">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        <span className="text-muted-foreground font-medium">Carregando...</span>
                    </div>
                ) : (
                    <>
                        {/* Pending Invites */}
                        {pendingInvites.length > 0 && (
                            <Card className="border-warning/50 bg-warning/5">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-warning">
                                        <Mail className="w-5 h-5" />
                                        Convites Pendentes
                                    </CardTitle>
                                    <CardDescription>
                                        Você foi convidado para participar de uma clínica
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {pendingInvites.map(invite => (
                                        <div
                                            key={invite.id}
                                            className="flex items-center justify-between p-4 bg-card rounded-lg border"
                                        >
                                            <div>
                                                <p className="font-medium">{invite.clinicName}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Como: {roleLabels[invite.role]}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-destructive"
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleAcceptInvite(invite)}
                                                >
                                                    <Check className="w-4 h-4 mr-1" />
                                                    Aceitar
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {/* No Clinic */}
                        {!clinic && (
                            <Card>
                                <CardContent className="py-12 text-center">
                                    <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                                    <h3 className="text-xl font-semibold mb-2">Você ainda não tem uma clínica</h3>
                                    <p className="text-muted-foreground mb-6">
                                        Crie sua clínica para começar a gerenciar sua equipe
                                    </p>

                                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="neuro">
                                                <Plus className="w-4 h-4 mr-2" />
                                                Criar Clínica
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Criar Nova Clínica</DialogTitle>
                                                <DialogDescription>
                                                    Digite o nome da sua clínica ou consultório
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="py-4">
                                                <Label htmlFor="clinic-name">Nome da Clínica</Label>
                                                <Input
                                                    id="clinic-name"
                                                    placeholder="Ex: Clínica Neurológica São Paulo"
                                                    value={clinicName}
                                                    onChange={(e) => setClinicName(e.target.value)}
                                                    className="mt-2"
                                                />
                                            </div>
                                            <DialogFooter>
                                                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                                    Cancelar
                                                </Button>
                                                <Button
                                                    variant="neuro"
                                                    onClick={handleCreateClinic}
                                                    disabled={saving || !clinicName.trim()}
                                                >
                                                    {saving ? (
                                                        <>
                                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                            Criando...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Plus className="w-4 h-4 mr-2" />
                                                            Criar Clínica
                                                        </>
                                                    )}
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </CardContent>
                            </Card>
                        )}

                        {/* Clinic Info */}
                        {clinic && (
                            <>
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle className="text-2xl">{clinic.name}</CardTitle>
                                                <CardDescription>
                                                    Criada em {clinic.createdAt && new Date(clinic.createdAt).toLocaleDateString("pt-BR")}
                                                </CardDescription>
                                            </div>
                                            {isOwner && (
                                                <Badge variant="outline" className={roleStyles.owner}>
                                                    <Crown className="w-3 h-3 mr-1" />
                                                    Proprietário
                                                </Badge>
                                            )}
                                        </div>
                                    </CardHeader>
                                </Card>

                                {/* Team Members */}
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle className="flex items-center gap-2">
                                                    <Users className="w-5 h-5" />
                                                    Equipe
                                                </CardTitle>
                                                <CardDescription>
                                                    {clinic.members.length} membro{clinic.members.length !== 1 && "s"}
                                                </CardDescription>
                                            </div>

                                            {isOwner && (
                                                <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                                                    <DialogTrigger asChild>
                                                        <Button variant="neuro" size="sm">
                                                            <Plus className="w-4 h-4 mr-2" />
                                                            Convidar
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Convidar Membro</DialogTitle>
                                                            <DialogDescription>
                                                                Envie um convite para adicionar um novo membro à equipe
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <div className="space-y-4 py-4">
                                                            <div className="space-y-2">
                                                                <Label htmlFor="invite-email">Email</Label>
                                                                <Input
                                                                    id="invite-email"
                                                                    type="email"
                                                                    placeholder="email@exemplo.com"
                                                                    value={inviteEmail}
                                                                    onChange={(e) => setInviteEmail(e.target.value)}
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label htmlFor="invite-role">Função</Label>
                                                                <Select
                                                                    value={inviteRole}
                                                                    onValueChange={(value) => setInviteRole(value as MemberRole)}
                                                                >
                                                                    <SelectTrigger id="invite-role">
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="admin">Administrador</SelectItem>
                                                                        <SelectItem value="member">Membro</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        </div>
                                                        <DialogFooter>
                                                            <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                                                                Cancelar
                                                            </Button>
                                                            <Button
                                                                variant="neuro"
                                                                onClick={handleSendInvite}
                                                                disabled={saving || !inviteEmail.trim()}
                                                            >
                                                                {saving ? (
                                                                    <>
                                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                                        Enviando...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Mail className="w-4 h-4 mr-2" />
                                                                        Enviar Convite
                                                                    </>
                                                                )}
                                                            </Button>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {clinic.members.map((member, index) => {
                                                const RoleIcon = roleIcons[member.role];
                                                return (
                                                    <div
                                                        key={index}
                                                        className="flex items-center justify-between p-4 rounded-lg border bg-card"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <Avatar>
                                                                <AvatarFallback className="bg-primary/10 text-primary">
                                                                    {member.email[0].toUpperCase()}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <p className="font-medium">
                                                                    {member.name || member.email.split("@")[0]}
                                                                </p>
                                                                <p className="text-sm text-muted-foreground">{member.email}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <Badge variant="outline" className={roleStyles[member.role]}>
                                                                <RoleIcon className="w-3 h-3 mr-1" />
                                                                {roleLabels[member.role]}
                                                            </Badge>
                                                            {isOwner && member.role !== "owner" && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="text-destructive hover:text-destructive"
                                                                    onClick={() => handleRemoveMember(member.odal)}
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        )}
                    </>
                )}
            </div>
        </MainLayout>
    );
}
