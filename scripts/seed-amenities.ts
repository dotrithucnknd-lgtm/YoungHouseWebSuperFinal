/**
 * Script thêm tiện nghi vào bảng amenities trên Supabase.
 * Chạy: npx ts-node --skip-project scripts/seed-amenities.ts
 * Hoặc copy SQL bên dưới và chạy trực tiếp trong Supabase SQL Editor.
 */

// ===== CÁCH 1: Chạy SQL trực tiếp trong Supabase Dashboard > SQL Editor =====
/*
INSERT INTO amenities (name) VALUES
  ('Gác lửng'),
  ('Wifi'),
  ('Vệ sinh trong'),
  ('Phòng tắm'),
  ('Bình nóng lạnh'),
  ('Kệ bếp'),
  ('Máy giặt'),
  ('Tivi'),
  ('Điều hòa'),
  ('Tủ lạnh'),
  ('Giường nệm'),
  ('Tủ áo quần'),
  ('Ban công/sân thượng'),
  ('Thang máy'),
  ('Bãi để xe riêng'),
  ('Camera an ninh'),
  ('Hồ bơi'),
  ('Sân vườn')
ON CONFLICT (name) DO NOTHING;
*/

// ===== CÁCH 2: Chạy bằng Node.js =====
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

const amenities = [
  'Gác lửng',
  'Wifi',
  'Vệ sinh trong',
  'Phòng tắm',
  'Bình nóng lạnh',
  'Kệ bếp',
  'Máy giặt',
  'Tivi',
  'Điều hòa',
  'Tủ lạnh',
  'Giường nệm',
  'Tủ áo quần',
  'Ban công/sân thượng',
  'Thang máy',
  'Bãi để xe riêng',
  'Camera an ninh',
  'Hồ bơi',
  'Sân vườn',
];

async function seed() {
  console.log('Seeding amenities...');
  
  for (const name of amenities) {
    const { error } = await supabase
      .from('amenities')
      .upsert({ name }, { onConflict: 'name' });
    
    if (error) {
      console.error(`Error inserting "${name}":`, error.message);
    } else {
      console.log(`✅ ${name}`);
    }
  }
  
  console.log('\nDone! Refresh trang để thấy tiện nghi.');
}

seed();
