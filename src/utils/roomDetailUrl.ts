import type { Route } from "next";

const UUID_TAIL_RE =
  /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;

const SLUG_MAX_LEN = 80;

/**
 * ASCII slug for URL segment (Vietnamese → unaccented latin).
 */
export function slugifyRoomTitle(title: string): string {
  const raw = title
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SLUG_MAX_LEN);
  return raw || "phong-tro";
}

/**
 * Path: /phong-tro-detail/{slug}-{uuid}
 */
export function buildRoomDetailPath(title: string, roomId: string): string {
  const slug = slugifyRoomTitle(title);
  return `/phong-tro-detail/${slug}-${roomId}`;
}

export function buildRoomDetailHref(title: string, roomId: string): Route {
  return buildRoomDetailPath(title, roomId) as Route;
}

/**
 * Extract room UUID from the last dynamic segment (slug-uuid).
 */
export function parseRoomDetailSlugParam(segment: string): string | null {
  if (!segment || typeof segment !== "string") return null;
  const m = segment.trim().match(UUID_TAIL_RE);
  return m ? m[1].toLowerCase() : null;
}

/**
 * Gallery / layout: resolve room id from pathname (pretty URL) or legacy ?id=.
 */
export function resolveRoomIdFromDetailUrl(
  pathname: string | null,
  idQuery: string | null
): string | null {
  if (!pathname?.includes("/phong-tro-detail")) return null;
  const parts = pathname.split("/").filter(Boolean);
  const last = parts[parts.length - 1];
  if (last && last !== "phong-tro-detail") {
    const fromSlug = parseRoomDetailSlugParam(last);
    if (fromSlug) return fromSlug;
  }
  return idQuery;
}
