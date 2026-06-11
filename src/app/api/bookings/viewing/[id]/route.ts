import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: "Thiếu mã lịch hẹn" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("bookings")
      .select(`
        id, check_in_date, guests_count, status, message, total_price,
        rooms ( title, address, banner, price )
      `)
      .eq("id", id)
      .eq("total_price", 0)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Không tìm thấy lịch hẹn" }, { status: 404 });
    }

    return NextResponse.json({ booking: data });
  } catch (err) {
    console.error("Fetch viewing booking:", err);
    return NextResponse.json({ error: "Có lỗi xảy ra" }, { status: 500 });
  }
}
