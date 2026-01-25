export interface AnalysisResult {
    recommendation: string;
    riskAssessment: {
        category: string;
        level: string;
        description: string;
    }[];
    efficacyPrediction: number;
}

export interface DoseData {
    patientId: string;
    medicationId: string;
    dose: string;
    time: string;
    indication: string;
}

export interface SubjectiveState {
    mood: number; // 1-5
    energy: number; // 0-10
    sleep: number; // 0-10
    effects: string;
}

export const analyzeDose = async (
    doseData: DoseData,
    state: SubjectiveState
): Promise<AnalysisResult> => {
    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const { mood, energy, sleep } = state;
    const moodScore = mood; // 1-5
    const compositeScore = (mood * 2 + energy + sleep) / 3; // Normalize roughly to 0-10 scale

    let recommendation = "";
    let efficacyPrediction = 0;
    const risks = [];

    // Heuristic Logic
    if (sleep < 5) {
        recommendation += "Considerar ajuste no horário da medicação para não interferir no sono. ";
        risks.push({
            category: "Sono",
            level: "Médio",
            description: "Qualidade do sono baixa pode afetar eficácia.",
        });
    }

    if (mood < 3) {
        recommendation += "Monitorar sintomas depressivos. Se persistir, consultar médico para ajuste de dose. ";
        efficacyPrediction = 60 + Math.random() * 10;
    } else if (mood >= 4) {
        recommendation += "Resposta positiva ao tratamento atual. Manter conduta. ";
        efficacyPrediction = 85 + Math.random() * 10;
    } else {
        recommendation += "Resposta estável. Continuar observação. ";
        efficacyPrediction = 70 + Math.random() * 15;
    }

    if (energy < 4) {
        risks.push({
            category: "Energia",
            level: "Baixo",
            description: "Baixa energia relatada.",
        });
    }

    // Fallback if empty
    if (!recommendation) {
        recommendation = "Manter protocolo atual e reavaliar em 7 dias.";
    }

    // Ensure efficacy is within bounds
    efficacyPrediction = Math.min(99, Math.max(10, Math.floor(efficacyPrediction)));

    return {
        recommendation,
        riskAssessment: risks.length > 0 ? risks : [{ category: "Geral", level: "Baixo", description: "Nenhum risco imediato identificado." }],
        efficacyPrediction,
    };
};
