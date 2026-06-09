"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSalesProfile } from "@/hooks/useSalesProfile";
import { fetchRoomsPaginated } from "@/lib/supabaseServices";
import { formatVND } from "@/lib/ctvServices";
import type { StayDataType } from "@/data/types";
import { LinkIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function SalesRoomsPage() {
  const { profile, loading: profileLoading } = useSalesProfile();
  const [rooms, setRooms] = useState<StayDataType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchRoomsPaginated(1, 50).then((data) => {
      setRooms(data);
      setLoading(false);
    });
  }, []);

  const copyRoomLink = (room: StayDataType) => {
    if (!profile) return;
    const slug = room.href?.replace("/phong-tro-detail/", "") || room.id;
    const link = `${window.location.origin}/phong-tro-detail/${slug}?ref=${profile.referral_code}`;
    navigator.clipboard.writeText(link);
    setCopiedId(room.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = rooms.filter(
    (r) =>
      !search.trim() ||
      r.title?.toLowerCase().includes(search.toLowerCase()) ||
      r.address?.toLowerCase().includes(search.toLowerCase())
  );

  if (profileLoading || loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {profile && (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/30 rounded-2xl p-4 text-sm text-emerald-800 dark:text-emerald-300">
          Chia sẻ link phòng kèm mã <strong>{profile.referral_code}</strong> để được tính hoa hồng khi khách thuê thành công.
        </div>
      )}

      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo tên phòng, địa chỉ..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((room) => (
          <div
            key={room.id}
            className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm"
          >
            {room.galleryImgs?.[0] && (
              <div className="aspect-video relative bg-neutral-100">
                <img
                  src={room.galleryImgs[0]}
                  alt={room.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-4 space-y-3">
              <div>
                <h3 className="font-bold text-neutral-900 dark:text-white line-clamp-1">
                  {room.title}
                </h3>
                <p className="text-xs text-neutral-500 line-clamp-1">{room.address}</p>
                <p className="text-sm font-bold text-emerald-600 mt-1">
                  {formatVND(room.price)}/tháng
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={room.href || `/phong-tro-detail/${room.id}`}
                  target="_blank"
                  className="flex-1 text-center px-3 py-2 text-xs font-medium border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  Xem chi tiết
                </Link>
                <button
                  onClick={() => copyRoomLink(room)}
                  className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  {copiedId === room.id ? "Đã copy!" : "Copy link GT"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center py-10 text-neutral-500">Không tìm thấy phòng phù hợp</p>
      )}
    </div>
  );
}
