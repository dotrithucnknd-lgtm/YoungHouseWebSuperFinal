"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  PhoneIcon,
  EnvelopeIcon,
  IdentificationIcon,
  MapPinIcon,
  UserIcon,
  DocumentTextIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchOwnerTenantById,
  deleteTenant,
  type TenantWithDetails,
} from "@/lib/landlordServices";

const GENDER_LABELS: Record<string, string> = {
  male: "Nam",
  female: "Nữ",
  other: "Khác",
};

const RELATIONSHIP_LABELS: Record<string, string> = {
  spouse: "Vợ/Chồng",
  child: "Con",
  parent: "Cha/Mẹ",
  sibling: "Anh/Chị/Em",
  relative: "Người thân",
  other: "Khác",
};

const getStayStatusLabel = (status: string) => {
  switch (status) {
    case "renting":
      return { text: "Đang thuê", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" };
    case "not_rented":
      return { text: "Chưa thuê", color: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300" };
    case "moved_out":
      return { text: "Đã rời đi", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" };
    default:
      return { text: status, color: "bg-neutral-100 text-neutral-700" };
  }
};

const getContractStatusLabel = (status: string) => {
  switch (status) {
    case "active":
      return { text: "Đang hiệu lực", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" };
    case "terminated":
      return { text: "Đã kết thúc", color: "bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300" };
    case "expired":
      return { text: "Đã quá hạn", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" };
    case "pending":
      return { text: "Chờ ký", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" };
    default:
      return { text: status, color: "bg-neutral-100 text-neutral-700" };
  }
};

export default function TenantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const tenantId = params.id as string;

  const [tenant, setTenant] = useState<TenantWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (tenantId && user?.id) {
      loadTenant();
    }
  }, [tenantId, user?.id]);

  const loadTenant = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await fetchOwnerTenantById(user.id, tenantId);
      setTenant(data);
    } catch (err) {
      console.error("Error loading tenant:", err);
      setTenant(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc chắn muốn xóa khách thuê này?")) return;

    setDeleting(true);
    try {
      const { success, error } = await deleteTenant(tenantId);
      if (success) {
        router.push("/operator/tenants");
      } else {
        alert(`Lỗi: ${error}`);
      }
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString?: string | null) =>
    dateString ? new Date(dateString).toLocaleDateString("vi-VN") : "—";

  const formatCurrency = (amount?: number) =>
    amount != null
      ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(amount)
      : "—";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-6000" />
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="space-y-4">
        <Link
          href="/operator/tenants"
          className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Quay lại danh sách
        </Link>
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-12 text-center">
          <p className="text-neutral-500">Không tìm thấy khách thuê.</p>
        </div>
      </div>
    );
  }

  const stayStatus = getStayStatusLabel(tenant.stay_status);
  const metadata = tenant.tenant_profile?.metadata || {};
  const gender = typeof metadata.gender === "string" ? GENDER_LABELS[metadata.gender] || metadata.gender : null;
  const occupation = typeof metadata.occupation === "string" ? metadata.occupation : null;
  const emergencyRelationship =
    typeof metadata.emergency_contact_relationship === "string"
      ? RELATIONSHIP_LABELS[metadata.emergency_contact_relationship] || metadata.emergency_contact_relationship
      : null;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link
            href="/operator/tenants"
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors mt-1"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary-6000/10 flex items-center justify-center text-primary-6000 font-bold text-xl shrink-0">
              {tenant.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">{tenant.name}</h1>
              <p className="text-sm text-neutral-500 mt-0.5">{tenant.phone}</p>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${stayStatus.color}`}>
                {stayStatus.text}
              </span>
            </div>
          </div>
        </div>

        {tenant.stay_status !== "renting" && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            <TrashIcon className="w-4 h-4" />
            {deleting ? "Đang xóa..." : "Xóa khách thuê"}
          </button>
        )}
      </div>

      {/* Contact & personal info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-5 space-y-4">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wide flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-neutral-400" />
            Thông tin cá nhân
          </h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-neutral-500 shrink-0">Ngày sinh</dt>
              <dd className="font-medium text-neutral-900 dark:text-white text-right">{formatDate(tenant.DoB)}</dd>
            </div>
            {gender && (
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-500 shrink-0">Giới tính</dt>
                <dd className="font-medium text-neutral-900 dark:text-white text-right">{gender}</dd>
              </div>
            )}
            {occupation && (
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-500 shrink-0">Nghề nghiệp</dt>
                <dd className="font-medium text-neutral-900 dark:text-white text-right">{occupation}</dd>
              </div>
            )}
            {tenant.tenant_profile?.hometown && (
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-500 shrink-0 flex items-center gap-1">
                  <MapPinIcon className="w-3.5 h-3.5" /> Quê quán
                </dt>
                <dd className="font-medium text-neutral-900 dark:text-white text-right">{tenant.tenant_profile.hometown}</dd>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <dt className="text-neutral-500 shrink-0">Đăng ký tạm trú</dt>
              <dd>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    tenant.has_temporary_residence
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                  }`}
                >
                  {tenant.has_temporary_residence ? "Đã đăng ký" : "Chưa đăng ký"}
                </span>
              </dd>
            </div>
          </dl>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-5 space-y-4">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wide flex items-center gap-2">
            <PhoneIcon className="w-4 h-4 text-neutral-400" />
            Liên hệ
          </h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-neutral-500 shrink-0">Số điện thoại</dt>
              <dd className="font-medium text-neutral-900 dark:text-white">
                <a href={`tel:${tenant.phone}`} className="hover:text-primary-6000">{tenant.phone}</a>
              </dd>
            </div>
            {tenant.email && (
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-500 shrink-0 flex items-center gap-1">
                  <EnvelopeIcon className="w-3.5 h-3.5" /> Email
                </dt>
                <dd className="font-medium text-neutral-900 dark:text-white text-right break-all">{tenant.email}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* ID card */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-5 space-y-4">
        <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wide flex items-center gap-2">
          <IdentificationIcon className="w-4 h-4 text-neutral-400" />
          Giấy tờ tùy thân
        </h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-neutral-500 mb-1">Số CCCD/CMND</dt>
            <dd className="font-semibold text-neutral-900 dark:text-white">
              {tenant.tenant_profile?.id_card_number || "Chưa có"}
            </dd>
          </div>
          <div>
            <dt className="text-neutral-500 mb-1">Ngày cấp</dt>
            <dd className="font-medium text-neutral-900 dark:text-white">
              {formatDate(tenant.tenant_profile?.id_card_issue_date)}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-neutral-500 mb-1">Nơi cấp</dt>
            <dd className="font-medium text-neutral-900 dark:text-white">
              {tenant.tenant_profile?.id_card_issue_place || "—"}
            </dd>
          </div>
        </dl>

        {(tenant.tenant_profile?.id_card_front_url || tenant.tenant_profile?.id_card_back_url) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {tenant.tenant_profile.id_card_front_url && (
              <div>
                <p className="text-xs text-neutral-500 mb-2">Mặt trước</p>
                <img
                  src={tenant.tenant_profile.id_card_front_url}
                  alt="CCCD mặt trước"
                  className="w-full max-h-48 object-contain rounded-lg border border-neutral-200 dark:border-neutral-700"
                />
              </div>
            )}
            {tenant.tenant_profile.id_card_back_url && (
              <div>
                <p className="text-xs text-neutral-500 mb-2">Mặt sau</p>
                <img
                  src={tenant.tenant_profile.id_card_back_url}
                  alt="CCCD mặt sau"
                  className="w-full max-h-48 object-contain rounded-lg border border-neutral-200 dark:border-neutral-700"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Emergency contact */}
      {(tenant.tenant_profile?.emergency_contact_name || tenant.tenant_profile?.emergency_contact_phone) && (
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-5 space-y-3">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wide">Liên hệ khẩn cấp</h3>
          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <dt className="text-neutral-500 mb-1">Họ tên</dt>
              <dd className="font-medium text-neutral-900 dark:text-white">
                {tenant.tenant_profile?.emergency_contact_name || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-neutral-500 mb-1">Quan hệ</dt>
              <dd className="font-medium text-neutral-900 dark:text-white">{emergencyRelationship || "—"}</dd>
            </div>
            <div>
              <dt className="text-neutral-500 mb-1">Số điện thoại</dt>
              <dd className="font-medium text-neutral-900 dark:text-white">
                {tenant.tenant_profile?.emergency_contact_phone ? (
                  <a href={`tel:${tenant.tenant_profile.emergency_contact_phone}`} className="hover:text-primary-6000">
                    {tenant.tenant_profile.emergency_contact_phone}
                  </a>
                ) : (
                  "—"
                )}
              </dd>
            </div>
          </dl>
        </div>
      )}

      {/* Current room */}
      {tenant.current_contract?.room_unit && (
        <div className="bg-primary-50 dark:bg-primary-950/20 rounded-xl border border-primary-100 dark:border-primary-900/30 p-5">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wide mb-3">
            Phòng đang thuê
          </h3>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="font-bold text-lg text-neutral-900 dark:text-white">
                {tenant.current_contract.room_unit.name}
              </p>
              <p className="text-sm text-neutral-500">{tenant.current_contract.room_unit.room?.title}</p>
              <p className="text-xs text-neutral-400 mt-0.5">{tenant.current_contract.room_unit.room?.address}</p>
              <p className="text-xs text-neutral-500 mt-2">
                HĐ: {formatDate(tenant.current_contract.start_date)} — {formatDate(tenant.current_contract.end_date)}
              </p>
            </div>
            <Link
              href={`/operator/contracts/${tenant.current_contract.id}`}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary-6000 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors shrink-0"
            >
              <DocumentTextIcon className="w-4 h-4" />
              Xem hợp đồng
            </Link>
          </div>
        </div>
      )}

      {/* Contract history */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-700">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wide">
            Lịch sử hợp đồng
          </h3>
        </div>
        {tenant.contract_history && tenant.contract_history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-neutral-500 uppercase bg-neutral-50 dark:bg-neutral-900/50">
                <tr>
                  <th className="px-5 py-3 font-semibold">Mã HĐ</th>
                  <th className="px-5 py-3 font-semibold">Phòng</th>
                  <th className="px-5 py-3 font-semibold">Thời hạn</th>
                  <th className="px-5 py-3 font-semibold">Giá thuê</th>
                  <th className="px-5 py-3 font-semibold">Trạng thái</th>
                  <th className="px-5 py-3 font-semibold text-right">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                {tenant.contract_history.map((c) => {
                  const cStatus = getContractStatusLabel(c.status);
                  return (
                    <tr key={c.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/30">
                      <td className="px-5 py-3 font-medium text-neutral-900 dark:text-white">
                        {c.contract_code || c.id.substring(0, 8)}
                      </td>
                      <td className="px-5 py-3 text-neutral-700 dark:text-neutral-300">
                        {c.room_unit?.room?.title || "—"}
                        {c.room_unit?.name ? ` — ${c.room_unit.name}` : ""}
                      </td>
                      <td className="px-5 py-3 text-neutral-600 dark:text-neutral-400 text-xs">
                        {formatDate(c.start_date)} — {formatDate(c.end_date)}
                      </td>
                      <td className="px-5 py-3 font-medium text-green-600">
                        {formatCurrency(c.rent_price ?? c.rent_amount)}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${cStatus.color}`}>
                          {cStatus.text}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link
                          href={`/operator/contracts/${c.id}`}
                          className="text-primary-6000 hover:text-primary-700 text-xs font-semibold"
                        >
                          Xem →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="px-5 py-8 text-center text-neutral-500 text-sm">Chưa có hợp đồng nào.</p>
        )}
      </div>
    </div>
  );
}
