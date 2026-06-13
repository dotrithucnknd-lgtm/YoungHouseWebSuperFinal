import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import type { TenantImportRow, TenantImportResult } from "@/lib/tenantImport";

const BATCH_SIZE = 50;
const MAX_ROWS_PER_REQUEST = 500;

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function loadExistingKeys(supabase: ReturnType<typeof getAdminClient>) {
  const [{ data: phones }, { data: cccds }] = await Promise.all([
    supabase.from("profiles").select("phone").not("phone", "is", null),
    supabase.from("tenant_profiles").select("id_card_number").not("id_card_number", "is", null),
  ]);

  return {
    phones: new Set((phones || []).map((p) => p.phone?.trim()).filter(Boolean)),
    cccds: new Set((cccds || []).map((t) => t.id_card_number?.trim()).filter(Boolean)),
  };
}

async function importBatch(
  supabase: ReturnType<typeof getAdminClient>,
  rows: TenantImportRow[],
  existing: { phones: Set<string | undefined>; cccds: Set<string | undefined> },
  startRowIndex: number
): Promise<TenantImportResult> {
  const result: TenantImportResult = { success: 0, skipped: 0, errors: [] };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = startRowIndex + i;

    if (existing.phones.has(row.phone)) {
      result.skipped++;
      result.errors.push({ row: rowNum, message: `SĐT ${row.phone} đã tồn tại` });
      continue;
    }
    if (existing.cccds.has(row.id_card_number)) {
      result.skipped++;
      result.errors.push({ row: rowNum, message: `CCCD ${row.id_card_number} đã tồn tại` });
      continue;
    }

    const profileId = crypto.randomUUID();

    const { error: profileError } = await supabase.from("profiles").insert({
      id: profileId,
      name: row.name,
      phone: row.phone,
      dob: row.dob || null,
      role: "tenant",
    });

    if (profileError) {
      result.errors.push({ row: rowNum, message: profileError.message });
      continue;
    }

    const { error: tenantError } = await supabase.from("tenant_profiles").insert({
      profile_id: profileId,
      id_card_number: row.id_card_number,
      id_card_issue_date: row.id_card_issue_date || null,
      id_card_issue_place: row.id_card_issue_place || null,
      hometown: row.hometown || null,
      emergency_contact_name: row.emergency_contact_name || null,
      emergency_contact_phone: row.emergency_contact_phone || null,
      metadata: {
        email: row.email || null,
        gender: row.gender || null,
        occupation: row.occupation || null,
        emergency_contact_relationship: row.emergency_contact_relationship || null,
        has_temporary_residence: row.has_temporary_residence ?? false,
      },
    });

    if (tenantError) {
      await supabase.from("profiles").delete().eq("id", profileId);
      result.errors.push({ row: rowNum, message: tenantError.message });
      continue;
    }

    existing.phones.add(row.phone);
    existing.cccds.add(row.id_card_number);
    result.success++;
  }

  return result;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const tenants = body.tenants as TenantImportRow[];
    const startRowIndex = (body.startRowIndex as number) || 2;

    if (!Array.isArray(tenants) || tenants.length === 0) {
      return NextResponse.json({ error: "Không có dữ liệu để nhập" }, { status: 400 });
    }

    if (tenants.length > MAX_ROWS_PER_REQUEST) {
      return NextResponse.json(
        { error: `Mỗi lần chỉ nhập tối đa ${MAX_ROWS_PER_REQUEST} dòng. Hãy chia nhỏ file.` },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();
    const existing = await loadExistingKeys(supabase);

    const aggregated: TenantImportResult = { success: 0, skipped: 0, errors: [] };

    for (let i = 0; i < tenants.length; i += BATCH_SIZE) {
      const batch = tenants.slice(i, i + BATCH_SIZE);
      const batchResult = await importBatch(supabase, batch, existing, startRowIndex + i);
      aggregated.success += batchResult.success;
      aggregated.skipped += batchResult.skipped;
      aggregated.errors.push(...batchResult.errors);
    }

    return NextResponse.json(aggregated);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Có lỗi xảy ra";
    console.error("Error in POST /api/tenants/import:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
