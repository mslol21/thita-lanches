import { supabase } from "@/integrations/supabase/client";
import { Category } from '@/types';

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories' as any)
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data as unknown as Category[];
  },

  async createCategory(name: string): Promise<Category> {
    const { data, error } = await supabase
      .from('categories' as any)
      .insert([{ name }])
      .select()
      .single();

    if (error) throw error;
    return data as unknown as Category;
  },

  async deleteCategory(id: string): Promise<void> {
    const { error } = await supabase
      .from('categories' as any)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
