import { supabase } from "@/integrations/supabase/client";
import { SystemSettings } from '@/types';

const SETTINGS_ID = 'global';

export const settingsService = {
  async getSettings(): Promise<SystemSettings> {
    const { data, error } = await supabase
      .from('system_settings' as any)
      .select('*')
      .eq('id', SETTINGS_ID)
      .single();
    
    if (error) {
      // Configurações padrão caso não existam
      const defaultSettings: SystemSettings = {
        min_production_time: 30,
        max_delivery_km: 10,
        pix_key: '',
        is_open: true
      };
      return defaultSettings;
    }
    
    return data as unknown as SystemSettings;
  },

  async updateSettings(settings: Partial<SystemSettings>): Promise<void> {
    const { error } = await supabase
      .from('system_settings' as any)
      .upsert({ 
        id: SETTINGS_ID, 
        ...settings,
        updated_at: new Date().toISOString()
      });
    
    if (error) throw error;
  }
};
