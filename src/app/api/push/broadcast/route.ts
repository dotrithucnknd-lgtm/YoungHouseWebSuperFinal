import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";
import { getRolesForAudience, isPushConfigured, PushPayload } from "@/lib/pushConfig";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function authenticateAdminOrManager(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { error: "Unauthorized", status: 401 as const };
  }

  const token = authHeader.replace("Bearer ", "");
  const {
    data: { user },
    error: authError,
  } = await supabaseAdmin.auth.getUser(token);

  if (authError || !user) {
    return { error: "Invalid token", status: 401 as const };
  }

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "manager"].includes(profile.role)) {
    return { error: "Insufficient permissions", status: 403 as const };
  }

  return { user };
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateAdminOrManager(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    if (!isPushConfigured()) {
      return NextResponse.json({
        sent: 0,
        skipped: true,
        reason: "VAPID keys chưa được cấu hình",
      });
    }

    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT!,
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!
    );

    const body = await request.json();
    const { title, content, target_audience, url } = body as {
      title: string;
      content: string;
      target_audience: "all" | "renters" | "owners" | "admins";
      url?: string;
    };

    if (!title || !content) {
      return NextResponse.json({ error: "Missing title or content" }, { status: 400 });
    }

    const allowedRoles = getRolesForAudience(target_audience || "all");

    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .in("role", allowedRoles);

    const userIds = profiles?.map((p) => p.id) || [];
    if (userIds.length === 0) {
      return NextResponse.json({ sent: 0, failed: 0 });
    }

    const { data: subscriptions } = await supabaseAdmin
      .from("push_subscriptions")
      .select("*")
      .in("user_id", userIds);

    if (!subscriptions?.length) {
      return NextResponse.json({ sent: 0, failed: 0, reason: "Không có thiết bị đăng ký" });
    }

    const payload: PushPayload = {
      title,
      body: content.slice(0, 200),
      url: url || "/",
      tag: `yh-${Date.now()}`,
    };

    let sent = 0;
    let failed = 0;
    const staleEndpoints: string[] = [];

    await Promise.all(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            },
            JSON.stringify(payload)
          );
          sent++;
        } catch (err: unknown) {
          failed++;
          const statusCode = (err as { statusCode?: number })?.statusCode;
          if (statusCode === 404 || statusCode === 410) {
            staleEndpoints.push(sub.endpoint);
          }
        }
      })
    );

    if (staleEndpoints.length > 0) {
      await supabaseAdmin
        .from("push_subscriptions")
        .delete()
        .in("endpoint", staleEndpoints);
    }

    return NextResponse.json({ sent, failed });
  } catch (error) {
    console.error("Push broadcast error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
