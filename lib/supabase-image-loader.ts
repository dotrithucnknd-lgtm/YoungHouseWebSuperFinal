import type { ImageLoaderProps } from "next/image";

function isSupabaseStorageUrl(url: string) {
  return url.includes(".supabase.co/storage/v1/");
}

function toSupabaseRenderUrl(src: string) {
  // Convert public object URLs to transformation endpoint.
  // Example:
  // https://<ref>.supabase.co/storage/v1/object/public/<bucket>/<path>
  // ->     https://<ref>.supabase.co/storage/v1/render/image/public/<bucket>/<path>
  return src.replace("/storage/v1/object/public/", "/storage/v1/render/image/public/");
}

function appendSearchParams(url: string, params: Record<string, string>) {
  const u = new URL(url);
  for (const [k, v] of Object.entries(params)) {
    if (v === "") continue;
    u.searchParams.set(k, v);
  }
  return u.toString();
}

export function supabaseImageLoader({ src, width, quality }: ImageLoaderProps) {
  // Leave relative/static/data/blob URLs untouched.
  if (
    src.startsWith("/") ||
    src.startsWith("data:") ||
    src.startsWith("blob:") ||
    src.startsWith("file:")
  ) {
    return src;
  }

  // Only rewrite Supabase Storage URLs.
  const isSupabase = isSupabaseStorageUrl(src);
  if (!isSupabase) return src;

  const base =
    src.includes("/storage/v1/render/image/") ? src : toSupabaseRenderUrl(src);

  // Supabase transformations: https://supabase.com/docs/guides/storage/image-transformations
  // We rely on width to generate responsive srcset without going through Vercel's optimizer.
  return appendSearchParams(base, {
    width: String(width),
    quality: String(quality ?? 75),
    format: "webp",
  });
}

export default supabaseImageLoader;

