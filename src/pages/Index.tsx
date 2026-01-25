import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { LastDoseCard } from "@/components/dashboard/LastDoseCard";

import { AlertsCard } from "@/components/dashboard/AlertsCard";
import { EfficacyChart } from "@/components/dashboard/EfficacyChart";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentPatients } from "@/components/dashboard/RecentPatients";
import { Users, Pill, Activity, Brain } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getPatients, Patient } from "@/lib/patients";
import { getDoses, DoseRecord } from "@/lib/doses";
import { getMedications } from "@/lib/medications"; // Import only getMedications
import { format, subDays, isAfter } from "date-fns";

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doses, setDoses] = useState<DoseRecord[]>([]);
  const [medications, setMedications] = useState<any[]>([]); // simplified type for ease

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

  useEffect(() => {
    async function loadDashboardData() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [patientsData, dosesData, medicationsData] = await Promise.all([
          getPatients(user.uid),
          getDoses(user.uid),
          getMedications(user.uid)
        ]);

        setPatients(patientsData || []);
        setDoses(dosesData || []);
        setMedications(medicationsData || []);

        // Process Stats
        const now = new Date();
        const sevenDaysAgo = subDays(now, 7);
        const fourteenDaysAgo = subDays(now, 14);

        // Active Patients (mock trend for now as we don't track history of patient creation strictly for trend)
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
          activePatientsTrend: 3, // mock
          dosesLast7Days: recentDoses.length,
          dosesTrend: doseTrend,
          avgEfficacy: avgEfficacyVal,
          efficacyTrend: 2, // mock
          aiInferences: aiInferencesCount,
          aiTrend: 5 // mock
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
            date: dateStr, // e.g. "Seg" or date
            efficacy: Math.round(dayEff),
            dose: Math.round(dayDoseAmount)
          });
        }
        setChartData(chart);

        // Recent Patients List
        // Map real patients to display format. Use last dose time if available.
        const recentPats = patientsData.slice(0, 3).map(p => {
          // Find last dose for this patient
          const pDoses = dosesData.filter(d => d.patientId === p.id);
          const lastPDose = pDoses.length > 0 ? pDoses[0] : null; // Doses are sorted desc by default per lib
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
            riskLevel: "low" // mock or derive from riskAssessment
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
          // Default alerts if no data
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
      <div className="space-y-6">
        {/* Header - Hero Section */}
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
          <div className="animate-fade-up stagger-1">
            <MetricCard
              title="Pacientes Ativos"
              value={stats.activePatients.toString()}
              subtitle={stats.activePatientsTrend > 0 ? `${stats.activePatientsTrend} novos (est)` : "Sem novos"} // Mock trend for now
              icon={<Users className="w-6 h-6" />}
              trend={{ value: 12, label: "vs. mês anterior" }} // Mock trend
            />
          </div>
          <div className="animate-fade-up stagger-2">
            <MetricCard
              title="Doses Registradas"
              value={stats.dosesLast7Days.toString()}
              subtitle="Últimos 7 dias"
              icon={<Pill className="w-6 h-6" />}
              trend={{ value: stats.dosesTrend, label: "vs. semana anterior" }}
              variant="success"
            />
          </div>
          <div className="animate-fade-up stagger-3">
            <MetricCard
              title="Eficácia Média"
              value={`${stats.avgEfficacy}%`}
              subtitle="Geral"
              icon={<Activity className="w-6 h-6" />}
              trend={{ value: 5, label: "estável" }} // Mock
            />
          </div>
          <div className="animate-fade-up stagger-4">
            <MetricCard
              title="Inferências IA"
              value={stats.aiInferences.toString()}
              subtitle="Total processado"
              icon={<Brain className="w-6 h-6" />}
              trend={{ value: stats.aiTrend, label: "crescente" }} // Mock
              variant="warning"
            />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <EfficacyChart data={chartData} />
            <RecentPatients patients={recentPatientsFormatted} />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
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
                Nenhuma dose registrada ainda.
              </div>
            )}



            <AlertsCard alerts={alerts} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
