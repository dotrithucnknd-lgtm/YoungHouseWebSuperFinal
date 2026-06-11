import { supabase } from "@/lib/supabaseClient";

export async function broadcastPushNotification(payload: {
  title: string;
  content: string;
  target_audience: "all" | "renters" | "owners" | "admins";
  url?: string;
}): Promise<{ sent?: number; skipped?: boolean; reason?: string }> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) return { skipped: true, reason: "Not logged in" };

    const res = await fetch("/api/push/broadcast", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    return await res.json();
  } catch (error) {
    console.error("broadcastPushNotification:", error);
    return { skipped: true, reason: "Network error" };
  }
}
