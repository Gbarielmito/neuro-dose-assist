import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { toast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("AuthProvider initialized");
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed:", user ? "User logged in" : "No user");
      setUser(user);
      setLoading(false);
    }, (error) => {
      console.error("Auth state change error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta.",
      });
    } catch (error: any) {
      const errorMessage =
        error.code === "auth/user-not-found"
          ? "Usuário não encontrado."
          : error.code === "auth/wrong-password"
            ? "Senha incorreta."
            : error.code === "auth/invalid-email"
              ? "Email inválido."
              : "Erro ao fazer login. Tente novamente.";
      toast({
        title: "Erro ao fazer login",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      toast({
        title: "Conta criada com sucesso!",
        description: "Bem-vindo ao Neuro Dose Assist.",
      });
    } catch (error: any) {
      const errorMessage =
        error.code === "auth/email-already-in-use"
          ? "Este email já está em uso."
          : error.code === "auth/weak-password"
            ? "A senha deve ter pelo menos 6 caracteres."
            : error.code === "auth/invalid-email"
              ? "Email inválido."
              : "Erro ao criar conta. Tente novamente.";
      toast({
        title: "Erro ao criar conta",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta.",
      });
    } catch (error: any) {
      console.error("Erro no login com Google:", error);
      let errorMessage = "Erro ao fazer login com Google. Tente novamente.";

      if (error.code === "auth/popup-closed-by-user") {
        errorMessage = "Login cancelado.";
      } else if (error.code === "auth/popup-blocked") {
        errorMessage = "Popup bloqueado pelo navegador. Por favor, permita popups para este site.";
      } else if (error.code === "auth/unauthorized-domain") {
        const currentDomain = window.location.hostname;
        errorMessage = `Domínio não autorizado: ${currentDomain}. Adicione este domínio em Firebase Console > Authentication > Settings > Authorized domains.`;
      } else if (error.code === "auth/operation-not-allowed") {
        errorMessage = "Login com Google não está habilitado. Verifique as configurações do Firebase.";
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Erro de rede. Verifique sua conexão com a internet.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Erro ao fazer login",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao fazer logout",
        description: "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!user || !user.email) {
      throw new Error("Usuário não autenticado");
    }

    try {
      // Reautenticar o usuário
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Atualizar a senha
      await updatePassword(user, newPassword);

      toast({
        title: "Senha atualizada com sucesso!",
        description: "Sua senha foi alterada.",
      });
    } catch (error: any) {
      const errorMessage =
        error.code === "auth/wrong-password"
          ? "Senha atual incorreta."
          : error.code === "auth/weak-password"
            ? "A nova senha deve ter pelo menos 6 caracteres."
            : error.code === "auth/requires-recent-login"
              ? "Por segurança, faça login novamente antes de alterar a senha."
              : "Erro ao atualizar senha. Tente novamente.";
      toast({
        title: "Erro ao atualizar senha",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, signIn, signUp, signInWithGoogle, logout, updatePassword: changePassword }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
