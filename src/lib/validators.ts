import { z } from 'zod';

export const checkoutSchema = z.object({
  customer_name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  customer_phone: z.string().min(10, 'Telefone inválido').max(20),
  customer_address: z.string().min(10, 'Endereço muito curto').max(500),
  observations: z.string().max(500).optional(),
  payment_method: z.enum(['cartao', 'dinheiro', 'pix'], {
    required_error: 'Selecione uma forma de pagamento',
  }),
});

export const productSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  description: z.string().max(500).optional(),
  price: z.number().min(0.01, 'Preço deve ser maior que zero'),
  image_url: z.string().url('URL da imagem inválida').optional().or(z.literal('')),
  available: z.boolean().default(true),
});

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});
