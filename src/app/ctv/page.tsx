"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSalesProfile } from "@/hooks/useSalesProfile";
import {
  fetchReferralsByCTV,
  fetchCommissionsByCTV,
  formatVND,
  type CTVReferralWithDetails,
  type CTVCommissionWithDetails,
} from "@/lib/ctvServices";
import SalesQuickActions from "@/components/sales/SalesQuickActions";

export default function SalesDashboardPage() {
  const { profile, loading, error } = useSalesProfile();
  const [referrals, setReferrals] = useState<CTVReferralWithDetails[]>([]);
  const [commissions, setCommissions] = useState<CTVCommissionWithDetails[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!profile?.id) return;
    Promise.all([
      fetchReferralsByCTV(profile.id),
      fetchCommissionsByCTV(profile.id),
    ]).then(([refRes, comRes]) => {
      setReferrals(refRes.data);
      setCommissions(comRes.data);
    });
  }, [profile?.id]);

  const copyReferralLink = () => {
    if (!profile) return;
    const link = `${window.location.origin}?ref=${profile.referral_code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="text-center py-20">
        <p className="text-5xl mb-4">😕</p>
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
          Không thể tải hồ sơ Sales
        </h2>
        <p className="text-neutral-500">{error || "Vui lòng thử lại sau"}</p>
      </div>
    );
  }

  const confirmedReferrals = referrals.filter((r) => r.status === "confirmed").length;
  const totalUnpaid = profile.total_earned - profile.total_paid;
  const pendingCommissions = commissions.filter((c) => c.status === "pending").length;

  return (
    <div className="space-y-6">
      {/* Welcome + Referral Link */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
        <h2 className="text-lg font-semibold mb-1">
          Xin chào, {profile.profiles?.name || "Sales"}! 👋
        </h2>
        <p className="text-sm opacity-90 mb-4">
          Tư vấn phòng, giới thiệu khách và theo dõi hoa hồng tại đây.
        </p>
        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl p-3">
          <code className="flex-1 text-sm truncate">
            {typeof window !== "undefined"
              ? `${window.location.origin}?ref=${profile.referral_code}`
              : profile.referral_code}
          </code>
          <button
            onClick={copyReferralLink}
            className="px-4 py-2 bg-white text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-50 shrink-0"
          >
            {copied ? "✅ Đã copy!" : "📋 Copy link"}
          </button>
        </div>
        <p className="text-sm mt-3 opacity-80">
          Mã CTV: <strong>{profile.referral_code}</strong> · Hoa hồng:{" "}
          <strong>{profile.commission_rate}%</strong>
        </p>
      </div>

      <SalesQuickActions
        profile={profile}
        referralsCount={referrals.length}
        pendingCommissions={pendingCommissions}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Tổng giới thiệu" value={referrals.length} color="from-blue-500 to-blue-600" />
        <StatCard label="GT thành công" value={confirmedReferrals} color="from-green-500 to-green-600" />
        <StatCard label="Tổng hoa hồng" value={formatVND(profile.total_earned)} color="from-emerald-500 to-emerald-600" isText />
        <StatCard label="Chưa thanh toán" value={formatVND(totalUnpaid)} color="from-orange-500 to-orange-600" isText />
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentList
          title="Giới thiệu gần đây"
          empty="Chưa có lượt giới thiệu"
          href="/ctv/referrals"
          items={referrals.slice(0, 5).map((ref) => ({
            id: ref.id,
            primary: ref.rooms?.title || "Phòng trọ",
            secondary: new Date(ref.created_at).toLocaleDateString("vi-VN"),
            badge:
              ref.status === "confirmed"
                ? { text: "Thành công", class: "bg-green-100 text-green-700" }
                : ref.status === "cancelled"
                ? { text: "Hủy", class: "bg-red-100 text-red-700" }
                : { text: "Chờ xử lý", class: "bg-amber-100 text-amber-700" },
          }))}
        />
        <RecentList
          title="Hoa hồng gần đây"
          empty="Chưa có hoa hồng"
          href="/ctv/commissions"
          items={commissions.slice(0, 5).map((com) => ({
            id: com.id,
            primary: formatVND(com.amount),
            secondary: `${com.commission_rate}% · ${new Date(com.created_at).toLocaleDateString("vi-VN")}`,
            badge:
              com.status === "paid"
                ? { text: "Đã chi", class: "bg-emerald-100 text-emerald-700" }
                : com.status === "approved"
                ? { text: "Đã duyệt", class: "bg-blue-100 text-blue-700" }
                : com.status === "rejected"
                ? { text: "Từ chối", class: "bg-red-100 text-red-700" }
                : { text: "Chờ duyệt", class: "bg-amber-100 text-amber-700" },
          }))}
        />
      </div>

      {/* Bank info reminder */}
      {!profile.bank_name && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl p-4 text-sm text-amber-800 dark:text-amber-300">
          Chưa cập nhật thông tin ngân hàng.{" "}
          <Link href="/ctv/settings" className="font-medium underline">
            Cập nhật ngay
          </Link>{" "}
          để nhận hoa hồng.
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
  isText,
}: {
  label: string;
  value: string | number;
  color: string;
  isText?: boolean;
}) {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800">
      <p className="text-xs text-neutral-500 mb-2">{label}</p>
      <p className={`font-bold text-neutral-900 dark:text-white ${isText ? "text-lg" : "text-2xl"}`}>
        {value}
      </p>
      <div className={`mt-2 h-1 rounded-full bg-gradient-to-r ${color} opacity-60`} />
    </div>
  );
}

function RecentList({
  title,
  empty,
  href,
  items,
}: {
  title: string;
  empty: string;
  href: string;
  items: {
    id: string;
    primary: string;
    secondary: string;
    badge: { text: string; class: string };
  }[];
}) {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-neutral-900 dark:text-white">{title}</h3>
        <Link href={href} className="text-xs text-emerald-600 hover:underline">
          Xem tất cả
        </Link>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-neutral-500 py-8 text-center">{empty}</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-800 last:border-0"
            >
              <div>
                <p className="text-sm font-medium text-neutral-900 dark:text-white">{item.primary}</p>
                <p className="text-xs text-neutral-500">{item.secondary}</p>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${item.badge.class}`}>
                {item.badge.text}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
