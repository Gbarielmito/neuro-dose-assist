import { findMedicationInfo, getTimeOfDay, type MedicationClassInfo } from './medicationKnowledge';
import { checkInteractions, type MedicationForCheck } from './drugInteractions';

export interface PostDoseInsight {
    icon: 'clock' | 'food' | 'alert' | 'sleep' | 'activity' | 'check' | 'droplet';
    title: string;
    description: string;
    priority: 'info' | 'warning' | 'success';
}

export interface AnalysisResult {
    recommendation: string;
    riskAssessment: {
        category: string;
        level: string;
        description: string;
    }[];
    efficacyPrediction: number;
    postDoseInsights: PostDoseInsight[];
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

export interface MedicationContext {
    name: string;
    brandName: string;
    activeIngredient: string;
    therapeuticClass: string;
    minDose: number;
    maxDose: number;
    unit: string;
}

export interface AnalysisInput {
    doseData: DoseData;
    state: SubjectiveState;
    medication?: MedicationContext;
    allMedications?: MedicationForCheck[];
}

export type ConfidenceLevel = 'low' | 'medium' | 'high';

export const analyzeDose = async (
    doseData: DoseData,
    state: SubjectiveState,
    medication?: MedicationContext,
    allMedications?: MedicationForCheck[],
    confidenceLevel: ConfidenceLevel = 'high'
): Promise<AnalysisResult> => {
    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const { mood, energy, sleep } = state;
    const insights: PostDoseInsight[] = [];

    // ── 1. Recomendação baseada no estado subjetivo (lógica existente melhorada) ──
    let recommendation = "";
    let efficacyPrediction = 0;
    const risks: { category: string; level: string; description: string }[] = [];

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

    // ── 2. Análise baseada no medicamento (NOVO) ──
    if (medication) {
        const medInfo = findMedicationInfo(
            medication.therapeuticClass,
            medication.activeIngredient,
            medication.name
        );

        if (medInfo) {
            // Gerar insights da base de conhecimento
            generateMedicationInsights(medInfo, doseData, medication, state, insights);
        }

        // Verificar faixa de dose
        const doseValue = parseFloat(doseData.dose);
        if (!isNaN(doseValue) && medication.minDose > 0 && medication.maxDose > 0) {
            if (doseValue < medication.minDose) {
                insights.push({
                    icon: 'alert',
                    title: 'Dose abaixo da faixa terapêutica',
                    description: `A dose de ${doseValue}${medication.unit} está abaixo da faixa mínima (${medication.minDose}–${medication.maxDose}${medication.unit}). Pode ser uma titulação inicial, mas verifique com o médico.`,
                    priority: 'warning',
                });
                risks.push({
                    category: "Dose",
                    level: "Médio",
                    description: `Dose (${doseValue}${medication.unit}) abaixo da faixa terapêutica (${medication.minDose}–${medication.maxDose}${medication.unit}).`,
                });
            } else if (doseValue > medication.maxDose) {
                insights.push({
                    icon: 'alert',
                    title: 'Dose acima da faixa terapêutica',
                    description: `A dose de ${doseValue}${medication.unit} excede a faixa máxima recomendada (${medication.minDose}–${medication.maxDose}${medication.unit}). Confirme com o médico.`,
                    priority: 'warning',
                });
                risks.push({
                    category: "Dose",
                    level: "Médio",
                    description: `Dose (${doseValue}${medication.unit}) acima da faixa terapêutica (${medication.minDose}–${medication.maxDose}${medication.unit}).`,
                });
            } else {
                insights.push({
                    icon: 'check',
                    title: 'Dose dentro da faixa terapêutica',
                    description: `${doseValue}${medication.unit} está dentro da faixa recomendada (${medication.minDose}–${medication.maxDose}${medication.unit}).`,
                    priority: 'success',
                });
            }
        }
    }

    // ── 3. Verificação de interações medicamentosas (NOVO) ──
    if (allMedications && allMedications.length >= 2) {
        const interactions = checkInteractions(allMedications);

        for (const interaction of interactions) {
            const severityMap: Record<string, 'warning' | 'info'> = {
                grave: 'warning',
                moderado: 'warning',
                leve: 'info',
            };

            insights.push({
                icon: 'alert',
                title: `Interação: ${interaction.medicationA} + ${interaction.medicationB}`,
                description: `${interaction.description}. ${interaction.recommendation}`,
                priority: severityMap[interaction.severity] || 'warning',
            });

            risks.push({
                category: `Interação (${interaction.severity})`,
                level: interaction.severity === 'grave' ? 'Alto' : interaction.severity === 'moderado' ? 'Médio' : 'Baixo',
                description: `${interaction.medicationA} × ${interaction.medicationB}: ${interaction.description}`,
            });
        }
    }

    // ── 4. Insights baseados no estado subjetivo + medicamento ──
    if (medication) {
        generateStateBasedInsights(state, medication, insights);
    }

    // Fallback
    if (!recommendation) {
        recommendation = "Manter protocolo atual e reavaliar em 7 dias.";
    }

    if (insights.length === 0) {
        insights.push({
            icon: 'check',
            title: 'Registro concluído',
            description: 'Dose registrada com sucesso. Continue monitorando conforme orientação médica.',
            priority: 'success',
        });
    }

    // ── 5. Filtrar insights pelo nível de confiança da IA ──
    const filteredInsights = applyConfidenceFilter(insights, confidenceLevel);

    // Ajustar recomendação pelo nível de confiança
    if (confidenceLevel === 'low') {
        recommendation = recommendation.trim();
        if (recommendation) {
            recommendation += ' ⚠️ Nível de confiança baixo — avalie clinicamente antes de seguir estas sugestões.';
        }
    }

    // Ensure efficacy is within bounds
    efficacyPrediction = Math.min(99, Math.max(10, Math.floor(efficacyPrediction)));

    return {
        recommendation,
        riskAssessment: risks.length > 0
            ? risks
            : [{ category: "Geral", level: "Baixo", description: "Nenhum risco imediato identificado." }],
        efficacyPrediction,
        postDoseInsights: filteredInsights,
    };
};

// ── Filtra insights conforme nível de confiança do médico ──
function applyConfidenceFilter(
    insights: PostDoseInsight[],
    level: ConfidenceLevel
): PostDoseInsight[] {
    if (level === 'high') {
        // Alto: retorna todos os insights
        return insights;
    }

    if (level === 'medium') {
        // Médio: retorna warnings + até 2 informativos, máx 5 total
        const warnings = insights.filter(i => i.priority === 'warning');
        const others = insights.filter(i => i.priority !== 'warning').slice(0, 2);
        return [...warnings, ...others].slice(0, 5);
    }

    // Baixo: apenas warnings e alertas críticos, máx 3
    const critical = insights.filter(i => i.priority === 'warning');
    const result = critical.slice(0, 3);

    if (result.length === 0) {
        // Se não há nenhum warning, mostrar pelo menos um insight genérico
        result.push({
            icon: 'check',
            title: 'Registro concluído',
            description: 'Dose registrada. Confiança da IA configurada como baixa — consulte orientação clínica para detalhes.',
            priority: 'info',
        });
    }

    return result;
}

// ── Gerador de insights baseados na base de conhecimento ──
function generateMedicationInsights(
    medInfo: MedicationClassInfo,
    doseData: DoseData,
    medication: MedicationContext,
    state: SubjectiveState,
    insights: PostDoseInsight[]
): void {
    const timeOfDay = getTimeOfDay(doseData.time);

    // Dica de horário
    if (medInfo.timeGuidance.avoid.includes(timeOfDay)) {
        insights.push({
            icon: 'clock',
            title: `Horário não ideal para ${medication.name}`,
            description: medInfo.timeGuidance.reason,
            priority: 'warning',
        });
    } else if (medInfo.timeGuidance.ideal.includes(timeOfDay)) {
        insights.push({
            icon: 'clock',
            title: 'Horário adequado',
            description: `Bom horário para ${medication.name}. ${medInfo.timeGuidance.reason}`,
            priority: 'success',
        });
    }

    // Dica de alimentação
    if (medInfo.foodInteraction === 'com_alimento') {
        insights.push({
            icon: 'food',
            title: 'Tomar com alimento',
            description: medInfo.foodNote,
            priority: 'info',
        });
    } else if (medInfo.foodInteraction === 'sem_alimento') {
        insights.push({
            icon: 'food',
            title: 'Tomar sem alimento',
            description: medInfo.foodNote,
            priority: 'info',
        });
    }

    // Dicas gerais do medicamento (máx 2)
    const relevantTips = medInfo.generalTips.slice(0, 2);
    for (const tip of relevantTips) {
        insights.push(tip);
    }

    // Dica de monitoramento (1 aleatória)
    if (medInfo.monitoringTips.length > 0) {
        const randomTip = medInfo.monitoringTips[Math.floor(Math.random() * medInfo.monitoringTips.length)];
        insights.push({
            icon: 'activity',
            title: 'O que observar agora',
            description: randomTip,
            priority: 'info',
        });
    }
}

// ── Insights cruzando estado subjetivo com medicamento ──
function generateStateBasedInsights(
    state: SubjectiveState,
    medication: MedicationContext,
    insights: PostDoseInsight[]
): void {
    const isStimulant = ['Psicoestimulante', 'Estimulante'].some(
        cls => medication.therapeuticClass.toLowerCase().includes(cls.toLowerCase())
    );
    const isBenzo = medication.therapeuticClass.toLowerCase().includes('benzodiazep');
    const isSedating = ['Antipsicótico', 'Benzodiazep'].some(
        cls => medication.therapeuticClass.toLowerCase().includes(cls.toLowerCase())
    );

    // Estimulante + baixa energia = boa resposta esperada
    if (isStimulant && state.energy < 4) {
        insights.push({
            icon: 'activity',
            title: 'Energia baixa pré-dose',
            description: 'Sua energia está baixa. O estimulante deve ajudar nas próximas horas. Hidrate-se bem.',
            priority: 'info',
        });
    }

    // Estimulante + sono ruim = alerta
    if (isStimulant && state.sleep < 5) {
        insights.push({
            icon: 'sleep',
            title: 'Sono ruim + estimulante',
            description: 'Noite de sono ruim pode intensificar efeitos colaterais do estimulante (irritabilidade, taquicardia). Monitore com atenção.',
            priority: 'warning',
        });
    }

    // Sedativo + muita sonolência/baixa energia = cuidado
    if (isSedating && state.energy < 3) {
        insights.push({
            icon: 'alert',
            title: 'Cuidado com sedação',
            description: 'A energia já está muito baixa. A medicação sedativa pode causar sedação excessiva. Evite atividades de risco.',
            priority: 'warning',
        });
    }

    // Humor muito baixo — lembrete humanizado
    if (state.mood <= 2) {
        insights.push({
            icon: 'check',
            title: 'Você não está sozinho',
            description: 'Seu humor está baixo hoje. Se os sintomas persistirem, procure seu médico. Lembre-se: buscar ajuda é um sinal de força.',
            priority: 'info',
        });
    }
}
