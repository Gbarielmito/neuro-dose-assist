import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { LastDoseCard } from "@/components/dashboard/LastDoseCard";

import { AlertsCard } from "@/components/dashboard/AlertsCard";
import { EfficacyChart } from "@/components/dashboard/EfficacyChart";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentPatients } from "@/components/dashboard/RecentPatients";
import { Users, Pill, Activity, Brain, Sparkles, Zap, Calendar, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getPatients, Patient } from "@/lib/patients";
import { getDoses, DoseRecord } from "@/lib/doses";
import { getMedications } from "@/lib/medications";
import { getUpcomingAppointments, type Appointment } from "@/lib/appointments";
import { format, subDays, isAfter } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doses, setDoses] = useState<DoseRecord[]>([]);
  const [medications, setMedications] = useState<any[]>([]);

  // Computed stats
  const [stats, setStats] = useState({
    activePatients: 0,
    activePatientsTrend: 0,
    dosesLast7Days: 0,
    dosesTrend: 0,
    avgEfficacy: 0,
    efficacyTrend: 0,
    aiInferences: 0,
    aiTrend: 0
  });

  const [chartData, setChartData] = useState<any[]>([]);
  const [recentPatientsFormatted, setRecentPatientsFormatted] = useState<any[]>([]);
  const [lastDose, setLastDose] = useState<any>(null);
  const [lastState, setLastState] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    async function loadDashboardData() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [patientsData, dosesData, medicationsData, appointmentsData] = await Promise.all([
          getPatients(user.uid),
          getDoses(user.uid),
          getMedications(user.uid),
          getUpcomingAppointments(user.uid)
        ]);

        setPatients(patientsData || []);
        setDoses(dosesData || []);
        setMedications(medicationsData || []);
        setUpcomingAppointments(appointmentsData || []);

        // Process Stats
        const now = new Date();
        const sevenDaysAgo = subDays(now, 7);
        const fourteenDaysAgo = subDays(now, 14);

        // Active Patients
        const activePatientsCount = patientsData.length;

        // Doses Last 7 Days vs Previous 7 Days
        const recentDoses = dosesData.filter(d => isAfter(new Date(d.timestamp), sevenDaysAgo));
        const previousDoses = dosesData.filter(d => {
          const date = new Date(d.timestamp);
          return isAfter(date, fourteenDaysAgo) && !isAfter(date, sevenDaysAgo);
        });

        const doseTrend = previousDoses.length > 0
          ? Math.round(((recentDoses.length - previousDoses.length) / previousDoses.length) * 100)
          : 0;

        // Avg Efficacy (Overall)
        let totalEfficacy = 0;
        let countEfficacy = 0;
        dosesData.forEach(d => {
          const eff = d.analysis?.efficacyPrediction || ((d.subjectiveState?.energy || 0) * 10);
          if (eff) {
            totalEfficacy += eff;
            countEfficacy++;
          }
        });
        const avgEfficacyVal = countEfficacy > 0 ? Math.round(totalEfficacy / countEfficacy) : 0;

        // AI Inferences (Count doses with analysis)
        const aiInferencesCount = dosesData.filter(d => d.analysis).length;

        setStats({
          activePatients: activePatientsCount,
          activePatientsTrend: 3,
          dosesLast7Days: recentDoses.length,
          dosesTrend: doseTrend,
          avgEfficacy: avgEfficacyVal,
          efficacyTrend: 2,
          aiInferences: aiInferencesCount,
          aiTrend: 5
        });

        // Chart Data (Daily avg efficacy last 7 days)
        const chart = [];
        for (let i = 6; i >= 0; i--) {
          const targetDate = subDays(now, i);
          const dateStr = format(targetDate, 'dd/MM');
          const dayDoses = dosesData.filter(d => format(new Date(d.timestamp), 'dd/MM') === dateStr);

          let dayEff = 0;
          let dayDoseAmount = 0;
          if (dayDoses.length > 0) {
            dayEff = dayDoses.reduce((acc, d) => acc + (d.analysis?.efficacyPrediction || ((d.subjectiveState?.energy || 0) * 10) || 0), 0) / dayDoses.length;
            dayDoseAmount = dayDoses.reduce((acc, d) => acc + (parseInt(d.doseAmount) || 0), 0) / dayDoses.length;
          }

          chart.push({
            date: dateStr,
            efficacy: Math.round(dayEff),
            dose: Math.round(dayDoseAmount)
          });
        }
        setChartData(chart);

        // Recent Patients List
        const recentPats = patientsData.slice(0, 3).map(p => {
          const pDoses = dosesData.filter(d => d.patientId === p.id);
          const lastPDose = pDoses.length > 0 ? pDoses[0] : null;
          const med = medicationsData.find(m => m.id === lastPDose?.medicationId);

          return {
            id: p.id,
            name: p.name,
            age: p.age || 0,
            lastDose: lastPDose ? format(new Date(lastPDose.timestamp), "HH:mm") : "N/A",
            medication: med ? `${med.name} ${lastPDose?.doseAmount}mg` : "Sem registro",
            efficacy: lastPDose?.analysis?.efficacyPrediction || 0,
            photoURL: p.photoURL
          };
        });
        setRecentPatientsFormatted(recentPats);

        // Last Dose Card & State
        if (dosesData.length > 0) {
          const latest = dosesData[0];
          const med = medicationsData.find(m => m.id === latest.medicationId);
          setLastDose({
            medication: med ? med.name : "Desconhecido",
            dose: `${latest.doseAmount}mg`,
            time: format(new Date(latest.timestamp), "HH:mm"),
            efficacy: latest.analysis?.efficacyPrediction || 0,
            riskLevel: "low"
          });
          setLastState(latest.subjectiveState);

          // Generate simple alerts based on latest data
          const newAlerts = [];
          if (latest.subjectiveState?.mood < 4) {
            newAlerts.push({
              id: "alert-1",
              type: "warning",
              title: "Humor Baixo Detectado",
              description: `Paciente relatou humor nível ${latest.subjectiveState.mood}. Monitorar.`,
              time: "Recente"
            });
          }
          if (latest.analysis?.efficacyPrediction && latest.analysis.efficacyPrediction < 60) {
            newAlerts.push({
              id: "alert-2",
              type: "danger",
              title: "Baixa Eficácia Estimada",
              description: "Última dose teve eficácia inferior a 60%.",
              time: "Recente"
            });
          }
          if (newAlerts.length === 0) {
            newAlerts.push({
              id: "info-1",
              type: "info",
              title: "Monitoramento Ativo",
              description: "Nenhum alerta crítico detectado nas últimas doses.",
              time: "Agora"
            });
          }
          setAlerts(newAlerts);
        } else {
          setAlerts([{ id: "0", type: "info", title: "Bem-vindo", description: "Registre sua primeira dose para ver alertas.", time: "Agora" }]);
        }

      } catch (error) {
        console.error("Dashboard data load failed:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [user]);

  return (
    <MainLayout>
      <div className="space-y-4 sm:space-y-6 pb-8">
        {/* Header - Hero Section */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-white/5 shadow-2xl group">

          {/* Refined background pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5QzkyQUMiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

          {/* Animated accent orbs */}
          <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-br from-teal-500/20 to-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:from-teal-500/30 transition-all duration-700" />
          <div className="absolute bottom-0 left-0 w-48 h-48 sm:w-72 sm:h-72 bg-gradient-to-tr from-violet-500/15 to-purple-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

          <div className="relative z-10 p-5 sm:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
              <div className="space-y-3 sm:space-y-4">
                {/* Status badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 w-fit">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="text-xs font-medium text-emerald-200/90 uppercase tracking-wider">Sistema Ativo</span>
                </div>

                {/* Title */}
                <div>
                  <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
                    Painel de <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-cyan-300 to-blue-300">Controle</span>
                  </h1>
                  <p className="text-slate-400 mt-2 text-sm sm:text-base max-w-lg leading-relaxed">
                    Monitoramento inteligente e apoio à decisão clínica em tempo real.
                  </p>
                </div>

                {/* Quick stats row */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center">
                      <Users className="w-4 h-4 text-teal-300" />
                    </div>
                    <div>
                      <span className="font-semibold text-white">{stats.activePatients}</span>
                      <span className="text-slate-400 ml-1 text-xs sm:text-sm">pacientes</span>
                    </div>
                  </div>
                  <div className="hidden sm:block w-px h-6 bg-white/10" />
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-violet-300" />
                    </div>
                    <div>
                      <span className="font-semibold text-white">{stats.aiInferences}</span>
                      <span className="text-slate-400 ml-1 text-xs sm:text-sm">análises IA</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right side - Status card */}
              <div className="hidden lg:flex flex-col items-end gap-3">
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500/30 to-cyan-500/20 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-teal-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Status: Otimizado</p>
                    <p className="text-xs text-slate-400">Última sincronização: agora</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <QuickActions />

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="animate-fade-up stagger-1">
            <MetricCard
              title="Pacientes Ativos"
              value={stats.activePatients.toString()}
              subtitle={stats.activePatientsTrend > 0 ? `+${stats.activePatientsTrend} novos` : "Sem novos"}
              icon={<Users className="w-5 h-5 sm:w-6 sm:h-6" />}
              trend={{ value: 12, label: "vs. mês anterior" }}
            />
          </div>
          <div className="animate-fade-up stagger-2">
            <MetricCard
              title="Doses Registradas"
              value={stats.dosesLast7Days.toString()}
              subtitle="Últimos 7 dias"
              icon={<Pill className="w-5 h-5 sm:w-6 sm:h-6" />}
              trend={{ value: stats.dosesTrend, label: "vs. semana anterior" }}
              variant="success"
            />
          </div>
          <div className="animate-fade-up stagger-3">
            <MetricCard
              title="Eficácia Média"
              value={`${stats.avgEfficacy}%`}
              subtitle="Geral"
              icon={<Activity className="w-5 h-5 sm:w-6 sm:h-6" />}
              trend={{ value: 5, label: "estável" }}
            />
          </div>
          <div className="animate-fade-up stagger-4">
            <MetricCard
              title="Inferências IA"
              value={stats.aiInferences.toString()}
              subtitle="Total processado"
              icon={<Brain className="w-5 h-5 sm:w-6 sm:h-6" />}
              trend={{ value: stats.aiTrend, label: "crescente" }}
              variant="warning"
            />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column - Charts & Patients */}
          <div className="xl:col-span-2 space-y-4 sm:space-y-6">
            <EfficacyChart data={chartData} />
            <RecentPatients patients={recentPatientsFormatted} />
          </div>

          {/* Right Column - Dose & Alerts */}
          <div className="space-y-4 sm:space-y-6">
            {lastDose ? (
              <LastDoseCard
                medication={lastDose.medication}
                dose={lastDose.dose}
                time={lastDose.time}
                efficacy={lastDose.efficacy}
                riskLevel={lastDose.riskLevel}
              />
            ) : (
              <div className="p-6 rounded-2xl glass-card border border-border/50 text-center text-muted-foreground">
                <Pill className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p className="font-medium">Nenhuma dose registrada</p>
                <p className="text-sm mt-1">Registre a primeira dose para visualizar.</p>
              </div>
            )}

            <AlertsCard alerts={alerts} />

            {/* Upcoming Appointments */}
            <div className="glass-card rounded-2xl p-5 border border-border/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold">Próximas Consultas</h3>
                </div>
                <Link to="/appointments" className="text-sm text-primary hover:underline">
                  Ver todas
                </Link>
              </div>

              {upcomingAppointments.length > 0 ? (
                <div className="space-y-3">
                  {upcomingAppointments.slice(0, 4).map((apt) => (
                    <div key={apt.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                        <Clock className="w-4 h-4 text-primary mb-0.5" />
                        <span className="text-xs font-medium">{apt.time}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{apt.patientName}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(apt.date + 'T00:00:00'), 'dd/MM')} • {apt.type}
                        </p>
                      </div>
                      <Badge variant="outline" className={
                        apt.status === 'Confirmada' ? 'bg-success/10 text-success border-success/20' :
                          apt.status === 'Agendada' ? 'bg-muted text-muted-foreground' :
                            'bg-primary/10 text-primary border-primary/20'
                      }>
                        {apt.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhuma consulta agendada</p>
                  <Link to="/appointments" className="text-sm text-primary hover:underline mt-1 inline-block">
                    Agendar consulta
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
