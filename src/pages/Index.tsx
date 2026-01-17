import { MainLayout } from "@/components/layout/MainLayout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { LastDoseCard } from "@/components/dashboard/LastDoseCard";
import { SubjectiveStateCard } from "@/components/dashboard/SubjectiveStateCard";
import { AlertsCard } from "@/components/dashboard/AlertsCard";
import { EfficacyChart } from "@/components/dashboard/EfficacyChart";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentPatients } from "@/components/dashboard/RecentPatients";
import { Users, Pill, Activity, Brain } from "lucide-react";

// Mock data
const mockAlerts = [
  {
    id: "1",
    type: "danger" as const,
    title: "Eficácia em Declínio",
    description:
      "Paciente João Silva apresenta queda de 15% na eficácia nos últimos 3 dias. Considerar ajuste de dosagem.",
    time: "Há 2 horas",
  },
  {
    id: "2",
    type: "warning" as const,
    title: "Horário Subótimo Detectado",
    description:
      "IA detectou padrão: doses às 14h têm 20% menos eficácia que às 8h.",
    time: "Há 5 horas",
  },
  {
    id: "3",
    type: "info" as const,
    title: "Novo Padrão Identificado",
    description:
      "Correlação positiva entre qualidade do sono e eficácia do medicamento.",
    time: "Há 1 dia",
  },
];

const mockChartData = [
  { date: "Seg", efficacy: 72, dose: 50 },
  { date: "Ter", efficacy: 78, dose: 50 },
  { date: "Qua", efficacy: 85, dose: 55 },
  { date: "Qui", efficacy: 82, dose: 55 },
  { date: "Sex", efficacy: 88, dose: 60 },
  { date: "Sáb", efficacy: 91, dose: 60 },
  { date: "Dom", efficacy: 87, dose: 60 },
];

const mockPatients = [
  {
    id: "1",
    name: "João Silva",
    age: 45,
    lastDose: "Hoje, 08:30",
    medication: "Metilfenidato 20mg",
    efficacy: 85,
  },
  {
    id: "2",
    name: "Maria Santos",
    age: 32,
    lastDose: "Hoje, 07:00",
    medication: "Venlafaxina 75mg",
    efficacy: 72,
  },
  {
    id: "3",
    name: "Pedro Oliveira",
    age: 58,
    lastDose: "Ontem, 22:00",
    medication: "Quetiapina 25mg",
    efficacy: 68,
  },
];

export default function Dashboard() {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold">
              Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Visão geral do sistema de apoio à decisão clínica
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="status-dot status-dot-success" />
            <span>Sistema operacional</span>
            <span className="mx-2">•</span>
            <span>Última atualização: agora</span>
          </div>
        </div>

        {/* Quick Actions */}
        <QuickActions />

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="opacity-0 animate-fade-up stagger-1">
            <MetricCard
              title="Pacientes Ativos"
              value="24"
              subtitle="3 novos esta semana"
              icon={<Users className="w-6 h-6" />}
              trend={{ value: 12, label: "vs. mês anterior" }}
            />
          </div>
          <div className="opacity-0 animate-fade-up stagger-2">
            <MetricCard
              title="Doses Registradas"
              value="156"
              subtitle="Últimos 7 dias"
              icon={<Pill className="w-6 h-6" />}
              trend={{ value: 8, label: "vs. semana anterior" }}
              variant="success"
            />
          </div>
          <div className="opacity-0 animate-fade-up stagger-3">
            <MetricCard
              title="Eficácia Média"
              value="82%"
              subtitle="Todos os pacientes"
              icon={<Activity className="w-6 h-6" />}
              trend={{ value: 5, label: "vs. mês anterior" }}
            />
          </div>
          <div className="opacity-0 animate-fade-up stagger-4">
            <MetricCard
              title="Inferências IA"
              value="312"
              subtitle="Este mês"
              icon={<Brain className="w-6 h-6" />}
              trend={{ value: -3, label: "tempo médio" }}
              variant="warning"
            />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <EfficacyChart data={mockChartData} />
            <RecentPatients patients={mockPatients} />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <LastDoseCard
              medication="Metilfenidato"
              dose="20mg"
              time="08:30"
              efficacy={85}
              riskLevel="low"
            />
            <SubjectiveStateCard mood={4} energy={7} sleep={8} />
            <AlertsCard alerts={mockAlerts} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
