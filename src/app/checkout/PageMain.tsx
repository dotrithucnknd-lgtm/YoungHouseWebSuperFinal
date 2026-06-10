"use client";

import React, { FC, useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Input from "@/shared/Input";
import Label from "@/components/Label";
import Textarea from "@/shared/Textarea";
import ButtonPrimary from "@/shared/ButtonPrimary";
import SupabaseImage from "@/components/SupabaseImage";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchRoomById,
  createBooking,
} from "@/lib/supabaseServices";
import {
  lookupCTVByReferralCode,
  createReferral,
  type CTVProfile,
} from "@/lib/ctvServices";
import { StayDataType } from "@/data/types";

export interface CheckOutPagePageMainProps {
  className?: string;
}

function CheckOutContent({ className = "" }: CheckOutPagePageMainProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  const roomId = searchParams.get("roomId") || "";
  const viewDate = searchParams.get("viewDate") || "";
  const guests = parseInt(searchParams.get("guests") || "1", 10);

  const [room, setRoom] = useState<StayDataType | null>(null);
  const [loadingRoom, setLoadingRoom] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [referralCTV, setReferralCTV] = useState<CTVProfile | null>(null);

  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const refCode = searchParams.get("ref");
    if (refCode) {
      lookupCTVByReferralCode(refCode).then(({ data }) => {
        if (data) setReferralCTV(data);
      });
    }
  }, [searchParams]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.phone) setPhone(user.phone);
  }, [user]);

  useEffect(() => {
    if (!roomId || !viewDate) {
      setLoadingRoom(false);
      return;
    }
    fetchRoomById(roomId).then((data) => {
      setRoom(data);
      setLoadingRoom(false);
    });
  }, [roomId, viewDate]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleConfirm = async () => {
    if (!room || !viewDate || !user) return;

    if (!phone.trim() || phone.replace(/\D/g, "").length < 10) {
      setError("Vui lòng nhập số điện thoại hợp lệ (10–11 số)");
      return;
    }

    setSubmitting(true);
    setError(null);

    const note = `SĐT: ${phone.trim()}${message.trim() ? `\n${message.trim()}` : ""}`;

    const { success, bookingId, error: bookingError } = await createBooking({
      room_id: roomId,
      check_in_date: viewDate,
      check_out_date: viewDate,
      guests_count: guests,
      total_price: 0,
      message: note,
    });

    if (bookingError || !success) {
      setError(bookingError || "Không thể đặt lịch xem phòng");
      setSubmitting(false);
      return;
    }

    if (referralCTV && bookingId) {
      await createReferral(referralCTV.id, roomId, bookingId, user.id);
    }

    router.push(`/pay-done?bookingId=${bookingId}`);
  };

  if (authLoading || loadingRoom) {
    return (
      <div className="flex justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (!roomId || !viewDate) {
    return (
      <div className="text-center py-24">
        <p className="text-neutral-500 mb-4">Thiếu thông tin đặt lịch. Vui lòng chọn phòng và ngày xem trước.</p>
        <ButtonPrimary href="/phong-tro">Quay lại danh sách phòng</ButtonPrimary>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="text-center py-24">
        <p className="text-neutral-500 mb-4">Không tìm thấy thông tin phòng.</p>
        <ButtonPrimary href="/phong-tro">Quay lại danh sách phòng</ButtonPrimary>
      </div>
    );
  }

  const roomImage = room.galleryImgs?.[0] || room.featuredImage;

  return (
    <div className={`nc-CheckOutPagePageMain ${className}`}>
      <main className="container mt-11 mb-24 lg:mb-32 flex flex-col-reverse lg:flex-row gap-8">
        <div className="w-full lg:w-3/5 xl:w-2/3 lg:pr-6">
          <div className="w-full flex flex-col sm:rounded-2xl sm:border border-neutral-200 dark:border-neutral-700 space-y-6 px-0 sm:p-6 xl:p-8">
            <div>
              <h2 className="text-2xl lg:text-3xl font-semibold text-neutral-900 dark:text-white">
                Xác nhận lịch xem phòng
              </h2>
              <p className="text-sm text-neutral-500 mt-2">
                Bạn chỉ đi xem phòng — không cần thanh toán hay đặt cọc.
              </p>
            </div>

            <div className="border-b border-neutral-200 dark:border-neutral-700" />

            <div>
              <h3 className="text-lg font-semibold mb-4">Thông tin liên hệ</h3>
              <div className="space-y-4">
                <div>
                  <Label>
                    Họ tên
                  </Label>
                  <Input value={user?.name || user?.email || ""} disabled className="mt-1.5 bg-neutral-50 dark:bg-neutral-800" />
                </div>
                <div>
                  <Label>
                    Số điện thoại <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0123456789"
                    className="mt-1.5"
                    required
                  />
                </div>
                <div>
                  <Label>Ghi chú cho chủ phòng (tùy chọn)</Label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    placeholder="VD: Em muốn xem phòng vào buổi chiều, khoảng 14h–16h..."
                    className="mt-1.5"
                  />
                </div>
              </div>
            </div>

            {referralCTV && (
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 text-sm text-blue-700 dark:text-blue-300">
                Giới thiệu bởi CTV: <strong>{referralCTV.referral_code}</strong>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/30">
              <p className="text-sm text-emerald-800 dark:text-emerald-300">
                <strong>Lưu ý:</strong> Sau khi xác nhận, Young House sẽ liên hệ qua điện thoại để sắp xếp lịch hẹn cụ thể. Trạng thái lịch hẹn có thể xem tại mục Lịch xem phòng.
              </p>
            </div>

            <ButtonPrimary
              onClick={handleConfirm}
              disabled={submitting}
              className="w-full sm:w-auto !px-8"
            >
              {submitting ? "Đang gửi..." : "Xác nhận đặt lịch xem phòng"}
            </ButtonPrimary>
          </div>
        </div>

        <div className="w-full lg:w-2/5">
          <div className="w-full flex flex-col sm:rounded-2xl lg:border border-neutral-200 dark:border-neutral-700 space-y-5 px-0 sm:p-6 xl:p-8 sticky top-28">
            <div className="flex gap-4">
              {roomImage && (
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shrink-0">
                  <SupabaseImage
                    src={roomImage}
                    alt={room.title}
                    fill
                    className="object-cover"
                    sizes="120px"
                  />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs text-neutral-500 line-clamp-1">{room.address}</p>
                <p className="text-base font-semibold text-neutral-900 dark:text-white mt-1 line-clamp-2">
                  {room.title}
                </p>
                <p className="text-sm text-neutral-500 mt-1">{room.price}/tháng</p>
              </div>
            </div>

            <div className="border-b border-neutral-200 dark:border-neutral-700" />

            <h3 className="text-lg font-semibold">Chi tiết lịch hẹn</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-neutral-500">Ngày xem phòng</span>
                <span className="font-medium text-right">{formatDate(viewDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Số người đi xem</span>
                <span className="font-medium">{guests} người</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Phí xem phòng</span>
                <span className="font-semibold text-emerald-600">Miễn phí</span>
              </div>
            </div>

            <div className="border-b border-neutral-200 dark:border-neutral-700" />

            <div className="flex justify-between font-semibold text-base">
              <span>Tổng cộng</span>
              <span className="text-emerald-600">Miễn phí</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const CheckOutPagePageMain: FC<CheckOutPagePageMainProps> = (props) => (
  <Suspense
    fallback={
      <div className="flex justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" />
      </div>
    }
  >
    <CheckOutContent {...props} />
  </Suspense>
);

export default CheckOutPagePageMain;
