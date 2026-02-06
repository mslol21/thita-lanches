import { Trash2, Plus, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  useNeighborhoods, 
  useDeleteNeighborhood, 
  useCreateNeighborhood,
  useUpdateNeighborhood 
} from '@/hooks/useNeighborhoods';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

export function NeighborhoodsTable() {
  const { data: neighborhoods = [], isLoading } = useNeighborhoods();
  const deleteNeighborhood = useDeleteNeighborhood();
  const createNeighborhood = useCreateNeighborhood();
  const updateNeighborhood = useUpdateNeighborhood();

  const [newNeighborhood, setNewNeighborhood] = useState({
    name: '',
    distance_km: '',
    delivery_fee: '',
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newNeighborhood.name.trim() && newNeighborhood.distance_km && newNeighborhood.delivery_fee) {
      createNeighborhood.mutate({
        name: newNeighborhood.name.trim(),
        distance_km: parseFloat(newNeighborhood.distance_km),
        delivery_fee: parseFloat(newNeighborhood.delivery_fee),
        active: true,
      });
      setNewNeighborhood({ name: '', distance_km: '', delivery_fee: '' });
    }
  };

  const toggleActive = (id: string, currentStatus: boolean) => {
    updateNeighborhood.mutate({ id, active: !currentStatus });
  };

  if (isLoading) return <div className="p-8 text-center text-sm font-bold animate-pulse">CARREGANDO BAIRROS...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-4">
        <h3 className="font-black text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          Cadastrar Novo Bairro
        </h3>
        
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Nome do Bairro</label>
            <Input 
              value={newNeighborhood.name}
              onChange={(e) => setNewNeighborhood(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Centro"
              className="h-11 font-bold"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Distância (km)</label>
            <Input 
              type="number"
              step="0.1"
              value={newNeighborhood.distance_km}
              onChange={(e) => setNewNeighborhood(prev => ({ ...prev, distance_km: e.target.value }))}
              placeholder="Ex: 2.5"
              className="h-11 font-bold"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Taxa (R$)</label>
            <Input 
              type="number"
              step="0.01"
              value={newNeighborhood.delivery_fee}
              onChange={(e) => setNewNeighborhood(prev => ({ ...prev, delivery_fee: e.target.value }))}
              placeholder="Ex: 5.00"
              className="h-11 font-bold"
            />
          </div>
          <Button type="submit" className="h-11 gap-2 font-black uppercase tracking-widest">
            <Plus className="h-4 w-4" />
            ADICIONAR
          </Button>
        </form>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="font-black text-[10px] uppercase tracking-widest">Bairro</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest">Distância</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest">Taxa de Entrega</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest">Status</TableHead>
              <TableHead className="w-[80px] text-right font-black text-[10px] uppercase tracking-widest">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {neighborhoods.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  <p className="font-bold text-sm">Nenhum bairro cadastrado.</p>
                  <p className="text-[10px] uppercase tracking-wider mt-1">Adicione bairros para habilitar a entrega por região.</p>
                </TableCell>
              </TableRow>
            ) : (
              neighborhoods.map((n) => (
                <TableRow key={n.id} className="group hover:bg-muted/20 transition-colors">
                  <TableCell className="font-bold text-sm">{n.name}</TableCell>
                  <TableCell className="font-medium text-sm">{n.distance_km} km</TableCell>
                  <TableCell className="font-black text-sm text-primary">
                    {n.delivery_fee.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={n.active}
                        onCheckedChange={() => toggleActive(n.id, n.active)}
                      />
                      <span className={`text-[10px] font-black uppercase tracking-tighter ${n.active ? 'text-green-600' : 'text-red-600'}`}>
                        {n.active ? 'ATIVO' : 'INATIVO'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => confirm(`Excluir bairro "${n.name}"?`) && deleteNeighborhood.mutate(n.id)}
                      className="text-destructive hover:bg-destructive/10 h-8 w-8 rounded-full"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
