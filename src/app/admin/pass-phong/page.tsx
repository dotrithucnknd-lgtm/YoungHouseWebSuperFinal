"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  fetchPendingTransfers,
  approveRoomTransfer,
  rejectRoomTransfer,
  RoomTransferWithDetails,
} from "@/lib/supabaseServices";
import ButtonPrimary from "@/shared/ButtonPrimary";
import ButtonSecondary from "@/shared/ButtonSecondary";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

const AdminPassPhongPage = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [transfers, setTransfers] = useState<RoomTransferWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedTransferId, setSelectedTransferId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && user.role === "admin") {
      loadPendingTransfers();
    }
  }, [user]);

  const loadPendingTransfers = async () => {
    setLoading(true);
    const { transfers: data, error } = await fetchPendingTransfers();
    if (!error) {
      setTransfers(data);
    }
    setLoading(false);
  };

  const handleApprove = async (transferId: string) => {
    if (!confirm("Bạn có chắc chắn muốn duyệt bài đăng này?")) {
      return;
    }

    setProcessing(transferId);
    const { success, error } = await approveRoomTransfer(transferId);

    if (success) {
      setTransfers(transfers.filter((t) => t.id !== transferId));
      alert("Đã duyệt bài đăng thành công!");
    } else {
      alert(error || "Có lỗi xảy ra khi duyệt bài đăng");
    }
    setProcessing(null);
  };

  const handleRejectClick = (transferId: string) => {
    setSelectedTransferId(transferId);
    setRejectionReason("");
    setShowRejectModal(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedTransferId) return;

    if (!rejectionReason.trim()) {
      alert("Vui lòng nhập lý do từ chối");
      return;
    }

    setProcessing(selectedTransferId);
    const { success, error } = await rejectRoomTransfer(
      selectedTransferId,
      rejectionReason
    );

    if (success) {
      setTransfers(transfers.filter((t) => t.id !== selectedTransferId));
      alert("Đã từ chối bài đăng!");
      setShowRejectModal(false);
      setSelectedTransferId(null);
      setRejectionReason("");
    } else {
      alert(error || "Có lỗi xảy ra khi từ chối bài đăng");
    }
    setProcessing(null);
  };

  if (authLoading || loading) {
    return (
      <div className="container py-16">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3"></div>
            <div className="h-64 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="container py-16">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-neutral-900">
                Xét duyệt bài Pass Phòng
              </h1>
              <p className="text-neutral-700 mt-2">
                Quản lý và duyệt các bài đăng chuyển nhượng phòng trọ
              </p>
            </div>
            <ButtonSecondary onClick={() => router.push("/admin")}>
              ← Quay lại Admin
            </ButtonSecondary>
          </div>
        </div>

        {/* Pending count */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
            Có <span className="font-bold">{transfers.length}</span> bài đăng đang chờ duyệt
          </p>
        </div>

        {/* Transfers list */}
        {transfers.length === 0 ? (
          <div className="text-center py-16 bg-neutral-50 dark:bg-neutral-800 rounded-2xl">
            <svg
              className="mx-auto h-12 w-12 text-neutral-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-neutral-900 dark:text-neutral-100">
              Không có bài đăng chờ duyệt
            </h3>
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
              Tất cả bài đăng đều đã được xử lý
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {transfers.map((transfer) => (
              <div
                key={transfer.id}
                className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm p-6"
              >
                <div className="flex gap-6">
                  {/* Room Image */}
                  <div className="flex-shrink-0">
                    <div className="relative w-48 h-48 rounded-xl overflow-hidden">
                      <Image
                        src={
                          transfer.rooms?.banner || 
                          (transfer.room_images && transfer.room_images.length > 0 ? transfer.room_images[0] : "/favicon.ico")
                        }
                        alt={transfer.rooms?.title || transfer.room_title || "Room"}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="mb-4">
                      <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                        {transfer.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                        <span className="font-medium">Phòng: {transfer.rooms?.title || transfer.room_title}</span>
                        <span>•</span>
                        <span>Người đăng: {transfer.profiles?.name || "N/A"}</span>
                        <span>•</span>
                        <span>
                          {formatDistanceToNow(new Date(transfer.created_at), {
                            addSuffix: true,
                            locale: vi,
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    {transfer.description && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                          Mô tả:
                        </h4>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 whitespace-pre-line">
                          {transfer.description}
                        </p>
                      </div>
                    )}

                    {/* Details grid */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1">
                          Địa chỉ
                        </h4>
                        <p className="text-sm text-neutral-900 dark:text-neutral-100">
                          {transfer.rooms?.address || transfer.room_address}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1">
                          Giá phòng
                        </h4>
                        <p className="text-sm text-neutral-900 dark:text-neutral-100">
                          {(transfer.rooms?.price || transfer.room_price || 0).toLocaleString("vi-VN")} đ/tháng
                          {transfer.price_negotiable && (
                            <span className="text-xs text-green-600 dark:text-green-400 ml-2">
                              (Có thể thương lượng)
                            </span>
                          )}
                        </p>
                      </div>
                      {transfer.room_area && (
                        <div>
                          <h4 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1">
                            Diện tích
                          </h4>
                          <p className="text-sm text-neutral-900 dark:text-neutral-100">
                            {transfer.room_area} m²
                          </p>
                        </div>
                      )}
                      {transfer.reason && (
                        <div>
                          <h4 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1">
                            Lý do pass
                          </h4>
                          <p className="text-sm text-neutral-900 dark:text-neutral-100">
                            {transfer.reason}
                          </p>
                        </div>
                      )}
                      {transfer.transfer_date && (
                        <div>
                          <h4 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1">
                            Ngày chuyển nhượng
                          </h4>
                          <p className="text-sm text-neutral-900 dark:text-neutral-100">
                            {new Date(transfer.transfer_date).toLocaleDateString("vi-VN")}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Contact info */}
                    <div className="mb-4">
                      <h4 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-2">
                        Thông tin liên hệ
                      </h4>
                      <div className="flex gap-4 text-sm">
                        {transfer.contact_phone && (
                          <span className="text-neutral-900 dark:text-neutral-100">
                            📞 {transfer.contact_phone}
                          </span>
                        )}
                        {transfer.contact_zalo && (
                          <span className="text-neutral-900 dark:text-neutral-100">
                            💬 Zalo: {transfer.contact_zalo}
                          </span>
                        )}
                        {!transfer.contact_phone && !transfer.contact_zalo && (
                          <span className="text-neutral-500 dark:text-neutral-400">
                            {transfer.profiles?.phone || "Chưa cung cấp"}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                      <ButtonPrimary
                        onClick={() => handleApprove(transfer.id)}
                        disabled={processing === transfer.id}
                        sizeClass="px-5 py-2.5"
                      >
                        {processing === transfer.id ? "Đang xử lý..." : "✓ Duyệt bài"}
                      </ButtonPrimary>
                      <ButtonSecondary
                        onClick={() => handleRejectClick(transfer.id)}
                        disabled={processing === transfer.id}
                        sizeClass="px-5 py-2.5"
                      >
                        ✕ Từ chối
                      </ButtonSecondary>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                Từ chối bài đăng
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                Vui lòng nhập lý do từ chối để người đăng biết và chỉnh sửa:
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="VD: Thông tin không đầy đủ, hình ảnh không rõ ràng..."
                rows={4}
                className="w-full rounded-xl border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
              />
              <div className="flex gap-3 mt-6">
                <ButtonPrimary
                  onClick={handleRejectConfirm}
                  disabled={!rejectionReason.trim() || processing === selectedTransferId}
                  className="flex-1"
                >
                  {processing === selectedTransferId ? "Đang xử lý..." : "Xác nhận từ chối"}
                </ButtonPrimary>
                <ButtonSecondary
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedTransferId(null);
                    setRejectionReason("");
                  }}
                  disabled={processing === selectedTransferId}
                  className="flex-1"
                >
                  Hủy
                </ButtonSecondary>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPassPhongPage;


