-- =========================================================================
-- MASTER PATCH: FIX SCHEMA COLUMNS & RELOAD POSTGREST CACHE
-- Description: Ensures all required columns in room_units and contracts
--              are present, creates link tables, establishes clean, unified
--              RLS policies, and forces PostgREST to reload its schema cache.
-- =========================================================================

-- ---------------------------------------------------------
-- 1. ENSURE ROOM_UNITS HAS ALL MODERN COLUMNS
-- ---------------------------------------------------------
ALTER TABLE public.room_units ADD COLUMN IF NOT EXISTS rent_price NUMERIC;
ALTER TABLE public.room_units ADD COLUMN IF NOT EXISTS deposit NUMERIC;
ALTER TABLE public.room_units ADD COLUMN IF NOT EXISTS area NUMERIC;
ALTER TABLE public.room_units ADD COLUMN IF NOT EXISTS max_occupants INTEGER;
ALTER TABLE public.room_units ADD COLUMN IF NOT EXISTS beds INTEGER DEFAULT 1;
ALTER TABLE public.room_units ADD COLUMN IF NOT EXISTS payment_cycle TEXT DEFAULT '1_month';
ALTER TABLE public.room_units ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- ---------------------------------------------------------
-- 2. ENSURE CONTRACTS HAS ALL MODERN COLUMNS
-- ---------------------------------------------------------
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES public.profiles(id);
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS room_id UUID REFERENCES public.rooms(id);
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS contract_code TEXT;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS actual_end_date DATE;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS rent_price NUMERIC DEFAULT 0;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS deposit NUMERIC DEFAULT 0;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS beds INTEGER DEFAULT 1;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS payment_cycle TEXT DEFAULT '1_month';
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS utilities_included BOOLEAN DEFAULT false;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS electric_start_index NUMERIC DEFAULT 0;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS electric_price NUMERIC DEFAULT 0;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS electric_pricing_type TEXT DEFAULT 'per_index';
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS water_start_index NUMERIC DEFAULT 0;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS water_price NUMERIC DEFAULT 0;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS water_pricing_type TEXT DEFAULT 'per_index';
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS meter_photo TEXT;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS notes TEXT;

-- 2.5 ENSURE TENANT_PROFILES HAS ALL MODERN COLUMNS
ALTER TABLE public.tenant_profiles ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.tenant_profiles ADD COLUMN IF NOT EXISTS id_card_issue_date DATE;
ALTER TABLE public.tenant_profiles ADD COLUMN IF NOT EXISTS id_card_issue_place TEXT;

-- ---------------------------------------------------------
-- 3. ENSURE DEPENDENT RELATION TABLES ARE CREATED
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.room_unit_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_unit_id UUID REFERENCES public.room_units(id) ON DELETE CASCADE NOT NULL,
  service_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.contract_tenants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE NOT NULL,
  tenant_id UUID NOT NULL,
  is_representative BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.contract_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE NOT NULL,
  service_name TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  unit TEXT DEFAULT 'month',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CREATE INVOICES AND INVOICE_ITEMS TABLES
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_unit_id UUID REFERENCES public.room_units(id) ON DELETE CASCADE NOT NULL,
  contract_id UUID REFERENCES public.contracts(id) ON DELETE SET NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'unpaid'::text CHECK (status IN ('unpaid', 'paid', 'overdue')),
  due_date DATE,
  paid_at TIMESTAMPTZ,
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.invoice_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE NOT NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  old_index NUMERIC,
  new_index NUMERIC,
  usage NUMERIC,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  amount NUMERIC NOT NULL DEFAULT 0
);

-- Enable RLS on newly created tables
ALTER TABLE public.room_unit_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_services ENABLE ROW LEVEL SECURITY;

-- Disable RLS on invoices to avoid write authorization issues
ALTER TABLE public.invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items DISABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------
-- 3.5 CLEAN AND UPDATE PROFILES RLS POLICIES
-- ---------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Helper function to prevent infinite recursion on profiles policies
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$;

-- Drop standard/conflicting profiles policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_manage_staff" ON public.profiles;
DROP POLICY IF EXISTS "profiles_self_update" ON public.profiles;

