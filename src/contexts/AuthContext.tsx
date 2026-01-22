import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { authService } from '@/services/auth.service';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let roleUnsubscribe: () => void = () => {};

    const authUnsubscribe = authService.onAuthStateChange(async (firebaseUser) => {
      setUser(firebaseUser);
      
      // Limpar listener anterior se houver
      roleUnsubscribe();

      if (firebaseUser) {
        // Inicia listener em tempo real para o papel de admin
        roleUnsubscribe = authService.onAdminRoleChange(firebaseUser.uid, (adminStatus) => {
          setIsAdmin(adminStatus);
          setIsLoading(false);
        });
      } else {
        setIsAdmin(false);
        setIsLoading(false);
      }
    });

    return () => {
      authUnsubscribe();
      roleUnsubscribe();
    };
  }, []);

  const loginWithGoogle = async () => {
    await authService.signInWithGoogle();
  };

  const loginWithEmail = async (email: string, pass: string) => {
    await authService.signInWithEmail(email, pass);
  };

  const logout = async () => {
    await authService.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        isLoading,
        loginWithGoogle,
        loginWithEmail,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
