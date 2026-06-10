"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

interface ManagerSidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

const ManagerSidebar: React.FC<ManagerSidebarProps> = ({ isMobileOpen = false, onMobileClose }) => {
  const pathname = usePathname();

  // Close mobile sidebar when route changes
  useEffect(() => {
    if (onMobileClose) {
      onMobileClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const navSections: NavSection[] = [
    {
      title: "QUẢN TRỊ VẬN HÀNH",
      items: [
        {
          name: "Tổng quan",
          href: "/manager",
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
            </svg>
          ),
        },
        {
          name: "Báo cáo doanh thu",
          href: "/manager/revenue",
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          ),
        },
        {
          name: "Duyệt hoa hồng CTV",
          href: "/manager/commissions",
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        },
        {
          name: "Khảo sát khách hàng",
          href: "/manager/surveys",
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          ),
        },
      ],
    },
  ];

  const isActive = (href: string) => {
    if (href === "/manager") {
      return pathname === "/manager";
    }
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <img
            src="/images/logo_trohoalac.png"
            alt="YoungHouse"
            className="h-12 w-auto object-contain"
          />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-primary-6000">YoungHouse</span>
            <span className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400">Giám Sát Vận Hành</span>
          </div>
        </Link>
        {/* Mobile close button */}
        {isMobileOpen && (
          <button
            onClick={onMobileClose}
            className="lg:hidden p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {navSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-6">
            {section.title && (
              <p className="px-3 mb-2 text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                {section.title}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onMobileClose}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                      active
                        ? "bg-primary-6000 text-white font-medium shadow-sm"
                        : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    }`}
                  >
                    <span
                      className={`flex-shrink-0 ${
                        active
                          ? "text-white"
                          : "text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-300"
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="flex-1 text-sm">{item.name}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          active
                            ? "bg-white/20 text-white"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Support Section */}
      <div className="border-t border-neutral-200 dark:border-neutral-800 px-4 py-4 bg-neutral-50 dark:bg-neutral-900/50">
        <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-3">
          Liên hệ Hỗ Trợ
        </p>
        <div
          className="flex items-center gap-3 p-3 rounded-lg border border-primary-200/30 bg-primary-50/20 dark:border-primary-900/20 dark:bg-primary-950/10"
        >
          <div className="w-9 h-9 bg-primary-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">
              ĐỘI NGŨ KỸ THUẬT
            </p>
            <a
              href="tel:0962888797"
              className="text-xs text-primary-600 dark:text-primary-400 font-medium flex items-center gap-1 hover:underline"
            >
              037.2858.098
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-64 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex-col h-screen shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={onMobileClose}
        />
      )}

      {/* Mobile Sidebar */}
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

export default ManagerSidebar;
