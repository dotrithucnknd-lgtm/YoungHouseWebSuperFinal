"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    name: "Tổng quan",
    href: "/manager",
    exact: true,
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    name: "Doanh thu",
    href: "/manager/revenue",
    exact: false,
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    name: "Hoa hồng",
    href: "/manager/commissions",
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

interface ManagerBottomNavProps {
  onMenuClick?: () => void;
}

const ManagerBottomNav: React.FC<ManagerBottomNavProps> = ({ onMenuClick }) => {
  const pathname = usePathname();

  const isActive = (item: typeof navItems[0]) => {
    if (item.isMenu) return false;
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 safe-area-pb">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const active = isActive(item);
          if (item.isMenu) {
            return (
              <button
                key={item.name}
                onClick={onMenuClick}
                className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full px-1 text-neutral-500 dark:text-neutral-400 hover:text-primary-6000 dark:hover:text-primary-400 transition-colors"
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
                active
                  ? "text-primary-6000 dark:text-primary-400"
                  : "text-neutral-500 dark:text-neutral-400 hover:text-primary-6000 dark:hover:text-primary-400"
              }`}
            >
              <span className={`p-1 rounded-xl transition-colors ${active ? "bg-primary-6000/10 dark:bg-primary-900/30" : ""}`}>
                {item.icon}
              </span>
              <span className={`text-[10px] font-medium ${active ? "font-bold" : ""}`}>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default ManagerBottomNav;
