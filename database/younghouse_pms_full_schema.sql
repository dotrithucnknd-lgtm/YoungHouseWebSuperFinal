-- =========================================================================
-- COMPLETE UNIFIED DATABASE SCHEMA FOR YOUNGHOUSE PMS
-- Mô tả: Kịch bản khởi tạo toàn bộ hệ thống cơ sở dữ liệu quản lý trọ tích hợp
--        phân quyền (RBAC), quản lý phòng, hold phòng, ghi chỉ số điện nước,
--        hóa đơn, bảo trì và hệ thống hoa hồng CTV.
-- Hướng dẫn: Dùng để import trực tiếp vào cơ sở dữ liệu Supabase mới khi clone dự án.
-- =========================================================================

-- Kích hoạt extension cần thiết
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- I. CÁC BẢNG DANH MỤC CƠ BẢN (CATEGORIES)
-- ==========================================

-- 1. Đại học (Universities)
CREATE TABLE public.universities (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  short_name text NOT NULL,
  description text,
  address text,
  latitude numeric,
  longitude numeric,
  image_url text,
  website_url text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT universities_pkey PRIMARY KEY (id)
);

-- 2. Tiện ích (Amenities)
CREATE TABLE public.amenities (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT amenities_pkey PRIMARY KEY (id)
);

-- 3. Môi trường xung quanh (Surroundings)
CREATE TABLE public.surroundings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT surroundings_pkey PRIMARY KEY (id)
);

-- 4. Đối tượng thuê phù hợp (Targets)
CREATE TABLE public.targets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT targets_pkey PRIMARY KEY (id)
);

-- ==========================================
-- II. HỒ SƠ NGƯỜI DÙNG & VAI TRÒ (USERS & ROLES)
-- ==========================================

-- 5. Hồ sơ tài khoản (Profiles)
-- Hỗ trợ phân quyền đầy đủ: admin, manager, sales, operator, tenant, user
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  name text NOT NULL,
  phone text,
  role text DEFAULT 'user'::text,
  dob date,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_role_check CHECK (
    role = ANY (ARRAY[
      'admin'::text,      -- Quản trị hệ thống (Toàn quyền dữ liệu & cấu hình)
      'manager'::text,    -- Giám đốc/Chị Nhường (Giám sát, xem báo cáo doanh thu & vận hành)
      'sales'::text,      -- Nhân viên kinh doanh / CTV (Tìm kiếm, hold phòng, tư vấn)
      'operator'::text,   -- Nhân viên kỹ thuật / Vận hành (Ghi điện nước, xử lý bảo trì)
      'tenant'::text,     -- Khách thuê trọ (Xem thông tin, hóa đơn, báo hỏng)
      'user'::text        -- Khách vãng lai / Đăng ký mới
    ])
  )
);

-- Bảng thông tin chi tiết của Khách thuê (Tenant Profiles)
CREATE TABLE public.tenant_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  id_card_number text,
  id_card_front_url text,
  id_card_back_url text,
  university_id uuid,
  student_id text,
  hometown text,
  emergency_contact_name text,
  emergency_contact_phone text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tenant_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT tenant_profiles_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT tenant_profiles_university_id_fkey FOREIGN KEY (university_id) REFERENCES public.universities(id) ON DELETE SET NULL
);

-- ==========================================
-- III. QUẢN LÝ NHÀ TRỌ & PHÒNG (PROPERTIES & ROOMS)
-- ==========================================

-- 6. Phòng trọ / Tòa nhà trọ (Rooms)
CREATE TABLE public.rooms (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_id uuid, -- Liên kết với chủ/quản lý trọ
  title text NOT NULL,
  description text,
  price numeric NOT NULL,
  area numeric,
  address text NOT NULL,
  city text,
  district text,
  ward text,
  status text DEFAULT 'available'::text,
  banner text,
  maps text,
  is_hot boolean NOT NULL DEFAULT false,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT rooms_pkey PRIMARY KEY (id),
  CONSTRAINT rooms_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE SET NULL,
  CONSTRAINT rooms_status_check CHECK (
    status = ANY (ARRAY[
      'available'::text,  -- Còn trống
      'rented'::text,     -- Đã cho thuê
      'held'::text,       -- Đang được giữ chỗ (Hold phòng)
      'reserved'::text,   -- Đặt cọc giữ chỗ dài hạn
      'hidden'::text      -- Tạm ẩn/Không kinh doanh
    ])
  )
);

