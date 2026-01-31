import { ref, push, set, get, remove, update } from "firebase/database";
// import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { realtimeDb } from "./firebase";
import { logActivity } from "./activityLog";

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

// Helper para converter imagem para Base64 com redimensionamento simples
async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        // Redimensionar para max 300px
        const maxSize = 300;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height *= maxSize / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // Converter para JPEG com qualidade 0.7
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = event.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Salvar paciente no Realtime Database
export async function savePatient(
  patient: Patient,
  userId: string,
  userInfo?: { name?: string; email?: string }
): Promise<string> {
  try {
    if (patient.id) {
      // Atualizar paciente existente
      const patientRef = ref(realtimeDb, `users/${userId}/patients/${patient.id}`);
      const updateData = removeUndefinedFields({
        name: patient.name,
        age: patient.age,
        gender: patient.gender,
        condition: patient.condition,
        clinicalHistory: patient.clinicalHistory,
        allergies: patient.allergies,
        currentMedications: patient.currentMedications,
        // photoURL não é atualizado aqui se for local_cache, apenas mantemos a referência
        updatedAt: new Date().toISOString(),
      });

      // Se houver photoURL, atualize-o
      if (patient.photoURL) {
        updateData.photoURL = patient.photoURL;
      }

      await update(patientRef, updateData);

      // Registrar atividade de atualização
      await logActivity({
        action: 'update',
        entityType: 'patient',
        entityId: patient.id,
        entityName: patient.name,
        userId,
        userName: userInfo?.name,
        userEmail: userInfo?.email,
      });

      return patient.id;
    } else {
      // Criar novo paciente
      const patientsRef = ref(realtimeDb, `users/${userId}/patients`);
      const newPatientRef = push(patientsRef);

      const patientData = removeUndefinedFields({
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
      });

      await set(newPatientRef, patientData);
      const newId = newPatientRef.key || "";

      // Registrar atividade de criação
      await logActivity({
        action: 'create',
        entityType: 'patient',
        entityId: newId,
        entityName: patient.name,
        userId,
        userName: userInfo?.name,
        userEmail: userInfo?.email,
      });

      return newId;
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

// Upload de foto do paciente (versão LOCALSTORAGE)
export async function uploadPatientPhoto(
  file: File,
  userId: string,
  patientId: string
): Promise<string> {
  try {
    console.log("Processando imagem para LocalStorage...");
    const base64Image = await compressImage(file);

    // Salvar no LocalStorage
    const storageKey = `p_img_${patientId}`;
    try {
      localStorage.setItem(storageKey, base64Image);
      console.log("Imagem salva no LocalStorage:", storageKey);
    } catch (e) {
      console.error("Storage cheio ou erro:", e);
      throw new Error("Limite de armazenamento local excedido. Tente uma imagem menor.");
    }

    // Retornar um marcador 'local_cache' para salvar no DB
    return "local_cache";
  } catch (error) {
    console.error("Erro ao salvar foto localmente:", error);
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
      const patients = Object.keys(patientsData).map((key) => {
        const p = { id: key, ...patientsData[key] };

        // Hidratar imagem do LocalStorage se necessário
        if (p.photoURL === "local_cache") {
          const cachedImg = localStorage.getItem(`p_img_${key}`);
          if (cachedImg) {
            p.photoURL = cachedImg;
          } else {
            p.photoURL = null; // Imagem não encontrada localmente
          }
        }
        return p;
      }) as Patient[];
      return patients;
    }

    return [];
  } catch (error: any) {
    console.warn("Erro ao buscar pacientes:", error);
    return [];
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
      const p = { id: patientId, ...snapshot.val() } as Patient;

      // Hidratar imagem
      if (p.photoURL === "local_cache") {
        const cachedImg = localStorage.getItem(`p_img_${patientId}`);
        if (cachedImg) p.photoURL = cachedImg;
      }
      return p;
    }

    return null;
  } catch (error) {
    console.error("Erro ao buscar paciente:", error);
    throw error;
  }
}

// Deletar paciente
export async function deletePatient(
  patientId: string,
  userId: string,
  patientName?: string,
  userInfo?: { name?: string; email?: string }
): Promise<void> {
  try {
    const patientRef = ref(realtimeDb, `users/${userId}/patients/${patientId}`);
    await remove(patientRef);

    // Remover do LocalStorage
    localStorage.removeItem(`p_img_${patientId}`);

    // Registrar atividade de exclusão
    await logActivity({
      action: 'delete',
      entityType: 'patient',
      entityId: patientId,
      entityName: patientName || 'Paciente',
      userId,
      userName: userInfo?.name,
      userEmail: userInfo?.email,
    });
    console.log("Removido do LocalStorage:", `p_img_${patientId}`);

  } catch (error) {
    console.error("Erro ao deletar paciente:", error);
    throw error;
  }
}
