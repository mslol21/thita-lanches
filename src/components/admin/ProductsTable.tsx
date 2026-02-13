import { useState } from 'react';
import { MoreHorizontal, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { getProductIcon } from '@/lib/product-icons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ProductDialog } from './ProductDialog';
import { useDeleteProduct, useUpdateProduct } from '@/hooks/useProducts';
import { Product } from '@/types';
import { toast } from 'sonner';

interface ProductsTableProps {
  products: Product[];
}

export function ProductsTable({ products }: ProductsTableProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const deleteProductMutation = useDeleteProduct();
  const updateProduct = useUpdateProduct();

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const handleDelete = async () => {
    if (deleteProduct) {
      try {
        await deleteProductMutation.mutateAsync(deleteProduct.id);
        setDeleteProduct(null);
      } catch (error: any) {
        if (error.code === '23503') { // Foreign key constraint error
          toast.error(`Não é possível excluir "${deleteProduct.name}" porque ele já foi vendido em algum pedido. Recomendamos desativar o produto em vez de excluir.`);
        } else {
          toast.error('Erro ao excluir produto: ' + (error.message || 'Erro desconhecido'));
        }
      }
    }
  };

  const toggleAvailability = (product: Product) => {
    updateProduct.mutate({
      id: product.id,
      available: !product.available,
    });
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Nenhum produto cadastrado
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[80px]">Imagem</TableHead>
              <TableHead>Produto / Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id} className="group hover:bg-muted/30">
                <TableCell>
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted border border-border flex items-center justify-center">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                    ) : product.icon ? (
                      (() => {
                        const Icon = getProductIcon(product.icon);
                        return Icon ? <Icon className="h-6 w-6 text-primary" /> : <span className="text-xl">🍔</span>;
                      })()
                    ) : (
                      <div className="text-xl">
                        🍔
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <p className="font-bold text-base leading-none mb-1">{product.name}</p>
                    {product.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
                        {product.description}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tight bg-primary/10 text-primary border border-primary/20">
                    {product.category || 'Outros'}
                  </span>
                </TableCell>
                <TableCell className="font-black text-sm">
                  {formatPrice(product.price)}
                </TableCell>
                <TableCell>
                  <div 
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase cursor-pointer select-none transition-colors ${
                      product.available 
                        ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                    onClick={() => toggleAvailability(product)}
                  >
                    <div className={`h-1.5 w-1.5 rounded-full ${product.available ? 'bg-green-600' : 'bg-red-600'}`} />
                    {product.available ? 'Visível' : 'Oculto'}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSelectedProduct(product)} className="font-bold">
                        <Pencil className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleAvailability(product)} className="font-bold">
                        {product.available ? (
                          <>
                            <EyeOff className="h-4 w-4 mr-2" />
                            Ocultar no site
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-2" />
                            Mostrar no site
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setDeleteProduct(product)}
                        className="text-destructive font-bold"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ProductDialog
        open={!!selectedProduct}
        onOpenChange={(open) => !open && setSelectedProduct(null)}
        product={selectedProduct}
      />

      <AlertDialog open={!!deleteProduct} onOpenChange={(open) => !open && setDeleteProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir produto</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{deleteProduct?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
