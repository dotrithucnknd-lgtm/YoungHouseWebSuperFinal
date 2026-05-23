"use client";

import React from "react";
import Image from "next/image";
import googleSvg from "@/images/Google.svg";
import { loginWithGoogle } from "@/lib/supabaseServices";

export type GoogleSignInButtonProps = {
  onSuccess?: () => void;
  onError?: (message: string) => void;
  className?: string;
  disabled?: boolean;
};

export default function GoogleSignInButton({
  onSuccess,
  onError,
  className,
  disabled,
}: GoogleSignInButtonProps) {
  const [loading, setLoading] = React.useState(false);

  const handleClick = async () => {
    if (loading || disabled) return;
    setLoading(true);

    try {
      const { error } = await loginWithGoogle();
      if (error) {
        onError?.(error);
        return;
      }

      // OAuth will redirect; call onSuccess to allow the caller to update UI.
      onSuccess?.();
    } catch {
      onError?.("Có lỗi xảy ra khi đăng nhập với Google");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || loading}
      className={[
        "w-full max-w-sm flex items-center justify-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800",
        className ?? "",
      ].join(" ")}
    >
      <Image src={googleSvg} alt="Google" className="h-5 w-5" />
      <span>{loading ? "Đang chuyển hướng..." : "Đăng nhập với Google"}</span>
    </button>
  );
}


