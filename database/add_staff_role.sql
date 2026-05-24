-- =========================================================================
-- ADD STAFF ROLE & UPDATE RLS POLICIES FOR MAINTENANCE TICKETS
-- Description: Alters the check constraint on profiles to include 'staff',
--              and updates RLS policies on public.maintenance_tickets
--              so that staff members can view and update tickets.
-- =========================================================================

-- 1. Alter public.profiles role check constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (
  role = ANY (ARRAY[
    'admin'::text,      -- Quản trị hệ thống
    'manager'::text,    -- Giám đốc/Chị Nhường
    'sales'::text,      -- Nhân viên kinh doanh / CTV
    'operator'::text,   -- Nhân viên kỹ thuật / Vận hành
    'staff'::text,      -- Nhân viên kỹ thuật / Sửa chữa (Kỹ thuật viên)
    'tenant'::text,     -- Khách thuê trọ
    'user'::text        -- Khách vãng lai / Đăng ký mới
  ])
);

-- 2. Update profiles select policy to allow staff to select other profiles
-- So staff can see who reported the ticket and who assigned it.
-- Drop old policy if exists
DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;

CREATE POLICY "profiles_select_all" ON public.profiles
  FOR SELECT TO authenticated
  USING (true);

-- 3. Update maintenance_tickets RLS policies
-- Drop old operator maintenance policies
DROP POLICY IF EXISTS maintenance_operator_select_policy ON public.maintenance_tickets;
DROP POLICY IF EXISTS maintenance_operator_update_policy ON public.maintenance_tickets;

-- Create new policies supporting both 'operator' and 'staff'
CREATE POLICY maintenance_operator_select_policy ON public.maintenance_tickets
  FOR SELECT TO authenticated
  USING (
    assigned_to = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('operator', 'staff')
    )
  );

CREATE POLICY maintenance_operator_update_policy ON public.maintenance_tickets
  FOR UPDATE TO authenticated
  USING (
    assigned_to = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('operator', 'staff')
    )
  );

-- Also allow admin/manager to do everything on maintenance_tickets
DROP POLICY IF EXISTS maintenance_admin_policy ON public.maintenance_tickets;
CREATE POLICY maintenance_admin_policy ON public.maintenance_tickets
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Reload schema cache to ensure changes take effect immediately
NOTIFY pgrst, 'reload schema';
