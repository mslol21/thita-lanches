import { db } from '@/integrations/firebase/config';
import { 
  collection, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  serverTimestamp 
} from "firebase/firestore";
import { Category } from '@/types';

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    const categoriesCol = collection(db, "categories");
    const q = query(categoriesCol, orderBy("name"));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      created_at: doc.data().created_at?.toDate()?.toISOString() || new Date().toISOString(),
    } as Category));
  },

  async createCategory(name: string): Promise<Category> {
    const categoriesCol = collection(db, "categories");
    const docRef = await addDoc(categoriesCol, {
      name,
      created_at: serverTimestamp(),
    });

    return {
      id: docRef.id,
      name,
      created_at: new Date().toISOString(),
    };
  },

  async deleteCategory(id: string): Promise<void> {
    const docRef = doc(db, "categories", id);
    await deleteDoc(docRef);
  }
};