-- 7. Các bảng liên kết thuộc tính phòng trọ (Relationships)
CREATE TABLE public.room_images (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL,
  image_url text NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT room_images_pkey PRIMARY KEY (id),
  CONSTRAINT room_images_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id) ON DELETE CASCADE
);

CREATE TABLE public.room_amenities (
  room_id uuid NOT NULL,
  amenity_id uuid NOT NULL,
  CONSTRAINT room_amenities_pkey PRIMARY KEY (room_id, amenity_id),
  CONSTRAINT room_amenities_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id) ON DELETE CASCADE,
  CONSTRAINT room_amenities_amenity_id_fkey FOREIGN KEY (amenity_id) REFERENCES public.amenities(id) ON DELETE CASCADE
);

CREATE TABLE public.room_surroundings (
  room_id uuid NOT NULL,
  surrounding_id uuid NOT NULL,
  CONSTRAINT room_surroundings_pkey PRIMARY KEY (room_id, surrounding_id),
  CONSTRAINT room_surroundings_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id) ON DELETE CASCADE,
  CONSTRAINT room_surroundings_surrounding_id_fkey FOREIGN KEY (surrounding_id) REFERENCES public.surroundings(id) ON DELETE CASCADE
);

CREATE TABLE public.room_targets (
  room_id uuid NOT NULL,
  target_id uuid NOT NULL,
  CONSTRAINT room_targets_pkey PRIMARY KEY (room_id, target_id),
  CONSTRAINT room_targets_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id) ON DELETE CASCADE,
  CONSTRAINT room_targets_target_id_fkey FOREIGN KEY (target_id) REFERENCES public.targets(id) ON DELETE CASCADE
);

CREATE TABLE public.room_universities (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL,
  university_id uuid NOT NULL,
  distance_km numeric,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT room_universities_pkey PRIMARY KEY (id),
  CONSTRAINT room_universities_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id) ON DELETE CASCADE,
  CONSTRAINT room_universities_university_id_fkey FOREIGN KEY (university_id) REFERENCES public.universities(id) ON DELETE CASCADE
);

CREATE TABLE public.room_video_reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL,
  source_url text NOT NULL,
  display_title text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT room_video_reviews_pkey PRIMARY KEY (id),
  CONSTRAINT room_video_reviews_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id) ON DELETE CASCADE
);

-- Phân chia phòng nhỏ / Căn hộ chi tiết trong tòa nhà (Room Units)
CREATE TABLE public.room_units (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL,
  name text NOT NULL,
  status text DEFAULT 'available'::text,
  current_renter_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT room_units_pkey PRIMARY KEY (id),
  CONSTRAINT room_units_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id) ON DELETE CASCADE,
  CONSTRAINT room_units_renter_id_fkey FOREIGN KEY (current_renter_id) REFERENCES public.profiles(id) ON DELETE SET NULL,
  CONSTRAINT room_units_status_check CHECK (
    status = ANY (ARRAY['available'::text, 'rented'::text, 'maintenance'::text])
  )
);

-- ==========================================
-- IV. ĐẶT PHÒNG, GIỮ CHỖ & HỢP ĐỒNG (BOOKINGS & HOLDS)
-- ==========================================

