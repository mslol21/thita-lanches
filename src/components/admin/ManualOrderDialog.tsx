import { useState, useEffect } from 'react';
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
import { Minus, Plus, ShoppingCart, Trash2, Store, CreditCard, Banknote, QrCode, Monitor } from 'lucide-react';
import { useCreateOrder } from '@/hooks/useOrders';
import { toast } from 'sonner';

interface ManualOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
}

type OrderType = 'balcao' | 'mesa' | 'retirada';

export function ManualOrderDialog({ open, onOpenChange, products }: ManualOrderDialogProps) {
  const createOrder = useCreateOrder();
  
  const [orderType, setOrderType] = useState<OrderType>('balcao');
  const [mesaNumber, setMesaNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cartao' | 'dinheiro' | 'pix'>('dinheiro');
  const [items, setItems] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('');

  const categories = Array.from(new Set(products.map(p => p.category || 'Outros')));
  
  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0]);
    }
  }, [categories, activeCategory]);

  const filteredProducts = products.filter(p => (p.category || 'Outros') === activeCategory && p.available);

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
    if (items.length === 0) {
      toast.error('Adicione pelo menos um item');
      return;
    }

    const name = customerName || (orderType === 'mesa' ? `Mesa ${mesaNumber}` : 'Cliente Balcão');
    const address = orderType === 'mesa' ? `Mesa ${mesaNumber}` : orderType === 'retirada' ? 'Retirada' : 'Balcão';

    try {
      await createOrder.mutateAsync({
        customer_name: name,
        customer_phone: '', // Not required for PDV
        customer_address: address,
        items: items,
        origin: 'balcao',
        payment_method: paymentMethod as any
      });
      onOpenChange(false);
      // Reset form
      setCustomerName('');
      setMesaNumber('');
      setItems([]);
      setOrderType('balcao');
    } catch (error) {
      // Error is handled by hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-[1200px] h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 border-b">
          <DialogTitle className="text-2xl font-black flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Monitor className="h-6 w-6 text-primary" />
              MODO BALCÃO / PDV
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-[10px] uppercase font-bold text-muted-foreground leading-none">Total do Pedido</p>
                <p className="text-2xl font-black text-primary">
                  {totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Side: Product Selection (Largest area) */}
          <div className="flex-1 flex flex-col bg-muted/20 border-b md:border-b-0 md:border-r overflow-hidden min-h-[40vh] md:min-h-0">
            <div className="p-3 sm:p-4 border-b bg-white flex flex-col gap-2 sm:gap-3">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold flex items-center gap-2 text-primary text-sm sm:text-base">
                  🍔 PRODUTOS
                </h3>
              </div>
              
              {/* Category selector */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-2 px-2 sm:mx-0 sm:px-0">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2 ${
                      activeCategory === cat
                        ? 'bg-primary text-white border-primary shadow-md'
                        : 'bg-white text-muted-foreground border-transparent hover:border-muted'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 sm:p-4">
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
                {filteredProducts.map(product => (
                  <button
                    key={product.id}
                    onClick={() => addItem(product)}
                    className="flex flex-col text-left p-2 sm:p-4 bg-white border-2 border-transparent rounded-xl hover:border-primary hover:shadow-md transition-all group relative active:scale-95 h-24 sm:h-32"
                  >
                    <span className="font-black text-xs sm:text-sm leading-tight uppercase mb-1 line-clamp-2">{product.name}</span>
                    <span className="text-sm sm:text-lg font-black text-primary mt-auto">
                      {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side: Order Summary & Customer Info */}
          <div className="w-full md:w-80 lg:w-96 flex flex-col bg-white overflow-hidden border-t md:border-t-0 shadow-inner md:shadow-none">
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Context / Type */}
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {(['balcao', 'mesa', 'retirada'] as OrderType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setOrderType(type)}
                      className={`py-3 px-1 rounded-lg border-2 font-black text-[10px] uppercase tracking-tighter transition-all ${
                        orderType === type 
                          ? 'border-primary bg-primary text-white' 
                          : 'border-muted bg-muted/30 text-muted-foreground hover:border-primary/50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <div className="space-y-3 pt-2">
                  {orderType === 'mesa' && (
                    <div className="space-y-1.5 animate-in slide-in-from-top-2">
                      <Label className="text-[10px] font-black uppercase tracking-wider">Número da Mesa</Label>
                      <Input 
                        placeholder="Ex: 04" 
                        value={mesaNumber}
                        onChange={(e) => setMesaNumber(e.target.value)}
                        className="h-12 text-lg font-black"
                        autoFocus
                      />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-wider">Nome do Cliente (Opcional)</Label>
                    <Input 
                      placeholder="Ex: João Silva" 
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="h-12 font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-wider">Pagamento</Label>
                    <Select value={paymentMethod} onValueChange={(v: any) => setPaymentMethod(v)}>
                      <SelectTrigger className="h-12 font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cartao">💳 Cartão</SelectItem>
                        <SelectItem value="dinheiro">💵 Dinheiro</SelectItem>
                        <SelectItem value="pix">📱 PIX</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b pb-1">
                  ITENS NO CARRINHO
                </h3>
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-center">
                    <ShoppingCart className="h-8 w-8 mb-2 opacity-20" />
                    <p className="text-xs font-bold uppercase tracking-tight">Carrinho Vazio</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {items.map(item => (
                      <div key={item.product.id} className="flex flex-col p-3 bg-muted/20 border rounded-lg group">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-black text-xs uppercase leading-tight line-clamp-1 flex-1 mr-2">{item.product.name}</span>
                          <span className="font-black text-xs">{formatCurrency(item.product.price * item.quantity)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center bg-white border rounded-md h-8">
                            <button 
                              className="px-2 hover:text-primary transition-colors"
                              onClick={() => removeItem(item.product.id)}
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-8 text-center font-black text-xs">{item.quantity}</span>
                            <button 
                              className="px-2 hover:text-primary transition-colors"
                              onClick={() => addItem(item.product)}
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <button 
                            className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity p-1"
                            onClick={() => deleteItem(item.product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t bg-muted/10 space-y-3">
              <Button 
                className={`w-full h-16 text-lg font-black uppercase tracking-widest transition-all ${items.length > 0 ? 'bg-primary hover:bg-primary/90 shadow-lg active:scale-95' : ''}`}
                onClick={handleSubmit} 
                disabled={createOrder.isPending || items.length === 0}
              >
                {createOrder.isPending ? 'LANÇANDO...' : 'FINALIZAR PEDIDO'}
              </Button>
              <Button 
                variant="ghost" 
                className="w-full text-[10px] font-black uppercase tracking-widest text-muted-foreground"
                onClick={() => onOpenChange(false)}
                disabled={createOrder.isPending}
              >
                DESCARTAR / SAIR
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

