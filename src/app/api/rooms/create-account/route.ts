import { NextRequest, NextResponse } from "next/server";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

function getAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error(
      "Vui lòng cấu hình SUPABASE_SERVICE_ROLE_KEY trong file .env.local để sử dụng tính năng tạo tài khoản!"
    );
  }

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function buildRoomCredentials(roomName: string, houseTitle: string) {
  const words = houseTitle.trim().split(/(?=[A-Z])|\s+/);
  let houseAbbreviation = "";
  words.forEach((word: string, index: number) => {
    const cleanWord = word
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]/g, "");

    if (cleanWord) {
      if (/^\d+$/.test(cleanWord)) {
        houseAbbreviation += cleanWord;
      } else if (index === 0) {
        houseAbbreviation += cleanWord[0].toUpperCase();
      } else {
        houseAbbreviation += cleanWord[0].toLowerCase();
      }
    }
  });

  const cleanRoomName = roomName.replace(/[^a-zA-Z0-9]/g, "");
  const username = `${cleanRoomName}${houseAbbreviation}`;
  const email = `${username.toLowerCase()}@younghouse.vn`;
  const password = "YoungHouse2026";

  return { username, email, password };
}

async function findUserIdByEmail(
  supabaseAdmin: SupabaseClient,
  email: string
): Promise<string | null> {
  const target = email.toLowerCase();
  let page = 1;

  while (page <= 10) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage: 1000,
    });

    if (error) {
      console.error("listUsers error:", error);
      break;
    }

    const found = data.users.find((u) => u.email?.toLowerCase() === target);
    if (found) return found.id;

    if (data.users.length < 1000) break;
    page += 1;
  }

  return null;
}

async function linkRoomAccount(
  supabaseAdmin: SupabaseClient,
  params: {
    userId: string;
    roomUnitId: string;
    roomName: string;
    houseTitle: string;
    username: string;
  }
) {
  const { userId, roomUnitId, roomName, houseTitle, username } = params;

  const { error: profileError } = await supabaseAdmin.from("profiles").upsert(
    {
      id: userId,
      name: `Phòng ${roomName} (${houseTitle})`,
      phone: username,
      role: "tenant",
      dob: null,
    },
    { onConflict: "id" }
  );

  if (profileError) {
    throw new Error("Không thể cập nhật hồ sơ tenant: " + profileError.message);
  }

  const metadata = {
    username,
    room_unit_id: roomUnitId,
    notes: `Tài khoản phòng ${roomName} - ${houseTitle}`,
  };

  const { data: existingTenantProfile } = await supabaseAdmin
    .from("tenant_profiles")
    .select("id")
    .eq("profile_id", userId)
    .maybeSingle();

  if (existingTenantProfile) {
    const { error: tenantUpdateError } = await supabaseAdmin
      .from("tenant_profiles")
      .update({ metadata, updated_at: new Date().toISOString() })
      .eq("profile_id", userId);

    if (tenantUpdateError) {
      throw new Error("Không thể cập nhật tenant_profiles: " + tenantUpdateError.message);
    }
  } else {
    const { error: tenantInsertError } = await supabaseAdmin
      .from("tenant_profiles")
      .insert({ profile_id: userId, metadata });

    if (tenantInsertError) {
      throw new Error("Không thể tạo tenant_profiles: " + tenantInsertError.message);
    }
  }

  const roomPayload: Record<string, string> = { current_renter_id: userId };
  const { error: roomUpdateError } = await supabaseAdmin
    .from("room_units")
    .update(roomPayload)
    .eq("id", roomUnitId);

  if (roomUpdateError) {
    throw new Error("Không thể liên kết phòng với tài khoản: " + roomUpdateError.message);
  }

  // account_id is optional — ignore if column missing in older schemas
  await supabaseAdmin
    .from("room_units")
    .update({ account_id: userId })
    .eq("id", roomUnitId);
}

export async function POST(req: NextRequest) {
  try {
    const { roomUnitId, roomName, houseTitle } = (await req.json()) as {
      roomUnitId: string;
      roomName: string;
      houseTitle: string;
    };

    if (!roomUnitId || !roomName || !houseTitle) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabaseAdmin = getAdminClient();
    const { username, email, password } = buildRoomCredentials(roomName, houseTitle);

    const { data: roomUnit, error: roomUnitError } = await supabaseAdmin
      .from("room_units")
      .select("id, name, current_renter_id")
      .eq("id", roomUnitId)
      .single();

    if (roomUnitError || !roomUnit) {
      return NextResponse.json({ error: "Không tìm thấy phòng" }, { status: 404 });
    }

    if (roomUnit.current_renter_id) {
      return NextResponse.json({
        success: true,
        alreadyLinked: true,
        message: "Phòng đã có tài khoản liên kết",
        username,
        email,
        password,
        userId: roomUnit.current_renter_id,
      });
    }

    let userId: string | null = null;
    let createdNewUser = false;

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name: `Tài khoản phòng ${roomName}`,
        role: "tenant",
        username,
      },
    });

    if (authError) {
      const alreadyExists =
        authError.message.includes("already registered") ||
        authError.message.includes("already been registered") ||
        authError.status === 422;

      if (alreadyExists) {
        userId = await findUserIdByEmail(supabaseAdmin, email);
        if (!userId) {
          return NextResponse.json(
            { error: "Tài khoản đã tồn tại nhưng không tìm thấy user ID để liên kết phòng" },
            { status: 500 }
          );
        }
      } else {
        console.error("Auth Admin Error:", authError);
        return NextResponse.json(
          { error: "Lỗi tạo tài khoản Auth: " + authError.message },
          { status: 500 }
        );
      }
    } else {
      userId = authData.user.id;
      createdNewUser = true;
    }

    await linkRoomAccount(supabaseAdmin, {
      userId: userId!,
      roomUnitId,
      roomName,
      houseTitle,
      username,
    });

    return NextResponse.json({
      success: true,
      message: createdNewUser
        ? "Tạo tài khoản phòng thành công!"
        : "Đã liên kết tài khoản có sẵn với phòng",
      username,
      email,
      password,
      userId,
      linked: true,
    });
  } catch (err: unknown) {
    console.error("Error in create-account api route:", err);
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
