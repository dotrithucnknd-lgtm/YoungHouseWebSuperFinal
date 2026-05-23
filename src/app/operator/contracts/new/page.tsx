"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { uploadImage } from "@/lib/supabaseServices";

export default function NewContractPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [roomUnits, setRoomUnits] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);

  const [form, setForm] = useState({
    room_id: "",
    room_unit_id: "",
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    rent_price: "",
    deposit: "",
    beds: "1",
    payment_cycle: "1_month",
    utilities_included: false,
    electric_start_index: "0",
    electric_price: "0",
    electric_pricing_type: "per_index",
    water_start_index: "0",
    water_price: "0",
    water_pricing_type: "per_index",
    notes: "",
  });

  const [selectedTenants, setSelectedTenants] = useState<string[]>([]);
  const [meterPhoto, setMeterPhoto] = useState<File | null>(null);
  const [meterPreview, setMeterPreview] = useState("");

  useEffect(() => {
    if (user?.id) { loadRoomUnits(); loadTenants(); }
  }, [user]);

  const loadRoomUnits = async () => {
    const { data } = await supabase
      .from("room_units")
      .select(`
        id,
        name,
        rent_price,
        deposit,
        beds,
        payment_cycle,
        rooms!inner (
          id,
          title,
          address,
          owner_id
        )
      `)
      .eq("rooms.owner_id", user!.id)
      .order("name");

    const units = data || [];
    setRoomUnits(units);

    // Read room_unit_id from query parameters if pre-selected
    const params = new URLSearchParams(window.location.search);
    const preselectedId = params.get("room_unit_id");
    if (preselectedId && units.length > 0) {
      handleRoomUnitChange(preselectedId, units);
    }
  };

  const loadTenants = async () => {
    try {
      const { data: tenantProfiles } = await supabase
        .from("tenant_profiles")
        .select("profile_id, id_card_number");

      if (!tenantProfiles || tenantProfiles.length === 0) {
        setTenants([]);
        return;
      }

      const profileIds = tenantProfiles.map(tp => tp.profile_id);

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name, phone")
        .in("id", profileIds)
        .order("name");

      if (profiles) {
        const mapped = profiles.map(p => {
          const tp = tenantProfiles.find(item => item.profile_id === p.id);
          return {
            id: p.id,
            name: p.name,
            phone: p.phone,
            cccd: tp?.id_card_number || "",
          };
        });
        setTenants(mapped);
      } else {
        setTenants([]);
      }
    } catch (err) {
      console.error("Error loading tenants:", err);
      setTenants([]);
    }
  };

  const handleRoomUnitChange = async (roomUnitId: string, currentUnits = roomUnits) => {
    setForm(prev => ({ ...prev, room_unit_id: roomUnitId }));
    const ru = currentUnits.find(item => item.id === roomUnitId);
    if (ru) {
      setForm(prev => ({
        ...prev,
        room_id: ru.rooms?.id || "",
        rent_price: ru.rent_price ? String(ru.rent_price) : "",
        deposit: ru.deposit ? String(ru.deposit) : "",
        beds: ru.beds ? String(ru.beds) : "1",
        payment_cycle: ru.payment_cycle || "1_month",
      }));

      // Load services associated with this room unit to prefill electric and water prices
      try {
        const { data: rus } = await supabase
          .from("room_unit_services")
          .select(`
            service_id,
            services:service_id (
              name,
              price,
              type,
              unit
            )
          `)
          .eq("room_unit_id", roomUnitId);

        if (rus) {
          let ePrice = "0";
          let wPrice = "0";
          let eType = "per_index";
          let wType = "per_index";

          rus.forEach((row: any) => {
            const svc = row.services;
            if (svc) {
              const nameLower = svc.name.toLowerCase();
              if (nameLower.includes("điện") || nameLower.includes("electric")) {
                ePrice = String(svc.price || 0);
                eType = svc.type === "fixed" ? "flat" : "per_index";
              } else if (nameLower.includes("nước") || nameLower.includes("water")) {
                wPrice = String(svc.price || 0);
                wType = svc.type === "fixed" ? "flat" : "per_index";
              }
            }
          });

          setForm(prev => ({
            ...prev,
            electric_price: ePrice,
            electric_pricing_type: eType,
            water_price: wPrice,
            water_pricing_type: wType,
          }));
        }
      } catch (err) {
        console.error("Error loading room unit services:", err);
      }
    }
  };

  const handleMeterPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMeterPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setMeterPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const toggleTenant = (tenantId: string) => {
    setSelectedTenants(prev => prev.includes(tenantId) ? prev.filter(id => id !== tenantId) : [...prev, tenantId]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    if (!form.room_unit_id) { alert("Vui lòng chọn phòng trọ"); return; }
    if (!form.start_date || !form.end_date) { alert("Vui lòng nhập ngày"); return; }
    if (selectedTenants.length === 0) { alert("Vui lòng chọn ít nhất một khách thuê"); return; }
 
    setLoading(true);
    try {
      let meterPhotoUrl = "";
      if (meterPhoto) {
        const { url, error } = await uploadImage(meterPhoto, "contract-images");
        if (!error && url) meterPhotoUrl = url;
      }
 
      const code = `HD-${Date.now().toString(36).toUpperCase()}`;
      const { data: contractData, error } = await supabase.from("contracts").insert({
        owner_id: user.id,
        room_id: form.room_id || null,
        room_unit_id: form.room_unit_id,
        renter_id: selectedTenants[0],
        contract_code: code,
        start_date: form.start_date,
        end_date: form.end_date,
        rent_amount: parseFloat(form.rent_price) || 0,
        rent_price: parseFloat(form.rent_price) || 0,
        deposit_amount: parseFloat(form.deposit) || 0,
        deposit: parseFloat(form.deposit) || 0,
        beds: parseInt(form.beds) || 1,
        payment_cycle: form.payment_cycle,
        utilities_included: form.utilities_included,
        electric_start_index: parseFloat(form.electric_start_index) || 0,
        electric_price: parseFloat(form.electric_price) || 0,
        electric_pricing_type: form.electric_pricing_type,
        water_start_index: parseFloat(form.water_start_index) || 0,
        water_price: parseFloat(form.water_price) || 0,
        water_pricing_type: form.water_pricing_type,
        meter_photo: meterPhotoUrl || null,
        notes: form.notes || null,
        status: "active",
      }).select().single();
 
      if (error) throw error;

      if (selectedTenants.length > 0 && contractData) {
        await supabase.from("contract_tenants").insert(
          selectedTenants.map((tid, idx) => ({ contract_id: contractData.id, tenant_id: tid, is_representative: idx === 0 }))
        );
      }

      alert("Tạo hợp đồng thành công!");
      router.push("/operator/contracts");
    } catch (err: any) {
      alert("Lỗi: " + (err.message || "Không thể tạo hợp đồng"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/operator/contracts" className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Tạo hợp đồng mới</h1>
          <p className="text-sm text-neutral-500 mt-1">Điền thông tin để lập hợp đồng thuê phòng</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Thông tin chính */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 space-y-4">
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Thông tin chính</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Phòng trọ <span className="text-red-500">*</span></label>
              <select value={form.room_unit_id} onChange={(e) => handleRoomUnitChange(e.target.value)} required
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500">
                <option value="">-- Chọn phòng trọ --</option>
                {roomUnits.map(ru => (
                  <option key={ru.id} value={ru.id}>
                    {ru.rooms?.title} - {ru.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Chu kỳ thanh toán <span className="text-red-500">*</span></label>
              <select value={form.payment_cycle} onChange={(e) => setForm({ ...form, payment_cycle: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500">
                <option value="1_month">1 tháng</option><option value="3_months">3 tháng</option>
                <option value="6_months">6 tháng</option><option value="12_months">12 tháng</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Ngày bắt đầu <span className="text-red-500">*</span></label>
              <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} required
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Ngày hết hợp đồng <span className="text-red-500">*</span></label>
              <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} required
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Giá thuê</label>
              <input type="number" value={form.rent_price} onChange={(e) => setForm({ ...form, rent_price: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Giá cọc</label>
              <input type="number" value={form.deposit} onChange={(e) => setForm({ ...form, deposit: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Số giường</label>
              <input type="number" value={form.beds} onChange={(e) => setForm({ ...form, beds: e.target.value })} min="1"
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500" />
            </div>
          </div>
        </div>

        {/* Khách thuê */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 space-y-4">
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Khách thuê</h3>
          {tenants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto">
              {tenants.map(t => (
                <label key={t.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedTenants.includes(t.id) ? "border-green-500 bg-green-50 dark:bg-green-900/20" : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"
                }`}>
                  <input type="checkbox" checked={selectedTenants.includes(t.id)} onChange={() => toggleTenant(t.id)} className="rounded text-green-600" />
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-white">{t.name}</p>
                    <p className="text-xs text-neutral-500">{t.phone} {t.cccd ? `• CCCD: ${t.cccd}` : ""}</p>
                  </div>
                </label>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-500 py-4 text-center">Chưa có khách thuê. Vui lòng thêm khách thuê trước.</p>
          )}
          <p className="text-xs text-red-500">* Khách được chọn đầu tiên sẽ là người đại diện hợp đồng</p>
        </div>

        {/* Điện nước */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 space-y-4">
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Giá thuê đã bao gồm điện nước?</h3>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={form.utilities_included} onChange={() => setForm({ ...form, utilities_included: true })} className="text-green-600" />
              <span className="text-sm">Có (Đã bao gồm)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={!form.utilities_included} onChange={() => setForm({ ...form, utilities_included: false })} className="text-green-600" />
              <span className="text-sm">Không (Tính theo công tơ)</span>
            </label>
          </div>

          {!form.utilities_included && (
            <div className="space-y-4 mt-4">
              {/* Điện */}
              <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-neutral-800 dark:text-neutral-200">Công tơ điện</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">Chỉ số bắt đầu <span className="text-red-500">*</span></label>
                    <input type="number" value={form.electric_start_index} onChange={(e) => setForm({ ...form, electric_start_index: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">Giá tiền <span className="text-red-500">*</span></label>
                    <input type="number" value={form.electric_price} onChange={(e) => setForm({ ...form, electric_price: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">Loại tính tiền / kWh <span className="text-red-500">*</span></label>
                  <select value={form.electric_pricing_type} onChange={(e) => setForm({ ...form, electric_pricing_type: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm">
                    <option value="per_index">Giá theo chỉ số</option><option value="flat">Giá cố định/tháng</option>
                  </select>
                </div>
              </div>

              {/* Nước */}
              <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-neutral-800 dark:text-neutral-200">Công tơ nước</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">Chỉ số bắt đầu <span className="text-red-500">*</span></label>
                    <input type="number" value={form.water_start_index} onChange={(e) => setForm({ ...form, water_start_index: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">Giá tiền <span className="text-red-500">*</span></label>
                    <input type="number" value={form.water_price} onChange={(e) => setForm({ ...form, water_price: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">Loại tính tiền / m3 <span className="text-red-500">*</span></label>
                  <select value={form.water_pricing_type} onChange={(e) => setForm({ ...form, water_pricing_type: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm">
                    <option value="per_index">Giá theo chỉ số</option><option value="flat">Giá cố định/tháng</option>
                  </select>
                </div>
              </div>

              {/* Ảnh đồng hồ */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Ảnh đồng hồ</label>
                <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-xl p-8 text-center hover:border-green-500 transition-colors cursor-pointer"
                  onClick={() => document.getElementById("meter-photo-input")?.click()}>
                  {meterPreview ? (
                    <img src={meterPreview} alt="Meter" className="max-h-40 mx-auto rounded-lg" />
                  ) : (
                    <>
                      <svg className="w-12 h-12 text-neutral-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-sm font-semibold text-blue-600">KÉO THẢ HOẶC CHỌN FILE</p>
                      <p className="text-xs text-neutral-500 mt-1">Hỗ trợ: JPG, PNG, WEBP (Tối đa 5MB mỗi file)</p>
                    </>
                  )}
                </div>
                <input id="meter-photo-input" type="file" accept="image/*" onChange={handleMeterPhotoChange} className="hidden" />
              </div>
            </div>
          )}
        </div>

        {/* Ghi chú */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 space-y-3">
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Ghi chú</h3>
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={4} placeholder="Nhập ghi chú hợp đồng"
            className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500 resize-none" />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Link href="/operator/contracts"
            className="px-6 py-3 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg font-medium hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">
            Hủy
          </Link>
          <button type="submit" disabled={loading}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
            {loading ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Đang tạo...</> : "Tạo hợp đồng"}
          </button>
        </div>
      </form>
    </div>
  );
}


