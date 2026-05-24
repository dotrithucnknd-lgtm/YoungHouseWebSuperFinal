-- 1. Update rooms table policy to include 'staff'
DROP POLICY IF EXISTS rooms_manage_staff ON public.rooms;
CREATE POLICY rooms_manage_staff ON public.rooms
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'sales', 'operator', 'staff')
    )
  );

-- 2. Update room_units select policy to include 'staff'
DROP POLICY IF EXISTS units_select_policy ON public.room_units;
CREATE POLICY units_select_policy ON public.room_units
  FOR SELECT TO authenticated
  USING (
    current_renter_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'sales', 'operator', 'staff')
    )
  );

-- 3. Update notifications select policy to include 'staff' and 'operator' for 'owners' audience
DROP POLICY IF EXISTS notifications_select_audience ON public.notifications;
CREATE POLICY notifications_select_audience ON public.notifications
  FOR SELECT TO authenticated
  USING (
    target_audience = 'all' OR
    (target_audience = 'renters' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'tenant')) OR
    (target_audience = 'owners' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('manager', 'operator', 'staff', 'sales'))) OR
    (target_audience = 'admins' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  );

-- 4. Re-declare profiles check constraint just in case
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (
  role = ANY (ARRAY[
    'admin'::text,
    'manager'::text,
    'sales'::text,
    'operator'::text,
    'staff'::text,
    'tenant'::text,
    'user'::text
  ])
);

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
