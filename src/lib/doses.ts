import { ref, push, set, get, remove, query, orderByChild } from "firebase/database";
import { realtimeDb } from "./firebase";
import { AnalysisResult, SubjectiveState } from "@/services/aiService";

export interface DoseRecord {
    id?: string;
    patientId: string;
    medicationId: string;
    doseAmount: string; // Stored as string to keep original input "20"
    time: string;
    indication: string;
    subjectiveState: SubjectiveState;
    analysis: AnalysisResult;
    timestamp: string;
    createdAt: string;
}

// Salvar nova dose
export async function saveDose(dose: DoseRecord, userId: string): Promise<string> {
    try {
        const dosesRef = ref(realtimeDb, `users/${userId}/doses`);
        const newDoseRef = push(dosesRef);

        const doseData = {
            ...dose,
            id: newDoseRef.key,
            createdAt: new Date().toISOString(),
        };

        await set(newDoseRef, doseData);
        return newDoseRef.key || "";
    } catch (error) {
        console.error("Erro ao salvar dose:", error);
        throw error;
    }
}

// Buscar todas as doses
export async function getDoses(userId: string): Promise<DoseRecord[]> {
    try {
        const dosesRef = ref(realtimeDb, `users/${userId}/doses`);
        // Basic query, could be optimized with filtering
        const snapshot = await get(dosesRef);

        if (snapshot.exists()) {
            const dosesData = snapshot.val();
            // Convert Object map to Array and sort by timestamp desc (newest first)
            return Object.values(dosesData).sort((a: any, b: any) => {
                return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
            }) as DoseRecord[];
        }
        return [];
    } catch (error) {
        console.error("Erro ao buscar doses:", error);
        throw error;
    }
}

// Deletar dose (opcional, para admin ou correção)
export async function deleteDose(doseId: string, userId: string): Promise<void> {
    try {
        const doseRef = ref(realtimeDb, `users/${userId}/doses/${doseId}`);
        await remove(doseRef);
    } catch (error) {
        console.error("Erro ao deletar dose:", error);
        throw error;
    }
}
