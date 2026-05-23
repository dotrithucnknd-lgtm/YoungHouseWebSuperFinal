"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeftIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";
import { createInvoice } from "@/lib/landlordServices";

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
  included: boolean;
}

function NewInvoiceForm() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlContractId = searchParams.get("contract_id");

  const [contracts, setContracts] = useState<ActiveContract[]>([]);
  const [selectedContractId, setSelectedContractId] = useState("");
  const [selectedContract, setSelectedContract] = useState<ActiveContract | null>(null);
  
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [dueDate, setDueDate] = useState("");
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
    if (user?.id) {
      loadActiveContracts();
      
      // Set default due date to 5 days from now
      const defaultDue = new Date();
      defaultDue.setDate(defaultDue.getDate() + 5);
      setDueDate(defaultDue.toISOString().split("T")[0]);
    }
  }, [user]);

  // Once contracts are loaded, auto-select if contract_id is in URL
  useEffect(() => {
    if (contracts.length > 0 && urlContractId) {
      const exists = contracts.some(c => c.id === urlContractId);
      if (exists) {
        handleContractChange(urlContractId);
      }
    }
  }, [contracts, urlContractId]);

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
      if (!contract) {
        // If contract not yet in local contracts array (e.g. initial URL load before contracts fetch finishes),
        // let's fetch it directly
        const { data: directContract, error } = await supabase
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
          .eq("id", contractId)
          .single();

        if (error || !directContract) return;
        const formattedDirectContract = {
          ...directContract,
          room_units: Array.isArray(directContract.room_units) ? directContract.room_units[0] : directContract.room_units,
          profiles: Array.isArray(directContract.profiles) ? directContract.profiles[0] : directContract.profiles
        } as unknown as ActiveContract;
        setSelectedContract(formattedDirectContract);
        loadServiceDetails(formattedDirectContract);
      } else {
        setSelectedContract(contract);
        loadServiceDetails(contract);
      }
    } catch (err) {
      console.error("Error loading contract change details:", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const loadServiceDetails = async (contract: ActiveContract) => {
    const rentAmount = contract.rent_amount ?? contract.rent_price ?? 0;
    setRentItem({ name: "Tiền thuê phòng", amount: rentAmount });

    // 1. Fetch room unit services
    const { data: unitServices } = await supabase
      .from("room_unit_services")
      .select("service_id")
      .eq("room_unit_id", contract.room_unit_id);

    const unitServiceIds = new Set(unitServices?.map(us => us.service_id) || []);

    // 2. Fetch all building/common services of the owner
    let { data: ownerServices } = await supabase
      .from("services")
      .select("*")
      .eq("owner_id", user!.id)
      .order("name");

    if (!ownerServices) ownerServices = [];

    // Ensure standard Electricity & Water services exist
    let hasElectric = ownerServices.some(s => s.name.toLowerCase().includes("điện") || s.name.toLowerCase().includes("electric"));
    if (!hasElectric && contract.electric_price > 0) {
      const { data: newS, error: sErr } = await supabase
        .from("services")
        .insert({
          owner_id: user!.id,
          name: "Điện",
          unit_price: contract.electric_price,
          unit: "kWh",
          type: "variable"
        })
        .select()
        .single();
      if (!sErr && newS) {
        ownerServices.push(newS);
      }
    }

    let hasWater = ownerServices.some(s => s.name.toLowerCase().includes("nước") || s.name.toLowerCase().includes("water"));
    if (!hasWater && contract.water_price > 0) {
      const { data: newW, error: wErr } = await supabase
        .from("services")
        .insert({
          owner_id: user!.id,
          name: "Nước",
          unit_price: contract.water_price,
          unit: "m3",
          type: "variable"
        })
        .select()
        .single();
      if (!wErr && newW) {
        ownerServices.push(newW);
      }
    }

    // 3. Fetch the latest invoice for this room unit to resolve previous index
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

    // 4. Map ALL building/operator services to the invoice items state
    const items: InvoiceServiceItem[] = [];

    for (const service of ownerServices) {
      let oldIndex = undefined;
      let newIndex = undefined;
      let usage = undefined;
      let amount = 0;

      const isElectric = service.name.toLowerCase().includes("điện") || service.name.toLowerCase().includes("electric");
      const isWater = service.name.toLowerCase().includes("nước") || service.name.toLowerCase().includes("water");

      // A service is included by default if:
      // - It is explicitly linked to the room unit in room_unit_services
      // - OR it is a standard service (Điện, Nước) and contract has its price configured
      const isLinkedToUnit = unitServiceIds.has(service.id);
      const isDefaultVariable = (isElectric && contract.electric_price > 0) || (isWater && contract.water_price > 0);
      const included = isLinkedToUnit || isDefaultVariable;

      let unitPrice = Number(service.unit_price) || 0;
      if (isElectric && contract.electric_price > 0) {
        unitPrice = contract.electric_price;
      } else if (isWater && contract.water_price > 0) {
        unitPrice = contract.water_price;
      }

      if (service.type === "variable") {
        // Resolve old index from last invoice
        const lastItem = lastInvoice?.invoice_items?.find(
          (item: any) => item.service_id === service.id
        );

        if (lastItem && typeof lastItem.new_index === "number") {
          oldIndex = lastItem.new_index;
        } else {
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
        amount = unitPrice;
      }

      items.push({
        service_id: service.id,
        name: service.name,
        unit_price: unitPrice,
        unit: service.unit || "",
        type: service.type as "fixed" | "variable",
        old_index: oldIndex,
        new_index: newIndex,
        usage: usage,
        amount: amount,
        included: included
      });
    }

    setServiceItems(items);
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
      amount: 0,
      included: true
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

  const toggleServiceIncluded = (index: number) => {
    const updated = [...serviceItems];
    updated[index].included = !updated[index].included;
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
    serviceItems.reduce((sum, item) => sum + (item.included ? item.amount : 0), 0) + 
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
        due_date: dueDate
      };

      const itemsToInsert = serviceItems
        .filter(item => item.included)
        .map(item => ({
          service_id: item.service_id,
          old_index: item.old_index ?? null,
          new_index: item.new_index ?? null,
          usage: item.usage ?? null,
          unit_price: item.unit_price,
          amount: item.amount
        }));

      const { error } = await createInvoice(invoiceData, itemsToInsert);
      
      if (error) throw new Error(error);

      alert("Tạo hóa đơn thành công!");
      router.push("/operator/invoices");
    } catch (err: any) {
      alert("Lỗi: " + (err.message || "Không thể tạo hóa đơn"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Breadcrumb Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/operator/invoices")}
          className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors text-neutral-500 dark:text-neutral-400"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Lập hóa đơn thanh toán mới</h1>
          <p className="text-sm text-neutral-500 mt-1">Lập bảng thanh toán định kỳ tiền phòng, điện nước và phụ thu dịch vụ hàng tháng</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Form Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Box 1: Select Room and Period */}
            <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-sm space-y-4">
              <h3 className="font-bold text-neutral-900 dark:text-white text-base">Thông tin phòng & kỳ thanh toán</h3>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Chọn Hợp đồng / Phòng trọ <span className="text-red-500">*</span></label>
                <select
                  required
                  value={selectedContractId}
                  onChange={(e) => handleContractChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">Chọn phòng trọ đang có hợp đồng thuê hoạt động</option>
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
                    className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white"
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
                    className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white"
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
                  className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

            </div>

            {/* Dịch vụ sử dụng */}
            {selectedContract && (
              <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 dark:border-neutral-700 pb-3">
                  <div>
                    <h3 className="font-bold text-neutral-900 dark:text-white text-base">Chi tiết chỉ số & dịch vụ sử dụng</h3>
                    <p className="text-xs text-neutral-500 mt-0.5">Tích chọn để áp dụng các dịch vụ tòa nhà/phòng trọ này vào hóa đơn</p>
                  </div>
                </div>
                
                {loadingDetails ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span className="ml-3 text-sm text-neutral-500 font-medium">Đang tự động tra cứu chỉ số dịch vụ...</span>
                  </div>
                ) : serviceItems.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {serviceItems.map((item, index) => (
                      <div
                        key={item.service_id}
                        className={`p-4 rounded-xl border transition-all duration-200 ${
                          item.included
                            ? "border-blue-200 bg-blue-50/10 dark:border-blue-900/30 dark:bg-blue-900/5 shadow-sm"
                            : "border-neutral-200 bg-neutral-50/30 dark:border-neutral-700/50 dark:bg-neutral-900/5 opacity-60"
                        } space-y-3`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              id={`svc-${item.service_id}`}
                              checked={item.included}
                              onChange={() => toggleServiceIncluded(index)}
                              className="w-4 h-4 text-blue-600 border-neutral-300 rounded focus:ring-blue-500 cursor-pointer accent-blue-600"
                            />
                            <label
                              htmlFor={`svc-${item.service_id}`}
                              className={`font-semibold cursor-pointer select-none ${
                                item.included ? "text-neutral-900 dark:text-white" : "text-neutral-400 dark:text-neutral-500"
                              }`}
                            >
                              {item.name}
                            </label>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded text-xxs font-semibold uppercase tracking-wider ${
                            item.type === "variable" ? "bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400" : "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
                          }`}>
                            {item.type === "variable" ? "Theo số" : "Cố định"}
                          </span>
                        </div>

                        {item.included ? (
                          <>
                            <div className="text-xs text-neutral-500 pb-1.5 border-b border-neutral-100 dark:border-neutral-800">
                              Đơn giá: {item.unit_price.toLocaleString("vi-VN")}đ / {item.unit}
                            </div>
                            {item.type === "variable" ? (
                              <div className="grid grid-cols-3 gap-2 items-center">
                                <div>
                                  <label className="block text-xxs text-neutral-400 mb-0.5 uppercase tracking-wide">Số cũ</label>
                                  <input
                                    type="number"
                                    disabled
                                    value={item.old_index || 0}
                                    className="w-full px-2 py-1.5 text-xs rounded border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-neutral-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xxs text-neutral-400 mb-0.5 uppercase tracking-wide">Số mới</label>
                                  <input
                                    type="number"
                                    required={item.included}
                                    value={item.new_index ?? ""}
                                    onChange={(e) => handleIndexChange(index, e.target.value)}
                                    placeholder="Nhập chỉ số"
                                    className="w-full px-2 py-1.5 text-xs rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-transparent"
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
                              <div className="flex justify-between items-center text-xs text-neutral-600 dark:text-neutral-400 pt-1">
                                <span>Phí cố định hàng tháng:</span>
                                <span className="font-bold text-neutral-800 dark:text-neutral-200">
                                  {item.amount.toLocaleString("vi-VN")}đ
                                </span>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-xs text-neutral-400 italic">
                            Chưa áp dụng cho hóa đơn này (Click chọn để bật)
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-neutral-400 italic">Không có dịch vụ đi kèm nào được tìm thấy trong hệ thống tòa nhà.</p>
                )}
              </div>
            )}

            {/* Chi phí phát sinh */}
            {selectedContract && (
              <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-sm space-y-4">
                <h3 className="font-bold text-neutral-900 dark:text-white text-base">Khoản thu khác / Phụ thu phát sinh</h3>
                
                {customItems.length > 0 && (
                  <div className="space-y-2">
                    {customItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-red-50/20 dark:bg-red-950/5 border border-red-200/40 dark:border-red-950/20 px-4 py-2.5 rounded-lg text-sm animate-in slide-in-from-top-1 duration-150">
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

                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Ví dụ: Phạt đóng muộn, Đền bù đồ dùng..."
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
                    className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-200 rounded-lg text-sm font-semibold transition-colors"
                  >
                    Thêm phí
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Summary & Actions */}
          <div className="space-y-6">
            
            {/* Tenant and Room Details */}
            <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-sm space-y-4">
              <h3 className="font-bold text-neutral-800 dark:text-neutral-200 text-xs uppercase tracking-wider">Thông tin thanh toán</h3>
              
              {selectedContract ? (
                <div className="space-y-3 text-sm border-b border-neutral-100 dark:border-neutral-700/50 pb-4">
                  <div>
                    <span className="block text-xxs text-neutral-400 uppercase tracking-wider font-semibold">Khách đại diện</span>
                    <span className="font-bold text-neutral-900 dark:text-white text-base">{selectedContract.profiles?.name}</span>
                  </div>
                  <div>
                    <span className="block text-xxs text-neutral-400 uppercase tracking-wider font-semibold">Số điện thoại</span>
                    <span className="text-neutral-700 dark:text-neutral-300 font-medium">{selectedContract.profiles?.phone}</span>
                  </div>
                  <div>
                    <span className="block text-xxs text-neutral-400 uppercase tracking-wider font-semibold">Phòng & Tòa nhà</span>
                    <span className="text-neutral-700 dark:text-neutral-300 font-semibold">{selectedContract.room_units?.name} - {selectedContract.room_units?.rooms?.title}</span>
                  </div>
                  <div>
                    <span className="block text-xxs text-neutral-400 uppercase tracking-wider font-semibold">Giá phòng gốc</span>
                    <span className="text-neutral-700 dark:text-neutral-300 font-semibold">{Number(selectedContract.rent_amount ?? selectedContract.rent_price).toLocaleString("vi-VN")}đ / tháng</span>
                  </div>
                </div>
              ) : (
                <div className="py-4 border-b border-neutral-100 dark:border-neutral-700/50">
                  <p className="text-sm text-neutral-400 italic">Vui lòng chọn phòng để tự động điền thông tin</p>
                </div>
              )}

              {/* Bill totals */}
              <div className="space-y-2.5 pt-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-neutral-500">Tiền phòng:</span>
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">{rentItem.amount.toLocaleString("vi-VN")}đ</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-neutral-500">Tổng phí dịch vụ:</span>
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                    {serviceItems.reduce((sum, item) => sum + item.amount, 0).toLocaleString("vi-VN")}đ
                  </span>
                </div>
                {customItems.length > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-neutral-500">Phụ thu khác:</span>
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                      {customItems.reduce((sum, item) => sum + item.amount, 0).toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between items-center border-t border-dashed border-neutral-200 dark:border-neutral-700 pt-4 mt-2">
                  <span className="text-base font-extrabold text-neutral-900 dark:text-white">CẦN THANH TOÁN:</span>
                  <span className="text-xl font-black text-green-600 dark:text-green-400">
                    {totalAmount.toLocaleString("vi-VN")}đ
                  </span>
                </div>
              </div>
            </div>

            {/* Actions button */}
            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={loading || !selectedContractId}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Đang lập hóa đơn...
                  </>
                ) : (
                  "Lưu và Phát hành Hóa đơn"
                )}
              </button>
              <button
                type="button"
                onClick={() => router.push("/operator/invoices")}
                className="w-full py-3 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-xl font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-center"
              >
                Quay lại danh sách
              </button>
            </div>

          </div>

        </div>
      </form>
    </div>
  );
}

export default function NewInvoicePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    }>
      <NewInvoiceForm />
    </Suspense>
  );
}


