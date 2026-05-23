"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { BuildingOffice2Icon, BanknotesIcon, DocumentTextIcon } from "@heroicons/react/24/outline";

export default function BusinessSettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    business_type: "individual",
    business_name: "",
    tax_code: "",
    business_register_number: "",
    business_address: "",
    business_representative: "",
    bank_name: "",
    bank_account_number: "",
    bank_account_holder: "",
    bank_branch: "",
    momo_phone: "",
    notes: "",
  });

  useEffect(() => {
    if (user?.id) {
      loadBusinessInfo();
    }
  }, [user]);

  const loadBusinessInfo = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const { data } = await supabase
        .from("profiles")
        .select("metadata")
        .eq("id", user.id)
        .single();

      if (data?.metadata?.business_info) {
        setFormData({ ...formData, ...data.metadata.business_info });
      }
    } catch (error) {
      console.error("Error loading business info:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setSaving(true);
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("metadata")
        .eq("id", user.id)
        .single();

      const updatedMetadata = {
        ...(profile?.metadata || {}),
        business_info: formData,
      };

      const { error } = await supabase
        .from("profiles")
        .update({ metadata: updatedMetadata })
        .eq("id", user.id);

      if (error) throw error;

      alert("Cập nhật thông tin doanh nghiệp thành công!");
    } catch (error: any) {
      alert(`Lỗi: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Thông tin doanh nghiệp
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
          Thông tin doanh nghiệp/cá nhân kinh doanh và tài khoản thanh toán
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business Type */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <BuildingOffice2Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Loại hình kinh doanh
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <label className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
              formData.business_type === "individual"
                ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"
            }`}>
              <input
                type="radio"
                value="individual"
                checked={formData.business_type === "individual"}
                onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
                className="text-green-600"
              />
              <div>
                <p className="font-medium text-neutral-900 dark:text-white">Cá nhân</p>
                <p className="text-xs text-neutral-500">Hộ kinh doanh cá thể</p>
              </div>
            </label>

            <label className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
              formData.business_type === "company"
                ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"
            }`}>
              <input
                type="radio"
                value="company"
                checked={formData.business_type === "company"}
                onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
                className="text-green-600"
              />
              <div>
                <p className="font-medium text-neutral-900 dark:text-white">Doanh nghiệp</p>
                <p className="text-xs text-neutral-500">Công ty, doanh nghiệp</p>
              </div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                {formData.business_type === "company" ? "Tên doanh nghiệp" : "Tên hộ kinh doanh"}
              </label>
              <input
                type="text"
                value={formData.business_name}
                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Mã số thuế
              </label>
              <input
                type="text"
                value={formData.tax_code}
                onChange={(e) => setFormData({ ...formData, tax_code: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Số đăng ký kinh doanh
              </label>
              <input
                type="text"
                value={formData.business_register_number}
                onChange={(e) => setFormData({ ...formData, business_register_number: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Địa chỉ doanh nghiệp
              </label>
              <textarea
                value={formData.business_address}
                onChange={(e) => setFormData({ ...formData, business_address: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Người đại diện pháp luật
              </label>
              <input
                type="text"
                value={formData.business_representative}
                onChange={(e) => setFormData({ ...formData, business_representative: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Bank Info */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <BanknotesIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Tài khoản ngân hàng
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Tên ngân hàng
              </label>
              <input
                type="text"
                value={formData.bank_name}
                onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                placeholder="Ví dụ: Vietcombank, Techcombank"
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Số tài khoản
              </label>
              <input
                type="text"
                value={formData.bank_account_number}
                onChange={(e) => setFormData({ ...formData, bank_account_number: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Chủ tài khoản
              </label>
              <input
                type="text"
                value={formData.bank_account_holder}
                onChange={(e) => setFormData({ ...formData, bank_account_holder: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Chi nhánh
              </label>
              <input
                type="text"
                value={formData.bank_branch}
                onChange={(e) => setFormData({ ...formData, bank_branch: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Số điện thoại Momo
              </label>
              <input
                type="tel"
                value={formData.momo_phone}
                onChange={(e) => setFormData({ ...formData, momo_phone: e.target.value })}
                placeholder="(Không bắt buộc)"
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <DocumentTextIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Ghi chú
            </h2>
          </div>

          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={4}
            placeholder="Thông tin bổ sung khác..."
            className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </form>
    </div>
  );
}
