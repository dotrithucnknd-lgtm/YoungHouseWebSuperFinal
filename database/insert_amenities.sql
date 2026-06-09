-- Insert amenities (tiện nghi)
-- Dùng INSERT ... ON CONFLICT DO NOTHING để có thể chạy nhiều lần mà không bị lỗi

INSERT INTO public.amenities (name) VALUES
  ('Bãi để xe riêng'),
  ('Ban công/Sân thượng'),
  ('Bình nóng lạnh'),
  ('Camera an ninh'),
  ('Điều hòa'),
  ('Gác lửng'),
  ('Giường nệm'),
  ('Kệ bếp'),
  ('Máy giặt'),
  ('Phòng tắm'),
  ('Phòng tắm riêng'),
  ('Sân vườn'),
  ('Thang máy'),
  ('Tivi'),
  ('Tủ áo quần'),
  ('Tủ lạnh'),
  ('Vệ sinh trong'),
  ('Wifi')
ON CONFLICT (name) DO NOTHING;
