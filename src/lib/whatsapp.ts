import { Order, OrderStatus } from '@/types';

export function getWhatsAppMessage(order: Order, status: OrderStatus): string {
  const storeName = "Thita Lanches";
  const baseUrl = window.location.origin;
  const orderUrl = `${baseUrl}/pedido/${order.id}`;

  const messages: Record<string, string> = {
    'pending': `Olá ${order.customer_name}! Recebemos seu pedido na Talita Pinha Bolos e Doces. 🌸\n\nNúmero do Pedido: #${order.id.slice(0, 8)}\nVocê pode acompanhar por aqui: ${orderUrl}`,
    
    'preparing': `Seu pedido #${order.id.slice(0, 8)} já está sendo preparado com todo carinho e doçura! 🧁✨`,
    
    'out_for_delivery': `Notícia deliciosa! Seu pedido #${order.id.slice(0, 8)} ficou pronto e já saiu para entrega! 🚗💨`,
    
    'delivered': `Pedido entregue! Esperamos que cada mordida seja um momento especial. 💖\n\nSe puder, nos marque no Instagram: @talitapinhabolosedoces`,
    
    'cancelled': `Sentimos muito, mas seu pedido #${order.id.slice(0, 8)} teve que ser cancelado. Por favor, entre em contato se tiver dúvidas.`
  };

  return messages[status] || messages['pending'];
}

export function openWhatsApp(order: Order, status: OrderStatus) {
  if (!order.customer_phone) return;
  
  const message = getWhatsAppMessage(order, status);
  const phone = order.customer_phone.replace(/\D/g, '');
  const url = `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`;
  
  window.open(url, '_blank');
}
