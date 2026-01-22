import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, CreditCard, Banknote, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCart } from '@/contexts/CartContext';
import { useCreateOrder } from '@/hooks/useOrders';
import { checkoutSchema } from '@/lib/validators';
import { formatCurrency } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const createOrder = useCreateOrder();
  
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_address: '',
    observations: '',
    payment_method: '' as any,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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
      });
      
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
    <div className="container mx-auto px-4 py-8">
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
                <Label htmlFor="customer_phone">Telefone *</Label>
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
                <Label htmlFor="customer_address">Endereço de entrega *</Label>
                <Textarea
                  id="customer_address"
                  name="customer_address"
                  value={formData.customer_address}
                  onChange={handleChange}
                  placeholder="Rua, número, bairro, complemento..."
                  rows={3}
                  className={errors.customer_address ? 'border-destructive' : ''}
                />
                {errors.customer_address && (
                  <p className="text-sm text-destructive">{errors.customer_address}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="observations">Observações (opcional)</Label>
                <Textarea
                  id="observations"
                  name="observations"
                  value={formData.observations}
                  onChange={handleChange}
                  placeholder="Sem cebola, ponto da carne, etc..."
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
