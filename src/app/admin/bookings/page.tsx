"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  fetchAllBookings,
  fetchPendingBookings,
  approveBooking,
  rejectBooking,
  BookingWithDetails,
} from "@/lib/supabaseServices";
import ButtonPrimary from "@/shared/ButtonPrimary";
import ButtonSecondary from "@/shared/ButtonSecondary";
import Input from "@/shared/Input";

const AdminBookingsPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending">("pending");
  const [processing, setProcessing] = useState<string | null>(null);
  const [rejectionModal, setRejectionModal] = useState<{
    show: boolean;
    bookingId: string | null;
    reason: string;
  }>({
    show: false,
    bookingId: null,
    reason: "",
  });

  useEffect(() => {
    if (user) {
      loadBookings();
    }
  }, [user, filter]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const { bookings: data, error } =
        filter === "all"
          ? await fetchAllBookings()
          : await fetchPendingBookings();

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

  const handleApprove = async (bookingId: string) => {
    setProcessing(bookingId);
    try {
      const { success, error } = await approveBooking(bookingId);

      if (success) {
        alert("Đã duyệt đơn đặt phòng thành công!");
        loadBookings();
      } else {
        alert(`Lỗi: ${error}`);
      }
    } catch (error) {
      console.error("Error approving booking:", error);
      alert("Có lỗi xảy ra khi duyệt đơn");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async () => {
    if (!rejectionModal.bookingId || !rejectionModal.reason.trim()) {
      alert("Vui lòng nhập lý do từ chối");
      return;
    }

    setProcessing(rejectionModal.bookingId);
    try {
      const { success, error } = await rejectBooking(
        rejectionModal.bookingId,
        rejectionModal.reason
      );

      if (success) {
        alert("Đã từ chối đơn đặt phòng!");
        setRejectionModal({ show: false, bookingId: null, reason: "" });
        loadBookings();
      } else {
        alert(`Lỗi: ${error}`);
      }
    } catch (error) {
      console.error("Error rejecting booking:", error);
      alert("Có lỗi xảy ra khi từ chối đơn");
    } finally {
      setProcessing(null);
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
    return (
      <div className="text-center py-16">
        <p className="text-neutral-500">Vui lòng đăng nhập</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Quản lý đặt phòng</h1>
          <p className="text-sm text-neutral-500 mt-1">Duyệt và quản lý các đơn đặt phòng</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-3">
        <button
          onClick={() => setFilter("pending")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === "pending"
              ? "bg-blue-500 text-white"
              : "bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700"
          }`}
        >
          Chờ duyệt
        </button>
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === "all"
              ? "bg-blue-500 text-white"
              : "bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700"
          }`}
        >
          Tất cả
        </button>
      </div>

        {/* Bookings List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
            <p className="text-neutral-500">Không có đơn đặt phòng nào</p>
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
                        className="w-full lg:w-48 h-32 object-cover rounded-xl"
                      />
                    )}
                  </div>

                  {/* Booking Details */}
                  <div className="flex-grow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold mb-1">
                          {booking.rooms.title}
                        </h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          {booking.rooms.address}
                        </p>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-neutral-500 mb-1">Khách hàng</p>
                        <p className="font-medium">{booking.profiles.name}</p>
                        <p className="text-sm text-neutral-500">{booking.profiles.phone}</p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500 mb-1">Nhận phòng</p>
                        <p className="font-medium">
                          {new Date(booking.check_in_date).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500 mb-1">Trả phòng</p>
                        <p className="font-medium">
                          {new Date(booking.check_out_date).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500 mb-1">Số người</p>
                        <p className="font-medium">{booking.guests_count} người</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-xs text-neutral-500 mb-1">Tổng tiền</p>
                      <p className="text-2xl font-bold text-primary-600">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(booking.total_price)}
                      </p>
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

                    {/* Actions */}
                    {booking.status === "pending" && (
                      <div className="flex gap-3 mt-4">
                        <ButtonPrimary
                          onClick={() => handleApprove(booking.id)}
                          disabled={processing === booking.id}
                          className="flex-1"
                        >
                          {processing === booking.id ? "Đang xử lý..." : "✅ Duyệt"}
                        </ButtonPrimary>
                        <ButtonSecondary
                          onClick={() =>
                            setRejectionModal({
                              show: true,
                              bookingId: booking.id,
                              reason: "",
                            })
                          }
                          disabled={processing === booking.id}
                          className="flex-1"
                        >
                          ❌ Từ chối
                        </ButtonSecondary>
                      </div>
                    )}

                    <p className="text-xs text-neutral-400 mt-3">
                      Đặt lúc: {new Date(booking.created_at).toLocaleString("vi-VN")}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      {/* Rejection Modal */}
      {rejectionModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Từ chối đơn đặt phòng</h3>
            <p className="text-neutral-500 mb-4">
              Vui lòng nhập lý do từ chối đơn đặt phòng này:
            </p>
            <Input
              type="text"
              value={rejectionModal.reason}
              onChange={(e) =>
                setRejectionModal({ ...rejectionModal, reason: e.target.value })
              }
              placeholder="Nhập lý do từ chối..."
              className="mb-4"
            />
            <div className="flex gap-3">
              <ButtonSecondary
                onClick={() =>
                  setRejectionModal({ show: false, bookingId: null, reason: "" })
                }
                className="flex-1"
              >
                Hủy
              </ButtonSecondary>
              <ButtonPrimary
                onClick={handleReject}
                disabled={!rejectionModal.reason.trim() || !!processing}
                className="flex-1"
              >
                {processing ? "Đang xử lý..." : "Xác nhận từ chối"}
              </ButtonPrimary>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookingsPage;

