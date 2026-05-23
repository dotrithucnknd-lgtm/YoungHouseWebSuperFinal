"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeftIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { fetchRooms } from "@/lib/supabaseServices";

export default function NewRoomUnitPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [selectedServices, setSelectedServices] = useState<{ id: string; name: string; price: number; unit: string }[]>([]);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [newService, setNewService] = useState({ name: "", type: "fixed", price: "", unit: "" });

  const [form, setForm] = useState({
    room_id: "",
    name: "",
    rent_price: "",
    deposit: "",
    area: "",
    max_occupants: "",
    beds: "1",
    payment_cycle: "1_month",
  });

  useEffect(() => {
    if (user?.id) { loadProperties(); loadServices(); }
  }, [user]);

  const loadProperties = async () => {
    const data = await fetchRooms();
    const ownerProps = data.filter(p => p.author.id === user!.id);
    setProperties(ownerProps);
  };

  const loadServices = async () => {
    if (!user?.id) return;
    const { data } = await supabase
      .from("services")
      .select("*")
      .eq("owner_id", user.id)
      .order("name");
    setServices(data || []);
    if (data) {
      setSelectedServices(
        data.map((s: any) => ({
          id: s.id,
          name: s.name,
          price: s.price,
          unit: s.unit
        }))
      );
    }
  };

  const handleAddService = () => {
    setShowServiceModal(true);
  };

  const handleSaveService = async () => {
    if (!newService.name.trim()) { alert("Vui lòng nhập tên dịch vụ"); return; }
    if (!newService.price) { alert("Vui lòng nhập giá dịch vụ"); return; }
    if (!newService.unit) { alert("Vui lòng chọn đơn vị"); return; }

    // Save to services table
    const { data, error } = await supabase.from("services").insert({
      owner_id: user!.id,
      room_id: form.room_id || null,
      name: newService.name.trim(),
      type: newService.type,
      price: parseFloat(newService.price),
      unit: newService.unit,
    }).select().single();

    if (error) {
      alert("Lỗi: " + error.message);
      return;
    }

    if (data) {
      setSelectedServices(prev => [...prev, { id: data.id, name: data.name, price: data.price, unit: data.unit }]);
      setServices(prev => [...prev, data]);
    }

    setNewService({ name: "", type: "fixed", price: "", unit: "" });
    setShowServiceModal(false);
  };

  const handleRemoveService = (serviceId: string) => {
    setSelectedServices(prev => prev.filter(s => s.id !== serviceId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    if (!form.room_id) { alert("Vui lòng chọn nhà trọ"); return; }
    if (!form.name.trim()) { alert("Vui lòng nhập tên phòng"); return; }
    if (!form.area) { alert("Vui lòng nhập diện tích"); return; }
    if (!form.max_occupants) { alert("Vui lòng nhập số người ở tối đa"); return; }

    setLoading(true);
    try {
      const { data, error } = await supabase.from("room_units").insert({
        room_id: form.room_id,
        name: form.name.trim(),
        rent_price: parseFloat(form.rent_price) || null,
        deposit: parseFloat(form.deposit) || null,
        area: parseFloat(form.area) || null,
        max_occupants: parseInt(form.max_occupants) || null,
        beds: parseInt(form.beds) || 1,
        payment_cycle: form.payment_cycle,
        status: "available",
      }).select().single();

      if (error) throw error;

      // Add services to room unit
      if (selectedServices.length > 0 && data) {
        const serviceInserts = selectedServices.map(s => ({
          room_unit_id: data.id,
          service_id: s.id,
        }));
        await supabase.from("room_unit_services").insert(serviceInserts);
      }

      alert("Thêm phòng thành công!");
      router.push("/operator/rooms");
    } catch (err: any) {
      alert("Lỗi: " + (err.message || "Không thể tạo phòng"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/operator/rooms" className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Thêm phòng</h1>
          <p className="text-sm text-neutral-500 mt-1">Thêm phòng mới vào nhà trọ</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Thông tin cơ bản */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 space-y-4">
          <div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Thông tin cơ bản</h3>
            <p className="text-sm text-neutral-500">Các thông tin cơ bản của phòng trọ</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Nhà trọ <span className="text-red-500">*</span></label>
            <select value={form.room_id} onChange={(e) => setForm({ ...form, room_id: e.target.value })} required
              className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500 focus:border-transparent">
              <option value="">Chọn nhà trọ</option>
              {properties.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Tên phòng <span className="text-red-500">*</span></label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nhập tên phòng" required
              className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500 focus:border-transparent" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Giá thuê</label>
              <input type="number" value={form.rent_price} onChange={(e) => setForm({ ...form, rent_price: e.target.value })} placeholder="Nhập giá thuê"
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Giá cọc</label>
              <input type="number" value={form.deposit} onChange={(e) => setForm({ ...form, deposit: e.target.value })} placeholder="Giá cọc"
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Diện tích <span className="text-red-500">*</span></label>
              <input type="number" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} placeholder="Nhập diện tích" required step="0.1"
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Số người ở tối đa <span className="text-red-500">*</span></label>
              <input type="number" value={form.max_occupants} onChange={(e) => setForm({ ...form, max_occupants: e.target.value })} placeholder="Nhập số người ở tối đa" required min="1"
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Số giường</label>
              <input type="number" value={form.beds} onChange={(e) => setForm({ ...form, beds: e.target.value })} min="1"
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Chu kỳ thu tiền <span className="text-red-500">*</span></label>
            <select value={form.payment_cycle} onChange={(e) => setForm({ ...form, payment_cycle: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500 focus:border-transparent">
              <option value="1_month">1 tháng</option><option value="3_months">3 tháng</option>
              <option value="6_months">6 tháng</option><option value="12_months">12 tháng</option>
            </select>
          </div>
        </div>

        {/* Dịch vụ sử dụng */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Dịch vụ sử dụng</h3>
              <p className="text-sm text-neutral-500">Thông tin phí và dịch vụ sử dụng của phòng</p>
            </div>
            <button type="button" onClick={handleAddService}
              className="flex items-center gap-2 px-4 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">
              <PlusIcon className="w-4 h-4" />
              Thêm dịch vụ
            </button>
          </div>

          {selectedServices.length > 0 ? (
            <div className="space-y-3">
              {selectedServices.map(svc => (
                <div key={svc.id} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg border border-neutral-200 dark:border-neutral-700">
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-white">{svc.name}</p>
                    <p className="text-sm text-neutral-500">{Number(svc.price).toLocaleString("vi-VN")}đ / {svc.unit}</p>
                  </div>
                  <button type="button" onClick={() => handleRemoveService(svc.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-xl p-8 text-center">
              <svg className="w-10 h-10 text-neutral-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Hiện chưa có dịch vụ nào cho nhà trọ này.</p>
              <p className="text-xs text-neutral-500 mt-1">Vui lòng thiết lập dịch vụ trước khi thêm vào phòng.</p>
              <button type="button" onClick={() => setShowServiceModal(true)}
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700">
                <PlusIcon className="w-4 h-4" />
                Thêm dịch vụ
              </button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Link href="/operator/rooms"
            className="px-6 py-3 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg font-medium hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">
            Hủy bỏ
          </Link>
          <button type="submit" disabled={loading}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
            {loading ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Đang lưu...</> : "Lưu thông tin"}
          </button>
        </div>
      </form>

      {/* Add Service Modal */}
      {showServiceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-800 rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Thêm dịch vụ mới</h3>
              <button type="button" onClick={() => setShowServiceModal(false)} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {form.room_id && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Nhà trọ</label>
                <div className="px-4 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 text-sm">
                  {properties.find(p => p.id === form.room_id)?.title || "—"}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Tên dịch vụ <span className="text-red-500">*</span></label>
              <input type="text" value={newService.name} onChange={(e) => setNewService({ ...newService, name: e.target.value })} placeholder="Nhập tên dịch vụ"
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Loại dịch vụ <span className="text-red-500">*</span></label>
              <select value={newService.type} onChange={(e) => setNewService({ ...newService, type: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500 focus:border-transparent">
                <option value="fixed">Cố định</option>
                <option value="metered">Theo công tơ</option>
                <option value="per_person">Theo người</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Giá dịch vụ <span className="text-red-500">*</span></label>
                <input type="number" value={newService.price} onChange={(e) => setNewService({ ...newService, price: e.target.value })} placeholder="Nhập giá"
                  className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Đơn vị <span className="text-red-500">*</span></label>
                <select value={newService.unit} onChange={(e) => setNewService({ ...newService, unit: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500 focus:border-transparent">
                  <option value="">Chọn đơn vị</option>
                  <option value="tháng">Tháng</option>
                  <option value="kWh">kWh</option>
                  <option value="m3">m³</option>
                  <option value="người">Người</option>
                  <option value="lần">Lần</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => setShowServiceModal(false)}
                className="px-5 py-2 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg font-medium hover:bg-neutral-50 dark:hover:bg-neutral-700">
                Hủy bỏ
              </button>
              <button type="button" onClick={handleSaveService}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                Lưu dịch vụ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


