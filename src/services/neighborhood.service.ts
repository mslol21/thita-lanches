import { db } from '@/integrations/firebase/config';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  serverTimestamp 
} from "firebase/firestore";
import { Neighborhood } from '@/types';

export const neighborhoodService = {
  async getNeighborhoods(): Promise<Neighborhood[]> {
    const col = collection(db, "neighborhoods");
    const q = query(col, orderBy("name"));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Neighborhood));
  },

  async createNeighborhood(neighborhood: Omit<Neighborhood, 'id'>): Promise<Neighborhood> {
    const col = collection(db, "neighborhoods");
    const docRef = await addDoc(col, {
      ...neighborhood,
      created_at: serverTimestamp()
    });

    return {
      id: docRef.id,
      ...neighborhood
    };
  },

  async updateNeighborhood(id: string, neighborhood: Partial<Neighborhood>): Promise<void> {
    const docRef = doc(db, "neighborhoods", id);
    await updateDoc(docRef, {
      ...neighborhood,
      updated_at: serverTimestamp()
    });
  },

  async deleteNeighborhood(id: string): Promise<void> {
    const docRef = doc(db, "neighborhoods", id);
    await deleteDoc(docRef);
  }
};
