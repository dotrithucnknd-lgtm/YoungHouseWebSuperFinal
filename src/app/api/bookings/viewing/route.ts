import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      room_id,
      check_in_date,
      guests_count = 1,
      guest_name,
      phone,
      message,
    } = body;

    if (!room_id || !check_in_date) {
      return NextResponse.json(
        { error: "Thiếu thông tin phòng hoặc ngày xem" },
        { status: 400 }
      );
    }

    const name = String(guest_name || "").trim();
    const phoneDigits = String(phone || "").replace(/\D/g, "");

    if (!name) {
      return NextResponse.json({ error: "Vui lòng nhập họ tên" }, { status: 400 });
    }
    if (phoneDigits.length < 10) {
      return NextResponse.json(
        { error: "Vui lòng nhập số điện thoại hợp lệ (10–11 số)" },
        { status: 400 }
      );
    }

    const viewDate = new Date(check_in_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (viewDate < today) {
      return NextResponse.json(
        { error: "Ngày xem phòng không thể là ngày trong quá khứ" },
        { status: 400 }
      );
    }

    const { data: room, error: roomError } = await supabaseAdmin
      .from("rooms")
      .select("id, title")
      .eq("id", room_id)
      .single();

    if (roomError || !room) {
      return NextResponse.json({ error: "Không tìm thấy phòng" }, { status: 404 });
    }

    const note = [
      `Khách: ${name}`,
      `SĐT: ${phoneDigits}`,
      message?.trim() ? String(message).trim() : null,
    ]
      .filter(Boolean)
      .join("\n");

    const { data, error } = await supabaseAdmin
      .from("bookings")
      .insert({
        room_id,
        user_id: null,
        check_in_date,
        check_out_date: check_in_date,
        guests_count: Math.min(Math.max(Number(guests_count) || 1, 1), 10),
        total_price: 0,
        status: "pending",
        message: note,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Guest viewing booking error:", error);
      return NextResponse.json(
        { error: error.message || "Không thể đặt lịch xem phòng" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, bookingId: data.id });
  } catch (err) {
    console.error("Guest viewing booking:", err);
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi đặt lịch xem phòng" },
      { status: 500 }
    );
  }
}
