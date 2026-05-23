/**
 * Next.js custom image loader that rewrites Supabase Storage URLs
 * to use Supabase built-in image transformations (render/image).
 *
 * This file must be plain JS because Next loads `images.loaderFile`
 * at runtime (TS won't be executed in Node without transpilation).
 */
export default function supabaseImageLoader({ src, width, quality }) {
  if (
    !src ||
    typeof src !== "string" ||
    src.startsWith("/") ||
    src.startsWith("data:") ||
    src.startsWith("blob:") ||
    src.startsWith("file:")
  ) {
    return src;
  }

  // Only rewrite Supabase Storage URLs.
  if (!src.includes(".supabase.co/storage/v1/")) return src;

  const base = src.includes("/storage/v1/render/image/")
    ? src
    : src.replace(
        "/storage/v1/object/public/",
        "/storage/v1/render/image/public/"
      );

  const url = new URL(base);
  url.searchParams.set("width", String(width));
  url.searchParams.set("quality", String(quality ?? 75));
  url.searchParams.set("format", "webp");
  return url.toString();
}

