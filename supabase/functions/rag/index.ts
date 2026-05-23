// Deno Deploy / Supabase Edge Function: RAG via Gemini
// Expects env: GEMINI_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY (for row fetching, anon key is fine for public data)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Gemini REST config: try free/commonly available models first
const GEMINI_MODEL_CANDIDATES = [
  // Try 2.5 series first
  "gemini-2.5-flash",
  // "gemini-2.5-pro",
  // "gemini-2.5-flash-lite",

] as const;

type RagRequest = {
  question: string;
  // Optional: specify a table and filters to fetch grounding context
  table?: string;
  // Simple filter shape: { column: string, op: "eq"|"ilike"|"gte"|"lte", value: unknown }[]
  filters?: { column?: string; op: string; value: unknown; columns?: string[] }[];
  // Optional direct context documents provided by caller
  documents?: { id?: string; title?: string; content: string; url?: string }[];
  // Max rows to fetch when table provided
  limit?: number;
};

type RagAnswer = {
  answer: string;
  citations: { id?: string; title?: string; url?: string }[];
  usedDocs: { id?: string; title?: string; excerpt: string; url?: string }[];
  listings?: {
    id: string;
    title: string;
    price_per_night: number;
    address?: string;
    city?: string;
    district?: string;
    ward?: string;
    image?: string | null;
  }[];
};

function textFromGemini(parts: unknown): string {
  try {
    const candidates = (parts as any).candidates;
    if (Array.isArray(candidates) && candidates.length > 0) {
      const content = candidates[0]?.content;
      const text = content?.parts?.map((p: any) => p.text).join("") ?? "";
      return text;
    }
  } catch (_) {}
  return "";
}

function buildPrompt(question: string, docs: { title?: string; content: string; url?: string }[]) {
  const header = `You are a helpful assistant. Answer based only on the provided context. If unsure, say you don't know.`;
  const context = docs
    .map((d, i) => `[[Doc ${i + 1}]]${d.title ? ` Title: ${d.title}\n` : ""}${d.content}\n${d.url ? `Source: ${d.url}\n` : ""}`)
    .join("\n\n");
  return `${header}\n\nContext:\n${context}\n\nUser question: ${question}`;
}

function supabaseFromEnv() {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_ANON_KEY");
  if (!url || !key) return null;
  return createClient(url, key);
}

// Very light intent extraction for Vietnamese queries like
// "tìm phòng trọ dưới 2 triệu ở Hà Nội"
function extractHotelIntent(question: string): {
  table?: string;
  maxPricePerNight?: number;
  maxMonthlyPrice?: number;
  city?: string;
  locationKeywords?: string[];
} {
  const q = question.toLowerCase();
  const result: { table?: string; maxPricePerNight?: number; maxMonthlyPrice?: number; city?: string; locationKeywords?: string[] } = {};
  // Detect city (basic)
  if (q.includes("hà nội") || q.includes("ha noi") || q.includes("hanoi")) result.city = "Hà Nội";
  if (q.includes("hồ chí minh") || q.includes("ho chi minh") || q.includes("hcm") || q.includes("sài gòn") || q.includes("sai gon")) result.city = "Hồ Chí Minh";

  // Location keywords: Tân Xã, Hòa Lạc, Thạch Thất, FPT University, v.v.
  const locs: string[] = [];
  const addIf = (cond: boolean, kw: string) => { if (cond) locs.push(kw); };
  addIf(q.includes("tân xã") || q.includes("tan xa"), "Tân Xã");
  addIf(q.includes("hòa lạc") || q.includes("hoa lac"), "Hòa Lạc");
  addIf(q.includes("thạch thất") || q.includes("thach that"), "Thạch Thất");
  addIf(q.includes("fpt") || q.includes("đại học fpt"), "FPT");
  if (locs.length) result.locationKeywords = locs;

  // Detect budget like "2 triệu", "1500k", "1.5tr"
  const m = q.match(/(\d+[\.,]?\d*)\s*(triệu|tr|trieu|k|nghìn|ngan|ngàn)?/);
  if (m) {
    const num = parseFloat(m[1].replace(",", "."));
    const unit = m[2] ?? "";
    let monthlyVnd: number | undefined;
    if (unit.includes("tr") || unit.includes("triệu") || unit.includes("trieu")) monthlyVnd = num * 1_000_000;
    else if (unit === "k" || unit.includes("nghìn") || unit.includes("ngàn") || unit.includes("ngan")) monthlyVnd = num * 1_000;
    // If user typed a bare number over 50, assume k VND; if small (<= 50) assume triệu
    if (!monthlyVnd) monthlyVnd = num > 50 ? num * 1_000 : num * 1_000_000;
    // Convert rough monthly budget to per-night for hotels table
    const perNight = monthlyVnd / 30;
    result.maxPricePerNight = Math.max(0, Math.round(perNight));
    result.maxMonthlyPrice = Math.round(monthlyVnd);
  }

  // Heuristic: choose target table
  if (q.includes("phòng trọ") || q.includes("nha tro") || q.includes("nhà trọ")) {
    result.table = "rooms";
  } else if (q.includes("motel") || q.includes("khách sạn") || q.includes("hotel")) {
    result.table = "hotels";
  }
  return result;
}

