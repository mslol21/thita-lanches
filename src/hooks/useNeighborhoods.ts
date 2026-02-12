import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { neighborhoodService } from '@/services/neighborhood.service';
import { Neighborhood } from '@/types';
import { toast } from 'sonner';

export function useNeighborhoods() {
  return useQuery({
    queryKey: ['neighborhoods'],
    queryFn: neighborhoodService.getNeighborhoods,
  });
}

export function useCreateNeighborhood() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (neighborhood: Omit<Neighborhood, 'id'>) => 
      neighborhoodService.createNeighborhood(neighborhood),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['neighborhoods'] });
      toast.success('Bairro cadastrado com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao cadastrar bairro: ' + error.message);
    },
  });
}

export function useUpdateNeighborhood() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...neighborhood }: Partial<Neighborhood> & { id: string }) => 
      neighborhoodService.updateNeighborhood(id, neighborhood),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['neighborhoods'] });
      toast.success('Bairro atualizado!');
    },
    onError: (error: any) => {
      toast.error('Erro ao atualizar bairro: ' + error.message);
    },
  });
}

export function useDeleteNeighborhood() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => neighborhoodService.deleteNeighborhood(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['neighborhoods'] });
      toast.success('Bairro removido!');
    },
    onError: (error: any) => {
      toast.error('Erro ao excluir bairro: ' + error.message);
    },
  });
}
