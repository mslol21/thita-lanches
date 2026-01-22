import { db, auth } from '@/integrations/firebase/config';
import { 
  collection, 
  getDocs, 
  getDoc,
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where,
  orderBy,
  writeBatch,
  serverTimestamp 
} from "firebase/firestore";
import { CartItem, Order, OrderStatus, OrderWithItems, OrderItem } from '@/types';

export const orderService = {
  async getOrders(): Promise<Order[]> {
    const ordersCol = collection(db, "orders");
    const q = query(ordersCol, orderBy("created_at", "desc"));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      created_at: doc.data().created_at?.toDate()?.toISOString(),
      updated_at: doc.data().updated_at?.toDate()?.toISOString(),
    } as Order));
  },

  async getOrderById(id: string): Promise<OrderWithItems> {
    const docRef = doc(db, "orders", id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) throw new Error("Pedido não encontrado");
    
    const orderData = docSnap.data();
    
    // Get items
    const itemsCol = collection(db, "order_items");
    const q = query(itemsCol, where("order_id", "==", id));
    const itemsSnapshot = await getDocs(q);
    
    const items = itemsSnapshot.docs.map(itemDoc => ({
      id: itemDoc.id,
      ...itemDoc.data()
    } as OrderItem));

    return {
      id: docSnap.id,
      ...orderData,
      created_at: orderData.created_at?.toDate()?.toISOString(),
      updated_at: orderData.updated_at?.toDate()?.toISOString(),
      items
    } as OrderWithItems;
  },

  async createOrder(data: {
    customer_name: string;
    customer_phone: string;
    customer_address: string;
    observations?: string;
    items: CartItem[];
    origin?: 'whatsapp' | 'site' | 'balcao' | 'ifood';
    payment_method?: 'cartao' | 'dinheiro' | 'pix';
  }): Promise<Order> {
    const batch = writeBatch(db);
    
    // Calculate total on frontend (Note: In production, use Cloud Functions for security)
    const totalPrice = data.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    
    const orderRef = doc(collection(db, "orders"));
    const orderData = {
      customer_name: data.customer_name,
      customer_phone: data.customer_phone,
      customer_address: data.customer_address,
      observations: data.observations || null,
      total_price: totalPrice,
      status: 'pending' as OrderStatus,
      origin: data.origin || 'site',
      payment_method: data.payment_method || 'cartao',
      user_id: auth.currentUser?.uid || null,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    };
    
    batch.set(orderRef, orderData);
    
    // Add items
    data.items.forEach(item => {
      const itemRef = doc(collection(db, "order_items"));
      batch.set(itemRef, {
        order_id: orderRef.id,
        product_id: item.product.id,
        product: {
          name: item.product.name,
          price: item.product.price
        },
        quantity: item.quantity,
        price: item.product.price,
        created_at: serverTimestamp()
      });
    });
    
    await batch.commit();
    
    return {
      id: orderRef.id,
      ...orderData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as unknown as Order;
  },

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const docRef = doc(db, "orders", id);
    await updateDoc(docRef, {
      status,
      updated_at: serverTimestamp()
    });
    
    const updatedSnap = await getDoc(docRef);
    return { id, ...updatedSnap.data() } as Order;
  }
};
