import { useState } from 'react';
import { 
  MoreHorizontal, 
  Eye, 
  Clock, 
  ChefHat, 
  Truck, 
  CheckCircle,
  MessageSquare,
  Globe,
  Store,
  Play,
  ArrowRight,
  ShoppingBag,
  XCircle,
  CreditCard,
  Banknote,
  QrCode
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { OrderDetailDialog } from './OrderDetailDialog';
import { useUpdateOrderStatus } from '@/hooks/useOrders';
import { Order, OrderStatus } from '@/types';

interface OrdersTableProps {
  orders: Order[];
}

const statusActions: { status: OrderStatus; label: string; icon: React.ElementType }[] = [
  { status: 'pending', label: 'Aguardando', icon: Clock },
  { status: 'preparing', label: 'Em preparo', icon: ChefHat },
  { status: 'out_for_delivery', label: 'Saiu para entrega', icon: Truck },
  { status: 'delivered', label: 'Entregue', icon: CheckCircle },
  { status: 'cancelled', label: 'Cancelado', icon: XCircle },
];

export function OrdersTable({ orders }: OrdersTableProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
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

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Nenhum pedido encontrado
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[80px]">Tempo</TableHead>
              <TableHead className="w-[60px] text-center">Origem</TableHead>
              <TableHead>Cliente / Pedido</TableHead>
              <TableHead className="hidden sm:table-cell">Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...orders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((order) => {
              const minutes = Math.floor((new Date().getTime() - new Date(order.created_at).getTime()) / 60000);
              const isDelayed = (order.status === 'pending' && minutes > 15) || (order.status === 'preparing' && minutes > 30);
              
              return (
                <TableRow key={order.id} className={isDelayed ? "bg-destructive/5" : ""}>
                  <TableCell>
                    <div className={`flex items-center gap-1 font-mono font-bold ${minutes > 20 && order.status !== 'delivered' ? 'text-destructive animate-pulse' : ''}`}>
                      <Clock className="h-3 w-3" />
                      {minutes}m
                    </div>
                  </TableCell>
                  <TableCell>
                    <div title={order.origin || 'site'} className="flex justify-center">
                      {order.origin === 'whatsapp' ? (
                        <div className="bg-[#25D366]/10 text-[#25D366] p-2 rounded-full border border-[#25D366]/20 shadow-sm" title="WhatsApp">
                          <MessageSquare className="h-5 w-5 fill-current" />
                        </div>
                      ) : order.origin === 'balcao' ? (
                        <div className="bg-blue-500/10 text-blue-500 p-2 rounded-full border border-blue-500/20 shadow-sm" title="Balcão / Local">
                          <Store className="h-5 w-5 fill-current" />
                        </div>
                      ) : order.origin === 'ifood' ? (
                        <div className="bg-[#ea1d2c]/10 text-[#ea1d2c] p-2 rounded-full border border-[#ea1d2c]/20 shadow-sm" title="iFood">
                          <ShoppingBag className="h-5 w-5 fill-current" />
                        </div>
                      ) : (
                        <div className="bg-amber-500/10 text-amber-500 p-2 rounded-full border border-amber-500/20 shadow-sm" title="Site">
                          <Globe className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <p className="font-bold text-base leading-none mb-1">{order.customer_name}</p>
                      <div className="flex items-center gap-3">
                        <p className="text-xs text-muted-foreground font-mono">#{order.id.slice(0, 8)}</p>
                        {order.customer_phone && (
                          <a 
                            href={`https://wa.me/55${order.customer_phone.replace(/\D/g, '')}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-[#25D366] hover:text-[#128C7E] flex items-center gap-1 text-[10px] font-black uppercase tracking-wider"
                          >
                            <MessageSquare className="h-3 w-3 fill-current" />
                            Conversar
                          </a>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <OrderStatusBadge status={order.status} size="sm" />
                  </TableCell>
                  <TableCell className="font-bold text-right text-xs sm:text-sm whitespace-nowrap">
                    <div className="flex flex-col items-end">
                      <span>{formatPrice(order.total_price)}</span>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase font-black mt-0.5">
                        {order.payment_method === 'cartao' && <><CreditCard className="h-3 w-3" /> Cartão</>}
                        {order.payment_method === 'dinheiro' && <><Banknote className="h-3 w-3" /> Dinheiro</>}
                        {order.payment_method === 'pix' && <><QrCode className="h-3 w-3" /> PIX</>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1 sm:gap-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => setSelectedOrder(order)}
                        className="h-8 w-8 sm:h-9 sm:w-9"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      {order.status === 'pending' && (
                        <Button 
                          size="sm" 
                          className="h-8 sm:h-9 bg-primary hover:bg-primary/90 text-white gap-1 px-2 sm:px-4 text-[10px] sm:text-xs font-bold"
                          onClick={() => updateStatus.mutate({ id: order.id, status: 'preparing' })}
                        >
                          <Play className="h-3 w-3 fill-current hidden xs:block" />
                          PREPARAR
                        </Button>
                      )}

                      {order.status === 'preparing' && (
                        <Button 
                          size="sm" 
                          className="h-8 sm:h-9 bg-blue-600 hover:bg-blue-700 text-white gap-1 px-2 sm:px-4 text-[10px] sm:text-xs font-bold"
                          onClick={() => updateStatus.mutate({ id: order.id, status: 'out_for_delivery' })}
                        >
                          <Truck className="h-3 w-3 hidden xs:block" />
                          ENVIAR
                        </Button>
                      )}

                      {order.status === 'out_for_delivery' && (
                        <Button 
                          size="sm" 
                          className="h-8 sm:h-9 bg-green-600 hover:bg-green-700 text-white gap-1 px-2 sm:px-4 text-[10px] sm:text-xs font-bold"
                          onClick={() => updateStatus.mutate({ id: order.id, status: 'delivered' })}
                        >
                          <CheckCircle className="h-3 w-3 hidden xs:block" />
                          CONCLUIR
                        </Button>
                      )}

                      {order.status !== 'delivered' && order.status !== 'cancelled' && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          title="Cancelar Pedido"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            if (window.confirm('Tem certeza que deseja cancelar este pedido?')) {
                              updateStatus.mutate({ id: order.id, status: 'cancelled' });
                            }
                          }}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <OrderDetailDialog
        order={selectedOrder}
        open={!!selectedOrder}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
      />
    </>
  );
}
