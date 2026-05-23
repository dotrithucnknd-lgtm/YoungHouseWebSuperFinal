

-- =========================================================================
-- XI. BỔ SUNG TOÀN BỘ RLS POLICIES CHO CÁC BẢNG CÒN LẠI (100% COMPLETE RLS)
-- =========================================================================

-- Kích hoạt RLS cho toàn bộ các bảng còn lại
ALTER TABLE public.universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surroundings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_surroundings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_video_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unit_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

-- 1. CHÍNH SÁCH CHO CÁC BẢNG DANH MỤC (Universities, Amenities, Surroundings, Targets)
-- Bất kỳ ai (Kể cả khách vãng lai) cũng có thể xem danh mục để hiển thị trên UI
CREATE POLICY categories_select_all ON public.universities FOR SELECT USING (true);
CREATE POLICY categories_select_all ON public.amenities FOR SELECT USING (true);
CREATE POLICY categories_select_all ON public.surroundings FOR SELECT USING (true);
CREATE POLICY categories_select_all ON public.targets FOR SELECT USING (true);

-- Chỉ Admin và Manager có quyền thêm/sửa/xóa danh mục
CREATE POLICY categories_manage_admin ON public.universities
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')));

CREATE POLICY categories_manage_admin ON public.amenities
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')));

CREATE POLICY categories_manage_admin ON public.surroundings
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')));

CREATE POLICY categories_manage_admin ON public.targets
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')));


-- 2. CHÍNH SÁCH CHO CÁC THÀNH PHẦN LIÊN KẾT PHÒNG (Images, Amenities, Surroundings, Targets, Video Reviews)
-- Mọi người có thể xem thông tin/hình ảnh phòng trọ công khai
CREATE POLICY room_sub_select_all ON public.room_images FOR SELECT USING (true);
CREATE POLICY room_sub_select_all ON public.room_amenities FOR SELECT USING (true);
CREATE POLICY room_sub_select_all ON public.room_surroundings FOR SELECT USING (true);
CREATE POLICY room_sub_select_all ON public.room_targets FOR SELECT USING (true);
CREATE POLICY room_sub_select_all ON public.room_universities FOR SELECT USING (true);
CREATE POLICY room_sub_select_all ON public.room_video_reviews FOR SELECT USING (true);

-- Chỉ Admin, Manager và Sales/CTV có quyền thay đổi thông tin liên kết phòng
CREATE POLICY room_sub_manage_staff ON public.room_images
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager', 'sales')));

CREATE POLICY room_sub_manage_staff ON public.room_amenities
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager', 'sales')));

CREATE POLICY room_sub_manage_staff ON public.room_surroundings
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager', 'sales')));

CREATE POLICY room_sub_manage_staff ON public.room_targets
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager', 'sales')));

CREATE POLICY room_sub_manage_staff ON public.room_universities
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager', 'sales')));

CREATE POLICY room_sub_manage_staff ON public.room_video_reviews
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager', 'sales')));


-- 3. CHÍNH SÁCH CHO ROOM UNITS (CĂN HỘ NHỎ)
-- Khách thuê có thể xem phòng của mình, Nhân viên (Sales, Operator, Manager, Admin) có thể xem toàn bộ
CREATE POLICY units_select_policy ON public.room_units
  FOR SELECT TO authenticated
  USING (
    current_renter_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager', 'sales', 'operator'))
  );

-- Chỉ Admin và Manager có quyền quản lý tạo/sửa căn hộ nhỏ
CREATE POLICY units_manage_admin ON public.room_units
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')));


-- 4. CHÍNH SÁCH CHO HỢP ĐỒNG (Contracts)
-- Khách thuê chỉ xem hợp đồng của chính mình
CREATE POLICY contracts_select_tenant ON public.contracts
  FOR SELECT TO authenticated
  USING (renter_id = auth.uid());

-- Ban quản lý (Admin, Manager) toàn quyền quản lý hợp đồng
CREATE POLICY contracts_manage_admin ON public.contracts
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')));


