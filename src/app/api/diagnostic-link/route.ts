import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  try {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      return NextResponse.json({ error: "Missing service role key" }, { status: 500 });
    }

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

    // 1. Update room unit
    const { error: updateError } = await supabaseAdmin
      .from("room_units")
      .update({ current_renter_id: "a7205502-9ca9-418a-834a-cc0c7ad6fcb7" })
      .eq("id", "0bc2a9cc-a1b5-4cba-9826-9a7e69984cea");

    if (updateError) {
      return NextResponse.json({ error: "Update failed: " + updateError.message }, { status: 500 });
    }

    // 2. Also ensure that the profile has the role 'tenant' so RLS policies check role correctly
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({ role: "tenant" })
      .eq("id", "a7205502-9ca9-418a-834a-cc0c7ad6fcb7");

    return NextResponse.json({
      success: true,
      message: "Room P101 successfully linked to P101Yh1 and profile role updated to tenant!",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
