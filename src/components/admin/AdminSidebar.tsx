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

interface AdminSidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isMobileOpen = false, onMobileClose }) => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  // Close mobile sidebar when route changes
  useEffect(() => {
    if (onMobileClose) {
      onMobileClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const navigation: NavItem[] = [
    {
      name: "Tổng quan",
      href: "/admin",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      name: "Phòng trọ",
      href: "/admin/rooms",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      name: "Đơn đặt phòng",
      href: "/admin/bookings",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      name: "Thông báo",
      href: "/admin/notifications",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
    },
    {
      name: "Pass phòng",
      href: "/admin/pass-phong",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
    },
    {
      name: "CTV & Hoa hồng",
      href: "/admin/ctv",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      name: "Người dùng",
      href: "/admin/users",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      name: "Phân tích",
      href: "/admin/analytics",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      name: "Cài đặt",
      href: "/admin/settings",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  // Sidebar content
  const sidebarContent = (
    <>
      {/* Logo & Toggle */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
        {!isCollapsed && (
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img
              src="/images/logo_trohoalac.png"
              alt="YoungHouse"
              className="h-14 w-auto object-contain"
            />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">YoungHouse</span>
              <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Hoà Lạc</span>
            </div>
          </Link>
        )}
        {isCollapsed && (
          <Link href="/" className="flex justify-center hover:opacity-80 transition-opacity mx-auto">
            <img
              src="/images/logo_trohoalac.png"
              alt="YoungHouse"
              className="h-10 w-auto object-contain"
            />
          </Link>
        )}
        {/* Mobile close button */}
        {isMobileOpen && (
          <button
            onClick={onMobileClose}
            className="lg:hidden p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}
        {/* Desktop collapse button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:block p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={isCollapsed ? "M13 5l7 7-7 7" : "M11 19l-7-7 7-7"}
            />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navigation.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onMobileClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${active
                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium"
                : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                }`}
              title={isCollapsed ? item.name : undefined}
            >
              <span
                className={`flex-shrink-0 ${active
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-300"
                  }`}
              >
                {item.icon}
              </span>
              {!isCollapsed && (
                <>
                  <span className="flex-1">{item.name}</span>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={`hidden lg:flex bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex-col h-screen transition-all duration-300 ${isCollapsed ? "w-20" : "w-64"
          }`}
      >
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
        className={`lg:hidden fixed top-0 left-0 h-full w-72 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex flex-col z-50 transition-transform duration-300 ${isMobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {sidebarContent}
      </div>
    </>
  );
};

export default AdminSidebar;


