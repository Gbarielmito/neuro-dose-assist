import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  User,
  Lock,
  Bell,
  Brain,
  Shield,
  Trash2,
  Save,
  Mail,
  Key,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getUserSettings,
  updateUserProfile,
  updateNotificationSettings,
  updateAISettings,
  type UserProfile,
  type NotificationSettings,
  type AISettings,
} from "@/lib/firestore";
import { toast } from "@/hooks/use-toast";

export default function Settings() {
  const { user, updatePassword } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Estados do perfil
  const [profile, setProfile] = useState<UserProfile>({
    fullName: "",
    email: "",
    specialty: "",
    crm: "",
    phone: "",
    language: "pt-BR",
  });

  // Estados de notificações
  const [notifications, setNotifications] = useState<NotificationSettings>({
    email: true,
    push: true,
    alerts: true,
    recommendations: true,
    reports: false,
  });

  // Estados de IA
  const [aiSettings, setAiSettings] = useState<AISettings>({
    autoAnalysis: true,
    riskAlerts: true,
    recommendations: true,
    confidence: "high",
  });

  // Estados para alteração de senha
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);

  // Carregar dados do Firestore
  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const settings = await getUserSettings(user.uid);

        if (settings) {
          if (settings.profile) {
            setProfile({
              fullName: settings.profile.fullName || "",
              email: settings.profile.email || user.email || "",
              specialty: settings.profile.specialty || "",
              crm: settings.profile.crm || "",
              phone: settings.profile.phone || "",
              language: settings.profile.language || "pt-BR",
            });
          }

          if (settings.notifications) {
            setNotifications(settings.notifications);
          }

          if (settings.ai) {
            setAiSettings(settings.ai);
          }
        } else {
          // Se não houver configurações, usar dados do usuário autenticado
          // Isso é normal para novos usuários, não é um erro
          setProfile({
            fullName: user.displayName || "",
            email: user.email || "",
            specialty: "",
            crm: "",
            phone: "",
            language: "pt-BR",
          });
        }
      } catch (error: any) {
        console.error("Erro ao carregar configurações:", error);
        
        // Só mostrar erro se for um problema real (não apenas "documento não existe")
        // Erros comuns que não devem ser mostrados:
        // - "permission-denied" pode ser normal se Firestore não estiver configurado ainda
        // - Outros erros de rede/configuração devem ser mostrados
        const errorCode = error?.code || "";
        const isPermissionError = errorCode.includes("permission") || errorCode.includes("PERMISSION");
        
        if (!isPermissionError) {
          toast({
            title: "Erro ao carregar configurações",
            description: "Não foi possível carregar suas configurações. Usando valores padrão.",
            variant: "destructive",
          });
        }
        
        // Mesmo com erro, usar valores padrão do usuário autenticado
        setProfile({
          fullName: user.displayName || "",
          email: user.email || "",
          specialty: "",
          crm: "",
          phone: "",
          language: "pt-BR",
        });
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [user]);

  // Salvar perfil
  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      setSaving(true);
      await updateUserProfile(user.uid, profile);
      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
      toast({
        title: "Erro ao salvar perfil",
        description: "Não foi possível salvar suas informações.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Salvar notificações (salva automaticamente quando muda)
  const handleNotificationChange = async (
    key: keyof NotificationSettings,
    value: boolean
  ) => {
    if (!user) return;

    const updated = { ...notifications, [key]: value };
    setNotifications(updated);

    try {
      await updateNotificationSettings(user.uid, updated);
    } catch (error) {
      console.error("Erro ao salvar notificações:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações de notificação.",
        variant: "destructive",
      });
      // Reverter mudança
      setNotifications(notifications);
    }
  };

  // Salvar configurações de IA (salva automaticamente quando muda)
  const handleAISettingChange = async (
    key: keyof AISettings,
    value: boolean | string
  ) => {
    if (!user) return;

    const updated = { ...aiSettings, [key]: value };
    setAiSettings(updated);

    try {
      await updateAISettings(user.uid, updated as AISettings);
    } catch (error) {
      console.error("Erro ao salvar configurações de IA:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações de IA.",
        variant: "destructive",
      });
      // Reverter mudança
      setAiSettings(aiSettings);
    }
  };

  // Alterar senha
  const handleChangePassword = async () => {
    if (!user) return;

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Senhas não coincidem",
        description: "A nova senha e a confirmação devem ser iguais.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    try {
      setChangingPassword(true);
      await updatePassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      // Erro já tratado no contexto
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">
            Configurações
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas preferências e configurações do sistema
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="profile">
              <User className="w-4 h-4 mr-2" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="security">
              <Lock className="w-4 h-4 mr-2" />
              Segurança
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="w-4 h-4 mr-2" />
              Notificações
            </TabsTrigger>
            <TabsTrigger value="ai">
              <Brain className="w-4 h-4 mr-2" />
              IA
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="glass-card rounded-2xl p-6 space-y-6">
              <div>
                <h2 className="font-display font-semibold text-lg">
                  Informações do Perfil
                </h2>
                <p className="text-sm text-muted-foreground">
                  Atualize suas informações pessoais
                </p>
              </div>

              <Separator />

              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-neuro-gradient flex items-center justify-center">
                  <User className="w-10 h-10 text-primary-foreground" />
                </div>
                <div>
                  <Button variant="outline" size="sm" disabled>
                    Alterar Foto
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Em breve
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Nome Completo</Label>
                  <Input
                    value={profile.fullName}
                    onChange={(e) =>
                      setProfile({ ...profile, fullName: e.target.value })
                    }
                    placeholder="Seu nome completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label>E-mail</Label>
                  <Input
                    type="email"
                    value={profile.email}
                    onChange={(e) =>
                      setProfile({ ...profile, email: e.target.value })
                    }
                    placeholder="seu@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Especialidade</Label>
                  <Input
                    value={profile.specialty}
                    onChange={(e) =>
                      setProfile({ ...profile, specialty: e.target.value })
                    }
                    placeholder="Ex: Psiquiatria"
                  />
                </div>
                <div className="space-y-2">
                  <Label>CRM</Label>
                  <Input
                    value={profile.crm}
                    onChange={(e) =>
                      setProfile({ ...profile, crm: e.target.value })
                    }
                    placeholder="Ex: 123456-SP"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input
                    value={profile.phone}
                    onChange={(e) =>
                      setProfile({ ...profile, phone: e.target.value })
                    }
                    placeholder="(11) 98765-4321"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Idioma</Label>
                  <Select
                    value={profile.language}
                    onValueChange={(value) =>
                      setProfile({ ...profile, language: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  variant="neuro"
                  onClick={handleSaveProfile}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <div className="space-y-6">
              <div className="glass-card rounded-2xl p-6 space-y-6">
                <div>
                  <h2 className="font-display font-semibold text-lg">
                    Alterar Senha
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Mantenha sua conta segura com uma senha forte
                  </p>
                </div>

                <Separator />

                <div className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <Label>Senha Atual</Label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          currentPassword: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nova Senha</Label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          newPassword: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirmar Nova Senha</Label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          confirmPassword: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    variant="neuro"
                    onClick={handleChangePassword}
                    disabled={changingPassword}
                  >
                    {changingPassword ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Atualizando...
                      </>
                    ) : (
                      <>
                        <Key className="w-4 h-4 mr-2" />
                        Atualizar Senha
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="glass-card rounded-2xl p-6 space-y-6">
                <div>
                  <h2 className="font-display font-semibold text-lg text-destructive">
                    Zona de Perigo
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Ações irreversíveis para sua conta
                  </p>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Excluir Conta</p>
                    <p className="text-sm text-muted-foreground">
                      Esta ação é permanente e não pode ser desfeita
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir Conta
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. Isso excluirá
                          permanentemente sua conta e removerá seus dados de
                          nossos servidores.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <div className="glass-card rounded-2xl p-6 space-y-6">
              <div>
                <h2 className="font-display font-semibold text-lg">
                  Preferências de Notificação
                </h2>
                <p className="text-sm text-muted-foreground">
                  Configure como você deseja receber notificações
                </p>
              </div>

              <Separator />

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Notificações por E-mail</p>
                      <p className="text-sm text-muted-foreground">
                        Receber atualizações por e-mail
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={(checked) =>
                      handleNotificationChange("email", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Bell className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Notificações Push</p>
                      <p className="text-sm text-muted-foreground">
                        Receber notificações no navegador
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.push}
                    onCheckedChange={(checked) =>
                      handleNotificationChange("push", checked)
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Alertas de Eficácia</p>
                    <p className="text-sm text-muted-foreground">
                      Notificar quando eficácia cair abaixo do esperado
                    </p>
                  </div>
                  <Switch
                    checked={notifications.alerts}
                    onCheckedChange={(checked) =>
                      handleNotificationChange("alerts", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Recomendações da IA</p>
                    <p className="text-sm text-muted-foreground">
                      Notificar sobre novas recomendações de ajuste
                    </p>
                  </div>
                  <Switch
                    checked={notifications.recommendations}
                    onCheckedChange={(checked) =>
                      handleNotificationChange("recommendations", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Relatórios Semanais</p>
                    <p className="text-sm text-muted-foreground">
                      Receber resumo semanal por e-mail
                    </p>
                  </div>
                  <Switch
                    checked={notifications.reports}
                    onCheckedChange={(checked) =>
                      handleNotificationChange("reports", checked)
                    }
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* AI Tab */}
          <TabsContent value="ai">
            <div className="glass-card rounded-2xl p-6 space-y-6">
              <div>
                <h2 className="font-display font-semibold text-lg">
                  Configurações de IA
                </h2>
                <p className="text-sm text-muted-foreground">
                  Personalize o comportamento do módulo de Inteligência
                  Artificial
                </p>
              </div>

              <Separator />

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-neuro-gradient flex items-center justify-center">
                      <Brain className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">Análise Automática</p>
                      <p className="text-sm text-muted-foreground">
                        Executar inferência automaticamente ao registrar dose
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={aiSettings.autoAnalysis}
                    onCheckedChange={(checked) =>
                      handleAISettingChange("autoAnalysis", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Alertas de Risco</p>
                    <p className="text-sm text-muted-foreground">
                      Gerar alertas quando IA detectar riscos potenciais
                    </p>
                  </div>
                  <Switch
                    checked={aiSettings.riskAlerts}
                    onCheckedChange={(checked) =>
                      handleAISettingChange("riskAlerts", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Recomendações Proativas</p>
                    <p className="text-sm text-muted-foreground">
                      Permitir que IA sugira ajustes de dose automaticamente
                    </p>
                  </div>
                  <Switch
                    checked={aiSettings.recommendations}
                    onCheckedChange={(checked) =>
                      handleAISettingChange("recommendations", checked)
                    }
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Nível de Confiança Mínimo</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Mostrar apenas recomendações acima deste nível de confiança
                  </p>
                  <Select
                    value={aiSettings.confidence}
                    onValueChange={(value) =>
                      handleAISettingChange("confidence", value)
                    }
                  >
                    <SelectTrigger className="max-w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixo (60%+)</SelectItem>
                      <SelectItem value="medium">Médio (75%+)</SelectItem>
                      <SelectItem value="high">Alto (90%+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-4 rounded-xl bg-neuro-gradient-subtle border border-primary/20">
                  <div className="flex items-center gap-2 text-primary mb-2">
                    <Shield className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Sobre a IA do NeuroDose
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    O módulo de IA utiliza modelos ONNX otimizados para prever
                    eficácia de medicamentos. Todas as inferências são
                    executadas localmente, garantindo privacidade dos dados
                    clínicos.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
