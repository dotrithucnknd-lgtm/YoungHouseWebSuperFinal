"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  UserPlusIcon,
  XMarkIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/contexts/AuthContext";
import * as XLSX from "xlsx";
import { sortByTitle } from "@/utils/sortProperties";

interface RoomAccount {
  id: string;
  name: string;
  status: "available" | "rented" | "maintenance";
  room_id: string;
  property_title: string;
  property_address: string;
  current_renter_id: string | null;
  tenant_name: string | null;
  tenant_phone: string | null;
  email: string | null;
  username: string | null;
  has_account: boolean;
}

interface ResetModal {
  open: boolean;
  account: RoomAccount | null;
  newPassword: string;
  loading: boolean;
  result: string | null;
}

interface CreateModal {
  open: boolean;
  unit: RoomAccount | null;
  loading: boolean;
  result: { username: string; email: string; password: string } | null;
}

const DEFAULT_PASSWORD = "YoungHouse2026";

const EXCEL_COLUMNS = [
  { wch: 5 },
  { wch: 10 },
  { wch: 22 },
  { wch: 30 },
  { wch: 22 },
  { wch: 16 },
  { wch: 30 },
  { wch: 18 },
  { wch: 18 },
  { wch: 14 },
  { wch: 12 },
];

function sanitizeFileName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40) || "NhaTro";
}

function getDateStr() {
  const now = new Date();
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
}

function buildExcelRows(data: RoomAccount[]) {
  return data.map((a, idx) => ({
    STT: idx + 1,
    "Phòng": a.name,
    "Nhà trọ": a.property_title,
    "Địa chỉ": a.property_address,
    "Người thuê": a.tenant_name ?? "",
    "SĐT người thuê": a.tenant_phone ?? "",
    "Email đăng nhập": a.email ?? "",
    "Tên đăng nhập": a.username ?? "",
    "Mật khẩu": a.has_account ? DEFAULT_PASSWORD : "",
    "Trạng thái phòng":
      a.status === "rented" ? "Đang thuê" : a.status === "available" ? "Đang trống" : "Bảo trì",
    "Có tài khoản": a.has_account ? "Có" : "Chưa",
  }));
}

function writeExcelFile(rows: ReturnType<typeof buildExcelRows>, sheetName: string, fileName: string) {
  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = EXCEL_COLUMNS;
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));
  XLSX.writeFile(wb, fileName);
}

function exportAccountsToExcel(data: RoomAccount[], fileName: string, sheetName = "Tài khoản phòng") {
  if (data.length === 0) return false;
  writeExcelFile(buildExcelRows(data), sheetName, fileName);
  return true;
}

function exportAccountsByProperties(
  propertyList: { id: string; title: string }[],
  accounts: RoomAccount[],
  fileName: string
) {
  const wb = XLSX.utils.book_new();
  let hasData = false;

  propertyList.forEach((property) => {
    const propertyAccounts = accounts.filter((a) => a.room_id === property.id);
    if (propertyAccounts.length === 0) return;

    hasData = true;
    const rows = buildExcelRows(propertyAccounts);
    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = EXCEL_COLUMNS;
    XLSX.utils.book_append_sheet(wb, ws, property.title.slice(0, 31));
  });

  if (!hasData) return false;
  XLSX.writeFile(wb, fileName);
  return true;
}

