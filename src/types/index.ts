export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  icon: string | null;
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

export type OrderStatus = 'pending_payment' | 'pending' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address?: string | null;
  neighborhood_id?: string;
  neighborhood_name?: string;
  delivery_fee: number;
  observations: string | null;
  status: OrderStatus;
  total_price: number;
  created_at: string;
  updated_at: string;
  user_id: string | null;
  origin: 'site' | 'balcao';
  payment_method: 'pix' | 'dinheiro' | 'cartao';
  payment_status: 'pending' | 'paid';
  delivery_method: 'entrega' | 'retirada';
  change_amount?: number | null; // Para pagamentos em dinheiro
  scheduled_time?: string | null; // Para retiradas agendadas
  estimated_time?: number; // Tempo calculado em minutos
}

export interface Neighborhood {
  id: string;
  name: string;
  distance_km: number;
  delivery_fee: number;
  active: boolean;
}

export interface SystemSettings {
  min_production_time: number; // em minutos
  max_delivery_km: number;
  pix_key: string;
  is_open: boolean;
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
  pending_payment: 'Aguardando Pagamento',
  pending: 'Novo Pedido',
  preparing: 'Em Produção',
  ready: 'Pronto / Aguardando Entrega',
  out_for_delivery: 'Saiu para Entrega',
  delivered: 'Finalizado',
  cancelled: 'Cancelado',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending_payment: 'bg-yellow-500',
  pending: 'bg-blue-500',
  preparing: 'bg-orange-500',
  ready: 'bg-green-500',
  out_for_delivery: 'bg-purple-500',
  delivered: 'bg-gray-500',
  cancelled: 'bg-red-500',
};
