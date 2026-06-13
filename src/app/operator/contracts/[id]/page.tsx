"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  PrinterIcon,
  CalendarIcon,
  KeyIcon,
  UserGroupIcon,
  BoltIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { terminateContract } from "@/lib/landlordServices";

interface ContractDetail {
  id: string;
  contract_code: string;
  room_id: string;
  room_unit_id?: string;
  owner_id?: string;
  start_date: string;
  end_date: string;
  actual_end_date: string | null;
  rent_price: number;
  rent_amount?: number;
  deposit: number;
  deposit_amount?: number;
  beds: number;
  payment_cycle: string;
  utilities_included: boolean;
  electric_start_index?: number;
  electric_price?: number;
  water_start_index?: number;
  water_price?: number;
  meter_photo?: string | null;
  contract_url?: string | null;
  notes?: string | null;
  status: string;
  created_at: string;
  rooms?: { title: string; address: string };
  room_units?: { name: string };
  profiles?: { name: string; phone: string };
}

interface ContractTenant {
  is_representative: boolean;
  profiles: { id: string; name: string; phone: string } | null;
}

const PAYMENT_CYCLE_LABELS: Record<string, string> = {
  "1_month": "1 tháng",
  "3_months": "3 tháng",
  "6_months": "6 tháng",
  "12_months": "12 tháng",
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "active":
      return { text: "Đang hiệu lực", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" };
    case "expiring":
      return { text: "Sắp hết hạn", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" };
    case "expired":
      return { text: "Đã quá hạn", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" };
    case "terminated":
      return { text: "Đã kết thúc", color: "bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300" };
    case "pending":
      return { text: "Chờ ký", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" };
    default:
      return { text: status, color: "bg-neutral-100 text-neutral-700" };
  }
};

export default function ContractDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const contractId = params.id as string;

  const [contract, setContract] = useState<ContractDetail | null>(null);
  const [tenants, setTenants] = useState<ContractTenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (contractId && user?.id) {
      loadContract();
    }
  }, [contractId, user?.id]);

  const loadContract = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("contracts")
        .select(`
          *,
          rooms (title, address),
          room_units (name),
          profiles:renter_id (name, phone)
        `)
        .eq("id", contractId)
        .single();

      if (error) throw error;
      setContract(data as ContractDetail);
      await loadContractTenants(contractId);
    } catch (err) {
      console.error("Error loading contract:", err);
      setContract(null);
    } finally {
      setLoading(false);
    }
  };

  const loadContractTenants = async (id: string) => {
    try {
      const { data: ctData, error } = await supabase
        .from("contract_tenants")
        .select("is_representative, tenant_id")
        .eq("contract_id", id);

      if (error) throw error;
      if (!ctData || ctData.length === 0) {
        setTenants([]);
        return;
      }

      const tenantIds = ctData.map((t) => t.tenant_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name, phone")
        .in("id", tenantIds);

      setTenants(
        ctData.map((ct) => ({
          is_representative: ct.is_representative,
          profiles: profiles?.find((p) => p.id === ct.tenant_id) ?? null,
        }))
      );
    } catch (err) {
      console.error("Error loading contract tenants:", err);
      setTenants([]);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(amount);

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString("vi-VN");

  const handleEndContract = async () => {
    if (!contract || !confirm("Bạn có chắc muốn kết thúc hợp đồng này?")) return;

    setActionLoading(true);
    try {
      const { error } = await terminateContract(contract.id);
      if (error) {
        alert("Lỗi: " + error);
      } else {
        router.push("/operator/contracts");
      }
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500" />
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="space-y-4">
        <Link
          href="/operator/contracts"
          className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Quay lại danh sách
        </Link>
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-12 text-center">
          <p className="text-neutral-500">Không tìm thấy hợp đồng.</p>
        </div>
      </div>
    );
  }

  const rentAmount = Number(contract.rent_price ?? contract.rent_amount ?? 0);
  const depositAmount = Number(contract.deposit ?? contract.deposit_amount ?? 0);
  const status = getStatusLabel(contract.status);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <Link
            href="/operator/contracts"
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">Chi tiết hợp đồng</h1>
            <p className="text-sm text-neutral-500 mt-0.5">
              Mã HĐ: {contract.contract_code || contract.id.substring(0, 8).toUpperCase()}
            </p>
          </div>
        </div>
        <span className={`self-start px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${status.color}`}>
          {status.text}
        </span>
      </div>

      {/* Main card */}
      <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 space-y-6">
          {/* Title */}
          <div className="border-b border-neutral-200 dark:border-neutral-700 pb-6">
            <h2 className="text-2xl font-black text-neutral-950 dark:text-white tracking-tight uppercase">
              HỢP ĐỒNG THUÊ PHÒNG
            </h2>
            <p className="text-sm text-neutral-500 mt-1">
              {contract.rooms?.title || "N/A"}
              {contract.room_units?.name ? ` — ${contract.room_units.name}` : ""}
            </p>
            {contract.rooms?.address && (
              <p className="text-xs text-neutral-400 mt-0.5">{contract.rooms.address}</p>
            )}
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">Thời hạn hợp đồng</p>
                <p className="font-semibold text-neutral-800 dark:text-neutral-200 mt-1 flex items-center gap-1.5">
                  <CalendarIcon className="w-4 h-4 text-neutral-400 shrink-0" />
                  {formatDate(contract.start_date)} — {formatDate(contract.end_date)}
                </p>
                {contract.actual_end_date && (
                  <p className="text-xs text-red-500 mt-1">Kết thúc thực tế: {formatDate(contract.actual_end_date)}</p>
                )}
              </div>
              <div>
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">Tiền đặt cọc</p>
                <p className="font-bold text-neutral-800 dark:text-neutral-200 mt-1 flex items-center gap-1.5">
                  <KeyIcon className="w-4 h-4 text-neutral-400 shrink-0" />
                  {formatCurrency(depositAmount)}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">Số giường / Chu kỳ TT</p>
                <p className="font-medium text-neutral-800 dark:text-neutral-200 mt-1">
                  {contract.beds || 1} giường · {PAYMENT_CYCLE_LABELS[contract.payment_cycle] || contract.payment_cycle}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">Tiền thuê phòng</p>
                <p className="text-2xl font-black text-green-600 dark:text-green-400 mt-1">
                  {formatCurrency(rentAmount)}
                  <span className="text-sm font-normal text-neutral-400"> / tháng</span>
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">Điện nước</p>
                <p className="font-medium text-neutral-800 dark:text-neutral-200 mt-1 flex items-center gap-1.5">
                  <BoltIcon className="w-4 h-4 text-neutral-400 shrink-0" />
                  {contract.utilities_included ? "Đã bao gồm trong giá thuê" : "Tính theo công tơ riêng"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">Ngày lập HĐ</p>
                <p className="font-medium text-neutral-800 dark:text-neutral-200 mt-1">
                  {formatDate(contract.created_at)}
                </p>
              </div>
            </div>
          </div>

          {/* Tenants */}
          <div className="border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden">
            <div className="px-5 py-3 bg-neutral-50 dark:bg-neutral-900/50 border-b border-neutral-200 dark:border-neutral-700 flex items-center gap-2">
              <UserGroupIcon className="w-4 h-4 text-neutral-500" />
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Khách thuê</span>
            </div>
            <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {tenants.length > 0 ? (
                tenants.map((t, idx) => (
                  <div key={idx} className="px-5 py-3">
                    <p className="font-semibold text-neutral-900 dark:text-white">
                      {t.profiles?.name || "N/A"}
                      {t.is_representative && (
                        <span className="ml-2 text-xxs font-bold uppercase tracking-wider text-primary-6000 bg-primary-50 dark:bg-primary-950/30 px-2 py-0.5 rounded-full">
                          Đại diện
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-neutral-500">{t.profiles?.phone || ""}</p>
                  </div>
                ))
              ) : (
                <div className="px-5 py-3">
                  <p className="font-semibold text-neutral-900 dark:text-white">{contract.profiles?.name || "N/A"}</p>
                  <p className="text-xs text-neutral-500">{contract.profiles?.phone || ""}</p>
                </div>
              )}
            </div>
          </div>

          {/* Utility pricing */}
          {!contract.utilities_included && (
            <div className="bg-neutral-50 dark:bg-neutral-900/40 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 space-y-3">
              <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Giá điện nước & chỉ số ban đầu</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 text-sm">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Đơn giá điện:</span>
                    <span className="font-bold text-neutral-800 dark:text-neutral-200">
                      {contract.electric_price ? `${Number(contract.electric_price).toLocaleString("vi-VN")} đ/kWh` : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">Chỉ số điện ban đầu:</span>
                    <span className="text-neutral-600 dark:text-neutral-400">{contract.electric_start_index ?? 0}</span>
                  </div>
                </div>
                <div className="space-y-1 sm:border-l sm:border-neutral-200 dark:sm:border-neutral-700 sm:pl-4">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Đơn giá nước:</span>
                    <span className="font-bold text-neutral-800 dark:text-neutral-200">
                      {contract.water_price ? `${Number(contract.water_price).toLocaleString("vi-VN")} đ/m³` : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">Chỉ số nước ban đầu:</span>
                    <span className="text-neutral-600 dark:text-neutral-400">{contract.water_start_index ?? 0}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Meter photo */}
          {contract.meter_photo && (
            <div>
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">Ảnh công tơ ban đầu</p>
              <img
                src={contract.meter_photo}
                alt="Ảnh công tơ"
                className="max-h-64 rounded-xl border border-neutral-200 dark:border-neutral-700 object-cover"
              />
            </div>
          )}

          {/* Notes */}
          {contract.notes && (
            <div className="bg-neutral-50 dark:bg-neutral-900/30 p-4 rounded-xl border border-neutral-200/50 dark:border-neutral-700/50 text-sm">
              <span className="font-bold text-neutral-800 dark:text-neutral-200 block mb-1">Ghi chú</span>
              <p className="text-neutral-600 dark:text-neutral-400">{contract.notes}</p>
            </div>
          )}

          {/* PDF link */}
          {contract.contract_url && (
            <a
              href={contract.contract_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-primary-6000 hover:bg-primary-700 text-white text-sm font-bold px-5 py-3 rounded-xl transition-all shadow-sm"
            >
              <DocumentArrowDownIcon className="w-5 h-5" />
              Xem và tải bản PDF hợp đồng
            </a>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 px-6 py-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/20 print:hidden">
          <button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 px-4 py-2 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
          >
            <PrinterIcon className="w-4 h-4" />
            In hợp đồng
          </button>

          <div className="flex gap-2">
            <Link
              href="/operator/contracts"
              className="flex-1 sm:flex-none px-4 py-2 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors text-center"
            >
              Quay lại
            </Link>
            {contract.status === "active" && (
              <button
                onClick={handleEndContract}
                disabled={actionLoading}
                className="flex-1 sm:flex-none px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
              >
                {actionLoading ? "Đang xử lý..." : "Kết thúc HĐ"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
