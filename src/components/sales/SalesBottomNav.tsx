"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardDocumentIcon } from "@heroicons/react/24/outline";

const navItems = [
  {
    name: "Tổng quan",
    href: "/ctv",
    exact: true,
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    name: "Phòng",
    href: "/ctv/rooms",
    exact: false,
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    name: "Giới thiệu",
    href: "/ctv/referrals",
    exact: false,
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
  },
  {
    name: "Hoa hồng",
    href: "/ctv/commissions",
    exact: false,
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    name: "Menu",
    href: "#",
    exact: false,
    isMenu: true,
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    ),
  },
];

interface SalesBottomNavProps {
  referralCode?: string;
  onMenuClick?: () => void;
}

const SalesBottomNav: React.FC<SalesBottomNavProps> = ({ referralCode, onMenuClick }) => {
  const pathname = usePathname();
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    if (!referralCode) return;
    navigator.clipboard.writeText(`${window.location.origin}?ref=${referralCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isActive = (item: (typeof navItems)[0]) => {
    if (item.isMenu) return false;
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 safe-area-pb">
      {referralCode && (
        <button
          type="button"
          onClick={copyLink}
          className="absolute -top-5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-full shadow-lg shadow-emerald-600/30 transition-colors"
        >
          <ClipboardDocumentIcon className="w-4 h-4" />
          {copied ? "Đã copy!" : "Copy link GT"}
        </button>
      )}
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const active = isActive(item);
          if (item.isMenu) {
            return (
              <button
                key={item.name}
                onClick={onMenuClick}
                className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full px-1 text-neutral-500 hover:text-emerald-600 transition-colors"
              >
                <span className="p-1">{item.icon}</span>
                <span className="text-[10px] font-medium">{item.name}</span>
              </button>
            );
          }
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full px-1 transition-colors ${
                active ? "text-emerald-600" : "text-neutral-500 hover:text-emerald-600"
              }`}
            >
              <span className={`p-1 rounded-xl ${active ? "bg-emerald-600/10" : ""}`}>
                {item.icon}
              </span>
              <span className={`text-[10px] font-medium ${active ? "font-bold" : ""}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default SalesBottomNav;
