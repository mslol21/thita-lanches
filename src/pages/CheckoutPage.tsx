import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, CreditCard, Banknote, QrCode, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCart } from '@/contexts/CartContext';
import { useCreateOrder } from '@/hooks/useOrders';
import { checkoutSchema } from '@/lib/validators';
import { formatCurrency } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Generate time slots from 8:00 to 20:00 in 30-minute intervals
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 8; hour <= 20; hour++) {
    for (let minute of [0, 30]) {
      if (hour === 20 && minute === 30) break; // Stop at 20:00
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
  
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    scheduled_time: '',
    observations: '',
    payment_method: '' as any,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const timeSlots = generateTimeSlots();

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
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      const order = await createOrder.mutateAsync({
        ...formData,
        items,
        delivery_method: 'retirada',
      });
      
      // Send WhatsApp message
      const message = encodeURIComponent(
        `🎂 *Novo Pedido - Talita Pinha*\n\n` +
        `*Nome:* ${formData.customer_name}\n` +
        `*Horário de Retirada:* ${formData.scheduled_time}\n` +
        `*Pagamento:* ${formData.payment_method.toUpperCase()}\n\n` +
        `*Itens:*\n${items.map(item => `• ${item.quantity}x ${item.product.name}`).join('\n')}\n\n` +
        `*Total:* ${formatCurrency(totalPrice)}\n\n` +
        (formData.observations ? `*Observações:* ${formData.observations}\n\n` : '') +
        `Pedido #${order.id}`
      );
      
      // Open WhatsApp (configured via environment variable)
      const businessPhone = import.meta.env.VITE_BUSINESS_WHATSAPP || '5598991234567';
      window.open(`https://wa.me/${businessPhone}?text=${message}`, '_blank');
      
      clearCart();
      navigate(`/pedido/${order.id}`);
    } catch {
      // Error handled by mutation
    }
  };

  if (items.length === 0) {
    navigate('/carrinho');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-pink-50 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/carrinho">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Finalizar Pedido
          </h1>
        </div>

        <div className="grid gap-6 md:grid-cols-5">
          <form onSubmit={handleSubmit} className="md:col-span-3 space-y-6">
            <div className="bg-card rounded-lg border border-border p-6 space-y-4">
              <h2 className="font-semibold text-lg">Seus dados</h2>
              
              <div className="space-y-2">
                <Label htmlFor="customer_name">Nome completo *</Label>
                <Input
                  id="customer_name"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleChange}
                  placeholder="Seu nome"
                  className={errors.customer_name ? 'border-destructive' : ''}
                />
                {errors.customer_name && (
                  <p className="text-sm text-destructive">{errors.customer_name}</p>
                )}
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
                {errors.customer_phone && (
                  <p className="text-sm text-destructive">{errors.customer_phone}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheduled_time" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Horário para Retirada *
                </Label>
                <Select 
                  value={formData.scheduled_time} 
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, scheduled_time: value }));
                    if (errors.scheduled_time) {
                      setErrors(prev => ({ ...prev, scheduled_time: '' }));
                    }
                  }}
                >
                  <SelectTrigger className={errors.scheduled_time ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Selecione o horário" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map(time => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.scheduled_time && (
                  <p className="text-sm text-destructive">{errors.scheduled_time}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="observations">Observações (opcional)</Label>
                <Textarea
                  id="observations"
                  name="observations"
                  value={formData.observations}
                  onChange={handleChange}
                  placeholder="Alguma observação sobre o pedido?"
                  rows={2}
                />
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-6 space-y-4">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                💳 Forma de Pagamento
              </h2>
              
              <RadioGroup 
                value={formData.payment_method} 
                onValueChange={(v) => setFormData(p => ({ ...p, payment_method: v as any }))}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4"
              >
                <div>
                  <RadioGroupItem value="cartao" id="cartao" className="peer sr-only" />
                  <Label
                    htmlFor="cartao"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                  >
                    <CreditCard className="mb-3 h-6 w-6" />
                    <span className="text-sm font-bold">Cartão</span>
                  </Label>
                </div>

                <div>
                  <RadioGroupItem value="dinheiro" id="dinheiro" className="peer sr-only" />
                  <Label
                    htmlFor="dinheiro"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                  >
                    <Banknote className="mb-3 h-6 w-6" />
                    <span className="text-sm font-bold">Dinheiro</span>
                  </Label>
                </div>

                <div>
                  <RadioGroupItem value="pix" id="pix" className="peer sr-only" />
                  <Label
                    htmlFor="pix"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                  >
                    <QrCode className="mb-3 h-6 w-6" />
                    <span className="text-sm font-bold">PIX</span>
                  </Label>
                </div>
              </RadioGroup>
              {errors.payment_method && (
                <p className="text-sm text-destructive font-bold">{errors.payment_method}</p>
              )}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800 font-medium">
                ⏰ <strong>Pedido para Retirada:</strong> Seu pedido estará pronto no horário selecionado. Aguarde a confirmação via WhatsApp.
              </p>
            </div>

            <Button 
              type="submit" 
              size="lg" 
              className="w-full"
              disabled={createOrder.isPending}
            >
              {createOrder.isPending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Enviando...
                </>
              ) : (
                `Confirmar Pedido • ${formatCurrency(totalPrice)}`
              )}
            </Button>
          </form>

          <div className="md:col-span-2">
            <div className="bg-card rounded-lg border border-border p-4 sticky top-24">
              <h2 className="font-semibold text-lg mb-4">Resumo do pedido</h2>
              <div className="space-y-3">
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
              <div className="border-t border-border mt-4 pt-4">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(totalPrice)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
