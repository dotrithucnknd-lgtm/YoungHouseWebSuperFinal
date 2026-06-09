-- =========================================================================
-- FIX_ALL_RLS_OPERATOR.sql  (idempotent – safe to run multiple times)
-- Chạy file này trong Supabase Dashboard > SQL Editor
-- =========================================================================

-- =========================================================================
-- 1. ENABLE RLS
-- =========================================================================
ALTER TABLE public.profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_units         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_images        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_amenities     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_universities  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_surroundings  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_targets       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_video_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amenities          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.universities       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surroundings       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.targets            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unit_services      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_tenants   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedbacks          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts         ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- 2. PROFILES role constraint
-- =========================================================================
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (
  role = ANY (ARRAY[
    'admin'::text, 'manager'::text, 'sales'::text,
    'operator'::text, 'staff'::text, 'tenant'::text, 'user'::text
  ])
);

-- =========================================================================
-- 3. PROFILES policies
-- =========================================================================
DROP POLICY IF EXISTS "profiles_select_all"                         ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_self"                        ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_all"                          ON public.profiles;
DROP POLICY IF EXISTS "Allow users to view their own profile"       ON public.profiles;

-- Mọi user đã đăng nhập đều xem được profile (cần cho join queries)
CREATE POLICY "profiles_select_all" ON public.profiles
  FOR SELECT TO authenticated USING (true);

-- Mỗi user chỉ cập nhật profile của chính mình
CREATE POLICY "profiles_update_self" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- KHÔNG tạo profiles_admin_all vì nó gây đệ quy vô hạn (self-referential policy)
-- Admin/manager update profile người khác phải qua API route (service role)

-- =========================================================================
-- 4. ROOMS
-- =========================================================================
DROP POLICY IF EXISTS rooms_select_public                           ON public.rooms;
DROP POLICY IF EXISTS rooms_manage_staff                            ON public.rooms;
DROP POLICY IF EXISTS "Allow authenticated users to view buildings" ON public.rooms;

CREATE POLICY rooms_select_public ON public.rooms
  FOR SELECT USING (true);

CREATE POLICY rooms_manage_staff ON public.rooms
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','manager','sales','operator')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','manager','sales','operator')));

-- =========================================================================
-- 5. ROOM sub-tables (images, amenities, universities, video_reviews, surroundings, targets)
-- =========================================================================
DROP POLICY IF EXISTS room_sub_select_all   ON public.room_images;
DROP POLICY IF EXISTS room_sub_manage_staff ON public.room_images;
DROP POLICY IF EXISTS room_sub_select_all   ON public.room_amenities;
DROP POLICY IF EXISTS room_sub_manage_staff ON public.room_amenities;
DROP POLICY IF EXISTS room_sub_select_all   ON public.room_universities;
DROP POLICY IF EXISTS room_sub_manage_staff ON public.room_universities;
DROP POLICY IF EXISTS room_sub_select_all   ON public.room_video_reviews;
DROP POLICY IF EXISTS room_sub_manage_staff ON public.room_video_reviews;
DROP POLICY IF EXISTS room_sub_select_all   ON public.room_surroundings;
DROP POLICY IF EXISTS room_sub_manage_staff ON public.room_surroundings;
DROP POLICY IF EXISTS room_sub_select_all   ON public.room_targets;
DROP POLICY IF EXISTS room_sub_manage_staff ON public.room_targets;

CREATE POLICY room_sub_select_all ON public.room_images       FOR SELECT USING (true);
CREATE POLICY room_sub_select_all ON public.room_amenities    FOR SELECT USING (true);
CREATE POLICY room_sub_select_all ON public.room_universities FOR SELECT USING (true);
CREATE POLICY room_sub_select_all ON public.room_video_reviews FOR SELECT USING (true);
CREATE POLICY room_sub_select_all ON public.room_surroundings FOR SELECT USING (true);
CREATE POLICY room_sub_select_all ON public.room_targets      FOR SELECT USING (true);

CREATE POLICY room_sub_manage_staff ON public.room_images
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','manager','sales','operator')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','manager','sales','operator')));

CREATE POLICY room_sub_manage_staff ON public.room_amenities
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','manager','sales','operator')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','manager','sales','operator')));

CREATE POLICY room_sub_manage_staff ON public.room_universities
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','manager','sales','operator')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','manager','sales','operator')));

CREATE POLICY room_sub_manage_staff ON public.room_video_reviews
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','manager','sales','operator')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','manager','sales','operator')));

