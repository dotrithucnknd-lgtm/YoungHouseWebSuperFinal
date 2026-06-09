"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ClipboardDocumentIcon,
  ShareIcon,
  BuildingOffice2Icon,
  BanknotesIcon,
  EllipsisVerticalIcon,
  LinkIcon,
  MagnifyingGlassIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

interface SalesNavQuickActionsProps {
  referralCode: string;
  compact?: boolean;
}

export default function SalesNavQuickActions({
  referralCode,
  compact = false,
}: SalesNavQuickActionsProps) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const referralLink =
    typeof window !== "undefined"
      ? `${window.location.origin}?ref=${referralCode}`
      : `?ref=${referralCode}`;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setMenuOpen(false);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setMenuOpen(false);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLink = async () => {
    const text = `Young House - Tìm phòng trọ uy tín. Mã GT: ${referralCode}\n${referralLink}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Young House", text, url: referralLink });
        setMenuOpen(false);
        return;
      } catch {
        /* fallback */
      }
    }
    navigator.clipboard.writeText(text);
    setShared(true);
    setMenuOpen(false);
    setTimeout(() => setShared(false), 2000);
  };

  const iconBtn =
    "inline-flex items-center justify-center p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors";

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
      {/* Primary: Copy link */}
      <button
        type="button"
        onClick={copyLink}
        className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-sm"
        title="Copy link giới thiệu"
      >
        <ClipboardDocumentIcon className="w-4 h-4 shrink-0" />
        <span className="hidden sm:inline">
          {copied ? "Đã copy!" : shared ? "Đã chia sẻ!" : "Copy link GT"}
        </span>
        <span className="sm:hidden">{copied ? "✓" : "Copy"}</span>
      </button>

      {/* Desktop quick icons */}
      {!compact && (
        <>
          <button type="button" onClick={shareLink} className={`${iconBtn} hidden md:inline-flex`} title="Chia sẻ">
            <ShareIcon className="w-4 h-4" />
          </button>
          <Link href="/ctv/rooms" className={`${iconBtn} hidden lg:inline-flex`} title="Phòng trống">
            <BuildingOffice2Icon className="w-4 h-4" />
          </Link>
          <Link href="/ctv/commissions" className={`${iconBtn} hidden lg:inline-flex`} title="Hoa hồng">
            <BanknotesIcon className="w-4 h-4" />
          </Link>
        </>
      )}

      {/* More menu */}
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className={iconBtn}
          aria-label="Thao tác nhanh"
        >
          <EllipsisVerticalIcon className="w-4 h-4" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full mt-1.5 w-52 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-lg py-1 z-50 animate-in fade-in zoom-in-95 duration-150">
            <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-100 dark:border-neutral-800">
              Thao tác nhanh
            </p>
            <button
              type="button"
              onClick={copyLink}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
            >
              <ClipboardDocumentIcon className="w-4 h-4 text-emerald-600" />
              Copy link giới thiệu
            </button>
            <button
              type="button"
              onClick={copyCode}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
            >
              <LinkIcon className="w-4 h-4 text-teal-600" />
              Copy mã CTV
            </button>
            <button
              type="button"
              onClick={shareLink}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 md:hidden"
            >
              <ShareIcon className="w-4 h-4 text-cyan-600" />
              Chia sẻ nhanh
            </button>
            <div className="border-t border-neutral-100 dark:border-neutral-800 my-1" />
            <Link
              href="/ctv/rooms"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 lg:hidden"
            >
              <BuildingOffice2Icon className="w-4 h-4 text-blue-600" />
              Phòng trống
            </Link>
            <Link
              href="/phong-tro"
              target="_blank"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
            >
              <MagnifyingGlassIcon className="w-4 h-4 text-indigo-600" />
              Tìm phòng công khai
            </Link>
            <Link
              href="/ctv/referrals"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
            >
              <LinkIcon className="w-4 h-4 text-violet-600" />
              Lịch sử giới thiệu
            </Link>
            <Link
              href="/ctv/commissions"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 lg:hidden"
            >
              <BanknotesIcon className="w-4 h-4 text-amber-600" />
              Hoa hồng
            </Link>
            <Link
              href="/ctv/settings"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
            >
              <Cog6ToothIcon className="w-4 h-4 text-neutral-500" />
              Cài đặt
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
