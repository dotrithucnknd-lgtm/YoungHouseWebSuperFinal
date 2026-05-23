"use client";

import React, { useState, useEffect } from "react";
import { createBooking } from "@/lib/supabaseServices";
import { lookupCTVByReferralCode, createReferral, CTVProfile } from "@/lib/ctvServices";
import ButtonPrimary from "@/shared/ButtonPrimary";
import Input from "@/shared/Input";
import Textarea from "@/shared/Textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";

export interface BookingFormProps {
  roomId: string;
  roomTitle: string;
  roomPrice: number;
  onSuccess?: () => void;
}

const BookingForm: React.FC<BookingFormProps> = ({
  roomId,
  roomTitle,
  roomPrice,
  onSuccess,
}) => {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [referralCTV, setReferralCTV] = useState<CTVProfile | null>(null);

  // Check for referral code in URL
  useEffect(() => {
    const refCode = searchParams?.get('ref');
    if (refCode) {
      lookupCTVByReferralCode(refCode).then(({ data }) => {
        if (data) setReferralCTV(data);
      });
    }
  }, [searchParams]);

  const [formData, setFormData] = useState({
    check_in_date: "",
    guests_count: 1,
    phone: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      router.push("/login");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // Validate date
      const viewDate = new Date(formData.check_in_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (viewDate < today) {
        setError("Ngày xem phòng không thể là ngày trong quá khứ");
        setLoading(false);
        return;
      }

      const { success, bookingId, error: bookingError } = await createBooking({
        room_id: roomId,
        check_in_date: formData.check_in_date,
        check_out_date: formData.check_in_date, // Same as check_in for viewing appointment
        guests_count: formData.guests_count,
        total_price: 0, // No price for viewing appointment
        message: `SĐT: ${formData.phone}${formData.message ? '\n' + formData.message : ''}`,
      });

      if (bookingError) {
        setError(bookingError);
        setLoading(false);
        return;
      }

      // Create CTV referral if booking via referral link
      if (referralCTV && bookingId) {
        await createReferral(
          referralCTV.id,
          roomId,
          bookingId,
          user?.id
        );
      }

      if (success) {
        setSuccess(true);
        setError(null);
        
        // Reset form
        setFormData({
          check_in_date: "",
          guests_count: 1,
          phone: "",
          message: "",
        });

        if (onSuccess) {
          onSuccess();
        }

        // Redirect after 2 seconds
        setTimeout(() => {
          router.push("/account-bookings");
        }, 2000);
      }
    } catch (err) {
      setError("Có lỗi xảy ra khi đặt lịch xem phòng");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
      <div className="mb-3">
        <h3 className="text-base font-semibold">Đặt lịch xem phòng</h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-1">
          {roomTitle}
        </p>
      </div>

      {success && (
        <div className="p-3 mb-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <p className="text-sm text-green-800 dark:text-green-200">
            ✅ Đặt lịch thành công!
          </p>
        </div>
      )}

      {error && (
        <div className="p-3 mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-800 dark:text-red-200">❌ {error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium">
              Ngày xem phòng <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={formData.check_in_date}
              onChange={(e) =>
                setFormData({ ...formData, check_in_date: e.target.value })
              }
              required
              min={new Date().toISOString().split("T")[0]}
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-xs font-medium">
              Số người ở <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              value={formData.guests_count}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  guests_count: parseInt(e.target.value) || 1,
                })
              }
              required
              min={1}
              className="mt-1"
            />
          </div>
        </div>

        <div className="-mt-1">
          <label className="text-xs font-medium">
            Số điện thoại <span className="text-red-500">*</span>
          </label>
          <Input
            type="tel"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            required
            placeholder="0123456789"
            pattern="[0-9]{10,11}"
            className="mt-1"
          />
        </div>

        <div className="-mt-1">
          <label className="text-xs font-medium">Lời nhắn (tùy chọn)</label>
          <Textarea
            value={formData.message}
            onChange={(e) =>
              setFormData({ ...formData, message: e.target.value })
            }
            rows={2}
            placeholder="Ghi chú thời gian..."
            className="mt-1 text-sm"
          />
        </div>

        {referralCTV && (
          <div className="-mt-1 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              🤝 Giới thiệu bởi CTV: <strong>{referralCTV.referral_code}</strong>
            </p>
          </div>
        )}

        <ButtonPrimary
          type="submit"
          disabled={loading || success}
          className="w-full !py-3 !bg-green-600 hover:!bg-green-700"
        >
          {loading ? "Đang xử lý..." : "ĐẶT LỊCH XEM PHÒNG NGAY"}
        </ButtonPrimary>

        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Hỗ trợ 24/7 (T2–CN)
        </p>

        {!user && (
          <p className="text-xs text-center text-neutral-500 dark:text-neutral-400">
            Cần{" "}
            <a href="/login" className="text-primary-600 hover:underline">
              đăng nhập
            </a>{" "}
            để đặt lịch
          </p>
        )}
      </form>
    </div>
  );
};

export default BookingForm;


