-- Função para criar pedido com atomicidade e validação de preço no backend
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
BEGIN
    -- 1. Validar se há itens
    IF jsonb_array_length(p_items) = 0 THEN
        RAISE EXCEPTION 'O pedido deve conter pelo menos um item.';
    END IF;

    -- 2. Calcular o preço total real (não confiando no frontend)
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

    -- 3. Inserir o pedido
    INSERT INTO public.orders (
        customer_name,
        customer_phone,
        customer_address,
        observations,
        total_price,
        status
    ) VALUES (
        p_customer_name,
        p_customer_phone,
        p_customer_address,
        p_observations,
        v_total_price,
        'pending'
    ) RETURNING * INTO v_order;

    -- 4. Inserir os itens do pedido
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        INSERT INTO public.order_items (
            order_id,
            product_id,
            quantity,
            price -- Preço capturado no momento da compra para histórico
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
