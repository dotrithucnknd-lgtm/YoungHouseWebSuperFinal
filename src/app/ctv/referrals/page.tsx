"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSalesProfile } from "@/hooks/useSalesProfile";
import { fetchReferralsByCTV, type CTVReferralWithDetails } from "@/lib/ctvServices";
import { LinkIcon, FunnelIcon } from "@heroicons/react/24/outline";

const STATUS_LABELS: Record<string, string> = {
  pending: "Chờ xử lý",
  confirmed: "Thành công",
  cancelled: "Đã hủy",
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
  confirmed: "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400",
};

export default function SalesReferralsPage() {
  const { profile, loading: profileLoading } = useSalesProfile();
  const [referrals, setReferrals] = useState<CTVReferralWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed" | "cancelled">("all");

  useEffect(() => {
    if (!profile?.id) return;
    setLoading(true);
    fetchReferralsByCTV(profile.id).then(({ data }) => {
      setReferrals(data);
      setLoading(false);
    });
  }, [profile?.id]);

  const filtered =
    filter === "all" ? referrals : referrals.filter((r) => r.status === filter);

  if (profileLoading || loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500" />
      </div>
    );
  }

  if (!profile) {
    return <p className="text-center py-10 text-neutral-500">Không tìm thấy hồ sơ Sales</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-neutral-500">
            Mã giới thiệu: <code className="font-mono text-emerald-600">{profile.referral_code}</code>
          </p>
        </div>
        <Link
          href="/ctv/rooms"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-emerald-600 text-white rounded-xl hover:bg-emerald-700"
        >
          <LinkIcon className="w-4 h-4" />
          Xem phòng để giới thiệu
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["all", "pending", "confirmed", "cancelled"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
              filter === s
                ? "bg-emerald-600 text-white"
                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
            }`}
          >
            {s === "all" ? "Tất cả" : STATUS_LABELS[s]} (
            {s === "all" ? referrals.length : referrals.filter((r) => r.status === s).length})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <FunnelIcon className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-500 mb-2">Chưa có lượt giới thiệu nào</p>
          <p className="text-sm text-neutral-400">
            Chia sẻ link referral của bạn cho khách thuê tiềm năng
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50">
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600">Phòng</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600">Khách</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600">Ngày</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((ref) => (
                  <tr
                    key={ref.id}
                    className="border-b border-neutral-100 dark:border-neutral-800 last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-800/30"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-neutral-900 dark:text-white">
                        {ref.rooms?.title || "—"}
                      </p>
                      <p className="text-xs text-neutral-500">{ref.rooms?.address}</p>
                    </td>
                    <td className="px-4 py-3 text-neutral-700 dark:text-neutral-300">
                      {ref.referred_profile?.name || "—"}
                      {ref.referred_profile?.phone && (
                        <p className="text-xs text-neutral-500">{ref.referred_profile.phone}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-neutral-500 whitespace-nowrap">
                      {new Date(ref.created_at).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLES[ref.status]}`}
                      >
                        {STATUS_LABELS[ref.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
