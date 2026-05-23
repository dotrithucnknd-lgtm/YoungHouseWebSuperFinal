"use client";

import React, { useState, useEffect } from "react";
import { XMarkIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";
import { createInvoice } from "@/lib/landlordServices";

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ActiveContract {
  id: string;
  room_unit_id: string;
  rent_price: number;
  rent_amount?: number;
  electric_start_index: number;
  electric_price: number;
  electric_pricing_type: string;
  water_start_index: number;
  water_price: number;
  water_pricing_type: string;
  room_units?: {
    id: string;
    name: string;
    rooms?: {
      id: string;
      title: string;
    };
  };
  profiles?: {
    id: string;
    name: string;
    phone: string;
  };
}

interface InvoiceServiceItem {
  service_id: string;
  name: string;
  unit_price: number;
  unit: string;
  type: "fixed" | "variable";
  old_index?: number;
  new_index?: number;
  usage?: number;
  amount: number;
}

export default function CreateInvoiceModal({ isOpen, onClose, onSuccess }: CreateInvoiceModalProps) {
  const { user } = useAuth();
  const [contracts, setContracts] = useState<ActiveContract[]>([]);
  const [selectedContractId, setSelectedContractId] = useState("");
  const [selectedContract, setSelectedContract] = useState<ActiveContract | null>(null);

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Invoice items state
  const [rentItem, setRentItem] = useState({ name: "Tiền thuê phòng", amount: 0 });
  const [serviceItems, setServiceItems] = useState<InvoiceServiceItem[]>([]);
  const [customItems, setCustomItems] = useState<{ name: string; amount: number }[]>([]);

  // Custom item inputs
  const [customName, setCustomName] = useState("");
  const [customAmount, setCustomAmount] = useState("");

  useEffect(() => {
    if (isOpen && user?.id) {
      loadActiveContracts();
      // Set default due date to 5 days from now
      const defaultDue = new Date();
      defaultDue.setDate(defaultDue.getDate() + 5);
      setDueDate(defaultDue.toISOString().split("T")[0]);
      resetForm();
    }
  }, [isOpen, user]);

  const resetForm = () => {
    setSelectedContractId("");
    setSelectedContract(null);
    setMonth(new Date().getMonth() + 1);
    setYear(new Date().getFullYear());
    setNotes("");
    setRentItem({ name: "Tiền thuê phòng", amount: 0 });
    setServiceItems([]);
    setCustomItems([]);
    setCustomName("");
    setCustomAmount("");
  };

  const loadActiveContracts = async () => {
    try {
      const { data, error } = await supabase
        .from("contracts")
        .select(`
          id,
          room_unit_id,
          rent_price,
          rent_amount,
          electric_start_index,
          electric_price,
          electric_pricing_type,
          water_start_index,
          water_price,
          water_pricing_type,
          room_units (
            id,
            name,
            rooms (
              id,
              title
            )
          ),
          profiles:renter_id (
            id,
            name,
            phone
          )
        `)
        .eq("owner_id", user!.id)
        .eq("status", "active");

      if (error) throw error;
      const formattedContracts = (data || []).map((c: any) => ({
        ...c,
        room_units: Array.isArray(c.room_units) ? c.room_units[0] : c.room_units,
        profiles: Array.isArray(c.profiles) ? c.profiles[0] : c.profiles
      })) as unknown as ActiveContract[];
      setContracts(formattedContracts);
    } catch (err) {
      console.error("Error loading active contracts:", err);
    }
  };

  const handleContractChange = async (contractId: string) => {
    setSelectedContractId(contractId);
    if (!contractId) {
      setSelectedContract(null);
      setRentItem({ name: "Tiền thuê phòng", amount: 0 });
      setServiceItems([]);
      return;
    }

    setLoadingDetails(true);
    try {
      const contract = contracts.find(c => c.id === contractId);
      if (!contract) return;
      setSelectedContract(contract);

      const rentAmount = contract.rent_amount ?? contract.rent_price ?? 0;
      setRentItem({ name: "Tiền thuê phòng", amount: rentAmount });

      // 1. Fetch room unit services (Internet, Trash, Cleaning, etc.)
      const { data: unitServices } = await supabase
        .from("room_unit_services")
        .select(`
          service_id,
          services:service_id (
            id,
            name,
            unit_price,
            unit,
            type
          )
        `)
        .eq("room_unit_id", contract.room_unit_id);

      // 2. Fetch the latest invoice for this room unit to get previous index values (Old index)
      const { data: lastInvoices } = await supabase
        .from("invoices")
        .select(`
          id,
          invoice_items (
            service_id,
            new_index
          )
        `)
        .eq("room_unit_id", contract.room_unit_id)
        .order("created_at", { ascending: false })
        .limit(1);

      const lastInvoice = lastInvoices?.[0];

      // 3. Map services and resolve old index values
      const items: InvoiceServiceItem[] = [];

      if (unitServices) {
        for (const us of unitServices) {
          const service: any = us.services;
          if (!service) continue;

          let oldIndex = undefined;
          let newIndex = undefined;
          let usage = undefined;
          let amount = 0;

          if (service.type === "variable") {
            // Find old index from the last invoice
            const lastItem = lastInvoice?.invoice_items?.find(
              (item: any) => item.service_id === service.id
            );

            if (lastItem && typeof lastItem.new_index === "number") {
              oldIndex = lastItem.new_index;
            } else {
              // Fallback to contract starts
              const isElectric = service.name.toLowerCase().includes("điện") || service.name.toLowerCase().includes("electric");
              const isWater = service.name.toLowerCase().includes("nước") || service.name.toLowerCase().includes("water");

              if (isElectric) {
                oldIndex = contract.electric_start_index || 0;
              } else if (isWater) {
                oldIndex = contract.water_start_index || 0;
              } else {
                oldIndex = 0;
              }
            }
            newIndex = oldIndex;
            usage = 0;
            amount = 0;
          } else {
            // Fixed service cost
            amount = Number(service.unit_price) || 0;
          }

          items.push({
            service_id: service.id,
            name: service.name,
            unit_price: Number(service.unit_price) || 0,
            unit: service.unit || "",
            type: service.type as "fixed" | "variable",
            old_index: oldIndex,
            new_index: newIndex,
            usage: usage,
            amount: amount
          });
        }
      }

      // 4. If no Electric/Water services were assigned to the room unit but contract has electric/water pricing configured,
      // let's check if we should add them anyway!
      // This is extremely robust: it guarantees that electricity and water are always ready if contract has their pricing configured.
      const hasElectricService = items.some(item => item.name.toLowerCase().includes("điện"));
      const hasWaterService = items.some(item => item.name.toLowerCase().includes("nước"));

      // Let's query all owner services to find any existing Electric/Water services
      const { data: ownerServices } = await supabase
        .from("services")
        .select("*")
        .eq("owner_id", user!.id);

      if (ownerServices) {
        if (!hasElectricService && contract.electric_price > 0) {
          const electricService = ownerServices.find(s => s.name.toLowerCase().includes("điện"));
          if (electricService) {
            items.push(createVariableItemFromContract(electricService, "electric", contract, lastInvoice));
          }
        }
        if (!hasWaterService && contract.water_price > 0) {
          const waterService = ownerServices.find(s => s.name.toLowerCase().includes("nước"));
          if (waterService) {
            items.push(createVariableItemFromContract(waterService, "water", contract, lastInvoice));
          }
        }
      }

      setServiceItems(items);
    } catch (err) {
      console.error("Error loading contract details:", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const createVariableItemFromContract = (service: any, type: "electric" | "water", contract: ActiveContract, lastInvoice: any): InvoiceServiceItem => {
    let oldIndex = 0;
    const lastItem = lastInvoice?.invoice_items?.find((item: any) => item.service_id === service.id);

    if (lastItem && typeof lastItem.new_index === "number") {
      oldIndex = lastItem.new_index;
    } else {
      oldIndex = type === "electric" ? (contract.electric_start_index || 0) : (contract.water_start_index || 0);
    }

    const price = type === "electric" ? contract.electric_price : contract.water_price;

    return {
      service_id: service.id,
      name: service.name,
      unit_price: price || Number(service.unit_price) || 0,
      unit: service.unit || "",
      type: "variable",
      old_index: oldIndex,
      new_index: oldIndex,
      usage: 0,
      amount: 0
    };
  };

  const handleIndexChange = (index: number, val: string) => {
    const updated = [...serviceItems];
    const item = updated[index];
    const newIdx = parseFloat(val) || 0;
    item.new_index = newIdx;

    const usage = Math.max(0, newIdx - (item.old_index || 0));
    item.usage = usage;
    item.amount = usage * item.unit_price;

    setServiceItems(updated);
  };

  const addCustomItem = () => {
    if (!customName.trim() || !customAmount.trim()) return;
    setCustomItems(prev => [...prev, {
      name: customName.trim(),
      amount: parseFloat(customAmount) || 0
    }]);
    setCustomName("");
    setCustomAmount("");
  };

  const removeCustomItem = (index: number) => {
    setCustomItems(prev => prev.filter((_, idx) => idx !== index));
  };

  // Calculate totals
  const totalAmount = rentItem.amount +
    serviceItems.reduce((sum, item) => sum + item.amount, 0) +
    customItems.reduce((sum, item) => sum + item.amount, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContractId || !selectedContract) {
      alert("Vui lòng chọn hợp đồng/phòng trọ");
      return;
    }
    if (!dueDate) {
      alert("Vui lòng nhập hạn thanh toán");
      return;
    }

    setLoading(true);
    try {
      const invoiceData = {
        room_unit_id: selectedContract.room_unit_id,
        contract_id: selectedContract.id,
        month: month,
        year: year,
        total_amount: totalAmount,
        status: "unpaid" as const,
        due_date: dueDate,
        notes: notes.trim() || null
      };

      // Map invoice items
      const items: any[] = [];

      // Rent item is mapped to a custom item or service if necessary (we can insert it under a custom or rent category)
      // Since invoice_items requires a service_id, we can either look up a "Rent Room" service,
      // or if it's purely a direct record, we insert all services and save the base rent inside total_amount.
      // Wait, let's look up if there is a "Tiền phòng / Room Rent" service or if we should add it as an item!
      // In landlords database, usually all invoice costs are registered in invoice_items so it's fully transparent.
      // Let's see: we can look up if there is a Rent Room service, or we just insert the serviceItems as invoice_items.
      // Rent itself is already stored in the `total_amount` of the invoice, but transparently displaying it is superb.
      // Let's insert all the serviceItems into invoice_items!
      const itemsToInsert = serviceItems.map(item => ({
        service_id: item.service_id,
        old_index: item.old_index ?? null,
        new_index: item.new_index ?? null,
        usage: item.usage ?? null,
        unit_price: item.unit_price,
        amount: item.amount
      }));

      // If there are custom items, let's see if we should save them (custom items are part of the total_amount but don't strictly require invoice_items service references, or we can skip them in items or add them if there's a custom service id)
      // We will save the invoice and the service items!
      const { data, error } = await createInvoice(invoiceData, itemsToInsert);

      if (error) throw new Error(error);

      alert("Tạo hóa đơn thành công!");
      onSuccess();
      onClose();
    } catch (err: any) {
      alert("Lỗi: " + (err.message || "Không thể tạo hóa đơn"));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-neutral-800 rounded-2xl w-full max-w-3xl border border-neutral-200 dark:border-neutral-700 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in duration-200">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50">
          <div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Tạo hóa đơn mới</h3>
            <p className="text-xs text-neutral-500 mt-1">Lập hóa đơn thanh toán hàng tháng cho phòng trọ</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-full transition-colors text-neutral-500 dark:text-neutral-400">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Left Side - Basic Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Chọn Hợp đồng / Phòng trọ <span className="text-red-500">*</span></label>
                <select
                  required
                  value={selectedContractId}
                  onChange={(e) => handleContractChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">Chọn phòng trọ đang thuê</option>
                  {contracts.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.room_units?.rooms?.title} - {c.room_units?.name} ({c.profiles?.name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Tháng <span className="text-red-500">*</span></label>
                  <select
                    value={month}
                    onChange={(e) => setMonth(parseInt(e.target.value))}
                    className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                      <option key={m} value={m}>Tháng {m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Năm <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    required
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value) || new Date().getFullYear())}
                    className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Hạn thanh toán <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Ghi chú hóa đơn</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ví dụ: Tiền phòng + Điện nước tháng 5"
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Right Side - Tenant Info & Totals Summary */}
            <div className="bg-neutral-50 dark:bg-neutral-900/40 p-5 rounded-xl border border-neutral-200 dark:border-neutral-700/80 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-neutral-800 dark:text-neutral-200 text-sm uppercase tracking-wider mb-3">Thông tin khách thuê</h4>
                {selectedContract ? (
                  <div className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
                    <p><span className="font-medium text-neutral-800 dark:text-neutral-200">Khách thuê:</span> {selectedContract.profiles?.name}</p>
                    <p><span className="font-medium text-neutral-800 dark:text-neutral-200">Số điện thoại:</span> {selectedContract.profiles?.phone}</p>
                    <p><span className="font-medium text-neutral-800 dark:text-neutral-200">Phòng:</span> {selectedContract.room_units?.name} - {selectedContract.room_units?.rooms?.title}</p>
                    <p><span className="font-medium text-neutral-800 dark:text-neutral-200">Giá thuê gốc:</span> {Number(selectedContract.rent_amount ?? selectedContract.rent_price).toLocaleString("vi-VN")}đ</p>
                  </div>
                ) : (
                  <p className="text-sm text-neutral-400 italic">Vui lòng chọn phòng trọ để hiển thị thông tin chi tiết</p>
                )}
              </div>

              <div className="border-t border-neutral-200 dark:border-neutral-700/60 pt-4 mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-neutral-500">Tiền thuê phòng:</span>
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">{rentItem.amount.toLocaleString("vi-VN")}đ</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-neutral-500">Tổng phí dịch vụ:</span>
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                    {serviceItems.reduce((sum, item) => sum + item.amount, 0).toLocaleString("vi-VN")}đ
                  </span>
                </div>
                {customItems.length > 0 && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-neutral-500">Chi phí khác:</span>
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                      {customItems.reduce((sum, item) => sum + item.amount, 0).toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center border-t border-dashed border-neutral-300 dark:border-neutral-700 pt-3 mt-3">
                  <span className="text-base font-bold text-neutral-900 dark:text-white">Tổng cộng hóa đơn:</span>
                  <span className="text-xl font-extrabold text-green-600 dark:text-green-400">
                    {totalAmount.toLocaleString("vi-VN")}đ
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Dịch vụ sử dụng (Variable and Fixed Services) */}
          {selectedContract && (
            <div className="border-t border-neutral-200 dark:border-neutral-700 pt-6 space-y-4">
              <h4 className="font-bold text-neutral-900 dark:text-white text-base">Chi tiết các dịch vụ sử dụng</h4>

              {loadingDetails ? (
                <div className="flex items-center justify-center py-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  <span className="ml-3 text-sm text-neutral-500">Đang tải chi tiết dịch vụ...</span>
                </div>
              ) : serviceItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {serviceItems.map((item, index) => (
                    <div key={item.service_id} className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-900/10 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-neutral-900 dark:text-white">{item.name}</p>
                          <p className="text-xs text-neutral-500">Đơn giá: {item.unit_price.toLocaleString("vi-VN")}đ / {item.unit}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-xxs font-semibold uppercase tracking-wider ${item.type === "variable" ? "bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400" : "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
                          }`}>
                          {item.type === "variable" ? "Theo chỉ số" : "Cố định"}
                        </span>
                      </div>

                      {item.type === "variable" ? (
                        <div className="grid grid-cols-3 gap-2 items-center">
                          <div>
                            <label className="block text-xxs text-neutral-400 mb-0.5 uppercase tracking-wide">Chỉ số cũ</label>
                            <input
                              type="number"
                              disabled
                              value={item.old_index || 0}
                              className="w-full px-2 py-1 text-xs rounded border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-neutral-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xxs text-neutral-400 mb-0.5 uppercase tracking-wide">Chỉ số mới</label>
                            <input
                              type="number"
                              required
                              value={item.new_index ?? ""}
                              onChange={(e) => handleIndexChange(index, e.target.value)}
                              placeholder="Nhập số"
                              className="w-full px-2 py-1 text-xs rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div className="text-right">
                            <span className="block text-xxs text-neutral-400 mb-0.5 uppercase tracking-wide">Thành tiền</span>
                            <span className="font-bold text-xs text-neutral-800 dark:text-neutral-200">
                              {item.amount.toLocaleString("vi-VN")}đ
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center text-xs text-neutral-600 dark:text-neutral-400 pt-2 border-t border-neutral-200/50 dark:border-neutral-700/50">
                          <span>Chi phí cố định hàng tháng:</span>
                          <span className="font-bold text-neutral-800 dark:text-neutral-200">
                            {item.amount.toLocaleString("vi-VN")}đ
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-neutral-400 italic">Không tìm thấy thông tin dịch vụ nào liên kết với phòng trọ này.</p>
              )}
            </div>
          )}

          {/* Chi phí phát sinh khác (Custom Invoice items) */}
          {selectedContract && (
            <div className="border-t border-neutral-200 dark:border-neutral-700 pt-6 space-y-4">
              <h4 className="font-bold text-neutral-900 dark:text-white text-base">Phụ thu / Chi phí phát sinh khác</h4>

              {/* Custom items list */}
              {customItems.length > 0 && (
                <div className="space-y-2">
                  {customItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-red-50/20 dark:bg-red-950/5 border border-red-200/40 dark:border-red-950/20 px-4 py-2 rounded-lg text-sm">
                      <span className="font-medium text-neutral-800 dark:text-neutral-200">{item.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-neutral-900 dark:text-white">+{item.amount.toLocaleString("vi-VN")}đ</span>
                        <button type="button" onClick={() => removeCustomItem(idx)} className="text-red-500 hover:text-red-700 transition-colors p-1 hover:bg-red-100/50 rounded-full">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add custom item inputs */}
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Tên chi phí phát sinh (ví dụ: Phạt quá hạn, Đền bù đồ vỡ...)"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="flex-1 px-4 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-1 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Số tiền (đ)"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-32 px-4 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={addCustomItem}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-200 rounded-lg text-sm font-medium transition-colors"
                >
                  Thêm phí
                </button>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/10 -mx-6 -mb-6 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || !selectedContractId}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-all shadow-sm flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Đang lập hóa đơn...
                </>
              ) : (
                "Lưu và phát hành"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
