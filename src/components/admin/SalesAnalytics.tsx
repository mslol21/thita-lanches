import { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  startOfDay, 
  startOfWeek, 
  startOfMonth, 
  isWithinInterval, 
  subDays, 
  format,
  isSameDay
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TrendingUp, DollarSign, ShoppingBag, Users, Target, Banknote, QrCode, CreditCard } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Order } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface SalesAnalyticsProps {
  orders: Order[];
}

const COLORS = ['#d4af37', '#10b981', '#3b82f6', '#ef4444'];

export function SalesAnalytics({ orders }: SalesAnalyticsProps) {
  const stats = useMemo(() => {
    const now = new Date();
    const dayStart = startOfDay(now);
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const monthStart = startOfMonth(now);

    const validOrders = orders.filter(o => o.status !== 'cancelled');

    const todayOrders = validOrders.filter(o => isSameDay(new Date(o.created_at || 0), now));
    const weekOrders = validOrders.filter(o => isWithinInterval(new Date(o.created_at || 0), { start: weekStart, end: now }));
    const monthOrders = validOrders.filter(o => isWithinInterval(new Date(o.created_at || 0), { start: monthStart, end: now }));

    const todayRevenue = todayOrders.reduce((acc, o) => acc + o.total_price, 0);
    const weekRevenue = weekOrders.reduce((acc, o) => acc + o.total_price, 0);
    const monthRevenue = monthOrders.reduce((acc, o) => acc + o.total_price, 0);

    // Chart Data: Last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(now, 6 - i);
      const dayOrders = validOrders.filter(o => isSameDay(new Date(o.created_at || 0), date));
      return {
        name: format(date, 'eee', { locale: ptBR }),
        revenue: dayOrders.reduce((acc, o) => acc + o.total_price, 0),
        orders: dayOrders.length,
      };
    });

    // Origin distribution
    const origins = validOrders.reduce((acc: any, o) => {
      const origin = o.origin || 'site';
      acc[origin] = (acc[origin] || 0) + 1;
      return acc;
    }, {});

    const originData = Object.entries(origins).map(([name, value]) => ({
      name: name === 'whatsapp' ? 'WhatsApp' : name === 'balcao' ? 'Balcão' : name === 'ifood' ? 'iFood' : 'Site',
      value
    }));

    // Payment distribution
    const payments = validOrders.reduce((acc: any, o) => {
      const method = o.payment_method || 'cartao';
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {});

    const paymentData = Object.entries(payments).map(([name, value]) => ({
      name: name === 'cartao' ? 'Cartão' : name === 'dinheiro' ? 'Dinheiro' : 'PIX',
      value
    }));

    return {
      todayRevenue,
      weekRevenue,
      monthRevenue,
      todayOrders: todayOrders.length,
      weekOrders: weekOrders.length,
      monthOrders: monthOrders.length,
      chartData: last7Days,
      originData,
      paymentData
    };
  }, [orders]);

  const PAYMENT_COLORS = ['#3b82f6', '#10b981', '#a855f7'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Top Value Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Faturamento Hoje</CardTitle>
            <DollarSign className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-primary">{formatCurrency(stats.todayRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              {stats.todayOrders} pedidos realizados hoje
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Esta Semana</CardTitle>
            <TrendingUp className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{formatCurrency(stats.weekRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              {stats.weekOrders} pedidos nesta semana
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Este Mês</CardTitle>
            <Target className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{formatCurrency(stats.monthRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              {stats.monthOrders} pedidos faturados
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Desempenho de Vendas (7 dias)
            </CardTitle>
            <CardDescription>Evolução financeira da última semana</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.chartData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748B', fontSize: 12, fontWeight: 600 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748B', fontSize: 12 }}
                    tickFormatter={(value) => `R$ ${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      fontWeight: 'bold'
                    }}
                    formatter={(value: any) => [formatCurrency(value), 'Faturamento']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#d4af37" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Origin Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Canais de Venda
            </CardTitle>
            <CardDescription>Onde os clientes compram</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.originData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {stats.originData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="grid grid-cols-2 gap-2 mt-4">
                {stats.originData.map((data: { name: string, value: number }) => (
                  <div key={data.name} className="flex items-center gap-2 text-[10px] font-bold uppercase truncate">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[stats.originData.indexOf(data) % COLORS.length] }} />
                    {data.name}: {data.value}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Meios de Pagamento
            </CardTitle>
            <CardDescription>Como os clientes pagam</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.paymentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {stats.paymentData.map((entry, index) => (
                      <Cell key={`cell-p-${index}`} fill={PAYMENT_COLORS[index % PAYMENT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="grid grid-cols-2 gap-2 mt-4">
                {stats.paymentData.map((data: { name: string, value: number }) => (
                  <div key={data.name} className="flex items-center gap-2 text-[10px] font-bold uppercase truncate">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PAYMENT_COLORS[stats.paymentData.indexOf(data) % PAYMENT_COLORS.length] }} />
                    {data.name}: {data.value}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Count Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Volume de Pedidos
          </CardTitle>
          <CardDescription>Quantidade de lanches preparados por dia</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748B', fontSize: 12, fontWeight: 600 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748B', fontSize: 12 }}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    fontWeight: 'bold'
                  }}
                />
                <Bar 
                  dataKey="orders" 
                  fill="#d4af37" 
                  radius={[6, 6, 0, 0]} 
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