-- 8. Lịch hẹn xem phòng / Đăng ký đặt phòng công khai (Bookings)
CREATE TABLE public.bookings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL,
  user_id uuid NOT NULL,
  check_in_date date NOT NULL,
  check_out_date date NOT NULL,
  guests_count integer NOT NULL DEFAULT 1,
  total_price numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text,
  message text,
  rejection_reason text,
  approved_by uuid,
  approved_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT bookings_pkey PRIMARY KEY (id),
  CONSTRAINT bookings_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id) ON DELETE CASCADE,
  CONSTRAINT bookings_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.profiles(id) ON DELETE SET NULL,
  CONSTRAINT bookings_status_check CHECK (
    status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'cancelled'::text])
  )
);

-- 9. Giữ chỗ phòng nội bộ của Sales/CTV (Room Holds)
CREATE TABLE public.room_holds (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL,
  held_by uuid NOT NULL,
  client_name text NOT NULL,
  client_phone text NOT NULL,
  deposit_amount numeric DEFAULT 0,
  notes text,
  status text DEFAULT 'active'::text,
  hold_expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT room_holds_pkey PRIMARY KEY (id),
  CONSTRAINT room_holds_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id) ON DELETE CASCADE,
  CONSTRAINT room_holds_held_by_fkey FOREIGN KEY (held_by) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT room_holds_status_check CHECK (
    status = ANY (ARRAY['active'::text, 'expired'::text, 'converted'::text, 'cancelled'::text])
  )
);

-- 10. Hợp đồng thuê phòng (Contracts)
CREATE TABLE public.contracts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  room_unit_id uuid NOT NULL,
  renter_id uuid NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  deposit_amount numeric DEFAULT 0,
  rent_amount numeric NOT NULL,
  status text DEFAULT 'pending'::text,
  contract_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT contracts_pkey PRIMARY KEY (id),
  CONSTRAINT contracts_room_unit_id_fkey FOREIGN KEY (room_unit_id) REFERENCES public.room_units(id) ON DELETE CASCADE,
  CONSTRAINT contracts_renter_id_fkey FOREIGN KEY (renter_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT contracts_status_check CHECK (
    status = ANY (ARRAY['active'::text, 'expired'::text, 'terminated'::text, 'pending'::text])
  )
);

-- ==========================================
-- V. DỊCH VỤ, ĐIỆN NƯỚC & HÓA ĐƠN (SERVICES & BILLING)
-- ==========================================

-- 11. Các danh mục dịch vụ trong tòa nhà (Services)
CREATE TABLE public.services (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  name text NOT NULL,
  unit_price numeric NOT NULL,
  unit text NOT NULL, -- VD: kWh, m3, tháng, người...
  type text DEFAULT 'variable'::text, -- fixed (cố định), variable (theo số chỉ số)
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT services_pkey PRIMARY KEY (id),
  CONSTRAINT services_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT services_type_check CHECK (
    type = ANY (ARRAY['fixed'::text, 'variable'::text])
  )
);

CREATE TABLE public.unit_services (
  room_unit_id uuid NOT NULL,
  service_id uuid NOT NULL,
  CONSTRAINT unit_services_pkey PRIMARY KEY (room_unit_id, service_id),
  CONSTRAINT unit_services_room_unit_id_fkey FOREIGN KEY (room_unit_id) REFERENCES public.room_units(id) ON DELETE CASCADE,
  CONSTRAINT unit_services_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE
);

-- 12. Ghi nhận chỉ số điện nước hàng tháng (Utility Records)
CREATE TABLE public.utility_records (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL,
  record_date date NOT NULL DEFAULT CURRENT_DATE,
  electricity_start numeric NOT NULL DEFAULT 0,
  electricity_end numeric NOT NULL,
  water_start numeric NOT NULL DEFAULT 0,
  water_end numeric NOT NULL,
  recorded_by uuid NOT NULL,
  is_invoiced boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT utility_records_pkey PRIMARY KEY (id),
  CONSTRAINT utility_records_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id) ON DELETE CASCADE,
  CONSTRAINT utility_records_recorded_by_fkey FOREIGN KEY (recorded_by) REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- 13. Hóa đơn chi tiết hàng tháng (Invoices)
