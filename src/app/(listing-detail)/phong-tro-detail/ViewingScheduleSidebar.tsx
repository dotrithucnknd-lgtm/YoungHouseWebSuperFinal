"use client";

import React, { useState, FC } from "react";
import { useRouter } from "next/navigation";
import { CalendarIcon, UserPlusIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import StartRating from "@/components/StartRating";
import ButtonPrimary from "@/shared/ButtonPrimary";
import { StayDataType } from "@/data/types";
import ZaloIcon from "@/images/logo_zalo.png";

interface ViewingScheduleSidebarProps {
  roomData: StayDataType;
}

const ViewingScheduleSidebar: FC<ViewingScheduleSidebarProps> = ({ roomData }) => {
  const router = useRouter();
  const [viewDate, setViewDate] = useState("");
  const [guests, setGuests] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const ownerPhoneRaw = roomData?.author?.phone || "";
  const ownerPhone = ownerPhoneRaw.replace(/[\s.\-()]/g, "");
  const minDate = new Date().toISOString().split("T")[0];

  const handleSchedule = () => {
    setError(null);
    if (!viewDate) {
      setError("Vui lòng chọn ngày xem phòng");
      return;
    }
    const selected = new Date(viewDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selected < today) {
      setError("Ngày xem phòng không thể là ngày trong quá khứ");
      return;
    }
    const params = new URLSearchParams({
      roomId: String(roomData.id),
      viewDate,
      guests: String(guests),
    });
    router.push(`/checkout?${params.toString()}`);
  };

  return (
    <div className="listingSectionSidebar__wrap shadow-xl">
      <div className="flex justify-between items-start mb-4">
        <span className="text-2xl sm:text-3xl font-semibold text-neutral-900 dark:text-white">
          {roomData.price}
          <span className="ml-1 text-base font-normal text-neutral-500 dark:text-neutral-400">
            /tháng
          </span>
        </span>
        <StartRating />
      </div>

      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-4 bg-emerald-50 dark:bg-emerald-950/20 px-3 py-2 rounded-xl">
        Xem phòng hoàn toàn miễn phí — không cần thanh toán 
      </p>

      <div className="flex flex-col border border-neutral-200 dark:border-neutral-700 rounded-3xl overflow-hidden mb-4">
        <label className="flex items-center gap-3 p-3 sm:p-4 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
          <CalendarIcon className="w-6 h-6 text-neutral-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <input
              type="date"
              value={viewDate}
              min={minDate}
              onChange={(e) => setViewDate(e.target.value)}
              className="w-full text-base font-semibold bg-transparent border-0 p-0 focus:ring-0 text-neutral-900 dark:text-white"
              required
            />
            <span className="block text-sm text-neutral-400 font-light">Ngày xem phòng</span>
          </div>
        </label>
        <div className="w-full border-b border-neutral-200 dark:border-neutral-700" />
        <label className="flex items-center gap-3 p-3 sm:p-4">
          <UserPlusIcon className="w-6 h-6 text-neutral-400 shrink-0" />
          <div className="flex-1">
            <select
              value={guests}
              onChange={(e) => setGuests(parseInt(e.target.value, 10) || 1)}
              className="w-full text-base font-semibold bg-transparent border-0 p-0 focus:ring-0 text-neutral-900 dark:text-white cursor-pointer"
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n} người đi xem
                </option>
              ))}
            </select>
            <span className="block text-sm text-neutral-400 font-light">Số người đi xem</span>
          </div>
        </label>
      </div>

      {error && (
        <p className="text-sm text-red-600 mb-3">{error}</p>
      )}

      <div className="flex flex-col space-y-3 mb-4">
        <div className="flex justify-between text-sm text-neutral-600 dark:text-neutral-300">
          <span>Phí xem phòng</span>
          <span className="font-semibold text-emerald-600">Miễn phí</span>
        </div>
        <div className="border-b border-neutral-200 dark:border-neutral-700" />
      </div>

      <ButtonPrimary onClick={handleSchedule} className="w-full">
        Đặt lịch xem phòng
      </ButtonPrimary>

      {ownerPhone ? (
        <div className="flex gap-2 mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <a
            href={`https://zalo.me/${ownerPhone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium rounded-full border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
          >
            <Image src={ZaloIcon} alt="Zalo" width={18} height={18} />
            Zalo
          </a>
          <a
            href={`tel:${ownerPhone}`}
            className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium rounded-full border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
          >
            Gọi ngay
          </a>
        </div>
      ) : null}
    </div>
  );
};

export default ViewingScheduleSidebar;
