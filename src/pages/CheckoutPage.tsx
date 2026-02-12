import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, CreditCard, Banknote, QrCode, Clock, MapPin, Truck, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCart } from '@/contexts/CartContext';
import { useCreateOrder } from '@/hooks/useOrders';
import { useSettings } from '@/hooks/useSettings';
import { toast } from 'sonner';
import { checkoutSchema } from '@/lib/validators';
import { formatCurrency } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 8; hour <= 20; hour++) {
    for (let minute of [0, 30]) {
      if (hour === 20 && minute === 30) break;
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push(time);
    }
  }
  return slots;
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const createOrder = useCreateOrder();
  const { data: settings } = useSettings();
  
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    delivery_method: 'retirada' as 'entrega' | 'retirada',
    scheduled_time: '',
    customer_address: '',
    customer_cep: '',
    customer_neighborhood: '',
    observations: '',
    payment_method: '' as 'pix' | 'dinheiro' | 'cartao',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCEPTitle, setIsCEPTitle] = useState(false);

  const timeSlots = generateTimeSlots();

  const deliveryFee = formData.delivery_method === 'entrega' ? (settings?.fixed_delivery_fee || 0) : 0;
  const finalTotal = totalPrice + deliveryFee;

  const estimatedTime = settings?.min_production_time || 0;

  // Busca CEP automático e verifica distância
  useEffect(() => {
    const cep = formData.customer_cep?.replace(/\D/g, '');
    if (cep && cep.length === 8 && settings) {
      setIsCEPTitle(true);
      
      const checkCoverage = async () => {
        try {
          // 1. Buscar endereço via ViaCEP
          const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
          const data = await res.json();
          
          if (data.erro) {
            toast.error('CEP não encontrado');
            return;
          }

          setFormData(prev => ({
            ...prev,
            customer_address: data.logradouro,
            customer_neighborhood: data.bairro || '',
          }));

          // 2. Verificar distância (Geocoding)
          // Store Coordinates
          const storeRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(settings.store_address || '')}&limit=1`, {
            headers: { 'User-Agent': 'TalitaPinhaApp' }
          });
          const storeData = await storeRes.json();
          
          // Customer Coordinates
          const custRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${cep},Brazil&limit=1`, {
            headers: { 'User-Agent': 'TalitaPinhaApp' }
          });
          const custData = await custRes.json();

          if (storeData.length > 0 && custData.length > 0) {
            const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
              const R = 6371;
              const dLat = (lat2 - lat1) * Math.PI / 180;
              const dLon = (lon2 - lon1) * Math.PI / 180;
              const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
                        Math.sin(dLon/2) * Math.sin(dLon/2);
              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
              return R * c;
            };

            const dist = getDistance(
              parseFloat(storeData[0].lat), parseFloat(storeData[0].lon),
              parseFloat(custData[0].lat), parseFloat(custData[0].lon)
            );

            if (dist > settings.max_delivery_km) {
              toast.error(`Fora da área de cobertura! Esta distância (${dist.toFixed(1)}km) excede o limite de ${settings.max_delivery_km}km.`, {
                duration: 5000
              });
            } else {
              toast.success(`Endereço dentro da área de cobertura (${dist.toFixed(1)}km)!`);
            }
          }
        } catch (err) {
          console.error('Erro na busca de cobertura:', err);
        } finally {
          setIsCEPTitle(false);
        }
      };

      checkCoverage();
    }
  }, [formData.customer_cep, settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = checkoutSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      const order = await createOrder.mutateAsync({
        ...formData,
        items,
        delivery_fee: deliveryFee,
        total_price: finalTotal,
        estimated_time: estimatedTime,
      } as any);
      
      const deliveryInfo = formData.delivery_method === 'entrega' 
        ? `*Endereço:* ${formData.customer_address}\n*CEP:* ${formData.customer_cep}\n*Bairro:* ${formData.customer_neighborhood}\n*Tempo Estimado:* ~${estimatedTime} min`
        : `*Horário de Retirada:* ${formData.scheduled_time}`;

      const message = encodeURIComponent(
        `🎂 *Novo Pedido - Talita Pinha*\n\n` +
        `*Nome:* ${formData.customer_name}\n` +
        `*Pedido:* #${order.id.slice(0, 8)}\n` +
        `${deliveryInfo}\n` +
        `*Pagamento:* ${formData.payment_method.toUpperCase()}\n\n` +
        `*Itens:*\n${items.map(item => `• ${item.quantity}x ${item.product.name}`).join('\n')}\n\n` +
        `*Produtos:* ${formatCurrency(totalPrice)}\n` +
        (deliveryFee > 0 ? `*Taxa Entrega:* ${formatCurrency(deliveryFee)}\n` : '') +
        `*Total:* ${formatCurrency(finalTotal)}\n\n` +
        (formData.observations ? `*Observações:* ${formData.observations}\n\n` : '') +
        `*Acesse o cardápio:* ${window.location.origin}`
      );
      
      window.open(`https://wa.me/${import.meta.env.VITE_BUSINESS_WHATSAPP}?text=${message}`, '_blank');
      clearCart();
      navigate('/');
    } catch (error) {
      toast.error('Erro ao enviar pedido. Tente novamente.');
    }
  };

  if (items.length === 0) {
    navigate('/carrinho');
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 font-bold transition-colors">
          <ArrowLeft className="h-4 w-4" /> Voltar ao Cardápio
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <form onSubmit={handleSubmit} className="md:col-span-3 space-y-6">
            <div className="bg-card rounded-lg border border-border p-6 space-y-4 shadow-sm">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                👤 Seus Dados
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer_name">Nome Completo *</Label>
                  <Input
                    id="customer_name"
                    name="customer_name"
                    value={formData.customer_name}
                    onChange={handleChange}
                    placeholder="Como vamos te chamar?"
                    className={errors.customer_name ? 'border-destructive' : ''}
                  />
                  {errors.customer_name && <p className="text-xs text-destructive font-bold">{errors.customer_name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer_phone">WhatsApp *</Label>
                  <Input
                    id="customer_phone"
                    name="customer_phone"
                    value={formData.customer_phone}
                    onChange={handleChange}
                    placeholder="(00) 00000-0000"
                    className={errors.customer_phone ? 'border-destructive' : ''}
                  />
                  {errors.customer_phone && <p className="text-xs text-destructive font-bold">{errors.customer_phone}</p>}
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-6 space-y-4 shadow-sm">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                🚚 Método de Recebimento
              </h2>
              
              <Tabs 
                value={formData.delivery_method} 
                onValueChange={(v) => {
                  setFormData(p => ({ ...p, delivery_method: v as any }));
                  setErrors(prev => ({ ...prev, delivery_method: '' }));
                }}
              >
                <TabsList className="grid w-full grid-cols-2 h-12">
                  <TabsTrigger value="retirada" className="gap-2 h-10">
                    <ShoppingBag className="h-4 w-4" /> Retirada
                  </TabsTrigger>
                  <TabsTrigger value="entrega" className="gap-2 h-10">
                    <Truck className="h-4 w-4" /> Entrega
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {formData.delivery_method === 'retirada' ? (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="space-y-2">
                    <Label htmlFor="scheduled_time" className="flex items-center gap-2">
                      <Clock className="h-4 w-4" /> Horário para Retirada *
                    </Label>
                    <Select 
                      value={formData.scheduled_time} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, scheduled_time: value }))}
                    >
                      <SelectTrigger className={errors.scheduled_time ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Selecione o horário" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map(time => (
                          <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg flex gap-3 text-blue-800 text-sm">
                    <MapPin className="h-5 w-5 shrink-0" />
                    <p><strong>Local de Retirada:</strong> {settings?.store_address || 'Rua das Flores, 123 - Centro'}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="customer_cep">CEP *</Label>
                      <div className="relative">
                        <Input
                          id="customer_cep"
                          name="customer_cep"
                          value={formData.customer_cep}
                          onChange={handleChange}
                          placeholder="00000-000"
                          className={errors.customer_cep ? 'border-destructive' : ''}
                        />
                        {isCEPTitle && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="customer_neighborhood">Bairro *</Label>
                      <Input
                        id="customer_neighborhood"
                        name="customer_neighborhood"
                        value={formData.customer_neighborhood}
                        onChange={handleChange}
                        placeholder="Ex: Centro"
                        className={errors.customer_neighborhood ? 'border-destructive' : ''}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customer_address">Endereço e Número *</Label>
                    <Input
                      id="customer_address"
                      name="customer_address"
                      value={formData.customer_address}
                      onChange={handleChange}
                      placeholder="Rua, Número, Apto (se houver)"
                      className={errors.customer_address ? 'border-destructive' : ''}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="bg-card rounded-lg border border-border p-6 space-y-4 shadow-sm">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                💳 Forma de Pagamento
              </h2>
              
              <RadioGroup 
                value={formData.payment_method} 
                onValueChange={(v) => setFormData(p => ({ ...p, payment_method: v as any }))}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4"
              >
                {['cartao', 'dinheiro', 'pix'].map((method) => (
                  <div key={method}>
                    <RadioGroupItem value={method} id={method} className="peer sr-only" />
                    <Label
                      htmlFor={method}
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all h-full"
                    >
                      {method === 'cartao' && <CreditCard className="mb-3 h-6 w-6" />}
                      {method === 'dinheiro' && <Banknote className="mb-3 h-6 w-6" />}
                      {method === 'pix' && <QrCode className="mb-3 h-6 w-6" />}
                      <span className="text-sm font-bold capitalize">{method}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              {errors.payment_method && <p className="text-xs text-destructive font-bold">{errors.payment_method}</p>}
            </div>

            <div className="bg-card rounded-lg border border-border p-6 space-y-4 shadow-sm">
              <Label htmlFor="observations">Observações (opcional)</Label>
              <Textarea
                id="observations"
                name="observations"
                value={formData.observations}
                onChange={handleChange}
                placeholder="Ex: Sem cebola, troco para R$ 50,00..."
                rows={2}
              />
            </div>

            <Button 
              type="submit" 
              size="lg" 
              className="w-full h-14 text-lg font-bold shadow-lg shadow-primary/20"
              disabled={createOrder.isPending}
            >
              {createOrder.isPending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Enviando Pedido...
                </>
              ) : (
                `Confirmar Pedido • ${formatCurrency(finalTotal)}`
              )}
            </Button>
          </form>

          <div className="md:col-span-2">
            <div className="bg-card rounded-lg border border-border p-6 sticky top-24 shadow-sm">
              <h2 className="font-semibold text-lg mb-4">Resumo do Pedido</h2>
              <div className="space-y-4">
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.quantity}x {item.product.name}
                      </span>
                      <span className="font-medium">
                        {formatCurrency(item.product.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-border pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Produtos</span>
                    <span>{formatCurrency(totalPrice)}</span>
                  </div>
                  {formData.delivery_method === 'entrega' && (
                    <div className="flex justify-between text-sm text-green-600 font-medium">
                      <span>Taxa de Entrega</span>
                      <span>{deliveryFee > 0 ? formatCurrency(deliveryFee) : 'Grátis'}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t border-border">
                    <span className="font-bold text-lg">Total</span>
                    <span className="text-2xl font-black text-primary">{formatCurrency(finalTotal)}</span>
                  </div>
                </div>

                <div className="bg-muted/50 p-4 rounded-xl flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-[10px] font-black uppercase text-muted-foreground leading-none">Tempo Estimado</p>
                    <p className="font-bold">~{estimatedTime} minutos</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
