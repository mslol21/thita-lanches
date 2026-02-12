import { supabase } from "@/integrations/supabase/client";
import { Neighborhood } from '@/types';

export const neighborhoodService = {
  async getNeighborhoods(): Promise<Neighborhood[]> {
    const { data, error } = await supabase
      .from('neighborhoods' as any)
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data as unknown as Neighborhood[];
  },

  async createNeighborhood(neighborhood: Omit<Neighborhood, 'id'>): Promise<Neighborhood> {
    const { data, error } = await supabase
      .from('neighborhoods' as any)
      .insert([neighborhood])
      .select()
      .single();

    if (error) throw error;
    return data as unknown as Neighborhood;
  },

  async updateNeighborhood(id: string, neighborhood: Partial<Neighborhood>): Promise<void> {
    const { error } = await supabase
      .from('neighborhoods' as any)
      .update(neighborhood)
      .eq('id', id);
    
    if (error) throw error;
  },

  async deleteNeighborhood(id: string): Promise<void> {
    const { error } = await supabase
      .from('neighborhoods' as any)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
