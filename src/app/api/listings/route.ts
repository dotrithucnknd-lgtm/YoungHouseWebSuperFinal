import { NextResponse } from "next/server";
import { getListings } from "@/lib/listingsQuery";

// GET /api/listings?hot=true|false|fill
//   hot=true  -> only rooms flagged is_hot by admin
//   hot=fill  -> HOT rooms first, then fill with latest rooms up to `limit`
//   (default) -> latest rooms by created_at
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const hotParam = (searchParams.get("hot") || "").toLowerCase();
    const limitParam = Number(searchParams.get("limit")) || 50;

    const { listings, error } = await getListings({ hot: hotParam, limit: limitParam });

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ listings });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unknown error" }, { status: 500 });
  }
}
