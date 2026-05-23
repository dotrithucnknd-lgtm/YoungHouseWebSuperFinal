"use client";

import React, { FC, Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { ArrowRightIcon, Squares2X2Icon } from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";
import CommentListing from "@/components/CommentListing";
import FiveStartIconForRate from "@/components/FiveStartIconForRate";
import StartRating from "@/components/StartRating";
import Avatar from "@/shared/Avatar";
import Logo from "@/shared/Logo";
import Badge from "@/shared/Badge";
import ButtonCircle from "@/shared/ButtonCircle";
import ButtonPrimary from "@/shared/ButtonPrimary";
import ButtonSecondary from "@/shared/ButtonSecondary";
import ButtonClose from "@/shared/ButtonClose";
import Input from "@/shared/Input";
import LikeSaveBtns from "@/components/LikeSaveBtns";
import Breadcrumb from "@/shared/Breadcrumb";
import FeedbackItem from "@/components/FeedbackItem";
import FeedbackForm from "@/components/FeedbackForm";
import Image from "next/image";
import SupabaseImage from "@/components/SupabaseImage";
import RoomStatusBadge from "@/components/RoomStatusBadge";
import { usePathname, useParams, useRouter, useSearchParams } from "next/navigation";
import { Amenities_demos, PHOTOS } from "../constant";
import {
  buildRoomDetailPath,
  parseRoomDetailSlugParam,
} from "@/utils/roomDetailUrl";
import StayDatesRangeInput from "../StayDatesRangeInput";
import GuestsInput from "../GuestsInput";
import { 
  fetchRoomById, 
  fetchRooms, 
  fetchRoomAmenities,
  fetchRoomFeedbacks,
  getRoomAverageRating,
  createFeedback,
  updateFeedback,
  deleteFeedback,
  hasUserFeedback,
  fetchNearbyPlaces,
  fetchRoomVideoReviewsByRoomId,
  FeedbackWithUser,
  DatabaseFeedback,
  DatabaseNearbyPlace,
  DatabaseRoomVideoReview,
} from "@/lib/supabaseServices";
import { buildTikTokPlayerIframeSrc, extractTikTokVideoId } from "@/utils/tiktokEmbed";
import { StayDataType } from "@/data/types";
import { useAuth } from "@/contexts/AuthContext";
import SectionDateRange from "../../SectionDateRange";
import { Route } from "next";

export interface ListingStayDetailPageProps {}

const ListingStayDetailPage: FC<ListingStayDetailPageProps> = ({}) => {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [roomData, setRoomData] = useState<StayDataType | null>(null);
  const [amenities, setAmenities] = useState<string[]>([]);
  
  // Feedback states
  const [feedbacks, setFeedbacks] = useState<FeedbackWithUser[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [totalFeedbacks, setTotalFeedbacks] = useState<number>(0);
  const [userFeedback, setUserFeedback] = useState<DatabaseFeedback | null>(null);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [isEditingFeedback, setIsEditingFeedback] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  
  // Nearby places states
  const [nearbyPlaces, setNearbyPlaces] = useState<DatabaseNearbyPlace[]>([]);
  const [nearbyPlacesLoading, setNearbyPlacesLoading] = useState(false);

  const [roomVideoReviews, setRoomVideoReviews] = useState<DatabaseRoomVideoReview[]>([]);
  const [videoReviewsLoading, setVideoReviewsLoading] = useState(false);

  // Map amenity name from DB to an icon class available in project (Line Awesome)
  const mapAmenityToIcon = (name: string): string => {
    const n = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''); // remove accents for robust matching
    if (n.includes("wifi") || n.includes("internet")) return "la-wifi";
    if (n.includes("parking") || n.includes("dau xe") || n.includes("cho de xe")) return "la-parking";
    if (n.includes("kitchen") || n.includes("bep")) return "la-utensils";
    // Air conditioner (explicit checks)
    if (
      n.includes("air conditioner") ||
      n.includes("airconditioner") ||
      n === "ac" ||
      n.startsWith("ac ") ||
      n.endsWith(" ac") ||
      n.includes(" dieu hoa") ||
      n.includes("dieu hoa ") ||
      n.includes("may lanh") ||
      n.includes("may dieu hoa")
    ) return "la-snowflake";
    if (n.includes("heater") || n.includes("nóng")) return "la-fire";
    if (n.includes("tv") || n.includes("tivi")) return "la-tv";
    if (n.includes("pool") || n.includes("hồ bơi")) return "la-swimming-pool";
    if (n.includes("balcony") || n.includes("ban công")) return "la-door-open";
    if (n.includes("pet") || n.includes("thú cưng")) return "la-paw";
    if (n.includes("elevator") || n.includes("thang máy")) return "la-elevator";
    if (n.includes("security") || n.includes("bảo vệ")) return "la-shield-alt";
    // Washing machine / laundry
    if (
      n.includes("may giat") ||
      n.includes("may-giat") ||
      n.includes("maygiat") ||
      n.includes("giat do") ||
      n.includes("giat say") ||
      n.includes("laundry") ||
      n.includes("washer") ||
      n.includes("washing machine") ||
      n.includes("washing")
    ) return "la-tshirt";
    // Private bathroom
    if (
      n.includes("phong tam rieng") ||
      n.includes("private bathroom") ||
      n.includes("bathroom") ||
      n.includes("tam rieng") ||
      n.includes("tam")
    ) return "la-shower";
    if (n.includes("fridge") || n.includes("refrigerator") || n.includes("tu lanh")) return "la-ice-cream";
    // fallback icon
    return "la-check-circle";
  };
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const slugParam = params?.slug;
  const pathSlug =
    typeof slugParam === "string"
      ? slugParam
      : Array.isArray(slugParam) && slugParam[0]
        ? slugParam[0]
        : undefined;
  const idFromPath = pathSlug ? parseRoomDetailSlugParam(pathSlug) : null;
  const idFromQuery = searchParams?.get("id");
  const roomId = idFromPath ?? idFromQuery;

  // /phong-tro-detail?id=... → /phong-tro-detail/{slug}-{id} (giữ query modal/photoId)
  useEffect(() => {
    if (!idFromQuery || idFromPath) return;
    let cancelled = false;
    (async () => {
      const room = await fetchRoomById(idFromQuery);
      if (cancelled || !room?.id) return;
      const qs = new URLSearchParams();
      const modal = searchParams?.get("modal");
      const photoId = searchParams?.get("photoId");
      if (modal) qs.set("modal", modal);
      if (photoId) qs.set("photoId", photoId);
      const suffix = qs.toString() ? `?${qs.toString()}` : "";
      router.replace(
        (buildRoomDetailPath(room.title, String(room.id)) + suffix) as Route
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [idFromQuery, idFromPath, router, searchParams]);

  useEffect(() => {
    const loadRoomData = async () => {
      setLoading(true);
      setRoomVideoReviews([]);
      // Clear old gallery from sessionStorage to prevent showing wrong images
      sessionStorage.removeItem("listing_stay_gallery");
      
      try {
        if (pathSlug && !idFromPath) {
          setRoomData(null);
          setAmenities([]);
          setFeedbacks([]);
          setNearbyPlaces([]);
          setRoomVideoReviews([]);
          return;
        }
        if (roomId) {
          const room = await fetchRoomById(roomId);
          setRoomData(room);
          if (room?.id) {
            const names = await fetchRoomAmenities(String(room.id));
            setAmenities(names);
            
            // Load feedbacks and nearby places
            loadFeedbacks(String(room.id));
            loadNearbyPlaces(String(room.id));
            loadVideoReviews(String(room.id));
          } else {
            setRoomVideoReviews([]);
          }
        } else {
          // Fallback: load the first available room
          const rooms = await fetchRooms(1);
          setRoomData(rooms[0] || null);
          if (rooms[0]?.id) {
            const names = await fetchRoomAmenities(String(rooms[0].id));
            setAmenities(names);
            
            // Load feedbacks and nearby places
            loadFeedbacks(String(rooms[0].id));
            loadNearbyPlaces(String(rooms[0].id));
            loadVideoReviews(String(rooms[0].id));
          } else {
            setRoomVideoReviews([]);
          }
        }
      } catch (error) {
        console.error('Error loading room:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRoomData();
  }, [roomId, pathSlug, idFromPath]);

  // Persist selected room info for other client components (e.g., mobile footer)
  useEffect(() => {
    if (roomData) {
      try {
        // Always update gallery when roomData changes to ensure correct images
        if (roomData.galleryImgs?.length) {
          sessionStorage.setItem("listing_stay_gallery", JSON.stringify(roomData.galleryImgs));
        } else {
          // Clear if no images to prevent showing old images
          sessionStorage.removeItem("listing_stay_gallery");
        }
        // Persist active room id and price per room
        if (roomData.id) {
          sessionStorage.setItem("listing_stay_active_room_id", String(roomData.id));
          if (roomData.price) {
            sessionStorage.setItem(`listing_stay_price__${roomData.id}`, roomData.price);
            // Notify listeners (e.g., MobileFooterSticky) that price is available/updated
            try {
              const event = new CustomEvent("listing_stay_price_updated", {
                detail: {
                  roomId: String(roomData.id),
                  price: roomData.price,
                },
              });
              window.dispatchEvent(event);
            } catch {}
          }
        }
      } catch {}
    }
  }, [roomData]);
  //

  let [isOpenModalAmenities, setIsOpenModalAmenities] = useState(false);
  let [isOpenPhotoGallery, setIsOpenPhotoGallery] = useState(false);
  let [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const thisPathname = usePathname();

  // Load feedbacks for the room
  const loadFeedbacks = async (roomId: string) => {
    setFeedbackLoading(true);
    try {
      const { feedbacks: feedbacksData } = await fetchRoomFeedbacks(roomId);
      console.log('🔍 Feedbacks loaded:', feedbacksData);
      console.log('🔍 Feedbacks count:', feedbacksData.length);
      setFeedbacks(feedbacksData);

      const { average, count } = await getRoomAverageRating(roomId);
      console.log('🔍 Average rating:', average, 'Total count:', count);
      setAverageRating(average);
      setTotalFeedbacks(count);

      if (user) {
        const { feedback } = await hasUserFeedback(roomId);
        console.log('🔍 User feedback:', feedback);
        setUserFeedback(feedback);
      }
    } catch (error) {
      console.error('Error loading feedbacks:', error);
    } finally {
      setFeedbackLoading(false);
    }
  };

  // Load nearby places for the room
  const loadNearbyPlaces = async (roomId: string) => {
    setNearbyPlacesLoading(true);
    try {
      const { places } = await fetchNearbyPlaces(roomId);
      setNearbyPlaces(places);
    } catch (error) {
      console.error('Error loading nearby places:', error);
    } finally {
      setNearbyPlacesLoading(false);
    }
  };

  const loadVideoReviews = async (rid: string) => {
    setVideoReviewsLoading(true);
    try {
      const { rows, error } = await fetchRoomVideoReviewsByRoomId(rid);
      if (error) {
        setRoomVideoReviews([]);
        return;
      }
      setRoomVideoReviews(rows || []);
    } catch (e) {
      console.error("Error loading room video reviews:", e);
      setRoomVideoReviews([]);
    } finally {
      setVideoReviewsLoading(false);
    }
  };

  // Handle submit feedback
  const handleSubmitFeedback = async (rating: number, comment: string) => {
    if (!roomData?.id) return;

    const { success, error } = await createFeedback({
      room_id: String(roomData.id),
      rating,
      comment,
    });

    if (success) {
      setShowFeedbackForm(false);
      // Reload feedbacks
      loadFeedbacks(String(roomData.id));
    } else {
      alert(error || 'Có lỗi xảy ra');
    }
  };

  // Handle update feedback
  const handleUpdateFeedback = async (rating: number, comment: string) => {
    if (!userFeedback?.id || !roomData?.id) return;

    const { success, error } = await updateFeedback(userFeedback.id, {
      rating,
      comment,
    });

    if (success) {
      setIsEditingFeedback(false);
      setShowFeedbackForm(false);
      // Reload feedbacks
      loadFeedbacks(String(roomData.id));
    } else {
      alert(error || 'Có lỗi xảy ra');
    }
  };

  // Handle delete feedback
  const handleDeleteFeedback = async (feedbackId: string) => {
    if (!confirm('Bạn có chắc muốn xóa đánh giá này?')) return;

    if (!roomData?.id) return;

    const { success, error } = await deleteFeedback(feedbackId);

    if (success) {
      // Reload feedbacks
      loadFeedbacks(String(roomData.id));
    } else {
      alert(error || 'Có lỗi xảy ra');
    }
  };

  // Handle edit click
  const handleEditFeedback = (feedbackId: string) => {
    setIsEditingFeedback(true);
    setShowFeedbackForm(true);
  };

  function closeModalAmenities() {
    setIsOpenModalAmenities(false);
  }

  function openModalAmenities() {
    setIsOpenModalAmenities(true);
  }

  const handleOpenModalImageGallery = (index: number = 0) => {
    setCurrentPhotoIndex(index);
    setIsOpenPhotoGallery(true);
    // Hide mobile footer when photo gallery opens
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('photo_gallery_open', 'true');
    }
  };

  const handleClosePhotoGallery = () => {
    setIsOpenPhotoGallery(false);
    // Show mobile footer when photo gallery closes
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('photo_gallery_open');
    }
  };

  const handleNextPhoto = () => {
    const images = roomData?.galleryImgs || PHOTOS;
    if (currentPhotoIndex < images.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
    }
  };

  const handlePrevPhoto = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1);
    }
  };

  const renderSection1 = () => {
    if (loading) {
      return (
        <div className="listingSection__wrap !space-y-6 animate-pulse">
          <div className="flex justify-between items-center">
            <div className="h-6 bg-gray-300 rounded w-24"></div>
            <div className="h-8 bg-gray-300 rounded w-16"></div>
          </div>
          <div className="h-8 bg-gray-300 rounded w-3/4"></div>
          <div className="flex items-center space-x-4">
            <div className="h-4 bg-gray-300 rounded w-20"></div>
            <div className="h-4 bg-gray-300 rounded w-32"></div>
          </div>
          <div className="flex items-center">
            <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
            <div className="ml-2.5 h-4 bg-gray-300 rounded w-40"></div>
          </div>
        </div>
      );
    }

    if (!roomData) {
      return (
        <div className="listingSection__wrap !space-y-6">
          <div className="text-center py-12">
            <p className="text-gray-500">Không tìm thấy thông tin phòng.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="listingSection__wrap !space-y-6">
        {/* 1 */}
        <div className="flex justify-between items-center">
          <Badge name={roomData.listingCategory.name} />
          <LikeSaveBtns roomId={String(roomData?.id)} />
        </div>

        {/* 2 - Title and Desktop Price (price under title) */}
        <div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold">
            {roomData.title}
          </h2>

          {roomData.price && (
            <div className="hidden lg:block mt-2">
              <span className="text-2xl xl:text-3xl font-semibold text-blue-600">
                Từ {roomData.price}
              </span>
              <span className="ml-1 text-sm font-normal text-neutral-500 dark:text-neutral-400">
                /tháng
              </span>
            </div>
          )}
        </div>

        {/* 3 */}
        <div className="flex items-center space-x-4">
          
          <StartRating reviewCount={roomData.reviewCount} point={roomData.reviewStart} />
          <span>·</span>
          <span>
            <i className="las la-map-marker-alt"></i>
            <span className="ml-1">{roomData.address}</span>
          </span>
        </div>

        {/* 4 */}
        <div className="flex items-center">
          <div className="h-10 w-10 flex items-center justify-center rounded-full ring-1 ring-white dark:ring-neutral-900 overflow-hidden">
            <Logo className="w-10" />
          </div>
          <span className="ml-2.5 text-neutral-500 dark:text-neutral-400">
            Đăng bởi{" "}
            <span className="text-neutral-900 dark:text-neutral-200 font-medium">
              YoungHouse Hòa Lạc
            </span>
          </span>
        </div>

        {/* 5 */}
        <div className="w-full border-b border-neutral-100 dark:border-neutral-700" />


        {/* 6 */}
        <div className="flex flex-wrap md:flex-nowrap items-center justify-between xl:justify-start space-x-0 md:space-x-8 xl:space-x-12 gap-3 md:gap-0 text-sm text-neutral-700 dark:text-neutral-300">
        <div className="flex items-center space-x-3">
            <i className=" las la-building text-xl sm:text-2xl"></i>
            <span className=" ">
            Phòng trọ
            </span>
            
          </div>
        <div className="flex items-center space-x-3 shrink-0">
            <i className=" las la-ruler text-xl sm:text-2xl"></i>
            <span className=" ">
              {roomData?.area ?? '-'} <span className="hidden sm:inline-block">m2</span>
            </span>
            
          </div>

          
          {roomData?.author?.phone && (
            <div className="flex items-center space-x-3 shrink-0">
              <i className=" las la-phone text-xl sm:text-2xl"></i>
              <a
                href={`tel:${roomData.author.phone}`}
                className="hover:text-primary-600"
              >
                {roomData.author.phone}
              </a>
            </div>
          )}
          <div className="flex items-center space-x-3 shrink-0">
            <i className=" las la-calendar-alt text-xl sm:text-2xl"></i>
            <span className=" ">
             Ngày đăng bài :  {roomData?.date ?? '-'} <span className="hidden sm:inline-block"></span>
            </span>
          </div>

          
        </div>

      
      </div>
    );
  };

  const renderSection2 = () => {
    const infoLoading = loading || !roomData;
    return (
      <div className="listingSection__wrap">
        <h2 className="text-2xl font-semibold">Thông tin phòng</h2>
        <div className="w-14 border-b border-neutral-200 dark:border-neutral-700"></div>
        <div className="text-neutral-6000 dark:text-neutral-300 space-y-3">
          {infoLoading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-gray-300 rounded w-11/12" />
              <div className="h-4 bg-gray-300 rounded w-10/12" />
              <div className="h-4 bg-gray-300 rounded w-9/12" />
            </div>
          ) : (
            <>
              {roomData?.description && (
                <div 
                  className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-neutral-900 dark:prose-headings:text-neutral-100 prose-p:text-neutral-700 dark:prose-p:text-neutral-300 prose-strong:text-neutral-900 dark:prose-strong:text-neutral-100 prose-li:text-neutral-700 dark:prose-li:text-neutral-300 prose-a:text-primary-600 dark:prose-a:text-primary-400 prose-ul:marker:text-neutral-400 dark:prose-ul:marker:text-neutral-500"
                  dangerouslySetInnerHTML={{ __html: roomData.description }} 
                />
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  const renderSectionVideoReviews = () => {
    if (videoReviewsLoading && roomVideoReviews.length === 0) {
      return (
        <div className="listingSection__wrap">
          <h2 className="text-2xl font-semibold">Video review</h2>
          <div className="w-14 border-b border-neutral-200 dark:border-neutral-700" />
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Đang tải video…</p>
        </div>
      );
    }
    if (!roomVideoReviews.length) return null;

    return (
      <div className="listingSection__wrap">
        <div>
          <h2 className="text-2xl font-semibold">Video review</h2>
          <span className="block mt-2 text-neutral-500 dark:text-neutral-400 text-sm">
            Video TikTok nhúng trực tiếp trên trang (bấm play trong khung để xem).
          </span>
        </div>
        <div className="w-14 border-b border-neutral-200 dark:border-neutral-700" />
        <div className="space-y-8">
          {roomVideoReviews.map((row) => {
            const vid = extractTikTokVideoId(row.source_url);
            const label =
              (row.display_title || "").trim() || roomData?.title || "Video TikTok";
            if (!vid) {
              return (
                <div
                  key={row.id}
                  className="rounded-2xl border border-amber-200 bg-amber-50/80 dark:border-amber-900/40 dark:bg-amber-950/20 px-4 py-3 text-sm text-amber-900 dark:text-amber-100"
                >
                  Không đọc được ID video từ link TikTok. Hãy kiểm tra lại URL trong Admin (dạng
                  …/video/… hoặc mã embed).
                </div>
              );
            }
            return (
              <div
                key={row.id}
                className="rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-black shadow-sm"
              >
                <div
                  className="relative mx-auto w-full max-w-[420px] bg-black"
                  style={{
                    height: "min(75vh, 680px)",
                    minHeight: 380,
                  }}
                >
                  <iframe
                    title={label}
                    src={buildTikTokPlayerIframeSrc(vid, { autoplay: false })}
                    className="absolute inset-0 h-full w-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                </div>
                <p className="px-4 py-3 text-sm font-medium text-neutral-900 dark:text-neutral-100 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800">
                  {label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderSection3 = () => {
    const list = amenities?.slice(0, 12) || [];
    return (
      <div className="listingSection__wrap">
        <div>
          <h2 className="text-2xl font-semibold">Tiện ích</h2>
          <span className="block mt-2 text-neutral-500 dark:text-neutral-400">
            {` Về tiện ích và dịch vụ của phòng`}
          </span>
        </div>
        <div className="w-14 border-b border-neutral-200 dark:border-neutral-700"></div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 text-sm text-neutral-700 dark:text-neutral-300 ">
          {loading ? (
            Array.from({ length: 9 }).map((_, idx) => (
              <div key={idx} className="h-5 bg-gray-300 rounded w-2/3 animate-pulse" />
            ))
          ) : list.length ? (
            list.map((name) => (
              <div key={name} className="flex items-center space-x-3">
                <i className={`text-3xl las ${mapAmenityToIcon(name)}`}></i>
                <span>{name}</span>
              </div>
            ))
          ) : (
            <span className="text-neutral-500">Không có tiện ích</span>
          )}
        </div>

        <div className="w-14 border-b border-neutral-200"></div>
        <div>
          <ButtonSecondary onClick={openModalAmenities}>
            Xem thêm tiện ích
          </ButtonSecondary>
        </div>
        {renderMotalAmenities()}
      </div>
    );
  };

  const renderMotalAmenities = () => {
    return (
      <Transition appear show={isOpenModalAmenities} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 overflow-y-auto"
          onClose={closeModalAmenities}
        >
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-40" />
            </Transition.Child>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="inline-block py-8 h-screen w-full max-w-4xl">
                <div className="inline-flex pb-2 flex-col w-full text-left align-middle transition-all transform overflow-hidden rounded-2xl bg-white dark:bg-neutral-900 dark:border dark:border-neutral-700 dark:text-neutral-100 shadow-xl h-full">
                  <div className="relative flex-shrink-0 px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 text-center">
                    <h3
                      className="text-lg font-medium leading-6 text-gray-900"
                      id="headlessui-dialog-title-70"
                    >
                      Tiện ích
                    </h3>
                    <span className="absolute left-3 top-3">
                      <ButtonClose onClick={closeModalAmenities} />
                    </span>
                  </div>
                  <div className="px-8 overflow-auto text-neutral-700 dark:text-neutral-300 divide-y divide-neutral-200">
                    {(amenities || []).map((name) => (
                      <div
                        key={name}
                        className="flex items-center py-2.5 sm:py-4 lg:py-5 space-x-5 lg:space-x-8"
                      >
                        <i className={`text-4xl text-neutral-6000 las ${mapAmenityToIcon(name)}`}></i>
                        <span>{name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    );
  };

  

  const renderSection5 = () => {
    return (
      <div className="listingSection__wrap">
        {/* HEADING */}
        <h2 className="text-2xl font-semibold">Thông tin người đăng</h2>
        <div className="w-14 border-b border-neutral-200 dark:border-neutral-700"></div>

        {/* host */}
        <div className="flex items-center space-x-4">
          <Logo className="w-10" />
          
          <div>
            <a className="block text-xl font-medium" href="##">
              YoungHouse Hòa Lạc
            </a>
            <div className="mt-1.5 flex items-center text-sm text-neutral-500 dark:text-neutral-400">
              <StartRating />
              <span className="mx-2">·</span>
              <span>0372858098</span>
            </div>
          </div>
        </div>

        {/* desc */}
        <span className="block text-neutral-6000 dark:text-neutral-300">
          YoungHouse Hòa Lạc là trang web cho thuê phòng trọ uy tín tại Hoà Lạc 
        </span>

        {/* info */}
        <div className="block text-neutral-500 dark:text-neutral-400 space-y-2.5">
          <div className="flex items-center space-x-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>Tham gia vào tháng 10 năm 2025</span>
          </div>
          <div className="flex items-center space-x-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
              />
            </svg>
            <span>Tỉ lệ phản hồi - 100%</span>
          </div>
          <div className="flex items-center space-x-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>

            <span>Phản hồi nhanh - trong vài giờ</span>
          </div>
        </div>

        {/* == */}
        <div className="w-14 border-b border-neutral-200 dark:border-neutral-700"></div>
        <div>
          <ButtonSecondary href="/author">Xem hồ sơ người đăng</ButtonSecondary>
        </div>
      </div>
    );
  };

  

  const renderSection7 = () => {
    return (
      <div className="listingSection__wrap">
        {/* HEADING */}
        <div>
          <h2 className="text-2xl font-semibold">Vị trí</h2>
          <span className="block mt-2 text-neutral-500 dark:text-neutral-400">
            {roomData?.address ?? '-'}
          </span>
        </div>
        <div className="w-14 border-b border-neutral-200 dark:border-neutral-700" />

        {/* MAP */}
        {roomData?.maps ? (
          <div className="aspect-w-5 aspect-h-5 sm:aspect-h-3 ring-1 ring-black/10 rounded-xl z-0">
            <div className="rounded-xl overflow-hidden z-0">
              <iframe
                width="100%"
                height="100%"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={roomData.maps}
              ></iframe>
            </div>
          </div>
        ) : (
          <div className="aspect-w-5 aspect-h-5 sm:aspect-h-3 ring-1 ring-black/10 rounded-xl z-0 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
            <p className="text-neutral-500 dark:text-neutral-400">
              Chưa có bản đồ cho phòng này
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderSectionNearbyPlaces = () => {
    // Category icons mapping
    const getCategoryIcon = (category: string) => {
      switch (category) {
        case 'university':
        case 'school':
          return 'la-university';
        case 'hospital':
          return 'la-hospital';
        case 'supermarket':
          return 'la-shopping-cart';
        case 'mall':
          return 'la-shopping-bag';
        case 'park':
          return 'la-tree';
        case 'bus_stop':
          return 'la-bus';
        case 'metro':
          return 'la-subway';
        case 'restaurant':
          return 'la-utensils';
        case 'cafe':
          return 'la-coffee';
        case 'gym':
          return 'la-dumbbell';
        default:
          return 'la-map-marker';
      }
    };

    const getCategoryColor = (category: string) => {
      switch (category) {
        case 'university':
        case 'school':
          return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30';
        case 'hospital':
          return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
        case 'supermarket':
        case 'mall':
          return 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30';
        case 'park':
          return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
        case 'bus_stop':
        case 'metro':
          return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30';
        case 'restaurant':
        case 'cafe':
          return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
        case 'gym':
          return 'text-pink-600 dark:text-pink-400 bg-pink-100 dark:bg-pink-900/30';
        default:
          return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30';
      }
    };

    return (
      <div className="listingSection__wrap">
        {/* HEADING */}
        <h2 className="text-2xl font-semibold">Khu vực xung quanh</h2>
        <div className="w-14 border-b border-neutral-200 dark:border-neutral-700" />

        {/* CONTENT */}
        {nearbyPlacesLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
              Đang tải...
            </p>
          </div>
        ) : nearbyPlaces.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-neutral-500 dark:text-neutral-400">
              Chưa có thông tin về khu vực xung quanh
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {nearbyPlaces.map((place) => (
              <div
                key={place.id}
                className="flex items-start gap-4 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 hover:shadow-md transition-shadow"
              >
                <div className={`flex-shrink-0 w-10 h-10 rounded-full ${getCategoryColor(place.category)} flex items-center justify-center`}>
                  <i className={`las ${getCategoryIcon(place.category)} text-xl`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <h4 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                      {place.name}
                    </h4>
                    <span className="text-sm font-medium text-primary-600 dark:text-primary-400 whitespace-nowrap">
                      Cách {place.distance_km}km
                    </span>
                  </div>
                  {place.description && (
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                      {place.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderSectionFeedback = () => {
    return (
      <div className="listingSection__wrap">
        {/* HEADING */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Đánh giá từ khách thuê</h2>
            {totalFeedbacks > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center">
                  <StarIcon className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="ml-1 text-lg font-semibold">
                    {averageRating.toFixed(1)}
                  </span>
                </div>
                <span className="text-neutral-500 dark:text-neutral-400">
                  ({totalFeedbacks} đánh giá)
                </span>
              </div>
            )}
          </div>

          {user && !userFeedback && !showFeedbackForm && (
            <ButtonPrimary
              onClick={() => {
                setIsEditingFeedback(false);
                setShowFeedbackForm(true);
              }}
            >
              Viết đánh giá
            </ButtonPrimary>
          )}
          
         
        </div>
        <div className="w-14 border-b border-neutral-200 dark:border-neutral-700" />

        {/* USER FEEDBACK FORM */}
        {showFeedbackForm && user && (
          <div className="p-6 rounded-2xl border-2 border-primary-500 bg-primary-50/10 dark:bg-primary-900/10">
            <h3 className="text-lg font-semibold mb-4">
              {isEditingFeedback ? "Chỉnh sửa đánh giá" : "Viết đánh giá của bạn"}
            </h3>
            <FeedbackForm
              roomId={String(roomData?.id)}
              onSubmit={isEditingFeedback ? handleUpdateFeedback : handleSubmitFeedback}
              onCancel={() => {
                setShowFeedbackForm(false);
                setIsEditingFeedback(false);
              }}
              isEditing={isEditingFeedback}
              initialData={isEditingFeedback ? userFeedback || undefined : undefined}
            />
          </div>
        )}

        {/* USER'S OWN FEEDBACK */}
        {userFeedback && !showFeedbackForm && (
          <div>
            <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-3">
              Đánh giá của bạn
            </h3>
            <FeedbackItem
              feedback={{
                ...userFeedback,
                profiles: {
                  name: user?.name || "Bạn",
                  role: user?.role || "tenant",
                },
              }}
              isOwnFeedback={true}
              onEdit={handleEditFeedback}
              onDelete={handleDeleteFeedback}
            />
          </div>
        )}

        {/* ALL FEEDBACKS */}
        {feedbackLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
              Đang tải đánh giá...
            </p>
          </div>
        ) : (
          <>
            {/* Show all feedbacks section if there are any feedbacks */}
            {feedbacks.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  Tất cả đánh giá ({feedbacks.length})
                </h3>
                {feedbacks
                  .filter(f => !userFeedback || f.id !== userFeedback.id) // Don't show user's own feedback twice
                  .map((feedback) => (
                    <FeedbackItem
                      key={feedback.id}
                      feedback={feedback}
                      isOwnFeedback={false}
                    />
                  ))}
              </div>
            )}
            
            {/* Show empty state only if no feedbacks and no user feedback */}
            {feedbacks.length === 0 && !userFeedback && (
              <div className="text-center py-8">
                <p className="text-neutral-500 dark:text-neutral-400 mb-4">
                  Chưa có đánh giá nào cho phòng này.
                </p>
                {user ? (
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Hãy là người đầu tiên viết đánh giá!
                  </p>
                ) : (
                  <ButtonSecondary
                    onClick={() => router.push('/login')}
                    sizeClass="px-5 py-2.5"
                  >
                    Đăng nhập để viết đánh giá
                  </ButtonSecondary>
                )}
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  const renderSidebar = () => {
    return (
      <div className="listingSectionSidebar__wrap shadow-xl">
        <div className="flex justify-between">
          <span className="text-3xl font-semibold">
            {roomData?.price}
            <span className="ml-1 text-base font-normal text-neutral-500 dark:text-neutral-400">
              /tháng
            </span>
          </span>
          <StartRating />
        </div>

        <form className="flex flex-col border border-neutral-200 dark:border-neutral-700 rounded-3xl ">
          <StayDatesRangeInput className="flex-1 z-[11]" />
          <div className="w-full border-b border-neutral-200 dark:border-neutral-700"></div>
          <GuestsInput className="flex-1" />
        </form>

        <div className="flex flex-col space-y-4">
          <div className="flex justify-between text-neutral-6000 dark:text-neutral-300">
            <span>{roomData?.price}</span>
            
          </div>
          <div className="flex justify-between text-neutral-6000 dark:text-neutral-300">
            <span>Phí dịch vụ</span>
            <span>230.000 đ</span>
          </div>
          <div className="border-b border-neutral-200 dark:border-neutral-700"></div>
          <div className="flex justify-between font-semibold">
           
          </div>
        </div>

        <ButtonPrimary href={"/checkout"}>Đặt lịch xem phòng</ButtonPrimary>
      </div>
    );
  };

  const renderHeader = () => {
    if (loading) {
      return (
        <header className="rounded-md sm:rounded-xl">
          <div className="relative grid grid-cols-3 sm:grid-cols-4 gap-1 sm:gap-2 animate-pulse">
            <div className="col-span-2 row-span-3 sm:row-span-2 relative rounded-md sm:rounded-xl overflow-hidden bg-gray-300 h-64"></div>
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className={`relative rounded-md sm:rounded-xl overflow-hidden bg-gray-300 h-32 ${
                  index >= 3 ? "hidden sm:block" : ""
                }`}
              ></div>
            ))}
          </div>
        </header>
      );
    }

    const imagesRaw = roomData?.galleryImgs || [];
    const images = (Array.isArray(imagesRaw) ? imagesRaw : []).filter(Boolean) as any[];
    const imagesToShow = images.length ? images : PHOTOS;
    
    return (
      <header className="rounded-md sm:rounded-xl">
        <div className="relative grid grid-cols-3 sm:grid-cols-4 gap-1 sm:gap-2">
          <div
            className="col-span-2 row-span-3 sm:row-span-2 relative rounded-md sm:rounded-xl overflow-hidden cursor-pointer"
            onClick={() => handleOpenModalImageGallery(0)}
          >
            <SupabaseImage
              fill
              className="object-cover rounded-md sm:rounded-xl"
              src={imagesToShow[0]}
              alt={roomData?.title || "Room image"}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
            />
            <div className="absolute left-3 top-3 z-[2]">
              <RoomStatusBadge status={roomData?.roomStatus} />
            </div>
            <div className="absolute inset-0 bg-neutral-900 bg-opacity-20 opacity-0 hover:opacity-100 transition-opacity"></div>
          </div>
          {imagesToShow.filter((_, i) => i >= 1 && i < 5).map((item, index) => (
            <div
              key={index}
              className={`relative rounded-md sm:rounded-xl overflow-hidden ${
                index >= 3 ? "hidden sm:block" : ""
              }`}
            >
              <div className="aspect-w-4 aspect-h-3 sm:aspect-w-6 sm:aspect-h-5">
                <SupabaseImage
                  fill
                  className="object-cover rounded-md sm:rounded-xl"
                  src={item || ""}
                  alt={`${roomData?.title || "Room"} - Image ${index + 2}`}
                  sizes="400px"
                />
              </div>
              <div
                className="absolute inset-0 bg-neutral-900 bg-opacity-20 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                onClick={() => handleOpenModalImageGallery(index + 1)}
              />
            </div>
          ))}

          <button
            className="absolute hidden md:flex md:items-center md:justify-center left-3 bottom-3 px-4 py-2 rounded-xl bg-neutral-100 text-neutral-500 hover:bg-neutral-200 z-10"
            onClick={() => handleOpenModalImageGallery(0)}
          >
            <Squares2X2Icon className="w-5 h-5" />
            <span className="ml-2 text-neutral-800 text-sm font-medium">
              Xem tất cả ảnh
            </span>
          </button>
        </div>
      </header>
    );
  };

  // Tạo breadcrumb items
  const breadcrumbItems = [
    { label: "Trang chủ", href: "/" },
    { label: "Tìm phòng trọ", href: "/phong-tro" },
    { label: roomData?.title || "Chi tiết phòng", href: undefined }
  ];

  const images = (roomData?.galleryImgs || []).filter(Boolean) as any[];
  const imagesToShow = images.length ? images : PHOTOS;

  return (
    <div className="nc-ListingStayDetailPage">
      {/* BREADCRUMB */}
      <div className="container py-4 pl-0 mb-[30px] mt-[20px]">
        <Breadcrumb items={breadcrumbItems} className="px-4 sm:px-0" />
      </div>
      
      {/*  HEADER */}
      {renderHeader()}

      {/* MAIN */}
      <main className=" relative z-10 mt-11 flex flex-col lg:flex-row ">
        {/* CONTENT */}
        <div className="w-full lg:w-3/5 xl:w-2/3 space-y-8 lg:space-y-10 lg:pr-10">
          {renderSection1()}
          {renderSection2()}
          {renderSectionVideoReviews()}
          {renderSection3()}
          {renderSection7()}
          {renderSectionNearbyPlaces()}
          {renderSectionFeedback()}
          
          {renderSection5()}
          
          
          
          
        </div>

        {/* SIDEBAR */}
        <div className="hidden lg:block flex-grow mt-14 lg:mt-0">
          <div className="sticky top-28">{renderSidebar()}</div>
        </div>
      </main>

      {/* PHOTO GALLERY MODAL */}
      <Transition appear show={isOpenPhotoGallery} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={handleClosePhotoGallery}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-90" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-5xl transform overflow-hidden text-center transition-all">
                  {/* Close button */}
                  <button
                    onClick={handleClosePhotoGallery}
                    className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  >
                    <ButtonClose className="text-white" />
                  </button>

                  {/* Image counter */}
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-black/50 text-white text-sm">
                    {currentPhotoIndex + 1} / {imagesToShow.length}
                  </div>

                  {/* Main image */}
                  <div className="relative w-full h-[80vh] flex items-center justify-center">
                    <SupabaseImage
                      src={imagesToShow[currentPhotoIndex]}
                      alt={`${roomData?.title || "Room"} - Image ${currentPhotoIndex + 1}`}
                      fill
                      className="object-contain"
                      sizes="100vw"
                      priority
                    />
                  </div>

                  {/* Navigation buttons */}
                  {currentPhotoIndex > 0 && (
                    <button
                      onClick={handlePrevPhoto}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                    >
                      <ArrowRightIcon className="w-6 h-6 text-white rotate-180" />
                    </button>
                  )}

                  {currentPhotoIndex < imagesToShow.length - 1 && (
                    <button
                      onClick={handleNextPhoto}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                    >
                      <ArrowRightIcon className="w-6 h-6 text-white" />
                    </button>
                  )}

                  {/* Thumbnails */}
                  <div className="absolute bottom-4 left-0 right-0 px-4">
                    <div className="flex gap-2 overflow-x-auto justify-center pb-2 scrollbar-hide">
                      {imagesToShow.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentPhotoIndex(idx)}
                          className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                            idx === currentPhotoIndex
                              ? 'border-white scale-110'
                              : 'border-transparent opacity-60 hover:opacity-100'
                          }`}
                        >
                          <SupabaseImage
                            src={img}
                            alt={`Thumbnail ${idx + 1}`}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default ListingStayDetailPage;



