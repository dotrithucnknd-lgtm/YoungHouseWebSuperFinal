"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { createRoomTransfer, fetchUserRooms } from "@/lib/supabaseServices";
import { supabase } from "@/lib/supabaseClient";
import { compressImage } from "@/utils/imageCompression";
import ButtonPrimary from "@/shared/ButtonPrimary";
import ButtonSecondary from "@/shared/ButtonSecondary";
import Input from "@/shared/Input";
import Label from "@/components/Label";
import Textarea from "@/shared/Textarea";
import Image from "next/image";

const CreateTransferPage = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [useExistingRoom, setUseExistingRoom] = useState(true);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [form, setForm] = useState({
    room_id: "",
    title: "",
    description: "",
    reason: "",
    contact_phone: "",
    contact_zalo: "",
    transfer_date: "",
    price_negotiable: true,
    // Manual room info
    room_title: "",
    room_price: "",
    room_address: "",
    room_area: "",
    room_images: [] as string[],
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadRooms();
    }
  }, [user]);

  const loadRooms = async () => {
    setLoadingRooms(true);
    const { rooms: data, error } = await fetchUserRooms();
    if (!error && data) {
      const availableRooms = data.filter(
        (r: any) => r.status === 'available' || r.status === 'rented'
      );
      setRooms(availableRooms);
      // If user has no rooms, default to manual entry
      if (availableRooms.length === 0) {
        setUseExistingRoom(false);
      }
    }
    setLoadingRooms(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm({ ...form, [name]: checked });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    const uploadedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const original = files[i];
      const file = await compressImage(original, {
        maxWidthOrHeight: 1600,
        maxSizeMB: 0.4,
        convertToWebP: true,
        quality: 0.8,
      });
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `room-transfer-images/${fileName}`;

      const { data, error } = await supabase.storage
        .from('rooms')
        .upload(filePath, file);

      if (error) {
        console.error('Error uploading image:', error);
        continue;
      }

      const { data: publicUrlData } = supabase.storage
        .from('rooms')
        .getPublicUrl(filePath);

      uploadedUrls.push(publicUrlData.publicUrl);
    }

    setForm({ ...form, room_images: [...form.room_images, ...uploadedUrls] });
    setUploadingImages(false);
  };

  const removeImage = (index: number) => {
    const newImages = form.room_images.filter((_, i) => i !== index);
    setForm({ ...form, room_images: newImages });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (useExistingRoom && !form.room_id) {
      alert("Vui lòng chọn phòng trọ");
      return;
    }

    if (!useExistingRoom) {
      if (!form.room_title.trim() || !form.room_price || !form.room_address.trim()) {
        alert("Vui lòng nhập đầy đủ thông tin phòng (tên phòng, giá, địa chỉ)");
        return;
      }
    }

    if (!form.title.trim()) {
      alert("Vui lòng nhập tiêu đề");
      return;
    }

    setLoading(true);
    const transferData: any = {
      title: form.title,
      description: form.description || undefined,
      reason: form.reason || undefined,
      contact_phone: form.contact_phone || undefined,
      contact_zalo: form.contact_zalo || undefined,
      transfer_date: form.transfer_date || undefined,
      price_negotiable: form.price_negotiable,
    };

    if (useExistingRoom) {
      transferData.room_id = form.room_id;
    } else {
      transferData.room_id = null;
      transferData.room_title = form.room_title;
      transferData.room_price = parseFloat(form.room_price);
      transferData.room_address = form.room_address;
      transferData.room_area = form.room_area ? parseFloat(form.room_area) : undefined;
      transferData.room_images = form.room_images.length > 0 ? form.room_images : undefined;
    }

    const { success, transferId, error } = await createRoomTransfer(transferData);

    if (success) {
      alert("Đăng bài thành công! Bài đăng đang chờ admin duyệt.");
      router.push("/pass-phong");
    } else {
      alert(error || "Có lỗi xảy ra khi đăng bài");
    }
    setLoading(false);
  };

  if (authLoading || loadingRooms) {
    return (
      <div className="container py-16">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3"></div>
            <div className="h-96 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container py-16">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold">Đăng bài Pass Phòng</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-2">
            Tạo bài đăng chuyển nhượng phòng trọ. Bài đăng sẽ được admin xét duyệt trước khi hiển thị công khai.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Room source selection */}
          {rooms.length > 0 && (
            <div className="bg-neutral-50 dark:bg-neutral-800 rounded-2xl p-6">
              <Label>Nguồn thông tin phòng</Label>
              <div className="flex gap-4 mt-3">
                <button
                  type="button"
                  onClick={() => setUseExistingRoom(true)}
                  className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all ${
                    useExistingRoom
                      ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                      : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"
                  }`}
                >
                  <div className="font-medium">Chọn phòng có sẵn</div>
                  <div className="text-xs mt-1 opacity-70">Phòng bạn đã đăng</div>
                </button>
                <button
                  type="button"
                  onClick={() => setUseExistingRoom(false)}
                  className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all ${
                    !useExistingRoom
                      ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                      : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"
                  }`}
                >
                  <div className="font-medium">Nhập thông tin thủ công</div>
                  <div className="text-xs mt-1 opacity-70">Phòng chưa có trên hệ thống</div>
                </button>
              </div>
            </div>
          )}

          {/* Existing room selection */}
          {useExistingRoom && rooms.length > 0 && (
            <div>
              <Label>Chọn phòng trọ *</Label>
              <select
                name="room_id"
                value={form.room_id}
                onChange={handleChange}
                required
                className="mt-1.5 block w-full rounded-2xl border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
              >
                <option value="">-- Chọn phòng --</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.title} - {room.address} ({room.price.toLocaleString('vi-VN')} đ/tháng)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Manual room info */}
          {!useExistingRoom && (
            <div className="space-y-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6">
              <h3 className="font-semibold text-lg text-blue-900 dark:text-blue-100">
                Thông tin phòng trọ
              </h3>

              <div>
                <Label>Tên phòng / Tiêu đề *</Label>
                <Input
                  name="room_title"
                  value={form.room_title}
                  onChange={handleChange}
                  placeholder="VD: Phòng trọ 25m² gần Đại học FPT"
                  required={!useExistingRoom}
                  className="mt-1.5"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Giá phòng (VNĐ/tháng) *</Label>
                  <Input
                    type="number"
                    name="room_price"
                    value={form.room_price}
                    onChange={handleChange}
                    placeholder="VD: 2500000"
                    required={!useExistingRoom}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label>Diện tích (m²)</Label>
                  <Input
                    type="number"
                    name="room_area"
                    value={form.room_area}
                    onChange={handleChange}
                    placeholder="VD: 25"
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div>
                <Label>Địa chỉ *</Label>
                <Input
                  name="room_address"
                  value={form.room_address}
                  onChange={handleChange}
                  placeholder="VD: 123 Đường ABC, Phường XYZ, Quận 1, TP.HCM"
                  required={!useExistingRoom}
                  className="mt-1.5"
                />
              </div>

              {/* Image upload */}
              <div>
                <Label>Hình ảnh phòng</Label>
                <div className="mt-1.5">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={uploadingImages}
                    className="block w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                  />
                  {uploadingImages && (
                    <p className="text-sm text-primary-600 mt-2">Đang upload ảnh...</p>
                  )}
                </div>

                {/* Image preview */}
                {form.room_images.length > 0 && (
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    {form.room_images.map((url, index) => (
                      <div key={index} className="relative group">
                        <Image
                          src={url}
                          alt={`Room ${index + 1}`}
                          width={200}
                          height={150}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Post info */}
          <div className="space-y-6">
            <h3 className="font-semibold text-lg">Thông tin bài đăng</h3>

            <div>
              <Label>Tiêu đề bài đăng *</Label>
              <Input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="VD: Cần pass gấp phòng trọ gần trường Đại học FPT"
                required
                className="mt-1.5"
              />
            </div>

            <div>
              <Label>Mô tả chi tiết</Label>
              <Textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Mô tả chi tiết về phòng, lý do pass, điều kiện..."
                rows={5}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label>Lý do pass phòng</Label>
              <Input
                name="reason"
                value={form.reason}
                onChange={handleChange}
                placeholder="VD: Chuyển công tác, tốt nghiệp..."
                className="mt-1.5"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Số điện thoại liên hệ</Label>
                <Input
                  name="contact_phone"
                  value={form.contact_phone}
                  onChange={handleChange}
                  placeholder="0912345678"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label>Zalo</Label>
                <Input
                  name="contact_zalo"
                  value={form.contact_zalo}
                  onChange={handleChange}
                  placeholder="0912345678"
                  className="mt-1.5"
                />
              </div>
            </div>

            <div>
              <Label>Ngày dự kiến chuyển nhượng</Label>
              <Input
                type="date"
                name="transfer_date"
                value={form.transfer_date}
                onChange={handleChange}
                className="mt-1.5"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="price_negotiable"
                name="price_negotiable"
                checked={form.price_negotiable}
                onChange={handleChange}
                className="h-5 w-5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
              />
              <label
                htmlFor="price_negotiable"
                className="ml-3 text-sm text-neutral-700 dark:text-neutral-300"
              >
                Giá có thể thương lượng
              </label>
            </div>
          </div>

          {/* Notice */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <div className="flex">
              <svg
                className="h-5 w-5 text-blue-400 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Lưu ý
                </h3>
                <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Bài đăng cần được admin xét duyệt trước khi hiển thị công khai</li>
                    <li>Hãy điền đầy đủ thông tin để tăng khả năng được duyệt</li>
                    <li>Bạn chỉ có thể sửa/xóa bài khi đang ở trạng thái "Chờ duyệt"</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <ButtonPrimary
              type="submit"
              disabled={loading || uploadingImages}
              className="flex-1"
            >
              {loading ? "Đang đăng..." : "Đăng bài"}
            </ButtonPrimary>
            <ButtonSecondary
              onClick={() => router.push("/pass-phong")}
              disabled={loading}
              className="flex-1"
            >
              Hủy
            </ButtonSecondary>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTransferPage;

