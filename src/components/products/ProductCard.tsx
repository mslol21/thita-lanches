import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Product } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { getProductIcon } from '@/lib/product-icons';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
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
      onClick={handleAddToCart}
    >
      <div className="flex items-center p-3 sm:p-5 gap-3 sm:gap-4">
        {/* Product Image */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-muted flex-shrink-0 border border-muted/50">
          {product.image_url ? (
            <img 
              src={product.image_url} 
              alt={product.name} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : product.icon ? (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 transition-colors">
              {(() => {
                const IconComponent = getProductIcon(product.icon);
                return IconComponent ? (
                  <IconComponent className="h-10 w-10 sm:h-12 sm:w-12 text-primary group-hover:scale-110 transition-transform" />
                ) : (
                  <div className="text-3xl">🍰</div>
                );
              })()}
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl">
              🍰
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-0.5 sm:space-y-1">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-bold text-base sm:text-lg text-foreground tracking-tight group-hover:text-primary transition-colors truncate">
              {product.name}
            </h3>
          </div>
          {product.description && (
            <p className="text-muted-foreground text-xs sm:text-sm font-medium line-clamp-2 leading-snug">
              {product.description}
            </p>
          )}
          <div className="flex items-center justify-between pt-1">
            <span className="font-black text-base sm:text-lg text-primary">
              {formatPrice(product.price)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
