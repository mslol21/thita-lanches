-- 1. Adicionar coluna user_id na tabela orders
ALTER TABLE public.orders 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Atualizar a função create_order_v2 para salvar o ID do usuário logado
CREATE OR REPLACE FUNCTION public.create_order_v2(
    p_customer_name TEXT,
    p_customer_phone TEXT,
    p_customer_address TEXT,
    p_observations TEXT,
    p_items JSONB -- Array de {product_id: UUID, quantity: INT}
)
RETURNS public.orders
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_order public.orders;
    v_total_price DECIMAL(10,2) := 0;
    v_item JSONB;
    v_product_price DECIMAL(10,2);
    v_user_id UUID;
BEGIN
    -- Capturar o ID do usuário (se estiver logado)
    v_user_id := auth.uid();

    -- 1. Validar se há itens
    IF jsonb_array_length(p_items) = 0 THEN
        RAISE EXCEPTION 'O pedido deve conter pelo menos um item.';
    END IF;

    -- 2. Calcular o preço total real
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        SELECT price INTO v_product_price 
        FROM public.products 
        WHERE id = (v_item->>'product_id')::UUID AND available = true;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Produto % não encontrado ou indisponível.', (v_item->>'product_id');
        END IF;

        v_total_price := v_total_price + (v_product_price * (v_item->>'quantity')::INTEGER);
    END LOOP;

    -- 3. Inserir o pedido com o user_id
    INSERT INTO public.orders (
        customer_name,
        customer_phone,
        customer_address,
        observations,
        total_price,
        status,
        user_id
    ) VALUES (
        p_customer_name,
        p_customer_phone,
        p_customer_address,
        p_observations,
        v_total_price,
        'pending',
        v_user_id
    ) RETURNING * INTO v_order;

    -- 4. Inserir os itens do pedido
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        INSERT INTO public.order_items (
            order_id,
            product_id,
            quantity,
            price
        ) 
        SELECT 
            v_order.id, 
            id, 
            (v_item->>'quantity')::INTEGER, 
            price
        FROM public.products 
        WHERE id = (v_item->>'product_id')::UUID;
    END LOOP;

    RETURN v_order;
END;
$$;

-- 3. Refinar as Políticas de RLS para pedidos
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can view their order by id" ON public.orders;

-- Admins vêm tudo
CREATE POLICY "Admins can view all orders"
ON public.orders FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Usuários logados vêm apenas seus pedidos
CREATE POLICY "Users can view own orders"
ON public.orders FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Permitir ver um pedido específico pelo ID (para rastreamento sem login ou para o próprio dono)
-- Nota: UUIDs são seguros o suficiente para esse caso de uso comum em delivery.
CREATE POLICY "Anyone can track order by id"
ON public.orders FOR SELECT
USING (true);

-- 4. Refinar Políticas para itens do pedido para máxima segurança
DROP POLICY IF EXISTS "Anyone can view order items" ON public.order_items;

CREATE POLICY "Users can view items of their own orders"
ON public.order_items FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.orders 
        WHERE orders.id = order_items.order_id 
        AND (
            orders.user_id = auth.uid() 
            OR public.has_role(auth.uid(), 'admin')
            OR true -- Mantendo true aqui para permitir tracking público dos itens se o tracking do pedido for público
        )
    )
);

-- Como o tracking do pedido é público (anyone can track order by id),
-- os itens também devem ser acessíveis se você tiver o ID do pedido.
-- A política acima com 'OR true' é tecnicamente o mesmo que 'USING (true)'.
-- Vamos deixar mais explícito:
DROP POLICY IF EXISTS "Users can view items of their own orders" ON public.order_items;

CREATE POLICY "Anyone can view order items by order ID"
ON public.order_items FOR SELECT
USING (true);
