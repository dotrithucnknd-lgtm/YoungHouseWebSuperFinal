/**
 * Upload image with retry logic for schema cache issues
 */

import { supabase } from '@/lib/supabaseClient';

export async function uploadImageWithRetry(
  file: File,
  bucket: string = 'id-cards',
  maxRetries: number = 3
): Promise<{ url: string | null; error: string | null }> {
  try {
    // First, verify bucket exists
    console.log(`Checking if bucket "${bucket}" exists...`);
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.error('Error listing buckets:', bucketError);
      return { 
        url: null, 
        error: `Không thể kiểm tra bucket: ${bucketError.message}. Vui lòng chạy fix_all_tenant_rls.sql trong Supabase SQL Editor.` 
      };
    }

    const bucketExists = buckets?.some(b => b.id === bucket);
    if (!bucketExists) {
      console.error(`Bucket "${bucket}" not found. Available buckets:`, buckets?.map(b => b.id));
      return { 
        url: null, 
        error: `Bucket "${bucket}" chưa được tạo. Vui lòng chạy fix_all_tenant_rls.sql trong Supabase SQL Editor để tạo bucket.` 
      };
    }

    console.log(`✓ Bucket "${bucket}" exists`);

    // Dynamic import to avoid bundling browser-only lib on server build
    const { compressImage } = await import('@/utils/imageCompression');
    
    const optimized = await compressImage(file, {
      maxWidthOrHeight: 1024,
      convertToWebP: true,
      quality: 0.8,
    });

    const fileExt = optimized.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    let lastError: string | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Upload attempt ${attempt}/${maxRetries} to bucket: ${bucket}`);

        // Try to upload
        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(filePath, optimized, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          lastError = error.message;
          console.error(`Attempt ${attempt} failed:`, error);

          // If schema error, wait and retry
          if (error.message.includes('schema') || error.message.includes('incompatible')) {
            if (attempt < maxRetries) {
              console.log(`Schema cache issue detected. Waiting 3 seconds before retry...`);
              await new Promise(resolve => setTimeout(resolve, 3000));
              continue;
            } else {
              return { 
                url: null, 
                error: 'Lỗi schema cache. Vui lòng:\n1. Refresh trang (F5)\n2. Thử lại\n3. Nếu vẫn lỗi, chạy lại fix_all_tenant_rls.sql' 
              };
            }
          }

          // Other errors, don't retry
          return { url: null, error: error.message };
        }

        // Success! Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath);

        console.log(`✓ Upload successful on attempt ${attempt}`);
        return { url: publicUrl, error: null };

      } catch (error: any) {
        lastError = error.message || 'Unknown error';
        console.error(`Attempt ${attempt} exception:`, error);

        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 3000));
          continue;
        }
      }
    }

    return { 
      url: null, 
      error: lastError || 'Upload thất bại sau nhiều lần thử. Vui lòng:\n1. Refresh trang\n2. Kiểm tra bucket "id-cards" đã được tạo\n3. Chạy fix_all_tenant_rls.sql' 
    };
  } catch (error: any) {
    console.error('Upload exception:', error);
    return { 
      url: null, 
      error: `Lỗi không xác định: ${error.message}` 
    };
  }
}
