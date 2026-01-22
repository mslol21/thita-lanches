import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Product, CartItem } from '@/types';
import { Minus, Plus, ShoppingCart, Trash2, MessageSquare, Store, Globe, CreditCard, Banknote, QrCode } from 'lucide-react';
import { useCreateOrder } from '@/hooks/useOrders';
import { toast } from 'sonner';

interface ManualOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
}

export function ManualOrderDialog({ open, onOpenChange, products }: ManualOrderDialogProps) {
  const createOrder = useCreateOrder();
  
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('Consumo no Local');
  const [origin, setOrigin] = useState<'whatsapp' | 'balcao' | 'ifood'>('balcao');
  const [paymentMethod, setPaymentMethod] = useState<'cartao' | 'dinheiro' | 'pix'>('dinheiro');
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (product: Product) => {
    setItems(current => {
      const existing = current.find(i => i.product.id === product.id);
      if (existing) {
        return current.map(i => 
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...current, { product, quantity: 1 }];
    });
  };

  const removeItem = (productId: string) => {
    setItems(current => {
      const existing = current.find(i => i.product.id === productId);
      if (existing && existing.quantity > 1) {
        return current.map(i => 
          i.product.id === productId ? { ...i, quantity: i.quantity - 1 } : i
        );
      }
      return current.filter(i => i.product.id !== productId);
    });
  };

  const deleteItem = (productId: string) => {
    setItems(current => current.filter(i => i.product.id !== productId));
  };

  const totalPrice = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const handleSubmit = async () => {
    if (!customerName || items.length === 0) {
      toast.error('Preencha o nome e adicione pelo menos um item');
      return;
    }

    try {
      await createOrder.mutateAsync({
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_address: customerAddress,
        items: items,
        origin: origin as any,
        payment_method: paymentMethod as any
      });
      onOpenChange(false);
      // Reset form
      setCustomerName('');
      setCustomerPhone('');
      setCustomerAddress('Consumo no Local');
      setItems([]);
    } catch (error) {
      // Error is handled by hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Plus className="h-6 w-6 text-primary" />
            Novo Pedido Manual
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-4">
          {/* Left Side: Form */}
          <div className="space-y-6">
            <div className="bg-muted/30 p-4 rounded-lg space-y-4 border">
              <h3 className="font-semibold flex items-center gap-2 border-b pb-2">
                👤 Dados do Cliente
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="manual-name">Nome do Cliente *</Label>
                  <Input 
                    id="manual-name" 
                    placeholder="Ex: João Silva" 
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manual-phone">WhatsApp/Telefone</Label>
                  <Input 
                    id="manual-phone" 
                    placeholder="(16) 99999-9999" 
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-2 col-span-1 sm:col-span-1">
                  <Label htmlFor="manual-origin">Origem do Pedido</Label>
                  <Select value={origin} onValueChange={(v: any) => setOrigin(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="balcao">🏪 Balcão / Mesa</SelectItem>
                      <SelectItem value="whatsapp">💬 WhatsApp</SelectItem>
                      <SelectItem value="ifood">🛵 iFood</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manual-payment">Forma de Pagamento</Label>
                  <Select value={paymentMethod} onValueChange={(v: any) => setPaymentMethod(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cartao">💳 Cartão</SelectItem>
                      <SelectItem value="dinheiro">💵 Dinheiro</SelectItem>
                      <SelectItem value="pix">📱 PIX</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="manual-address">Endereço (ou "Local")</Label>
                  <Input 
                    id="manual-address" 
                    placeholder="Rua, Número, Bairro" 
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="bg-muted/30 p-4 rounded-lg space-y-4 border">
              <h3 className="font-semibold flex items-center gap-2 border-b pb-2">
                📦 Carrinho do Pedido
              </h3>
              {items.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground italic text-sm">
                  Nenhum item adicionado ainda
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map(item => (
                    <div key={item.product.id} className="flex items-center justify-between bg-white p-2 border rounded-md shadow-sm">
                      <div className="flex-1">
                        <p className="font-bold text-sm leading-none">{item.product.name}</p>
                        <p className="text-xs text-primary font-bold">
                          {(item.product.price * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => removeItem(item.product.id)}>
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="font-bold w-4 text-center">{item.quantity}</span>
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => addItem(item.product)}>
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteItem(item.product.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="pt-3 border-t flex justify-between items-center font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary font-black">
                      {totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Product Selection */}
          <div className="space-y-4 flex flex-col max-h-[600px]">
            <h3 className="font-semibold flex items-center gap-2 border-b pb-2 sticky top-0 bg-white z-10">
              🍔 Selecionar Produtos
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto pr-2 pb-2">
              {products.filter(p => p.available).map(product => (
                <button
                  key={product.id}
                  onClick={() => addItem(product)}
                  className="flex flex-col text-left p-3 border rounded-lg hover:border-primary hover:bg-primary/5 transition-all group"
                >
                  <span className="font-bold text-sm line-clamp-1">{product.name}</span>
                  <span className="text-xs text-muted-foreground mt-1 font-bold">
                    {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                  <div className="mt-3 bg-secondary text-secondary-foreground text-[10px] font-black uppercase py-1 px-2 rounded-full inline-block group-hover:bg-primary group-hover:text-white text-center">
                    + ADICIONAR
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={createOrder.isPending}>
            Cancelar
          </Button>
          <Button 
            className="h-12 px-8 text-lg font-bold gap-2" 
            onClick={handleSubmit} 
            disabled={createOrder.isPending || items.length === 0}
          >
            {createOrder.isPending ? 'Salvando...' : (
              <>
                <ShoppingCart className="h-5 w-5" />
                LANÇAR PEDIDO ({totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
