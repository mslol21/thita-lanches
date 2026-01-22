-- ===============================================================
-- SCRIPT PARA ADICIONAR ADMINISTRADOR
-- ===============================================================
-- Como usar:
-- 1. Vá ao Dashboard do Supabase -> SQL Editor
-- 2. Cole o código abaixo
-- 3. Substitua 'seu-email@exemplo.com' pelo e-mail do usuário
-- ===============================================================

DO $$
DECLARE
    v_user_id UUID;
    v_email TEXT := 'seu-email@exemplo.com'; -- <--- Mude o e-mail aqui
BEGIN
    -- 1. Busca o ID do usuário na tabela de autenticação
    SELECT id INTO v_user_id 
    FROM auth.users 
    WHERE email = v_email;

    IF v_user_id IS NULL THEN
        RAISE NOTICE 'Usuário com e-mail % não encontrado. Certifique-se que ele já criou uma conta.', v_email;
    ELSE
        -- 2. Insere ou atualiza o papel de admin
        INSERT INTO public.user_roles (user_id, role)
        VALUES (v_user_id, 'admin')
        ON CONFLICT (user_id, role) DO NOTHING;
        
        RAISE NOTICE 'Usuário % agora é um Administrador!', v_email;
    END IF;
END $$;
