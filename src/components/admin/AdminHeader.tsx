"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeftIcon, Bars3Icon } from "@heroicons/react/24/outline";
import AvatarDropdown from "@/app/(client-components)/(Header)/AvatarDropdown";
import NotifyDropdown from "@/app/(client-components)/(Header)/NotifyDropdown";

interface AdminHeaderProps {
  title?: string;
  subtitle?: string;
  onMobileMenuClick?: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ title, subtitle, onMobileMenuClick }) => {
  return (
    <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
          {/* Mobile hamburger button */}
          <button
            onClick={onMobileMenuClick}
            className="lg:hidden inline-flex shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 p-2 text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
            aria-label="Mở menu"
          >
            <Bars3Icon className="h-5 w-5" />
          </button>

          {/* Back to home button - desktop only */}
          <Link
            href="/"
            className="hidden sm:inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
          >
            <ArrowLeftIcon className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Trang chủ</span>
          </Link>

          <div className="min-w-0 flex-1">
            {title && (
              <h1 className="text-lg sm:text-2xl font-bold text-neutral-900 dark:text-white truncate">{title}</h1>
            )}
            {subtitle && (
              <p className="hidden sm:block text-sm text-neutral-600 dark:text-neutral-400 mt-1">{subtitle}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Notifications */}
          <NotifyDropdown className="flex items-center" />

          {/* Avatar Dropdown */}
          <AvatarDropdown />
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;
