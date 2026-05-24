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

interface StaffSidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

const StaffSidebar: React.FC<StaffSidebarProps> = ({ isMobileOpen = false, onMobileClose }) => {
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
      title: "KỸ THUẬT VIÊN",
      items: [
        {
          name: "Tổng quan",
          href: "/staff",
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          ),
        },
        {
          name: "Nhiệm vụ sửa chữa",
          href: "/staff/tasks",
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          ),
        },
      ],
    },
    {
      title: "CÀI ĐẶT",
      items: [
        {
          name: "Thông tin tài khoản",
          href: "/staff/settings/account",
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          ),
        },
        {
          name: "Thông tin cá nhân",
          href: "/staff/settings/profile",
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        },
      ],
    },
  ];

  const isActive = (href: string) => {
    if (href === "/staff") {
      return pathname === "/staff";
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
            <span className="text-sm font-bold text-primary-6000">Kỹ Thuật Viên</span>
            <span className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400">YoungHouse</span>
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
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${active
                      ? "bg-primary-6000 text-white font-medium shadow-sm"
                      : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      }`}
                  >
                    <span className={`flex-shrink-0 ${active ? "text-white" : "text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-300"}`}>
                      {item.icon}
                    </span>
                    <span className="flex-1">{item.name}</span>
                    {item.badge && (
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${active
                        ? "bg-white/20 text-white"
                        : "bg-primary-6000/10 dark:bg-primary-900/50 text-primary-6000"
                        }`}>
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
      <div className="border-t border-neutral-200 dark:border-neutral-800 px-4 py-4">
        <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-3">
          Hỗ trợ kỹ thuật IT
        </p>
        <div className="flex items-center gap-3 p-3 rounded-lg border border-primary-200/50 dark:border-primary-900/30 bg-primary-50/50 dark:bg-primary-950/10">
          <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
              ĐỘI NGŨ IT
            </p>
            <a
              href="tel:0372858098"
              className="text-xs text-primary-600 dark:text-primary-400 font-medium flex items-center gap-1 hover:underline mt-0.5"
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
      <div className="hidden lg:flex w-64 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex-col h-screen sticky top-0">
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
        className={`lg:hidden fixed top-0 left-0 h-full w-72 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 z-50 transition-transform duration-300 ${isMobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {sidebarContent}
      </div>
    </>
  );
};

export default StaffSidebar;
