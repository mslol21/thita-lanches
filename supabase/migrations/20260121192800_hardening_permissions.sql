-- 1. Remover políticas permissivas de inserção direta
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items;

-- 2. Garantir que apenas usuários autenticados possam ver seus próprios papéis (reforço)
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 3. Blindagem de Produtos (Apenas Admin altera, Todos vêem)
-- Já está implementado, mas vamos garantir que SELECT seja público e o resto Admin
DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;
CREATE POLICY "Products are viewable by everyone"
ON public.products FOR SELECT
USING (available = true OR public.has_role(auth.uid(), 'admin'));

-- 4. Proteção de Pedidos (RLS Avançado)
-- SELECT: Admin vê tudo, Cliente vê os seus, Público vê pelo ID (tracking)
DROP POLICY IF EXISTS "Anyone can track order by id" ON public.orders;
CREATE POLICY "Anyone can track order by id"
ON public.orders FOR SELECT
USING (
    true -- Mantendo true pois o ID (UUID) é o token de acesso
);

-- UPDATE: Apenas Admins podem atualizar pedidos (ex: mudar status)
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
CREATE POLICY "Admins can update orders"
ON public.orders FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- DELETE: Ninguém deve deletar pedidos (apenas Admin se houver erro crítico)
DROP POLICY IF EXISTS "Admins can delete orders" ON public.orders; -- Caso existisse
CREATE POLICY "Admins can delete orders"
ON public.orders FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 5. Blindagem de Itens de Pedido
-- SELECT: Só pode ver os itens se puder ver o pedido pai
DROP POLICY IF EXISTS "Anyone can view order items by order ID" ON public.order_items;
CREATE POLICY "Access order items via order access"
ON public.order_items FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.orders 
        WHERE orders.id = order_items.order_id
    )
);

-- RECOMENDAÇÃO: Inserção agora é EXCLUSIVA via RPC create_order_v2.
-- Como a função RPC tem SECURITY DEFINER, ela consegue inserir mesmo sem política de INSERT.
-- Isso é o "Padrão Ouro" de segurança no Supabase/Postgres.
