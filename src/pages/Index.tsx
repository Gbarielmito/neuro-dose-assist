import { MainLayout } from "@/components/layout/MainLayout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { LastDoseCard } from "@/components/dashboard/LastDoseCard";
import { SubjectiveStateCard } from "@/components/dashboard/SubjectiveStateCard";
import { AlertsCard } from "@/components/dashboard/AlertsCard";
import { EfficacyChart } from "@/components/dashboard/EfficacyChart";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentPatients } from "@/components/dashboard/RecentPatients";
import { Users, Pill, Activity, Brain } from "lucide-react";
// import NeuroScene from "@/components/3d/NeuroScene"; // Removed due to crash

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
        {/* Header - Hero Section (CSS Version) */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 border border-white/10 shadow-xl group">

          {/* Animated Background Effects */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 mix-blend-overlay"></div>

          {/* Floating Orbs */}
          <div className="absolute top-[-20%] left-[-10%] w-64 h-64 bg-purple-500/30 rounded-full blur-3xl animate-pulse delay-0 transition-transform duration-1000 group-hover:scale-110"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-72 h-72 bg-blue-500/30 rounded-full blur-3xl animate-pulse delay-700 transition-transform duration-1000 group-hover:scale-110"></div>
          <div className="absolute top-[20%] right-[30%] w-40 h-40 bg-teal-500/20 rounded-full blur-2xl animate-pulse delay-1000"></div>

          <div className="relative z-10 p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-3 w-fit">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                </span>
                <span className="text-xs font-medium text-teal-100 uppercase tracking-wider">IA Ativa</span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight drop-shadow-sm">
                Neuro Dose <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-200 to-blue-200">Assist</span>
              </h1>
              <p className="text-blue-100/80 mt-2 text-lg max-w-lg leading-relaxed">
                Sistema inteligente de monitoramento e apoio à decisão clínica.
              </p>
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2 text-sm font-medium text-blue-100 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10 transition-colors hover:bg-white/10">
                <Activity className="w-4 h-4 text-teal-300" />
                <span>Status: Otimizado</span>
              </div>
              <p className="text-xs text-blue-200/60">Última sinc: Agora mesmo</p>
            </div>
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
