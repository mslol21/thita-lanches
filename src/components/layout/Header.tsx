import { Link } from 'react-router-dom';
import { ShoppingCart, Menu, X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { useState } from 'react';

export function Header() {
  const { totalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3">
            <img src="/logo.png" alt="Thita Lanches Logo" className="h-8 sm:h-10 w-auto" />
            <span className="font-display font-bold text-lg sm:text-xl text-foreground uppercase tracking-tighter">
              THITA<span className="text-primary italic">Lanches</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              to="/" 
              className="text-foreground/80 hover:text-primary transition-colors font-medium"
            >
              Cardápio
            </Link>
            <Link 
              to="/admin/login" 
              className="text-foreground/60 hover:text-foreground/80 transition-colors text-sm flex items-center gap-1"
            >
              <User className="h-4 w-4" />
              Admin
            </Link>
          </nav>

          {/* Cart Button */}
          <div className="flex items-center gap-4">
            <Link to="/carrinho">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <Badge 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-primary text-primary-foreground"
                  >
                    {totalItems}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-slide-in-up">
            <nav className="flex flex-col gap-4">
              <Link 
                to="/" 
                className="text-foreground/80 hover:text-primary transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Cardápio
              </Link>
              <Link 
                to="/admin/login" 
                className="text-foreground/60 hover:text-foreground/80 transition-colors text-sm flex items-center gap-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                <User className="h-4 w-4" />
                Área do Administrador
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
