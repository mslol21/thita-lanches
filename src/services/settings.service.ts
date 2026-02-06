import { db } from '@/integrations/firebase/config';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc 
} from "firebase/firestore";
import { SystemSettings } from '@/types';

const SETTINGS_DOC_ID = 'global';

export const settingsService = {
  async getSettings(): Promise<SystemSettings> {
    const docRef = doc(db, "settings", SETTINGS_DOC_ID);
    const snapshot = await getDoc(docRef);
    
    if (!snapshot.exists()) {
      // Configurações padrão caso não existam
      const defaultSettings: SystemSettings = {
        min_production_time: 30,
        max_delivery_km: 10,
        pix_key: '',
        is_open: true
      };
      await setDoc(docRef, defaultSettings);
      return defaultSettings;
    }
    
    return snapshot.data() as SystemSettings;
  },

  async updateSettings(settings: Partial<SystemSettings>): Promise<void> {
    const docRef = doc(db, "settings", SETTINGS_DOC_ID);
    await updateDoc(docRef, settings);
  }
};
