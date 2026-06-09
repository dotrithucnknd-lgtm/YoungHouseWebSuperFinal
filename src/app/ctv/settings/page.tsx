"use client";

import React, { useEffect, useState } from "react";
import { useSalesProfile } from "@/hooks/useSalesProfile";
import { updateCTVBankInfo } from "@/lib/ctvServices";

export default function CTVSettingsPage() {
  const { profile: ctvProfile, loading, reload } = useSalesProfile();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    bank_name: "",
    bank_account: "",
    bank_owner: "",
  });

  useEffect(() => {
    if (ctvProfile) {
      setFormData({
        bank_name: ctvProfile.bank_name || "",
        bank_account: ctvProfile.bank_account || "",
        bank_owner: ctvProfile.bank_owner || "",
      });
    }
  }, [ctvProfile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ctvProfile) return;
    setSaving(true);
    setSuccess(false);
    const { error } = await updateCTVBankInfo(ctvProfile.id, formData);
    if (error) {
      alert("Lỗi: " + error);
    } else {
      setSuccess(true);
      reload();
      setTimeout(() => setSuccess(false), 3000);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500" />
      </div>
    );
  }

  if (!ctvProfile) {
    return <p className="text-center py-10 text-neutral-500">Không tìm thấy hồ sơ CTV</p>;
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Profile Info */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
        <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-4">Thông tin CTV</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-neutral-500 text-xs mb-1">Họ tên</p>
            <p className="font-medium text-neutral-900 dark:text-white">{ctvProfile.profiles?.name}</p>
          </div>
          <div>
            <p className="text-neutral-500 text-xs mb-1">Mã CTV</p>
            <code className="text-sm bg-neutral-100 dark:bg-neutral-700 px-2 py-0.5 rounded font-mono">
              {ctvProfile.referral_code}
            </code>
          </div>
          <div>
            <p className="text-neutral-500 text-xs mb-1">Tỷ lệ hoa hồng</p>
            <p className="font-medium text-emerald-600">{ctvProfile.commission_rate}%</p>
          </div>
          <div>
            <p className="text-neutral-500 text-xs mb-1">Trạng thái</p>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
              ctvProfile.status === "active"
                ? "bg-green-100 text-green-700"
                : ctvProfile.status === "suspended"
                ? "bg-red-100 text-red-700"
                : "bg-yellow-100 text-yellow-700"
            }`}>
              {ctvProfile.status === "active" ? "Hoạt động" : ctvProfile.status === "suspended" ? "Tạm dừng" : "Chờ duyệt"}
            </span>
          </div>
        </div>
      </div>

      {/* Bank Info Form */}
      <form onSubmit={handleSave} className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
        <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-4">Thông tin ngân hàng</h3>
        
        {success && (
          <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-700 dark:text-green-300">✅ Cập nhật thành công!</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Ngân hàng</label>
            <input
              type="text"
              value={formData.bank_name}
              onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
              className="w-full px-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white text-sm"
              placeholder="VD: Vietcombank, MB Bank, ..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Số tài khoản</label>
            <input
              type="text"
              value={formData.bank_account}
              onChange={(e) => setFormData({ ...formData, bank_account: e.target.value })}
              className="w-full px-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white text-sm"
              placeholder="Nhập số tài khoản"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Chủ tài khoản</label>
            <input
              type="text"
              value={formData.bank_owner}
              onChange={(e) => setFormData({ ...formData, bank_owner: e.target.value })}
              className="w-full px-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white text-sm"
              placeholder="Nhập tên chủ tài khoản"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="mt-4 w-full px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 text-sm font-medium transition-colors"
        >
          {saving ? "Đang lưu..." : "Lưu thông tin"}
        </button>
      </form>
    </div>
  );
}

