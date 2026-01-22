import { 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  User,
  signInWithEmailAndPassword
} from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { auth, googleProvider, db } from "@/integrations/firebase/config";

export const authService = {
  async signInWithGoogle() {
    try {
      console.log("Iniciando Login Google...");
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Login Google bem-sucedido:", result.user.email);
      return result;
    } catch (error) {
      console.error("Erro detalhado no Google Auth:", error);
      throw error;
    }
  },


  async signInWithEmail(email: string, pass: string) {
    return await signInWithEmailAndPassword(auth, email, pass);
  },

  async signOut() {
    return await firebaseSignOut(auth);
  },

  async checkAdminRole(userId: string): Promise<boolean> {
    const docRef = doc(db, "user_roles", userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data().role === 'admin';
    }
    return false;
  },

  onAuthStateChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  },

  onAdminRoleChange(userId: string, callback: (isAdmin: boolean) => void) {
    const docRef = doc(db, "user_roles", userId);
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data().role === 'admin');
      } else {
        callback(false);
      }
    });
  }
};
