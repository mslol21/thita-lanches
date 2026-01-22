import { Link } from 'react-router-dom';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/products/ProductCard';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/contexts/CartContext';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';
// @ts-ignore
import burgerHero from '@/assets/burger-hero.png';

export default function MenuPage() {
  const { data: products, isLoading, error } = useProducts();
  const { totalItems, totalPrice } = useCart();

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-black py-20 md:py-32">
        {/* Background Image with Cinematic Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/hero-bg.png" 
            alt="Premium Burger" 
            className="w-full h-full object-cover opacity-60 scale-105 animate-in fade-in zoom-in duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 text-center md:text-left">
              <div className="inline-block px-4 py-1.5 bg-primary/20 border border-primary/30 rounded-full mb-6">
                <span className="text-primary text-xs font-bold uppercase tracking-[0.3em]">Qualidade Premium desde 2015</span>
              </div>
              <h1 className="font-display text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-white leading-none uppercase tracking-tighter">
                THITA
                <br />
                <span className="text-primary italic">LANCHES</span>
              </h1>
              <p className="mt-8 text-xl md:text-2xl text-white/70 max-w-md mx-auto md:mx-0 leading-relaxed font-light">
                O legítimo sabor do lanche artesanal grelhado no fogo. 
                <span className="text-white font-medium"> Sinta a diferença.</span>
              </p>
              
              <div className="mt-12 flex flex-col sm:flex-row gap-5 justify-center md:justify-start">
                <Button 
                  size="lg" 
                  className="bg-primary text-white hover:bg-primary/90 text-lg px-10 h-16 rounded-none font-bold uppercase tracking-widest transition-all hover:scale-105"
                  asChild
                >
                  <a href="#cardapio">
                    Ver Cardápio
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                </Button>
                
                {totalItems > 0 && (
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="gap-3 h-16 px-8 rounded-none border-white/20 text-white hover:bg-white/10 backdrop-blur-sm transition-all"
                    asChild
                  >
                    <Link to="/carrinho">
                      <ShoppingCart className="h-5 w-5 text-primary" />
                      Meu Carrinho ({formatCurrency(totalPrice)})
                    </Link>
                  </Button>
                )}
              </div>
            </div>
            <div className="flex-1 max-w-md">
              <img
                src={burgerHero}
                alt="Delicioso hambúrguer"
                className="w-full h-auto animate-float drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section id="cardapio" className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Nosso Cardápio
            </h2>
            <p className="mt-2 text-muted-foreground">
              Escolha seus favoritos e peça agora!
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-square rounded-lg" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <div className="flex justify-between">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-destructive">Erro ao carregar produtos. Tente novamente.</p>
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                Nenhum produto disponível no momento.
              </p>
              <p className="text-muted-foreground mt-2">
                Volte em breve! 🍔
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Floating Cart Button (Mobile) */}
      {totalItems > 0 && (
        <div className="fixed bottom-4 left-4 right-4 md:hidden z-40">
          <Link to="/carrinho">
            <Button className="w-full h-14 text-lg gap-2 shadow-lg">
              <ShoppingCart className="h-5 w-5" />
              Ver Carrinho • {totalItems} {totalItems === 1 ? 'item' : 'itens'} • {formatCurrency(totalPrice)}
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
