"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ButtonPrimary from "@/shared/ButtonPrimary";
import ButtonSecondary from "@/shared/ButtonSecondary";
import SupabaseImage from "@/components/SupabaseImage";
import { CheckCircleIcon, CalendarIcon, UserGroupIcon } from "@heroicons/react/24/outline";

interface BookingSummary {
  id: string;
  check_in_date: string;
  guests_count: number;
  status: string;
  message: string | null;
  rooms: {
    title: string;
    address: string;
    banner: string | null;
    price: number;
  } | null;
}

function PayDoneContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const isGuest = searchParams.get("guest") === "1";
  const [booking, setBooking] = useState<BookingSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookingId) {
      setLoading(false);
      return;
    }
    fetch(`/api/bookings/viewing/${bookingId}`)
      .then((res) => res.json())
      .then((data) => {
        setBooking(data.booking ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [bookingId]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div className="nc-PayPage">
      <main className="container mt-11 mb-24 lg:mb-32">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <CheckCircleIcon className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-3xl font-semibold text-neutral-900 dark:text-white">
              Đặt lịch xem phòng thành công!
            </h2>
            <p className="text-neutral-500 mt-2">
              Young House sẽ liên hệ xác nhận lịch hẹn qua điện thoại trong thời gian sớm nhất.
            </p>
          </div>

          {booking && (
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6 space-y-5 shadow-sm">
              {booking.rooms?.banner && (
                <div className="relative w-full h-40 rounded-xl overflow-hidden">
                  <SupabaseImage
                    src={booking.rooms.banner}
                    alt={booking.rooms.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <div>
                <p className="text-xs text-neutral-500">{booking.rooms?.address}</p>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mt-1">
                  {booking.rooms?.title}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
                  <CalendarIcon className="w-5 h-5 text-primary-6000 shrink-0" />
                  <div>
                    <p className="text-xs text-neutral-500">Ngày xem phòng</p>
                    <p className="text-sm font-semibold">{formatDate(booking.check_in_date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
                  <UserGroupIcon className="w-5 h-5 text-primary-6000 shrink-0" />
                  <div>
                    <p className="text-xs text-neutral-500">Số người</p>
                    <p className="text-sm font-semibold">{booking.guests_count} người</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between text-sm py-3 border-t border-neutral-200 dark:border-neutral-700">
                <span className="text-neutral-500">Mã lịch hẹn</span>
                <span className="font-mono font-medium text-xs">
                  #{booking.id.slice(0, 8).toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Trạng thái</span>
                <span className="font-medium text-amber-600">Chờ xác nhận</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Thanh toán</span>
                <span className="font-semibold text-emerald-600">Miễn phí (xem phòng)</span>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 mt-8 justify-center">
            {!isGuest && (
              <ButtonPrimary href="/account-bookings">Xem lịch hẹn của tôi</ButtonPrimary>
            )}
            <ButtonSecondary href="/phong-tro">Tiếp tục tìm phòng</ButtonSecondary>
            {isGuest && (
              <ButtonPrimary href="/login">Đăng nhập để quản lý lịch hẹn</ButtonPrimary>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function PayDonePage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-24">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" />
        </div>
      }
    >
      <PayDoneContent />
    </Suspense>
  );
}
