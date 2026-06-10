"use client";

import React from "react";
import Image from "next/image";
import ZaloIcon from "@/images/logo_zalo.png";

const ZALO_CHAT_URL = "https://zalo.me/0962888797";

export default function ZaloWidget() {
  return (
    <a
      href={ZALO_CHAT_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="group fixed bottom-24 right-4 z-[1001] flex h-14 w-14 items-center justify-center overflow-visible transition-transform duration-300 ease-out hover:scale-110 active:scale-95 motion-reduce:transition-none motion-reduce:hover:scale-100 md:bottom-6 md:right-6"
      aria-label="Chat Zalo — YoungHouse Hòa Lạc"
    >
      <span
        className="pointer-events-none absolute inset-0 z-0 rounded-full bg-[#0068FF]/25 motion-safe:animate-zalo-widget-ripple motion-reduce:hidden"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute inset-0 z-0 rounded-full bg-[#0068FF]/20 motion-safe:animate-zalo-widget-ripple motion-reduce:hidden [animation-delay:1.2s]"
        aria-hidden
      />
      <span className="relative z-[1] flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white shadow-lg shadow-[#0068FF]/15 ring-2 ring-[#0068FF]/40 transition-shadow duration-300 group-hover:shadow-xl group-hover:shadow-[#0068FF]/20 group-hover:ring-[#0068FF]/55">
        <Image
          src={ZaloIcon}
          alt=""
          width={36}
          height={36}
          className="object-contain drop-shadow-sm transition-transform duration-300 ease-out will-change-transform group-hover:scale-110 group-hover:rotate-[-8deg] motion-reduce:group-hover:rotate-0"
          priority={false}
        />
      </span>
    </a>
  );
}



