import { supabase } from "@/integrations/supabase/client";
import { CartItem, Order, OrderStatus, OrderWithItems, OrderItem } from '@/types';

export const orderService = {
  async getOrders(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Order[];
  },

  async getOrderById(id: string): Promise<OrderWithItems> {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();
    
    if (orderError) throw orderError;
    
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*, product:products(*)')
      .eq('order_id', id);
    
    if (itemsError) throw itemsError;

    return {
      ...order,
      items: items as any[]
    } as OrderWithItems;
  },

  async createOrder(data: {
    customer_name: string;
    customer_phone: string;
    customer_address?: string;
    scheduled_time?: string;
    delivery_method?: 'entrega' | 'retirada';
    observations?: string;
    items: CartItem[];
    origin?: 'whatsapp' | 'site' | 'balcao' | 'ifood';
    payment_method?: 'cartao' | 'dinheiro' | 'pix';
  }): Promise<Order> {
    const totalPrice = data.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    
    // 1. Create Order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        customer_name: data.customer_name,
        customer_phone: data.customer_phone,
        customer_address: data.customer_address || null,
        scheduled_time: data.scheduled_time || null,
        delivery_method: data.delivery_method || 'retirada',
        observations: data.observations || null,
        total_price: totalPrice,
        status: 'pending',
        origin: data.origin || 'site',
        payment_method: data.payment_method || 'cartao',
        payment_status: 'pending'
      }])
      .select()
      .single();

    if (orderError) throw orderError;

    // 2. Create Order Items
    const orderItems = data.items.map(item => ({
      order_id: order.id,
      product_id: item.product.id,
      quantity: item.quantity,
      price: item.product.price
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;
    
    return order as Order;
  },

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .update({ status: status as any, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .maybeSingle();
    
    if (error) throw error;
    if (!data) throw new Error("Não foi possível atualizar o pedido. Verifique suas permissões.");
    return data as Order;
  },

  async deleteAllOrders(): Promise<void> {
    const { error } = await supabase
      .from('orders')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (error) throw error;
  }
};
