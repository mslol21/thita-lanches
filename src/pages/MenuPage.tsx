import { useState, useRef, useEffect } from 'react';
import { ShoppingCart, Plus, ChevronRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/contexts/CartContext';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { Product } from '@/types';
import { ProductCard } from '@/components/products/ProductCard';

export default function MenuPage() {
  const { data: products, isLoading, error } = useProducts();
  const { totalItems, totalPrice } = useCart();
  const [activeCategory, setActiveCategory] = useState<string>('Bolos');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Group products by category
  const categories = products ? Array.from(new Set(products.map(p => p.category || 'Outros'))) : [];
  
  // Sort categories - keeping Bolos first if exists
  const sortedCategories = [...categories].sort((a, b) => {
    if (a === 'Bolos') return -1;
    if (b === 'Bolos') return 1;
    return a.localeCompare(b);
  });

  useEffect(() => {
    if (sortedCategories.length > 0 && !activeCategory) {
      setActiveCategory(sortedCategories[0]);
    }
  }, [sortedCategories, activeCategory]);

  const filteredProducts = products?.filter(p => (p.category || 'Outros') === activeCategory && p.available);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
        <div className="bg-destructive/10 p-6 rounded-2xl mb-4">
          <p className="text-destructive font-bold">Erro ao carregar o cardápio.</p>
        </div>
        <Button onClick={() => window.location.reload()}>Tentar Novamente</Button>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pb-32">
      {/* Header Estilo App */}
      <header className="sticky top-[64px] z-40 bg-background/80 backdrop-blur-md border-b border-primary/5">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-black tracking-tighter">Escolha suas Delícias</h1>
            <div className="flex items-center gap-2 bg-green-50 text-green-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Aberto
            </div>
          </div>

          {/* Categorias Horizontal Scroll */}
          <div 
            ref={scrollContainerRef}
            className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 mask-fade-right"
          >
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-24 rounded-full flex-shrink-0" />
              ))
            ) : (
              sortedCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap border-2 ${
                    activeCategory === cat 
                      ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105' 
                      : 'bg-muted/30 text-muted-foreground border-transparent hover:bg-muted/50'
                  }`}
                >
                  {cat}
                </button>
              ))
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="relative h-64 md:h-80 rounded-3xl overflow-hidden mb-12 shadow-2xl flex items-center justify-center text-center px-6">
          <img 
            src="/hero-bakery.png" 
            alt="Talita Pinha - Bolos e Doces" 
            className="absolute inset-0 w-full h-full object-cover brightness-75 scale-105"
          />
          <div className="relative z-10 space-y-4">
            <h2 className="text-4xl md:text-5xl font-black text-white drop-shadow-lg tracking-tighter">
              DOÇURA EM CADA <span className="text-primary italic">DETALHE</span>
            </h2>
            <p className="text-white/90 font-medium max-w-lg mx-auto drop-shadow-md">
              Bolos artesanais e doces gourmet feitos com amor para celebrar seus melhores momentos.
            </p>
          </div>
        </section>

        <div className="mb-6">
          <h2 className="text-xl font-black uppercase tracking-tight text-foreground/80 flex items-center gap-2">
            {activeCategory}
            <div className="h-1 flex-1 bg-muted/30 rounded-full" />
          </h2>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex justify-between items-center p-4 border rounded-2xl">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="h-12 w-12 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : filteredProducts && filteredProducts.length > 0 ? (
          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-muted/10 rounded-3xl border-2 border-dashed">
            <p className="text-muted-foreground font-bold italic">Nenhum item nesta categoria hoje.</p>
          </div>
        )}
      </main>

      {/* Floating Action Button / Cart */}
      {totalItems > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-50">
          <Link to="/carrinho" className="block transform transition-transform active:scale-95">
            <div className="bg-primary text-white p-1 rounded-[2rem] shadow-2xl shadow-primary/40 border-4 border-white flex items-center">
              <div className="bg-white text-primary rounded-full h-14 w-14 flex items-center justify-center font-black text-xl">
                {totalItems}
              </div>
              <div className="flex-1 px-4">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-80 leading-none">Ver meu pedido</p>
                <p className="text-lg font-black leading-tight">FINALIZAR COMPRA</p>
              </div>
              <div className="pr-6 text-right">
                <p className="text-xl font-black">{formatCurrency(totalPrice)}</p>
              </div>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}

