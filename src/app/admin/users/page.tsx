"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getCurrentUser } from "@/lib/supabaseServices";
import EditRoleModal from "@/components/admin/EditRoleModal";

const AdminUsersPage = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "renter" | "owner" | "admin">("all");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentUserLoading, setCurrentUserLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 200;
  const [editRoleModal, setEditRoleModal] = useState<{
    isOpen: boolean;
    user: any | null;
  }>({ isOpen: false, user: null });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    // Reset paging when filter changes
    setPage(0);
    setUsers([]);
    setHasMore(true);
    loadUsers(0, true);
    loadCurrentUser();
  }, [filter]);

  const loadCurrentUser = async () => {
    try {
      setCurrentUserLoading(true);
      const { user } = await getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error("Error loading current user:", error);
    } finally {
      setCurrentUserLoading(false);
    }
  };

  const loadUsers = async (nextPage: number, replace: boolean = false) => {
    setLoading(true);
    try {
      let query = supabase.from("profiles").select("*").order("created_at", { ascending: false });

      if (filter !== "all") {
        query = query.eq("role", filter);
      }

      const from = nextPage * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      // Supabase has an implicit max rows per request (often 1000). Use range() paging to fetch all users.
      const { data, error } = await query.range(from, to);
      if (error) throw error;

      const rows = data || [];
      setUsers((prev) => (replace ? rows : [...prev, ...rows]));
      setPage(nextPage);
      setHasMore(rows.length === PAGE_SIZE);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "owner":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "renter":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Quản trị viên";
      case "owner":
        return "Chủ trọ";
      case "renter":
        return "Người thuê";
      default:
        return role;
    }
  };

  const handleEditRole = (user: any) => {
    setEditRoleModal({ isOpen: true, user });
  };

  const handleEditRoleSuccess = () => {
    setSuccessMessage("Cập nhật role thành công!");
    loadUsers(0, true); // Reload users list
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const canEditRole = (user: any) => {
    // Only admin can edit roles and can't edit their own role
    return currentUser?.role === 'admin' && currentUser?.id !== user.id;
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Quản lý người dùng
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Xem và quản lý tất cả người dùng trong hệ thống
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === "all"
              ? "bg-blue-500 text-white"
              : "bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
          }`}
        >
          Tất cả
        </button>
        <button
          onClick={() => setFilter("renter")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === "renter"
              ? "bg-blue-500 text-white"
              : "bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
          }`}
        >
          Người thuê
        </button>
        <button
          onClick={() => setFilter("owner")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === "owner"
              ? "bg-blue-500 text-white"
              : "bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
          }`}
        >
          Chủ trọ
        </button>
        <button
          onClick={() => setFilter("admin")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === "admin"
              ? "bg-blue-500 text-white"
              : "bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
          }`}
        >
          Quản trị viên
        </button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-green-600 dark:text-green-400 text-sm">{successMessage}</p>
        </div>
      )}

      {/* Users List */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
            Đang tải...
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
            Chưa có người dùng nào
          </div>
        ) : (
          <>
            <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="p-6 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {user.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-neutral-900 dark:text-neutral-100 mb-1">
                        {user.name || "Chưa có tên"}
                      </div>
                      <div className="text-sm text-neutral-500 dark:text-neutral-400">
                        {user.email || user.id}
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(
                            user.role
                          )}`}
                        >
                          {getRoleLabel(user.role)}
                        </span>
                        {user.phone && (
                          <span className="text-xs text-neutral-500 dark:text-neutral-400">
                            📞 {user.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {!currentUserLoading && canEditRole(user) && (
                      <button
                        onClick={() => handleEditRole(user)}
                        className="px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                      >
                        Đổi Role
                      </button>
                    )}
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">
                      {new Date(user.created_at).toLocaleDateString("vi-VN")}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load more */}
            <div className="p-4 flex items-center justify-between">
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                Đang hiển thị {users.length} người dùng
                {hasMore ? " (còn nữa)" : ""}
              </div>
              {hasMore ? (
                <button
                  onClick={() => loadUsers(page + 1, false)}
                  disabled={loading}
                  className="px-4 py-2 text-sm rounded-lg bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-600 disabled:opacity-50"
                >
                  {loading ? "Đang tải..." : "Tải thêm"}
                </button>
              ) : (
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  Đã tải hết
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Edit Role Modal */}
      <EditRoleModal
        isOpen={editRoleModal.isOpen}
        onClose={() => setEditRoleModal({ isOpen: false, user: null })}
        onSuccess={handleEditRoleSuccess}
        user={editRoleModal.user}
      />
    </div>
  );
};

export default AdminUsersPage;


