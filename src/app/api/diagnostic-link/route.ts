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

    // 1. Fetch all room units with a tenant linked
    const { data: roomUnits, error: roomError } = await supabaseAdmin
      .from("room_units")
      .select("id, name, current_renter_id")
      .not("current_renter_id", "is", null);

    if (roomError) {
      return NextResponse.json({ error: "Failed to fetch room units: " + roomError.message }, { status: 500 });
    }

    // 2. Fetch all active contracts to ensure contract renters are also updated
    const { data: contracts, error: contractError } = await supabaseAdmin
      .from("contracts")
      .select("id, renter_id")
      .not("renter_id", "is", null);

    if (contractError) {
      return NextResponse.json({ error: "Failed to fetch contracts: " + contractError.message }, { status: 500 });
    }

    // Combine all tenant IDs that need promoting
    const tenantIds = new Set<string>();
    for (const unit of roomUnits || []) {
      if (unit.current_renter_id) tenantIds.add(unit.current_renter_id);
    }
    for (const contract of contracts || []) {
      if (contract.renter_id) tenantIds.add(contract.renter_id);
    }

    const repairedProfiles: string[] = [];
    const skippedProfiles: string[] = [];

    // 3. Promote all found profile IDs to 'tenant' if they are currently 'user'
    for (const profileId of tenantIds) {
      const { data: profile, error: fetchError } = await supabaseAdmin
        .from("profiles")
        .select("id, name, role")
        .eq("id", profileId)
        .single();

      if (fetchError || !profile) {
        continue;
      }

      // Only promote if it is currently 'user' to avoid modifying admins/operators by accident
      if (profile.role === "user") {
        const { error: updateError } = await supabaseAdmin
          .from("profiles")
          .update({ role: "tenant" })
          .eq("id", profileId);

        if (!updateError) {
          repairedProfiles.push(`${profile.name || "Unknown"} (${profileId})`);
        }
      } else {
        skippedProfiles.push(`${profile.name || "Unknown"} (Role is already '${profile.role}')`);
      }
    }

    return NextResponse.json({
      success: true,
      summary: `Scanned ${tenantIds.size} tenant profile IDs.`,
      repaired_count: repairedProfiles.length,
      repaired: repairedProfiles,
      skipped: skippedProfiles,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
