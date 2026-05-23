"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { 
  fetchMyTransfers, 
  deleteRoomTransfer
} from "@/lib/supabaseServices";
import type { RoomTransferWithDetails } from "@/lib/supabaseServices";
import ButtonPrimary from "@/shared/ButtonPrimary";
import ButtonSecondary from "@/shared/ButtonSecondary";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

const PassPhongPage = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [transfers, setTransfers] = useState<RoomTransferWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadTransfers();
    }
  }, [user]);

  const loadTransfers = async () => {
    setLoading(true);
    const { transfers: data, error } = await fetchMyTransfers();
    if (!error) {
      setTransfers(data);
    }
    setLoading(false);
  };

  const handleDelete = async (transferId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bài đăng này?")) {
      return;
    }

    setDeleting(transferId);
    const { success, error } = await deleteRoomTransfer(transferId);
    
    if (success) {
      setTransfers(transfers.filter(t => t.id !== transferId));
    } else {
      alert(error || "Có lỗi xảy ra khi xóa bài đăng");
    }
    setDeleting(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-3 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Chờ duyệt</span>;
      case 'approved':
        return <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Đã duyệt</span>;
      case 'rejected':
        return <span className="px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Đã từ chối</span>;
      default:
        return null;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container py-16">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3"></div>
            <div className="h-64 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container py-16">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-semibold">Bài đăng Pass Phòng của bạn</h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-2">
              Quản lý các bài đăng chuyển nhượng phòng trọ
            </p>
          </div>
          <ButtonPrimary onClick={() => router.push("/pass-phong/tao-moi")}>
            + Đăng bài mới
          </ButtonPrimary>
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-neutral-900 dark:text-neutral-100">
              Chưa có bài đăng nào
            </h3>
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
              Bắt đầu bằng cách đăng bài pass phòng đầu tiên của bạn
            </p>
            <div className="mt-6">
              <ButtonPrimary onClick={() => router.push("/pass-phong/tao-moi")}>
                Đăng bài ngay
              </ButtonPrimary>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {transfers.map((transfer) => (
              <div
                key={transfer.id}
                className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6"
              >
                <div className="flex gap-4">
                  {/* Room Image */}
                  <div className="flex-shrink-0">
                    <div className="relative w-32 h-32 rounded-xl overflow-hidden">
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
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                          {transfer.title}
                        </h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                          {transfer.rooms?.title || transfer.room_title}
                        </p>
                      </div>
                      {getStatusBadge(transfer.status)}
                    </div>

                    <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2 mb-3">
                      {transfer.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400 mb-3">
                      <span>📍 {transfer.rooms?.address || transfer.room_address}</span>
                      <span>💰 {(transfer.rooms?.price || transfer.room_price || 0).toLocaleString('vi-VN')} đ/tháng</span>
                      {transfer.transfer_date && (
                        <span>📅 {new Date(transfer.transfer_date).toLocaleDateString('vi-VN')}</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-neutral-400">
                        Đăng {formatDistanceToNow(new Date(transfer.created_at), { 
                          addSuffix: true,
                          locale: vi 
                        })}
                      </span>

                      <div className="flex gap-2">
                        {transfer.status === 'pending' && (
                          <>
                            <ButtonSecondary
                              onClick={() => router.push(`/pass-phong/chinh-sua/${transfer.id}`)}
                              sizeClass="px-4 py-2 text-sm"
                            >
                              Sửa
                            </ButtonSecondary>
                            <button
                              onClick={() => handleDelete(transfer.id)}
                              disabled={deleting === transfer.id}
                              className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                            >
                              {deleting === transfer.id ? "Đang xóa..." : "Xóa"}
                            </button>
                          </>
                        )}
                        {transfer.status === 'rejected' && transfer.rejection_reason && (
                          <p className="text-xs text-red-600 dark:text-red-400">
                            Lý do từ chối: {transfer.rejection_reason}
                          </p>
                        )}
                      </div>
                    </div>
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

export default PassPhongPage;

