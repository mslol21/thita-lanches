import { useQuery } from '@tanstack/react-query';
import { neighborhoodService } from '@/services/neighborhood.service';

export function useNeighborhoods() {
  return useQuery({
    queryKey: ['neighborhoods'],
    queryFn: neighborhoodService.getNeighborhoods,
  });
}
