"use client";

import React, { Fragment, useEffect, useMemo, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import ButtonPrimary from "@/shared/ButtonPrimary";
import ButtonSecondary from "@/shared/ButtonSecondary";
import { supabase } from "@/lib/supabaseClient";

interface AdminManageHotRoomsProps {
  show: boolean;
  onHide: () => void;
  onSaved?: () => void;
}

interface RoomRow {
  id: string;
  title: string;
  address: string | null;
  district: string | null;
  ward: string | null;
  price: number | null;
  status: string | null;
  is_hot: boolean;
  banner: string | null;
  created_at: string | null;
}

const MAX_HOT = 8;

const AdminManageHotRooms: React.FC<AdminManageHotRoomsProps> = ({
  show,
  onHide,
  onSaved,
}) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [rooms, setRooms] = useState<RoomRow[]>([]);
  const [initialHotSet, setInitialHotSet] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "hot" | "not_hot">("all");

  useEffect(() => {
    if (!show) return;
    void loadRooms();
  }, [show]);

  const loadRooms = async () => {
    setLoading(true);
    setError("");
    try {
      const { data, error: err } = await supabase
        .from("rooms")
        .select(
          "id, title, address, district, ward, price, status, is_hot, banner, created_at"
        )
        .eq("status", "available")
        .order("is_hot", { ascending: false })
        .order("created_at", { ascending: false });

      if (err) throw err;

      const rows = (data || []) as RoomRow[];
      setRooms(rows);
      const hotIds = new Set(rows.filter((r) => r.is_hot).map((r) => r.id));
      setInitialHotSet(hotIds);
      setSelected(new Set(hotIds));
    } catch (e: any) {
      setError(e.message || "Không tải được danh sách phòng");
    } finally {
      setLoading(false);
    }
  };

  const filteredRooms = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rooms.filter((r) => {
      if (filter === "hot" && !selected.has(r.id)) return false;
      if (filter === "not_hot" && selected.has(r.id)) return false;
      if (!q) return true;
      const haystack = [r.title, r.address, r.district, r.ward]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [rooms, search, filter, selected]);

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearAll = () => setSelected(new Set());

  const isDirty = useMemo(() => {
    if (selected.size !== initialHotSet.size) return true;
    for (const id of selected) if (!initialHotSet.has(id)) return true;
    return false;
  }, [selected, initialHotSet]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const toAdd: string[] = [];
      const toRemove: string[] = [];
      for (const id of selected) {
        if (!initialHotSet.has(id)) toAdd.push(id);
      }
      for (const id of initialHotSet) {
        if (!selected.has(id)) toRemove.push(id);
      }

      if (toAdd.length > 0) {
        const { error: addErr } = await supabase
          .from("rooms")
          .update({ is_hot: true })
          .in("id", toAdd);
        if (addErr) throw addErr;
      }
      if (toRemove.length > 0) {
        const { error: rmErr } = await supabase
          .from("rooms")
          .update({ is_hot: false })
          .in("id", toRemove);
        if (rmErr) throw rmErr;
      }

      setInitialHotSet(new Set(selected));
      setRooms((prev) =>
        prev.map((r) => ({ ...r, is_hot: selected.has(r.id) }))
      );
      onSaved?.();
      onHide();
    } catch (e: any) {
      setError(e.message || "Không thể lưu thay đổi");
    } finally {
      setSaving(false);
    }
  };

  const selectedCount = selected.size;
  const overLimit = selectedCount > MAX_HOT;

  return (
    <Transition appear show={show} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onHide}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-30" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white dark:bg-neutral-800 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-neutral-200 dark:border-neutral-700">
                  <div>
                    <Dialog.Title className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                      🔥 Quản lý phòng HOT trên trang chủ
                    </Dialog.Title>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                      Chọn các phòng bạn muốn ghim lên đầu section "Lựa chọn chỗ ở HOT".
                      Trang chủ sẽ hiển thị tối đa {MAX_HOT} phòng HOT; nếu thiếu sẽ tự bù
                      bằng phòng mới nhất.
                    </p>
                  </div>
                  <button
                    onClick={onHide}
                    className="rounded-full p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 shrink-0"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <div className="px-6 py-4 space-y-3 border-b border-neutral-200 dark:border-neutral-700">
                  {/* Stats + filter */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                          overLimit
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                        }`}
                      >
                        Đã chọn: <strong>{selectedCount}</strong>
                        {overLimit && ` / ${MAX_HOT} (vượt quá)`}
                      </span>
                      {selectedCount > 0 && (
                        <button
                          onClick={clearAll}
                          className="text-xs text-neutral-500 hover:text-red-600 underline"
                        >
                          Bỏ chọn tất cả
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      {(["all", "hot", "not_hot"] as const).map((f) => (
                        <button
                          key={f}
                          onClick={() => setFilter(f)}
                          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                            filter === f
                              ? "bg-neutral-900 dark:bg-neutral-200 text-white dark:text-neutral-900"
                              : "bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200"
                          }`}
                        >
                          {f === "all"
                            ? "Tất cả"
                            : f === "hot"
                            ? "Đang chọn"
                            : "Chưa chọn"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Search */}
                  <div className="relative">
                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Tìm theo tên phòng, địa chỉ, phường/xã..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                {/* List */}
                <div className="max-h-[50vh] overflow-y-auto">
                  {error && (
                    <div className="mx-6 my-3 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}
                  {loading ? (
                    <div className="text-center py-12 text-neutral-500">
                      Đang tải danh sách phòng...
                    </div>
                  ) : filteredRooms.length === 0 ? (
                    <div className="text-center py-12 text-neutral-500">
                      Không có phòng nào phù hợp.
                    </div>
                  ) : (
                    <ul className="divide-y divide-neutral-100 dark:divide-neutral-700">
                      {filteredRooms.map((r) => {
                        const isSelected = selected.has(r.id);
                        return (
                          <li
                            key={r.id}
                            onClick={() => toggleOne(r.id)}
                            className={`flex items-center gap-4 px-6 py-3 cursor-pointer transition-colors ${
                              isSelected
                                ? "bg-red-50/60 dark:bg-red-900/10"
                                : "hover:bg-neutral-50 dark:hover:bg-neutral-700/50"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleOne(r.id)}
                              onClick={(e) => e.stopPropagation()}
                              className="w-4 h-4 rounded accent-red-500"
                            />
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-neutral-200 dark:bg-neutral-700 shrink-0">
                              {r.banner ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={r.banner}
                                  alt={r.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-neutral-400 text-xs">
                                  No img
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-neutral-900 dark:text-neutral-100 truncate">
                                  {r.title}
                                </span>
                                {r.is_hot && (
                                  <span className="shrink-0 text-[10px] font-bold uppercase text-red-600 dark:text-red-400">
                                    🔥 Đang HOT
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                                {[r.ward, r.district, r.address]
                                  .filter(Boolean)
                                  .join(" • ")}
                              </div>
                              <div className="text-xs text-neutral-600 dark:text-neutral-300 mt-0.5">
                                {r.price != null
                                  ? `${Number(r.price).toLocaleString("vi-VN")} đ/tháng`
                                  : "—"}
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/30">
                  <div className="text-xs text-neutral-500">
                    {isDirty
                      ? "Có thay đổi chưa lưu"
                      : "Chưa có thay đổi"}
                  </div>
                  <div className="flex gap-2">
                    <ButtonSecondary onClick={onHide} type="button">
                      Hủy
                    </ButtonSecondary>
                    <ButtonPrimary
                      onClick={handleSave}
                      disabled={saving || loading || !isDirty}
                    >
                      {saving ? "Đang lưu..." : "Lưu thay đổi"}
                    </ButtonPrimary>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default AdminManageHotRooms;

