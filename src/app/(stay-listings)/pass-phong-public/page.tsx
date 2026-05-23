"use client";

import React, { useState, useEffect } from "react";
import { fetchApprovedTransfers, RoomTransferWithDetails } from "@/lib/supabaseServices";
import ButtonPrimary from "@/shared/ButtonPrimary";
import ButtonSecondary from "@/shared/ButtonSecondary";
import SupabaseImage from "@/components/SupabaseImage";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { useRouter } from "next/navigation";

const PassPhongPublicPage = () => {
  const router = useRouter();
  const [transfers, setTransfers] = useState<RoomTransferWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "negotiable">("all");

  useEffect(() => {
    loadTransfers();
  }, []);

  const loadTransfers = async () => {
    setLoading(true);
    const { transfers: data, error } = await fetchApprovedTransfers();
    if (!error) {
      setTransfers(data);
    }
    setLoading(false);
  };

  const filteredTransfers =
    filter === "negotiable"
      ? transfers.filter((t) => t.price_negotiable)
      : transfers;

  if (loading) {
    return (
      <div className="container py-16">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-64 bg-neutral-200 dark:bg-neutral-700 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-16">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-semibold mb-4">Pass Phòng Trọ</h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Tìm kiếm phòng trọ chuyển nhượng với giá tốt và thủ tục nhanh gọn
          </p>
        </div>

        {/* Filter & Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-8">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === "all"
                  ? "bg-primary-500 text-white"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
              }`}
            >
              Tất cả ({transfers.length})
            </button>
            <button
              onClick={() => setFilter("negotiable")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === "negotiable"
                  ? "bg-primary-500 text-white"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
              }`}
            >
              Có thể thương lượng ({transfers.filter((t) => t.price_negotiable).length})
            </button>
          </div>

          <ButtonPrimary onClick={() => router.push("/pass-phong")}>
            + Đăng bài Pass Phòng
          </ButtonPrimary>
        </div>

        {/* Transfers Grid */}
        {filteredTransfers.length === 0 ? (
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
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-neutral-900 dark:text-neutral-100">
              Chưa có bài pass phòng nào
            </h3>
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
              Hãy quay lại sau hoặc đăng bài của bạn
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTransfers.map((transfer) => (
              <div
                key={transfer.id}
                className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm hover:shadow-lg transition-all overflow-hidden group"
              >
                {/* Image */}
                <div className="relative h-56 overflow-hidden">
                  <SupabaseImage
                    src={
                      transfer.rooms?.banner || 
                      (transfer.room_images && transfer.room_images.length > 0 ? transfer.room_images[0] : "/favicon.ico")
                    }
                    alt={transfer.rooms?.title || transfer.room_title || "Room"}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {transfer.price_negotiable && (
                    <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Có thể thương lượng
                    </div>
                  )}
                  {transfer.transfer_date && (
                    <div className="absolute top-4 left-4 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      📅 {new Date(transfer.transfer_date).toLocaleDateString("vi-VN")}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Title */}
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2 line-clamp-2">
                    {transfer.title}
                  </h3>

                  {/* Room info */}
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                    {transfer.rooms?.title || transfer.room_title}
                  </p>

                  {/* Description */}
                  {transfer.description && (
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-3 mb-4">
                      {transfer.description}
                    </p>
                  )}

                  {/* Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span className="line-clamp-1">{transfer.rooms?.address || transfer.room_address}</span>
                    </div>
                    <div className="flex items-center text-sm font-semibold text-primary-600 dark:text-primary-400">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {(transfer.rooms?.price || transfer.room_price || 0).toLocaleString("vi-VN")} đ/tháng
                    </div>
                    {transfer.reason && (
                      <div className="flex items-start text-sm text-neutral-500 dark:text-neutral-400">
                        <svg
                          className="w-4 h-4 mr-2 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="line-clamp-1">{transfer.reason}</span>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-700">
                    <span className="text-xs text-neutral-400">
                      {formatDistanceToNow(new Date(transfer.created_at), {
                        addSuffix: true,
                        locale: vi,
                      })}
                    </span>
                    <div className="flex gap-2">
                      {transfer.contact_phone && (
                        <a
                          href={`tel:${transfer.contact_phone}`}
                          className="px-3 py-1.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-xs font-medium transition-colors"
                        >
                          📞 Gọi ngay
                        </a>
                      )}
                      {transfer.contact_zalo && (
                        <a
                          href={`https://zalo.me/${transfer.contact_zalo}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-medium transition-colors"
                        >
                          💬 Zalo
                        </a>
                      )}
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

export default PassPhongPublicPage;

