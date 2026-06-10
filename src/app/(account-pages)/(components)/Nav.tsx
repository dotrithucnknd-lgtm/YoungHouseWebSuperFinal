"use client";

import { Route } from "@/routers/types";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export const Nav = () => {
  const pathname = usePathname();

  const listNav: Route[] = [
    "/account",
    "/account-savelists",
    "/account-bookings",
    "/pass-phong",
  ];

  // Mapping pathname sang tiếng Việt
  const getVietnameseLabel = (path: string) => {
    const labelMap: Record<string, string> = {
      "/account": "Tài khoản",
      "/account-savelists": "Danh sách đã lưu",
      "/account-bookings": "Lịch xem phòng",
      "/pass-phong": "Đăng phòng",
    };
    return labelMap[path] || path.replace("-", " ").replace("/", " ");
  };

  return (
    <div className="container">
      <div className="flex space-x-8 md:space-x-14 overflow-x-auto hiddenScrollbar">
        {listNav.map((item) => {
          const isActive = pathname === item;
          console.log(item);
          return (
            <Link
              key={item}
              href={item}
              className={`block py-5 md:py-8 border-b-2 flex-shrink-0 capitalize ${
                isActive
                  ? "border-primary-500 font-medium"
                  : "border-transparent"
              }`}
            >
              {getVietnameseLabel(item)}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

