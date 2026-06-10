"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  fetchMyBookings,
  cancelBooking,
  BookingWithDetails,
} from "@/lib/supabaseServices";
import ButtonSecondary from "@/shared/ButtonSecondary";

const AccountBookingsPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    loadBookings();
  }, [user]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const { bookings: data, error } = await fetchMyBookings();

      if (error) {
        console.error("Error loading bookings:", error);
      } else {
        setBookings(data);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId: string) => {
    if (!confirm("Bạn có chắc chắn muốn hủy lịch xem phòng này?")) {
      return;
    }

    setCancelling(bookingId);
    try {
      const { success, error } = await cancelBooking(bookingId);

      if (success) {
        alert("Đã hủy lịch xem phòng thành công!");
        loadBookings();
      } else {
        alert(`Lỗi: ${error}`);
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      alert("Có lỗi xảy ra khi hủy đơn");
    } finally {
      setCancelling(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    };

    const labels = {
      pending: "Chờ duyệt",
      approved: "Đã duyệt",
      rejected: "Đã từ chối",
      cancelled: "Đã hủy",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${badges[status as keyof typeof badges]}`}
      >
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container py-16">
      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-semibold">Lịch xem phòng</h2>
          <p className="text-neutral-500 dark:text-neutral-400 mt-2">
            Quản lý các lịch hẹn xem phòng của bạn
          </p>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-neutral-500">Đang tải...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16 bg-neutral-50 dark:bg-neutral-800 rounded-2xl">
            <p className="text-neutral-500 mb-4">
              Bạn chưa có lịch xem phòng nào
            </p>
            <ButtonSecondary href="/phong-tro">
              Tìm phòng trọ ngay
            </ButtonSecondary>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Room Info */}
                  <div className="flex-shrink-0">
                    {booking.rooms.banner && (
                      <img
                        src={booking.rooms.banner}
                        alt={booking.rooms.title}
                        className="w-full lg:w-48 h-32 object-cover rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() =>
                          router.push(`/phong-tro-detail?id=${booking.room_id}`)
                        }
                      />
                    )}
                  </div>

                  {/* Booking Details */}
                  <div className="flex-grow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3
                          className="text-xl font-semibold mb-1 cursor-pointer hover:text-primary-600 transition-colors"
                          onClick={() =>
                            router.push(`/phong-tro-detail?id=${booking.room_id}`)
                          }
                        >
                          {booking.rooms.title}
                        </h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          {booking.rooms.address}
                        </p>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-neutral-500 mb-1">Ngày xem phòng</p>
                        <p className="font-medium">
                          {new Date(booking.check_in_date).toLocaleDateString(
                            "vi-VN"
                          )}
                        </p>
                     
                      
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500 mb-1">Số người</p>
                        <p className="font-medium">{booking.guests_count} người</p>
                      </div>
                    </div>

                    

                    {booking.message && (
                      <div className="mb-4 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                        <p className="text-xs text-neutral-500 mb-1">Lời nhắn:</p>
                        <p className="text-sm">{booking.message}</p>
                      </div>
                    )}

                    {booking.rejection_reason && (
                      <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                        <p className="text-xs text-red-600 dark:text-red-400 mb-1">
                          Lý do từ chối:
                        </p>
                        <p className="text-sm text-red-800 dark:text-red-200">
                          {booking.rejection_reason}
                        </p>
                      </div>
                    )}

                    {booking.status === "approved" && (
                      <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <p className="text-sm text-green-800 dark:text-green-200">
                          ✅ Lịch xem phòng đã được xác nhận. Vui lòng liên hệ chủ
                          nhà để sắp xếp giờ xem cụ thể.
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    {booking.status === "pending" && (
                      <div className="mt-4">
                        <ButtonSecondary
                          onClick={() => handleCancel(booking.id)}
                          disabled={cancelling === booking.id}
                          className="w-full sm:w-auto"
                        >
                          {cancelling === booking.id
                            ? "Đang xử lý..."
                            : "Hủy lịch xem phòng"}
                        </ButtonSecondary>
                      </div>
                    )}

                    <p className="text-xs text-neutral-400 mt-3">
                      Đặt lúc:{" "}
                      {new Date(booking.created_at).toLocaleString("vi-VN")}
                    </p>
                    {booking.approved_at && (
                      <p className="text-xs text-neutral-400">
                        {booking.status === "approved" ? "Duyệt" : "Từ chối"} lúc:{" "}
                        {new Date(booking.approved_at).toLocaleString("vi-VN")}
                        {booking.approver && ` bởi ${booking.approver.name}`}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountBookingsPage;


