"use client";

import React, { useState, useEffect } from "react";
import { MagnifyingGlassIcon, PlusIcon, DocumentIcon, EyeIcon, PencilSquareIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { terminateContract } from "@/lib/landlordServices";
import { fetchRooms } from "@/lib/supabaseServices";
import { sortByTitle } from "@/utils/sortProperties";

interface Contract {
  id: string;
  contract_code: string;
  room_id: string;
  room_unit_id?: string;
  start_date: string;
  end_date: string;
  actual_end_date: string | null;
  rent_price: number;
  deposit: number;
  beds: number;
  payment_cycle: string;
  status: string;
  created_at: string;
  rooms?: { title: string; address: string };
  room_units?: { name: string };
  profiles?: { name: string; phone: string };
}

export default function ContractsPage() {
  const { user } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [filterProperty, setFilterProperty] = useState("all");
  const [properties, setProperties] = useState<{ id: string; title: string }[]>([]);

  useEffect(() => {
    if (user?.id) {
      loadContracts();
      loadProperties();
    }
  }, [user]);

  const loadProperties = async () => {
    if (!user?.id) return;
    try {
      const rooms = await fetchRooms();
      const ownerProperties = rooms.filter(
        (p) =>
          p.author.id === user.id ||
          user.role === "admin" ||
          user.role === "manager" ||
          user.role === "operator"
      );
      setProperties(
        sortByTitle(ownerProperties.map((p) => ({ id: String(p.id), title: p.title })))
      );
    } catch (err) {
      console.error("Error loading properties:", err);
    }
  };

  const loadContracts = async () => {
    if (!user?.id) return;
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
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setContracts(data || []);
    } catch (err) {
      console.error("Error loading contracts:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active": return { text: "Đang hiệu lực", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" };
      case "expiring": return { text: "Sắp hết hạn", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" };
      case "expired": return { text: "Đã quá hạn", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" };
      case "terminated": return { text: "Đã kết thúc", color: "bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300" };
      case "pending": return { text: "Chờ ký", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" };
      default: return { text: status, color: "bg-neutral-100 text-neutral-700" };
    }
  };

  const propertyFilteredContracts = contracts.filter(
    (c) => filterProperty === "all" || c.room_id === filterProperty
  );

  const filteredContracts = propertyFilteredContracts.filter((c) => {
    const matchTab = activeTab === "all" || c.status === activeTab;
    const matchSearch =
      !searchTerm.trim() ||
      c.contract_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.rooms?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.room_units?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.profiles?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchTab && matchSearch;
  });

  const tabCounts = {
    all: propertyFilteredContracts.length,
    active: propertyFilteredContracts.filter((c) => c.status === "active").length,
    expiring: propertyFilteredContracts.filter((c) => c.status === "expiring").length,
    expired: propertyFilteredContracts.filter((c) => c.status === "expired").length,
    terminated: propertyFilteredContracts.filter((c) => c.status === "terminated").length,
  };

  const tabs = [
    { id: "all", label: "Tất cả", count: tabCounts.all, color: "bg-blue-600" },
    { id: "active", label: "Đang hiệu lực", count: tabCounts.active, color: "bg-green-500" },
    { id: "expiring", label: "Sắp hết hạn", count: tabCounts.expiring, color: "bg-yellow-500" },
    { id: "expired", label: "Đã quá hạn", count: tabCounts.expired, color: "bg-red-500" },
    { id: "terminated", label: "Đã kết thúc", count: tabCounts.terminated, color: "bg-neutral-500" },
  ];

  const handleEndContract = async (contractId: string) => {
    if (!confirm("Bạn có chắc muốn kết thúc hợp đồng này?")) return;
    const { error } = await terminateContract(contractId);
    if (error) alert("Lỗi: " + error);
    else loadContracts();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">Quản lý hợp đồng</h1>
          <p className="text-sm text-neutral-500 mt-1">Lập và theo dõi hợp đồng thuê phòng</p>
        </div>
        <Link href="/operator/contracts/new"
          className="flex items-center justify-center gap-2 px-4 py-2 bg-primary-6000 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
          <PlusIcon className="w-5 h-5" />
          Lập hợp đồng mới
        </Link>
      </div>

      {/* Filter */}
      <div className="bg-white dark:bg-neutral-800 p-5 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input type="text" placeholder="Tìm mã HĐ, tên khách, tên phòng..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <select
            className="px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm font-medium focus:ring-2 focus:ring-primary-500 sm:min-w-[200px]"
            value={filterProperty}
            onChange={(e) => setFilterProperty(e.target.value)}
          >
            <option value="all">Tất cả nhà trọ</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-3">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === tab.id ? "bg-primary-6000 text-white" : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 hover:border-primary-6000 hover:text-primary-6000"
              }`}>
              {tab.label}
              <span className={`px-2 py-0.5 rounded-full text-xs text-white ${tab.color}`}>{tab.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-neutral-500 uppercase bg-neutral-50 dark:bg-neutral-900/50 border-b border-neutral-200 dark:border-neutral-700">
              <tr>
                <th className="px-6 py-4 font-semibold">Mã HĐ</th>
                <th className="px-6 py-4 font-semibold">Phòng</th>
                <th className="px-6 py-4 font-semibold">Khách thuê</th>
                <th className="px-6 py-4 font-semibold">Giá thuê</th>
                <th className="px-6 py-4 font-semibold">Ngày bắt đầu</th>
                <th className="px-6 py-4 font-semibold">Ngày hết hạn</th>
                <th className="px-6 py-4 font-semibold">Trạng thái</th>
                <th className="px-6 py-4 font-semibold text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {filteredContracts.length > 0 ? (
                filteredContracts.map((contract) => {
                  const status = getStatusLabel(contract.status);
                  return (
                    <tr key={contract.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50">
                      <td className="px-6 py-4 font-medium text-neutral-900 dark:text-white">{contract.contract_code || contract.id.substring(0, 8)}</td>
                      <td className="px-6 py-4 text-neutral-700 dark:text-neutral-300">
                        {contract.rooms?.title || "N/A"}
                        {contract.room_units?.name ? ` - ${contract.room_units.name}` : ""}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-neutral-900 dark:text-white">{contract.profiles?.name || "N/A"}</p>
                          <p className="text-xs text-neutral-500">{contract.profiles?.phone || ""}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-green-600">{Number(contract.rent_price).toLocaleString("vi-VN")}đ</td>
                      <td className="px-6 py-4 text-neutral-700 dark:text-neutral-300">{new Date(contract.start_date).toLocaleDateString("vi-VN")}</td>
                      <td className="px-6 py-4 text-neutral-700 dark:text-neutral-300">{new Date(contract.end_date).toLocaleDateString("vi-VN")}</td>
                      <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>{status.text}</span></td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {contract.status === "active" && (
                            <button onClick={() => handleEndContract(contract.id)}
                              className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30">
                              Kết thúc
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center text-neutral-500">
                    <DocumentIcon className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
                    <p>Chưa có hợp đồng nào được lập.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card List */}
      <div className="md:hidden space-y-3">
        {filteredContracts.length > 0 ? (
          filteredContracts.map((contract) => {
            const status = getStatusLabel(contract.status);
            return (
              <div key={contract.id} className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm p-4">
                {/* Header row: room + status badge */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 mr-3">
                    <p className="font-bold text-neutral-900 dark:text-white text-base truncate">
                      {contract.rooms?.title || "N/A"}{contract.room_units?.name ? ` - ${contract.room_units.name}` : ""}
                    </p>
                    <p className="text-xs text-neutral-500 mt-0.5">Mã HĐ: {contract.contract_code || contract.id.substring(0, 8)}</p>
                  </div>
                  <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ${status.color}`}>{status.text}</span>
                </div>

                {/* Renter info */}
                <div className="flex items-center gap-2 mb-3 p-2.5 bg-neutral-50 dark:bg-neutral-900/40 rounded-lg">
                  <div className="w-7 h-7 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                    <EyeIcon className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">{contract.profiles?.name || "N/A"}</p>
                    <p className="text-xs text-neutral-500">{contract.profiles?.phone || ""}</p>
                  </div>
                </div>

                {/* Dates + Rent */}
                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div>
                    <p className="text-neutral-400 mb-0.5">Bắt đầu</p>
                    <p className="font-medium text-neutral-800 dark:text-neutral-200">{new Date(contract.start_date).toLocaleDateString("vi-VN")}</p>
                  </div>
                  <div>
                    <p className="text-neutral-400 mb-0.5">Hết hạn</p>
                    <p className="font-medium text-neutral-800 dark:text-neutral-200">{new Date(contract.end_date).toLocaleDateString("vi-VN")}</p>
                  </div>
                </div>

                {/* Footer: rent + action */}
                <div className="flex items-center justify-between border-t border-neutral-100 dark:border-neutral-700 pt-3">
                  <p className="text-lg font-extrabold text-green-600">{Number(contract.rent_price).toLocaleString("vi-VN")}đ<span className="text-xs font-normal text-neutral-400">/tháng</span></p>
                  {contract.status === "active" && (
                    <button onClick={() => handleEndContract(contract.id)}
                      className="px-3 py-2 text-xs font-medium text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                      Kết thúc HĐ
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-12 text-center">
            <DocumentIcon className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
            <p className="text-neutral-500">Chưa có hợp đồng nào được lập.</p>
          </div>
        )}
      </div>

    </div>
  );
}