-- 5. CHÍNH SÁCH CHO DỊCH VỤ (Services & Unit Services)
-- Cho phép mọi người xem danh sách dịch vụ đi kèm
CREATE POLICY services_select_all ON public.services FOR SELECT USING (true);
CREATE POLICY services_select_all ON public.unit_services FOR SELECT USING (true);

-- Chỉ Admin và Manager có quyền tạo và chỉnh sửa bảng giá dịch vụ
CREATE POLICY services_manage_admin ON public.services
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')));

CREATE POLICY services_manage_admin ON public.unit_services
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')));


-- 6. CHÍNH SÁCH CHO ĐĂNG KÝ ĐẶT PHÒNG (Bookings)
-- Khách thuê tự xem và tạo lịch đăng ký đặt phòng của chính mình
CREATE POLICY bookings_tenant_select_policy ON public.bookings
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY bookings_tenant_insert_policy ON public.bookings
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Ban quản lý và Sales/CTV có quyền xem và xử lý danh sách đặt phòng
CREATE POLICY bookings_staff_policy ON public.bookings
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager', 'sales')));


-- 7. CHÍNH SÁCH CHO HỒ SƠ CHI TIẾT KHÁCH THUÊ (Tenant Profiles)
-- Khách thuê tự cập nhật hồ sơ cá nhân (CCCD, thẻ sinh viên...)
CREATE POLICY tenant_profiles_self ON public.tenant_profiles
  FOR ALL TO authenticated
  USING (profile_id = auth.uid());

-- Ban quản lý có quyền xem thông tin để xác minh
CREATE POLICY tenant_profiles_admin ON public.tenant_profiles
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')));


-- 8. CHÍNH SÁCH CHO BLOG & TIN TỨC (Blog Posts)
-- Ai cũng có quyền đọc blog đã xuất bản
CREATE POLICY blog_select_public ON public.blog_posts
  FOR SELECT USING (published = true);

-- Chỉ Admin và Manager có quyền soạn thảo và chỉnh sửa blog
CREATE POLICY blog_manage_admin ON public.blog_posts
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')));


-- 9. CHÍNH SÁCH CHO THÔNG BÁO (Notifications)
-- Người dùng xem thông báo nhắm đến đối tượng của họ
CREATE POLICY notifications_select_audience ON public.notifications
  FOR SELECT TO authenticated
  USING (
    target_audience = 'all' OR
    (target_audience = 'renters' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'tenant')) OR
    (target_audience = 'owners' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'manager')) OR
    (target_audience = 'admins' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  );

-- Chỉ Admin mới được tạo thông báo hệ thống
CREATE POLICY notifications_manage_admin ON public.notifications
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));


-- 10. CHÍNH SÁCH YÊU THÍCH, PHẢN HỒI & ĐÁNH GIÁ (Favorites, Feedbacks)
-- Xem công khai phản hồi và đánh giá
CREATE POLICY feedbacks_select_public ON public.feedbacks FOR SELECT USING (true);

-- Tự quản lý yêu thích và đánh giá của chính mình
CREATE POLICY favorites_self ON public.favorites
  FOR ALL TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY feedbacks_self ON public.feedbacks
  FOR ALL TO authenticated
  USING (user_id = auth.uid());


-- 11. CHÍNH SÁCH CHO HỆ THỐNG HOA HỒNG CTV (ctv_profiles, ctv_referrals, ctv_commissions)
-- CTV chỉ được xem thông tin hồ sơ, giới thiệu và hoa hồng của chính họ
CREATE POLICY ctv_profile_self ON public.ctv_profiles
  FOR SELECT TO authenticated
  USING (profile_id = auth.uid());

CREATE POLICY ctv_referral_self ON public.ctv_referrals
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.ctv_profiles WHERE id = ctv_id AND profile_id = auth.uid()));

CREATE POLICY ctv_commission_self ON public.ctv_commissions
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.ctv_profiles WHERE id = ctv_id AND profile_id = auth.uid()));

-- Admin và Manager có quyền giám sát và cập nhật toàn bộ hệ thống hoa hồng CTV
CREATE POLICY ctv_profiles_admin ON public.ctv_profiles
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')));

CREATE POLICY ctv_referrals_admin ON public.ctv_referrals
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')));

CREATE POLICY ctv_commissions_admin ON public.ctv_commissions
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')));

