"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchAllCTVProfiles,
  fetchAllCommissions,
  fetchCTVStats,
  updateCTVStatus,
  updateCTVCommissionRate,
  approveCommission,
  markCommissionPaid,
  rejectCommission,
  formatVND,
  adminAddCTV,
  searchProfiles,
  CTVProfileWithUser,
  CTVCommissionWithDetails,
  CTVStats,
} from "@/lib/ctvServices";

type TabType = "overview" | "ctv-list" | "commissions";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  suspended: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  approved: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  paid: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  confirmed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
};

const statusLabels: Record<string, string> = {
  pending: "Chờ duyệt",
  active: "Hoạt động",
  suspended: "Tạm dừng",
  approved: "Đã duyệt",
  paid: "Đã chi",
  rejected: "Từ chối",
  confirmed: "Đã xác nhận",
};

export default function AdminCTVPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [stats, setStats] = useState<CTVStats | null>(null);
  const [ctvList, setCTVList] = useState<CTVProfileWithUser[]>([]);
  const [commissions, setCommissions] = useState<CTVCommissionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Modal states
  const [showRateModal, setShowRateModal] = useState(false);
  const [selectedCTV, setSelectedCTV] = useState<CTVProfileWithUser | null>(null);
  const [newRate, setNewRate] = useState(10);
  const [rejectNote, setRejectNote] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedCommission, setSelectedCommission] = useState<string | null>(null);

  // Add CTV modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ id: string; name: string; phone: string | null; role: string }[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [addRate, setAddRate] = useState(10);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, ctvRes, commRes] = await Promise.all([
        fetchCTVStats(),
        fetchAllCTVProfiles(),
        fetchAllCommissions(),
      ]);
      if (statsRes.data) setStats(statsRes.data);
      setCTVList(ctvRes.data);
      setCommissions(commRes.data);
    } catch (err) {
      console.error("Error loading CTV data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (ctvId: string, status: "active" | "suspended") => {
    setActionLoading(ctvId);
    const { error } = await updateCTVStatus(ctvId, status);
    if (error) alert("Lỗi: " + error);
    else await loadData();
    setActionLoading(null);
  };

  const handleUpdateRate = async () => {
    if (!selectedCTV) return;
    setActionLoading(selectedCTV.id);
    const { error } = await updateCTVCommissionRate(selectedCTV.id, newRate);
    if (error) alert("Lỗi: " + error);
    else {
      setShowRateModal(false);
      await loadData();
    }
    setActionLoading(null);
  };

  const handleApproveCommission = async (id: string) => {
    if (!user) return;
    setActionLoading(id);
    const { error } = await approveCommission(id, user.id);
    if (error) alert("Lỗi: " + error);
    else await loadData();
    setActionLoading(null);
  };

  const handlePayCommission = async (id: string) => {
    setActionLoading(id);
    const { error } = await markCommissionPaid(id);
    if (error) alert("Lỗi: " + error);
    else await loadData();
    setActionLoading(null);
  };

  const handleRejectCommission = async () => {
    if (!selectedCommission) return;
    setActionLoading(selectedCommission);
    const { error } = await rejectCommission(selectedCommission, rejectNote);
    if (error) alert("Lỗi: " + error);
    else {
      setShowRejectModal(false);
      setRejectNote("");
      await loadData();
    }
    setActionLoading(null);
  };

  const handleSearchUsers = async () => {
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    const { data } = await searchProfiles(searchQuery.trim());
    // Filter out users already in CTV list
    const existingIds = new Set(ctvList.map(c => c.profile_id));
    setSearchResults(data.filter(u => !existingIds.has(u.id)));
    setSearchLoading(false);
  };

  const handleAddCTV = async (profile: { id: string; name: string }) => {
    setActionLoading(profile.id);
    const { error } = await adminAddCTV(profile.id, profile.name, addRate);
    if (error) alert("Lỗi: " + error);
    else {
      setShowAddModal(false);
      setSearchQuery("");
      setSearchResults([]);
      await loadData();
    }
    setActionLoading(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  const tabs = [
    { id: "overview" as TabType, label: "Tổng quan", icon: "📊" },
    { id: "ctv-list" as TabType, label: "Danh sách CTV", icon: "👥" },
    { id: "commissions" as TabType, label: "Hoa hồng", icon: "💰" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Quản lý CTV & Hoa hồng
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            Quản lý cộng tác viên sale phòng trọ và hệ thống hoa hồng
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 text-sm font-medium flex items-center gap-2 shadow-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Thêm CTV
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-white dark:bg-neutral-700 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            <span className="mr-1.5">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && stats && <OverviewTab stats={stats} />}
      {activeTab === "ctv-list" && (
        <CTVListTab
          ctvList={ctvList}
          actionLoading={actionLoading}
          onApprove={(id) => handleUpdateStatus(id, "active")}
          onSuspend={(id) => handleUpdateStatus(id, "suspended")}
          onEditRate={(ctv) => {
            setSelectedCTV(ctv);
            setNewRate(ctv.commission_rate);
            setShowRateModal(true);
          }}
        />
      )}
      {activeTab === "commissions" && (
        <CommissionsTab
          commissions={commissions}
          actionLoading={actionLoading}
          onApprove={handleApproveCommission}
          onPay={handlePayCommission}
          onReject={(id) => {
            setSelectedCommission(id);
            setShowRejectModal(true);
          }}
        />
      )}

      {/* Rate Modal */}
      {showRateModal && selectedCTV && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
              Cập nhật tỷ lệ hoa hồng
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
              CTV: <strong>{selectedCTV.profiles?.name}</strong>
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Tỷ lệ hoa hồng (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={newRate}
                onChange={(e) => setNewRate(Number(e.target.value))}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowRateModal(false)}
                className="px-4 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg"
              >
                Hủy
              </button>
              <button
                onClick={handleUpdateRate}
                disabled={!!actionLoading}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {actionLoading ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
              Từ chối hoa hồng
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Lý do từ chối
              </label>
              <textarea
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
                placeholder="Nhập lý do..."
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setShowRejectModal(false); setRejectNote(""); }}
                className="px-4 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg"
              >
                Hủy
              </button>
              <button
                onClick={handleRejectCommission}
                disabled={!rejectNote.trim() || !!actionLoading}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? "Đang xử lý..." : "Từ chối"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add CTV Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 w-full max-w-lg shadow-xl">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
              ➕ Thêm CTV mới
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
              Tìm user đã đăng ký trên Supabase theo tên hoặc SĐT
            </p>

            {/* Search */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchUsers()}
                placeholder="Nhập tên hoặc SĐT..."
                className="flex-1 px-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white text-sm"
              />
              <button
                onClick={handleSearchUsers}
                disabled={searchLoading || !searchQuery.trim()}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
              >
                {searchLoading ? "..." : "Tìm"}
              </button>
            </div>

            {/* Commission rate */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Tỷ lệ hoa hồng (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={addRate}
                onChange={(e) => setAddRate(Number(e.target.value))}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white text-sm"
              />
            </div>

            {/* Results */}
            <div className="max-h-60 overflow-y-auto space-y-2 mb-4">
              {searchResults.length === 0 && searchQuery && !searchLoading && (
                <p className="text-sm text-neutral-500 text-center py-4">Không tìm thấy user nào</p>
              )}
              {searchResults.map((profile) => (
                <div key={profile.id} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">{profile.name}</p>
                    <p className="text-xs text-neutral-500">{profile.phone || "Không có SĐT"} · {profile.role}</p>
                  </div>
                  <button
                    onClick={() => handleAddCTV(profile)}
                    disabled={actionLoading === profile.id}
                    className="px-3 py-1.5 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium"
                  >
                    {actionLoading === profile.id ? "Đang thêm..." : "Thêm CTV"}
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => { setShowAddModal(false); setSearchQuery(""); setSearchResults([]); }}
                className="px-4 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== Overview Tab =====
function OverviewTab({ stats }: { stats: CTVStats }) {
  const cards = [
    { label: "Tổng CTV", value: stats.totalCTVs, icon: "👥", color: "from-blue-500 to-blue-600" },
    { label: "CTV hoạt động", value: stats.activeCTVs, icon: "✅", color: "from-green-500 to-green-600" },
    { label: "Chờ duyệt", value: stats.pendingCTVs, icon: "⏳", color: "from-yellow-500 to-yellow-600" },
    { label: "Lượt giới thiệu", value: stats.totalReferrals, icon: "🔗", color: "from-purple-500 to-purple-600" },
    { label: "GT thành công", value: stats.confirmedReferrals, icon: "🎯", color: "from-teal-500 to-teal-600" },
    { label: "Hoa hồng chờ duyệt", value: stats.pendingCommissions, icon: "💰", color: "from-orange-500 to-orange-600" },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {cards.map((card, i) => (
          <div key={i} className="bg-white dark:bg-neutral-800 rounded-xl p-5 shadow-sm border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center gap-3 mb-3">
              <div className={`bg-gradient-to-br ${card.color} rounded-lg p-2.5 text-white text-lg`}>
                {card.icon}
              </div>
              <span className="text-sm text-neutral-500 dark:text-neutral-400">{card.label}</span>
            </div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
          <p className="text-sm opacity-80 mb-1">Tổng hoa hồng đã tính</p>
          <p className="text-3xl font-bold">{formatVND(stats.totalEarned)}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <p className="text-sm opacity-80 mb-1">Đã chi trả</p>
          <p className="text-3xl font-bold">{formatVND(stats.totalPaid)}</p>
          <p className="text-sm opacity-80 mt-1">
            Còn lại: {formatVND(stats.totalEarned - stats.totalPaid)}
          </p>
        </div>
      </div>
    </div>
  );
}

// ===== CTV List Tab =====
function CTVListTab({
  ctvList, actionLoading, onApprove, onSuspend, onEditRate,
}: {
  ctvList: CTVProfileWithUser[];
  actionLoading: string | null;
  onApprove: (id: string) => void;
  onSuspend: (id: string) => void;
  onEditRate: (ctv: CTVProfileWithUser) => void;
}) {
  if (ctvList.length === 0) {
    return (
      <div className="text-center py-16 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
        <p className="text-4xl mb-3">👥</p>
        <p className="text-neutral-500 dark:text-neutral-400">Chưa có CTV nào đăng ký</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800">
              <th className="text-left px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400">CTV</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400">Mã giới thiệu</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400">Hoa hồng</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400">Ngân hàng</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400">Thu nhập</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400">Trạng thái</th>
              <th className="text-right px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {ctvList.map((ctv) => (
              <tr key={ctv.id} className="border-b border-neutral-100 dark:border-neutral-700/50 hover:bg-neutral-50 dark:hover:bg-neutral-700/30">
                <td className="px-4 py-3">
                  <p className="font-medium text-neutral-900 dark:text-white">{ctv.profiles?.name || "N/A"}</p>
                  <p className="text-xs text-neutral-500">{ctv.profiles?.phone || "Chưa có SĐT"}</p>
                </td>
                <td className="px-4 py-3">
                  <code className="text-xs bg-neutral-100 dark:bg-neutral-700 px-2 py-1 rounded font-mono">
                    {ctv.referral_code}
                  </code>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => onEditRate(ctv)}
                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    {ctv.commission_rate}%
                  </button>
                </td>
                <td className="px-4 py-3 text-xs text-neutral-600 dark:text-neutral-400">
                  {ctv.bank_name ? (
                    <>
                      <p>{ctv.bank_name}</p>
                      <p>{ctv.bank_account}</p>
                      <p>{ctv.bank_owner}</p>
                    </>
                  ) : (
                    <span className="text-neutral-400">Chưa cập nhật</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-emerald-600 dark:text-emerald-400">{formatVND(ctv.total_earned)}</p>
                  <p className="text-xs text-neutral-500">Đã chi: {formatVND(ctv.total_paid)}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[ctv.status]}`}>
                    {statusLabels[ctv.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex gap-1 justify-end">
                    {ctv.status === "pending" && (
                      <button
                        onClick={() => onApprove(ctv.id)}
                        disabled={actionLoading === ctv.id}
                        className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        Duyệt
                      </button>
                    )}
                    {ctv.status === "active" && (
                      <button
                        onClick={() => onSuspend(ctv.id)}
                        disabled={actionLoading === ctv.id}
                        className="px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                      >
                        Tạm dừng
                      </button>
                    )}
                    {ctv.status === "suspended" && (
                      <button
                        onClick={() => onApprove(ctv.id)}
                        disabled={actionLoading === ctv.id}
                        className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        Kích hoạt
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ===== Commissions Tab =====
function CommissionsTab({
  commissions, actionLoading, onApprove, onPay, onReject,
}: {
  commissions: CTVCommissionWithDetails[];
  actionLoading: string | null;
  onApprove: (id: string) => void;
  onPay: (id: string) => void;
  onReject: (id: string) => void;
}) {
  if (commissions.length === 0) {
    return (
      <div className="text-center py-16 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
        <p className="text-4xl mb-3">💰</p>
        <p className="text-neutral-500 dark:text-neutral-400">Chưa có hoa hồng nào</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800">
              <th className="text-left px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400">CTV</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400">Phòng</th>
              <th className="text-right px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400">Giá phòng</th>
              <th className="text-right px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400">Tỷ lệ</th>
              <th className="text-right px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400">Hoa hồng</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400">Trạng thái</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400">Ngày</th>
              <th className="text-right px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {commissions.map((com) => (
              <tr key={com.id} className="border-b border-neutral-100 dark:border-neutral-700/50 hover:bg-neutral-50 dark:hover:bg-neutral-700/30">
                <td className="px-4 py-3">
                  <p className="font-medium text-neutral-900 dark:text-white">
                    {(com.ctv_profiles as any)?.profiles?.name || "N/A"}
                  </p>
                  <p className="text-xs text-neutral-500">{(com.ctv_profiles as any)?.referral_code}</p>
                </td>
                <td className="px-4 py-3 text-neutral-700 dark:text-neutral-300 max-w-[200px] truncate">
                  {(com.ctv_referrals as any)?.rooms?.title || "N/A"}
                </td>
                <td className="px-4 py-3 text-right text-neutral-700 dark:text-neutral-300">
                  {formatVND(com.room_price)}
                </td>
                <td className="px-4 py-3 text-right font-medium text-blue-600 dark:text-blue-400">
                  {com.commission_rate}%
                </td>
                <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                  {formatVND(com.amount)}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[com.status]}`}>
                    {statusLabels[com.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-neutral-500">
                  {new Date(com.created_at).toLocaleDateString("vi-VN")}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex gap-1 justify-end flex-wrap">
                    {com.status === "pending" && (
                      <>
                        <button
                          onClick={() => onApprove(com.id)}
                          disabled={actionLoading === com.id}
                          className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          Duyệt
                        </button>
                        <button
                          onClick={() => onReject(com.id)}
                          disabled={actionLoading === com.id}
                          className="px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                        >
                          Từ chối
                        </button>
                      </>
                    )}
                    {com.status === "approved" && (
                      <button
                        onClick={() => onPay(com.id)}
                        disabled={actionLoading === com.id}
                        className="px-3 py-1.5 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                      >
                        Đã chi trả
                      </button>
                    )}
                    {com.status === "paid" && (
                      <span className="text-xs text-neutral-400">
                        {com.paid_at ? new Date(com.paid_at).toLocaleDateString("vi-VN") : ""}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
