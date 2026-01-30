import { useState, useEffect, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AdherenceChart,
    TrendAnalysis,
    RiskIndicators,
    PatientInsights,
    PredictiveCard
} from "@/components/analytics";
import {
    aggregateMetrics,
    calculateTrendData,
    identifyRiskPatterns,
    getPatientInsights,
    generatePredictiveInsights,
    type AnalyticsMetrics,
    type TrendDataPoint,
    type RiskAlert,
    type PatientAnalytics,
    type PredictiveInsights as PredictiveInsightsType
} from "@/lib/analytics";
import { getDoses, DoseRecord } from "@/lib/doses";
import { getPatients, Patient } from "@/lib/patients";
import { getMedications, Medication } from "@/lib/medications";
import {
    LineChart,
    Brain,
    Users,
    Activity,
    Pill,
    TrendingUp,
    TrendingDown,
    Minus,
    Loader2,
    RefreshCw,
    Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Analytics() {
    const { user } = useAuth();

    // Data states
    const [doses, setDoses] = useState<DoseRecord[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [medications, setMedications] = useState<Medication[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Filter states
    const [selectedPatient, setSelectedPatient] = useState<string>("all");
    const [timeRange, setTimeRange] = useState<string>("30");

    // Load data
    const loadData = async (showRefresh = false) => {
        if (!user) return;

        if (showRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const [dosesData, patientsData, medicationsData] = await Promise.all([
                getDoses(user.uid),
                getPatients(user.uid),
                getMedications(user.uid)
            ]);

            setDoses(dosesData || []);
            setPatients(patientsData || []);
            setMedications(medicationsData || []);
        } catch (error) {
            console.error("Error loading analytics data:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [user]);

    // Filter doses by patient
    const filteredDoses = useMemo(() => {
        if (selectedPatient === "all") return doses;
        return doses.filter(d => d.patientId === selectedPatient);
    }, [doses, selectedPatient]);

    // Calculate analytics
    const metrics: AnalyticsMetrics = useMemo(() => {
        return aggregateMetrics(filteredDoses, patients);
    }, [filteredDoses, patients]);

    const trendData: TrendDataPoint[] = useMemo(() => {
        return calculateTrendData(filteredDoses, parseInt(timeRange));
    }, [filteredDoses, timeRange]);

    const riskAlerts: RiskAlert[] = useMemo(() => {
        return identifyRiskPatterns(filteredDoses, patients);
    }, [filteredDoses, patients]);

    const patientAnalytics: PatientAnalytics[] = useMemo(() => {
        // Get insights for patients that have doses
        const patientsWithDoses = new Set(doses.map(d => d.patientId));
        return patients
            .filter(p => p.id && patientsWithDoses.has(p.id))
            .map(p => getPatientInsights(p.id!, p.name, doses));
    }, [doses, patients]);

    const predictiveInsights: PredictiveInsightsType = useMemo(() => {
        return generatePredictiveInsights(
            selectedPatient === "all" ? null : selectedPatient,
            filteredDoses,
            medications
        );
    }, [filteredDoses, medications, selectedPatient]);

    const getTrendIcon = () => {
        if (metrics.trendDirection === "up") return <TrendingUp className="w-4 h-4 text-success" />;
        if (metrics.trendDirection === "down") return <TrendingDown className="w-4 h-4 text-destructive" />;
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                    <p className="text-muted-foreground font-medium">Carregando analytics...</p>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="space-y-8 pb-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-neuro-gradient flex items-center justify-center shadow-lg">
                            <LineChart className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
                                Analytics Avançado
                            </h1>
                            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                                Insights preditivos e análise inteligente do tratamento
                            </p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex items-center gap-3">
                        <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Paciente" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos pacientes</SelectItem>
                                {patients.map(p => (
                                    <SelectItem key={p.id} value={p.id || ""}>
                                        {p.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={timeRange} onValueChange={setTimeRange}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Período" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="7">7 dias</SelectItem>
                                <SelectItem value="14">14 dias</SelectItem>
                                <SelectItem value="30">30 dias</SelectItem>
                                <SelectItem value="60">60 dias</SelectItem>
                                <SelectItem value="90">90 dias</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => loadData(true)}
                            disabled={refreshing}
                        >
                            <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
                        </Button>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    <div className="glass-card rounded-xl p-4 border-l-4 border-l-primary">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Doses</p>
                                <p className="text-2xl font-display font-bold mt-1">{metrics.totalDoses}</p>
                            </div>
                            <Pill className="w-8 h-8 text-primary/60" />
                        </div>
                    </div>

                    <div className="glass-card rounded-xl p-4 border-l-4 border-l-info">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Pacientes</p>
                                <p className="text-2xl font-display font-bold mt-1">{metrics.totalPatients}</p>
                            </div>
                            <Users className="w-8 h-8 text-info/60" />
                        </div>
                    </div>

                    <div className="glass-card rounded-xl p-4 border-l-4 border-l-success">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Eficácia</p>
                                <p className={cn(
                                    "text-2xl font-display font-bold mt-1",
                                    metrics.avgEfficacy >= 70 ? "text-success" :
                                        metrics.avgEfficacy >= 50 ? "text-warning" : "text-destructive"
                                )}>
                                    {metrics.avgEfficacy}%
                                </p>
                            </div>
                            <Activity className="w-8 h-8 text-success/60" />
                        </div>
                    </div>

                    <div className="glass-card rounded-xl p-4 border-l-4 border-l-purple-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Adesão</p>
                                <p className={cn(
                                    "text-2xl font-display font-bold mt-1",
                                    metrics.adherenceRate >= 80 ? "text-success" :
                                        metrics.adherenceRate >= 60 ? "text-warning" : "text-destructive"
                                )}>
                                    {metrics.adherenceRate}%
                                </p>
                            </div>
                            <Brain className="w-8 h-8 text-purple-500/60" />
                        </div>
                    </div>

                    <div className="glass-card rounded-xl p-4 border-l-4 border-l-warning">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Alertas</p>
                                <p className={cn(
                                    "text-2xl font-display font-bold mt-1",
                                    metrics.riskAlerts > 0 ? "text-warning" : "text-success"
                                )}>
                                    {metrics.riskAlerts}
                                </p>
                            </div>
                            <Sparkles className="w-8 h-8 text-warning/60" />
                        </div>
                    </div>

                    <div className="glass-card rounded-xl p-4 border-l-4 border-l-accent">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tendência</p>
                                <div className="flex items-center gap-2 mt-1">
                                    {getTrendIcon()}
                                    <span className={cn(
                                        "text-lg font-display font-bold",
                                        metrics.trendDirection === "up" ? "text-success" :
                                            metrics.trendDirection === "down" ? "text-destructive" : "text-muted-foreground"
                                    )}>
                                        {metrics.trendDirection === "up" ? "Alta" :
                                            metrics.trendDirection === "down" ? "Queda" : "Estável"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Analytics Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Charts */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Trend Analysis */}
                        <TrendAnalysis data={trendData} height={280} />

                        {/* Patient Insights */}
                        <PatientInsights analytics={patientAnalytics} />
                    </div>

                    {/* Right Column - Metrics & AI */}
                    <div className="space-y-6">
                        {/* Adherence Ring */}
                        <div className="glass-card rounded-2xl p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Activity className="w-4 h-4 text-primary" />
                                </div>
                                <h3 className="font-display font-semibold text-lg">Taxa de Adesão</h3>
                            </div>
                            <div className="flex justify-center py-4">
                                <AdherenceChart
                                    value={metrics.adherenceRate}
                                    size="lg"
                                    trend={metrics.trendDirection}
                                />
                            </div>
                            <p className="text-center text-sm text-muted-foreground mt-2">
                                Baseado nos últimos {timeRange} dias
                            </p>
                        </div>

                        {/* Risk Indicators */}
                        <RiskIndicators alerts={riskAlerts} maxVisible={4} />
                    </div>
                </div>

                {/* Predictive Card - Full Width */}
                <PredictiveCard insights={predictiveInsights} />
            </div>
        </MainLayout>
    );
}
