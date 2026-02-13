-- 1. Enums
DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('pending_payment', 'pending', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_origin AS ENUM ('site', 'balcao', 'whatsapp', 'ifood');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('pix', 'dinheiro', 'cartao');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'paid');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE delivery_method AS ENUM ('entrega', 'retirada');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE app_role AS ENUM ('admin', 'customer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Tables
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    image_url TEXT,
    icon TEXT,
    category TEXT REFERENCES categories(name) ON UPDATE CASCADE,
    available BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_address TEXT,
    customer_cep TEXT,
    customer_neighborhood TEXT,
    neighborhood_id UUID REFERENCES neighborhoods(id),
    delivery_fee DECIMAL(10,2) DEFAULT 0,
    observations TEXT,
    status order_status DEFAULT 'pending',
    total_price DECIMAL(10,2) NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    origin order_origin DEFAULT 'site',
    payment_method payment_method DEFAULT 'pix',
    payment_status payment_status DEFAULT 'pending',
    delivery_method delivery_method DEFAULT 'retirada',
    change_amount DECIMAL(10,2),
    scheduled_time TEXT,
    estimated_time INTEGER,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS neighborhoods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    distance_km DECIMAL(10,2) NOT NULL,
    delivery_fee DECIMAL(10,2) NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS system_settings (
    id TEXT PRIMARY KEY DEFAULT 'global',
    min_production_time INTEGER DEFAULT 30,
    max_delivery_km DECIMAL(10,2) DEFAULT 10,
    pix_key TEXT,
    is_open BOOLEAN DEFAULT true,
    store_address TEXT,
    store_cep TEXT,
    fixed_delivery_fee DECIMAL(10,2) DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role app_role DEFAULT 'customer',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Initial Data
INSERT INTO system_settings (id, min_production_time, max_delivery_km, is_open, store_address, store_cep, fixed_delivery_fee)
VALUES ('global', 30, 10, true, 'Rua das Flores, 123 - Centro', '65000-000', 5.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO categories (name) VALUES 
('Lanches'), ('Bebidas'), ('Porções'), ('Combos'), ('Sobremesas'), ('Adicionais')
ON CONFLICT (name) DO NOTHING;

-- 4. Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE neighborhoods ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- 5. Policies
-- Categories: Read Public, Write Admin
CREATE POLICY "Public categories read" ON categories FOR SELECT USING (true);
CREATE POLICY "Admin categories write" ON categories FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Products: Read Public, Write Admin
CREATE POLICY "Public products read" ON products FOR SELECT USING (available = true OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admin products write" ON products FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Orders: Create Public, Read Own or Admin, Update Admin
CREATE POLICY "Public orders create" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Users read own orders" ON orders FOR SELECT USING (
    auth.uid() = user_id OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin orders update" ON orders FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Order Items: Create Public, Read Own/Admin
CREATE POLICY "Public order_items create" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Users read own order_items" ON order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE id = order_id AND (user_id = auth.uid() OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')))
);

-- Settings: Read Public, Write Admin
CREATE POLICY "Public settings read" ON system_settings FOR SELECT USING (true);
CREATE POLICY "Admin settings write" ON system_settings FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Neighborhoods: Read Public, Write Admin
CREATE POLICY "Public neighborhoods read" ON neighborhoods FOR SELECT USING (true);
CREATE POLICY "Admin neighborhoods write" ON neighborhoods FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- User Roles: Read Own/Admin, Write Admin (Manual)
CREATE POLICY "Users read own role" ON user_roles FOR SELECT USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- 10. Auto-Admin Trigger (Opcional: Torna admin@talita.com admin automaticamente no cadastro)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  IF NEW.email = 'admin@talita.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'customer');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