async function fetchContextFromSupabase(req: RagRequest) {
  if (!req.table) return [] as any[];
  const sb = supabaseFromEnv();
  if (!sb) return [] as any[];
  let query = sb.from(req.table).select("*");
  if (Array.isArray(req.filters)) {
    for (const f of req.filters) {
      const { column, op, value, columns } = f;
      switch (op) {
        case "eq":
          // deno-lint-ignore no-explicit-any
          query = (query as any).eq(column, value);
          break;
        case "ilike":
          // deno-lint-ignore no-explicit-any
          query = (query as any).ilike(column, String(value));
          break;
        case "or_ilike_multi": {
          const cols = (columns || []).filter(Boolean);
          const pattern = String(value);
          if (cols.length > 0) {
            const expr = cols.map((c) => `${c}.ilike.${pattern}`).join(",");
            // deno-lint-ignore no-explicit-any
            query = (query as any).or(expr);
          }
          break;
        }
        case "gte":
          // deno-lint-ignore no-explicit-any
          query = (query as any).gte(column, value);
          break;
        case "lte":
          // deno-lint-ignore no-explicit-any
          query = (query as any).lte(column, value);
          break;
        default:
          // ignore unknown ops
          break;
      }
    }
  }
  if (req.limit && req.limit > 0) {
    query = query.limit(req.limit);
  } else {
    query = query.limit(8);
  }
  const { data, error } = await query;
  if (error) return [] as any[];
  return data ?? [];
}

function toDocStrings(rows: any[]): { title?: string; content: string; url?: string }[] {
  return rows.slice(0, 16).map((r) => {
    const title = r.title || r.name || r.id?.toString();
    const url = r.url || r.link || undefined;
    const content = JSON.stringify(r);
    return { title, content, url };
  });
}

async function callGemini(prompt: string) {
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Missing GEMINI_API_KEY" }), { status: 500 });
  }
  const body = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
  };
  const versions = ["v1", "v1beta"] as const;
  for (const model of GEMINI_MODEL_CANDIDATES) {
    for (const ver of versions) {
      const url = `https://generativelanguage.googleapis.com/${ver}/models/${model}:generateContent?key=${apiKey}`;
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await resp.json();
      if (resp.ok) {
        const text = textFromGemini(json);
        return new Response(
          JSON.stringify({ answer: text, model, apiVersion: ver }),
          { headers: { "Content-Type": "application/json" } }
        );
      }
      if (resp.status !== 404) {
        return new Response(JSON.stringify({ error: json?.error || "Gemini error" }), { status: 500 });
      }
      // if 404, try next version/model
    }
  }
  return new Response(JSON.stringify({ error: "No available Gemini model (tried flash-8b, flash, 1.0-pro in v1/v1beta)" }), { status: 404 });
}

Deno.inspect = Deno.inspect;

async function callGeminiText(prompt: string): Promise<string> {
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) return "";
  const body = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
  };
  const versions = ["v1", "v1beta"] as const;
  for (const model of GEMINI_MODEL_CANDIDATES) {
    for (const ver of versions) {
      try {
        const url = `https://generativelanguage.googleapis.com/${ver}/models/${model}:generateContent?key=${apiKey}`;
        const resp = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const json = await resp.json();
        if (resp.ok) return textFromGemini(json) || "";
        if (resp.status !== 404) return "";
      } catch (_) {
        // try next
      }
    }
  }
  return "";
}

