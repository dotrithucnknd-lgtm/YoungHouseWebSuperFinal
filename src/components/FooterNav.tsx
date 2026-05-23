"use client";

import {
  HomeIcon,
  HomeModernIcon,
  BuildingOffice2Icon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline";
import React, { useEffect, useRef } from "react";
import { PathName } from "@/routers/types";
import MenuBar from "@/shared/MenuBar";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Always show FooterNav: remove scroll hide/show behavior

interface NavItem {
  name: string;
  link?: PathName;
  icon: any;
}

const NAV: NavItem[] = [
  {
    name: "Trang chủ",
    link: "/",
    icon: HomeIcon,
  },
  {
    name: "Phòng trọ",
    link: "/phong-tro",
    icon: HomeModernIcon,
  },
  {
    name: "Pass Phòng",
    link: "/pass-phong-public",
    icon: BuildingOffice2Icon,
  },
  {
    name: "Video review",
    link: "/video-review",
    icon: VideoCameraIcon,
  },
  
  
];

const FooterNav = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();

  useEffect(() => {
    // No-op: keep visible on scroll
  }, []);

  const renderItem = (item: NavItem, index: number) => {
    const isActive =
      item.link &&
      (pathname === item.link ||
        (item.link === "/video-review" && pathname?.startsWith("/video-review")));

    return item.link ? (
      <Link
        key={index}
        href={item.link}
        className={`flex flex-col items-center justify-between text-neutral-500 dark:text-neutral-300/90 ${
          isActive ? "text-neutral-900 dark:text-neutral-100" : ""
        }`}
      >
        <item.icon className={`w-6 h-6 ${isActive ? "text-red-600" : ""}`} />
        <span
          className={`text-[11px] leading-none mt-1 ${
            isActive ? "text-red-600" : ""
          }`}
        >
          {item.name}
        </span>
      </Link>
    ) : (
      <div
        key={index}
        className={`flex flex-col items-center justify-between text-neutral-500 dark:text-neutral-300/90 ${
          isActive ? "text-neutral-900 dark:text-neutral-100" : ""
        }`}
      >
        <item.icon iconClassName="w-6 h-6" className={``} />
        <span className="text-[11px] leading-none mt-1">{item.name}</span>
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className="FooterNav block md:!hidden h-16 p-2 bg-white dark:bg-neutral-800 fixed top-auto bottom-0 inset-x-0 z-50 border-t border-neutral-300 dark:border-neutral-700 
      transition-transform duration-300 ease-in-out"
    >
      <div className="w-full max-w-lg flex justify-around mx-auto text-sm text-center ">
        {/* MENU */}
        {NAV.map(renderItem)}
      </div>
    </div>
  );
};

export default FooterNav;

