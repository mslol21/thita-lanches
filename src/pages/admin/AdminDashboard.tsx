import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  ShoppingBag, 
  LogOut, 
  Plus,
  Clock,
  ChefHat,
  Truck,
  CheckCircle,
  ShieldAlert,
  History,
  BarChart3,
  Filter,
  Globe,
  MessageSquare,
  Store,
  XCircle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/hooks/useOrders';
import { useProducts } from '@/hooks/useProducts';
import { OrdersTable } from '@/components/admin/OrdersTable';
import { ProductsTable } from '@/components/admin/ProductsTable';
import { ProductDialog } from '@/components/admin/ProductDialog';
import { ManualOrderDialog } from '@/components/admin/ManualOrderDialog';
import { SalesAnalytics } from '@/components/admin/SalesAnalytics';
import { OrderStatus } from '@/types';

export default function AdminDashboard() {
  const { logout } = useAuth();

  const { data: orders = [] } = useOrders();
  const { data: products = [] } = useProducts();
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [manualOrderDialogOpen, setManualOrderDialogOpen] = useState(false);
  const [originFilter, setOriginFilter] = useState<string | null>(null);
  const [statusTab, setStatusTab] = useState<'active' | 'cancelled'>('active');

  const ordersByStatus = (status: OrderStatus) => 
    orders.filter(o => o.status === status);

  const now = new Date();
  const getElapsedMinutes = (dateString: string | undefined) => {
    if (!dateString) return 0;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 0;
    const diff = now.getTime() - date.getTime();
    return Math.max(0, Math.floor(diff / 60000));
  };

  const pendingOrders = ordersByStatus('pending');
  const preparingOrders = ordersByStatus('preparing');

  // Pedidos atrasados: pendentes > 15min ou preparando > 30min
  const delayedOrders = orders.filter(o => 
    (o.status === 'pending' && getElapsedMinutes(o.created_at) > 15) ||
    (o.status === 'preparing' && getElapsedMinutes(o.created_at) > 30)
  );

  const activeOrders = orders.filter(o => o.status !== 'delivered');
  const oldestOrder = activeOrders.length > 0 
    ? [...activeOrders].sort((a, b) => {
        const da = new Date(a.created_at || 0).getTime();
        const db = new Date(b.created_at || 0).getTime();
        return da - db;
      })[0]
    : null;

  const stats = [
    { 
      label: 'Pendentes (Ação!)', 
      value: pendingOrders.length, 
      icon: Clock,
      color: pendingOrders.length > 0 ? 'text-destructive animate-pulse font-bold' : 'text-muted-foreground'
    },
    { 
      label: 'Atrasados ⚠️', 
      value: delayedOrders.length, 
      icon: ShieldAlert,
      color: delayedOrders.length > 0 ? 'text-destructive shadow-sm' : 'text-muted-foreground'
    },
    { 
      label: 'Em Preparo', 
      value: preparingOrders.length, 
      icon: ChefHat,
      color: 'text-primary'
    },
    { 
      label: 'Mais Antigo', 
      value: oldestOrder ? `${getElapsedMinutes(oldestOrder.created_at)} min` : '--', 
      icon: History,
      color: oldestOrder && getElapsedMinutes(oldestOrder.created_at) > 20 ? 'text-destructive font-bold' : 'text-foreground'
    },
  ];


  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-sidebar text-sidebar-foreground border-b border-sidebar-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Logo" className="h-8 w-auto brightness-0 invert" />
              <div>
                <span className="font-display font-bold text-lg text-sidebar-primary uppercase tracking-wider">
                  Thita Lanches
                </span>
                <span className="text-xs text-sidebar-foreground/60 block">
                  Painel Administrativo
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                onClick={() => setManualOrderDialogOpen(true)}
                className="bg-primary text-white hover:bg-primary/90 gap-2 font-bold h-10 px-6 rounded-full shadow-lg shadow-primary/20 transition-all hover:scale-105"
              >
                <Plus className="h-5 w-5" />
                NOVO PEDIDO
              </Button>
              <Button variant="ghost" size="sm" asChild className="text-sidebar-foreground hover:text-sidebar-foreground">
                <Link to="/">Ver Cardápio</Link>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={logout}
                className="text-sidebar-foreground hover:text-sidebar-foreground gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="orders" className="space-y-6">
          <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            <TabsList className="inline-flex w-auto sm:w-full max-w-2xl bg-muted/50 p-1">
              <TabsTrigger value="orders" className="gap-2 px-6 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <ShoppingBag className="h-4 w-4" />
                Pedidos
              </TabsTrigger>
              <TabsTrigger value="products" className="gap-2 px-6 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Package className="h-4 w-4" />
                Produtos
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2 px-6 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <BarChart3 className="h-4 w-4" />
                Análises
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="orders">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
                <div>
                  <CardTitle>Fluxo de Pedidos</CardTitle>
                  <CardDescription>Gerencie as ordens em tempo real</CardDescription>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex bg-muted p-1 rounded-md mr-4">
                    <Button 
                      variant={statusTab === 'active' ? 'secondary' : 'ghost'} 
                      size="sm" 
                      onClick={() => setStatusTab('active')}
                      className="h-8 text-xs font-bold"
                    >
                      ATIVOS
                    </Button>
                    <Button 
                      variant={statusTab === 'cancelled' ? 'secondary' : 'ghost'} 
                      size="sm" 
                      onClick={() => setStatusTab('cancelled')}
                      className="h-8 text-xs font-bold text-destructive"
                    >
                      CANCELADOS
                    </Button>
                  </div>

                  <Button 
                    variant={originFilter === null ? 'outline' : 'ghost'} 
                    size="sm" 
                    onClick={() => setOriginFilter(null)}
                    className={`h-8 px-3 text-[10px] font-bold ${originFilter === null ? 'bg-primary/10 border-primary/20 text-primary' : ''}`}
                  >
                    TODOS
                  </Button>
                  <Button 
                    variant="ghost"
                    size="sm" 
                    onClick={() => setOriginFilter('whatsapp')}
                    className={`h-8 px-3 text-[10px] font-bold gap-1 ${originFilter === 'whatsapp' ? 'bg-[#25D366]/10 text-[#25D366]' : ''}`}
                  >
                    <MessageSquare className="h-3 w-3" /> WHATSAPP
                  </Button>
                  <Button 
                    variant="ghost"
                    size="sm" 
                    onClick={() => setOriginFilter('site')}
                    className={`h-8 px-3 text-[10px] font-bold gap-1 ${originFilter === 'site' ? 'bg-amber-500/10 text-amber-500' : ''}`}
                  >
                    <Globe className="h-3 w-3" /> SITE
                  </Button>
                  <Button 
                    variant="ghost"
                    size="sm" 
                    onClick={() => setOriginFilter('balcao')}
                    className={`h-8 px-3 text-[10px] font-bold gap-1 ${originFilter === 'balcao' ? 'bg-blue-500/10 text-blue-500' : ''}`}
                  >
                    <Store className="h-3 w-3" /> BALCÃO
                  </Button>
                  <Button 
                    variant="ghost"
                    size="sm" 
                    onClick={() => setOriginFilter('ifood')}
                    className={`h-8 px-3 text-[10px] font-bold gap-1 ${originFilter === 'ifood' ? 'bg-[#ea1d2c]/10 text-[#ea1d2c]' : ''}`}
                  >
                    <ShoppingBag className="h-3 w-3" /> IFOOD
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-0 sm:px-6 pt-6">
                <OrdersTable 
                  orders={orders.filter(o => {
                    const matchesStatus = statusTab === 'active' ? o.status !== 'cancelled' : o.status === 'cancelled';
                    const matchesOrigin = originFilter ? o.origin === originFilter : true;
                    return matchesStatus && matchesOrigin;
                  })} 
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <SalesAnalytics orders={orders} />
          </TabsContent>

          <TabsContent value="products">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Produtos</CardTitle>
                <Button onClick={() => setProductDialogOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Novo Produto
                </Button>
              </CardHeader>
              <CardContent>
                <ProductsTable products={products} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <ProductDialog 
        open={productDialogOpen} 
        onOpenChange={setProductDialogOpen} 
      />

      <ManualOrderDialog
        open={manualOrderDialogOpen}
        onOpenChange={setManualOrderDialogOpen}
        products={products}
      />
    </div>
  );
}
