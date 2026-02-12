import { z } from 'zod';

export const checkoutSchema = z.object({
  customer_name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  customer_phone: z.string().min(10, 'WhatsApp inválido').max(20),
  delivery_method: z.enum(['entrega', 'retirada']),
  scheduled_time: z.string().optional(),
  customer_address: z.string().optional(),
  customer_cep: z.string().optional(),
  neighborhood_id: z.string().optional(),
  observations: z.string().max(500).optional(),
  payment_method: z.enum(['cartao', 'dinheiro', 'pix'], {
    required_error: 'Selecione uma forma de pagamento',
  }),
}).refine((data) => {
  if (data.delivery_method === 'entrega') {
    return !!data.customer_address && !!data.neighborhood_id && (!!data.customer_cep && data.customer_cep.length >= 8);
  }
  return !!data.scheduled_time;
}, {
  message: "Preencha os campos obrigatórios corretamente",
  path: ["delivery_method"]
});

export const productSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  description: z.string().max(500).optional(),
  price: z.number().min(0.01, 'Preço deve ser maior que zero'),
  image_url: z.string().url('URL da imagem inválida').optional().nullable().or(z.literal('')),
  icon: z.string().optional().nullable().or(z.literal('')),
  category: z.string().min(2, 'Categoria é obrigatória'),
  available: z.boolean().default(true),
});

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});
