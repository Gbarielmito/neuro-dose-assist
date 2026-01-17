import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  serverTimestamp 
} from "firebase/firestore";
import { db } from "./firebase";
import { User } from "firebase/auth";

// Tipos para as configurações
export interface UserProfile {
  fullName?: string;
  email?: string;
  specialty?: string;
  crm?: string;
  phone?: string;
  language?: string;
  photoURL?: string;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  alerts: boolean;
  recommendations: boolean;
  reports: boolean;
}

export interface AISettings {
  autoAnalysis: boolean;
  riskAlerts: boolean;
  recommendations: boolean;
  confidence: "low" | "medium" | "high";
}

export interface UserSettings {
  profile: UserProfile;
  notifications: NotificationSettings;
  ai: AISettings;
  updatedAt?: any;
}

// Função para obter o documento de configurações do usuário
export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);
    
    if (userDocSnap.exists()) {
      return userDocSnap.data() as UserSettings;
    }
    
    // Documento não existe - isso é normal para novos usuários, não é um erro
    return null;
  } catch (error: any) {
    // Verificar se é um erro de permissão (Firestore não configurado ou sem permissões)
    const errorCode = error?.code || "";
    
    // Se for erro de permissão, retornar null silenciosamente (usar valores padrão)
    if (errorCode.includes("permission") || errorCode.includes("PERMISSION")) {
      console.warn("Firestore não configurado ou sem permissões. Usando valores padrão.");
      return null;
    }
    
    // Para outros erros, logar e lançar
    console.error("Erro ao carregar configurações:", error);
    throw error;
  }
}

// Função para salvar/atualizar configurações do usuário
export async function saveUserSettings(
  userId: string, 
  settings: Partial<UserSettings>
): Promise<void> {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);
    
    if (userDocSnap.exists()) {
      // Atualizar documento existente
      await updateDoc(userDocRef, {
        ...settings,
        updatedAt: serverTimestamp(),
      });
    } else {
      // Criar novo documento
      await setDoc(userDocRef, {
        ...settings,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error("Erro ao salvar configurações:", error);
    throw error;
  }
}

// Função para atualizar apenas o perfil
export async function updateUserProfile(
  userId: string,
  profile: Partial<UserProfile>
): Promise<void> {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);
    
    if (userDocSnap.exists()) {
      await updateDoc(userDocRef, {
        profile: profile,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(userDocRef, {
        profile: profile,
        notifications: {
          email: true,
          push: true,
          alerts: true,
          recommendations: true,
          reports: false,
        },
        ai: {
          autoAnalysis: true,
          riskAlerts: true,
          recommendations: true,
          confidence: "high",
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    throw error;
  }
}

// Função para atualizar apenas notificações
export async function updateNotificationSettings(
  userId: string,
  notifications: NotificationSettings
): Promise<void> {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);
    
    if (userDocSnap.exists()) {
      await updateDoc(userDocRef, {
        notifications: notifications,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(userDocRef, {
        profile: {},
        notifications: notifications,
        ai: {
          autoAnalysis: true,
          riskAlerts: true,
          recommendations: true,
          confidence: "high",
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error("Erro ao atualizar notificações:", error);
    throw error;
  }
}

// Função para atualizar apenas configurações de IA
export async function updateAISettings(
  userId: string,
  ai: AISettings
): Promise<void> {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);
    
    if (userDocSnap.exists()) {
      await updateDoc(userDocRef, {
        ai: ai,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(userDocRef, {
        profile: {},
        notifications: {
          email: true,
          push: true,
          alerts: true,
          recommendations: true,
          reports: false,
        },
        ai: ai,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error("Erro ao atualizar configurações de IA:", error);
    throw error;
  }
}
