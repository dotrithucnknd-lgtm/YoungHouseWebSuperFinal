"use client";

import Image, { type ImageProps } from "next/image";
import supabaseImageLoader from "@/../lib/supabase-image-loader.js";

type Props = Omit<ImageProps, "loader"> & {
  /**
   * When true, force using Supabase loader even if src is not Supabase.
   * Default: false.
   */
  forceSupabaseLoader?: boolean;
};

function isSupabaseUrl(src: ImageProps["src"]) {
  return typeof src === "string" && src.includes(".supabase.co/storage/v1/");
}

export default function SupabaseImage({
  forceSupabaseLoader = false,
  ...props
}: Props) {
  const safeSrc =
    typeof props.src === "string"
      ? props.src.trim() || "/favicon.ico"
      : props.src || "/favicon.ico";
  const shouldUseLoader = forceSupabaseLoader || isSupabaseUrl(safeSrc);
  return (
    <Image
      {...props}
      src={safeSrc as any}
      // Only attach loader for Supabase URLs (avoid affecting local/static imports).
      loader={shouldUseLoader ? (supabaseImageLoader as any) : undefined}
    />
  );
}

