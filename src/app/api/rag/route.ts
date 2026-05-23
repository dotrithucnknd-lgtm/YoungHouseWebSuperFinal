import { NextRequest } from "next/server";

// Proxies to Supabase Edge Function `rag`
export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl) {
    return new Response(JSON.stringify({ error: "Missing NEXT_PUBLIC_SUPABASE_URL" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (!supabaseAnonKey) {
    return new Response(JSON.stringify({ error: "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const q = typeof body?.question === "string" ? body.question.trim() : "";
  if (!q) {
    return new Response(JSON.stringify({ error: "Missing `question`" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  // Guardrails: avoid huge payloads that cause Edge Function instability/timeouts
  if (q.length > 2000) {
    return new Response(JSON.stringify({ error: "`question` is too long (max 2000 chars)" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const requestId =
    (globalThis.crypto as any)?.randomUUID?.() ||
    `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const url = `${supabaseUrl}/functions/v1/rag`;

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${supabaseAnonKey}`,
    "X-Request-Id": requestId,
  };

  const TIMEOUT_MS = 15_000;
  const MAX_RETRIES = 2;
  const isRetryable = (status: number) => status === 429 || status >= 500;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const resp = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      const text = await resp.text();
      if (!resp.ok && isRetryable(resp.status) && attempt < MAX_RETRIES) {
        const backoffMs = 300 * Math.pow(2, attempt);
        await new Promise((r) => setTimeout(r, backoffMs));
        continue;
      }

      // Ensure JSON response even if upstream misbehaves
      const contentType = resp.headers.get("Content-Type") || "application/json";
      return new Response(text || JSON.stringify({ error: `Upstream empty response (${resp.status})` }), {
        status: resp.status,
        headers: {
          "Content-Type": contentType.includes("application/json") ? "application/json" : "application/json",
          "X-Request-Id": requestId,
        },
      });
    } catch (e: any) {
      const isTimeout = e?.name === "AbortError";
      if ((isTimeout || true) && attempt < MAX_RETRIES) {
        const backoffMs = 300 * Math.pow(2, attempt);
        await new Promise((r) => setTimeout(r, backoffMs));
        continue;
      }
      return new Response(
        JSON.stringify({
          error: isTimeout ? "AI assistant timed out. Please try again." : "AI assistant request failed.",
          requestId,
        }),
        { status: 504, headers: { "Content-Type": "application/json", "X-Request-Id": requestId } }
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  return new Response(JSON.stringify({ error: "AI assistant failed after retries", requestId }), {
    status: 502,
    headers: { "Content-Type": "application/json", "X-Request-Id": requestId },
  });
}


