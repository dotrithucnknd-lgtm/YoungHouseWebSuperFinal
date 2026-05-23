"use client";

import React, { FC } from "react";
import Logo from "@/shared/Logo";
import Navigation from "@/shared/Navigation/Navigation";
import SearchDropdown from "./SearchDropdown";
import ButtonPrimary from "@/shared/ButtonPrimary";
import MenuBar from "@/shared/MenuBar";
import SwitchDarkMode from "@/shared/SwitchDarkMode";
import Link from "next/link";
import LangDropdown from "./LangDropdown";
import NotifyDropdown from "./NotifyDropdown";
import AvatarDropdown from "./AvatarDropdown";
import { useAuth } from "@/contexts/AuthContext";

export interface MainNav1Props {
  className?: string;
}

const MainNav1: FC<MainNav1Props> = ({ className = "" }) => {
  const { user } = useAuth();
  
  return (
    <div className={`nc-MainNav1 relative z-10 ${className}`}>
      <div className="px-4 lg:container h-20 relative flex justify-between">
        <div className="hidden md:flex justify-start flex-none space-x-4 sm:space-x-10">
          <Logo className="w-20 self-center" />
        </div>

        <div className="hidden md:flex flex-1 justify-center">
          <Navigation />
        </div>

        <div className="flex lg:hidden flex-[3] max-w-lg !mx-auto md:px-3 ">
          <div className="self-center flex-1">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-2">
                <MenuBar />
                <Logo className="w-14" />
              </div>
              <div className="flex items-center space-x-2">
                {user ? (
                  <>
                    {user.role === 'admin' && (
                      <Link
                        href="/admin"
                        className="inline-flex items-center whitespace-nowrap overflow-visible text-xs font-medium px-2 pr-2.5 py-1 rounded-full bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-white"
                      >
                        Admin
                      </Link>
                    )}
                    {user.role === 'operator' && (
                      <Link
                        href="/operator"
                        className="inline-flex items-center whitespace-nowrap overflow-visible text-xs font-medium px-2 pr-2.5 py-1 rounded-full bg-green-50 dark:bg-green-900 text-green-600 dark:text-white"
                      >
                        Vận hành
                      </Link>
                    )}
                    <NotifyDropdown className="flex items-center" />
                    <AvatarDropdown />
                  </>
                ) : (
                  <>
                    <Link href="/login" className="text-sm font-medium">Đăng nhập</Link>
                    <ButtonPrimary href="/signup" className="!py-1.5 !px-3">Đăng ký</ButtonPrimary>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="hidden md:flex flex-shrink-0 justify-end flex-none lg:flex-none text-neutral-700 dark:text-neutral-100">
          <div className="hidden xl:flex space-x-0.5">
            <SwitchDarkMode />
            <SearchDropdown className="flex items-center" />
            <div className="px-1" />
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="self-center px-4 py-2 rounded-full text-sm font-medium bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors flex items-center gap-1.5"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Dashboard Admin
                  </Link>
                )}
                {user.role === 'operator' && (
                  <Link
                    href="/operator"
                    className="self-center px-4 py-2 rounded-full text-sm font-medium bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors flex items-center gap-1.5"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Vận hành
                  </Link>
                )}
                <NotifyDropdown className="flex items-center" />
                <AvatarDropdown />
              </>
            ) : (
              <ButtonPrimary className="self-center" href="/login">
                Đăng nhập
              </ButtonPrimary>
            )}
          </div>

          <div className="flex xl:hidden items-center">
            <SwitchDarkMode />
            <div className="px-0.5" />
            <MenuBar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainNav1;

