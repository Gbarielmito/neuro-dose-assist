/**
 * Base de Conhecimento de Medicamentos Neuropsiquiátricos
 * 
 * Contém informações clínicas por classe terapêutica e princípio ativo
 * para geração de dicas contextuais pós-dose.
 */

export interface MedicationTip {
    icon: 'clock' | 'food' | 'alert' | 'sleep' | 'activity' | 'check' | 'droplet';
    title: string;
    description: string;
    priority: 'info' | 'warning' | 'success';
}

export interface TimeOfDayGuidance {
    ideal: string[]; // ex.: ['manha'] — horários ideais
    avoid: string[]; // ex.: ['noite'] — horários a evitar
    reason: string;
}

export interface MedicationClassInfo {
    className: string;
    aliases: string[];
    generalTips: MedicationTip[];
    timeGuidance: TimeOfDayGuidance;
    foodInteraction: 'com_alimento' | 'sem_alimento' | 'indiferente';
    foodNote: string;
    onsetTime: string; // tempo para início de ação
    commonSideEffects: string[];
    precautions: string[];
    monitoringTips: string[]; // o que observar nas próximas horas
}

// "manha" = 05:00–11:59, "tarde" = 12:00–17:59, "noite" = 18:00–04:59
export function getTimeOfDay(time: string): 'manha' | 'tarde' | 'noite' {
    const [h] = time.split(':').map(Number);
    if (h >= 5 && h < 12) return 'manha';
    if (h >= 12 && h < 18) return 'tarde';
    return 'noite';
}