CREATE TABLE public.younghouse_invoices (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL,
  tenant_id uuid NOT NULL,
  billing_month date NOT NULL,
  room_price numeric NOT NULL,
  electricity_price numeric NOT NULL DEFAULT 0,
  water_price numeric NOT NULL DEFAULT 0,
  extra_service_price numeric NOT NULL DEFAULT 0,
  discount_amount numeric DEFAULT 0,
  total_amount numeric NOT NULL,
  status text DEFAULT 'unpaid'::text,
  due_date date NOT NULL,
  paid_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT younghouse_invoices_pkey PRIMARY KEY (id),
  CONSTRAINT younghouse_invoices_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id) ON DELETE CASCADE,
  CONSTRAINT younghouse_invoices_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT younghouse_invoices_status_check CHECK (
    status = ANY (ARRAY['unpaid'::text, 'paid'::text, 'overdue'::text, 'partially_paid'::text])
  )
);

-- ==========================================
-- VI. BẢO TRÌ & SỬA CHỮA (MAINTENANCE)
-- ==========================================

-- 14. Phiếu báo hỏng & Sửa chữa (Maintenance Tickets)
CREATE TABLE public.maintenance_tickets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL,
  tenant_id uuid NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  image_urls text[],
  priority text DEFAULT 'medium'::text,
  status text DEFAULT 'pending'::text,
  assigned_to uuid, -- Kỹ thuật chịu trách nhiệm (operator)
  cost numeric DEFAULT 0,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  CONSTRAINT maintenance_tickets_pkey PRIMARY KEY (id),
  CONSTRAINT maintenance_tickets_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id) ON DELETE CASCADE,
  CONSTRAINT maintenance_tickets_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT maintenance_tickets_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.profiles(id) ON DELETE SET NULL,
  CONSTRAINT maintenance_tickets_priority_check CHECK (
    priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'urgent'::text])
  ),
  CONSTRAINT maintenance_tickets_status_check CHECK (
    status = ANY (ARRAY['pending'::text, 'assigned'::text, 'in_progress'::text, 'completed'::text, 'cancelled'::text])
  )
);

-- ==========================================
-- VII. HỆ THỐNG HOA HỒNG CỘNG TÁC VIÊN (CTV SYSTEM)
-- ==========================================

-- 15. Hồ sơ CTV
CREATE TABLE public.ctv_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  referral_code text NOT NULL,
  commission_rate numeric NOT NULL DEFAULT 10,
  bank_name text,
  bank_account text,
  bank_owner text,
  status text DEFAULT 'pending'::text,
  total_earned numeric DEFAULT 0,
  total_paid numeric DEFAULT 0,
  note text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ctv_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT ctv_profiles_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT ctv_profiles_referral_code_key UNIQUE (referral_code),
  CONSTRAINT ctv_profiles_profile_id_key UNIQUE (profile_id),
  CONSTRAINT ctv_profiles_status_check CHECK (
    status = ANY (ARRAY['pending'::text, 'active'::text, 'suspended'::text])
  )
);

-- 16. Lượt giới thiệu
CREATE TABLE public.ctv_referrals (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  ctv_id uuid NOT NULL,
  booking_id uuid,
  room_id uuid NOT NULL,
  referred_user_id uuid,
  status text DEFAULT 'pending'::text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ctv_referrals_pkey PRIMARY KEY (id),
  CONSTRAINT ctv_referrals_ctv_id_fkey FOREIGN KEY (ctv_id) REFERENCES public.ctv_profiles(id) ON DELETE CASCADE,
  CONSTRAINT ctv_referrals_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE SET NULL,
  CONSTRAINT ctv_referrals_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id) ON DELETE CASCADE,
  CONSTRAINT ctv_referrals_referred_user_id_fkey FOREIGN KEY (referred_user_id) REFERENCES public.profiles(id) ON DELETE SET NULL,
  CONSTRAINT ctv_referrals_status_check CHECK (
    status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'cancelled'::text])
  )
);

