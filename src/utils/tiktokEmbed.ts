/**
 * Trích ID video TikTok từ:
 * - URL chia sẻ: https://www.tiktok.com/@user/video/7549...
 * - Iframe embed: .../embed/v2/7549...
 * - Mã HTML TikTok (blockquote): thuộc tính `data-video-id` hoặc `cite=".../video/..."`
 *
 * Link rút gọn vm.tiktok.com: mở trong trình duyệt, copy URL đầy đủ rồi dán.
 */
export function extractTikTokVideoId(input: string): string | null {
  const s = input.trim();
  if (!s) return null;

  const dataVideo = s.match(/data-video-id\s*=\s*["']?(\d{10,22})["']?/i);
  if (dataVideo?.[1]) return dataVideo[1];

  const cite = s.match(
    /cite\s*=\s*["'](https:\/\/www\.tiktok\.com\/[^"']*\/video\/\d{10,22})["']/i
  );
  if (cite?.[1]) {
    const id = cite[1].match(/\/video\/(\d{10,22})$/);
    if (id?.[1]) return id[1];
  }

  if (/^\d{15,22}$/.test(s)) return s;

  const embed = s.match(/tiktok\.com\/embed\/v\d+\/(\d+)/i);
  if (embed?.[1]) return embed[1];

  const playerV1 = s.match(/tiktok\.com\/player\/v1\/(\d{10,22})/i);
  if (playerV1?.[1]) return playerV1[1];

  const video = s.match(/\/video\/(\d{10,22})/);
  if (video?.[1]) return video[1];

  return null;
}

/** URL dùng cho thuộc tính `cite` của blockquote (nếu tách được từ HTML / URL đầy đủ). */
export function extractTikTokCiteUrl(input: string): string | null {
  const s = input.trim();
  const cite = s.match(
    /cite\s*=\s*["'](https:\/\/www\.tiktok\.com\/@[^"']+\/video\/\d{10,22})["']/i
  );
  if (cite?.[1]) return cite[1];
  const m = s.match(/^(https:\/\/www\.tiktok\.com\/@[^/\s]+\/video\/\d{10,22})/);
  if (m?.[1]) return m[1];
  return null;
}

/**
 * URL iframe player chính thức (TikTok Embed Player).
 * Dùng `player/v1/{id}` thay cho `embed/v2` — v2 hay lỗi / trả JSON, player v1 có UI giống trọ mới (timeline, âm lượng, fullscreen).
 * @see https://developers.tiktok.com/doc/embed-player
 */
export function buildTikTokPlayerIframeSrc(
  videoId: string,
  opts?: { autoplay?: boolean }
): string {
  const autoplay = opts?.autoplay !== false ? "1" : "0";
  const q = new URLSearchParams({
    controls: "1",
    progress_bar: "1",
    volume_control: "1",
    fullscreen_button: "1",
    timestamp: "1",
    play_button: "1",
    description: "1",
    music_info: "1",
    autoplay,
  });
  return `https://www.tiktok.com/player/v1/${videoId}?${q.toString()}`;
}

/** @deprecated alias — dùng buildTikTokPlayerIframeSrc */
export function buildTikTokEmbedSrc(videoId: string): string {
  return buildTikTokPlayerIframeSrc(videoId);
}

