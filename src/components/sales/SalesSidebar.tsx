"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { XMarkIcon, ClipboardDocumentIcon, ShareIcon } from "@heroicons/react/24/outline";

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

interface SalesSidebarProps {
  userName?: string;
  referralCode?: string;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

const navItems: NavItem[] = [
  {
    name: "Tổng quan",
    href: "/ctv",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    name: "Phòng trống",
    href: "/ctv/rooms",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    name: "Giới thiệu",
    href: "/ctv/referrals",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
  },
  {
    name: "Hoa hồng",
    href: "/ctv/commissions",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    name: "Cài đặt",
    href: "/ctv/settings",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

const SalesSidebar: React.FC<SalesSidebarProps> = ({
  userName,
  referralCode,
  isMobileOpen = false,
  onMobileClose,
}) => {
  const pathname = usePathname();
  const [copied, setCopied] = useState(false);

  const copyReferralLink = () => {
    if (!referralCode) return;
    const link = `${window.location.origin}?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    onMobileClose?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/ctv") return pathname === "/ctv";
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-900">
      <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <img
            src="/images/logo_trohoalac.png"
            alt="YoungHouse"
            className="h-12 w-auto object-contain"
          />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Sales</span>
            <span className="text-[10px] font-semibold text-neutral-500">Kinh doanh & CTV</span>
          </div>
        </Link>
        {isMobileOpen && (
          <button
            onClick={onMobileClose}
            className="lg:hidden p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <XMarkIcon className="w-5 h-5 text-neutral-500" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onMobileClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                active
                  ? "bg-emerald-600 text-white font-medium shadow-sm"
                  : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              <span className={active ? "text-white" : "text-neutral-500"}>{item.icon}</span>
              <span className="text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {referralCode && (
        <div className="px-3 pb-3">
          <p className="px-3 mb-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            Thao tác nhanh
          </p>
          <button
            type="button"
            onClick={copyReferralLink}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <ClipboardDocumentIcon className="w-4 h-4" />
            {copied ? "Đã copy link!" : "Copy link giới thiệu"}
          </button>
          <Link
            href="/phong-tro"
            target="_blank"
            onClick={onMobileClose}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 mt-2 border border-neutral-200 dark:border-neutral-700 text-sm font-medium text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800"
          >
            <ShareIcon className="w-4 h-4" />
            Xem phòng công khai
          </Link>
        </div>
      )}

      <div className="border-t border-neutral-200 dark:border-neutral-800 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 font-medium text-sm">
            {userName?.charAt(0)?.toUpperCase() || "S"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
              {userName || "Sales"}
            </p>
            <p className="text-xs text-neutral-500">Nhân viên kinh doanh</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden lg:flex w-64 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex-col h-screen shrink-0">
        {sidebarContent}
      </div>

      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={onMobileClose} />
      )}

      <div
        className={`lg:hidden fixed top-0 left-0 h-full w-72 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 z-50 transition-transform duration-300 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
};

export default SalesSidebar;