-- Read policy: public can view all profiles
CREATE POLICY "profiles_select_all" ON public.profiles
  FOR SELECT TO authenticated
  USING (true);

-- Manage policy: Admin, Manager, and Operator can manage all profiles
CREATE POLICY "profiles_manage_staff" ON public.profiles
  FOR ALL TO authenticated
  USING (
    public.get_user_role(auth.uid()) IN ('admin', 'manager', 'operator')
  )
  WITH CHECK (
    public.get_user_role(auth.uid()) IN ('admin', 'manager', 'operator')
  );

-- Update policy: Users can update their own profiles
CREATE POLICY "profiles_self_update" ON public.profiles
  FOR UPDATE TO authenticated
  USING (
    auth.uid() = id
  )
  WITH CHECK (
    auth.uid() = id
  );

-- ---------------------------------------------------------
-- 4. CLEAN AND UPDATE SERVICES RLS POLICIES
-- ---------------------------------------------------------
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unit_services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "services_manage_admin" ON public.services;
DROP POLICY IF EXISTS "services_select_all" ON public.services;
DROP POLICY IF EXISTS "Owners can view their services" ON public.services;
DROP POLICY IF EXISTS "Owners can create services" ON public.services;
DROP POLICY IF EXISTS "Owners can update their services" ON public.services;
DROP POLICY IF EXISTS "Owners can delete their services" ON public.services;
DROP POLICY IF EXISTS "Admins can do everything on services" ON public.services;
DROP POLICY IF EXISTS "Operators can manage services" ON public.services;
DROP POLICY IF EXISTS "Operators can view services" ON public.services;
DROP POLICY IF EXISTS "Operators can create services" ON public.services;
DROP POLICY IF EXISTS "Operators can update services" ON public.services;
DROP POLICY IF EXISTS "Operators can delete services" ON public.services;
DROP POLICY IF EXISTS "services_select_policy" ON public.services;
DROP POLICY IF EXISTS "services_manage_policy" ON public.services;

-- Read policy: all authenticated users
CREATE POLICY "services_select_policy" ON public.services
  FOR SELECT TO authenticated
  USING (true);

-- Write policy: Admin, Manager, Operator
CREATE POLICY "services_manage_policy" ON public.services
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'operator')
    )
  );

-- ---------------------------------------------------------
-- 5. CLEAN AND UPDATE UNIT_SERVICES RLS POLICIES
-- ---------------------------------------------------------
DROP POLICY IF EXISTS "services_manage_admin" ON public.unit_services;
DROP POLICY IF EXISTS "services_select_all" ON public.unit_services;
DROP POLICY IF EXISTS "Owners can view unit services" ON public.unit_services;
DROP POLICY IF EXISTS "Owners can insert unit services" ON public.unit_services;
DROP POLICY IF EXISTS "Owners can delete unit services" ON public.unit_services;
DROP POLICY IF EXISTS "Admins can do everything on unit_services" ON public.unit_services;
DROP POLICY IF EXISTS "Operators can manage unit services" ON public.unit_services;
DROP POLICY IF EXISTS "unit_services_select_policy" ON public.unit_services;
DROP POLICY IF EXISTS "unit_services_manage_policy" ON public.unit_services;

CREATE POLICY "unit_services_select_policy" ON public.unit_services
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "unit_services_manage_policy" ON public.unit_services
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'operator')
    )
  );

-- ---------------------------------------------------------
-- 6. SET UP ROOM_UNIT_SERVICES RLS POLICIES
-- ---------------------------------------------------------
DROP POLICY IF EXISTS "Owners manage room unit services" ON public.room_unit_services;
DROP POLICY IF EXISTS "Allow select for staff and tenants" ON public.room_unit_services;
DROP POLICY IF EXISTS "Allow manage for staff" ON public.room_unit_services;

CREATE POLICY "Allow select for staff and tenants" ON public.room_unit_services
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Allow manage for staff" ON public.room_unit_services
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'operator')
    )
  );

-- ---------------------------------------------------------
-- 7. FORCE POSTGREST SCHEMA CACHE RELOAD
-- ---------------------------------------------------------
NOTIFY pgrst, 'reload schema';
