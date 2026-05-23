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

    // 1. Get all room units named P101
    const { data: rooms, error: roomsError } = await supabaseAdmin
      .from("room_units")
      .select(`
        *,
        rooms (
          id,
          title
        )
      `)
      .ilike("name", "%P101%");

    if (roomsError) {
      return NextResponse.json({ error: "Error reading rooms: " + roomsError.message }, { status: 500 });
    }

    const results = [];

    for (const r of rooms || []) {
      // Fetch linked contracts
      const { data: contracts } = await supabaseAdmin
        .from("contracts")
        .select("*")
        .eq("room_unit_id", r.id);

      // Fetch linked invoices
      const { data: invoices } = await supabaseAdmin
        .from("invoices")
        .select("*")
        .eq("room_unit_id", r.id);

      results.push({
        room_unit: {
          id: r.id,
          name: r.name,
          current_renter_id: r.current_renter_id,
          house: r.rooms,
        },
        contracts: contracts || [],
        invoices: invoices || [],
      });
    }

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
