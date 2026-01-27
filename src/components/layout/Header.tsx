import { Link } from 'react-router-dom';
import { ShoppingCart, User, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';

export function Header() {
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-primary/10 backdrop-blur-md border-b border-primary/20 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Status */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <span className="font-display font-black text-xl text-primary uppercase tracking-tighter">
                TALITA PINHA<span className="text-accent italic ml-1">Bolos & Doces</span>
              </span>
            </Link>
            
            <div className="flex items-center gap-1.5 ml-2 px-2.5 py-1 bg-green-500/10 rounded-full border border-green-500/20">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase text-green-600 tracking-wider">Aberto</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link 
              to="/admin/login" 
              className="text-muted-foreground hover:text-foreground transition-colors p-2"
              title="Área do Administrador"
            >
              <User className="h-5 w-5" />
            </Link>
            
            <Link to="/carrinho" className="relative ml-2">
              <Button variant="default" className="h-10 px-4 rounded-full font-bold gap-2">
                <ShoppingCart className="h-4 w-4" />
                {totalItems > 0 && (
                  <span className="bg-white text-primary rounded-full h-5 min-w-5 flex items-center justify-center text-[10px] px-1">
                    {totalItems}
                  </span>
                )}
                <span className="hidden sm:inline">Carrinho</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