-- 17. Hoa hồng ghi nhận
CREATE TABLE public.ctv_commissions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  ctv_id uuid NOT NULL,
  referral_id uuid NOT NULL,
  amount numeric NOT NULL,
  commission_rate numeric NOT NULL,
  room_price numeric NOT NULL,
  status text DEFAULT 'pending'::text,
  paid_at timestamp with time zone,
  approved_by uuid,
  note text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ctv_commissions_pkey PRIMARY KEY (id),
  CONSTRAINT ctv_commissions_ctv_id_fkey FOREIGN KEY (ctv_id) REFERENCES public.ctv_profiles(id) ON DELETE CASCADE,
  CONSTRAINT ctv_commissions_referral_id_fkey FOREIGN KEY (referral_id) REFERENCES public.ctv_referrals(id) ON DELETE CASCADE,
  CONSTRAINT ctv_commissions_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.profiles(id) ON DELETE SET NULL,
  CONSTRAINT ctv_commissions_status_check CHECK (
    status = ANY (ARRAY['pending'::text, 'approved'::text, 'paid'::text, 'rejected'::text])
  )
);

-- ==========================================
-- VIII. CÁC TÍNH NĂNG MỞ RỘNG KHÁC (EXTENSIONS)
-- ==========================================

-- Yêu cầu liên hệ trọ (Contacts)
CREATE TABLE public.contacts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  room_id uuid,
  renter_id uuid,
  message text,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'seen'::text, 'replied'::text])),
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT contacts_pkey PRIMARY KEY (id),
  CONSTRAINT contacts_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id) ON DELETE SET NULL,
  CONSTRAINT contacts_renter_id_fkey FOREIGN KEY (renter_id) REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Bài viết Tin tức (Blog Posts)
CREATE TABLE public.blog_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text DEFAULT ''::text,
  content text DEFAULT ''::text,
  featured_image text DEFAULT ''::text,
  category_name text DEFAULT 'Gợi ý nhà ở'::text,
  category_color text DEFAULT 'purple'::text,
  tags text[] DEFAULT '{}'::text[],
  author_name text DEFAULT 'Admin'::text,
  author_avatar text DEFAULT ''::text,
  author_bio text DEFAULT ''::text,
  reading_time integer DEFAULT 5,
  comment_count integer DEFAULT 0,
  view_count integer DEFAULT 0,
  post_type text DEFAULT 'standard'::text CHECK (post_type = ANY (ARRAY['standard'::text, 'video'::text, 'gallery'::text, 'audio'::text])),
  published boolean DEFAULT true,
  published_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT blog_posts_pkey PRIMARY KEY (id)
);

-- Hệ thống Thông báo (Notifications)
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  type text NOT NULL CHECK (type = ANY (ARRAY['info'::text, 'warning'::text, 'success'::text, 'error'::text])),
  target_audience text NOT NULL CHECK (target_audience = ANY (ARRAY['all'::text, 'renters'::text, 'owners'::text, 'admins'::text])),
  is_active boolean DEFAULT true,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT notifications_pkey PRIMARY KEY (id)
);

-- Yêu thích & Phản hồi
CREATE TABLE public.favorites (
  user_id uuid NOT NULL,
  room_id uuid NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT favorites_pkey PRIMARY KEY (user_id, room_id),
  CONSTRAINT favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT favorites_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id) ON DELETE CASCADE
);

CREATE TABLE public.feedbacks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL,
  user_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT feedbacks_pkey PRIMARY KEY (id),
  CONSTRAINT feedbacks_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id) ON DELETE CASCADE,
  CONSTRAINT feedbacks_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- Nhật ký Hệ thống (YoungHouse Audit Logs)
CREATE TABLE public.younghouse_audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  action text NOT NULL,
  table_name text,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  ip_address text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT younghouse_audit_logs_pkey PRIMARY KEY (id),
  CONSTRAINT younghouse_audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- ==========================================
