"use client";

import React, { Fragment, useEffect, useMemo, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { PlayCircleIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { MapPinIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import StartRating from "@/components/StartRating";
import {
  fetchRoomVideoReviewsForPublicPage,
  RoomVideoReviewListing,
} from "@/lib/supabaseServices";
import { buildRoomDetailHref } from "@/utils/roomDetailUrl";
import { buildTikTokPlayerIframeSrc, extractTikTokVideoId } from "@/utils/tiktokEmbed";

export default function VideoReviewPage() {
  const [items, setItems] = useState<RoomVideoReviewListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [cityFilter, setCityFilter] = useState<string>("");
  const [active, setActive] = useState<RoomVideoReviewListing | null>(null);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(null);
      const { items: rows, error } = await fetchRoomVideoReviewsForPublicPage();
      if (cancelled) return;
      if (error) setLoadError(error);
      setItems(rows);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const cities = useMemo(() => {
    const set = new Set<string>();
    for (const it of items) {
      const c = (it.room.city || "").trim();
      if (c) set.add(c);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "vi"));
  }, [items]);

  const filtered = useMemo(() => {
    if (!cityFilter) return items;
    return items.filter(
      (it) => (it.room.city || "").trim() === cityFilter
    );
  }, [items, cityFilter]);

  const openModal = (it: RoomVideoReviewListing) => {
    const id = extractTikTokVideoId(it.source_url);
    setActiveVideoId(id);
    setActive(it);
  };

  const closeModal = () => {
    setActive(null);
    setActiveVideoId(null);
  };

  const locationLabel = (it: RoomVideoReviewListing) => {
    const d = (it.room.district || "").trim();
    const c = (it.room.city || "").trim();
    if (d && c) return `${d}, ${c}`;
    return c || d || "Khu vực đang cập nhật";
  };

  return (
    <div className="nc-VideoReviewPage container pb-24 pt-8 lg:pt-12">
      <div className="max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-semibold text-neutral-900 dark:text-neutral-100">
          Video review phòng trọ tại YoungHouse Hòa Lạc
        </h1>
        <p className="mt-3 text-neutral-600 dark:text-neutral-400 leading-relaxed">
          Khám phá các video trải nghiệm thực tế từ TikTok — mỗi video gắn với một phòng
          cụ thể để bạn mở xem chi tiết và liên hệ khi phù hợp.
        </p>
      </div>

     

      {loading && (
        <p className="mt-10 text-neutral-500">Đang tải video…</p>
      )}

      {!loading && loadError && (
        <div className="mt-10 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100">
          {loadError}
          <span className="block mt-2 text-xs opacity-90">
            Nếu bạn là quản trị viên, hãy chạy migration{" "}
            <code className="rounded bg-black/5 px-1">database-migrations/room_video_reviews_table.sql</code>{" "}
            trên Supabase rồi thêm link TikTok trong màn sửa phòng (Admin).
          </span>
        </div>
      )}

      {!loading && !loadError && filtered.length === 0 && (
        <p className="mt-10 text-neutral-500">
          Chưa có video review nào. Thêm link TikTok khi sửa phòng trong trang quản trị.
        </p>
      )}

      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
        {filtered.map((it) => {
          const vid = extractTikTokVideoId(it.source_url);
          const title =
            (it.display_title || "").trim() || it.room.title || "Video review";
          return (
            <div
              key={it.id}
              className="flex flex-col rounded-2xl overflow-hidden border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm hover:shadow-xl transition-shadow"
            >
              <button
                type="button"
                onClick={() => openModal(it)}
                aria-label="Xem video TikTok"
                className="group relative aspect-[9/16] w-full shrink-0 cursor-pointer bg-neutral-800 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-neutral-900"
              >
                {it.room.banner ? (
                  <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-300 group-hover:scale-[1.03]"
                    style={{ backgroundImage: `url(${it.room.banner})` }}
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-b from-neutral-700 to-neutral-900" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-2.5 pointer-events-none">
                  <p className="text-[11px] leading-tight font-semibold uppercase tracking-wide text-white line-clamp-3 drop-shadow">
                    {title}
                  </p>
                </div>
                <PlayCircleIcon className="pointer-events-none absolute bottom-2 left-2 w-9 h-9 text-white/95 drop-shadow-md opacity-90 group-hover:opacity-100" />
                {!vid && (
                  <span className="absolute top-2 right-2 rounded bg-amber-500 px-1.5 py-0.5 text-[10px] font-medium text-black pointer-events-none">
                    Sai link
                  </span>
                )}
              </button>
              <Link
                href={buildRoomDetailHref(it.room.title, it.room.id)}
                className="block flex flex-col flex-1 min-h-0 px-3 pt-2.5 pb-3 text-left no-underline hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500"
              >
                <div className="flex items-start gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                  <MapPinIcon className="w-4 h-4 shrink-0 mt-0.5" aria-hidden />
                  <span className="line-clamp-1">{locationLabel(it)}</span>
                </div>
                <h3 className="mt-1.5 font-semibold text-neutral-900 dark:text-white text-sm leading-snug line-clamp-2 capitalize">
                  {it.room.title}
                </h3>
                <div className="mt-1.5 flex items-start gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                  <MapPinIcon className="w-4 h-4 shrink-0 mt-0.5 opacity-80" aria-hidden />
                  <span className="line-clamp-2">
                    {it.room.addressDisplay || "Đang cập nhật địa chỉ"}
                  </span>
                </div>
                <div className="mt-2 w-12 border-b border-neutral-100 dark:border-neutral-800" />
                <div className="mt-2 flex justify-between items-end gap-2">
                  <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                    {it.room.priceLabel}
                    <span className="text-xs font-normal text-neutral-500 dark:text-neutral-400">
                      {" "}
                      /tháng
                    </span>
                  </span>
                  {it.room.reviewStart > 0 && (
                    <StartRating
                      point={it.room.reviewStart}
                      reviewCount={it.room.reviewCount}
                      className="shrink-0 scale-95 origin-right"
                    />
                  )}
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      <Transition appear show={!!active} as={Fragment}>
        <Dialog as="div" className="relative z-[100]" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/60" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto p-4 flex items-center justify-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg rounded-2xl bg-white dark:bg-neutral-900 shadow-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
                  <Dialog.Title className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 pr-2 line-clamp-2">
                    {active?.display_title?.trim() || active?.room.title}
                  </Dialog.Title>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="shrink-0 rounded-full p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    aria-label="Đóng"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <div className="p-3 bg-neutral-100 dark:bg-black flex justify-center">
                  {activeVideoId ? (
                    <div
                      className="relative mx-auto w-full max-w-[420px] overflow-hidden rounded-lg bg-black shadow-lg h-[min(72vh,640px)] min-h-[360px]"
                    >
                      <iframe
                        key={`${activeVideoId}-${active?.id ?? ""}`}
                        title="TikTok video"
                        src={buildTikTokPlayerIframeSrc(activeVideoId)}
                        className="block h-full w-full min-h-[360px] border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                        allowFullScreen
                        loading="eager"
                        referrerPolicy="strict-origin-when-cross-origin"
                      />
                    </div>
                  ) : (
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 px-2 py-6 text-center">
                      Không đọc được ID video từ link. Vui lòng dán URL dạng{" "}
                      <span className="font-mono text-xs">.../video/123...</span>
                    </p>
                  )}
                </div>

                {active && (
                  <div className="px-4 py-3 flex flex-wrap gap-2 border-t border-neutral-200 dark:border-neutral-800">
                    <Link
                      href={buildRoomDetailHref(active.room.title, active.room.id)}
                      className="inline-flex items-center justify-center rounded-full bg-primary-6000 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
                    >
                      Xem phòng
                    </Link>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="inline-flex items-center justify-center rounded-full border border-neutral-300 dark:border-neutral-600 px-4 py-2 text-sm font-medium text-neutral-800 dark:text-neutral-200"
                    >
                      Đóng
                    </button>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}



