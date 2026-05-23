-- ============================================================
-- MIGRATION: Hoàn thiện bảng contracts và các bảng liên quan
-- Chạy trong Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Thêm TẤT CẢ các cột cần thiết vào bảng contracts
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES profiles(id);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS room_id UUID REFERENCES rooms(id);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS contract_code TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS actual_end_date DATE;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS rent_price NUMERIC DEFAULT 0;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS deposit NUMERIC DEFAULT 0;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS beds INTEGER DEFAULT 1;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS payment_cycle TEXT DEFAULT '1_month';
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS utilities_included BOOLEAN DEFAULT false;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS electric_start_index NUMERIC DEFAULT 0;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS electric_price NUMERIC DEFAULT 0;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS electric_pricing_type TEXT DEFAULT 'per_index';
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS water_start_index NUMERIC DEFAULT 0;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS water_price NUMERIC DEFAULT 0;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS water_pricing_type TEXT DEFAULT 'per_index';
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS meter_photo TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Cập nhật owner_id từ rooms cho các record cũ (nếu có room_id)
UPDATE contracts 
SET owner_id = rooms.owner_id 
FROM rooms 
WHERE contracts.room_id IS NOT NULL 
  AND contracts.room_id = rooms.id 
  AND contracts.owner_id IS NULL;

-- 3. Tạo bảng contract_tenants
CREATE TABLE IF NOT EXISTS contract_tenants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE NOT NULL,
  tenant_id UUID NOT NULL,
  is_representative BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tạo bảng contract_services
CREATE TABLE IF NOT EXISTS contract_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE NOT NULL,
  service_name TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  unit TEXT DEFAULT 'month',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Bật RLS
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_services ENABLE ROW LEVEL SECURITY;

-- 6. Xóa policies cũ nếu có
DROP POLICY IF EXISTS "Owners manage own contracts" ON contracts;
DROP POLICY IF EXISTS "Owners manage contract tenants" ON contract_tenants;
DROP POLICY IF EXISTS "Owners manage contract services" ON contract_services;

-- 7. Tạo RLS policies
CREATE POLICY "Owners manage own contracts" ON contracts
  FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Owners manage contract tenants" ON contract_tenants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM contracts 
      WHERE contracts.id = contract_tenants.contract_id 
        AND contracts.owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners manage contract services" ON contract_services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM contracts 
      WHERE contracts.id = contract_services.contract_id 
        AND contracts.owner_id = auth.uid()
    )
  );

-- 8. Thêm cột cho profiles (phần Cài đặt)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS province TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS district TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar TEXT;

-- 9. RLS cho profiles
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can read profiles" ON profiles;
CREATE POLICY "Users can read profiles" ON profiles
  FOR SELECT USING (true);

-- ============================================================
-- DONE!
-- ============================================================


-- ============================================================
-- ROOM UNITS: Thêm các cột mới cho bảng room_units
-- ============================================================

ALTER TABLE room_units ADD COLUMN IF NOT EXISTS rent_price NUMERIC;
ALTER TABLE room_units ADD COLUMN IF NOT EXISTS deposit NUMERIC;
ALTER TABLE room_units ADD COLUMN IF NOT EXISTS area NUMERIC;
ALTER TABLE room_units ADD COLUMN IF NOT EXISTS max_occupants INTEGER;
ALTER TABLE room_units ADD COLUMN IF NOT EXISTS beds INTEGER DEFAULT 1;
ALTER TABLE room_units ADD COLUMN IF NOT EXISTS payment_cycle TEXT DEFAULT '1_month';

-- Bảng liên kết dịch vụ - phòng
CREATE TABLE IF NOT EXISTS room_unit_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_unit_id UUID REFERENCES room_units(id) ON DELETE CASCADE NOT NULL,
  service_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE room_unit_services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Owners manage room unit services" ON room_unit_services;
CREATE POLICY "Owners manage room unit services" ON room_unit_services
  FOR ALL USING (true);
