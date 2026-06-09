"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchAllCommissions,
  fetchAllCTVProfiles,
  approveCommission,
  markCommissionPaid,
  rejectCommission,
  updateCTVStatus,
  updateCTVCommissionRate,
  formatVND,
  type CTVCommissionWithDetails,
  type CTVProfileWithUser
} from "@/lib/ctvServices";
import {
  UserGroupIcon,
  BanknotesIcon,
  CheckCircleIcon,
  XCircleIcon,
  InboxIcon,
  CreditCardIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";

export default function CTVCommissionsApproval() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"commissions" | "profiles">("commissions");
  
  // Commissions tab states
  const [commissions, setCommissions] = useState<CTVCommissionWithDetails[]>([]);
  const [commissionStatusTab, setCommissionStatusTab] = useState<"pending" | "approved" | "paid" | "rejected">("pending");
  
  // CTV profiles tab states
  const [profiles, setProfiles] = useState<CTVProfileWithUser[]>([]);
  const [profileStatusFilter, setProfileStatusFilter] = useState<"pending" | "active" | "suspended">("pending");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal / Prompt states for rejection note
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedCommissionId, setSelectedCommissionId] = useState<string | null>(null);
  const [rejectionNote, setRejectionNote] = useState("");

  // Commission rate input state
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [tempRate, setTempRate] = useState<number>(10);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: commsData } = await fetchAllCommissions();
      setCommissions(commsData || []);

      const { data: profsData } = await fetchAllCTVProfiles();
      setProfiles(profsData || []);
    } catch (err) {
      console.error("Error loading CTV data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  // Profile approvals
  const handleApproveProfile = async (profileId: string) => {
    if (!confirm("Bạn có chắc chắn muốn duyệt kích hoạt Cộng Tác Viên này không?")) return;
    try {
      const { error } = await updateCTVStatus(profileId, "active", "Đã duyệt bởi Giám Sát Vận Hành");
      if (error) throw new Error(error);
      alert("Đã duyệt kích hoạt Cộng Tác Viên thành công!");
      loadData();
    } catch (err: any) {
      alert("Có lỗi xảy ra: " + err.message);
    }
  };

  const handleSuspendProfile = async (profileId: string) => {
    if (!confirm("Bạn có chắc chắn muốn đình chỉ Cộng Tác Viên này không?")) return;
    try {
      const { error } = await updateCTVStatus(profileId, "suspended", "Đình chỉ hoạt động");
      if (error) throw new Error(error);
      alert("Đã đình chỉ Cộng Tác Viên.");
      loadData();
    } catch (err: any) {
      alert("Có lỗi xảy ra: " + err.message);
    }
  };

  const handleSaveCommissionRate = async (profileId: string) => {
    try {
      const { error } = await updateCTVCommissionRate(profileId, tempRate);
      if (error) throw new Error(error);
      alert("Đã cập nhật tỷ lệ hoa hồng mới!");
      setEditingProfileId(null);
      loadData();
    } catch (err: any) {
      alert("Có lỗi xảy ra: " + err.message);
    }
  };

  // Commission approvals
  const handleApproveCommission = async (commId: string) => {
    if (!confirm("Duyệt hoa hồng này? CTV sẽ được thông báo khoản hoa hồng đã sẵn sàng.")) return;
    if (!user?.id) return;
    try {
      const { error } = await approveCommission(commId, user.id, "Đã duyệt bởi Giám Sát Vận Hành");
      if (error) throw new Error(error);
      alert("Đã duyệt hoa hồng thành công!");
      loadData();
    } catch (err: any) {
      alert("Có lỗi xảy ra: " + err.message);
    }
  };

  const handleMarkPaidCommission = async (commId: string) => {
    if (!confirm("Xác nhận ĐÃ chuyển tiền thành công hoa hồng này cho CTV?")) return;
    try {
      const { error } = await markCommissionPaid(commId, "Đã thanh toán qua ngân hàng");
      if (error) throw new Error(error);
      alert("Đã xác nhận thanh toán hoa hồng thành công!");
      loadData();
    } catch (err: any) {
      alert("Có lỗi xảy ra: " + err.message);
    }
  };

  const openRejectModal = (commId: string) => {
    setSelectedCommissionId(commId);
    setRejectionNote("");
    setShowRejectModal(true);
  };

  const handleRejectCommission = async () => {
    if (!selectedCommissionId || !rejectionNote.trim()) {
      alert("Vui lòng điền lý do từ chối!");
      return;
    }
    try {
      const { error } = await rejectCommission(selectedCommissionId, rejectionNote);
      if (error) throw new Error(error);
      alert("Đã từ chối chi trả hoa hồng này.");
      setShowRejectModal(false);
      loadData();
    } catch (err: any) {
      alert("Có lỗi xảy ra: " + err.message);
    }
  };

  // Filter lists in memory
  const filteredCommissions = commissions.filter(c => c.status === commissionStatusTab);
  const filteredProfiles = profiles.filter(p => p.status === profileStatusFilter);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Duyệt & Quản lý mạng lưới CTV</h2>
          <p className="text-sm text-neutral-500">Xem xét hồ sơ đăng ký của CTV và xét duyệt chi trả hoa hồng giới thiệu</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="self-start flex items-center gap-1.5 px-3 py-2 border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg text-sm hover:bg-neutral-50 transition-colors"
        >
          <ArrowPathIcon className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          Tải lại dữ liệu
        </button>
      </div>

      {/* Main Tabs */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-700">
        <button
          onClick={() => setActiveTab("commissions")}
          className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition-all border-b-2 ${
            activeTab === "commissions"
              ? "border-primary-500 text-primary-6000"
              : "border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
          }`}
        >
          <BanknotesIcon className="w-5 h-5" />
          Duyệt hoa hồng CTV ({commissions.filter(c => c.status === "pending").length} mới)
        </button>
        <button
          onClick={() => setActiveTab("profiles")}
          className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition-all border-b-2 ${
            activeTab === "profiles"
              ? "border-primary-500 text-primary-6000"
              : "border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
          }`}
        >
          <UserGroupIcon className="w-5 h-5" />
          Duyệt tài khoản CTV ({profiles.filter(p => p.status === "pending").length} mới)
        </button>
      </div>

      {/* COMMISSIONS TAB CONTENT */}
      {activeTab === "commissions" && (
        <div className="space-y-6">
          {/* Sub tabs by status */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: "pending", label: "Chờ duyệt", count: commissions.filter(c => c.status === "pending").length },
              { id: "approved", label: "Đã duyệt (Chờ thanh toán)", count: commissions.filter(c => c.status === "approved").length },
              { id: "paid", label: "Đã thanh toán thành công", count: commissions.filter(c => c.status === "paid").length },
              { id: "rejected", label: "Bị từ chối", count: commissions.filter(c => c.status === "rejected").length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setCommissionStatusTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  commissionStatusTab === tab.id
                    ? "bg-primary-6000 text-white"
                    : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 hover:border-primary-500 hover:text-primary-500"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] text-white ${
                    tab.id === "pending" ? "bg-orange-500" :
                    tab.id === "approved" ? "bg-blue-500" :
                    tab.id === "paid" ? "bg-green-500" : "bg-neutral-500"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Commissions list */}
          <div className="grid grid-cols-1 gap-6">
            {filteredCommissions.length > 0 ? (
              filteredCommissions.map(comm => (
                <div
                  key={comm.id}
                  className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 shadow-sm space-y-4 hover:shadow-md transition-shadow"
                >
                  {/* Card Header: CTV profile info */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-100 dark:border-neutral-700 pb-3 gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {comm.ctv_profiles?.profiles?.name?.charAt(0) || "C"}
                      </div>
                      <div>
                        <h4 className="font-bold text-neutral-900 dark:text-white">
                          {comm.ctv_profiles?.profiles?.name || "CTV ẩn danh"}
                        </h4>
                        <p className="text-xs text-neutral-400">
                          Mã giới thiệu: <span className="font-bold text-primary-6000">{comm.ctv_profiles?.referral_code}</span> • SĐT: {comm.ctv_profiles?.profiles?.phone || "—"}
                        </p>
                      </div>
                    </div>
                    {/* Status Badge */}
                    <span
                      className={`self-start sm:self-center px-3 py-1 rounded-full text-xs font-bold ${
                        comm.status === "pending" ? "bg-orange-50 text-orange-700 dark:bg-orange-950/20 dark:text-orange-400" :
                        comm.status === "approved" ? "bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400" :
                        comm.status === "paid" ? "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400" :
                        "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400"
                      }`}
                    >
                      {comm.status === "pending" ? "Chờ phê duyệt" :
                       comm.status === "approved" ? "Đã duyệt (Chờ trả)" :
                       comm.status === "paid" ? "Đã thanh toán" : "Đã từ chối"}
                    </span>
                  </div>

                  {/* Card Body: Commission calculation details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {/* Column 1: House and pricing details */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Thông tin căn phòng được giới thiệu</p>
                      <div>
                        <p className="font-semibold text-neutral-800 dark:text-neutral-200">
                          {comm.ctv_referrals?.rooms?.title || "Phòng trọ hệ thống"}
                        </p>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          Địa chỉ: {comm.ctv_referrals?.rooms?.address || "Hòa Lạc, Hà Nội"}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-xs font-medium text-neutral-500 mt-2">
                        <span>Giá niêm yết: <strong className="text-neutral-900 dark:text-white">{formatVND(comm.room_price || 0)}</strong></span>
                        <span>Tỷ lệ hoa hồng: <strong className="text-neutral-900 dark:text-white">{comm.commission_rate}%</strong></span>
                      </div>
                    </div>

                    {/* Column 2: CTV Bank info */}
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl border border-neutral-100 dark:border-neutral-800 space-y-2">
                      <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider flex items-center gap-1">
                        <CreditCardIcon className="w-4 h-4 text-primary-500" />
                        Tài khoản thanh toán CTV
                      </p>
                      {comm.ctv_profiles?.bank_name ? (
                        <div className="space-y-1 text-xs">
                          <p>Ngân hàng: <span className="font-bold text-neutral-900 dark:text-white">{comm.ctv_profiles.bank_name}</span></p>
                          <p>Số tài khoản: <span className="font-bold text-neutral-900 dark:text-white font-mono text-sm">{comm.ctv_profiles.bank_account}</span></p>
                          <p>Chủ tài khoản: <span className="font-bold text-neutral-900 dark:text-white uppercase">{comm.ctv_profiles.bank_owner}</span></p>
                        </div>
                      ) : (
                        <p className="text-xs text-red-500 font-medium">CTV chưa cập nhật thông tin tài khoản ngân hàng!</p>
                      )}
                    </div>
                  </div>

                  {/* Card Footer: Commission Amount & Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-neutral-100 dark:border-neutral-700 pt-4 gap-4">
                    <div>
                      <p className="text-xs text-neutral-400 dark:text-neutral-500">Số tiền hoa hồng được nhận</p>
                      <h3 className="text-2xl font-black text-primary-6000 mt-0.5">{formatVND(comm.amount)}</h3>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      {comm.status === "pending" && (
                        <>
                          <button
                            onClick={() => openRejectModal(comm.id)}
                            className="px-4 py-2 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 text-xs font-bold rounded-lg transition-colors"
                          >
                            Từ chối
                          </button>
                          <button
                            onClick={() => handleApproveCommission(comm.id)}
                            className="px-4 py-2 bg-primary-6000 hover:bg-primary-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
                          >
                            <CheckCircleIcon className="w-4 h-4" />
                            Phê duyệt hoa hồng
                          </button>
                        </>
                      )}

                      {comm.status === "approved" && (
                        <>
                          <button
                            onClick={() => openRejectModal(comm.id)}
                            className="px-4 py-2 border border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 text-xs font-bold rounded-lg transition-colors"
                          >
                            Từ chối lại
                          </button>
                          <button
                            onClick={() => handleMarkPaidCommission(comm.id)}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
                          >
                            <CheckCircleIcon className="w-4 h-4" />
                            Đã chuyển khoản xong
                          </button>
                        </>
                      )}

                      {comm.status === "rejected" && comm.note && (
                        <div className="text-xs text-red-500 bg-red-50 dark:bg-red-950/20 p-2.5 rounded-lg font-medium border border-red-100/50 dark:border-red-900/10">
                          Lý do từ chối: {comm.note}
                        </div>
                      )}

                      {comm.status === "paid" && (
                        <div className="text-xs text-green-600 bg-green-50 dark:bg-green-950/20 p-2.5 rounded-lg font-semibold border border-green-100/50 dark:border-green-900/10">
                          Thanh toán hoàn tất vào lúc: {comm.paid_at ? new Date(comm.paid_at).toLocaleString("vi-VN") : "N/A"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-12 text-center">
                <InboxIcon className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
                <p className="text-neutral-500 dark:text-neutral-400 text-sm">Không có yêu cầu hoa hồng nào ở trạng thái này.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PROFILES TAB CONTENT */}
      {activeTab === "profiles" && (
        <div className="space-y-6">
          {/* Sub tabs for profiles status */}
          <div className="flex gap-2">
            {[
              { id: "pending", label: "Hồ sơ chờ duyệt", count: profiles.filter(p => p.status === "pending").length },
              { id: "active", label: "Đang hoạt động", count: profiles.filter(p => p.status === "active").length },
              { id: "suspended", label: "Bị đình chỉ", count: profiles.filter(p => p.status === "suspended").length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setProfileStatusFilter(tab.id as any)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  profileStatusFilter === tab.id
                    ? "bg-primary-6000 text-white"
                    : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 hover:border-primary-500 hover:text-primary-500"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Profiles list */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-neutral-500 dark:text-neutral-400 uppercase bg-neutral-50 dark:bg-neutral-900/50 border-b border-neutral-200 dark:border-neutral-700">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Tên Cộng Tác Viên</th>
                    <th className="px-6 py-4 font-semibold">Mã giới thiệu</th>
                    <th className="px-6 py-4 font-semibold">Tỷ lệ hoa hồng</th>
                    <th className="px-6 py-4 font-semibold">Tài khoản Ngân hàng</th>
                    <th className="px-6 py-4 font-semibold text-right">Tích lũy</th>
                    <th className="px-6 py-4 font-semibold text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                  {filteredProfiles.length > 0 ? (
                    filteredProfiles.map(prof => (
                      <tr key={prof.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-bold text-neutral-900 dark:text-white">
                              {prof.profiles?.name || "Người dùng ẩn danh"}
                            </p>
                            <p className="text-xs text-neutral-500">
                              SĐT: {prof.profiles?.phone || "Chưa cập nhật"}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-primary-6000">
                          {prof.referral_code}
                        </td>
                        <td className="px-6 py-4">
                          {editingProfileId === prof.id ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                value={tempRate}
                                onChange={e => setTempRate(Number(e.target.value))}
                                className="w-16 px-2 py-1 text-sm border rounded bg-neutral-50 dark:bg-neutral-900 text-neutral-800 dark:text-white"
                                min={0}
                                max={100}
                              />
                              <span className="text-xs">%</span>
                              <button
                                onClick={() => handleSaveCommissionRate(prof.id)}
                                className="px-2 py-1 bg-primary-6000 text-white rounded text-xs"
                              >
                                Lưu
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="font-bold">{prof.commission_rate}%</span>
                              <button
                                onClick={() => {
                                  setEditingProfileId(prof.id);
                                  setTempRate(prof.commission_rate);
                                }}
                                className="text-xs text-primary-6000 hover:underline"
                              >
                                Thay đổi
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs">
                          {prof.bank_name ? (
                            <div>
                              <p className="font-semibold text-neutral-900 dark:text-white">{prof.bank_name}</p>
                              <p className="font-mono">{prof.bank_account}</p>
                              <p className="text-neutral-500 uppercase">{prof.bank_owner}</p>
                            </div>
                          ) : (
                            <span className="text-neutral-400">Chưa có thông tin</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div>
                            <p className="font-bold text-neutral-900 dark:text-white">
                              Thu: {formatVND(prof.total_earned || 0)}
                            </p>
                            <p className="text-xs text-neutral-500">
                              Đã trả: {formatVND(prof.total_paid || 0)}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {prof.status === "pending" && (
                              <button
                                onClick={() => handleApproveProfile(prof.id)}
                                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                              >
                                Duyệt tài khoản
                              </button>
                            )}
                            {prof.status === "active" && (
                              <button
                                onClick={() => handleSuspendProfile(prof.id)}
                                className="px-3 py-1.5 border border-red-200 dark:border-red-800 text-red-600 hover:bg-red-50 text-xs font-bold rounded-lg transition-colors"
                              >
                                Đình chỉ
                              </button>
                            )}
                            {prof.status === "suspended" && (
                              <button
                                onClick={() => handleApproveProfile(prof.id)}
                                className="px-3 py-1.5 bg-primary-6000 hover:bg-primary-700 text-white text-xs font-bold rounded-lg transition-colors"
                              >
                                Kích hoạt lại
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-neutral-500 dark:text-neutral-400">
                        Không tìm thấy hồ sơ nào khớp bộ lọc.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* REJECTION REASON MODAL */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-neutral-100 dark:border-neutral-700 transform scale-100 transition-transform">
            <div className="flex justify-between items-center pb-2 border-b border-neutral-100 dark:border-neutral-700">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Từ chối chi trả hoa hồng</h3>
              <button
                onClick={() => setShowRejectModal(false)}
                className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-400"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                Lý do từ chối (Gửi trực tiếp đến CTV)
              </label>
              <textarea
                value={rejectionNote}
                onChange={e => setRejectionNote(e.target.value)}
                placeholder="Ví dụ: Khách thuê đã chấm dứt hợp đồng sớm không thỏa điều kiện chi trả, hoặc thông tin ngân hàng của bạn chưa chính xác..."
                rows={4}
                className="w-full text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 p-3 text-neutral-800 dark:text-neutral-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 text-xs font-semibold rounded-lg"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleRejectCommission}
                disabled={!rejectionNote.trim()}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-xs font-semibold rounded-lg"
              >
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
