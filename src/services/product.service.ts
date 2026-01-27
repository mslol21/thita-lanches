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
  Timestamp,
  writeBatch,
  serverTimestamp 
} from "firebase/firestore";
import { Product } from '@/types';

export const productService = {
  async getProducts(): Promise<Product[]> {
    const productsCol = collection(db, "products");
    const q = query(productsCol, orderBy("name"));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        created_at: data.created_at?.toDate()?.toISOString() || new Date().toISOString(),
        updated_at: data.updated_at?.toDate()?.toISOString() || new Date().toISOString(),
      } as Product;
    });
  },

  async createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    const productsCol = collection(db, "products");
    const docRef = await addDoc(productsCol, {
      ...product,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    });

    return {
      id: docRef.id,
      ...product,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as Product;
  },

  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    const docRef = doc(db, "products", id);
    await updateDoc(docRef, {
      ...product,
      updated_at: serverTimestamp()
    });

    return { id, ...product } as Product;
  },

  async deleteProduct(id: string): Promise<void> {
    const docRef = doc(db, "products", id);
    await deleteDoc(docRef);
  },

  async deleteAllProducts(): Promise<void> {
    const productsCol = collection(db, "products");
    const snapshot = await getDocs(productsCol);
    const batch = writeBatch(db);
    
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  }
};
