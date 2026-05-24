"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { CogIcon } from "@heroicons/react/24/outline";

export default function TenantSettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<{ name: string; phone: string; dob: string }>({
    name: "",
    phone: "",
    dob: "",
  });
  const [passwordForm, setPasswordForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const fetchProfile = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setProfile({
          name: data.name || "",
          phone: data.phone || "",
          dob: data.dob || "",
        });
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from("profiles")
        .update({
          name: profile.name.trim(),
          phone: profile.phone.trim(),
          dob: profile.dob || null,
        })
        .eq("id", user.id);

      if (error) throw error;

      setProfileSuccess(true);
      setTimeout(() => {
        setProfileSuccess(false);
      }, 3000);
    } catch (err: any) {
      alert("Lỗi cập nhật hồ sơ: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Mật khẩu xác nhận không khớp!");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError("Mật khẩu mới phải từ 6 ký tự trở lên!");
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      });

      if (error) throw error;

      setPasswordSuccess(true);
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => {
        setPasswordSuccess(false);
      }, 3000);
    } catch (err: any) {
      setPasswordError("Lỗi cập nhật mật khẩu: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl">
      {/* Profile Form */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <span className="bg-primary-50 p-2.5 rounded-xl text-primary-6000 dark:bg-primary-950/30 dark:text-primary-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </span>
          <div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Thông tin cá nhân</h3>
            <p className="text-xs text-neutral-400 mt-0.5">Cập nhật họ tên, số điện thoại và ngày sinh của bạn</p>
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Họ và Tên *</label>
            <input
              type="text"
              required
              placeholder="Nhập họ và tên..."
              value={profile.name}
              onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Số điện thoại *</label>
            <input
              type="text"
              required
              placeholder="Nhập số điện thoại liên lạc..."
              value={profile.phone}
              onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-4 py-3 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Ngày sinh</label>
            <input
              type="date"
              value={profile.dob}
              onChange={(e) => setProfile(prev => ({ ...prev, dob: e.target.value }))}
              className="w-full px-4 py-3 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Email tài khoản (Read-only)</label>
            <input
              type="text"
              readOnly
              value={user?.email || ""}
              className="w-full px-4 py-3 text-sm rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/40 text-neutral-400 outline-none cursor-not-allowed font-medium"
            />
          </div>

          {profileSuccess && (
            <p className="text-xs text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 p-2.5 rounded-xl text-center">
              ✓ Cập nhật thông tin cá nhân thành công!
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full text-center bg-primary-6000 hover:bg-primary-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md shadow-primary-6000/10 flex items-center justify-center"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Lưu thay đổi"
            )}
          </button>
        </form>
      </div>

      {/* Password Update Form */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <span className="bg-primary-50 p-2.5 rounded-xl text-primary-6000 dark:bg-primary-950/30 dark:text-primary-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </span>
          <div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Đổi mật khẩu</h3>
            <p className="text-xs text-neutral-400 mt-0.5">Đặt lại mật khẩu truy cập mới cho tài khoản của bạn</p>
          </div>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Mật khẩu mới *</label>
            <input
              type="password"
              required
              placeholder="Tối thiểu 6 ký tự..."
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
              className="w-full px-4 py-3 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Xác nhận mật khẩu mới *</label>
            <input
              type="password"
              required
              placeholder="Nhập lại mật khẩu mới..."
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
              className="w-full px-4 py-3 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
            />
          </div>

          {passwordError && (
            <p className="text-xs text-red-500 font-bold bg-red-50 dark:bg-red-950/20 border border-red-250 p-2.5 rounded-xl text-center">
              ⚠️ {passwordError}
            </p>
          )}

          {passwordSuccess && (
            <p className="text-xs text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 p-2.5 rounded-xl text-center">
              ✓ Cập nhật mật khẩu thành công!
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full text-center bg-primary-6000 hover:bg-primary-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md shadow-primary-6000/10 flex items-center justify-center"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Cập nhật mật khẩu"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
