import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Product } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product);
    toast.success(`${product.name} adicionado!`, {
      icon: '🍔',
      className: 'font-bold'
    });
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  return (
    <Card 
      className="group overflow-hidden border border-muted/50 rounded-2xl hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 bg-white cursor-pointer active:scale-[0.98]"
      onClick={() => {/* To be used for opening details modal */}}
    >
      <div className="flex items-center justify-between p-5 gap-4">
        <div className="flex-1 space-y-1">
          <h3 className="font-bold text-lg text-foreground tracking-tight group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-muted-foreground text-sm font-medium line-clamp-2 leading-snug pr-4">
              {product.description}
            </p>
          )}
          <div className="pt-1">
            <span className="font-black text-lg text-primary">
              {formatPrice(product.price)}
            </span>
          </div>
        </div>

        <button 
          onClick={handleAddToCart}
          className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm active:scale-90 flex-shrink-0"
        >
          <Plus className="h-6 w-6 stroke-[3]" />
        </button>
      </div>
    </Card>
  );
}
