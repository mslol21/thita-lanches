import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { useOrder, useUpdateOrderStatus } from '@/hooks/useOrders';
import { Order } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, Globe, Store, ShoppingBag, MapPin, Phone, Clock, FileText, Printer, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface OrderDetailDialogProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderDetailDialog({ order, open, onOpenChange }: OrderDetailDialogProps) {
  const { data: orderDetails, isLoading } = useOrder(order?.id || '');
  const updateStatus = useUpdateOrderStatus();

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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handlePrint = () => {
    toast.info("Iniciando impressão...");
  };

  const handleCancelOrder = () => {
    if (orderDetails && confirm('Tem certeza que deseja cancelar este pedido?')) {
      updateStatus.mutate({ 
        order: orderDetails as Order, 
        status: 'cancelled' 
      }, {
        onSuccess: () => {
          onOpenChange(false);
        }
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[95vh] overflow-y-auto p-0 border-none shadow-2xl">
        {isLoading ? (
          <div className="p-8 space-y-4">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : orderDetails ? (
          <div className="flex flex-col">
            {/* Header / Banner */}
            <div className="bg-primary p-6 text-primary-foreground">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest opacity-80">Pedido Realizado em {formatDate(orderDetails.created_at)}</h3>
                  <DialogTitle className="text-3xl font-black mt-1">#{orderDetails.id.slice(0, 8).toUpperCase()}</DialogTitle>
                </div>
                <OrderStatusBadge status={orderDetails.status} className="bg-white text-primary border-none" />
              </div>
              
              <div className="flex flex-wrap gap-4 mt-6">
                <div className="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-sm">
                  {orderDetails.origin === 'whatsapp' ? (
                    <><MessageSquare className="h-4 w-4" /> <span className="text-[10px] font-black uppercase">WhatsApp</span></>
                  ) : orderDetails.origin === 'balcao' ? (
                    <><Store className="h-4 w-4" /> <span className="text-[10px] font-black uppercase">Balcão / Local</span></>
                  ) : orderDetails.origin === 'ifood' ? (
                    <><ShoppingBag className="h-4 w-4" /> <span className="text-[10px] font-black uppercase">iFood</span></>
                  ) : (
                    <><Globe className="h-4 w-4" /> <span className="text-[10px] font-black uppercase">Site</span></>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 space-y-8">
              {/* Customer & Delivery */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-muted rounded-lg shrink-0">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Cliente</h4>
                      <p className="font-bold text-lg">{orderDetails.customer_name}</p>
                    </div>
                  </div>
                  
                  {orderDetails.customer_phone && (
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-muted rounded-lg shrink-0">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <h4 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Contato</h4>
                        <p className="font-bold">{orderDetails.customer_phone}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-muted rounded-lg shrink-0">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Destino / Local</h4>
                      <p className="font-bold">{orderDetails.customer_address}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b pb-2">Conteúdo do Pedido</h4>
                <div className="space-y-2">
                  {orderDetails.items?.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-3 px-4 bg-muted/30 rounded-xl">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center justify-center h-8 w-8 bg-black text-white rounded-full text-xs font-black">{item.quantity}</span>
                        <span className="font-bold uppercase text-sm">{item.product?.name || 'Produto'}</span>
                      </div>
                      <span className="font-black text-sm">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="bg-muted px-6 py-4 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Total Líquido</p>
                  <p className="text-4xl font-black text-primary leading-none mt-1">{formatPrice(orderDetails.total_price)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={handlePrint} className="gap-2 font-black uppercase text-[10px] tracking-widest h-12 px-6 shadow-lg shadow-primary/20">
                    <Printer className="h-4 w-4" />
                    Imprimir Ticket
                  </Button>
                  {orderDetails.status !== 'delivered' && orderDetails.status !== 'cancelled' && (
                    <Button 
                      variant="outline" 
                      onClick={handleCancelOrder} 
                      className="gap-2 font-black uppercase text-[10px] tracking-widest h-12 px-6 border-destructive/20 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                      Cancelar
                    </Button>
                  )}
                </div>
              </div>

              {orderDetails.observations && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-amber-700 mb-1">Observações do Cliente:</h4>
                  <p className="text-sm font-medium text-amber-900">{orderDetails.observations}</p>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

