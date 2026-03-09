import { DoseRecord } from "./doses";
import { Patient } from "./patients";
import { Medication } from "./medications";
import { differenceInDays, subDays, format, startOfDay, endOfDay, isWithinInterval } from "date-fns";

// =============================================================================
// INTERFACES
// =============================================================================

export interface AnalyticsMetrics {
    totalDoses: number;
    totalPatients: number;
    avgEfficacy: number;
    avgMood: number;
    avgEnergy: number;
    adherenceRate: number;
    riskAlerts: number;
    trendDirection: "up" | "down" | "stable";
}

export interface TrendDataPoint {
    date: string;
    efficacy: number;
    mood: number;
    energy: number;
    doseCount: number;
}

export interface RiskAlert {
    id: string;
    type: "low_efficacy" | "low_mood" | "irregular_doses" | "low_adherence" | "declining_trend";
    severity: "low" | "medium" | "high";
    patientId?: string;
    patientName?: string;
    message: string;
    timestamp: string;
}

export interface PatientAnalytics {
    patientId: string;
    patientName: string;
    totalDoses: number;
    avgEfficacy: number;
    avgMood: number;
    avgEnergy: number;
    adherenceRate: number;
    lastDoseDate: string | null;
    bestDoseTime: string | null;
    trend: "improving" | "declining" | "stable";
    riskLevel: "low" | "medium" | "high";
}

export interface WeeklyForecast {
    day: string;
    predictedEfficacy: number;
    confidence: number;
}