-- IX. TRÌNH TỰ ĐỘNG HÓA & TRIPPERS (FUNCTIONS & TRIGGERS)
-- ==========================================

-- 1. Tự động tạo hồ sơ profile khi người dùng đăng ký qua Auth Supabase
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, phone, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', 'Người dùng mới'),
    new.phone,
    'user'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Tự động chuyển trạng thái phòng khi Sales/CTV giữ chỗ (Room Holds)
CREATE OR REPLACE FUNCTION public.fn_auto_hold_room()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.rooms
  SET status = 'held'
  WHERE id = NEW.room_id;
  
  INSERT INTO public.younghouse_audit_logs (user_id, action, table_name, record_id, new_data)
  VALUES (NEW.held_by, 'HOLD_ROOM', 'rooms', NEW.room_id, json_build_object('status', 'held', 'client', NEW.client_name)::jsonb);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trg_auto_hold_room
  AFTER INSERT ON public.room_holds
  FOR EACH ROW EXECUTE FUNCTION public.fn_auto_hold_room();

-- 3. Giải phóng phòng khi hết hạn hoặc hủy giữ chỗ
CREATE OR REPLACE FUNCTION public.fn_release_hold_room()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('expired', 'cancelled') AND OLD.status = 'active' THEN
    UPDATE public.rooms
    SET status = 'available'
    WHERE id = NEW.room_id;

    INSERT INTO public.younghouse_audit_logs (user_id, action, table_name, record_id, new_data)
    VALUES (NEW.held_by, 'RELEASE_ROOM_HOLD', 'rooms', NEW.room_id, json_build_object('status', 'available', 'reason', NEW.status)::jsonb);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trg_release_hold_room
  AFTER UPDATE ON public.room_holds
  FOR EACH ROW EXECUTE FUNCTION public.fn_release_hold_room();

-- 4. Tự động tạo hoa hồng CTV khi Booking được Admin duyệt
CREATE OR REPLACE FUNCTION public.calculate_ctv_commission()
RETURNS trigger AS $$
DECLARE
  ref_rec RECORD;
  comm_amount numeric;
  ctv_rate numeric;
  r_price numeric;
