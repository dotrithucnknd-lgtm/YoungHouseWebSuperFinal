"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
} from "@heroicons/react/24/solid";
import ZaloIcon from "@/images/logo_zalo.png";
import { YOUNGHOUSE_COMPANY } from "@/constants/companyInfo";

const MESSENGER_URL = "https://www.facebook.com/younghousehoalac";
const ZALO_URL = `https://zalo.me/${YOUNGHOUSE_COMPANY.phoneTel}`;

const channels = [
  {
    name: "Messenger",
    desc: "Chat trực tiếp qua Facebook",
    href: MESSENGER_URL,
    external: true,
    iconBg: "bg-[#0068FF]",
    icon: <i className="lab la-facebook-messenger text-white text-xl leading-none" aria-hidden />,
  },
  {
    name: "Zalo",
    desc: "Nhắn tin qua Zalo",
    href: ZALO_URL,
    external: true,
    iconBg: "bg-[#0068FF]",
    icon: <Image src={ZaloIcon} alt="" width={22} height={22} className="object-contain" />,
  },
  {
    name: "Gọi điện",
    desc: `Hotline: ${YOUNGHOUSE_COMPANY.phone}`,
    href: `tel:${YOUNGHOUSE_COMPANY.phoneTel}`,
    external: false,
    iconBg: "bg-emerald-500",
    icon: <PhoneIcon className="w-5 h-5 text-white" aria-hidden />,
  },
];

export default function ContactChatWidget() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-24 right-4 z-[1001] flex flex-col items-end gap-3 md:bottom-6 md:right-6">
      {open && (
        <div
          className="w-[min(calc(100vw-2rem),320px)] overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 shadow-2xl dark:border-neutral-700 dark:bg-neutral-900"
          role="dialog"
          aria-label="Liên hệ Young House"
        >
          <div className="bg-[#0068FF] px-5 py-4 text-white">
            <h3 className="text-lg font-bold leading-snug">Liên hệ với Young House</h3>
            <p className="mt-1 text-sm text-white/90">Chọn kênh liên lạc bạn muốn</p>
          </div>

          <div className="space-y-3 p-4">
            {channels.map((channel) => (
              <a
                key={channel.name}
                href={channel.href}
                {...(channel.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3 transition hover:border-[#0068FF]/30 hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-[#0068FF]/40"
              >
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${channel.iconBg}`}
                >
                  {channel.icon}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-neutral-900 dark:text-white">
                    {channel.name}
                  </span>
                  <span className="block text-xs text-neutral-500 dark:text-neutral-400">
                    {channel.desc}
                  </span>
                </span>
              </a>
            ))}
          </div>

          <div className="border-t border-neutral-200 bg-neutral-100 px-4 py-3 text-center dark:border-neutral-700 dark:bg-neutral-800/80">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Hỗ trợ 24/7 từ Thứ 2 - Chủ nhật
            </p>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0068FF] text-white shadow-lg shadow-[#0068FF]/25 ring-2 ring-white transition hover:scale-105 active:scale-95 dark:ring-neutral-900"
        aria-label={open ? "Đóng liên hệ" : "Mở liên hệ Young House"}
        aria-expanded={open}
      >
        {open ? (
          <XMarkIcon className="h-7 w-7" />
        ) : (
          <ChatBubbleLeftRightIcon className="h-7 w-7" />
        )}
      </button>
    </div>
  );
}
