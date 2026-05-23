"use client";

import React from "react";
import { useCompare } from "@/contexts/CompareContext";
import { StayDataType } from "@/data/types";
import Link from "next/link";
import Image from "next/image";
import StartRating from "@/components/StartRating";
import BtnCompareIcon from "@/components/BtnCompareIcon";
import formatNumberVi from "@/utils/formatNumberVi";
import GallerySlider from "@/components/GallerySlider";

export default function ComparePage() {
  const { compareList, clearCompare } = useCompare();

  if (compareList.length === 0) {
    return (
      <div className="container py-16 min-h-screen">
        <div className="max-w-2xl mx-auto text-center">
          <svg
            className="mx-auto h-24 w-24 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"
            />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Chưa có phòng nào để so sánh
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Hãy thêm các phòng trọ bạn muốn so sánh bằng cách click vào biểu tượng so sánh trên mỗi phòng.
          </p>
          <Link
            href="/phong-tro"
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Tìm phòng trọ
          </Link>
        </div>
      </div>
    );
  }

  // Helper function to get field value
  const getFieldValue = (room: StayDataType, field: string): string | number | undefined => {
    switch (field) {
      case "title":
        return room.title;
      case "price":
        return room.price;
      case "address":
        return room.address;
      case "area":
        return room.area;
      case "bedrooms":
        return room.bedrooms;
      case "bathrooms":
        return room.bathrooms;
      case "maxGuests":
        return room.maxGuests;
      case "reviewStart":
        return room.reviewStart;
      case "reviewCount":
        return room.reviewCount;
      case "listingCategory":
        return room.listingCategory?.name;
      default:
        return undefined;
    }
  };

  // Helper function to format price
  const formatPrice = (price: string | number): string => {
    if (typeof price === "string") {
      // Remove non-numeric characters and parse
      const numPrice = parseInt(price.replace(/[^0-9]/g, ""));
      if (!isNaN(numPrice)) {
        return `${formatNumberVi(numPrice)} đ/tháng`;
      }
      return price;
    }
    return `${formatNumberVi(price)} đ/tháng`;
  };

  const comparisonFields = [
    { key: "image", label: "Ảnh" },
    { key: "title", label: "Tên phòng" },
    { key: "price", label: "Giá thuê" },
    { key: "address", label: "Địa chỉ" },
    { key: "area", label: "Diện tích" },
    { key: "bathrooms", label: "Phòng tắm" },
    { key: "listingCategory", label: "Loại phòng" },
    { key: "rating", label: "Đánh giá" },
    { key: "actions", label: "Thao tác" },
  ];

  return (
    <div className="container py-8 min-h-screen">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            So sánh phòng trọ
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            So sánh {compareList.length} phòng trọ đã chọn
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={clearCompare}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            Xóa tất cả
          </button>
          <Link
            href="/phong-tro"
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Thêm phòng khác
          </Link>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50 dark:bg-neutral-800">
              <tr>
                <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-neutral-700">
                  Tiêu chí
                </th>
                {compareList.map((room) => (
                  <th
                    key={room.id}
                    className="px-4 py-4 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-neutral-700 min-w-[250px]"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="relative w-32 h-32 rounded-lg overflow-hidden">
                        {(room.galleryImgs[0] || room.featuredImage) && (
                          <Image
                            src={room.galleryImgs[0] || room.featuredImage}
                            alt={room.title}
                            fill
                            className="object-cover"
                            sizes="128px"
                          />
                        )}
                      </div>
                      <h3 className="font-semibold text-base line-clamp-2">{room.title}</h3>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonFields.map((field, idx) => (
                <tr
                  key={field.key}
                  className={`${
                    idx % 2 === 0
                      ? "bg-white dark:bg-neutral-900"
                      : "bg-gray-50 dark:bg-neutral-800"
                  } hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors`}
                >
                  <td className="px-4 py-4 font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-neutral-700">
                    {field.label}
                  </td>
                  {compareList.map((room) => (
                    <td
                      key={`${room.id}-${field.key}`}
                      className="px-4 py-4 text-center text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-neutral-700"
                    >
                      {field.key === "image" ? (
                        <div className="relative w-full h-48 rounded-lg overflow-hidden">
                          <GallerySlider
                            uniqueID={`compare_${room.id}`}
                            ratioClass="aspect-w-4 aspect-h-3"
                            galleryImgs={room.galleryImgs}
                            imageClass="rounded-lg"
                          />
                        </div>
                      ) : field.key === "price" ? (
                        <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                          {formatPrice(room.price)}
                        </span>
                      ) : field.key === "rating" ? (
                        <div className="flex flex-col items-center gap-1">
                          <StartRating
                            point={room.reviewStart}
                            reviewCount={room.reviewCount}
                          />
                          <span className="text-xs text-gray-500">
                            {room.reviewCount} đánh giá
                          </span>
                        </div>
                      ) : field.key === "area" ? (
                        <span>
                          {getFieldValue(room, field.key)
                            ? `${getFieldValue(room, field.key)} m²`
                            : "—"}
                        </span>
                      ) : field.key === "bedrooms" ||
                        field.key === "bathrooms" ||
                        field.key === "maxGuests" ? (
                        <span>
                          {getFieldValue(room, field.key) || "—"}
                          {field.key === "bedrooms" && " phòng"}
                          {field.key === "bathrooms" && " phòng"}
                          {field.key === "maxGuests" && " người"}
                        </span>
                      ) : field.key === "actions" ? (
                        <div className="flex flex-col gap-2 items-center">
                          <Link
                            href={room.href}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            Xem chi tiết
                          </Link>
                          <BtnCompareIcon room={room} />
                        </div>
                      ) : (
                        <span className="line-clamp-2">
                          {getFieldValue(room, field.key) || "—"}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {compareList.map((room) => (
          <div
            key={room.id}
            className="bg-white dark:bg-neutral-900 rounded-lg shadow-md p-4 border border-gray-200 dark:border-neutral-700"
          >
            <h3 className="font-semibold text-lg mb-2 line-clamp-1">{room.title}</h3>
            <p className="text-blue-600 dark:text-blue-400 font-semibold mb-2">
              {formatPrice(room.price)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
              {room.address}
            </p>
            <Link
              href={room.href}
              className="block w-full text-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Xem chi tiết
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}


