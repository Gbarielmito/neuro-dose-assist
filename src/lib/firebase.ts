import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";

// Configuração do Firebase
// IMPORTANTE: Substitua estas variáveis pelas suas credenciais do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAuZz_kd2y1nePipjOiwCHCpX3G4UCwZmY",
    authDomain: "neurodose-40e5e.firebaseapp.com",
    projectId: "neurodose-40e5e",
    storageBucket: "neurodose-40e5e.firebasestorage.app",
    messagingSenderId: "979759766920",
    appId: "1:979759766920:web:922b3761ef9361c890ae3d",
    measurementId: "G-WMNGEWWLW0"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);


// Inicializar Auth
export const auth = getAuth(app);

// Provider do Google com configurações adicionais
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});
// Adicionar escopos se necessário
googleProvider.addScope("profile");
googleProvider.addScope("email");

// Inicializar Firestore
export const db = getFirestore(app);

// Inicializar Storage
export const storage = getStorage(app);

// Inicializar Realtime Database
// Se você tiver uma URL específica do Realtime Database, adicione databaseURL na configuração acima
// Exemplo: databaseURL: "https://neurodose-40e5e-default-rtdb.firebaseio.com"
export const realtimeDb = getDatabase(app);

export default app;
