"use client";

import Logo from "@/shared/Logo";
import SocialsList1 from "@/shared/SocialsList1";
import { CustomLink } from "@/data/types";
import { YOUNGHOUSE_COMPANY } from "@/constants/companyInfo";
import React from "react";

export interface WidgetFooterMenu {
  id: string;
  title: string;
  menus: CustomLink[];
}

const widgetMenus: WidgetFooterMenu[] = [
  {
    id: "5",
    title: "Hệ thống",
    menus: [
      { href: "/", label: "Trang chủ" },
      { href: "/phong-tro", label: "Phòng trọ" },
      { href: "/pass-phong-public", label: "Pass phòng" },
      { href: "/wishlist", label: "Yêu thích" },
      { href: "/blog", label: "Blog" },
    ],
  },
  {
    id: "1",
    title: "Thông tin",
    menus: [
      { href: "/about", label: "Về YoungHouse" },
      { href: "/contact", label: "Liên hệ" },
      { href: "/tuyen-dung", label: "Tuyển dụng" },
      { href: "/term", label: "Điều khoản sử dụng" },
      { href: "/privacy", label: "Chính sách bảo mật" },
    ],
  },
  {
    id: "3",
    title: "Liên hệ",
    menus: [
      { href: "tel:0962888797", label: "Hotline: 0962 888 797" },
      { href: "https://zalo.me/0962888797", label: "Zalo YoungHouse" },
      { href: "mailto:bachqxhe180125@fpt.edu.vn", label: "bachqxhe180125@fpt.edu.vn" },
      { href: "https://www.facebook.com/younghousehoalac/", label: "Facebook" },
      { href: "https://www.instagram.com/younghousehoalac/", label: "Instagram" },
      { href: "https://www.tiktok.com/@younghousehoalac", label: "TikTok" },
    ],
  },
];

const isExternalLink = (href: string) =>
  href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:");

const Footer: React.FC = () => {
  const renderWidgetMenuItem = (menu: WidgetFooterMenu, index: number) => {
    return (
      <div key={index} className="text-sm">
        <h2 className="font-semibold text-neutral-700 dark:text-neutral-200">
          {menu.title}
        </h2>
        <ul className="mt-5 space-y-4">
          {menu.menus.map((item, index) => (
            <li key={index}>
              <a
                className="text-neutral-6000 dark:text-neutral-300 hover:text-black dark:hover:text-white"
                href={item.href}
                {...(isExternalLink(item.href)
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <footer className="nc-Footer relative border-t border-neutral-200 dark:border-neutral-700 pb-20 md:pb-0">
      <div className="container py-20 lg:py-24">
        <div className="grid grid-cols-2 gap-y-10 gap-x-5 sm:gap-x-8 md:grid-cols-4 lg:gap-x-10">
          <div className="col-span-2 md:col-span-4 lg:col-span-1 flex flex-col">
            <Logo />
            <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-xs">
              Nền tảng tìm phòng trọ uy tín tại Hoà Lạc — hình ảnh thật, giá rõ ràng, đặt lịch
              xem phòng miễn phí.
            </p>
            <div className="mt-5">
              <SocialsList1 className="flex items-center space-x-3 lg:space-x-0 lg:flex-col lg:space-y-2.5 lg:items-start" />
            </div>
          </div>
          {widgetMenus.map(renderWidgetMenuItem)}
        </div>
      </div>

      <div className="border-t border-neutral-200 dark:border-neutral-700">
        <div className="container py-6 space-y-2">
          <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center">
            © {new Date().getFullYear()} {YOUNGHOUSE_COMPANY.name}. Bản quyền thuộc về YoungHouse.
          </p>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 text-center leading-relaxed max-w-3xl mx-auto px-4">
            <span className="block sm:inline">Mã số thuế: {YOUNGHOUSE_COMPANY.taxId}</span>
            <span className="hidden sm:inline"> · </span>
            <span className="block sm:inline mt-1 sm:mt-0">Văn phòng: {YOUNGHOUSE_COMPANY.officeAddress}</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
