"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchCTVProfileByUserId,
  fetchReferralsByCTV,
  fetchCommissionsByCTV,
  formatVND,
  CTVProfileWithUser,
  CTVReferralWithDetails,
  CTVCommissionWithDetails,
} from "@/lib/ctvServices";

export default function CTVDashboardPage() {
  const { user } = useAuth();
  const [ctvProfile, setCTVProfile] = useState<CTVProfileWithUser | null>(null);
  const [referrals, setReferrals] = useState<CTVReferralWithDetails[]>([]);
  const [commissions, setCommissions] = useState<CTVCommissionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user?.id) loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: profile } = await fetchCTVProfileByUserId(user!.id);
      if (profile) {
        setCTVProfile(profile);
        const [refRes, comRes] = await Promise.all([
          fetchReferralsByCTV(profile.id),
          fetchCommissionsByCTV(profile.id),
        ]);
        setReferrals(refRes.data);
        setCommissions(comRes.data);
      }
    } catch (err) {
      console.error("Error loading CTV data:", err);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    if (!ctvProfile) return;
    const link = `${window.location.origin}?ref=${ctvProfile.referral_code}`;
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

  if (!ctvProfile) {
    return (
      <div className="text-center py-20">
        <p className="text-5xl mb-4">😕</p>
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">Chưa có hồ sơ CTV</h2>
        <p className="text-neutral-500">Tài khoản của bạn chưa được kích hoạt CTV.</p>
      </div>
    );
  }

  const pendingCommissions = commissions.filter((c) => c.status === "pending").length;
  const totalUnpaid = ctvProfile.total_earned - ctvProfile.total_paid;

  return (
    <div className="space-y-6">
      {/* Referral Link Card */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
        <h2 className="text-lg font-semibold mb-2">🔗 Link giới thiệu của bạn</h2>
        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl p-3">
          <code className="flex-1 text-sm truncate">
            {typeof window !== "undefined" ? `${window.location.origin}?ref=${ctvProfile.referral_code}` : ctvProfile.referral_code}
          </code>
          <button
            onClick={copyReferralLink}
            className="px-4 py-2 bg-white text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-50 transition-colors shrink-0"
          >
            {copied ? "✅ Đã copy!" : "📋 Copy"}
          </button>
        </div>
        <p className="text-sm mt-3 opacity-80">
          Mã CTV: <strong>{ctvProfile.referral_code}</strong> · Hoa hồng: <strong>{ctvProfile.commission_rate}%</strong>
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Tổng giới thiệu" value={referrals.length} icon="🔗" color="from-blue-500 to-blue-600" />
        <StatCard label="GT thành công" value={referrals.filter((r) => r.status === "confirmed").length} icon="✅" color="from-green-500 to-green-600" />
        <StatCard label="Tổng hoa hồng" value={formatVND(ctvProfile.total_earned)} icon="💰" color="from-emerald-500 to-emerald-600" isText />
        <StatCard label="Chưa thanh toán" value={formatVND(totalUnpaid)} icon="⏳" color="from-orange-500 to-orange-600" isText />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Referrals */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-5">
          <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-4">Giới thiệu gần đây</h3>
          {referrals.length === 0 ? (
            <p className="text-sm text-neutral-500 py-8 text-center">Chưa có lượt giới thiệu nào</p>
          ) : (
            <div className="space-y-3">
              {referrals.slice(0, 5).map((ref) => (
                <div key={ref.id} className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-700/50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">
                      {(ref as any).rooms?.title || "Phòng trọ"}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {new Date(ref.created_at).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    ref.status === "confirmed"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : ref.status === "cancelled"
                      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                  }`}>
                    {ref.status === "confirmed" ? "Thành công" : ref.status === "cancelled" ? "Hủy" : "Chờ xử lý"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Commissions */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-5">
          <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-4">Hoa hồng gần đây</h3>
          {commissions.length === 0 ? (
            <p className="text-sm text-neutral-500 py-8 text-center">Chưa có hoa hồng nào</p>
          ) : (
            <div className="space-y-3">
              {commissions.slice(0, 5).map((com) => (
                <div key={com.id} className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-700/50 last:border-0">
                  <div>
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {formatVND(com.amount)}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {com.commission_rate}% × {formatVND(com.room_price)}
                    </p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    com.status === "paid"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : com.status === "approved"
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      : com.status === "rejected"
                      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                  }`}>
                    {com.status === "paid" ? "Đã chi" : com.status === "approved" ? "Đã duyệt" : com.status === "rejected" ? "Từ chối" : "Chờ duyệt"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bank Info */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-5">
        <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-3">Thông tin nhận hoa hồng</h3>
        {ctvProfile.bank_name ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-neutral-500 text-xs mb-1">Ngân hàng</p>
              <p className="font-medium text-neutral-900 dark:text-white">{ctvProfile.bank_name}</p>
            </div>
            <div>
              <p className="text-neutral-500 text-xs mb-1">Số tài khoản</p>
              <p className="font-medium text-neutral-900 dark:text-white">{ctvProfile.bank_account}</p>
            </div>
            <div>
              <p className="text-neutral-500 text-xs mb-1">Chủ tài khoản</p>
              <p className="font-medium text-neutral-900 dark:text-white">{ctvProfile.bank_owner}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-neutral-500">
            Chưa cập nhật thông tin ngân hàng. <a href="/ctv/settings" className="text-emerald-600 hover:underline">Cập nhật ngay</a>
          </p>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color, isText }: {
  label: string; value: string | number; icon: string; color: string; isText?: boolean;
}) {
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl p-4 border border-neutral-200 dark:border-neutral-700">
      <div className="flex items-center gap-2 mb-2">
        <div className={`bg-gradient-to-br ${color} rounded-lg p-2 text-white text-sm`}>{icon}</div>
        <span className="text-xs text-neutral-500">{label}</span>
      </div>
      <p className={`font-bold text-neutral-900 dark:text-white ${isText ? "text-lg" : "text-2xl"}`}>
        {value}
      </p>
    </div>
  );
}
