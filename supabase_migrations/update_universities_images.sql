-- Update universities image URLs với ảnh local thực tế
-- Chạy script này nếu đã chạy create_universities.sql trước đó
-- File ảnh hiện có trong public/images/: dh_fptu.jpg, dh_hvtc.jpg, dh_vnu.png

UPDATE public.universities 
SET image_url = '/images/dh_fptu.jpg'
WHERE short_name = 'FPTU';

UPDATE public.universities 
SET image_url = '/images/dh_hvtc.jpg'
WHERE short_name = 'HVTC';

UPDATE public.universities 
SET image_url = '/images/dh_vnu.png'
WHERE short_name = 'ĐHQG HN';

-- ĐLĐL HN (Đại học Điện Lực) - dùng ảnh trường đại học từ Unsplash
UPDATE public.universities 
SET image_url = 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80'
WHERE short_name = 'ĐLĐL HN';
