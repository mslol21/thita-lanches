import { useState, useEffect } from 'react';
import { Loader2, Upload, X, ImageIcon, Tag, Plus } from 'lucide-react';
import { storage } from '@/integrations/firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateProduct, useUpdateProduct } from '@/hooks/useProducts';
import { useCategories, useCreateCategory } from '@/hooks/useCategories';
import { Product } from '@/types';
import { productSchema } from '@/lib/validators';

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
}

const DEFAULT_CATEGORIES = [
  'Lanches',
  'Bebidas',
  'Porções',
  'Combos',
  'Sobremesas',
  'Adicionais'
];

export function ProductDialog({ open, onOpenChange, product }: ProductDialogProps) {
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const { data: categories = [] } = useCategories();
  const createCategory = useCreateCategory();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const isEditing = !!product;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    category: '',
    available: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price.toString(),
        image_url: product.image_url || '',
        category: product.category || '',
        available: product.available,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        image_url: '',
        category: 'Lanches',
        available: true,
      });
    }
    setErrors({});
  }, [product, open]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors({ image_url: 'Por favor, selecione uma imagem válida.' });
      return;
    }

    setIsUploading(true);
    setErrors({});

    try {
      const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setFormData(prev => ({ ...prev, image_url: url }));
    } catch (error) {
      console.error('Error uploading file:', error);
      setErrors({ image_url: 'Erro ao fazer upload da imagem.' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      name: formData.name,
      description: formData.description || undefined,
      price: parseFloat(formData.price) || 0,
      image_url: formData.image_url || undefined,
      category: formData.category,
      available: formData.available,
    };

    const result = productSchema.safeParse(data);
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
      if (isEditing && product) {
        await updateProduct.mutateAsync({ id: product.id, ...data });
      } else {
        await createProduct.mutateAsync(data);
      }
      onOpenChange(false);
    } catch {
      // Error handled by mutation
    }
  };

  const isLoading = createProduct.isPending || updateProduct.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-primary" />
            {isEditing ? 'Editar Produto' : 'Novo Produto'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Produto *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: X-Bacon Supremo"
              className={errors.name ? 'border-destructive' : 'h-11 font-bold'}
            />
            {errors.name && <p className="text-[10px] text-destructive font-bold uppercase">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoria *</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger className={errors.category ? 'border-destructive' : 'h-11 font-bold'}>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <div className="p-2 border-b">
                    {showAddCategory ? (
                      <div className="flex gap-2">
                        <Input 
                          size={1}
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          placeholder="Nova categoria..."
                          className="h-8 text-xs"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (newCategoryName.trim()) {
                                createCategory.mutate(newCategoryName.trim());
                                setFormData(prev => ({ ...prev, category: newCategoryName.trim() }));
                                setNewCategoryName('');
                                setShowAddCategory(false);
                              }
                            }
                          }}
                        />
                        <Button 
                          type="button"
                          size="sm"
                          className="h-8 px-2"
                          onClick={() => {
                            if (newCategoryName.trim()) {
                              createCategory.mutate(newCategoryName.trim());
                              setFormData(prev => ({ ...prev, category: newCategoryName.trim() }));
                              setNewCategoryName('');
                              setShowAddCategory(false);
                            }
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button 
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2"
                          onClick={() => setShowAddCategory(false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        type="button"
                        variant="ghost" 
                        className="w-full justify-start h-8 text-xs gap-2 font-bold text-primary"
                        onClick={() => setShowAddCategory(true)}
                      >
                        <Plus className="h-3 w-3" />
                        NOVA CATEGORIA
                      </Button>
                    )}
                  </div>
                  {(() => {
                    const allCategories = Array.from(new Set([
                      ...DEFAULT_CATEGORIES,
                      ...categories.map(c => c.name)
                    ]));
                    return allCategories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ));
                  })()}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-[10px] text-destructive font-bold uppercase">{errors.category}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Preço *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="0.00"
                className={errors.price ? 'border-destructive' : 'h-11 font-bold'}
              />
              {errors.price && <p className="text-[10px] text-destructive font-bold uppercase">{errors.price}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição / Ingredientes</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Ex: Pão brioche, blend 180g, muito bacon..."
              rows={3}
              className="resize-none font-medium"
            />
          </div>

          <div className="space-y-2">
            <Label>Imagem do Produto (Opcional)</Label>
            
            {formData.image_url ? (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden border-2 border-muted bg-muted group">
                <img 
                  src={formData.image_url} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-full h-8 w-8"
                  onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 bg-muted/10 hover:bg-muted/20 transition-all relative group">
                <Input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
                {isUploading ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="mt-2 text-[10px] text-muted-foreground font-black uppercase tracking-widest">Enviando...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center">
                    <div className="p-3 bg-primary/5 rounded-full mb-2 group-hover:scale-110 transition-transform">
                      <Upload className="h-5 w-5 text-primary" />
                    </div>
                    <p className="font-black text-[10px] uppercase tracking-widest mb-1">Subir Foto</p>
                    <p className="text-[9px] text-muted-foreground">JPG, PNG, WebP</p>
                  </div>
                )}
              </div>
            )}
            {errors.image_url && <p className="text-[10px] text-destructive font-bold uppercase">{errors.image_url}</p>}
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
            <div>
              <Label htmlFor="available" className="font-bold">Disponível para venda</Label>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">O produto aparecerá no cardápio</p>
            </div>
            <Switch
              id="available"
              checked={formData.available}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, available: checked }))}
            />
          </div>

          <DialogFooter className="pt-4 gap-2">
            <Button type="button" variant="ghost" className="font-bold flex-1" onClick={() => onOpenChange(false)}>
              DESCARTAR
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1 font-black uppercase tracking-widest h-11">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  GRAVANDO...
                </>
              ) : (
                isEditing ? 'SALVAR ALTERAÇÕES' : 'CADASTRAR PRODUTO'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

