"use client";

import React, { useEffect, useState } from "react";
import { useSalesProfile } from "@/hooks/useSalesProfile";
import {
  fetchCommissionsByCTV,
  formatVND,
  type CTVCommissionWithDetails,
} from "@/lib/ctvServices";
import { BanknotesIcon } from "@heroicons/react/24/outline";

type StatusTab = "all" | "pending" | "approved" | "paid" | "rejected";

const STATUS_LABELS: Record<string, string> = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  paid: "Đã chi",
  rejected: "Từ chối",
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
  approved: "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
  paid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
  rejected: "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400",
};

export default function SalesCommissionsPage() {
  const { profile, loading: profileLoading } = useSalesProfile();
  const [commissions, setCommissions] = useState<CTVCommissionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<StatusTab>("all");

  useEffect(() => {
    if (!profile?.id) return;
    setLoading(true);
    fetchCommissionsByCTV(profile.id).then(({ data }) => {
      setCommissions(data);
      setLoading(false);
    });
  }, [profile?.id]);

  const filtered =
    tab === "all" ? commissions : commissions.filter((c) => c.status === tab);

  const totalEarned = profile?.total_earned || 0;
  const totalPaid = profile?.total_paid || 0;
  const totalUnpaid = totalEarned - totalPaid;

  if (profileLoading || loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5">
          <p className="text-xs text-neutral-500 mb-1">Tổng hoa hồng</p>
          <p className="text-xl font-bold text-neutral-900 dark:text-white">{formatVND(totalEarned)}</p>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5">
          <p className="text-xs text-neutral-500 mb-1">Đã thanh toán</p>
          <p className="text-xl font-bold text-emerald-600">{formatVND(totalPaid)}</p>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5">
          <p className="text-xs text-neutral-500 mb-1">Chưa thanh toán</p>
          <p className="text-xl font-bold text-orange-600">{formatVND(totalUnpaid)}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["all", "pending", "approved", "paid", "rejected"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setTab(s)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
              tab === s
                ? "bg-emerald-600 text-white"
                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600"
            }`}
          >
            {s === "all" ? "Tất cả" : STATUS_LABELS[s]} (
            {s === "all" ? commissions.length : commissions.filter((c) => c.status === s).length})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <BanknotesIcon className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-500">Chưa có hoa hồng nào</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((com) => (
            <div
              key={com.id}
              className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <p className="text-lg font-bold text-emerald-600">{formatVND(com.amount)}</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {com.ctv_referrals?.rooms?.title || "Phòng trọ"}
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  {com.commission_rate}% × {formatVND(com.room_price)} ·{" "}
                  {new Date(com.created_at).toLocaleDateString("vi-VN")}
                </p>
                {com.note && (
                  <p className="text-xs text-neutral-400 mt-1 italic">Ghi chú: {com.note}</p>
                )}
              </div>
              <span
                className={`self-start sm:self-center text-xs px-3 py-1.5 rounded-full font-medium ${STATUS_STYLES[com.status]}`}
              >
                {STATUS_LABELS[com.status]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
