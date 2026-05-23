"use client";

import React, { useState } from "react";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter } from "next/navigation";

const VIETNAM_PROVINCES = [
  "Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Thừa Thiên Huế", "Bình Dương",
  "Hà Giang", "An Giang", "Bà Rịa - Vũng Tàu", "Bắc Giang", "Bắc Kạn",
  "Bạc Liêu", "Bắc Ninh", "Bến Tre", "Bình Định", "Bình Phước",
  "Bình Thuận", "Cà Mau", "Cần Thơ", "Cao Bằng", "Đắk Lắk",
  "Đắk Nông", "Điện Biên", "Đồng Nai", "Đồng Tháp", "Gia Lai",
  "Hà Nam", "Hà Tĩnh", "Hải Dương", "Hải Phòng", "Hậu Giang",
  "Hoà Bình", "Hưng Yên", "Khánh Hòa", "Kiên Giang", "Kon Tum",
  "Lai Châu", "Lâm Đồng", "Lạng Sơn", "Lào Cai", "Long An",
  "Nam Định", "Nghệ An", "Ninh Bình", "Ninh Thuận", "Phú Thọ",
  "Phú Yên", "Quảng Bình", "Quảng Nam", "Quảng Ngãi", "Quảng Ninh",
  "Quảng Trị", "Sóc Trăng", "Sơn La", "Tây Ninh", "Thái Bình",
  "Thái Nguyên", "Thanh Hóa", "Tiền Giang", "Trà Vinh", "Tuyên Quang",
  "Vĩnh Long", "Vĩnh Phúc", "Yên Bái"
];

const RELATIONSHIPS = [
  { value: "spouse", label: "Vợ/Chồng" },
  { value: "child", label: "Con" },
  { value: "parent", label: "Cha/Mẹ" },
  { value: "sibling", label: "Anh/Chị/Em" },
  { value: "relative", label: "Người thân" },
  { value: "other", label: "Khác" },
];

export default function NewTenantPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "", dob: "", gender: "", province: "", district: "", ward: "",
    street: "", house_number: "", phone: "", email: "", occupation: "",
    id_card_number: "", id_card_issue_date: "", id_card_issue_place: "",
    has_temporary_residence: false,
    emergency_contact_name: "", emergency_contact_relationship: "", emergency_contact_phone: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) { alert('Vui lòng nhập họ và tên'); return; }
    if (!formData.phone.trim()) { alert('Vui lòng nhập số điện thoại'); return; }
    if (!formData.id_card_number.trim()) { alert('Vui lòng nhập số CCCD'); return; }

    setLoading(true);
    try {
      const hometownParts = [formData.house_number, formData.street, formData.ward, formData.district, formData.province].filter(Boolean);
      const hometown = hometownParts.join(', ');

      const response = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(), phone: formData.phone.trim(),
          email: formData.email.trim() || undefined, DoB: formData.dob || undefined,
          gender: formData.gender || undefined, occupation: formData.occupation.trim() || undefined,
          id_card_number: formData.id_card_number.trim(),
          id_card_issue_date: formData.id_card_issue_date || undefined,
          id_card_issue_place: formData.id_card_issue_place.trim() || undefined,
          hometown: hometown || undefined, has_temporary_residence: formData.has_temporary_residence,
          emergency_contact_name: formData.emergency_contact_name.trim() || undefined,
          emergency_contact_relationship: formData.emergency_contact_relationship || undefined,
          emergency_contact_phone: formData.emergency_contact_phone.trim() || undefined,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Có lỗi xảy ra');

      alert('Thêm khách thuê thành công!');
      router.push('/operator/tenants');
    } catch (error: any) {
      alert(error.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/operator/tenants" className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Thêm khách thuê mới</h1>
          <p className="text-sm text-neutral-500 mt-1">Điền thông tin khách thuê</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Thông tin cá nhân */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Thông tin cá nhân</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Họ và tên <span className="text-red-500">*</span></label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} required
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Ngày sinh</label>
              <input type="date" name="dob" value={formData.dob} onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Giới tính</label>
              <select name="gender" value={formData.gender} onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500 focus:border-transparent">
                <option value="">Chọn giới tính</option><option value="male">Nam</option><option value="female">Nữ</option><option value="other">Khác</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Số điện thoại <span className="text-red-500">*</span></label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Nghề nghiệp</label>
              <input type="text" name="occupation" value={formData.occupation} onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>
          </div>
        </div>

        {/* Quê quán */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Quê quán</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Tỉnh/TP</label>
              <select name="province" value={formData.province} onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500 focus:border-transparent">
                <option value="">Chọn tỉnh/TP</option>
                {VIETNAM_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Quận/Huyện</label>
              <input type="text" name="district" value={formData.district} onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Phường/Xã</label>
              <input type="text" name="ward" value={formData.ward} onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Đường</label>
              <input type="text" name="street" value={formData.street} onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Số nhà / Địa chỉ cụ thể</label>
              <input type="text" name="house_number" value={formData.house_number} onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>
          </div>
        </div>

        {/* CCCD */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Căn cước công dân</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Số CCCD <span className="text-red-500">*</span></label>
              <input type="text" name="id_card_number" value={formData.id_card_number} onChange={handleInputChange} required
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Ngày cấp</label>
              <input type="date" name="id_card_issue_date" value={formData.id_card_issue_date} onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Nơi cấp</label>
              <input type="text" name="id_card_issue_place" value={formData.id_card_issue_place} onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="has_temporary_residence" checked={formData.has_temporary_residence} onChange={handleInputChange} className="rounded text-green-600 focus:ring-green-500" />
                <span className="text-sm text-neutral-700 dark:text-neutral-300">Đã đăng ký tạm trú</span>
              </label>
            </div>
          </div>
        </div>

        {/* Người thân */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Thông tin người thân</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Họ và tên</label>
              <input type="text" name="emergency_contact_name" value={formData.emergency_contact_name} onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Mối quan hệ</label>
              <select name="emergency_contact_relationship" value={formData.emergency_contact_relationship} onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500 focus:border-transparent">
                <option value="">Vui lòng chọn</option>
                {RELATIONSHIPS.map(rel => <option key={rel.value} value={rel.value}>{rel.label}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Số điện thoại</label>
              <input type="tel" name="emergency_contact_phone" value={formData.emergency_contact_phone} onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Link href="/operator/tenants"
            className="px-6 py-3 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg font-medium hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">
            Hủy
          </Link>
          <button type="submit" disabled={loading}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
            {loading ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Đang lưu...</> : "Lưu thông tin"}
          </button>
        </div>
      </form>
    </div>
  );
}


