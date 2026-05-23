"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import AdminCreateRoomForm from "../AdminCreateRoomForm";
import AdminEditRoomForm from "../AdminEditRoomForm";
import AdminManageHotRooms from "../AdminManageHotRooms";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  ArrowPathIcon,
  BuildingOfficeIcon,
  PencilSquareIcon,
  EyeIcon,
  FireIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

const AdminRoomsPage = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showHotManager, setShowHotManager] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<any[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "available" | "rented" | "hot">("all");
  const [togglingHotId, setTogglingHotId] = useState<string | null>(null);

  useEffect(() => {
    loadRooms();
  }, [filter]);

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = rooms.filter(
        (r) =>
          r.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRooms(filtered);
    } else {
      setFilteredRooms(rooms);
    }
  }, [searchTerm, rooms]);

  const loadRooms = async () => {
    setLoadingRooms(true);
    let query = supabase
      .from("rooms")
      .select("id, title, address, status, price, area, created_at, is_hot, banner, owner_id")
      .order("created_at", { ascending: false });

    if (filter === "available") {
      query = query.eq("status", "available");
    } else if (filter === "rented") {
      query = query.in("status", ["rented", "occupied", "reserved"]);
    } else if (filter === "hot") {
      query = query.eq("is_hot", true);
    }

    const { data, error } = await query;
    if (!error) {
      setRooms(data || []);
      setFilteredRooms(data || []);
    }
    setLoadingRooms(false);
  };

  const toggleHot = async (roomId: string, currentValue: boolean) => {
    setTogglingHotId(roomId);
    setRooms((prev) =>
      prev.map((r) => (r.id === roomId ? { ...r, is_hot: !currentValue } : r))
    );
    const { error } = await supabase
      .from("rooms")
      .update({ is_hot: !currentValue })
      .eq("id", roomId);
    if (error) {
      setRooms((prev) =>
        prev.map((r) => (r.id === roomId ? { ...r, is_hot: currentValue } : r))
      );
      alert("Không thể cập nhật trạng thái HOT: " + error.message);
    } else if (filter === "hot" && currentValue) {
      setRooms((prev) => prev.filter((r) => r.id !== roomId));
    }
    setTogglingHotId(null);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "available": return { text: "Còn trống", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" };
      case "reserved": return { text: "Đặt trước", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" };
      case "rented": case "occupied": return { text: "Đã thuê", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" };
      case "hidden": return { text: "Ẩn", color: "bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300" };
      default: return { text: status, color: "bg-neutral-100 text-neutral-700" };
    }
  };

  if (loadingRooms) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Quản lý Phòng trọ</h1>
          <p className="text-sm text-neutral-500 mt-1">Quản lý tất cả phòng trọ trên hệ thống</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowHotManager(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <FireIcon className="w-5 h-5" />
            Quản lý HOT
          </button>
          <Link
            href="/admin/rooms/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <PlusIcon className="w-5 h-5" />
            Thêm phòng mới
          </Link>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Tìm kiếm phòng trọ..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {(["all", "available", "rented", "hot"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? f === "hot" ? "bg-red-500 text-white" : "bg-blue-500 text-white"
                  : "bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700"
              }`}
            >
              {f === "all" ? "Tất cả" : f === "available" ? "Còn trống" : f === "rented" ? "Đã thuê" : "🔥 HOT"}
            </button>
          ))}
          <button
            onClick={loadRooms}
            className="p-2 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            <ArrowPathIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <BuildingOfficeIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Tổng phòng</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">{rooms.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <BuildingOfficeIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Còn trống</p>
              <p className="text-2xl font-bold text-green-600">{rooms.filter((r) => r.status === "available").length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <BuildingOfficeIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Đã thuê</p>
              <p className="text-2xl font-bold text-orange-600">{rooms.filter((r) => r.status === "rented" || r.status === "occupied").length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <FireIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Đang HOT</p>
              <p className="text-2xl font-bold text-red-600">{rooms.filter((r) => r.is_hot).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Rooms Grid */}
      {filteredRooms.length === 0 ? (
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-12 text-center">
          <BuildingOfficeIcon className="w-16 h-16 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
            {searchTerm ? "Không tìm thấy phòng trọ" : "Chưa có phòng trọ nào"}
          </h3>
          <p className="text-neutral-500 mb-6">
            {searchTerm ? "Thử tìm kiếm với từ khóa khác" : "Nhấn \"Thêm phòng mới\" để bắt đầu"}
          </p>
          {!searchTerm && (
            <Link
              href="/admin/rooms/new"
              className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              Thêm phòng mới
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => {
            const status = getStatusLabel(room.status);
            return (
              <div
                key={room.id}
                className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Room Image */}
                <div className="relative h-48 bg-neutral-200 dark:bg-neutral-700">
                  <img
                    src={room.banner || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop"}
                    alt={room.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                      {status.text}
                    </span>
                    {room.is_hot && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                        🔥 HOT
                      </span>
                    )}
                  </div>
                </div>

                {/* Room Info */}
                <div className="p-4">
                  <h3 className="font-bold text-lg text-neutral-900 dark:text-white mb-2 line-clamp-1">
                    {room.title}
                  </h3>
                  <p className="text-sm text-neutral-500 mb-3 line-clamp-2 flex items-start gap-1">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {room.address || "Chưa có địa chỉ"}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-neutral-500">Giá thuê</p>
                      <p className="text-lg font-bold text-blue-600">
                        {room.price ? `${Number(room.price).toLocaleString("vi-VN")}đ` : "N/A"}
                      </p>
                    </div>
                    {room.area && (
                      <div className="text-right">
                        <p className="text-xs text-neutral-500">Diện tích</p>
                        <p className="text-sm font-semibold text-neutral-900 dark:text-white">{room.area}m²</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/rooms/${room.id}`}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg text-sm font-medium hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
                    >
                      <EyeIcon className="w-4 h-4" />
                      Xem
                    </Link>
                    <Link
                      href={`/admin/rooms/${room.id}/edit`}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                    >
                      <PencilSquareIcon className="w-4 h-4" />
                      Sửa
                    </Link>
                    <button
                      disabled={togglingHotId === room.id}
                      onClick={() => toggleHot(room.id, !!room.is_hot)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                        room.is_hot
                          ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50"
                          : "bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600"
                      }`}
                    >
                      <FireIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <AdminCreateRoomForm
        show={showCreateForm}
        onHide={() => setShowCreateForm(false)}
        onCreated={() => {
          setShowCreateForm(false);
          loadRooms();
        }}
      />
      <AdminEditRoomForm
        show={showEditForm}
        onHide={() => setShowEditForm(false)}
        roomId={editingRoomId}
        onUpdated={() => {
          setShowEditForm(false);
          loadRooms();
        }}
      />
      <AdminManageHotRooms
        show={showHotManager}
        onHide={() => setShowHotManager(false)}
        onSaved={loadRooms}
      />
    </div>
  );
};

export default AdminRoomsPage;

