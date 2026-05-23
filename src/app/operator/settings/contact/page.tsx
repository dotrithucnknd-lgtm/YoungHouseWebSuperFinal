"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { PhoneIcon, EnvelopeIcon, MapPinIcon } from "@heroicons/react/24/outline";

export default function ContactSettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    contact_name: "",
    contact_phone: "",
    contact_phone_2: "",
    contact_email: "",
    contact_zalo: "",
    contact_facebook: "",
    contact_address: "",
    contact_hours: "",
    auto_reply_message: "",
  });

  useEffect(() => {
    if (user?.id) {
      loadContactInfo();
    }
  }, [user]);

  const loadContactInfo = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const { data } = await supabase
        .from("profiles")
        .select("metadata")
        .eq("id", user.id)
        .single();

      if (data?.metadata?.contact_info) {
        setFormData({
          contact_name: data.metadata.contact_info.contact_name || "",
          contact_phone: data.metadata.contact_info.contact_phone || user.phone || "",
          contact_phone_2: data.metadata.contact_info.contact_phone_2 || "",
          contact_email: data.metadata.contact_info.contact_email || user.email || "",
          contact_zalo: data.metadata.contact_info.contact_zalo || "",
          contact_facebook: data.metadata.contact_info.contact_facebook || "",
          contact_address: data.metadata.contact_info.contact_address || "",
          contact_hours: data.metadata.contact_info.contact_hours || "",
          auto_reply_message: data.metadata.contact_info.auto_reply_message || "",
        });
      } else {
        setFormData({
          ...formData,
          contact_phone: user.phone || "",
          contact_email: user.email || "",
        });
      }
    } catch (error) {
      console.error("Error loading contact info:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setSaving(true);
    try {
      // Get current metadata
      const { data: profile } = await supabase
        .from("profiles")
        .select("metadata")
        .eq("id", user.id)
        .single();

      const updatedMetadata = {
        ...(profile?.metadata || {}),
        contact_info: formData,
      };

      const { error } = await supabase
        .from("profiles")
        .update({ metadata: updatedMetadata })
        .eq("id", user.id);

      if (error) throw error;

      alert("Cập nhật thông tin liên hệ thành công!");
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
          Thông tin liên hệ trọ
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
          Thông tin liên hệ hiển thị cho khách thuê
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Contact Person */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <PhoneIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Người liên hệ
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Tên người liên hệ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.contact_name}
                onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                placeholder="Tên người tiếp khách thuê"
                required
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Số điện thoại chính <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                required
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Số điện thoại phụ
              </label>
              <input
                type="tel"
                value={formData.contact_phone_2}
                onChange={(e) => setFormData({ ...formData, contact_phone_2: e.target.value })}
                placeholder="(Không bắt buộc)"
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Email liên hệ
              </label>
              <input
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <EnvelopeIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Mạng xã hội
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Zalo
              </label>
              <input
                type="text"
                value={formData.contact_zalo}
                onChange={(e) => setFormData({ ...formData, contact_zalo: e.target.value })}
                placeholder="Số Zalo hoặc link"
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Facebook
              </label>
              <input
                type="text"
                value={formData.contact_facebook}
                onChange={(e) => setFormData({ ...formData, contact_facebook: e.target.value })}
                placeholder="Link Facebook profile/page"
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Address & Hours */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <MapPinIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Địa chỉ & Giờ làm việc
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Địa chỉ liên hệ
              </label>
              <textarea
                value={formData.contact_address}
                onChange={(e) => setFormData({ ...formData, contact_address: e.target.value })}
                rows={2}
                placeholder="Địa chỉ trực tiếp tại trọ"
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Giờ làm việc
              </label>
              <input
                type="text"
                value={formData.contact_hours}
                onChange={(e) => setFormData({ ...formData, contact_hours: e.target.value })}
                placeholder="Ví dụ: 8:00 - 22:00 hàng ngày"
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Tin nhắn tự động trả lời
              </label>
              <textarea
                value={formData.auto_reply_message}
                onChange={(e) => setFormData({ ...formData, auto_reply_message: e.target.value })}
                rows={3}
                placeholder="Tin nhắn tự động gửi cho khách thuê khi liên hệ"
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              />
            </div>
          </div>
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

