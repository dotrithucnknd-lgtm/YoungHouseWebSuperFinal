import React, { FC } from "react";
import Logo from "@/shared/Logo";
import MenuBar from "@/shared/MenuBar";
import LangDropdown from "./LangDropdown";
import NotifyDropdown from "./NotifyDropdown";
import AvatarDropdown from "./AvatarDropdown";
import DropdownTravelers from "./DropdownTravelers";
import ButtonPrimary from "@/shared/ButtonPrimary";
import Link from "next/link";
import TemplatesDropdown from "./TemplatesDropdown";
import { Route } from "@/routers/types";

export interface MainNav2Props {
  className?: string;
}

const MainNav2: FC<MainNav2Props> = ({ className = "" }) => {
  return (
    <div className={`MainNav2 relative z-10 ${className}`}>
      <div className="px-4 h-20 lg:container flex justify-between">
        <div className="hidden md:flex justify-start flex-1 space-x-3 sm:space-x-8 lg:space-x-10">
          <Logo className="w-32 self-center" />
          <div className="hidden lg:block self-center h-10 border-l border-neutral-300 dark:border-neutral-500"></div>
          <div className="hidden lg:flex ">
            <DropdownTravelers />
          </div>
        </div>

        <div className="self-center lg:hidden flex-[3] max-w-lg !mx-auto md:px-3">
          <div className="flex items-center justify-between py-2 w-full">
            <div className="flex items-center space-x-2">
              <MenuBar />
              <Logo className="w-20" />
            </div>
            <div className="flex items-center space-x-2">
              <Link href="/login" className="text-sm font-medium">Đăng nhập</Link>
              <ButtonPrimary href="/signup" className="!py-1.5 !px-3">Đăng ký</ButtonPrimary>
            </div>
          </div>
        </div>

        <div className="hidden md:flex flex-shrink-0 justify-end flex-1 lg:flex-none text-neutral-700 dark:text-neutral-100">
          <div className="hidden lg:flex space-x-1">
            <TemplatesDropdown />
            <LangDropdown />

            <NotifyDropdown />
            <AvatarDropdown />
          </div>
          <div className="flex space-x-2 lg:hidden">
            <NotifyDropdown />
            <AvatarDropdown />
            <MenuBar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainNav2;