CREATE POLICY room_sub_manage_staff ON public.room_surroundings
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','manager','sales','operator')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','manager','sales','operator')));

CREATE POLICY room_sub_manage_staff ON public.room_targets
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','manager','sales','operator')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','manager','sales','operator')));

-- =========================================================================
-- 6. ROOM_UNITS
-- =========================================================================
DROP POLICY IF EXISTS units_select_policy ON public.room_units;
DROP POLICY IF EXISTS units_manage_admin  ON public.room_units;
DROP POLICY IF EXISTS "Allow tenants to view their linked room unit" ON public.room_units;

CREATE POLICY units_select_policy ON public.room_units
  FOR SELECT TO authenticated
  USING (
    current_renter_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','manager','sales','operator','staff'))
  );

CREATE POLICY units_manage_admin ON public.room_units
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','manager','operator')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','manager','operator')));

-- =========================================================================
-- 7. CATEGORIES (amenities, universities, surroundings, targets)
-- =========================================================================
DROP POLICY IF EXISTS categories_select_all   ON public.amenities;
DROP POLICY IF EXISTS categories_manage_admin ON public.amenities;
DROP POLICY IF EXISTS categories_select_all   ON public.universities;
DROP POLICY IF EXISTS categories_manage_admin ON public.universities;
DROP POLICY IF EXISTS categories_select_all   ON public.surroundings;
DROP POLICY IF EXISTS categories_manage_admin ON public.surroundings;
DROP POLICY IF EXISTS categories_select_all   ON public.targets;
DROP POLICY IF EXISTS categories_manage_admin ON public.targets;

CREATE POLICY categories_select_all ON public.amenities    FOR SELECT USING (true);
CREATE POLICY categories_select_all ON public.universities FOR SELECT USING (true);
CREATE POLICY categories_select_all ON public.surroundings FOR SELECT USING (true);
CREATE POLICY categories_select_all ON public.targets      FOR SELECT USING (true);

CREATE POLICY categories_manage_admin ON public.amenities
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','manager')));
CREATE POLICY categories_manage_admin ON public.universities
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','manager')));
CREATE POLICY categories_manage_admin ON public.surroundings
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','manager')));
CREATE POLICY categories_manage_admin ON public.targets
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','manager')));

-- =========================================================================
-- 8. SERVICES & UNIT_SERVICES
-- =========================================================================
DROP POLICY IF EXISTS services_select_all             ON public.services;
DROP POLICY IF EXISTS services_manage_admin           ON public.services;
DROP POLICY IF EXISTS "services_select_policy"        ON public.services;
DROP POLICY IF EXISTS "services_manage_policy"        ON public.services;
DROP POLICY IF EXISTS "Allow authenticated to view services" ON public.services;
DROP POLICY IF EXISTS services_select_all             ON public.unit_services;
DROP POLICY IF EXISTS services_manage_admin           ON public.unit_services;
DROP POLICY IF EXISTS "unit_services_select_policy"   ON public.unit_services;
DROP POLICY IF EXISTS "unit_services_manage_policy"   ON public.unit_services;
DROP POLICY IF EXISTS unit_services_select_all        ON public.unit_services;
DROP POLICY IF EXISTS unit_services_manage_policy     ON public.unit_services;
DROP POLICY IF EXISTS services_manage_policy          ON public.services;

CREATE POLICY services_select_all ON public.services
  FOR SELECT TO authenticated USING (true);

CREATE POLICY services_manage_policy ON public.services
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','manager','operator')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','manager','operator')));

CREATE POLICY unit_services_select_all ON public.unit_services
  FOR SELECT TO authenticated USING (true);

CREATE POLICY unit_services_manage_policy ON public.unit_services
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','manager','operator')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','manager','operator')));

-- =========================================================================
-- 9. CONTRACTS & CONTRACT_TENANTS
-- =========================================================================
DROP POLICY IF EXISTS contracts_select_tenant           ON public.contracts;
DROP POLICY IF EXISTS contracts_tenant_select           ON public.contracts;
DROP POLICY IF EXISTS contracts_manage_admin            ON public.contracts;
DROP POLICY IF EXISTS "Allow tenants to view their contracts" ON public.contracts;
DROP POLICY IF EXISTS contract_tenants_select           ON public.contract_tenants;
DROP POLICY IF EXISTS contract_tenants_manage           ON public.contract_tenants;

