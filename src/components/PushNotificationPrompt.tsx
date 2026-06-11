"use client";

import React, { useEffect, useState } from "react";
import { BellAlertIcon, BellSlashIcon } from "@heroicons/react/24/outline";
import ButtonPrimary from "@/shared/ButtonPrimary";
import {
  getPushPermissionStatus,
  isPushSupported,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
} from "@/lib/webPushClient";

interface PushNotificationPromptProps {
  compact?: boolean;
}

export default function PushNotificationPrompt({ compact = false }: PushNotificationPromptProps) {
  const [status, setStatus] = useState<NotificationPermission | "unsupported">("default");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setStatus(getPushPermissionStatus());
    setEnabled(localStorage.getItem("pushNotificationsEnabled") === "1");
  }, []);

  if (status === "unsupported") {
    return null;
  }

  const handleEnable = async () => {
    setLoading(true);
    setMessage(null);
    const result = await subscribeToPushNotifications();
    setLoading(false);
    setStatus(getPushPermissionStatus());
    if (result.success) {
      setEnabled(true);
      setMessage("Đã bật thông báo trên thiết bị này.");
    } else {
      setMessage(result.error || "Không thể bật thông báo");
    }
  };

  const handleDisable = async () => {
    setLoading(true);
    await unsubscribeFromPushNotifications();
    setLoading(false);
    setEnabled(false);
    setMessage("Đã tắt thông báo đẩy trên thiết bị này.");
  };

  if (compact) {
    if (status === "granted" && enabled) return null;
    return (
      <button
        type="button"
        onClick={handleEnable}
        disabled={loading || status === "denied"}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-6000 hover:underline disabled:opacity-50"
      >
        <BellAlertIcon className="w-4 h-4" />
        Bật thông báo điện thoại
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-6000">
          {enabled ? (
            <BellAlertIcon className="w-6 h-6" />
          ) : (
            <BellSlashIcon className="w-6 h-6" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
            Thông báo trên điện thoại
          </h3>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Nhận thông báo ngay cả khi không mở website. Trên iPhone: thêm YoungHouse vào Màn hình
            chính (Safari → Chia sẻ → Thêm vào MH chính), sau đó bật thông báo.
          </p>

          {status === "denied" && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-2">
              Trình duyệt đang chặn thông báo. Vào Cài đặt trình duyệt → Quyền → Thông báo để bật
              lại.
            </p>
          )}

          {message && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-2">{message}</p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {!enabled || status !== "granted" ? (
              <ButtonPrimary
                type="button"
                onClick={handleEnable}
                disabled={loading || status === "denied"}
                className="!py-2 !px-4 !text-sm"
              >
                {loading ? "Đang xử lý..." : "Bật thông báo đẩy"}
              </ButtonPrimary>
            ) : (
              <button
                type="button"
                onClick={handleDisable}
                disabled={loading}
                className="text-sm font-medium text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              >
                Tắt thông báo trên thiết bị này
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
