import { ref, push, set, get, remove } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { realtimeDb, storage } from "./firebase";

export interface Patient {
  id?: string;
  name: string;
  age: number;
  gender: "Masculino" | "Feminino" | "Outro";
  condition: string;
  clinicalHistory?: string;
  allergies?: string;
  currentMedications?: string;
  photoURL?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

// Salvar paciente no Realtime Database
export async function savePatient(patient: Patient, userId: string): Promise<string> {
  try {
    if (patient.id) {
      // Atualizar paciente existente
      const patientRef = ref(realtimeDb, `users/${userId}/patients/${patient.id}`);
      const updateData = {
        name: patient.name,
        age: patient.age,
        gender: patient.gender,
        condition: patient.condition,
        clinicalHistory: patient.clinicalHistory,
        allergies: patient.allergies,
        currentMedications: patient.currentMedications,
        photoURL: patient.photoURL,
        updatedAt: new Date().toISOString(),
      };
      await set(patientRef, updateData);
      return patient.id;
    } else {
      // Criar novo paciente
      const patientsRef = ref(realtimeDb, `users/${userId}/patients`);
      const newPatientRef = push(patientsRef);
      
      const patientData = {
        name: patient.name,
        age: patient.age,
        gender: patient.gender,
        condition: patient.condition,
        clinicalHistory: patient.clinicalHistory,
        allergies: patient.allergies,
        currentMedications: patient.currentMedications,
        photoURL: patient.photoURL,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: userId,
      };

      await set(newPatientRef, patientData);
      return newPatientRef.key || "";
    }
  } catch (error: any) {
    console.error("Erro ao salvar paciente:", error);
    
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

// Upload de foto do paciente
export async function uploadPatientPhoto(
  file: File,
  userId: string,
  patientId: string
): Promise<string> {
  try {
    // Criar referência no Storage
    const photoRef = storageRef(storage, `users/${userId}/patients/${patientId}/photo`);
    
    // Upload do arquivo
    await uploadBytes(photoRef, file);
    
    // Obter URL de download
    const downloadURL = await getDownloadURL(photoRef);
    return downloadURL;
  } catch (error) {
    console.error("Erro ao fazer upload da foto:", error);
    throw error;
  }
}

// Atualizar paciente
export async function updatePatient(
  patientId: string,
  patient: Partial<Patient>,
  userId: string
): Promise<void> {
  try {
    const patientRef = ref(realtimeDb, `users/${userId}/patients/${patientId}`);
    
    const updateData = {
      ...patient,
      updatedAt: new Date().toISOString(),
    };

    await set(patientRef, updateData);
  } catch (error) {
    console.error("Erro ao atualizar paciente:", error);
    throw error;
  }
}

// Buscar todos os pacientes do usuário
export async function getPatients(userId: string): Promise<Patient[]> {
  try {
    const patientsRef = ref(realtimeDb, `users/${userId}/patients`);
    const snapshot = await get(patientsRef);

    if (snapshot.exists()) {
      const patientsData = snapshot.val();
      return Object.keys(patientsData).map((key) => ({
        id: key,
        ...patientsData[key],
      })) as Patient[];
    }

    // Não há pacientes ainda - isso é normal, não é um erro
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
    console.error("Erro ao buscar pacientes:", error);
    throw error;
  }
}

// Buscar paciente por ID
export async function getPatientById(
  patientId: string,
  userId: string
): Promise<Patient | null> {
  try {
    const patientRef = ref(realtimeDb, `users/${userId}/patients/${patientId}`);
    const snapshot = await get(patientRef);

    if (snapshot.exists()) {
      return {
        id: patientId,
        ...snapshot.val(),
      } as Patient;
    }

    return null;
  } catch (error) {
    console.error("Erro ao buscar paciente:", error);
    throw error;
  }
}

// Deletar paciente
export async function deletePatient(patientId: string, userId: string): Promise<void> {
  try {
    const patientRef = ref(realtimeDb, `users/${userId}/patients/${patientId}`);
    await remove(patientRef);

    // Deletar foto se existir
    try {
      const photoRef = storageRef(storage, `users/${userId}/patients/${patientId}/photo`);
      await deleteObject(photoRef);
    } catch (error) {
      // Foto pode não existir, não é um erro crítico
      console.warn("Foto não encontrada para deletar:", error);
    }
  } catch (error) {
    console.error("Erro ao deletar paciente:", error);
    throw error;
  }
}
