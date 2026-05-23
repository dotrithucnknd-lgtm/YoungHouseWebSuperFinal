"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  HomeIcon,
  DocumentTextIcon,
  CreditCardIcon,
  BoltIcon,
  WrenchScrewdriverIcon,
  ArrowLeftOnRectangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

export default function TenantDashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [roomUnit, setRoomUnit] = useState<any>(null);
  const [contract, setContract] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "contract" | "invoices" | "utilities">("overview");

  // State for Payment Modal
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  // State for Maintenance Modal
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [maintenanceForm, setMaintenanceForm] = useState({ title: "", description: "" });
  const [maintenanceSubmitted, setMaintenanceSubmitted] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    fetchTenantData();
  }, [user, authLoading]);

  const fetchTenantData = async () => {
    try {
      setLoading(true);
      // 1. Fetch Room Unit associated with this account_id
      const { data: unitData, error: unitError } = await supabase
        .from("room_units")
        .select(`
          *,
          rooms (
            id,
            title,
            address
          )
        `)
        .eq("current_renter_id", user?.id)
        .maybeSingle();

      if (unitError) console.error("Error fetching room unit:", unitError);
      
      let finalUnit = unitData;
      let finalContract = null;

      // 2. Fetch contract (either linked to this room unit, or renter profile directly)
      if (unitData) {
        setRoomUnit(unitData);
        
        const { data: contractData, error: contractError } = await supabase
          .from("contracts")
          .select("*")
          .eq("room_unit_id", unitData.id)
          .eq("status", "active")
          .maybeSingle();

        if (contractError) console.error("Error fetching contract:", contractError);
        if (contractData) {
          setContract(contractData);
          finalContract = contractData;
        }
      } else {
        // Fallback: search contract directly for renter_id
        const { data: contractData } = await supabase
          .from("contracts")
          .select(`
            *,
            room_units (
              *,
              rooms (
                id,
                title,
                address
              )
            )
          `)
          .eq("renter_id", user?.id)
          .eq("status", "active")
          .maybeSingle();

        if (contractData) {
          setContract(contractData);
          finalContract = contractData;
          if (contractData.room_units) {
            setRoomUnit(contractData.room_units);
            finalUnit = contractData.room_units;
          }
        }
      }

      // 3. Fetch Invoices for this Room Unit
      const targetUnitId = finalUnit?.id;
      if (targetUnitId) {
        const { data: invoicesData, error: invoicesError } = await supabase
          .from("invoices")
          .select(`
            *,
            invoice_items (
              *,
              services:service_id (
                id,
                name,
                unit,
                type
              )
            )
          `)
          .eq("room_unit_id", targetUnitId)
          .order("created_at", { ascending: false });

        if (invoicesError) console.error("Error fetching invoices:", invoicesError);
        setInvoices(invoicesData || []);
      }
    } catch (err) {
      console.error("Error in fetchTenantData:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const handlePayInvoice = (invoice: any) => {
    setSelectedInvoice(invoice);
    setPaymentSuccess(false);
    setShowPayModal(true);
  };

  const submitPayment = async () => {
    if (!selectedInvoice) return;
    try {
      // Update invoice status locally & remotely
      const { error } = await supabase
        .from("invoices")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
          payment_method: "VNPAY QR",
        })
        .eq("id", selectedInvoice.id);

      if (error) throw error;

      setPaymentSuccess(true);
      setTimeout(() => {
        setShowPayModal(false);
        fetchTenantData();
      }, 2000);
    } catch (err: any) {
      alert("Lỗi thanh toán: " + err.message);
    }
  };

  const submitMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomUnit || !maintenanceForm.title.trim()) return;

    try {
      const { error } = await supabase.from("maintenance_tickets").insert({
        room_id: roomUnit.room_id || roomUnit.rooms?.id,
        tenant_id: user?.id,
        title: maintenanceForm.title.trim(),
        description: maintenanceForm.description.trim(),
        status: "pending",
      });

      if (error) throw error;

      setMaintenanceSubmitted(true);
      setMaintenanceForm({ title: "", description: "" });
      setTimeout(() => {
        setShowMaintenanceModal(false);
        setMaintenanceSubmitted(false);
      }, 2500);
    } catch (err: any) {
      alert("Lỗi gửi yêu cầu: " + err.message);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        <p className="mt-4 text-slate-500 font-medium animate-pulse">Đang tải thông tin phòng...</p>
      </div>
    );
  }

  // Get active unpaid invoice
  const unpaidInvoice = invoices.find(i => i.status === "unpaid");

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] text-[#1e293b] dark:text-[#f8fafc] font-sans antialiased">
      {/* HEADER BANNER */}
      <header className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="bg-white/20 p-2.5 rounded-xl backdrop-blur-md">
              <HomeIcon className="w-6 h-6 text-white" />
            </span>
            <div>
              <h1 className="text-xl font-bold tracking-tight">YoungHouse Member Portal</h1>
              <p className="text-xs text-emerald-100 mt-0.5">Hệ thống quản lý cư dân và hóa đơn thông minh</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/25 active:bg-white/30 px-4 py-2 rounded-xl transition-all font-medium text-sm border border-white/10"
          >
            <ArrowLeftOnRectangleIcon className="w-4 h-4" />
            Đăng xuất
          </button>
        </div>
      </header>

      {/* DASHBOARD HERO */}
      <section className="bg-white dark:bg-[#1e293b] border-b border-slate-200 dark:border-slate-800 py-8 px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Chào {user?.name || "bạn"},
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-1.5">
              <span>Hôm nay bạn có một ngày tuyệt vời chứ?</span>
              {roomUnit ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900/50">
                  {roomUnit.name} - {roomUnit.rooms?.title}
                </span>
              ) : (
                <span className="text-red-500 font-medium">Chưa liên kết phòng</span>
              )}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowMaintenanceModal(true)}
              className="flex items-center gap-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:text-indigo-300 dark:hover:bg-indigo-950/60 px-4 py-3 rounded-xl transition-all font-semibold text-sm border border-indigo-200/50 dark:border-indigo-900/40"
            >
              <WrenchScrewdriverIcon className="w-4 h-4" />
              Báo sự cố phòng
            </button>
            {unpaidInvoice && (
              <button
                onClick={() => handlePayInvoice(unpaidInvoice)}
                className="flex items-center gap-2 bg-green-600 text-white hover:bg-green-700 px-5 py-3 rounded-xl transition-all font-semibold text-sm shadow-md shadow-green-500/20 active:scale-95"
              >
                <CreditCardIcon className="w-4 h-4" />
                Thanh toán hoá đơn tháng này
              </button>
            )}
          </div>
        </div>
      </section>

      {/* TABS NAVIGATION */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-1 overflow-x-auto pb-px">
          {(["overview", "contract", "invoices", "utilities"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 font-semibold text-sm transition-all border-b-2 capitalize whitespace-nowrap ${
                activeTab === tab
                  ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
                  : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {tab === "overview" && "Tổng quan"}
              {tab === "contract" && "Hợp đồng"}
              {tab === "invoices" && "Hóa đơn"}
              {tab === "utilities" && "Chỉ số điện nước"}
            </button>
          ))}
        </div>

        {/* CONTENT PANELS */}
        <div className="mt-8">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Room info & Unpaid bill */}
              <div className="lg:col-span-2 space-y-8">
                {/* 1. ROOM CARD */}
                <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                  <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white mb-4">
                    <span className="bg-emerald-500/10 p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400">
                      <HomeIcon className="w-5 h-5" />
                    </span>
                    Thông tin phòng trọ của bạn
                  </h3>
                  
                  {roomUnit ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Tên phòng</p>
                          <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{roomUnit.name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Toà nhà / Cơ sở</p>
                          <p className="text-base font-semibold mt-0.5 text-slate-800 dark:text-slate-200">{roomUnit.rooms?.title}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Địa chỉ</p>
                          <p className="text-sm mt-0.5 text-slate-600 dark:text-slate-400">{roomUnit.rooms?.address}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Giá thuê phòng</p>
                          <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                            {roomUnit.rent_price ? `${roomUnit.rent_price.toLocaleString("vi-VN")} đ / tháng` : "Liên hệ"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Diện tích</p>
                          <p className="text-sm mt-0.5 font-medium text-slate-800 dark:text-slate-200">{roomUnit.area} m²</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Trạng thái phòng</p>
                          <span className="inline-flex items-center gap-1 text-xs font-semibold bg-green-50 text-green-700 px-2.5 py-0.5 rounded-full border border-green-200 dark:bg-green-950/30 dark:text-green-300 dark:border-green-900/30 mt-1">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
                            Đang thuê
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-400 italic">Chưa có thông tin phòng nào được liên kết với tài khoản này.</p>
                  )}
                </div>

                {/* 2. ELECTRICITY/UTILITY HIGHLIGHT */}
                <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                  <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white mb-4">
                    <span className="bg-amber-500/10 p-1.5 rounded-lg text-amber-600 dark:text-amber-400">
                      <BoltIcon className="w-5 h-5" />
                    </span>
                    Mức tiêu dùng điện gần đây
                  </h3>
                  
                  {invoices.length > 0 ? (
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                        Biểu đồ/Thống kê chỉ số điện năng tiêu thụ trong kỳ hoá đơn của bạn.
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {invoices.slice(0, 4).reverse().map((inv) => {
                          const elecItem = inv.invoice_items?.find((item: any) =>
                            item.services?.name?.toLowerCase().includes("điện") ||
                            item.services?.unit?.toLowerCase().includes("kwh") ||
                            item.services?.unit?.toLowerCase().includes("số")
                          );
                          return (
                            <div key={inv.id} className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                              <p className="text-xs text-slate-400 font-bold uppercase">Tháng {inv.month}/{inv.year}</p>
                              <p className="text-2xl font-extrabold text-amber-500 mt-2">
                                {elecItem?.usage || 0} <span className="text-sm font-semibold">kWh</span>
                              </p>
                              <span className="text-[10px] text-slate-500 mt-1 block">
                                Chỉ số: {elecItem?.old_index || 0} ➡️ {elecItem?.new_index || 0}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-400 italic">Chưa có chỉ số điện nước nào được cập nhật.</p>
                  )}
                </div>
              </div>

              {/* Right Column: Bills summary */}
              <div className="space-y-8">
                {/* 3. CURRENT UNPAID BILL */}
                <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl pointer-events-none"></div>
                  
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center justify-between">
                    <span>Hóa đơn tháng này</span>
                    {unpaidInvoice ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase bg-red-50 text-red-700 px-2 py-0.5 rounded-full border border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/30">
                        Chưa đóng
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900/30">
                        Đã hoàn tất
                      </span>
                    )}
                  </h3>

                  {unpaidInvoice ? (
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-slate-400 font-semibold">Tổng tiền cần thanh toán</p>
                        <p className="text-3xl font-black text-red-500 tracking-tight mt-1">
                          {unpaidInvoice.total_amount.toLocaleString("vi-VN")} đ
                        </p>
                      </div>
                      
                      <div className="bg-red-50/50 dark:bg-red-950/10 p-3.5 rounded-xl border border-red-100 dark:border-red-900/20 text-xs text-red-600 dark:text-red-400 font-medium">
                        Hạn thanh toán: {unpaidInvoice.due_date ? new Date(unpaidInvoice.due_date).toLocaleDateString("vi-VN") : "N/A"}
                      </div>

                      <button
                        onClick={() => handlePayInvoice(unpaidInvoice)}
                        className="w-full text-center bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md shadow-green-500/10"
                      >
                        Thanh toán ngay qua QR
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto" />
                      <p className="mt-3 text-sm font-semibold text-slate-800 dark:text-white">Tuyệt vời! Bạn không còn hoá đơn chưa đóng nào.</p>
                      <p className="text-xs text-slate-400 mt-1">Hẹn gặp lại bạn vào chu kỳ đóng phí tiếp theo.</p>
                    </div>
                  )}
                </div>

                {/* 4. UTILITY UNIT PRICES QUICK HIGHLIGHT */}
                {contract && (
                  <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Đơn giá điện nước trong hợp đồng</h3>
                    <div className="space-y-3.5">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500 font-medium">Giá điện sinh hoạt</span>
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                          {contract.electric_price ? `${contract.electric_price.toLocaleString("vi-VN")} đ / số` : "Theo đồng hồ riêng"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-3">
                        <span className="text-xs text-slate-500 font-medium">Giá nước sinh hoạt</span>
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                          {contract.water_price ? `${contract.water_price.toLocaleString("vi-VN")} đ / khối` : "Theo đồng hồ riêng"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: CONTRACT */}
          {activeTab === "contract" && (
            <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm max-w-4xl">
              <div className="flex items-center gap-3 mb-6">
                <span className="bg-emerald-500/10 p-2 rounded-xl text-emerald-600 dark:text-emerald-400">
                  <DocumentTextIcon className="w-6 h-6" />
                </span>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Chi tiết hợp đồng thuê phòng</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Thông tin pháp lý ràng buộc giữa hai bên</p>
                </div>
              </div>

              {contract ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-100 dark:border-slate-800 pt-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase">Mã hợp đồng</p>
                      <p className="text-base font-semibold text-slate-900 dark:text-white mt-0.5">
                        {contract.contract_code || `HD-${contract.id.slice(0, 8).toUpperCase()}`}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase">Thời hạn hợp đồng</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                        Từ {new Date(contract.start_date).toLocaleDateString("vi-VN")} đến {new Date(contract.end_date).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase">Tiền cọc phòng</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                        {contract.deposit_amount ? `${contract.deposit_amount.toLocaleString("vi-VN")} đ` : "0 đ"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase">Tiền thuê phòng cố định</p>
                      <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {contract.rent_amount.toLocaleString("vi-VN")} đ / tháng
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase">Trạng thái pháp lý</p>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200 mt-1 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-900/30">
                        Hợp đồng có hiệu lực
                      </span>
                    </div>
                    {contract.contract_url && (
                      <div className="pt-2">
                        <a
                          href={contract.contract_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all"
                        >
                          Xem và tải File hợp đồng (.pdf)
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-slate-400 italic py-4">Chưa có hợp đồng nào đang có hiệu lực cho phòng này.</p>
              )}
            </div>
          )}

          {/* TAB 3: INVOICES */}
          {activeTab === "invoices" && (
            <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Lịch sử hóa đơn thanh toán</h3>
              
              {invoices.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-sm">
                    <thead>
                      <tr className="text-xs text-slate-400 uppercase tracking-wider font-bold">
                        <th className="py-4 px-4">Kỳ hóa đơn</th>
                        <th className="py-4 px-4">Hạn thanh toán</th>
                        <th className="py-4 px-4">Tổng tiền</th>
                        <th className="py-4 px-4">Phương thức</th>
                        <th className="py-4 px-4">Trạng thái</th>
                        <th className="py-4 px-4 text-right">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {invoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                          <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">
                            Tháng {inv.month} / {inv.year}
                          </td>
                          <td className="py-4 px-4 text-slate-500">
                            {inv.due_date ? new Date(inv.due_date).toLocaleDateString("vi-VN") : "N/A"}
                          </td>
                          <td className="py-4 px-4 font-extrabold text-slate-900 dark:text-white">
                            {inv.total_amount.toLocaleString("vi-VN")} đ
                          </td>
                          <td className="py-4 px-4 text-slate-600 dark:text-slate-400 font-medium">
                            {inv.payment_method || "—"}
                          </td>
                          <td className="py-4 px-4">
                            {inv.status === "paid" && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-200 dark:bg-green-950/20 dark:text-green-300 dark:border-green-900/30">
                                <CheckCircleIcon className="w-3.5 h-3.5" />
                                Đã đóng
                              </span>
                            )}
                            {inv.status === "unpaid" && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-red-50 text-red-700 px-2 py-0.5 rounded-full border border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30">
                                <ClockIcon className="w-3.5 h-3.5 animate-pulse" />
                                Chưa đóng
                              </span>
                            )}
                            {inv.status === "overdue" && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                                <XCircleIcon className="w-3.5 h-3.5" />
                                Quá hạn
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-right">
                            {inv.status === "unpaid" ? (
                              <button
                                onClick={() => handlePayInvoice(inv)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                              >
                                Đóng tiền ngay
                              </button>
                            ) : (
                              <span className="text-xs text-slate-400 italic">Hoàn tất</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-slate-400 italic">Chưa có lịch sử hoá đơn thanh toán nào.</p>
              )}
            </div>
          )}

          {/* TAB 4: UTILITIES */}
          {activeTab === "utilities" && (
            <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Chỉ số điện nước tiêu thụ</h3>
              
              {invoices.length > 0 ? (
                <div className="space-y-6">
                  {invoices.map((inv) => {
                    const elec = inv.invoice_items?.find((it: any) =>
                      it.services?.name?.toLowerCase().includes("điện") || it.services?.unit?.toLowerCase().includes("kwh")
                    );
                    const water = inv.invoice_items?.find((it: any) =>
                      it.services?.name?.toLowerCase().includes("nước") || it.services?.unit?.toLowerCase().includes("m3")
                    );
                    
                    return (
                      <div key={inv.id} className="border border-slate-100 dark:border-slate-800 rounded-xl p-5 bg-slate-50 dark:bg-slate-900/30">
                        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                          <p className="font-bold text-slate-900 dark:text-white">Hóa đơn Kỳ tháng {inv.month}/{inv.year}</p>
                          <span className="text-xs text-slate-400">Ngày ghi: {new Date(inv.created_at).toLocaleDateString("vi-VN")}</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Electricity */}
                          <div className="flex items-center gap-4 bg-white dark:bg-[#1e293b] p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 shadow-xs">
                            <div className="bg-amber-500/10 p-3 rounded-full text-amber-500">
                              <BoltIcon className="w-6 h-6 animate-pulse" />
                            </div>
                            <div>
                              <p className="text-xs text-slate-400 font-bold uppercase">Chỉ số Điện</p>
                              <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                                {elec?.usage || 0} kWh
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                Chỉ số: {elec?.old_index || 0} (Cũ) ➡️ {elec?.new_index || 0} (Mới)
                              </p>
                            </div>
                          </div>

                          {/* Water */}
                          <div className="flex items-center gap-4 bg-white dark:bg-[#1e293b] p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 shadow-xs">
                            <div className="bg-blue-500/10 p-3 rounded-full text-blue-500">
                              <span className="text-xl font-bold">💧</span>
                            </div>
                            <div>
                              <p className="text-xs text-slate-400 font-bold uppercase">Chỉ số Nước</p>
                              <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                                {water?.usage || 0} khối (m³)
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                Chỉ số: {water?.old_index || 0} (Cũ) ➡️ {water?.new_index || 0} (Mới)
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-slate-400 italic">Chưa có chỉ số tiện ích nào được ghi lại.</p>
              )}
            </div>
          )}
        </div>
      </main>

      {/* MODAL 1: PAY INVOICE */}
      {showPayModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1e293b] w-full max-w-md rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200">
            {paymentSuccess ? (
              <div className="text-center py-8">
                <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto animate-bounce" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-4">Thanh toán thành công!</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Giao dịch đã được ghi nhận vào hệ thống.</p>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Quét Mã Thanh Toán QR</h3>
                <p className="text-xs text-slate-500 mt-1">Sử dụng ứng dụng Ngân hàng (Mobile Banking) hoặc Ví điện tử để thanh toán</p>
                
                {/* QR Image and Mock payment layout */}
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 mt-4 text-center">
                  <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Kỳ hóa đơn Tháng {selectedInvoice.month}/{selectedInvoice.year}</p>
                  <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight mt-1">
                    {selectedInvoice.total_amount.toLocaleString("vi-VN")} đ
                  </p>
                  
                  {/* Mock QR generator */}
                  <div className="bg-white p-3 rounded-xl inline-block mt-4 shadow-sm">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                        `STK: 123456789 - Ngan hang: MBBank - So tien: ${selectedInvoice.total_amount} - Noi dung: Thanh toan tien phong ky thang ${selectedInvoice.month}/${selectedInvoice.year}`
                      )}`}
                      alt="QR Code thanh toan"
                      className="w-40 h-40 mx-auto"
                    />
                  </div>
                  
                  <p className="text-[11px] text-slate-500 mt-3 font-medium">Nội dung chuyển khoản: <span className="text-slate-800 dark:text-white font-bold">YoungHouse {roomUnit?.name} T{selectedInvoice.month}</span></p>
                </div>

                {/* Service Items details inside Invoice */}
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Chi tiết các dịch vụ</p>
                  <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-100 dark:divide-slate-800">
                    {selectedInvoice.invoice_items?.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center text-xs pt-1.5">
                        <span className="text-slate-500 font-medium">
                          {item.services?.name} {item.usage ? `(${item.usage} ${item.services?.unit})` : ""}
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {item.amount.toLocaleString("vi-VN")} đ
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowPayModal(false)}
                    className="flex-1 py-3 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-sm hover:bg-slate-50 transition-all"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={submitPayment}
                    className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-green-500/10"
                  >
                    Xác nhận đã chuyển khoản
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: REPORT MAINTENANCE */}
      {showMaintenanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1e293b] w-full max-w-md rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200">
            {maintenanceSubmitted ? (
              <div className="text-center py-8">
                <CheckCircleIcon className="w-16 h-16 text-indigo-500 mx-auto animate-bounce" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-4">Gửi sự cố thành công!</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Đội kỹ thuật YoungHouse sẽ liên hệ kiểm tra trong thời gian sớm nhất.</p>
              </div>
            ) : (
              <form onSubmit={submitMaintenance}>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Báo sự cố phòng / Yêu cầu sửa chữa</h3>
                <p className="text-xs text-slate-500 mt-1">Đồng hồ hỏng, bóng đèn cháy, vòi nước rò rỉ... hãy gửi cho ban quản lý để được hỗ trợ sửa chữa.</p>
                
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Vấn đề gặp phải *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Rò rỉ nước nhà vệ sinh, Hỏng điều hoà..."
                      value={maintenanceForm.title}
                      onChange={(e) => setMaintenanceForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Mô tả chi tiết</label>
                    <textarea
                      rows={4}
                      placeholder="Mô tả cụ thể vị trí hoặc tình trạng lỗi để nhân viên kỹ thuật chuẩn bị trước dụng cụ sửa chữa..."
                      value={maintenanceForm.description}
                      onChange={(e) => setMaintenanceForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowMaintenanceModal(false)}
                    className="flex-1 py-3 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-sm hover:bg-slate-50 transition-all"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-indigo-500/10"
                  >
                    Gửi yêu cầu sửa chữa
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
