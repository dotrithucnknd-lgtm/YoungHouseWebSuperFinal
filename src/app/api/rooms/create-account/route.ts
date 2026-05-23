import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const { roomUnitId, roomName, houseTitle } = await req.json();

    if (!roomUnitId || !roomName || !houseTitle) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: "Vui lòng cấu hình SUPABASE_SERVICE_ROLE_KEY trong file .env.local để sử dụng tính năng tạo tài khoản!" },
        { status: 500 }
      );
    }

    // Initialize Supabase Admin client with bypass RLS capability
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // 1. Generate username and dummy email based on rules:
    // e.g. roomName: "P101", houseTitle: "YoungHouse 1" -> P101Yh1
    const words = houseTitle.trim().split(/(?=[A-Z])|\s+/);
    let houseAbbreviation = "";
    words.forEach((word, index) => {
      const cleanWord = word
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]/g, "");

      if (cleanWord) {
        if (/^\d+$/.test(cleanWord)) {
          houseAbbreviation += cleanWord;
        } else {
          if (index === 0) {
            houseAbbreviation += cleanWord[0].toUpperCase();
          } else {
            houseAbbreviation += cleanWord[0].toLowerCase();
          }
        }
      }
    });

    const cleanRoomName = roomName.replace(/[^a-zA-Z0-9]/g, "");
    const username = `${cleanRoomName}${houseAbbreviation}`;
    const email = `${username.toLowerCase()}@younghouse.vn`;
    const password = "YoungHouse2026";

    // 2. Check if auth user already exists to avoid duplication errors
    // Since we are checking, we can try to find existing user
    console.log(`Creating room account: Username=${username}, Email=${email}`);

    // Create user via Admin Auth API (completely bypasses email verification)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        name: `Tài khoản phòng ${roomName}`,
        role: "tenant",
        username: username,
      },
    });

    if (authError) {
      // If user already exists, we might get an error, check if it's already there
      if (authError.message.includes("already registered") || authError.status === 422) {
        return NextResponse.json({
          message: "Tài khoản đã tồn tại trước đó",
          username,
          email,
        });
      }
      console.error("Auth Admin Error:", authError);
      return NextResponse.json({ error: "Lỗi tạo tài khoản Auth: " + authError.message }, { status: 500 });
    }

    const userId = authData.user.id;

    // 3. Create profile in public.profiles table (bypassing RLS)
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: userId,
        name: `Phòng ${roomName} (${houseTitle})`,
        phone: username, // Use username as key identifier
        role: "tenant",
        dob: null,
      });

    if (profileError) {
      console.error("Profile creation failed:", profileError);
    }

    // 4. Create tenant profile in public.tenant_profiles (bypassing RLS)
    const { error: tenantProfileError } = await supabaseAdmin
      .from("tenant_profiles")
      .insert({
        profile_id: userId,
        metadata: {
          username: username,
          room_unit_id: roomUnitId,
          notes: `Tài khoản tự động tạo cho phòng ${roomName} - ${houseTitle}`,
        },
      });

    if (tenantProfileError) {
      console.error("Tenant Profile creation failed:", tenantProfileError);
    }

    // 5. Link current_renter_id directly into room_units
    const { error: roomUpdateError } = await supabaseAdmin
      .from("room_units")
      .update({ current_renter_id: userId })
      .eq("id", roomUnitId);

    if (roomUpdateError) {
      console.error("Linking room to account failed:", roomUpdateError);
    }

    return NextResponse.json({
      success: true,
      message: "Tạo tài khoản phòng thành công!",
      username,
      email,
      password,
      userId,
    });
  } catch (err: any) {
    console.error("Error in create-account api route:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
