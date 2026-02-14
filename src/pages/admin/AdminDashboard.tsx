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
  BarChart3,
  Globe,
  MessageSquare,
  Store,
  LayoutDashboard,
  List,
  Trash2,
  MapPin,
  Settings,
  AlertTriangle
} from 'lucide-react';
import { NeighborhoodsTable } from '@/components/admin/NeighborhoodsTable';
import { SettingsPanel } from '@/components/admin/SettingsPanel';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders, useDeleteAllOrders } from '@/hooks/useOrders';
import { useProducts, useDeleteAllProducts } from '@/hooks/useProducts';
import { OrdersTable } from '@/components/admin/OrdersTable';
import { OrdersKanban } from '@/components/admin/OrdersKanban';
import { ProductsTable } from '@/components/admin/ProductsTable';
import { CategoriesTable } from '@/components/admin/CategoriesTable';
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
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [statusTab, setStatusTab] = useState<'active' | 'cancelled'>('active');

  const { mutate: deleteAllOrders, isPending: isDeletingOrders } = useDeleteAllOrders();
  const { mutate: deleteAllProducts, isPending: isDeletingProducts } = useDeleteAllProducts();

  const handleResetSystem = () => {
    if (confirm('⚠️ ATENÇÃO: Isso irá APAGAR TODOS os pedidos e produtos permanentemente. Tem certeza?')) {
      deleteAllOrders();
      deleteAllProducts();
    }
  };

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

  const delayedOrders = orders.filter(o => 
    (o.status === 'pending' && getElapsedMinutes(o.created_at) > 15) ||
    (o.status === 'preparing' && getElapsedMinutes(o.created_at) > 30)
  );

  const stats = [
    { 
      label: 'Pendentes Hoje', 
      value: pendingOrders.length, 
      icon: Clock,
      color: pendingOrders.length > 0 ? 'text-amber-500 bg-amber-500/10' : 'text-muted-foreground'
    },
    { 
      label: 'Pedidos em Atraso', 
      value: delayedOrders.length, 
      icon: ShieldAlert,
      color: delayedOrders.length > 0 ? 'text-destructive bg-destructive/10 animate-pulse' : 'text-muted-foreground'
    },
    { 
      label: 'Em Preparo', 
      value: preparingOrders.length, 
      icon: ChefHat,
      color: 'text-blue-500 bg-blue-500/10'
    },
    { 
      label: 'Total Ativos', 
      value: orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length, 
      icon: ShoppingBag,
      color: 'text-primary bg-primary/10'
    },
  ];

  const { data: categories = [] } = useCategories();
  const createCategory = useCreateCategory();
  const [newCat, setNewCat] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCat.trim()) {
      createCategory.mutate(newCat.trim());
      setNewCat('');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
            <Link to="/" className="flex-shrink-0">
              <img src="/logo.png" alt="Logo" className="h-10 w-10 sm:h-12 sm:w-12 object-contain" />
            </Link>
            <div className="flex flex-col">
              <h1 className="text-base sm:text-xl font-black tracking-tight leading-none">PAINEL ADMIN</h1>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Controle Total</span>
            </div>
          </div>
            
          <div className="flex items-center gap-2 sm:gap-4">
            <Button 
              onClick={() => setManualOrderDialogOpen(true)}
              className="bg-primary text-white hover:bg-primary/90 gap-2 font-black h-9 sm:h-10 px-3 sm:px-6 rounded-full shadow-lg shadow-primary/20 transition-all active:scale-95 text-[10px] sm:text-sm"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden xs:inline">NOVO PEDIDO</span>
              <span className="xs:hidden">NOVO</span>
            </Button>
            <Button variant="ghost" size="sm" asChild className="text-sidebar-foreground/70 hover:text-white hidden md:flex">
              <Link to="/" target="_blank">Ver Cardápio</Link>
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={logout}
              className="text-sidebar-foreground/70 hover:text-destructive transition-colors"
              title="Sair"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="container mx-auto px-4 py-6 flex flex-col h-full">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((stat) => (
              <Card key={stat.label} className="border-none shadow-sm bg-card/50">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-black leading-none">{stat.value}</p>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mt-1">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="orders" className="flex-1 flex flex-col min-h-0 space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="w-full overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 [mask-image:_linear-gradient(to_right,transparent_0,_black_1rem,_black_calc(100%-1rem),transparent_100%)]">
                <TabsList className="inline-flex w-max sm:w-auto bg-muted/50 p-1 min-w-full sm:min-w-0">
                  <TabsTrigger value="orders" className="gap-2 font-bold px-4 sm:px-6">
                    <ShoppingBag className="h-4 w-4" />
                    <span className="whitespace-nowrap">Operação</span>
                  </TabsTrigger>
                  <TabsTrigger value="products" className="gap-2 font-bold px-4 sm:px-6">
                    <Package className="h-4 w-4" />
                    <span className="whitespace-nowrap">Produtos</span>
                  </TabsTrigger>
                  <TabsTrigger value="categories" className="gap-2 font-bold px-4 sm:px-6">
                    <List className="h-4 w-4" />
                    <span className="whitespace-nowrap">Categorias</span>
                  </TabsTrigger>
                  <TabsTrigger value="analytics" className="gap-2 font-bold px-4 sm:px-6">
                    <BarChart3 className="h-4 w-4" />
                    <span className="whitespace-nowrap">Análises</span>
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="gap-2 font-bold px-4 sm:px-6">
                    <Settings className="h-4 w-4" />
                    <span className="whitespace-nowrap">Configurações</span>
                  </TabsTrigger>
                  <TabsTrigger value="system" className="gap-2 font-bold px-4 sm:px-6 text-destructive hover:text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="whitespace-nowrap">Sistema</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="orders" className="m-0">
                <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg">
                  <Button 
                    variant={viewMode === 'kanban' ? 'default' : 'ghost'} 
                    size="sm" 
                    onClick={() => setViewMode('kanban')}
                    className="h-8 gap-2 font-bold text-xs"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    KANBAN
                  </Button>
                  <Button 
                    variant={viewMode === 'table' ? 'default' : 'ghost'} 
                    size="sm" 
                    onClick={() => setViewMode('table')}
                    className="h-8 gap-2 font-bold text-xs"
                  >
                    <List className="h-4 w-4" />
                    HISTÓRICO
                  </Button>
                </div>
              </TabsContent>
            </div>

            <TabsContent value="orders" className="flex-1 min-h-0 mt-0 focus-visible:outline-none">
              <div className="flex flex-col h-full gap-4">
                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2">
                  <Button 
                    variant={originFilter === null ? 'default' : 'outline'} 
                    size="sm" 
                    onClick={() => setOriginFilter(null)}
                    className={`h-8 px-4 text-[10px] font-black uppercase tracking-wider ${originFilter === null ? 'bg-primary text-white hover:bg-primary/90' : ''}`}
                  >
                    TODOS OS PEDIDOS
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm" 
                    onClick={() => setOriginFilter('site')}
                    className={`h-8 px-4 text-[10px] font-black uppercase tracking-wider gap-2 ${originFilter === 'site' ? 'bg-primary text-white border-primary' : ''}`}
                  >
                    <Globe className="h-3 w-3" /> SITE
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm" 
                    onClick={() => setOriginFilter('balcao')}
                    className={`h-8 px-4 text-[10px] font-black uppercase tracking-wider gap-2 ${originFilter === 'balcao' ? 'bg-blue-600 text-white border-blue-600' : ''}`}
                  >
                    <Store className="h-3 w-3" /> BALCÃO
                  </Button>
                  
                  {viewMode === 'table' && (
                    <div className="ml-auto flex bg-muted p-1 rounded-md">
                      <Button 
                        variant={statusTab === 'active' ? 'secondary' : 'ghost'} 
                        size="sm" 
                        onClick={() => setStatusTab('active')}
                        className="h-7 text-[10px] font-black uppercase tracking-tight px-3"
                      >
                        Ativos
                      </Button>
                      <Button 
                        variant={statusTab === 'cancelled' ? 'secondary' : 'ghost'} 
                        size="sm" 
                        onClick={() => setStatusTab('cancelled')}
                        className="h-7 text-[10px] font-black uppercase tracking-tight px-3 text-destructive"
                      >
                        Cancelados
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-h-0">
                  {viewMode === 'kanban' ? (
                    <OrdersKanban 
                      orders={orders.filter(o => {
                        const matchesOrigin = originFilter ? o.origin === originFilter : true;
                        return (o.status !== 'cancelled') && matchesOrigin;
                      })} 
                    />
                  ) : (
                    <Card className="h-full overflow-hidden flex flex-col">
                      <div className="flex-1 overflow-auto">
                        <OrdersTable 
                          orders={orders.filter(o => {
                            const matchesStatus = statusTab === 'active' ? o.status !== 'cancelled' : o.status === 'cancelled';
                            const matchesOrigin = originFilter ? o.origin === originFilter : true;
                            return matchesStatus && matchesOrigin;
                          })} 
                        />
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="focus-visible:outline-none">
              <div className="p-1">
                <SalesAnalytics orders={orders} />
              </div>
            </TabsContent>

            <TabsContent value="products" className="focus-visible:outline-none">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between border-b px-6 py-4">
                  <CardTitle className="text-lg">Gerenciar Produtos</CardTitle>
                  <Button onClick={() => setProductDialogOpen(true)} className="gap-2 font-bold h-9">
                    <Plus className="h-4 w-4" />
                    CADASTRAR PRODUTO
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <ProductsTable products={products} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="categories" className="focus-visible:outline-none">
              <Card>
                <CardHeader className="border-b px-6 py-4">
                  <CardTitle className="text-lg">Gerenciar Categorias</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-2 p-3 sm:p-4 bg-muted/30 rounded-lg sm:rounded-xl">
                    <Input 
                      value={newCat}
                      onChange={(e) => setNewCat(e.target.value)}
                      placeholder="Nome da nova categoria..."
                      className="font-bold h-11 sm:h-10"
                    />
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button type="submit" className="flex-1 sm:flex-none gap-2 font-bold h-11 sm:h-10">
                        <Plus className="h-4 w-4" />
                        ADICIONAR
                      </Button>
                      {categories.length === 0 && (
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="flex-1 sm:flex-none font-bold border-primary text-primary hover:bg-primary/5 h-11 sm:h-10"
                          onClick={() => {
                            ['Lanches', 'Bebidas', 'Porções', 'Combos', 'Sobremesas', 'Adicionais'].forEach(cat => createCategory.mutate(cat));
                          }}
                        >
                          RESTAURAR PADRÕES
                        </Button>
                      )}
                    </div>
                  </form>
                  <CategoriesTable />
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* 
            <TabsContent value="neighborhoods" className="focus-visible:outline-none">
              <Card>
                <CardHeader className="border-b px-6 py-4">
                  <CardTitle className="text-lg">Gerenciar Bairros e Taxas</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <NeighborhoodsTable />
                </CardContent>
              </Card>
            </TabsContent>
            */}

            <TabsContent value="settings" className="focus-visible:outline-none">
              <Card>
                <CardHeader className="border-b px-6 py-4">
                  <CardTitle className="text-lg">Configurações Gerais</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <SettingsPanel />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="system" className="focus-visible:outline-none">
              <Card className="border-destructive/20 bg-destructive/5">
                <CardHeader>
                  <CardTitle className="text-destructive flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Zona de Perigo
                  </CardTitle>
                  <CardDescription>
                    Ações irreversíveis que afetam todo o sistema. Use com cautela.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between p-4 border border-destructive/20 rounded-xl bg-white/50 gap-4">
                    <div>
                      <h4 className="font-bold text-foreground">Reiniciar Sistema</h4>
                      <p className="text-sm text-muted-foreground">Apaga todos os pedidos, histórico de vendas e produtos cadastrados.</p>
                    </div>
                    <Button 
                      variant="destructive" 
                      className="gap-2 font-black min-w-[200px]"
                      onClick={handleResetSystem}
                      disabled={isDeletingOrders || isDeletingProducts}
                    >
                      <Trash2 className="h-4 w-4" />
                      {isDeletingOrders || isDeletingProducts ? 'LIMPANDO...' : 'LIMPAR TUDO'}
                    </Button>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between p-4 border border-destructive/20 rounded-xl bg-white/50 gap-4">
                    <div>
                      <h4 className="font-bold text-foreground">Limpar Apenas Pedidos</h4>
                      <p className="text-sm text-muted-foreground">Apaga apenas o histórico de pedidos e estatísticas de vendas.</p>
                    </div>
                    <Button 
                      variant="outline" 
                      className="gap-2 font-black border-destructive/50 text-destructive hover:bg-destructive/10 min-w-[200px]"
                      onClick={() => confirm('Apagar histórico de pedidos?') && deleteAllOrders()}
                      disabled={isDeletingOrders}
                    >
                      <Trash2 className="h-4 w-4" />
                      LIMPAR PEDIDOS
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
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