CREATE POLICY contracts_tenant_select ON public.contracts
  FOR SELECT TO authenticated
  USING (
    renter_id = auth.uid() OR
    room_unit_id IN (SELECT id FROM public.room_units WHERE current_renter_id = auth.uid())
  );

CREATE POLICY contracts_manage_admin ON public.contracts
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','manager','operator')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','manager','operator')));

CREATE POLICY contract_tenants_select ON public.contract_tenants
  FOR SELECT TO authenticated USING (true);

CREATE POLICY contract_tenants_manage ON public.contract_tenants
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','manager','operator')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','manager','operator')));

-- =========================================================================
-- 10. INVOICES & INVOICE_ITEMS
-- =========================================================================
DROP POLICY IF EXISTS invoices_tenant_select             ON public.invoices;
DROP POLICY IF EXISTS invoices_manage_admin              ON public.invoices;
DROP POLICY IF EXISTS "Allow tenants to view their invoices" ON public.invoices;
DROP POLICY IF EXISTS invoice_items_tenant_select        ON public.invoice_items;
DROP POLICY IF EXISTS invoice_items_manage               ON public.invoice_items;
DROP POLICY IF EXISTS "Allow tenants to view their invoice items" ON public.invoice_items;

CREATE POLICY invoices_tenant_select ON public.invoices
  FOR SELECT TO authenticated
  USING (room_unit_id IN (SELECT id FROM public.room_units WHERE current_renter_id = auth.uid()));

CREATE POLICY invoices_manage_admin ON public.invoices
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','manager','operator')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','manager','operator')));

CREATE POLICY invoice_items_tenant_select ON public.invoice_items
  FOR SELECT TO authenticated
  USING (invoice_id IN (
    SELECT id FROM public.invoices
    WHERE room_unit_id IN (SELECT id FROM public.room_units WHERE current_renter_id = auth.uid())
  ));

CREATE POLICY invoice_items_manage ON public.invoice_items
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','manager','operator')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','manager','operator')));

-- =========================================================================
-- 11. TENANT_PROFILES
-- =========================================================================
DROP POLICY IF EXISTS tenant_profiles_self          ON public.tenant_profiles;
DROP POLICY IF EXISTS tenant_profiles_admin         ON public.tenant_profiles;
DROP POLICY IF EXISTS tenant_profiles_staff_select  ON public.tenant_profiles;
DROP POLICY IF EXISTS tenant_profiles_admin_manage  ON public.tenant_profiles;

CREATE POLICY tenant_profiles_self ON public.tenant_profiles
  FOR ALL TO authenticated
  USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid());

CREATE POLICY tenant_profiles_staff_select ON public.tenant_profiles
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','manager','operator','sales')));

CREATE POLICY tenant_profiles_admin_manage ON public.tenant_profiles
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','manager')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','manager')));

-- =========================================================================
-- 12. MAINTENANCE_TICKETS
-- =========================================================================
DROP POLICY IF EXISTS maintenance_tenant_policy            ON public.maintenance_tickets;
DROP POLICY IF EXISTS maintenance_operator_select_policy   ON public.maintenance_tickets;
DROP POLICY IF EXISTS maintenance_operator_update_policy   ON public.maintenance_tickets;
DROP POLICY IF EXISTS maintenance_admin_policy             ON public.maintenance_tickets;
DROP POLICY IF EXISTS "Allow tenants to insert maintenance tickets"         ON public.maintenance_tickets;
DROP POLICY IF EXISTS "Allow tenants to view their own maintenance tickets" ON public.maintenance_tickets;

CREATE POLICY maintenance_tenant_policy ON public.maintenance_tickets
  FOR ALL TO authenticated
  USING (tenant_id = auth.uid()) WITH CHECK (tenant_id = auth.uid());

CREATE POLICY maintenance_operator_select_policy ON public.maintenance_tickets
  FOR SELECT TO authenticated
  USING (
    assigned_to = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('operator','staff','admin','manager'))
  );

CREATE POLICY maintenance_operator_update_policy ON public.maintenance_tickets
  FOR UPDATE TO authenticated
  USING (
    assigned_to = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('operator','staff','admin','manager'))
  );

CREATE POLICY maintenance_admin_policy ON public.maintenance_tickets
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','manager')));

-- =========================================================================
-- 13. NOTIFICATIONS
-- =========================================================================
DROP POLICY IF EXISTS notifications_select_audience ON public.notifications;
DROP POLICY IF EXISTS notifications_manage_admin    ON public.notifications;

