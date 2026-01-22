import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { OrderTimeline } from '@/components/orders/OrderTimeline';
import { useOrder } from '@/hooks/useOrders';
import { Order } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, Globe, Store, ShoppingBag } from 'lucide-react';

interface OrderDetailDialogProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderDetailDialog({ order, open, onOpenChange }: OrderDetailDialogProps) {
  const { data: orderDetails, isLoading } = useOrder(order?.id || '');

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Pedido #{order?.id.slice(0, 8)}</span>
            {order && <OrderStatusBadge status={order.status} />}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : orderDetails ? (
          <div className="space-y-6">
            {/* Timeline */}
            <OrderTimeline currentStatus={orderDetails.status} />

            {/* Customer Info */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Cliente</h4>
                <p className="font-medium">{orderDetails.customer_name}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Telefone</h4>
                <p className="font-medium">{orderDetails.customer_phone}</p>
              </div>
              <div className="sm:col-span-2">
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Endereço</h4>
                <p className="font-medium">{orderDetails.customer_address}</p>
              </div>
              {orderDetails.observations && (
                <div className="sm:col-span-2">
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Observações</h4>
                  <p className="font-medium">{orderDetails.observations}</p>
                </div>
              )}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Data do pedido</h4>
                <p className="font-medium">{formatDate(orderDetails.created_at)}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Origem</h4>
                <div className="flex items-center gap-2 font-bold uppercase text-xs">
                  {orderDetails.origin === 'whatsapp' ? (
                    <><MessageSquare className="h-4 w-4 text-[#25D366]" /> WhatsApp</>
                  ) : orderDetails.origin === 'balcao' ? (
                    <><Store className="h-4 w-4 text-blue-500" /> Balcão</>
                  ) : orderDetails.origin === 'ifood' ? (
                    <><ShoppingBag className="h-4 w-4 text-[#ea1d2c]" /> iFood</>
                  ) : (
                    <><Globe className="h-4 w-4 text-amber-500" /> Site</>
                  )}
                </div>
              </div>
            </div>

            {/* Items */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Itens</h4>
              <div className="border rounded-lg divide-y">
                {orderDetails.items?.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{item.quantity}x</span>
                      <span>{item.product?.name || 'Produto'}</span>
                    </div>
                    <span className="font-medium">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between pt-4 border-t">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-2xl font-bold text-primary">
                {formatPrice(orderDetails.total_price)}
              </span>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
