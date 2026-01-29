export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string;
  available: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  created_at?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 'pending' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  observations: string | null;
  status: OrderStatus;
  total_price: number;
  created_at: string;
  updated_at: string;
  user_id: string | null;
  origin?: 'whatsapp' | 'site' | 'balcao' | 'ifood';
  payment_method?: 'cartao' | 'dinheiro' | 'pix';
}


export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  created_at: string;
  product?: Product;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pendente',
  preparing: 'Em Preparo',
  out_for_delivery: 'Em Rota',
  delivered: 'Finalizado',
  cancelled: 'Cancelado',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-status-pending',
  preparing: 'bg-status-preparing',
  out_for_delivery: 'bg-status-out-for-delivery',
  delivered: 'bg-status-delivered',
};