BEGIN
  -- Chỉ xử lý khi booking đổi trạng thái sang 'approved'
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status <> 'approved') THEN
    
    -- Lấy lượt giới thiệu liên kết với booking này
    SELECT * INTO ref_rec 
    FROM public.ctv_referrals 
    WHERE booking_id = NEW.id AND status = 'pending'
    LIMIT 1;
    
    IF FOUND THEN
      -- Cập nhật lượt giới thiệu thành thành công
      UPDATE public.ctv_referrals 
      SET status = 'confirmed' 
      WHERE id = ref_rec.id;
      
      -- Lấy giá phòng
      SELECT price INTO r_price FROM public.rooms WHERE id = NEW.room_id;
      
      -- Lấy tỷ lệ hoa hồng của CTV đó
      SELECT commission_rate INTO ctv_rate FROM public.ctv_profiles WHERE id = ref_rec.ctv_id;
      
      -- Tính số tiền hoa hồng
      comm_amount := (r_price * ctv_rate) / 100;
      
      -- Tạo dòng hoa hồng mới chờ duyệt
      INSERT INTO public.ctv_commissions (
        ctv_id,
        referral_id,
        room_price,
        commission_rate,
        amount,
        status
      ) VALUES (
        ref_rec.ctv_id,
        ref_rec.id,
        r_price,
        ctv_rate,
        comm_amount,
        'pending'
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trigger_auto_ctv_commission
  AFTER UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_ctv_commission();

-- 5. Tự động tính toán tổng số tiền tích lũy và đã chi trả của CTV
CREATE OR REPLACE FUNCTION public.update_ctv_total_paid()
RETURNS trigger AS $$
BEGIN
  -- Tính toán số hoa hồng đã duyệt (total_earned) và đã chi trả (total_paid)
  UPDATE public.ctv_profiles
  SET 
    total_earned = (
      SELECT COALESCE(SUM(amount), 0) 
      FROM public.ctv_commissions 
      WHERE ctv_id = NEW.ctv_id AND status IN ('approved', 'paid')
    ),
    total_paid = (
      SELECT COALESCE(SUM(amount), 0) 
      FROM public.ctv_commissions 
      WHERE ctv_id = NEW.ctv_id AND status = 'paid'
    )
  WHERE id = NEW.ctv_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trigger_update_ctv_balance
  AFTER UPDATE ON public.ctv_commissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_ctv_total_paid();

-- ==========================================
-- X. CHÍNH SÁCH BẢO MẬT DÒNG (ROW LEVEL SECURITY)
-- ==========================================

-- Bật tính năng RLS trên toàn bộ các bảng nhạy cảm
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_holds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.utility_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.younghouse_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.younghouse_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ctv_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ctv_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ctv_commissions ENABLE ROW LEVEL SECURITY;

-- 1. Quyền xem hồ sơ: Bản thân tự xem, Admin và Manager có quyền xem tất cả
CREATE POLICY profile_select_policy ON public.profiles
  FOR SELECT TO authenticated
  USING (
    id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- 2. Quyền thay đổi hồ sơ: Chỉ Admin và bản thân thay đổi thông tin cơ bản
CREATE POLICY profile_update_policy ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 3. Quyền quản lý phòng: Khách vãng lai xem phòng trống/giữ chỗ, Admin/Manager/Sales quản lý
CREATE POLICY rooms_select_guest ON public.rooms
  FOR SELECT USING (status != 'hidden');

CREATE POLICY rooms_manage_staff ON public.rooms
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'sales')
    )
  );

-- 4. Quyền quản lý hold phòng (Room Holds): Sales có quyền tự giữ chỗ, Admin/Manager kiểm soát
CREATE POLICY hold_select_staff ON public.room_holds
  FOR SELECT TO authenticated
  USING (
    held_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY hold_insert_sales ON public.room_holds
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'sales'
    )
  );

CREATE POLICY hold_update_staff ON public.room_holds
  FOR UPDATE TO authenticated
  USING (
    held_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- 5. Quyền ghi điện nước (Utility Records): Kỹ thuật ghi nhận, Admin/Manager duyệt
CREATE POLICY utility_select_staff ON public.utility_records
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'operator')
    )
  );

CREATE POLICY utility_insert_operator ON public.utility_records
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'operator'
    )
  );

-- 6. Quyền quản lý Hóa đơn (Invoices): Khách thuê tra cứu hóa đơn bản thân, Ban quản lý kiểm soát
CREATE POLICY invoice_select_tenant ON public.younghouse_invoices
  FOR SELECT TO authenticated
  USING (tenant_id = auth.uid());

CREATE POLICY invoice_manage_admin ON public.younghouse_invoices
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- 7. Quyền quản lý bảo trì (Maintenance Tickets):
-- Tenant tự tạo báo hỏng, Operator xử lý theo phân công, Admin/Manager quản lý chung
CREATE POLICY maintenance_tenant_policy ON public.maintenance_tickets
  FOR ALL TO authenticated
  USING (tenant_id = auth.uid());

CREATE POLICY maintenance_operator_select_policy ON public.maintenance_tickets
  FOR SELECT TO authenticated
  USING (
    assigned_to = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'operator'
    )
  );

CREATE POLICY maintenance_operator_update_policy ON public.maintenance_tickets
  FOR UPDATE TO authenticated
  USING (
    assigned_to = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'operator'
    )
  );

CREATE POLICY maintenance_admin_policy ON public.maintenance_tickets
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- 8. Quyền xem audit logs: Chỉ dành riêng cho Admin và Chị Nhường (Manager)
CREATE POLICY audit_view_policy ON public.younghouse_audit_logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );
