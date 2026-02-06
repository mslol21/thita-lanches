import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CartItem } from '@/components/cart/CartItem';
import { useCart } from '@/contexts/CartContext';
import { Separator } from '@/components/ui/separator';

export default function CartPage() {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">
            Seu carrinho está vazio
          </h1>
          <p className="text-muted-foreground mb-8">
            Adicione algumas delícias do nosso cardápio!
          </p>
          <Button asChild>
            <Link to="/">Ver Cardápio</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Seu Carrinho
          </h1>
        </div>

        {/* Cart Items */}
        <div className="bg-card rounded-lg border border-border p-4 mb-6">
          {items.map((item) => (
            <CartItem key={item.product.id} item={item} />
          ))}
        </div>

        {/* Summary */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">{formatPrice(totalPrice)}</span>
          </div>
          <Separator className="my-4" />
          <div className="flex items-center justify-between mb-6">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-2xl font-bold text-primary">{formatPrice(totalPrice)}</span>
          </div>
          
          <div className="flex flex-col gap-3">
            <Button 
              size="lg" 
              className="w-full"
              onClick={() => navigate('/checkout')}
            >
              Finalizar Pedido
            </Button>
            <Button 
              variant="outline" 
              onClick={clearCart}
            >
              Limpar Carrinho
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
