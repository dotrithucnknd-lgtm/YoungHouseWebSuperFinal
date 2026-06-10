"use client";

import React, { useEffect, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import ButtonPrimary from "@/shared/ButtonPrimary";
import ButtonSecondary from "@/shared/ButtonSecondary";
import Input from "@/shared/Input";
import Label from "@/components/Label";
import Select from "@/shared/Select";
import { supabase } from "@/lib/supabaseClient";
import { uploadImage, DatabaseNearbyPlace, getRoomUniversities, addRoomUniversities, fetchRoomVideoReviewsByRoomId } from "@/lib/supabaseServices";
import { extractTikTokVideoId } from "@/utils/tiktokEmbed";
import UniversitySelector from "@/components/UniversitySelector";

interface AdminEditRoomFormProps {
  show: boolean;
  onHide: () => void;
  roomId: string | null;
  onUpdated: () => void;
}

const AdminEditRoomForm: React.FC<AdminEditRoomFormProps> = ({ show, onHide, roomId, onUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const editorRef = useRef<HTMLDivElement>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  // Amenities state
  const [amenities, setAmenities] = useState<any[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<Set<string>>(new Set());
  const [loadingAmenities, setLoadingAmenities] = useState<boolean>(false);

  // Universities state
  const [selectedUniversities, setSelectedUniversities] = useState<string[]>([]);

  const [tiktokVideos, setTiktokVideos] = useState<
    Array<{ source_url: string; display_title: string }>
  >([{ source_url: "", display_title: "" }]);

  // Nearby places state
  const [nearbyPlaces, setNearbyPlaces] = useState<Array<{
    id?: string;
    name: string;
    category: DatabaseNearbyPlace['category'];
    distance_km: string;
    description: string;
  }>>([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    area: "",
    address: "",
    city: "",
    district: "",
    ward: "",
    status: "available",
    banner: "",
    maps: "",
    is_hot: false,
    phone: "",
  });
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [initialPhone, setInitialPhone] = useState<string>("");

  useEffect(() => {
    if (!show || !roomId) return;
    const fetchRoom = async () => {
      setError("");
      try {
        // Fetch room data
        const { data, error } = await supabase
          .from("rooms")
          .select("*")
          .eq("id", roomId)
          .single();
        if (error) throw error;
        // Fetch phone of the room's owner (from profiles)
        let ownerPhone = "";
        if (data.owner_id) {
          const { data: ownerProfile } = await supabase
            .from("profiles")
            .select("phone")
            .eq("id", data.owner_id)
            .single();
          ownerPhone = (ownerProfile?.phone || "").toString();
        }
        setOwnerId(data.owner_id || null);
        setInitialPhone(ownerPhone);

        setForm({
          title: data.title || "",
          description: data.description || "",
          price: data.price?.toString() || "",
          area: data.area?.toString() || "",
          address: data.address || "",
          city: data.city || "",
          district: data.district || "",
          ward: data.ward || "",
          status: data.status || "available",
          banner: data.banner || "",
          maps: data.maps || "",
          is_hot: Boolean(data.is_hot),
          phone: ownerPhone,
        });
        if (editorRef.current) editorRef.current.innerHTML = data.description || "";

        // Fetch nearby places
        const { data: places, error: placesError } = await supabase
          .from("nearby_places")
          .select("*")
          .eq("room_id", roomId)
          .order("distance_km", { ascending: true });
        
        if (!placesError && places) {
          setNearbyPlaces(places.map(p => ({
            id: p.id,
            name: p.name,
            category: p.category,
            distance_km: p.distance_km.toString(),
            description: p.description || ""
          })));
        } else {
          setNearbyPlaces([{
            name: "",
            category: "university",
            distance_km: "",
            description: ""
          }]);
        }

        // Fetch amenities list
        setLoadingAmenities(true);
        const { data: amenitiesData, error: amenitiesError } = await supabase
          .from('amenities')
          .select('*')
          .order('name');
        if (!amenitiesError && amenitiesData) {
          setAmenities(amenitiesData);
        }

        // Fetch current room amenities
        const { data: roomAmenityRows, error: roomAmenitiesError } = await supabase
          .from('room_amenities')
          .select('amenity_id')
          .eq('room_id', roomId);
        if (!roomAmenitiesError && roomAmenityRows) {
          setSelectedAmenities(new Set(roomAmenityRows.map(r => r.amenity_id)));
        } else {
          setSelectedAmenities(new Set());
        }
        setLoadingAmenities(false);

        // Fetch room universities
        const { universities: roomUniversities, error: universitiesError } = await getRoomUniversities(roomId);
        if (!universitiesError && roomUniversities) {
          setSelectedUniversities(roomUniversities.map(u => u.id));
        } else {
          setSelectedUniversities([]);
        }

        const { rows: vidRows, error: vidErr } = await fetchRoomVideoReviewsByRoomId(roomId);
        if (!vidErr && vidRows?.length) {
          setTiktokVideos(
            vidRows.map((r) => ({
              source_url: r.source_url,
              display_title: r.display_title || "",
            }))
          );
        } else {
          setTiktokVideos([{ source_url: "", display_title: "" }]);
        }
      } catch (e: any) {
        setError(e.message || "Không tải được dữ liệu phòng");
        setLoadingAmenities(false);
      }
    };
    fetchRoom();
  }, [show, roomId]);

  // Reset form when dialog is closed
  useEffect(() => {
    if (!show) {
      setSelectedUniversities([]);
      setNearbyPlaces([{
        name: "",
        category: "university",
        distance_km: "",
        description: ""
      }]);
      setSelectedAmenities(new Set());
      setForm({
        title: "",
        description: "",
        price: "",
        area: "",
        address: "",
        city: "",
        district: "",
        ward: "",
        status: "available",
        banner: "",
        maps: "",
        is_hot: false,
        phone: "",
      });
      setOwnerId(null);
      setInitialPhone("");
      setError("");
      setBannerFile(null);
      if (editorRef.current) editorRef.current.innerHTML = "";
      setTiktokVideos([{ source_url: "", display_title: "" }]);
    }
  }, [show]);

  const addTiktokRow = () => {
    setTiktokVideos((prev) => [...prev, { source_url: "", display_title: "" }]);
  };

  const removeTiktokRow = (idx: number) => {
    setTiktokVideos((prev) =>
      prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx)
    );
  };

  const handleTiktokChange = (
    idx: number,
    field: "source_url" | "display_title",
    value: string
  ) => {
    setTiktokVideos((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, [field]: value } : row))
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'maps') {
      const srcMatch = value.match(/<iframe.*?src=["'](.*?)["']/);
      if (srcMatch && srcMatch[1]) {
        setForm(prev => ({ ...prev, [name]: srcMatch[1] }));
        return;
      }
    }

    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleDescriptionChange = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      setForm(prev => ({ ...prev, description: content }));
    }
  };

  const formatText = (command: string, value: string | null = null) => {
    document.execCommand(command, false, value || "");
    handleDescriptionChange();
  };

  const handleBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setBannerFile(f);
  };

  // Nearby places handlers
  const addNearbyPlaceField = () => {
    setNearbyPlaces(prev => [...prev, {
      name: "",
      category: "university",
      distance_km: "",
      description: ""
    }]);
  };

  const removeNearbyPlaceField = (idx: number) => {
    setNearbyPlaces(prev => prev.filter((_, i) => i !== idx));
  };

  const handleNearbyPlaceChange = (idx: number, field: string, value: string) => {
    setNearbyPlaces(prev => prev.map((place, i) => 
      i === idx ? { ...place, [field]: value } : place
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId) return;
    setLoading(true);
    setError("");
    try {
      const tiktokNonEmpty = tiktokVideos.filter((v) => v.source_url.trim());
      for (const v of tiktokNonEmpty) {
        if (!extractTikTokVideoId(v.source_url)) {
          throw new Error(
            `Link TikTok không hợp lệ (cần URL chứa /video/ID): ${v.source_url.trim()}`
          );
        }
      }

      let bannerUrl = form.banner;
      if (bannerFile) {
        setUploadingBanner(true);
        const { url, error: uploadError } = await uploadImage(bannerFile, "room-images");
        setUploadingBanner(false);
        if (uploadError) throw new Error(uploadError);
        if (url) bannerUrl = url;
      }

      const { error } = await supabase
        .from("rooms")
        .update({
          title: form.title.trim(),
          description: form.description.trim() || null,
          price: form.price ? Number(form.price) : null,
          area: form.area ? Number(form.area) : null,
          address: form.address.trim(),
          city: form.city.trim() || null,
          district: form.district.trim() || null,
          ward: form.ward.trim() || null,
          status: form.status || "available",
          banner: bannerUrl.trim() || null,
          maps: form.maps.trim() || null,
          is_hot: form.is_hot,
        })
        .eq("id", roomId);

      if (error) throw error;

      // Update the owner's phone in their profile (shown on room detail page)
      const trimmedPhone = form.phone.trim();
      if (ownerId && trimmedPhone !== initialPhone) {
        const { error: phoneError } = await supabase
          .from("profiles")
          .update({ phone: trimmedPhone || null })
          .eq("id", ownerId);
        if (phoneError) {
          console.error("Error updating owner phone:", phoneError);
        } else {
          setInitialPhone(trimmedPhone);
        }
      }

      // Update amenities: reset then insert selected
      // Delete existing
      await supabase
        .from('room_amenities')
        .delete()
        .eq('room_id', roomId);

      if (selectedAmenities.size > 0) {
        const amenityInserts = Array.from(selectedAmenities).map(amenityId => ({
          room_id: roomId,
          amenity_id: amenityId
        }));
        const { error: amenityError } = await supabase
          .from('room_amenities')
          .insert(amenityInserts);
        if (amenityError) console.error('Error updating amenities:', amenityError);
      }

      // Handle nearby places
      const validNearbyPlaces = nearbyPlaces.filter(place => 
        place.name.trim() && place.distance_km
      );

      // Delete existing nearby places
      await supabase
        .from("nearby_places")
        .delete()
        .eq("room_id", roomId);

      // Insert new nearby places
      if (validNearbyPlaces.length > 0) {
        const nearbyPlaceInserts = validNearbyPlaces.map(place => ({
          room_id: roomId,
          name: place.name.trim(),
          category: place.category,
          distance_km: parseFloat(place.distance_km),
          description: place.description.trim() || null
        }));

        const { error: nearbyPlaceError } = await supabase
          .from("nearby_places")
          .insert(nearbyPlaceInserts);

        if (nearbyPlaceError) console.error("Error updating nearby places:", nearbyPlaceError);
      }

      // Update university associations
      const { error: universityError } = await addRoomUniversities(roomId, selectedUniversities);
      if (universityError) console.error("Error updating university associations:", universityError);

      const { error: delVidErr } = await supabase
        .from("room_video_reviews")
        .delete()
        .eq("room_id", roomId);
      if (delVidErr) throw new Error(delVidErr.message);

      if (tiktokNonEmpty.length > 0) {
        const inserts = tiktokNonEmpty.map((v, i) => ({
          room_id: roomId,
          source_url: v.source_url.trim(),
          display_title: v.display_title.trim() || null,
          sort_order: i,
        }));
        const { error: insVidErr } = await supabase
          .from("room_video_reviews")
          .insert(inserts);
        if (insVidErr) throw new Error(insVidErr.message);
      }

      onUpdated();
      onHide();
    } catch (e: any) {
      setError(e.message || "Không thể cập nhật phòng");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show={show} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onHide}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white dark:bg-neutral-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="div" className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">Sửa phòng</h3>
                  <button onClick={onHide} className="rounded-full p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700">
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </Dialog.Title>

                <form onSubmit={handleSubmit}>
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">{error}</div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content - Left Side */}
                    <div className="lg:col-span-2 space-y-4">
                    <div>
                      <Label>Tiêu đề *</Label>
                      <Input name="title" value={form.title} onChange={handleChange} required className="mt-1.5" />
                    </div>

                    <div>
                      <Label>Mô tả</Label>
                      <div className="border border-neutral-300 dark:border-neutral-600 rounded-t-lg p-2 bg-neutral-50 dark:bg-neutral-700 flex gap-2">
                        <button
                          type="button"
                          className="px-3 py-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-600"
                          onClick={() => formatText('bold')}
                          title="Bold"
                        >
                          <strong>B</strong>
                        </button>
                        <button
                          type="button"
                          className="px-3 py-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-600"
                          onClick={() => formatText('italic')}
                          title="Italic"
                        >
                          <em>I</em>
                        </button>
                        <button
                          type="button"
                          className="px-3 py-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-600"
                          onClick={() => formatText('underline')}
                          title="Underline"
                        >
                          <u>U</u>
                        </button>
                        <button
                          type="button"
                          className="px-3 py-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-600"
                          onClick={() => formatText('insertUnorderedList')}
                          title="Bullet List"
                        >
                          •
                        </button>
                      </div>
                      <div
                        ref={editorRef}
                        contentEditable
                        onInput={handleDescriptionChange}
                        className="border border-neutral-300 dark:border-neutral-600 rounded-b-lg p-3 min-h-[200px] focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                        suppressContentEditableWarning={true}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Giá (VNĐ/tháng)</Label>
                        <Input type="number" name="price" value={form.price} onChange={handleChange} className="mt-1.5" />
                      </div>
                      <div>
                        <Label>Diện tích (m²)</Label>
                        <Input type="number" name="area" value={form.area} onChange={handleChange} className="mt-1.5" />
                      </div>
                    </div>

                    <div>
                      <Label>Địa chỉ *</Label>
                      <Input name="address" value={form.address} onChange={handleChange} required className="mt-1.5" />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Thành phố</Label>
                        <Input name="city" value={form.city} onChange={handleChange} className="mt-1.5" />
                      </div>
                      <div>
                        <Label>Quận/Huyện</Label>
                        <Input name="district" value={form.district} onChange={handleChange} className="mt-1.5" />
                      </div>
                      <div>
                        <Label>Phường/Xã</Label>
                        <Input name="ward" value={form.ward} onChange={handleChange} className="mt-1.5" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Trạng thái</Label>
                        <Select name="status" value={form.status} onChange={handleChange} className="mt-1.5">
                          <option value="available">Còn trống</option>
                          <option value="reserved">Đặt trước</option>
                          <option value="rented">Đã thuê</option>
                          <option value="hidden">Ẩn</option>
                        </Select>
                      </div>
                      <div>
                        <Label>Banner</Label>
                        <div className="mt-1.5 space-y-2">
                          <input type="file" accept="image/*" onChange={handleBannerFileChange} className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-600 file:text-neutral-900 hover:file:bg-primary-700 cursor-pointer" />
                          {bannerFile && <p className="text-xs text-green-600">Đã chọn: {bannerFile.name}</p>}
                          <Input name="banner" value={form.banner} onChange={handleChange} placeholder="Hoặc nhập URL: https://..." className="mt-2" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label>Link Google Maps Embedded</Label>
                      <Input name="maps" value={form.maps} onChange={handleChange} placeholder="https://www.google.com/maps/embed?pb=... hoặc dán nguyên mã <iframe>" className="mt-1.5" />
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                        Vào Google Maps → Share → Embed a map → Copy HTML rồi dán vào đây (hệ thống sẽ tự trích xuất URL)
                      </p>
                    </div>

                    <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/80 dark:bg-neutral-900/40 p-4 space-y-3">
                      <Label>Video review TikTok (gắn phòng này)</Label>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Dán <span className="font-medium text-neutral-700 dark:text-neutral-300">link chia sẻ</span> ({" "}
                        <span className="font-mono">…tiktok.com/@user/video/7549…</span>
                        ) hoặc <span className="font-medium text-neutral-700 dark:text-neutral-300">nguyên mã embed</span> TikTok (blockquote +{" "}
                        <span className="font-mono">data-video-id</span> /{" "}
                        <span className="font-mono">cite=</span>
                        ). Trang <span className="font-medium text-neutral-700 dark:text-neutral-300">/video-review</span>{" "}
                        sẽ tự lấy ID video và nhúng player.
                      </p>
                      <div className="space-y-3">
                        {tiktokVideos.map((row, idx) => (
                          <div
                            key={idx}
                            className="flex flex-col gap-2 sm:flex-row sm:items-start"
                          >
                            <Input
                              placeholder="URL TikTok …/video/…"
                              value={row.source_url}
                              onChange={(e) =>
                                handleTiktokChange(idx, "source_url", e.target.value)
                              }
                              className="flex-1 text-sm"
                            />
                            <Input
                              placeholder="Tiêu đề trên thẻ (tuỳ chọn)"
                              value={row.display_title}
                              onChange={(e) =>
                                handleTiktokChange(idx, "display_title", e.target.value)
                              }
                              className="flex-1 text-sm sm:max-w-[200px]"
                            />
                            <button
                              type="button"
                              onClick={() => removeTiktokRow(idx)}
                              disabled={tiktokVideos.length <= 1}
                              className="text-sm text-red-600 hover:text-red-700 disabled:opacity-40 shrink-0"
                            >
                              Xóa
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={addTiktokRow}
                          className="text-sm text-primary-600 hover:text-primary-700"
                        >
                          + Thêm video
                        </button>
                      </div>
                    </div>

                    <div>
                      <Label>
                        Số điện thoại liên hệ{" "}
                        <span className="text-xs font-normal text-neutral-500">
                          (hiển thị trên trang chi tiết phòng)
                        </span>
                      </Label>
                      <Input
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="VD: 0962 888 797"
                        inputMode="tel"
                        className="mt-1.5"
                      />
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                        Đây là SĐT của chủ phòng (được lưu trong profile của họ). Cập nhật ở
                        đây sẽ áp dụng cho tất cả phòng do chủ này đăng.
                      </p>
                    </div>

                    <div className="border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/10 rounded-lg p-4">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.is_hot}
                          onChange={(e) =>
                            setForm((prev) => ({ ...prev, is_hot: e.target.checked }))
                          }
                          className="mt-1 rounded"
                        />
                        <div>
                          <div className="font-semibold text-red-700 dark:text-red-300">
                            🔥 Ghim phòng này vào section HOT trên trang chủ
                          </div>
                          <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                            Chỉ các phòng được đánh dấu HOT mới hiển thị ưu tiên ở đầu trang chủ
                            (tối đa 8 phòng, phần còn lại sẽ tự động bù bằng phòng mới nhất).
                          </div>
                        </div>
                      </label>
                    </div>
                    </div>

                    {/* Sidebar - Right Side */}
                    <div className="space-y-4">
                      <div>
                        <Label>Tiện nghi</Label>
                        <div className="border border-neutral-300 dark:border-neutral-600 rounded-lg p-3 max-h-[400px] overflow-y-auto">
                          {loadingAmenities ? (
                            <div className="text-sm text-neutral-500">Đang tải tiện nghi...</div>
                          ) : (
                            amenities.map(item => (
                              <label key={item.id} className="flex items-center gap-2 py-1 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={selectedAmenities.has(item.id)}
                                  onChange={(e) => {
                                    const checked = e.target.checked;
                                    setSelectedAmenities(prev => {
                                      const next = new Set(prev);
                                      if (checked) next.add(item.id);
                                      else next.delete(item.id);
                                      return next;
                                    });
                                  }}
                                  className="rounded"
                                />
                                <span className="text-sm text-neutral-900 dark:text-neutral-100">{item.name}</span>
                              </label>
                            ))
                          )}
                        </div>
                      </div>

                      <div>
                        <UniversitySelector
                          selectedUniversities={selectedUniversities}
                          onChange={setSelectedUniversities}
                        />
                      </div>

                      <div>
                        <Label>Khu vực xung quanh 🗺️</Label>
                        <div className="space-y-3">
                          {nearbyPlaces.map((place, idx) => (
                            <div key={idx} className="border border-neutral-300 dark:border-neutral-600 rounded-lg p-3 space-y-2">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                                  Địa điểm #{idx + 1}
                                </span>
                                {nearbyPlaces.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeNearbyPlaceField(idx)}
                                    className="text-xs text-red-600 hover:text-red-700"
                                  >
                                    Xóa
                                  </button>
                                )}
                              </div>

                              <Input
                                placeholder="Tên địa điểm (VD: Đại học FPT)"
                                value={place.name}
                                onChange={(e) => handleNearbyPlaceChange(idx, 'name', e.target.value)}
                                className="text-sm"
                              />

                              <Select
                                value={place.category}
                                onChange={(e) => handleNearbyPlaceChange(idx, 'category', e.target.value)}
                                className="text-sm"
                              >
                                <option value="university">🎓 Đại học</option>
                                <option value="school">🏫 Trường học</option>
                                <option value="hospital">🏥 Bệnh viện</option>
                                <option value="supermarket">🛒 Siêu thị</option>
                                <option value="mall">🏪 Trung tâm thương mại</option>
                                <option value="park">🌳 Công viên</option>
                                <option value="bus_stop">🚌 Trạm xe buýt</option>
                                <option value="metro">🚇 Tàu điện</option>
                                <option value="restaurant">🍽️ Nhà hàng</option>
                                <option value="cafe">☕ Quán cafe</option>
                                <option value="gym">💪 Phòng gym</option>
                                <option value="other">📍 Khác</option>
                              </Select>

                              <Input
                                type="number"
                                step="0.1"
                                placeholder="Khoảng cách (km)"
                                value={place.distance_km}
                                onChange={(e) => handleNearbyPlaceChange(idx, 'distance_km', e.target.value)}
                                className="text-sm"
                              />

                              <Input
                                placeholder="Mô tả (optional)"
                                value={place.description}
                                onChange={(e) => handleNearbyPlaceChange(idx, 'description', e.target.value)}
                                className="text-sm"
                              />
                            </div>
                          ))}

                          <button
                            type="button"
                            onClick={addNearbyPlaceField}
                            className="w-full text-sm text-primary-600 hover:text-primary-700 border border-dashed border-primary-300 rounded-lg py-2 hover:border-primary-500 transition-colors"
                          >
                            + Thêm địa điểm
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <ButtonSecondary onClick={onHide} type="button">Hủy</ButtonSecondary>
                    <ButtonPrimary type="submit" disabled={loading || uploadingBanner}>{uploadingBanner ? "Đang upload banner..." : loading ? "Đang lưu..." : "Lưu thay đổi"}</ButtonPrimary>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default AdminEditRoomForm;



