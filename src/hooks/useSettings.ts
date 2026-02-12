import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '@/services/settings.service';
import { SystemSettings } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: settingsService.getSettings,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: Partial<SystemSettings>) => 
      settingsService.updateSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Configurações atualizadas com sucesso!');
    },
    onError: async (error: any) => {
      console.error('Erro ao atualizar configurações:', error);
      const { data: { user } } = await supabase.auth.getUser();
      const email = user?.email;
      toast.error(`Erro ao atualizar: ${error.message}${email ? ` (Logado como: ${email})` : ''}`);
    },
  });
}
