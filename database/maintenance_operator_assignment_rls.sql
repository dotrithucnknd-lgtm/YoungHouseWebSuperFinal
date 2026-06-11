-- Phân quyền maintenance: Operator xem/phân việc toàn bộ, Staff chỉ xem việc được giao

DROP POLICY IF EXISTS maintenance_operator_select_policy ON public.maintenance_tickets;
DROP POLICY IF EXISTS maintenance_operator_update_policy ON public.maintenance_tickets;
DROP POLICY IF EXISTS maintenance_staff_select_policy ON public.maintenance_tickets;
DROP POLICY IF EXISTS maintenance_staff_update_policy ON public.maintenance_tickets;

-- Operator: xem & cập nhật phiếu của nhà trọ mình sở hữu
CREATE POLICY maintenance_operator_select_policy ON public.maintenance_tickets
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      JOIN public.rooms r ON r.id = maintenance_tickets.room_id
      WHERE p.id = auth.uid()
        AND p.role = 'operator'
        AND r.owner_id = auth.uid()
    )
  );

CREATE POLICY maintenance_operator_update_policy ON public.maintenance_tickets
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      JOIN public.rooms r ON r.id = maintenance_tickets.room_id
      WHERE p.id = auth.uid()
        AND p.role = 'operator'
        AND r.owner_id = auth.uid()
    )
  );

-- Staff: chỉ xem & cập nhật phiếu đã được phân công cho mình
CREATE POLICY maintenance_staff_select_policy ON public.maintenance_tickets
  FOR SELECT TO authenticated
  USING (
    assigned_to = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'staff'
    )
  );

CREATE POLICY maintenance_staff_update_policy ON public.maintenance_tickets
  FOR UPDATE TO authenticated
  USING (
    assigned_to = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'staff'
    )
  );

NOTIFY pgrst, 'reload schema';
