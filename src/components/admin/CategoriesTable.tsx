import { Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCategories, useDeleteCategory, useCreateCategory } from '@/hooks/useCategories';
import { useState } from 'react';
import { Input } from '@/components/ui/input';

export function CategoriesTable() {
  const { data: categories = [], isLoading } = useCategories();
  const deleteCategory = useDeleteCategory();
  const createCategory = useCreateCategory();
  const [newCat, setNewCat] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCat.trim()) {
      createCategory.mutate(newCat.trim());
      setNewCat('');
    }
  };

  if (isLoading) return <div className="p-8 text-center">Carregando categorias...</div>;

  return (
    <div className="space-y-4">
      <form onSubmit={handleAdd} className="flex gap-2 p-4 bg-muted/30 rounded-lg">
        <Input 
          value={newCat}
          onChange={(e) => setNewCat(e.target.value)}
          placeholder="Nome da nova categoria..."
          className="max-w-xs font-bold"
        />
        <Button type="submit" className="gap-2 font-bold">
          <Plus className="h-4 w-4" />
          ADICIONAR
        </Button>
      </form>

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Nome da Categoria</TableHead>
              <TableHead className="w-[100px] text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                  Nenhuma categoria personalizada criada.
                </TableCell>
              </TableRow>
            ) : (
              categories.map((cat) => (
                <TableRow key={cat.id} className="group hover:bg-muted/30">
                  <TableCell className="font-bold">{cat.name}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => confirm(`Excluir categoria "${cat.name}"?`) && deleteCategory.mutate(cat.id)}
                      className="text-destructive hover:bg-destructive/10"
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
