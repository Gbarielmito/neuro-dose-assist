import { useState } from "react";
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
  Palette,
  Globe,
  Trash2,
  Save,
  Mail,
  Key,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Settings() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    alerts: true,
    recommendations: true,
    reports: false,
  });

  const [aiSettings, setAiSettings] = useState({
    autoAnalysis: true,
    riskAlerts: true,
    recommendations: true,
    confidence: "high",
  });

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
                <h2 className="font-display font-semibold text-lg">Informações do Perfil</h2>
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
                  <Button variant="outline" size="sm">
                    Alterar Foto
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    JPG, GIF ou PNG. Máximo 1MB.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Nome Completo</Label>
                  <Input defaultValue="Dr. Carlos Médico" />
                </div>
                <div className="space-y-2">
                  <Label>E-mail</Label>
                  <Input type="email" defaultValue="carlos@clinica.com" />
                </div>
                <div className="space-y-2">
                  <Label>Especialidade</Label>
                  <Input defaultValue="Psiquiatria" />
                </div>
                <div className="space-y-2">
                  <Label>CRM</Label>
                  <Input defaultValue="123456-SP" />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input defaultValue="(11) 98765-4321" />
                </div>
                <div className="space-y-2">
                  <Label>Idioma</Label>
                  <Select defaultValue="pt-BR">
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
                <Button variant="neuro">
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <div className="space-y-6">
              <div className="glass-card rounded-2xl p-6 space-y-6">
                <div>
                  <h2 className="font-display font-semibold text-lg">Alterar Senha</h2>
                  <p className="text-sm text-muted-foreground">
                    Mantenha sua conta segura com uma senha forte
                  </p>
                </div>

                <Separator />

                <div className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <Label>Senha Atual</Label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                  <div className="space-y-2">
                    <Label>Nova Senha</Label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirmar Nova Senha</Label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button variant="neuro">
                    <Key className="w-4 h-4 mr-2" />
                    Atualizar Senha
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
                          Esta ação não pode ser desfeita. Isso excluirá permanentemente sua
                          conta e removerá seus dados de nossos servidores.
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
                <h2 className="font-display font-semibold text-lg">Preferências de Notificação</h2>
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
                      setNotifications({ ...notifications, email: checked })
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
                      setNotifications({ ...notifications, push: checked })
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
                      setNotifications({ ...notifications, alerts: checked })
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
                      setNotifications({ ...notifications, recommendations: checked })
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
                      setNotifications({ ...notifications, reports: checked })
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
                <h2 className="font-display font-semibold text-lg">Configurações de IA</h2>
                <p className="text-sm text-muted-foreground">
                  Personalize o comportamento do módulo de Inteligência Artificial
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
                      setAiSettings({ ...aiSettings, autoAnalysis: checked })
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
                      setAiSettings({ ...aiSettings, riskAlerts: checked })
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
                      setAiSettings({ ...aiSettings, recommendations: checked })
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
                      setAiSettings({ ...aiSettings, confidence: value })
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
                    <span className="text-sm font-medium">Sobre a IA do NeuroDose</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    O módulo de IA utiliza modelos ONNX otimizados para prever eficácia
                    de medicamentos. Todas as inferências são executadas localmente,
                    garantindo privacidade dos dados clínicos.
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
