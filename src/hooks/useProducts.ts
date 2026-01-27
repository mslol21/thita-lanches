import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '@/services/product.service';
import { Product } from '@/types';
import { toast } from 'sonner';

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => productService.getProducts(),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => 
      productService.createProduct(product),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produto criado com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao criar produto: ' + error.message);
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...product }: Partial<Product> & { id: string }) => 
      productService.updateProduct(id, product),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produto atualizado com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao atualizar produto: ' + error.message);
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => productService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produto excluído com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao excluir produto: ' + error.message);
    },
  });
}

export function useDeleteAllProducts() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => productService.deleteAllProducts(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Todos os produtos foram removidos!');
    },
    onError: (error: any) => {
      toast.error('Erro ao remover produtos: ' + error.message);
    },
  });
}
