-- Cho phép đặt lịch xem phòng không cần đăng nhập (user_id nullable)
ALTER TABLE public.bookings
  ALTER COLUMN user_id DROP NOT NULL;