CREATE POLICY notifications_select_audience ON public.notifications
  FOR SELECT TO authenticated
  USING (
    target_audience = 'all' OR
    (target_audience = 'renters' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'tenant')) OR
    (target_audience = 'owners'  AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('operator','manager','admin'))) OR
    (target_audience = 'admins'  AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','manager')))
  );

CREATE POLICY notifications_manage_admin ON public.notifications
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','manager','operator')));

-- =========================================================================
-- 14. FAVORITES & FEEDBACKS
-- =========================================================================
DROP POLICY IF EXISTS favorites_self          ON public.favorites;
DROP POLICY IF EXISTS feedbacks_select_public ON public.feedbacks;
DROP POLICY IF EXISTS feedbacks_self          ON public.feedbacks;

CREATE POLICY feedbacks_select_public ON public.feedbacks FOR SELECT USING (true);
CREATE POLICY favorites_self ON public.favorites
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY feedbacks_self ON public.feedbacks
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- =========================================================================
-- 15. BOOKINGS
-- =========================================================================
DROP POLICY IF EXISTS bookings_tenant_select_policy ON public.bookings;
DROP POLICY IF EXISTS bookings_tenant_insert_policy ON public.bookings;
DROP POLICY IF EXISTS bookings_staff_policy         ON public.bookings;

CREATE POLICY bookings_tenant_select_policy ON public.bookings
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY bookings_tenant_insert_policy ON public.bookings
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY bookings_staff_policy ON public.bookings
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','manager','sales','operator')));

-- =========================================================================
-- 16. BLOG_POSTS
-- =========================================================================
DROP POLICY IF EXISTS blog_select_public ON public.blog_posts;
DROP POLICY IF EXISTS blog_manage_admin  ON public.blog_posts;

CREATE POLICY blog_select_public ON public.blog_posts FOR SELECT USING (published = true);
CREATE POLICY blog_manage_admin ON public.blog_posts
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','manager')));

-- =========================================================================
-- 17. NEARBY_PLACES (tạo bảng nếu chưa có)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.nearby_places (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id     uuid NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  name        text NOT NULL,
  category    text DEFAULT 'other',
  distance_km numeric(5,2),
  description text,
  created_at  timestamp DEFAULT now()
);
ALTER TABLE public.nearby_places ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS nearby_select_all   ON public.nearby_places;
DROP POLICY IF EXISTS nearby_manage_staff ON public.nearby_places;

CREATE POLICY nearby_select_all ON public.nearby_places FOR SELECT USING (true);
CREATE POLICY nearby_manage_staff ON public.nearby_places
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','manager','sales','operator')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','manager','sales','operator')));

-- =========================================================================
-- 18. STORAGE POLICIES (objects table)
-- =========================================================================
DROP POLICY IF EXISTS "Public Access to room-images"      ON storage.objects;
DROP POLICY IF EXISTS "Manage room-images for staff"      ON storage.objects;
DROP POLICY IF EXISTS "Public Access to contract-images"  ON storage.objects;
DROP POLICY IF EXISTS "Manage contract-images for staff"  ON storage.objects;
DROP POLICY IF EXISTS "Public Access to avatars"          ON storage.objects;
DROP POLICY IF EXISTS "Users manage own avatars"          ON storage.objects;
DROP POLICY IF EXISTS "Staff Access to id-cards"          ON storage.objects;

CREATE POLICY "Public Access to room-images" ON storage.objects
  FOR SELECT USING (bucket_id = 'room-images');

CREATE POLICY "Manage room-images for staff" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'room-images' AND EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','manager','sales','operator')
  ))
  WITH CHECK (bucket_id = 'room-images' AND EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','manager','sales','operator')
  ));

CREATE POLICY "Public Access to contract-images" ON storage.objects
  FOR SELECT USING (bucket_id = 'contract-images');

CREATE POLICY "Manage contract-images for staff" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'contract-images' AND EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','manager','sales','operator')
  ))
  WITH CHECK (bucket_id = 'contract-images' AND EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','manager','sales','operator')
  ));

CREATE POLICY "Public Access to avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users manage own avatars" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'avatars') WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Staff Access to id-cards" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'id-cards' AND EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','manager','operator','tenant')
  ))
  WITH CHECK (bucket_id = 'id-cards' AND EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','manager','operator','tenant')
  ));

-- =========================================================================
-- 19. RELOAD POSTGREST SCHEMA CACHE
-- =========================================================================
NOTIFY pgrst, 'reload schema';
