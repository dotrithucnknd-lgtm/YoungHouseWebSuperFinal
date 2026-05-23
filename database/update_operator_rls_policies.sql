-- =========================================================================
-- UPDATE OPERATOR RLS POLICIES & STORAGE BUCKETS FOR YOUNGHOUSE PMS
-- Description: Drops existing restrictive RLS policies and re-creates them to
--              fully support the 'operator' role. Also automatically creates
--              the 'room-images' and 'contract-images' storage buckets in
--              Supabase and sets up their RLS upload/read policies.
-- =========================================================================

-- 1. Update public.rooms policy to include 'operator'
DROP POLICY IF EXISTS rooms_manage_staff ON public.rooms;
CREATE POLICY rooms_manage_staff ON public.rooms
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'sales', 'operator')
    )
  );

-- 2. Update room subrelations policies (Images, Amenities, Surroundings, Targets, Universities, Video Reviews)
-- room_images
DROP POLICY IF EXISTS room_sub_manage_staff ON public.room_images;
CREATE POLICY room_sub_manage_staff ON public.room_images
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager', 'sales', 'operator')));

-- room_amenities
DROP POLICY IF EXISTS room_sub_manage_staff ON public.room_amenities;
CREATE POLICY room_sub_manage_staff ON public.room_amenities
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager', 'sales', 'operator')));

-- room_surroundings
DROP POLICY IF EXISTS room_sub_manage_staff ON public.room_surroundings;
CREATE POLICY room_sub_manage_staff ON public.room_surroundings
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager', 'sales', 'operator')));

-- room_targets
DROP POLICY IF EXISTS room_sub_manage_staff ON public.room_targets;
CREATE POLICY room_sub_manage_staff ON public.room_targets
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager', 'sales', 'operator')));

-- room_universities
DROP POLICY IF EXISTS room_sub_manage_staff ON public.room_universities;
CREATE POLICY room_sub_manage_staff ON public.room_universities
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager', 'sales', 'operator')));

-- room_video_reviews
DROP POLICY IF EXISTS room_sub_manage_staff ON public.room_video_reviews;
CREATE POLICY room_sub_manage_staff ON public.room_video_reviews
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager', 'sales', 'operator')));

-- 3. Update room_units policy
DROP POLICY IF EXISTS units_manage_admin ON public.room_units;
CREATE POLICY units_manage_admin ON public.room_units
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager', 'operator')));

-- 4. Update contracts policy
DROP POLICY IF EXISTS contracts_manage_admin ON public.contracts;
CREATE POLICY contracts_manage_admin ON public.contracts
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager', 'operator')));

-- 5. Update services policy
DROP POLICY IF EXISTS services_manage_admin ON public.services;
CREATE POLICY services_manage_admin ON public.services
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager', 'operator')));

DROP POLICY IF EXISTS services_manage_admin ON public.unit_services;
CREATE POLICY services_manage_admin ON public.unit_services
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager', 'operator')));


-- =========================================================================
-- 6. STORAGE BUCKETS & STORAGE POLICIES CREATION
-- =========================================================================

-- Create room-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'room-images', 
  'room-images', 
  true, 
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create contract-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'contract-images', 
  'contract-images', 
  true, 
  15728640, -- 15MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for 'room-images' bucket
-- Allow public read access to all objects in 'room-images'
DROP POLICY IF EXISTS "Public Access to room-images" ON storage.objects;
CREATE POLICY "Public Access to room-images" ON storage.objects
  FOR SELECT USING (bucket_id = 'room-images');

-- Allow authenticated managers, admins, sales, operators to insert/upload objects into 'room-images'
DROP POLICY IF EXISTS "Manage room-images for staff" ON storage.objects;
CREATE POLICY "Manage room-images for staff" ON storage.objects
  FOR ALL TO authenticated
  USING (
    bucket_id = 'room-images' AND 
    (EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'sales', 'operator')
    ))
  )
  WITH CHECK (
    bucket_id = 'room-images' AND 
    (EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'sales', 'operator')
    ))
  );

-- Storage Policies for 'contract-images' bucket
-- Allow public read access to all objects in 'contract-images'
DROP POLICY IF EXISTS "Public Access to contract-images" ON storage.objects;
CREATE POLICY "Public Access to contract-images" ON storage.objects
  FOR SELECT USING (bucket_id = 'contract-images');

-- Allow authenticated managers, admins, sales, operators to insert/upload/delete objects in 'contract-images'
DROP POLICY IF EXISTS "Manage contract-images for staff" ON storage.objects;
CREATE POLICY "Manage contract-images for staff" ON storage.objects
  FOR ALL TO authenticated
  USING (
    bucket_id = 'contract-images' AND 
    (EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'sales', 'operator')
    ))
  )
  WITH CHECK (
    bucket_id = 'contract-images' AND 
    (EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'sales', 'operator')
    ))
  );
