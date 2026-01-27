import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Copy, Check, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { OrderTimeline } from '@/components/orders/OrderTimeline';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { useOrder } from '@/hooks/useOrders';
import { useState } from 'react';
import { toast } from 'sonner';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function OrderTrackingPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading, error } = useOrder(id || '');
  const [copied, setCopied] = useState(false);

  const copyOrderId = () => {
    if (id) {
      navigator.clipboard.writeText(id);
      setCopied(true);
      toast.success('Código copiado!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-60 w-full" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">
            Pedido não encontrado
          </h1>
          <p className="text-muted-foreground mb-8">
            Não conseguimos encontrar este pedido. Verifique o código e tente novamente.
          </p>
          <Button asChild>
            <Link to="/">Voltar ao Cardápio</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Acompanhar Pedido
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-muted-foreground">
                Código: {id?.slice(0, 8)}...
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={copyOrderId}
              >
                {copied ? (
                  <Check className="h-3 w-3 text-success" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Status do Pedido</CardTitle>
              <OrderStatusBadge status={order.status} />
            </div>
          </CardHeader>
          <CardContent>
            <OrderTimeline currentStatus={order.status} />
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Detalhes do Pedido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-sm text-muted-foreground">Data do pedido</span>
              <p className="font-medium">{formatDate(order.created_at)}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Nome</span>
              <p className="font-medium">{order.customer_name}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Telefone</span>
              <p className="font-medium">{order.customer_phone}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Endereço de entrega</span>
              <p className="font-medium">{order.customer_address}</p>
            </div>
            {order.observations && (
              <div>
                <span className="text-sm text-muted-foreground">Observações</span>
                <p className="font-medium">{order.observations}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Itens do Pedido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {order.items?.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span className="text-muted-foreground">
                    {item.quantity}x {item.product?.name || 'Produto'}
                  </span>
                  <span className="font-medium">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-border mt-4 pt-4">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(order.total_price)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            className="bg-[#25D366] hover:bg-[#128C7E] text-white gap-2 font-bold px-8"
            onClick={() => {
              const message = `Olá! Acabei de fazer um pedido na Talita Pinha Bolos e Doces!\n\n*Código:* ${order.id.slice(0, 8)}\n*Cliente:* ${order.customer_name}\n*Total:* ${formatCurrency(order.total_price)}\n\n*Status:* ${order.status === 'pending' ? 'Aguardando confirmação' : 'Acompanhando'}\n\nVeja meu pedido aqui: ${window.location.href}`;
              window.open(`https://wa.me/5516997977939?text=${encodeURIComponent(message)}`, '_blank');
            }}
          >
            <MessageSquare className="h-5 w-5 fill-current" />
            Confirmar via WhatsApp
          </Button>
          <Button variant="outline" asChild className="hover:bg-primary/5">
            <Link to="/">Fazer Novo Pedido</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
