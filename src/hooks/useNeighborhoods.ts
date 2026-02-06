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
    onError: () => {
      toast.error('Erro ao cadastrar bairro.');
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
      toast.success('Bairro atualizado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao atualizar bairro.');
    },
  });
}

export function useDeleteNeighborhood() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: neighborhoodService.deleteNeighborhood,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['neighborhoods'] });
      toast.success('Bairro removido com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao remover bairro.');
    },
  });
}