export interface PredictiveInsights {
    adherencePrediction: number;
    riskScore: number;
    suggestedDoseAdjustment: string | null;
    weeklyForecast: WeeklyForecast[];
    insights: string[];
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Agrupa doses por data (formato dd/MM)
 */
function groupDosesByDate(doses: DoseRecord[]): Map<string, DoseRecord[]> {
    const grouped = new Map<string, DoseRecord[]>();

    doses.forEach(dose => {
        if (!dose.timestamp) return;
        const dateKey = format(new Date(dose.timestamp), "yyyy-MM-dd");
        const existing = grouped.get(dateKey) || [];
        existing.push(dose);
        grouped.set(dateKey, existing);
    });

    return grouped;
}

/**
 * Calcula média de eficácia de um array de doses
 */
function calculateAvgEfficacy(doses: DoseRecord[]): number {
    if (doses.length === 0) return 0;
    const total = doses.reduce((acc, dose) => {
        const efficacy = dose.analysis?.efficacyPrediction ||
            ((dose.subjectiveState?.energy || 0) * 10);
        return acc + efficacy;
    }, 0);
    return Math.round(total / doses.length);
}

/**
 * Calcula média de humor
 */
function calculateAvgMood(doses: DoseRecord[]): number {
    if (doses.length === 0) return 0;
    const total = doses.reduce((acc, dose) => acc + (dose.subjectiveState?.mood || 0), 0);
    return Math.round((total / doses.length) * 10) / 10;
}

/**
 * Calcula média de energia
 */
function calculateAvgEnergy(doses: DoseRecord[]): number {
    if (doses.length === 0) return 0;
    const total = doses.reduce((acc, dose) => acc + (dose.subjectiveState?.energy || 0), 0);
    return Math.round((total / doses.length) * 10) / 10;
}

// =============================================================================
// MAIN ANALYTICS FUNCTIONS
// =============================================================================

/**
 * Calcula taxa de adesão ao tratamento
 * Baseado na regularidade de doses registradas nos últimos X dias
 */
export function calculateAdherenceRate(
    doses: DoseRecord[],
    daysToAnalyze: number = 30,
    expectedDosesPerDay: number = 1
): number {
    if (doses.length === 0) return 0;

    const today = new Date();
    const startDate = subDays(today, daysToAnalyze);

    // Filtra doses no período
    const recentDoses = doses.filter(dose => {
        if (!dose.timestamp) return false;
        const doseDate = new Date(dose.timestamp);
        return isWithinInterval(doseDate, { start: startDate, end: today });
    });

    // Conta dias únicos com doses
    const daysWithDoses = new Set(
        recentDoses.map(dose => format(new Date(dose.timestamp), "yyyy-MM-dd"))
    ).size;

    // Calcula taxa
    const expectedDays = Math.min(daysToAnalyze, differenceInDays(today, new Date(doses[doses.length - 1]?.timestamp || today)) + 1);
    const adherenceRate = (daysWithDoses / expectedDays) * 100;

    return Math.min(100, Math.round(adherenceRate));
}

/**
 * Gera dados de tendência para gráficos
 */
export function calculateTrendData(
    doses: DoseRecord[],
    daysToAnalyze: number = 30
): TrendDataPoint[] {
    const today = new Date();
    const startDate = subDays(today, daysToAnalyze);
    const trendData: TrendDataPoint[] = [];

    // Filtra doses no período
    const recentDoses = doses.filter(dose => {
        if (!dose.timestamp) return false;
        const doseDate = new Date(dose.timestamp);
        return isWithinInterval(doseDate, { start: startDate, end: today });
    });

    // Agrupa por data
    const grouped = groupDosesByDate(recentDoses);

    // Gera dados para cada dia
    for (let i = daysToAnalyze; i >= 0; i--) {
        const date = subDays(today, i);
        const dateKey = format(date, "yyyy-MM-dd");
        const dayDoses = grouped.get(dateKey) || [];

        if (dayDoses.length > 0) {
            trendData.push({
                date: format(date, "dd/MM"),
                efficacy: calculateAvgEfficacy(dayDoses),
                mood: calculateAvgMood(dayDoses) * 20, // Scale to 0-100 for chart
                energy: calculateAvgEnergy(dayDoses) * 10, // Scale to 0-100 for chart
                doseCount: dayDoses.length
            });
        }
    }

    return trendData;
}

/**
 * Identifica padrões de risco nos dados
 */
export function identifyRiskPatterns(
    doses: DoseRecord[],
    patients: Patient[]
): RiskAlert[] {
    const alerts: RiskAlert[] = [];
    const patientMap = new Map(patients.map(p => [p.id, p.name]));

    // Agrupa doses por paciente
    const dosesByPatient = new Map<string, DoseRecord[]>();
    doses.forEach(dose => {
        if (!dose.patientId) return;
        const existing = dosesByPatient.get(dose.patientId) || [];
        existing.push(dose);
        dosesByPatient.set(dose.patientId, existing);
    });

    dosesByPatient.forEach((patientDoses, patientId) => {
        const patientName = patientMap.get(patientId) || "Paciente Desconhecido";

        // Ordena doses do paciente por data decrescente (mais recentes primeiro)
        const sortedDoses = [...patientDoses].sort((a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        const recentDoses = sortedDoses.slice(0, 7);

        // 1. Verifica eficácia baixa persistente
        const lowEfficacyDoses = recentDoses.filter(d =>
            (d.analysis?.efficacyPrediction || 0) < 60
        );

        if (lowEfficacyDoses.length >= 3) {
            alerts.push({
                id: `risk-low-efficacy-${patientId}-${Date.now()}`,
                type: "low_efficacy",
                severity: lowEfficacyDoses.length >= 5 ? "high" : "medium",
                patientId,
                patientName,
                message: `${lowEfficacyDoses.length} doses recentes com eficácia abaixo de 60%`,
                timestamp: new Date().toISOString()
            });
        }

        // 2. Verifica humor baixo persistente
        const lowMoodDoses = recentDoses.filter(d =>
            (d.subjectiveState?.mood || 5) < 3
        );

        if (lowMoodDoses.length >= 2) {
            alerts.push({
                id: `risk-low-mood-${patientId}-${Date.now()}`,
                type: "low_mood",
                severity: lowMoodDoses.length >= 4 ? "high" : "medium",
                patientId,
                patientName,
                message: `Humor baixo reportado em ${lowMoodDoses.length} registros recentes`,
                timestamp: new Date().toISOString()
            });
        }

        // 3. Verifica irregularidade nas doses (gap de mais de 3 dias)
        if (sortedDoses.length >= 2) {
            const lastDose = new Date(sortedDoses[0]?.timestamp);
            const previousDose = new Date(sortedDoses[1]?.timestamp);
            const daysDiff = differenceInDays(lastDose, previousDose);

            if (daysDiff > 3) {
                alerts.push({
                    id: `risk-irregular-${patientId}-${Date.now()}`,
                    type: "irregular_doses",
                    severity: daysDiff > 7 ? "high" : "medium",
                    patientId,
                    patientName,
                    message: `Gap de ${daysDiff} dias entre últimas doses`,
                    timestamp: new Date().toISOString()
                });
            }
        }

        // 4. Verifica tendência de declínio
        if (recentDoses.length >= 5) {
            const firstHalf = recentDoses.slice(Math.floor(recentDoses.length / 2));
            const secondHalf = recentDoses.slice(0, Math.floor(recentDoses.length / 2));

            const avgFirst = calculateAvgEfficacy(firstHalf);
            const avgSecond = calculateAvgEfficacy(secondHalf);

            if (avgSecond < avgFirst - 15) {
                alerts.push({
                    id: `risk-declining-${patientId}-${Date.now()}`,
                    type: "declining_trend",
                    severity: avgSecond < avgFirst - 25 ? "high" : "medium",
                    patientId,
                    patientName,
                    message: `Tendência de queda na eficácia (${avgFirst}% → ${avgSecond}%)`,
                    timestamp: new Date().toISOString()
                });
            }
        }
    });

    // Ordena os alertas por severidade e depois por data
    const severityWeight = { high: 3, medium: 2, low: 1 };
    alerts.sort((a, b) => {
        if (severityWeight[a.severity] !== severityWeight[b.severity]) {
            return severityWeight[b.severity] - severityWeight[a.severity];
        }
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    return alerts;
}

/**
 * Gera insights detalhados por paciente
 */
export function getPatientInsights(
    patientId: string,
    patientName: string,
    doses: DoseRecord[]
): PatientAnalytics {
    const patientDoses = doses.filter(d => d.patientId === patientId);

    // Calcula médias
    const avgEfficacy = calculateAvgEfficacy(patientDoses);
    const avgMood = calculateAvgMood(patientDoses);
    const avgEnergy = calculateAvgEnergy(patientDoses);
    const adherenceRate = calculateAdherenceRate(patientDoses);

    // Encontra melhor horário de dose
    const timeCount: Record<string, { count: number; efficacy: number }> = {};
    patientDoses.forEach(dose => {
        const hour = dose.time?.split(":")[0] || "00";
        if (!timeCount[hour]) timeCount[hour] = { count: 0, efficacy: 0 };
        timeCount[hour].count++;
        timeCount[hour].efficacy += dose.analysis?.efficacyPrediction || 0;
    });

    let bestTime: string | null = null;
    let bestAvgEfficacy = 0;
    Object.entries(timeCount).forEach(([hour, data]) => {
        const avg = data.efficacy / data.count;
        if (avg > bestAvgEfficacy) {
            bestAvgEfficacy = avg;
            bestTime = `${hour}:00`;
        }
    });

    // Determina tendência
    let trend: "improving" | "declining" | "stable" = "stable";
    if (patientDoses.length >= 4) {
        const recent = patientDoses.slice(0, 2);
        const older = patientDoses.slice(2, 4);
        const recentAvg = calculateAvgEfficacy(recent);
        const olderAvg = calculateAvgEfficacy(older);

        if (recentAvg > olderAvg + 10) trend = "improving";
        else if (recentAvg < olderAvg - 10) trend = "declining";
    }

    // Determina nível de risco
    let riskLevel: "low" | "medium" | "high" = "low";
    if (avgEfficacy < 50 || avgMood < 2 || adherenceRate < 50) riskLevel = "high";
    else if (avgEfficacy < 70 || avgMood < 3 || adherenceRate < 75) riskLevel = "medium";

    return {
        patientId,
        patientName,
        totalDoses: patientDoses.length,
        avgEfficacy,
        avgMood,
        avgEnergy,
        adherenceRate,
        lastDoseDate: patientDoses[0]?.timestamp || null,
        bestDoseTime: bestTime,
        trend,
        riskLevel
    };
}

/**
 * Agrega todas as métricas para o dashboard
 */
export function aggregateMetrics(
    doses: DoseRecord[],
    patients: Patient[]
): AnalyticsMetrics {
    const avgEfficacy = calculateAvgEfficacy(doses);
    const avgMood = calculateAvgMood(doses);
    const avgEnergy = calculateAvgEnergy(doses);
    const adherenceRate = calculateAdherenceRate(doses);
    const riskAlerts = identifyRiskPatterns(doses, patients).length;

    // Determina direção da tendência
    let trendDirection: "up" | "down" | "stable" = "stable";
    if (doses.length >= 6) {
        const recent = doses.slice(0, 3);
        const older = doses.slice(3, 6);
        const recentAvg = calculateAvgEfficacy(recent);
        const olderAvg = calculateAvgEfficacy(older);

        if (recentAvg > olderAvg + 5) trendDirection = "up";
        else if (recentAvg < olderAvg - 5) trendDirection = "down";
    }

    return {
        totalDoses: doses.length,
        totalPatients: patients.length,
        avgEfficacy,
        avgMood,
        avgEnergy,
        adherenceRate,
        riskAlerts,
        trendDirection
    };
}

/**
 * Gera análise preditiva usando heurísticas
 */
export function generatePredictiveInsights(
    patientId: string | null,
    doses: DoseRecord[],
    medications: Medication[]
): PredictiveInsights {
    const relevantDoses = patientId
        ? doses.filter(d => d.patientId === patientId)
        : doses;

    // Calcula previsão de adesão baseado em histórico
    const recentAdherence = calculateAdherenceRate(relevantDoses, 14);
    const adherencePrediction = Math.round(recentAdherence * 0.9 + 10); // Slight regression to mean

    // Calcula score de risco (0-100)
    const avgEfficacy = calculateAvgEfficacy(relevantDoses.slice(0, 5));
    const avgMood = calculateAvgMood(relevantDoses.slice(0, 5));
    let riskScore = 0;

    if (avgEfficacy < 50) riskScore += 40;
    else if (avgEfficacy < 70) riskScore += 20;

    if (avgMood < 2) riskScore += 30;
    else if (avgMood < 3) riskScore += 15;

    if (recentAdherence < 50) riskScore += 30;
    else if (recentAdherence < 75) riskScore += 15;

    riskScore = Math.min(100, riskScore);

    // Sugestão de ajuste
    let suggestedDoseAdjustment: string | null = null;
    if (avgEfficacy < 60 && relevantDoses.length >= 5) {
        suggestedDoseAdjustment = "Considerar aumento gradual da dose ou avaliação de medicação alternativa";
    } else if (avgEfficacy > 90 && avgMood > 4) {
        suggestedDoseAdjustment = "Tratamento estável - manter protocolo atual";
    }

    // Previsão semanal
    const weeklyForecast: WeeklyForecast[] = [];
    const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const today = new Date().getDay();

    for (let i = 1; i <= 7; i++) {
        const dayIndex = (today + i) % 7;
        // Previsão baseada na média + variação aleatória simulada
        const variation = (Math.random() - 0.5) * 10;
        weeklyForecast.push({
            day: days[dayIndex],
            predictedEfficacy: Math.round(Math.max(40, Math.min(95, avgEfficacy + variation))),
            confidence: Math.round(70 + Math.random() * 20)
        });
    }

    // Gera insights textuais
    const insights: string[] = [];

    if (avgEfficacy > 80) {
        insights.push("Resposta ao tratamento acima da média - excelente evolução");
    } else if (avgEfficacy < 60) {
        insights.push("Eficácia abaixo do ideal - considerar revisão do protocolo");
    }

    if (recentAdherence > 90) {
        insights.push("Excelente adesão ao tratamento nos últimos 14 dias");
    } else if (recentAdherence < 70) {
        insights.push("Adesão irregular detectada - implementar lembretes pode ajudar");
    }

    if (avgMood >= 4) {
        insights.push("Humor estável e positivo, indicando boa resposta subjetiva");
    } else if (avgMood < 3) {
        insights.push("Monitorar humor - considerar avaliação complementar");
    }

    if (insights.length === 0) {
        insights.push("Tratamento dentro dos parâmetros esperados");
    }

    return {
        adherencePrediction,
        riskScore,
        suggestedDoseAdjustment,
        weeklyForecast,
        insights
    };
}
