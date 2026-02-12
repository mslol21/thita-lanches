import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '@/services/order.service';
import { Order, OrderStatus, CartItem } from '@/types';
import { toast } from 'sonner';
import { openWhatsApp } from '@/lib/whatsapp';

interface CreateOrderData {
  customer_name: string;
  customer_phone: string;
  customer_address?: string;
  scheduled_time?: string;
  delivery_method?: 'entrega' | 'retirada';
  observations?: string;
  items: CartItem[];
  origin?: 'whatsapp' | 'site' | 'balcao' | 'ifood';
  payment_method?: 'cartao' | 'dinheiro' | 'pix';
}

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: () => orderService.getOrders(),
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => orderService.getOrderById(id),
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateOrderData) => orderService.createOrder(data),
    onSuccess: (newOrder) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Pedido realizado com sucesso!');
      
      // Auto WhatsApp for new site orders
      if (newOrder && (newOrder.origin === 'site' || newOrder.origin === 'whatsapp') && newOrder.customer_phone) {
        openWhatsApp(newOrder, 'pending');
      }
    },
    onError: (error: any) => {
      toast.error('Erro ao realizar pedido: ' + error.message);
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ order, status }: { order: Order; status: OrderStatus }) => 
      orderService.updateStatus(order.id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Status atualizado com sucesso!');
      
      // Auto WhatsApp Apenas quando estiver Pronto ou Saiu para Entrega
      if (variables.order.customer_phone && 
         (variables.order.origin === 'site' || variables.order.origin === 'whatsapp') &&
         (variables.status === 'ready' || variables.status === 'out_for_delivery')) {
        openWhatsApp(variables.order, variables.status);
      }
    },
    onError: (error: any) => {
      toast.error('Erro ao atualizar status: ' + error.message);
    },
  });
}

export function useDeleteAllOrders() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => orderService.deleteAllOrders(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Histórico de pedidos apagado com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao apagar pedidos: ' + error.message);
    },
  });
}