async function extractIntentWithLLM(question: string) {
  const prompt = `Bạn là bộ phân tích truy vấn. Chỉ trả về JSON thuần theo schema sau, không thêm văn bản nào khác.
{
  "table": "rooms|hotels",
  "city": "string | null",
  "locationKeywords": ["string"],
  "maxMonthlyPrice": "number | null",
  "maxPricePerNight": "number | null"
}
Câu hỏi: ${question}`;
  const txt = await callGeminiText(prompt);
  try {
    const data = JSON.parse(txt);
    return data as { table?: string; city?: string; locationKeywords?: string[]; maxMonthlyPrice?: number; maxPricePerNight?: number };
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }
  try {
    const input = (await req.json()) as RagRequest;
    if (!input?.question || typeof input.question !== "string") {
      return new Response(JSON.stringify({ error: "question is required" }), { status: 400 });
    }

    // Auto intent → if user didn't specify table/filters
    let enrichedInput = input;
    // Prefer LLM intent; fall back to heuristic
    let intent = await extractIntentWithLLM(input.question);
    if (!intent) intent = extractHotelIntent(input.question);
    if (!input.table && !input.filters && intent.table) {
      if (intent.table === "rooms") {
        enrichedInput = {
          ...input,
          table: "rooms",
          filters: [
            ...(intent.city ? [{ column: "city", op: "ilike", value: `%${intent.city}%` }] : []),
            ...(intent.maxMonthlyPrice ? [{ column: "price", op: "lte", value: intent.maxMonthlyPrice }] : []),
            { column: "status", op: "eq", value: "available" },
            ...(intent.locationKeywords && intent.locationKeywords.length
              ? [{ op: "or_ilike_multi", value: "%" + intent.locationKeywords.join("%") + "%", columns: ["address", "city", "district", "ward", "title"] }]
              : []),
          ],
          limit: input.limit ?? 12,
        };
      } else if (intent.table === "hotels") {
        enrichedInput = {
          ...input,
          table: "hotels",
          filters: [
            ...(intent.city ? [{ column: "city", op: "ilike", value: `%${intent.city}%` }] : []),
            ...(intent.maxPricePerNight ? [{ column: "price_per_night", op: "lte", value: intent.maxPricePerNight }] : []),
            { column: "status", op: "eq", value: "available" },
            ...(intent.locationKeywords && intent.locationKeywords.length
              ? [{ op: "or_ilike_multi", value: "%" + intent.locationKeywords.join("%") + "%", columns: ["address", "city", "district", "ward", "title"] }]
              : []),
          ],
          limit: input.limit ?? 12,
        };
      }
    }

    // Fetch rows
    let dbRows = await fetchContextFromSupabase(enrichedInput);
    // Fallback: if no results, show top available rooms/hotels so API never returns empty
    if ((!dbRows || dbRows.length === 0) && enrichedInput.table) {
      const sb = supabaseFromEnv();
      if (sb) {
        const { data } = await sb
          .from(enrichedInput.table)
          .select("*")
          .eq("status", "available")
          .limit(enrichedInput.limit ?? 8);
        if (data && data.length > 0) {
          dbRows = data;
        }
      }
    }
    let listings: RagAnswer["listings"] | undefined;
    if (enrichedInput.table === "rooms" && dbRows.length > 0) {
      listings = dbRows.slice(0, enrichedInput.limit ?? 12).map((r: any) => ({
        id: String(r.id),
        title: String(r.title ?? ""),
        price_per_night: Number(r.price ?? 0), // monthly price for rooms
        address: r.address ?? undefined,
        city: r.city ?? undefined,
        district: r.district ?? undefined,
        ward: r.ward ?? undefined,
        image: r.banner ?? null,
      }));
    }
    if (enrichedInput.table === "hotels" && dbRows.length > 0) {
      const sb = supabaseFromEnv();
      if (sb) {
        const hotelIds = dbRows.map((r: any) => r.id);
        const { data: imgs } = await sb
          .from("hotel_images")
          .select("hotel_id,image_url")
          .in("hotel_id", hotelIds)
          .limit(1, { foreignTable: undefined });
        const firstImageByHotel: Record<string, string> = {};
        (imgs || []).forEach((im: any) => {
          if (!firstImageByHotel[im.hotel_id]) firstImageByHotel[im.hotel_id] = im.image_url;
        });
        listings = dbRows.slice(0, enrichedInput.limit ?? 12).map((r: any) => ({
          id: String(r.id),
          title: String(r.title ?? ""),
          price_per_night: Number(r.price_per_night ?? 0),
          address: r.address ?? undefined,
          city: r.city ?? undefined,
          district: r.district ?? undefined,
          ward: r.ward ?? undefined,
          image: firstImageByHotel[r.id] ?? r.banner ?? null,
        }));
      }
    }

    const directDocs = Array.isArray(input.documents) ? input.documents : [];
    const docs = [
      ...toDocStrings(dbRows),
      ...directDocs.map((d) => ({ title: d.title, content: d.content, url: d.url })),
    ];
    const prompt = buildPrompt(input.question, docs);

    // Call LLM but tolerate failures; always return listings if available
    let geminiText = "";
    try {
      const geminiResp = await callGemini(prompt);
      const raw = await geminiResp.text();
      try {
        const j = JSON.parse(raw);
        geminiText = j.answer ?? raw ?? "";
      } catch {
        geminiText = raw ?? "";
      }
    } catch (_) {
      // ignore LLM error
    }

    if (!listings) {
      // No structured listings; return plain LLM or default text
      return new Response(
        JSON.stringify({ answer: geminiText || "Đề xuất bên dưới.", listings: [] }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    const merged: RagAnswer = {
      answer: geminiText || "Đề xuất bên dưới.",
      citations: [],
      usedDocs: [],
      listings,
    };
    return new Response(JSON.stringify(merged), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});

// end
