import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY not configured");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// GET /api/rooms/accounts - list all room units with their tenant account info
export async function GET(_req: NextRequest) {
  try {
    const supabaseAdmin = getAdminClient();

    // Fetch all room units with related room/property info and tenant profile
    const { data: units, error: unitsError } = await supabaseAdmin
      .from("room_units")
      .select(`
        id,
        name,
        status,
        current_renter_id,
        room_id,
        rooms:room_id ( id, title, address )
      `)
      .order("room_id")
      .order("name");

    if (unitsError) {
      return NextResponse.json({ error: unitsError.message }, { status: 500 });
    }

    // Fetch profile info for all renters
    const renterIds = (units ?? [])
      .map((u: any) => u.current_renter_id)
      .filter(Boolean) as string[];

    let profilesMap: Record<string, { name: string; phone: string; email?: string }> = {};

    if (renterIds.length > 0) {
      const { data: profiles } = await supabaseAdmin
        .from("profiles")
        .select("id, name, phone")
        .in("id", renterIds);

      (profiles ?? []).forEach((p: any) => {
        profilesMap[p.id] = { name: p.name, phone: p.phone };
      });

      // Fetch emails from auth.users via admin API (paginated up to 1000)
      const { data: authList } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
      (authList?.users ?? []).forEach((u) => {
        if (profilesMap[u.id]) {
          profilesMap[u.id].email = u.email ?? undefined;
        }
      });
    }

    const result = (units ?? []).map((unit: any) => {
      const profile = unit.current_renter_id ? profilesMap[unit.current_renter_id] : null;
      const email = profile?.email ?? null;
      const username = email ? email.split("@")[0] : null;
      return {
        id: unit.id,
        name: unit.name,
        status: unit.status,
        room_id: unit.room_id,
        property_title: unit.rooms?.title ?? "",
        property_address: unit.rooms?.address ?? "",
        current_renter_id: unit.current_renter_id ?? null,
        tenant_name: profile?.name ?? null,
        tenant_phone: profile?.phone ?? null,
        email,
        username,
        // We never expose the password; clients will use reset endpoint
        has_account: !!unit.current_renter_id,
      };
    });

    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/rooms/accounts - reset password or unlink account
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, userId, roomUnitId, newPassword } = body as {
      action: "reset-password" | "unlink";
      userId?: string;
      roomUnitId?: string;
      newPassword?: string;
    };

    const supabaseAdmin = getAdminClient();

    if (action === "reset-password") {
      if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 });

      const password = newPassword?.trim() || "YoungHouse2026";

      const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, { password });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      return NextResponse.json({ success: true, message: "Đặt lại mật khẩu thành công!", password });
    }

    if (action === "unlink") {
      if (!roomUnitId) return NextResponse.json({ error: "roomUnitId is required" }, { status: 400 });

      const { error } = await supabaseAdmin
        .from("room_units")
        .update({ current_renter_id: null })
        .eq("id", roomUnitId);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      return NextResponse.json({ success: true, message: "Đã hủy liên kết tài khoản khỏi phòng." });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
