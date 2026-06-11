"use client";

import { supabase } from "@/lib/supabaseClient";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isPushSupported()) return null;
  try {
    return await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  } catch (error) {
    console.error("Service worker registration failed:", error);
    return null;
  }
}

export async function subscribeToPushNotifications(): Promise<{
  success: boolean;
  error?: string;
}> {
  if (!isPushSupported()) {
    return { success: false, error: "Trình duyệt không hỗ trợ thông báo đẩy" };
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return {
      success: false,
      error: "Bạn cần cho phép thông báo trong cài đặt trình duyệt",
    };
  }

  const registration = await registerServiceWorker();
  if (!registration) {
    return { success: false, error: "Không thể đăng ký service worker" };
  }

  const keyRes = await fetch("/api/push/vapid-public-key");
  const keyData = await keyRes.json();
  if (!keyData.publicKey) {
    return {
      success: false,
      error: "Hệ thống chưa cấu hình VAPID key (liên hệ quản trị viên)",
    };
  }

  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(keyData.publicKey),
    });
  }

  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) {
    return { success: false, error: "Vui lòng đăng nhập để bật thông báo" };
  }

  const subJson = subscription.toJSON();
  const res = await fetch("/api/push/subscribe", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      endpoint: subJson.endpoint,
      keys: subJson.keys,
      userAgent: navigator.userAgent,
    }),
  });

  const result = await res.json();
  if (!res.ok) {
    return { success: false, error: result.error || "Đăng ký thất bại" };
  }

  localStorage.setItem("pushNotificationsEnabled", "1");
  return { success: true };
}

export async function unsubscribeFromPushNotifications(): Promise<void> {
  if (!isPushSupported()) return;
  const registration = await navigator.serviceWorker.getRegistration("/");
  const subscription = await registration?.pushManager.getSubscription();
  if (subscription) {
    await subscription.unsubscribe();
  }
  localStorage.removeItem("pushNotificationsEnabled");
}

export function getPushPermissionStatus(): NotificationPermission | "unsupported" {
  if (!isPushSupported()) return "unsupported";
  return Notification.permission;
}
