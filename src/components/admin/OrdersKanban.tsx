import { useState } from 'react';
import { 
  Clock, 
  ChefHat, 
  Truck, 
  CheckCircle,
  MessageSquare,
  Globe,
  Store,
  ShoppingBag,
  CreditCard,
  Banknote,
  QrCode,
  AlertCircle,
  Printer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Order, OrderStatus } from '@/types';
import { useUpdateOrderStatus } from '@/hooks/useOrders';
import { OrderDetailDialog } from './OrderDetailDialog';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

interface OrdersKanbanProps {
  orders: Order[];
}

const COLUMNS: { status: OrderStatus; label: string; icon: React.ElementType; color: string }[] = [
  { status: 'pending', label: 'Recebidos', icon: Clock, color: 'text-amber-500 bg-amber-500/10' },
  { status: 'preparing', label: 'Em Preparo', icon: ChefHat, color: 'text-blue-500 bg-blue-500/10' },
  { status: 'out_for_delivery', label: 'Prontos / Entrega', icon: Truck, color: 'text-purple-500 bg-purple-500/10' },
  { status: 'delivered', label: 'Finalizados', icon: CheckCircle, color: 'text-green-500 bg-green-500/10' },
];

export function OrdersKanban({ orders }: OrdersKanbanProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const updateStatus = useUpdateOrderStatus();

  const getOrdersByStatus = (status: OrderStatus) => {
    return orders
      .filter(order => order.status === status)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  };

  const handlePrint = (order: Order) => {
    toast.info(`Imprimindo pedido #${order.id.slice(0, 4)}...`);
    // Future thermal printing
  };

  const handleNextStatus = (order: Order) => {
    const statusMap: Record<string, OrderStatus> = {
      'pending': 'preparing',
      'preparing': 'out_for_delivery',
      'out_for_delivery': 'delivered'
    };
    
    const nextStatus = statusMap[order.status];
    if (nextStatus) {
      updateStatus.mutate({ order, status: nextStatus });
    }
  };

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      <div className="flex gap-4 p-4 overflow-x-auto h-full min-h-[600px] scrollbar-thin scrollbar-thumb-muted">
        {COLUMNS.map((column) => {
          const columnOrders = getOrdersByStatus(column.status);
          
          return (
            <div key={column.status} className="flex-shrink-0 w-80 flex flex-col bg-muted/30 rounded-lg border border-border">
              <div className={`flex items-center justify-between p-3 border-b ${column.color} rounded-t-lg sticky top-0 z-10`}>
                <div className="flex items-center gap-2">
                  <column.icon className="h-5 w-5" />
                  <h3 className="font-bold uppercase tracking-wider text-sm">{column.label}</h3>
                  <span className="bg-background/50 px-2 py-0.5 rounded text-xs font-black ml-1">
                    {columnOrders.length}
                  </span>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {columnOrders.map((order) => {
                  const minutes = Math.floor((new Date().getTime() - new Date(order.created_at).getTime()) / 60000);
                  const isDelayed = (order.status === 'pending' && minutes > 15) || (order.status === 'preparing' && minutes > 30);

                  return (
                    <Card 
                      key={order.id} 
                      className={`cursor-pointer hover:border-primary transition-all shadow-sm group relative overflow-hidden ${isDelayed ? 'border-destructive/50 bg-destructive/5' : ''}`}
                      onClick={() => setSelectedOrder(order)}
                    >
                      {isDelayed && (
                        <div className="absolute top-0 left-0 w-full h-1 bg-destructive animate-pulse" />
                      )}
                      
                      <CardHeader className="p-3 pb-0">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] text-muted-foreground bg-muted p-1 rounded">#{order.id.slice(0, 4)}</span>
                            <div className={`flex items-center gap-1 font-mono text-xs font-bold ${isDelayed ? 'text-destructive' : 'text-muted-foreground'}`}>
                              <Clock className="h-3 w-3" />
                              {minutes}m
                            </div>
                          </div>
                          
                          {/* Origin & Print */}
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePrint(order);
                              }}
                            >
                              <Printer className="h-3.5 w-3.5" />
                            </Button>
                            {order.origin === 'whatsapp' ? (
                              <MessageSquare className="h-4 w-4 text-[#25D366] fill-none" />
                            ) : order.origin === 'balcao' ? (
                              <Store className="h-4 w-4 text-blue-500" />
                            ) : order.origin === 'ifood' ? (
                              <ShoppingBag className="h-4 w-4 text-[#ea1d2c]" />
                            ) : (
                              <Globe className="h-4 w-4 text-amber-500" />
                            )}
                          </div>
                        </div>
                        <CardTitle className="text-sm font-black uppercase truncate">{order.customer_name}</CardTitle>
                      </CardHeader>
                      
                      <CardContent className="p-3 pt-2 space-y-2">
                        {/* Summary of items if available (would need OrderWithItems) */}
                        <div className="flex justify-between items-center pt-2 border-t mt-2">
                          <span className="text-sm font-bold">{formatCurrency(order.total_price)}</span>
                          <div className="flex items-center gap-1 text-[10px] font-black uppercase text-muted-foreground whitespace-nowrap">
                            {order.payment_method === 'cartao' && <CreditCard className="h-3 w-3" />}
                            {order.payment_method === 'dinheiro' && <Banknote className="h-3 w-3" />}
                            {order.payment_method === 'pix' && <QrCode className="h-3 w-3" />}
                            {order.payment_method || '---'}
                          </div>
                        </div>

                        {/* Action Button */}
                        {column.status !== 'delivered' && (
                          <Button 
                            className="w-full h-10 mt-2 bg-primary hover:bg-primary/90 text-white font-bold text-[10px] uppercase tracking-widest gap-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNextStatus(order);
                            }}
                          >
                            {column.status === 'pending' && <><ChefHat className="h-4 w-4" /> COMEÇAR PREPARO</>}
                            {column.status === 'preparing' && <><Truck className="h-4 w-4" /> FINALIZAR / ENVIAR</>}
                            {column.status === 'out_for_delivery' && <><CheckCircle className="h-4 w-4" /> CONCLUIR</>}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <OrderDetailDialog
        order={selectedOrder}
        open={!!selectedOrder}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
      />
    </div>
  );
}