export default function AccountsPage() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<RoomAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterProperty, setFilterProperty] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [revealedPasswords, setRevealedPasswords] = useState<Set<string>>(new Set());
  const [copiedFields, setCopiedFields] = useState<Record<string, boolean>>({});

  const [resetModal, setResetModal] = useState<ResetModal>({
    open: false,
    account: null,
    newPassword: "",
    loading: false,
    result: null,
  });

  const [createModal, setCreateModal] = useState<CreateModal>({
    open: false,
    unit: null,
    loading: false,
    result: null,
  });

  const [exportModal, setExportModal] = useState({
    open: false,
    propertyId: "all",
  });

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/rooms/accounts");
      const json = await res.json();
      if (json.success) setAccounts(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.id) loadAccounts();
  }, [user, loadAccounts]);

  // Derived data
  const properties = sortByTitle(
    Array.from(
      new Map(accounts.map((a) => [a.room_id, a.property_title])).entries()
    ).map(([id, title]) => ({ id, title }))
  );

  const filtered = accounts.filter((a) => {
    const matchSearch =
      !searchTerm ||
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.tenant_name ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.username ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.email ?? "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchProperty = filterProperty === "all" || a.room_id === filterProperty;

    const matchStatus =
      filterStatus === "all" ||
      (filterStatus === "has_account" && a.has_account) ||
      (filterStatus === "no_account" && !a.has_account) ||
      (filterStatus === "rented" && a.status === "rented") ||
      (filterStatus === "available" && a.status === "available");

    return matchSearch && matchProperty && matchStatus;
  });

  const stats = {
    total: accounts.length,
    has_account: accounts.filter((a) => a.has_account).length,
    no_account: accounts.filter((a) => !a.has_account).length,
  };

  // Utility helpers
  const copyToClipboard = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedFields((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => setCopiedFields((prev) => ({ ...prev, [key]: false })), 2000);
  };

  const togglePassword = (id: string) => {
    setRevealedPasswords((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const openExportModal = () => {
    setExportModal({
      open: true,
      propertyId: filterProperty !== "all" ? filterProperty : properties[0]?.id ?? "all",
    });
  };

  const exportFilteredToExcel = () => {
    const dateStr = getDateStr();
    const ok = exportAccountsToExcel(filtered, `TaiKhoanPhong_${dateStr}.xlsx`);
    if (!ok) alert("Không có dữ liệu để xuất.");
  };

  const handleExportByProperty = () => {
    const dateStr = getDateStr();
    const { propertyId } = exportModal;

    if (propertyId === "all") {
      const ok = exportAccountsByProperties(
        properties,
        accounts,
        `TaiKhoanPhong_TatCaNhaTro_${dateStr}.xlsx`
      );
      if (!ok) {
        alert("Không có dữ liệu để xuất.");
        return;
      }
    } else {
      const property = properties.find((p) => p.id === propertyId);
      const propertyAccounts = accounts.filter((a) => a.room_id === propertyId);
      if (!property || propertyAccounts.length === 0) {
        alert("Nhà trọ này chưa có phòng để xuất.");
        return;
      }

      const ok = exportAccountsToExcel(
        propertyAccounts,
        `TaiKhoanPhong_${sanitizeFileName(property.title)}_${dateStr}.xlsx`,
        property.title.slice(0, 31)
      );
      if (!ok) {
        alert("Không có dữ liệu để xuất.");
        return;
      }
    }

    setExportModal((p) => ({ ...p, open: false }));
  };

  // Reset password
  const openResetModal = (account: RoomAccount) => {
    setResetModal({ open: true, account, newPassword: "", loading: false, result: null });
  };

  const handleResetPassword = async () => {
    if (!resetModal.account?.current_renter_id) return;
    setResetModal((p) => ({ ...p, loading: true, result: null }));
    try {
      const res = await fetch("/api/rooms/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reset-password",
          userId: resetModal.account.current_renter_id,
          newPassword: resetModal.newPassword || DEFAULT_PASSWORD,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setResetModal((p) => ({ ...p, loading: false, result: json.password }));
      } else {
        alert("Lỗi: " + (json.error ?? "Không thể đặt lại mật khẩu"));
        setResetModal((p) => ({ ...p, loading: false }));
      }
    } catch (e: any) {
      alert("Lỗi kết nối: " + e.message);
      setResetModal((p) => ({ ...p, loading: false }));
    }
  };

  // Create account
  const openCreateModal = (unit: RoomAccount) => {
    setCreateModal({ open: true, unit, loading: false, result: null });
  };

  const handleCreateAccount = async () => {
    if (!createModal.unit) return;
    setCreateModal((p) => ({ ...p, loading: true }));
    try {
      const res = await fetch("/api/rooms/create-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomUnitId: createModal.unit.id,
          roomName: createModal.unit.name,
          houseTitle: createModal.unit.property_title,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setCreateModal((p) => ({
          ...p,
          loading: false,
          result: { username: json.username, email: json.email, password: json.password },
        }));
        loadAccounts();
      } else {
        alert("Lỗi: " + (json.error ?? "Không thể tạo tài khoản"));
        setCreateModal((p) => ({ ...p, loading: false }));
      }
    } catch (e: any) {
      alert("Lỗi kết nối: " + e.message);
      setCreateModal((p) => ({ ...p, loading: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Tổng số phòng", value: stats.total, color: "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300" },
          { label: "Đã có tài khoản", value: stats.has_account, color: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300" },
          { label: "Chưa có tài khoản", value: stats.no_account, color: "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl p-4 ${s.color} border border-current/10`}>
            <p className="text-sm font-medium opacity-80">{s.label}</p>
            <p className="text-3xl font-bold mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Tìm theo tên phòng, tenant, tài khoản..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm focus:ring-2 focus:ring-primary-500"
          value={filterProperty}
          onChange={(e) => setFilterProperty(e.target.value)}
        >
          <option value="all">Tất cả nhà trọ</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>

        <select
          className="px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm focus:ring-2 focus:ring-primary-500"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="has_account">Đã có tài khoản</option>
          <option value="no_account">Chưa có tài khoản</option>
          <option value="rented">Đang thuê</option>
          <option value="available">Đang trống</option>
        </select>

        <button
          onClick={loadAccounts}
          className="p-2 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          title="Tải lại"
        >
          <ArrowPathIcon className="w-5 h-5" />
        </button>

        <button
          onClick={exportFilteredToExcel}
          disabled={filtered.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed text-neutral-700 dark:text-neutral-200 rounded-lg text-sm font-semibold transition-colors border border-neutral-200 dark:border-neutral-700"
          title="Xuất theo bộ lọc hiện tại"
        >
          <ArrowDownTrayIcon className="w-4 h-4" />
          Xuất bộ lọc
        </button>

        <button
          onClick={openExportModal}
          disabled={properties.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
          title="Xuất file Excel theo nhà trọ"
        >
          <ArrowDownTrayIcon className="w-4 h-4" />
          Xuất theo nhà trọ
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
                <th className="px-4 py-3 text-left font-semibold text-neutral-600 dark:text-neutral-300">Phòng</th>
                <th className="px-4 py-3 text-left font-semibold text-neutral-600 dark:text-neutral-300">Nhà trọ</th>
                <th className="px-4 py-3 text-left font-semibold text-neutral-600 dark:text-neutral-300">Người thuê</th>
                <th className="px-4 py-3 text-left font-semibold text-neutral-600 dark:text-neutral-300">Tài khoản (email)</th>
                <th className="px-4 py-3 text-left font-semibold text-neutral-600 dark:text-neutral-300">Mật khẩu</th>
                <th className="px-4 py-3 text-center font-semibold text-neutral-600 dark:text-neutral-300">Trạng thái</th>
                <th className="px-4 py-3 text-center font-semibold text-neutral-600 dark:text-neutral-300">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-neutral-400">
                    Không tìm thấy kết quả nào.
                  </td>
                </tr>
              ) : (
                filtered.map((account) => {
                  const passwordRevealed = revealedPasswords.has(account.id);
                  const displayPassword = DEFAULT_PASSWORD;

                  return (
                    <tr
                      key={account.id}
                      className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                    >
                      {/* Room */}
                      <td className="px-4 py-3">
                        <span className="font-bold text-neutral-900 dark:text-white">{account.name}</span>
                      </td>

                      {/* Property */}
                      <td className="px-4 py-3">
                        <div className="text-neutral-700 dark:text-neutral-300 font-medium text-xs leading-tight">
                          {account.property_title}
                        </div>
                        <div className="text-neutral-400 text-[11px] truncate max-w-[150px]">
                          {account.property_address}
                        </div>
                      </td>

                      {/* Tenant */}
                      <td className="px-4 py-3">
                        {account.tenant_name ? (
                          <div>
                            <p className="text-neutral-800 dark:text-neutral-200 font-medium">{account.tenant_name}</p>
                            {account.tenant_phone && (
                              <p className="text-neutral-400 text-[11px]">{account.tenant_phone}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-neutral-300 dark:text-neutral-600 text-xs italic">—</span>
                        )}
                      </td>

                      {/* Email/username */}
                      <td className="px-4 py-3">
                        {account.email ? (
                          <div className="flex items-center gap-1.5">
                            <code className="text-xs bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded font-mono text-neutral-800 dark:text-neutral-200 max-w-[160px] truncate">
                              {account.email}
                            </code>
                            <button
                              onClick={() => copyToClipboard(account.email!, `email-${account.id}`)}
                              className="text-neutral-400 hover:text-primary-600 transition-colors flex-shrink-0"
                              title="Sao chép email"
                            >
                              {copiedFields[`email-${account.id}`] ? (
                                <CheckIcon className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <ClipboardDocumentIcon className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-neutral-300 dark:text-neutral-600 text-xs italic">Chưa có</span>
                        )}
                      </td>

                      {/* Password */}
                      <td className="px-4 py-3">
                        {account.has_account ? (
                          <div className="flex items-center gap-1.5">
                            <code className="text-xs bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded font-mono text-neutral-800 dark:text-neutral-200">
                              {passwordRevealed ? displayPassword : "••••••••••"}
                            </code>
                            <button
                              onClick={() => togglePassword(account.id)}
                              className="text-neutral-400 hover:text-primary-600 transition-colors flex-shrink-0"
                              title={passwordRevealed ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                            >
                              {passwordRevealed ? (
                                <EyeSlashIcon className="w-3.5 h-3.5" />
                              ) : (
                                <EyeIcon className="w-3.5 h-3.5" />
                              )}
                            </button>
                            {passwordRevealed && (
                              <button
                                onClick={() => copyToClipboard(displayPassword, `pw-${account.id}`)}
                                className="text-neutral-400 hover:text-primary-600 transition-colors flex-shrink-0"
                                title="Sao chép mật khẩu"
                              >
                                {copiedFields[`pw-${account.id}`] ? (
                                  <CheckIcon className="w-3.5 h-3.5 text-emerald-500" />
                                ) : (
                                  <ClipboardDocumentIcon className="w-3.5 h-3.5" />
                                )}
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-neutral-300 dark:text-neutral-600 text-xs italic">—</span>
                        )}
                      </td>

                      {/* Status badge */}
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            account.status === "rented"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                              : account.status === "available"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                          }`}
                        >
                          {account.status === "rented"
                            ? "Đang thuê"
                            : account.status === "available"
                            ? "Đang trống"
                            : "Bảo trì"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          {account.has_account ? (
                            <button
                              onClick={() => openResetModal(account)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 rounded-lg text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors border border-indigo-200/50 dark:border-indigo-700/30"
                              title="Đặt lại mật khẩu"
                            >
                              <KeyIcon className="w-3.5 h-3.5" />
                              Đặt lại MK
                            </button>
                          ) : (
                            <button
                              onClick={() => openCreateModal(account)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors border border-emerald-200/50 dark:border-emerald-700/30"
                              title="Tạo tài khoản phòng"
                            >
                              <UserPlusIcon className="w-3.5 h-3.5" />
                              Tạo tài khoản
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-neutral-100 dark:border-neutral-800 text-xs text-neutral-400">
          Hiển thị {filtered.length} / {accounts.length} phòng
        </div>
      </div>

      {/* ── Reset Password Modal ── */}
      {resetModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <KeyIcon className="w-5 h-5 text-indigo-500" />
                Đặt lại mật khẩu
              </h2>
              <button
                onClick={() => setResetModal((p) => ({ ...p, open: false }))}
                className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Phòng:</span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                  {resetModal.account?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Nhà trọ:</span>
                <span className="font-medium text-neutral-700 dark:text-neutral-300">
                  {resetModal.account?.property_title}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Email:</span>
                <code className="text-xs font-mono text-neutral-700 dark:text-neutral-300">
                  {resetModal.account?.email}
                </code>
              </div>
            </div>

            {resetModal.result ? (
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-700/40 rounded-xl p-4 space-y-3">
                <p className="text-emerald-700 dark:text-emerald-400 font-semibold text-sm">
                  ✅ Đặt lại mật khẩu thành công!
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-white dark:bg-neutral-800 border border-emerald-200 dark:border-emerald-700/40 rounded-lg px-3 py-2 text-sm font-mono text-neutral-900 dark:text-white">
                    {resetModal.result}
                  </code>
                  <button
                    onClick={() => copyToClipboard(resetModal.result!, "reset-pw")}
                    className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 transition-colors"
                  >
                    {copiedFields["reset-pw"] ? (
                      <CheckIcon className="w-4 h-4" />
                    ) : (
                      <ClipboardDocumentIcon className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-emerald-600 dark:text-emerald-500">
                  Hãy thông báo mật khẩu này cho tenant và yêu cầu họ đổi ngay sau khi đăng nhập.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Mật khẩu mới
                  <span className="ml-1 text-neutral-400 font-normal">(để trống = dùng mặc định)</span>
                </label>
                <input
                  type="text"
                  placeholder={`Mặc định: ${DEFAULT_PASSWORD}`}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={resetModal.newPassword}
                  onChange={(e) => setResetModal((p) => ({ ...p, newPassword: e.target.value }))}
                />
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => setResetModal((p) => ({ ...p, open: false }))}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleResetPassword}
                    disabled={resetModal.loading}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold transition-colors"
                  >
                    {resetModal.loading ? "Đang xử lý..." : "Xác nhận đặt lại"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Create Account Modal ── */}
      {createModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <UserPlusIcon className="w-5 h-5 text-emerald-500" />
                Tạo tài khoản phòng
              </h2>
              <button
                onClick={() => setCreateModal((p) => ({ ...p, open: false }))}
                className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Phòng:</span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                  {createModal.unit?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Nhà trọ:</span>
                <span className="font-medium text-neutral-700 dark:text-neutral-300">
                  {createModal.unit?.property_title}
                </span>
              </div>
            </div>

            {createModal.result ? (
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-700/40 rounded-xl p-4 space-y-3">
                <p className="text-emerald-700 dark:text-emerald-400 font-semibold text-sm">
                  ✅ Tạo tài khoản thành công!
                </p>
                {[
                  { label: "Email đăng nhập", value: createModal.result.email, key: "create-email" },
                  { label: "Mật khẩu", value: createModal.result.password, key: "create-pw" },
                ].map((item) => (
                  <div key={item.key}>
                    <p className="text-xs text-neutral-500 mb-1">{item.label}</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-white dark:bg-neutral-800 border border-emerald-200 dark:border-emerald-700/40 rounded-lg px-3 py-2 text-sm font-mono text-neutral-900 dark:text-white">
                        {item.value}
                      </code>
                      <button
                        onClick={() => copyToClipboard(item.value, item.key)}
                        className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 transition-colors"
                      >
                        {copiedFields[item.key] ? (
                          <CheckIcon className="w-4 h-4" />
                        ) : (
                          <ClipboardDocumentIcon className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => setCreateModal((p) => ({ ...p, open: false }))}
                  className="w-full mt-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors"
                >
                  Đóng
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Hệ thống sẽ tự động tạo tài khoản đăng nhập cho phòng này với:
                </p>
                <ul className="text-sm space-y-1.5 text-neutral-600 dark:text-neutral-400 list-disc list-inside">
                  <li>
                    Email:{" "}
                    <code className="text-xs bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded font-mono">
                      {createModal.unit?.name.replace(/[^a-zA-Z0-9]/g, "").toLowerCase()}
                      ...@younghouse.vn
                    </code>
                  </li>
                  <li>
                    Mật khẩu mặc định:{" "}
                    <code className="text-xs bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded font-mono">
                      {DEFAULT_PASSWORD}
                    </code>
                  </li>
                </ul>
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => setCreateModal((p) => ({ ...p, open: false }))}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleCreateAccount}
                    disabled={createModal.loading}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-semibold transition-colors"
                  >
                    {createModal.loading ? "Đang tạo..." : "Tạo tài khoản"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Export by Property Modal ── */}
      {exportModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <ArrowDownTrayIcon className="w-5 h-5 text-emerald-500" />
                Xuất Excel theo nhà trọ
              </h2>
              <button
                onClick={() => setExportModal((p) => ({ ...p, open: false }))}
                className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Chọn nhà trọ cần xuất
              </label>
              <select
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                value={exportModal.propertyId}
                onChange={(e) => setExportModal((p) => ({ ...p, propertyId: e.target.value }))}
              >
                <option value="all">Tất cả nhà trọ (nhiều sheet)</option>
                {properties.map((p) => {
                  const count = accounts.filter((a) => a.room_id === p.id).length;
                  const accountCount = accounts.filter((a) => a.room_id === p.id && a.has_account).length;
                  return (
                    <option key={p.id} value={p.id}>
                      {p.title} ({accountCount}/{count} phòng có TK)
                    </option>
                  );
                })}
              </select>

              <div className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-4 text-sm text-neutral-600 dark:text-neutral-400 space-y-1.5">
                {exportModal.propertyId === "all" ? (
                  <>
                    <p>
                      Xuất <strong>{properties.length}</strong> nhà trọ vào một file Excel.
                    </p>
                    <p>Mỗi nhà trọ sẽ nằm trên một sheet riêng.</p>
                    <p className="text-xs text-neutral-400">
                      Tên file: TaiKhoanPhong_TatCaNhaTro_{getDateStr()}.xlsx
                    </p>
                  </>
                ) : (
                  (() => {
                    const property = properties.find((p) => p.id === exportModal.propertyId);
                    const propertyAccounts = accounts.filter((a) => a.room_id === exportModal.propertyId);
                    const withAccount = propertyAccounts.filter((a) => a.has_account).length;
                    return (
                      <>
                        <p>
                          Nhà trọ: <strong>{property?.title}</strong>
                        </p>
                        <p>
                          Số phòng xuất: <strong>{propertyAccounts.length}</strong> ({withAccount} có tài khoản)
                        </p>
                        <p className="text-xs text-neutral-400">
                          Tên file: TaiKhoanPhong_{sanitizeFileName(property?.title ?? "NhaTro")}_{getDateStr()}.xlsx
                        </p>
                      </>
                    );
                  })()
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setExportModal((p) => ({ ...p, open: false }))}
                className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleExportByProperty}
                className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors"
              >
                Xuất Excel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
