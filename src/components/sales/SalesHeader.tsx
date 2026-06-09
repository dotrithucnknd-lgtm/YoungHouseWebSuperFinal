"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeftIcon, Bars3Icon } from "@heroicons/react/24/outline";
import AvatarDropdown from "@/app/(client-components)/(Header)/AvatarDropdown";
import SalesNavQuickActions from "./SalesNavQuickActions";

interface SalesHeaderProps {
  title?: string;
  subtitle?: string;
  referralCode?: string;
  onMobileMenuClick?: () => void;
}

const SalesHeader: React.FC<SalesHeaderProps> = ({
  title,
  subtitle,
  referralCode,
  onMobileMenuClick,
}) => {
  return (
    <header className="relative z-30 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-4 sm:px-6 py-3 sm:py-4">
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <button
            onClick={onMobileMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 shrink-0"
            aria-label="Mở menu"
          >
            <Bars3Icon className="w-5 h-5" />
          </button>

          <Link
            href="/"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 shrink-0"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Trang chủ
          </Link>

          <div className="min-w-0 flex-1">
            {title && (
              <h1 className="text-base sm:text-xl font-bold text-neutral-900 dark:text-white truncate">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="hidden sm:block text-xs text-neutral-500 truncate">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {referralCode && <SalesNavQuickActions referralCode={referralCode} />}
          <AvatarDropdown />
        </div>
      </div>
    </header>
  );
};

export default SalesHeader;
