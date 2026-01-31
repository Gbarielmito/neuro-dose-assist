import { ref, push, set, get, remove } from "firebase/database";
import { realtimeDb } from "./firebase";
import { logActivity } from "./activityLog";

export interface Medication {
  id?: string;
  name: string;
  brandName: string;
  activeIngredient: string;
  therapeuticClass: string;
  form: string;
  minDose: number;
  maxDose: number;
  unit: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

// Função auxiliar para remover campos undefined (Realtime Database não aceita undefined)
function removeUndefinedFields(obj: any): any {
  const cleaned: any = {};
  for (const key in obj) {
    if (obj[key] !== undefined) {
      cleaned[key] = obj[key];
    }
  }
  return cleaned;
}

// Salvar medicamento no Realtime Database
export async function saveMedication(
  medication: Medication,
  userId: string,
  userInfo?: { name?: string; email?: string }
): Promise<string> {
  try {
    if (medication.id) {
      // Atualizar medicamento existente
      const medicationRef = ref(realtimeDb, `users/${userId}/medications/${medication.id}`);
      const updateData = removeUndefinedFields({
        name: medication.name,
        brandName: medication.brandName,
        activeIngredient: medication.activeIngredient,
        therapeuticClass: medication.therapeuticClass,
        form: medication.form,
        minDose: medication.minDose,
        maxDose: medication.maxDose,
        unit: medication.unit,
        updatedAt: new Date().toISOString(),
      });
      await set(medicationRef, updateData);

      // Registrar atividade de atualização
      await logActivity({
        action: 'update',
        entityType: 'medication',
        entityId: medication.id,
        entityName: medication.name,
        userId,
        userName: userInfo?.name,
        userEmail: userInfo?.email,
      });

      return medication.id;
    } else {
      // Criar novo medicamento
      const medicationsRef = ref(realtimeDb, `users/${userId}/medications`);
      const newMedicationRef = push(medicationsRef);

      const medicationData = removeUndefinedFields({
        name: medication.name,
        brandName: medication.brandName,
        activeIngredient: medication.activeIngredient,
        therapeuticClass: medication.therapeuticClass,
        form: medication.form,
        minDose: medication.minDose,
        maxDose: medication.maxDose,
        unit: medication.unit,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: userId,
      });

      await set(newMedicationRef, medicationData);
      const newId = newMedicationRef.key || "";

      // Registrar atividade de criação
      await logActivity({
        action: 'create',
        entityType: 'medication',
        entityId: newId,
        entityName: medication.name,
        userId,
        userName: userInfo?.name,
        userEmail: userInfo?.email,
      });

      return newId;
    }
  } catch (error: any) {
    console.error("Erro ao salvar medicamento:", error);

    // Melhorar mensagem de erro
    const errorCode = error?.code || "";
    const errorMessage = error?.message || "";

    if (errorCode.includes("permission") || errorMessage.includes("permission")) {
      throw new Error("Permissão negada. Verifique as regras do Realtime Database no Firebase Console.");
    }

    if (errorCode.includes("database") || errorMessage.includes("database")) {
      throw new Error("Realtime Database não está configurado. Configure no Firebase Console.");
    }

    throw error;
  }
}

// Buscar todos os medicamentos do usuário
export async function getMedications(userId: string): Promise<Medication[]> {
  try {
    const medicationsRef = ref(realtimeDb, `users/${userId}/medications`);
    const snapshot = await get(medicationsRef);

    if (snapshot.exists()) {
      const medicationsData = snapshot.val();
      return Object.keys(medicationsData).map((key) => ({
        id: key,
        ...medicationsData[key],
      })) as Medication[];
    }

    // Não há medicamentos ainda - isso é normal, não é um erro
    return [];
  } catch (error: any) {
    // Verificar se é um erro de permissão ou configuração
    const errorCode = error?.code || "";
    const errorMessage = error?.message || "";

    // Se for erro de permissão ou database não configurado, retornar array vazio silenciosamente
    if (
      errorCode.includes("permission") ||
      errorCode.includes("PERMISSION") ||
      errorMessage.includes("permission") ||
      errorCode.includes("database") ||
      errorMessage.includes("database")
    ) {
      console.warn("Realtime Database não configurado ou sem permissões. Retornando lista vazia.");
      return [];
    }

    // Para outros erros, logar e lançar
    console.error("Erro ao buscar medicamentos:", error);
    throw error;
  }
}

// Buscar medicamento por ID
export async function getMedicationById(
  medicationId: string,
  userId: string
): Promise<Medication | null> {
  try {
    const medicationRef = ref(realtimeDb, `users/${userId}/medications/${medicationId}`);
    const snapshot = await get(medicationRef);

    if (snapshot.exists()) {
      return {
        id: medicationId,
        ...snapshot.val(),
      } as Medication;
    }

    return null;
  } catch (error) {
    console.error("Erro ao buscar medicamento:", error);
    throw error;
  }
}

// Atualizar medicamento
export async function updateMedication(
  medicationId: string,
  medication: Partial<Medication>,
  userId: string
): Promise<void> {
  try {
    const medicationRef = ref(realtimeDb, `users/${userId}/medications/${medicationId}`);

    const updateData = removeUndefinedFields({
      ...medication,
      updatedAt: new Date().toISOString(),
    });

    await set(medicationRef, updateData);
  } catch (error) {
    console.error("Erro ao atualizar medicamento:", error);
    throw error;
  }
}

// Deletar medicamento
export async function deleteMedication(
  medicationId: string,
  userId: string,
  medicationName?: string,
  userInfo?: { name?: string; email?: string }
): Promise<void> {
  try {
    const medicationRef = ref(realtimeDb, `users/${userId}/medications/${medicationId}`);
    await remove(medicationRef);

    // Registrar atividade de exclusão
    await logActivity({
      action: 'delete',
      entityType: 'medication',
      entityId: medicationId,
      entityName: medicationName || 'Medicamento',
      userId,
      userName: userInfo?.name,
      userEmail: userInfo?.email,
    });
  } catch (error) {
    console.error("Erro ao deletar medicamento:", error);
    throw error;
  }
}
