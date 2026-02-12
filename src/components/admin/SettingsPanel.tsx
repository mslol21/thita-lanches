import { Save, Settings2, Clock, Map, MapPin, CreditCard, DoorOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useSettings, useUpdateSettings } from '@/hooks/useSettings';
import { useState, useEffect } from 'react';

export function SettingsPanel() {
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();
  
  const [formData, setFormData] = useState({
    min_production_time: '',
    max_delivery_km: '',
    pix_key: '',
    is_open: true,
    store_address: '',
    store_cep: '',
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        min_production_time: settings.min_production_time.toString(),
        max_delivery_km: settings.max_delivery_km.toString(),
        pix_key: settings.pix_key,
        is_open: settings.is_open,
        store_address: settings.store_address || '',
        store_cep: settings.store_cep || '',
      });
    }
  }, [settings]);

  // Busca CEP automático da loja
  useEffect(() => {
    const cep = formData.store_cep?.replace(/\D/g, '');
    if (cep && cep.length === 8) {
      fetch(`https://viacep.com.br/ws/${cep}/json/`)
        .then(res => res.json())
        .then(data => {
          if (!data.erro) {
            setFormData(prev => ({
              ...prev,
              store_address: `${data.logradouro}, ${data.bairro} - ${data.localidade}/${data.uf}`,
            }));
          }
        });
    }
  }, [formData.store_cep]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings.mutate({
      min_production_time: parseInt(formData.min_production_time) || 0,
      max_delivery_km: parseFloat(formData.max_delivery_km) || 0,
      pix_key: formData.pix_key,
      is_open: formData.is_open,
      store_address: formData.store_address,
      store_cep: formData.store_cep,
    });
  };

  if (isLoading) return <div className="p-8 text-center text-sm font-bold animate-pulse">CARREGANDO CONFIGURAÇÕES...</div>;

  return (
    <div className="max-w-2xl space-y-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Loja Aberta/Fechada */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-muted/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${formData.is_open ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              <DoorOpen className="h-6 w-6" />
            </div>
            <div>
              <p className="font-black text-sm uppercase tracking-widest leading-none">Status da Loja</p>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-tighter mt-1">
                {formData.is_open ? 'A loja está recebendo pedidos' : 'A loja está fechada no momento'}
              </p>
            </div>
          </div>
          <Switch 
            checked={formData.is_open}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_open: checked }))}
            className="scale-125"
          />
        </div>

        {/* Endereço da Loja */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-muted/50 space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <MapPin className="h-5 w-5" />
            <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Endereço da Loja (Origem)</Label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Input 
                value={formData.store_address}
                onChange={(e) => setFormData(prev => ({ ...prev, store_address: e.target.value }))}
                placeholder="Rua, Número, Bairro - Cidade"
                className="h-12 font-bold"
              />
            </div>
            <div>
              <Input 
                value={formData.store_cep}
                onChange={(e) => setFormData(prev => ({ ...prev, store_cep: e.target.value }))}
                placeholder="CEP: 00000-000"
                className="h-12 font-bold"
              />
            </div>
          </div>
          <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-tighter">Este endereço é usado como ponto central para cálculo de distâncias.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tempo de Produção */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-muted/50 space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Clock className="h-5 w-5" />
              <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Tempo Mín. Produção</Label>
            </div>
            <div className="relative">
              <Input 
                type="number"
                value={formData.min_production_time}
                onChange={(e) => setFormData(prev => ({ ...prev, min_production_time: e.target.value }))}
                className="h-12 pl-4 pr-12 font-black text-lg"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-muted-foreground uppercase">min</span>
            </div>
            <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-tighter">Impacta na previsão de entrega e retirada agendada.</p>
          </div>

          {/* Limite de Entrega */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-muted/50 space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Map className="h-5 w-5" />
              <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Limite de Entrega (KM)</Label>
            </div>
            <div className="relative">
              <Input 
                type="number"
                step="0.1"
                value={formData.max_delivery_km}
                onChange={(e) => setFormData(prev => ({ ...prev, max_delivery_km: e.target.value }))}
                className="h-12 pl-4 pr-12 font-black text-lg"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-muted-foreground uppercase">km</span>
            </div>
            <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-tighter">Bairros além deste limite serão bloqueados no checkout.</p>
          </div>
        </div>

        {/* Chave PIX */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-muted/50 space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <CreditCard className="h-5 w-5" />
            <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Chave PIX para Pagamentos</Label>
          </div>
          <Input 
            value={formData.pix_key}
            onChange={(e) => setFormData(prev => ({ ...prev, pix_key: e.target.value }))}
            placeholder="Ex: CPF, E-mail, Celular ou Chave Aleatória"
            className="h-12 font-bold"
          />
          <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-tighter">Esta chave será exibida para o cliente quando ele escolher pagar via PIX.</p>
        </div>

        <Button 
          type="submit" 
          disabled={updateSettings.isPending}
          className="w-full h-14 gap-2 font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20 text-base"
        >
          <Save className="h-5 w-5" />
          {updateSettings.isPending ? 'SALVANDO...' : 'SALVAR CONFIGURAÇÕES'}
        </Button>
      </form>
    </div>
  );
}