export const MEDICATION_KNOWLEDGE: MedicationClassInfo[] = [
    // ─── ISRS ────────────────────────────────────────────────
    {
        className: 'Antidepressivo ISRS',
        aliases: ['ISRS', 'Sertralina', 'Fluoxetina', 'Paroxetina', 'Escitalopram', 'Citalopram'],
        generalTips: [
            {
                icon: 'check',
                title: 'Efeito progressivo',
                description: 'Os ISRS levam de 2 a 4 semanas para atingir efeito terapêutico pleno. Não interrompa sem orientação médica.',
                priority: 'info',
            },
            {
                icon: 'alert',
                title: 'Primeiras semanas',
                description: 'Nas primeiras semanas pode haver aumento temporário de ansiedade. É esperado e tende a melhorar.',
                priority: 'warning',
            },
        ],
        timeGuidance: {
            ideal: ['manha'],
            avoid: [],
            reason: 'A maioria dos ISRS é melhor tolerada pela manhã para evitar insônia.',
        },
        foodInteraction: 'indiferente',
        foodNote: 'Pode ser tomado com ou sem alimento. Se causar náusea, prefira com alimento leve.',
        onsetTime: '30–60 minutos (absorção), 2–4 semanas (efeito terapêutico)',
        commonSideEffects: ['Náusea', 'Cefaleia', 'Insônia ou sonolência', 'Disfunção sexual', 'Boca seca'],
        precautions: ['Evitar álcool', 'Não interromper abruptamente', 'Monitorar ideação suicida em jovens'],
        monitoringTips: [
            'Observe se há náusea nas próximas 2 horas',
            'Registre qualidade do sono esta noite',
            'Anote qualquer mudança de humor nas próximas horas',
        ],
    },

    // ─── IRSN ────────────────────────────────────────────────
    {
        className: 'Antidepressivo IRSN',
        aliases: ['IRSN', 'Venlafaxina', 'Duloxetina', 'Desvenlafaxina'],
        generalTips: [
            {
                icon: 'check',
                title: 'Dupla ação',
                description: 'IRSNs atuam em serotonina e noradrenalina. Efeito pleno em 2–6 semanas.',
                priority: 'info',
            },
            {
                icon: 'alert',
                title: 'Pressão arterial',
                description: 'IRSNs podem elevar levemente a pressão arterial. Monitore periodicamente.',
                priority: 'warning',
            },
        ],
        timeGuidance: {
            ideal: ['manha'],
            avoid: ['noite'],
            reason: 'Efeito noradrenérgico pode causar insônia se tomado à noite.',
        },
        foodInteraction: 'com_alimento',
        foodNote: 'Tomar com alimento para melhorar absorção e reduzir náusea.',
        onsetTime: '30–60 minutos (absorção), 2–6 semanas (efeito terapêutico)',
        commonSideEffects: ['Náusea', 'Cefaleia', 'Tontura', 'Sudorese', 'Aumento da PA'],
        precautions: ['Não interromper abruptamente (risco de síndrome de descontinuação)', 'Monitorar PA regularmente'],
        monitoringTips: [
            'Observe se há tontura nas próximas horas',
            'Monitore se há sudorese excessiva',
            'Verifique pressão arterial se possível',
        ],
    },

    // ─── PSICOESTIMULANTES ──────────────────────────────────
    {
        className: 'Psicoestimulante',
        aliases: ['Estimulante', 'Metilfenidato', 'Anfetamina', 'Lisdexanfetamina', 'Ritalina', 'Venvanse', 'Concerta'],
        generalTips: [
            {
                icon: 'activity',
                title: 'Pico de ação',
                description: 'Efeito esperado em 30–60 min (liberação imediata) ou 1–2h (liberação prolongada). Duração de 4–12h.',
                priority: 'info',
            },
            {
                icon: 'food',
                title: 'Alimentação',
                description: 'Tome após o café da manhã para reduzir irritação gástrica e evitar supressão do apetite.',
                priority: 'info',
            },
        ],
        timeGuidance: {
            ideal: ['manha'],
            avoid: ['noite', 'tarde'],
            reason: 'Estimulantes devem ser tomados pela manhã para evitar insônia. Evitar após 14h para formulações de liberação imediata.',
        },
        foodInteraction: 'com_alimento',
        foodNote: 'Tomar com ou após o café da manhã. Alimentos ácidos podem reduzir a absorção.',
        onsetTime: '30–60 min (liberação imediata), 1–2h (liberação prolongada)',
        commonSideEffects: ['Redução do apetite', 'Insônia', 'Taquicardia', 'Boca seca', 'Irritabilidade'],
        precautions: ['Medir frequência cardíaca se possível', 'Manter hidratação', 'Não usar com cafeína em excesso'],
        monitoringTips: [
            'Observe início do efeito nos próximos 30–60 minutos',
            'Lembre-se de almoçar mesmo sem fome',
            'Registre se houve tremor ou taquicardia',
            'Observe qualidade do sono hoje à noite',
        ],
    },

    // ─── BENZODIAZEPÍNICOS ──────────────────────────────────
    {
        className: 'Benzodiazepínico',
        aliases: ['Benzo', 'Diazepam', 'Clonazepam', 'Alprazolam', 'Lorazepam', 'Rivotril'],
        generalTips: [
            {
                icon: 'alert',
                title: 'Dependência',
                description: 'Benzodiazepínicos podem causar dependência. Use pelo menor tempo possível conforme orientação médica.',
                priority: 'warning',
            },
            {
                icon: 'sleep',
                title: 'Sedação',
                description: 'Efeito sedativo inicia em 15–30 minutos. Evite dirigir ou operar máquinas.',
                priority: 'warning',
            },
        ],
        timeGuidance: {
            ideal: ['noite'],
            avoid: [],
            reason: 'Se indicado para ansiedade, pode ser usado de dia. Se para insônia, usar 30 min antes de deitar.',
        },
        foodInteraction: 'indiferente',
        foodNote: 'Pode ser tomado com ou sem alimento. Evitar com álcool.',
        onsetTime: '15–30 minutos',
        commonSideEffects: ['Sonolência', 'Tontura', 'Confusão (em idosos)', 'Amnésia', 'Relaxamento muscular'],
        precautions: ['NÃO consumir álcool', 'Não dirigir após tomar', 'Risco de queda em idosos'],
        monitoringTips: [
            'Evite atividades que exijam atenção plena na próxima hora',
            'Se sentir tontura excessiva, deite-se',
            'Avalie nível de sedação nos próximos 30 minutos',
        ],
    },

    // ─── ANTIPSICÓTICOS ATÍPICOS ────────────────────────────
    {
        className: 'Antipsicótico Atípico',
        aliases: ['Antipsicótico', 'Risperidona', 'Quetiapina', 'Olanzapina', 'Aripiprazol', 'Clozapina'],
        generalTips: [
            {
                icon: 'check',
                title: 'Uso contínuo',
                description: 'Antipsicóticos devem ser tomados continuamente. Não pare sem orientação médica.',
                priority: 'info',
            },
            {
                icon: 'alert',
                title: 'Metabolismo',
                description: 'Podem causar ganho de peso e alterações metabólicas. Monitore peso e glicemia.',
                priority: 'warning',
            },
        ],
        timeGuidance: {
            ideal: ['noite'],
            avoid: [],
            reason: 'A maioria causa sedação e é melhor tolerada à noite. Aripiprazol pode ser matinal por ser mais ativador.',
        },
        foodInteraction: 'com_alimento',
        foodNote: 'Tomar com alimento para melhorar tolerabilidade gástrica.',
        onsetTime: '30–60 minutos (efeito sedativo), 1–2 semanas (efeito antipsicótico)',
        commonSideEffects: ['Sonolência', 'Ganho de peso', 'Rigidez muscular', 'Boca seca', 'Hipotensão ortostática'],
        precautions: ['Levantar-se devagar para evitar tontura', 'Monitorar peso semanalmente', 'Monitorar glicemia'],
        monitoringTips: [
            'Observe se há sonolência excessiva na próxima hora',
            'Levante-se devagar para evitar tontura',
            'Registre qualquer rigidez muscular ou tremor',
        ],
    },

    // ─── ESTABILIZADORES DE HUMOR ───────────────────────────
    {
        className: 'Estabilizador de Humor',
        aliases: ['Estabilizador', 'Lítio', 'Carbonato de Lítio', 'Ácido Valproico', 'Carbamazepina', 'Lamotrigina'],
        generalTips: [
            {
                icon: 'droplet',
                title: 'Hidratação',
                description: 'Mantenha boa hidratação, especialmente com lítio. Desidratação pode causar toxicidade.',
                priority: 'warning',
            },
            {
                icon: 'check',
                title: 'Exames regulares',
                description: 'Necessário monitorar níveis séricos periodicamente (lítio, valproato).',
                priority: 'info',
            },
        ],
        timeGuidance: {
            ideal: ['noite'],
            avoid: [],
            reason: 'A maioria é melhor tolerada à noite. Lítio pode ser dividido em 2 doses diárias.',
        },
        foodInteraction: 'com_alimento',
        foodNote: 'Tomar com alimento para reduzir efeitos gastrointestinais.',
        onsetTime: '1–2 horas (absorção), 1–2 semanas (efeito estabilizador)',
        commonSideEffects: ['Tremor fino', 'Náusea', 'Ganho de peso', 'Poliúria (lítio)', 'Sedação'],
        precautions: ['Manter hidratação adequada', 'Evitar AINEs com lítio', 'Monitorar função renal e tireoide (lítio)'],
        monitoringTips: [
            'Beba pelo menos 2L de água hoje',
            'Observe se há tremor nas mãos nas próximas horas',
            'Registre se houve náusea ou diarreia',
        ],
    },

    // ─── IMAO ───────────────────────────────────────────────
    {
        className: 'IMAO',
        aliases: ['Inibidor da MAO', 'Fenelzina', 'Tranilcipromina', 'Selegilina'],
        generalTips: [
            {
                icon: 'food',
                title: 'Dieta restrita',
                description: 'EVITE alimentos ricos em tiramina: queijos envelhecidos, embutidos, vinho tinto, cerveja. Risco de crise hipertensiva.',
                priority: 'warning',
            },
            {
                icon: 'alert',
                title: 'Interações graves',
                description: 'IMAOs possuem interações graves com muitos medicamentos. Informe sempre que usar qualquer outro remédio.',
                priority: 'warning',
            },
        ],
        timeGuidance: {
            ideal: ['manha'],
            avoid: ['noite'],
            reason: 'Efeito ativador. Tomar pela manhã para evitar insônia.',
        },
        foodInteraction: 'sem_alimento',
        foodNote: 'Tomar com estômago vazio, 30 min antes das refeições. Seguir dieta restrita em tiramina rigorosamente.',
        onsetTime: '2–4 semanas (efeito terapêutico pleno)',
        commonSideEffects: ['Hipotensão ortostática', 'Insônia', 'Ganho de peso', 'Boca seca'],
        precautions: ['Dieta restrita em tiramina', 'Não combinar com ISRS, IRSN, estimulantes', 'Portar cartão de alerta IMAO'],
        monitoringTips: [
            'Verifique o que vai comer hoje — evite tiramina',
            'Observe se há cefaleia intensa (pode indicar crise hipertensiva)',
            'Levante-se devagar para evitar tontura',
        ],
    },
];

/**
 * Busca informações do medicamento pela classe terapêutica ou nome
 */
export function findMedicationInfo(
    therapeuticClass: string,
    activeIngredient?: string,
    medicationName?: string
): MedicationClassInfo | null {
    const searchTerms = [therapeuticClass, activeIngredient, medicationName].filter(Boolean) as string[];

    for (const info of MEDICATION_KNOWLEDGE) {
        // Comparação direta com nome da classe
        if (info.className.toLowerCase() === therapeuticClass.toLowerCase()) {
            return info;
        }

        // Busca por aliases
        for (const term of searchTerms) {
            const normalizedTerm = term.toLowerCase().trim();
            if (info.aliases.some(alias => alias.toLowerCase() === normalizedTerm)) {
                return info;
            }
        }
    }

    return null;
}
