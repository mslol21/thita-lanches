import {
  Beef,
  Pizza,
  Coffee,
  IceCream,
  Sandwich,
  Salad,
  Soup,
  Cookie,
  Cake,
  Croissant,
  Drumstick,
  Fish,
  Egg,
  Milk,
  Wine,
  Beer,
  GlassWater,
  Grape,
  Apple,
  Cherry,
  Citrus,
  Banana,
  Candy,
  Popcorn,
  Flame,
  ChefHat,
  Utensils,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react';

export interface ProductIcon {
  name: string;
  icon: LucideIcon;
  label: string;
  category?: string;
}

export const PRODUCT_ICONS: ProductIcon[] = [
  // Lanches e Carnes
  { name: 'beef', icon: Beef, label: 'Carne', category: 'Lanches' },
  { name: 'sandwich', icon: Sandwich, label: 'Sanduíche', category: 'Lanches' },
  { name: 'drumstick', icon: Drumstick, label: 'Frango', category: 'Lanches' },
  { name: 'pizza', icon: Pizza, label: 'Pizza', category: 'Lanches' },
  { name: 'fish', icon: Fish, label: 'Peixe', category: 'Lanches' },
  { name: 'egg', icon: Egg, label: 'Ovo', category: 'Lanches' },
  { name: 'flame', icon: Flame, label: 'Picante', category: 'Lanches' },
  
  // Bebidas
  { name: 'coffee', icon: Coffee, label: 'Café', category: 'Bebidas' },
  { name: 'beer', icon: Beer, label: 'Cerveja', category: 'Bebidas' },
  { name: 'wine', icon: Wine, label: 'Vinho', category: 'Bebidas' },
  { name: 'glass-water', icon: GlassWater, label: 'Água', category: 'Bebidas' },
  { name: 'milk', icon: Milk, label: 'Leite', category: 'Bebidas' },
  
  // Sobremesas
  { name: 'ice-cream', icon: IceCream, label: 'Sorvete', category: 'Sobremesas' },
  { name: 'cake', icon: Cake, label: 'Bolo', category: 'Sobremesas' },
  { name: 'cookie', icon: Cookie, label: 'Biscoito', category: 'Sobremesas' },
  { name: 'croissant', icon: Croissant, label: 'Croissant', category: 'Sobremesas' },
  { name: 'candy', icon: Candy, label: 'Doce', category: 'Sobremesas' },
  
  // Frutas e Saladas
  { name: 'salad', icon: Salad, label: 'Salada', category: 'Porções' },
  { name: 'apple', icon: Apple, label: 'Maçã', category: 'Porções' },
  { name: 'banana', icon: Banana, label: 'Banana', category: 'Porções' },
  { name: 'grape', icon: Grape, label: 'Uva', category: 'Porções' },
  { name: 'cherry', icon: Cherry, label: 'Cereja', category: 'Porções' },
  { name: 'citrus', icon: Citrus, label: 'Cítrico', category: 'Porções' },
  
  // Outros
  { name: 'soup', icon: Soup, label: 'Sopa', category: 'Porções' },
  { name: 'popcorn', icon: Popcorn, label: 'Pipoca', category: 'Porções' },
  { name: 'chef-hat', icon: ChefHat, label: 'Chef', category: 'Adicionais' },
  { name: 'utensils', icon: Utensils, label: 'Talheres', category: 'Adicionais' },
  { name: 'utensils-crossed', icon: UtensilsCrossed, label: 'Refeição', category: 'Adicionais' },
];

export const getProductIcon = (iconName: string | null): LucideIcon | null => {
  if (!iconName) return null;
  const found = PRODUCT_ICONS.find(i => i.name === iconName);
  return found ? found.icon : null;
};
