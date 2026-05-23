"use client";

import React, { FC } from "react";
import Image from "next/image";
import BookingForm from "@/components/BookingForm";
import { StayDataType } from "@/data/types";
import ZaloIcon from "@/images/logo_zalo.png";

export interface ListingDetailSidebarProps {
  roomData: StayDataType | null;
  onBookingSuccess?: () => void;
}

function getPriceNumber(priceString: string): number {
  const priceNum = parseInt(priceString.replace(/\D/g, ""), 10);
  return Number.isNaN(priceNum) ? 0 : priceNum;
}

const ListingDetailSidebar: FC<ListingDetailSidebarProps> = ({
  roomData,
  onBookingSuccess,
}) => {
  const ownerPhoneRaw = roomData?.author?.phone || "";
  const ownerPhone = ownerPhoneRaw.replace(/[\s.\-()]/g, "");
  const hasOwnerPhone = Boolean(ownerPhone);

  return (
    <div className="listingSectionSidebar__wrap shadow-xl">
      {hasOwnerPhone ? (
        <div className="flex gap-3 pb-4">
          <a
            href={`https://zalo.me/${ownerPhone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 nc-Button relative h-auto inline-flex items-center justify-center rounded-full transition-colors text-sm font-medium px-4 py-2.5 ttnc-ButtonSecondary bg-white text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 w-full gap-2"
          >
            <Image
              src={ZaloIcon}
              alt="Zalo"
              width={18}
              height={18}
              className="object-contain"
            />
            Zalo
          </a>

          <a
            href={`tel:${ownerPhone}`}
            className="flex-1 nc-Button relative h-auto inline-flex items-center justify-center rounded-full transition-colors text-sm font-medium px-4 py-2.5 ttnc-ButtonSecondary bg-white text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 w-full gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            {ownerPhoneRaw}
          </a>
        </div>
      ) : (
        <div className="pb-4 text-sm text-neutral-500 dark:text-neutral-400 text-center italic">
          Chủ phòng chưa cập nhật số điện thoại liên hệ.
        </div>
      )}

      <div className="border-t border-neutral-200 dark:border-neutral-700 mb-4"></div>

      {roomData && (
        <BookingForm
          roomId={String(roomData.id)}
          roomTitle={roomData.title}
          roomPrice={getPriceNumber(roomData.price)}
          onSuccess={onBookingSuccess}
        />
      )}
    </div>
  );
};

export default ListingDetailSidebar;
