-- =========================================================================
-- UPDATE SERVICES & UNIT_SERVICES RLS POLICIES FOR OPERATOR ROLE
-- Description: Drops all outdated or conflicting policies on the services
--              and unit_services tables (especially any referencing 'price'
--              instead of 'unit_price') and establishes clean, modern, and
--              robust policies for Admin, Manager, and Operator roles.
--              Finally, forces a PostgREST schema cache reload.
-- =========================================================================

-- 1. Ensure Row Level Security is enabled
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unit_services ENABLE ROW LEVEL SECURITY;

-- 2. Drop all historical/potentially conflicting policies on public.services
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

-- 3. Create fresh, unified policies on public.services
-- Allow all authenticated users to read services (needed for invoices, room details, etc.)
CREATE POLICY "services_select_policy" ON public.services
  FOR SELECT TO authenticated
  USING (true);

-- Allow Admins, Managers, and Operators to manage services (Insert, Update, Delete)
CREATE POLICY "services_manage_policy" ON public.services
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'operator')
    )
  );

-- 4. Drop all historical/potentially conflicting policies on public.unit_services
DROP POLICY IF EXISTS "services_manage_admin" ON public.unit_services;
DROP POLICY IF EXISTS "services_select_all" ON public.unit_services;
DROP POLICY IF EXISTS "Owners can view unit services" ON public.unit_services;
DROP POLICY IF EXISTS "Owners can insert unit services" ON public.unit_services;
DROP POLICY IF EXISTS "Owners can delete unit services" ON public.unit_services;
DROP POLICY IF EXISTS "Admins can do everything on unit_services" ON public.unit_services;
DROP POLICY IF EXISTS "Operators can manage unit services" ON public.unit_services;

-- 5. Create fresh, unified policies on public.unit_services
-- Allow all authenticated users to read room unit services
CREATE POLICY "unit_services_select_policy" ON public.unit_services
  FOR SELECT TO authenticated
  USING (true);

-- Allow Admins, Managers, and Operators to manage room unit services
CREATE POLICY "unit_services_manage_policy" ON public.unit_services
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'operator')
    )
  );

-- 6. Reload PostgREST schema cache to apply changes instantly
NOTIFY pgrst, 'reload schema';
