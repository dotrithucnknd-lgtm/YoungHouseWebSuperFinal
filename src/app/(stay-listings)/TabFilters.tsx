"use client";

import React, { Fragment, useMemo, useState, useEffect } from "react";
import { Dialog, Popover, Transition } from "@headlessui/react";
import NcInputNumber from "@/components/NcInputNumber";
import ButtonPrimary from "@/shared/ButtonPrimary";
import ButtonThird from "@/shared/ButtonThird";
import ButtonClose from "@/shared/ButtonClose";
import Checkbox from "@/shared/Checkbox";
import Slider from "rc-slider";
import convertNumbThousand from "@/utils/convertNumbThousand";

// DEMO DATA
const typeOfPaces = [
  {
    name: "Gác lửng",
    description: "Có chỗ để mình",
  },
  {
    name: "Wifi",
    description: "Có wifi",
  },
  {
    name: "Phòng tắm",
    description:
      "Có phòng tắm",
  },
  {
    name: "Điều hoà",
    description: "Có điều hoà",
  },
  
];

const moreFilter1 = [
  { name: "Kitchen", defaultChecked: true },
  { name: "Air conditioning", defaultChecked: true },
  { name: "Heating" },
  { name: "Dryer" },
  { name: "Washer" },
  { name: "Wifi" },
  { name: "Indoor fireplace" },
  { name: "Breakfast" },
  { name: "Hair dryer" },
  { name: " Dedicated workspace" },
];

const moreFilter2 = [
  { name: " Free parking on premise" },
  { name: "Hot tub" },
  { name: "Gym" },
  { name: " Pool" },
  { name: " EV charger" },
];

const moreFilter3 = [
  { name: " House" },
  { name: "Bed and breakfast" },
  { name: "Apartment", defaultChecked: true },
  { name: " Boutique hotel" },
  { name: " Bungalow" },
  { name: " Chalet", defaultChecked: true },
  { name: " Condominium", defaultChecked: true },
  { name: " Cottage" },
  { name: " Guest suite" },
  { name: " Guesthouse" },
];

const moreFilter4 = [{ name: " Pets allowed" }, { name: "Smoking allowed" }];

import { useRouter, useSearchParams } from "next/navigation";

const TabFilters = () => {
  const [isOpenMoreFilter, setisOpenMoreFilter] = useState(false);
  const [isOpenMoreFilterMobile, setisOpenMoreFilterMobile] = useState(false);
  const [rangePrices, setRangePrices] = useState([0, 10000000]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams?.get("sort") || "";
  const hasPriceFilter = useMemo(() => {
    try {
      const min = Number(searchParams?.get("minPrice") || "");
      const max = Number(searchParams?.get("maxPrice") || "");
      const nextMin = Number.isFinite(min) && min > 0 ? min : 0;
      const nextMax = Number.isFinite(max) && max > 0 ? max : 10000000;
      return nextMin !== 0 || nextMax !== 10000000;
    } catch {
      return false;
    }
  }, [searchParams]);
  const sortLabel = useMemo(() => {
    if (currentSort === "price_asc") return "Giá: thấp → cao";
    if (currentSort === "price_desc") return "Giá: cao → thấp";
    return "Sắp xếp";
  }, [currentSort]);

  const setSortParam = (value: "price_asc" | "price_desc" | "") => {
    try {
      const url = new URL(window.location.href);
      if (value) url.searchParams.set("sort", value); else url.searchParams.delete("sort");
      url.searchParams.delete("page"); // reset pagination when sorting
      router.push(`${url.pathname}?${url.searchParams.toString()}`);
    } catch {}
  };

  // District/Ward filter options (khu vực)
  const districtOptions = [
    { label: "Tất cả khu vực", value: "" },
    { label: "Tân Xã", value: "Tân Xã" },
    { label: "Thạch Hoà", value: "Thạch Hoà" },
    { label: "Bình Yên", value: "Bình Yên" },
  ];

  const currentDistrict = searchParams?.get("district") || "";
  const hasDistrictFilter = Boolean(currentDistrict);

  const setDistrictParam = (value: string) => {
    try {
      const url = new URL(window.location.href);
      if (value) {
        url.searchParams.set("district", value);
      } else {
        url.searchParams.delete("district");
      }
      url.searchParams.delete("page"); // reset pagination when filtering
      router.push(`${url.pathname}?${url.searchParams.toString()}`);
    } catch {}
  };

  const clearDistrictFromUrl = () => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete("district");
      url.searchParams.delete("page");
      router.push(`${url.pathname}?${url.searchParams.toString()}`);
    } catch {}
  };


  const applyPriceToUrl = (min: number, max: number) => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("minPrice", String(Math.max(0, Math.floor(min))));
      url.searchParams.set("maxPrice", String(Math.max(0, Math.floor(max))));
      url.searchParams.delete("page"); // reset pagination when filtering
      router.push(`${url.pathname}?${url.searchParams.toString()}`);
    } catch {}
  };

  const clearPriceFromUrl = () => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete("minPrice");
      url.searchParams.delete("maxPrice");
      url.searchParams.delete("page");
      router.push(`${url.pathname}?${url.searchParams.toString()}`);
    } catch {}
  };

  const formatVND = (value: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);  //
  const closeModalMoreFilter = () => setisOpenMoreFilter(false);
  const openModalMoreFilter = () => setisOpenMoreFilter(true);
  //
  const closeModalMoreFilterMobile = () => setisOpenMoreFilterMobile(false);
  const openModalMoreFilterMobile = () => setisOpenMoreFilterMobile(true);

  const renderXClear = (variant: 'default' | 'brown' = 'default') => {
    const bgColor = variant === 'brown' 
      ? 'bg-amber-700 dark:bg-amber-600' 
      : 'bg-primary-500';
    return (
      <span className={`w-4 h-4 rounded-full ${bgColor} text-white flex items-center justify-center cursor-pointer flex-shrink-0`}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-3 w-3"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </span>
    );
  };

  const renderTabsTypeOfPlace = () => {
    return (
      <Popover className="relative">
        {({ open, close }) => (
          <>
            <Popover.Button
              className={`flex items-center justify-center px-4 py-2 text-sm rounded-full border border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-6000 focus:outline-none text-neutral-900 dark:text-neutral-100 ${
                open ? "!border-neutral-500 " : ""
              }`}
            >
              <span>Tiện nghi</span>
              <i className="las la-angle-down ml-2"></i>
            </Popover.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel className="absolute z-10 w-screen max-w-sm px-4 mt-3 left-0 sm:px-0 lg:max-w-md">
                <div className="overflow-hidden rounded-2xl shadow-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700">
                  <div className="relative flex flex-col px-5 py-6 space-y-5">
                    {typeOfPaces.map((item) => (
                      <div key={item.name} className="">
                        <Checkbox
                          name={item.name}
                          label={item.name}
                          subLabel={item.description}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="p-5 bg-neutral-50 dark:bg-neutral-900 dark:border-t dark:border-neutral-800 flex items-center justify-between">
                    <ButtonThird onClick={close} sizeClass="px-4 py-2 sm:px-5">
                      Clear
                    </ButtonThird>
                    <ButtonPrimary
                      onClick={close}
                      sizeClass="px-4 py-2 sm:px-5"
                    >
                      Apply
                    </ButtonPrimary>
                  </div>
                </div>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
    );
  };

  const renderTabsRoomAndBeds = () => {
    return (
      <Popover className="relative">
        {({ open, close }) => (
          <>
            <Popover.Button
              className={`flex items-center justify-center px-4 py-2 text-sm rounded-full border border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-6000 focus:outline-none text-neutral-900 dark:text-neutral-100 ${
                open ? "!border-neutral-500 " : ""
              }`}
            >
              <span>Phòng</span>
              <i className="las la-angle-down ml-2"></i>
            </Popover.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel className="absolute z-10 w-screen max-w-sm px-4 mt-3 left-0 sm:px-0 lg:max-w-md">
                <div className="overflow-hidden rounded-2xl shadow-xl bg-white dark:bg-neutral-900   border border-neutral-200 dark:border-neutral-700">
                  <div className="relative flex flex-col px-5 py-6 space-y-5">
                    <NcInputNumber label="Giường" max={10} />
                    <NcInputNumber label="Phòng ngủ" max={10} />
                    <NcInputNumber label="Phòng tắm" max={10} />
                  </div>
                  <div className="p-5 bg-neutral-50 dark:bg-neutral-900 dark:border-t dark:border-neutral-800 flex items-center justify-between">
                    <ButtonThird onClick={close} sizeClass="px-4 py-2 sm:px-5">
                      Clear
                    </ButtonThird>
                    <ButtonPrimary
                      onClick={close}
                      sizeClass="px-4 py-2 sm:px-5"
                    >
                      Apply
                    </ButtonPrimary>
                  </div>
                </div>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
    );
  };

  // Quick price filter options theo mẫu
  const quickPriceFilters = [
    { label: "Tất cả mức giá", min: 0, max: 0 }, // 0 means no filter
    { label: "Dưới 1 triệu", min: 0, max: 1000000 },
    { label: "1 - 2 triệu", min: 1000000, max: 2000000 },
    { label: "2 - 3 triệu", min: 2000000, max: 3000000 },
    { label: "3 - 4 triệu", min: 3000000, max: 4000000 },
    { label: "4 - 5 triệu", min: 4000000, max: 5000000 },
    { label: "5 - 6 triệu", min: 5000000, max: 6000000 },
    
    { label: "Trên 6 triệu", min: 6000000, max: 0 }, // 0 means no max
  ];

  const [selectedQuickFilter, setSelectedQuickFilter] = useState<number>(0);
  const [customMinPrice, setCustomMinPrice] = useState<string>("");
  const [customMaxPrice, setCustomMaxPrice] = useState<string>("");

  // Initialize from URL
  useEffect(() => {
    const min = Number(searchParams?.get("minPrice") || "");
    const max = Number(searchParams?.get("maxPrice") || "");
    
    if (!Number.isFinite(min) && !Number.isFinite(max)) {
      setSelectedQuickFilter(0);
      setCustomMinPrice("");
      setCustomMaxPrice("");
      setRangePrices([0, 6000000]);
      return;
    }

    const currentMin = Number.isFinite(min) ? min : 0;
    const currentMax = Number.isFinite(max) ? max : 6000000;
    
    // Update rangePrices
    setRangePrices([currentMin, currentMax]);
    
    // Check if matches any quick filter
    const matchedIndex = quickPriceFilters.findIndex((filter) => {
      if (filter.min === 0 && filter.max === 0) return false; // Skip "Tất cả"
      if (filter.max === 0) {
        // "Trên X triệu"
        return currentMin === filter.min && max >= 6000000;
      }
      return currentMin === filter.min && currentMax === filter.max;
    });

    if (matchedIndex !== -1) {
      setSelectedQuickFilter(matchedIndex);
      setCustomMinPrice("");
      setCustomMaxPrice("");
    } else {
      setSelectedQuickFilter(-1); // Custom
      setCustomMinPrice(Number.isFinite(min) ? String(min) : "");
      setCustomMaxPrice(Number.isFinite(max) && max < 6000000 ? String(max) : "");
    }
  }, [searchParams]);

  const handleQuickFilterSelect = (index: number) => {
    setSelectedQuickFilter(index);
    const filter = quickPriceFilters[index];
    
    if (filter.min === 0 && filter.max === 0) {
      // "Tất cả mức giá"
      clearPriceFromUrl();
      setRangePrices([0, 10000000]);
    } else if (filter.max === 0) {
      // "Trên X triệu"
      applyPriceToUrl(filter.min, 6000000); // Large max value
      setRangePrices([filter.min, 6000000]);
    } else {
      applyPriceToUrl(filter.min, filter.max);
      setRangePrices([filter.min, filter.max]);
    }
    setCustomMinPrice("");
    setCustomMaxPrice("");
  };

  const handleCustomPriceApply = () => {
    const min = customMinPrice ? Number(customMinPrice.replace(/[^0-9]/g, "")) : 0;
    const max = customMaxPrice ? Number(customMaxPrice.replace(/[^0-9]/g, "")) : 200000000;
    
    if (min > 0 || max < 200000000) {
      applyPriceToUrl(min, max);
      setSelectedQuickFilter(-1);
    }
  };

  const handleReset = () => {
    clearPriceFromUrl();
    setSelectedQuickFilter(0);
    setCustomMinPrice("");
    setCustomMaxPrice("");
    setRangePrices([0, 6000000]);
  };

  const renderTabsPriceFilter = () => {
    const hasFilter = hasPriceFilter;

    return (
      <Popover className="relative">
        {({ open, close }) => (
          <>
                  <Popover.Button
                    className={`flex items-center justify-center px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-full border transition-all whitespace-nowrap min-w-fit relative ${
                      hasFilter
                        ? "border-neutral-400 bg-neutral-100 dark:bg-neutral-800 dark:border-neutral-600"
                        : "border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600"
                    } ${open ? "!border-neutral-500" : ""}`}
                  >
                    <i className={`las la-dollar-sign text-sm sm:text-base mr-1 sm:mr-1.5 flex-shrink-0 ${
                      hasFilter ? "text-neutral-700 dark:text-neutral-300" : "text-neutral-600 dark:text-neutral-400"
                    }`}></i>
                    <span className={`flex-shrink-0 font-medium ${
                      hasFilter 
                        ? "text-neutral-900 dark:text-neutral-100" 
                        : "text-neutral-900 dark:text-neutral-100"
                    }`}>Mức giá</span>
                    {hasFilter && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReset();
                        }}
                        className="ml-1.5 flex-shrink-0"
                      >
                        {renderXClear()}
                      </span>
                    )}
                    <i className={`las la-chevron-down ml-1 sm:ml-1.5 text-xs flex-shrink-0 ${
                      hasFilter ? "text-neutral-700 dark:text-neutral-300" : "text-neutral-600 dark:text-neutral-400"
                    }`}></i>
                  </Popover.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel className="absolute z-10 mt-2 left-3 w-[min(calc(100vw-1.5rem),22rem)] sm:left-1/2 sm:-translate-x-1/2 sm:w-[min(85vw,20rem)] sm:max-w-sm">
                <div className="overflow-hidden rounded-2xl shadow-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 max-h-[85vh] flex flex-col w-full">
                  {/* Header */}
                  <div className="px-3 py-2.5 sm:px-6 sm:py-4 border-b border-primary-500 flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <i className="las la-dollar-sign text-xl sm:text-2xl text-primary-500 mr-2"></i>
                        <h3 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                          Mức giá
                        </h3>
                      </div>
                      <button
                        onClick={close}
                        className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 flex-shrink-0"
                      >
                        <i className="las la-times text-lg sm:text-xl"></i>
                      </button>
                    </div>
                  </div>

                  <div className="px-3 py-3 sm:px-6 sm:py-5 space-y-3 sm:space-y-6 overflow-y-auto overflow-x-hidden flex-1">
                    {/* Custom Price Input Section */}
                    <div className="space-y-2.5 sm:space-y-4">
                      <div className="flex items-end gap-1.5 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          <label className="block text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 sm:mb-2">
                            Giá thấp nhất
                          </label>
                          <input
                            type="text"
                            placeholder="Từ"
                            value={selectedQuickFilter === -1 ? (customMinPrice || String(rangePrices[0])) : ""}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^0-9]/g, "");
                              setCustomMinPrice(value);
                              if (value) {
                                const numValue = Number(value);
                                if (Number.isFinite(numValue) && numValue >= 0) {
                                  setRangePrices([numValue, rangePrices[1]]);
                                  setSelectedQuickFilter(-1);
                                }
                              } else {
                                setRangePrices([0, rangePrices[1]]);
                              }
                            }}
                            className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 text-sm border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                        <div className="flex items-end pb-1.5 sm:pb-2 flex-shrink-0 px-0.5">
                          <i className="las la-arrow-right text-lg sm:text-2xl text-neutral-400"></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <label className="block text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 sm:mb-2">
                            Giá cao nhất
                          </label>
                          <input
                            type="text"
                            placeholder="Đến"
                            value={selectedQuickFilter === -1 ? (customMaxPrice || String(rangePrices[1])) : ""}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^0-9]/g, "");
                              setCustomMaxPrice(value);
                              if (value) {
                                const numValue = Number(value);
                                if (Number.isFinite(numValue) && numValue > 0) {
                                  setRangePrices([rangePrices[0], numValue]);
                                  setSelectedQuickFilter(-1);
                                }
                              } else {
                                setRangePrices([rangePrices[0], 6000000]);
                              }
                            }}
                            className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 text-sm border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                      </div>

                      {/* Slider */}
                      <div className="pt-1 sm:pt-2 w-full overflow-hidden">
                        <div className="w-full px-0.5">
                          <Slider
                            range
                            className="text-primary-500"
                            min={0}
                            max={6000000}
                            step={100000}
                            value={[rangePrices[0], rangePrices[1]]}
                            allowCross={false}
                            onChange={(e) => {
                              const values = e as number[];
                              setRangePrices(values);
                              setCustomMinPrice(String(values[0]));
                              setCustomMaxPrice(String(values[1]));
                              setSelectedQuickFilter(-1);
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Quick Price Filters */}
                    <div className="space-y-2 sm:space-y-3">
                      {quickPriceFilters.map((filter, index) => (
                        <label
                          key={index}
                          className="flex items-center cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 p-1.5 sm:p-2 rounded-lg transition-colors w-full"
                        >
                          <input
                            type="radio"
                            name="priceFilter"
                            checked={selectedQuickFilter === index}
                            onChange={() => handleQuickFilterSelect(index)}
                            className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500 focus:ring-primary-500 focus:ring-2 border-neutral-300 dark:border-neutral-600 flex-shrink-0"
                          />
                          <span className="ml-2 sm:ml-3 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 whitespace-nowrap flex-1 min-w-0">
                            {filter.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="px-3 py-2.5 sm:px-6 sm:py-4 bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-1.5 sm:gap-2 flex-shrink-0 overflow-x-hidden">
                    <button
                      onClick={() => {
                        handleReset();
                        close();
                      }}
                      className="flex items-center px-2.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors flex-shrink-0 min-w-0"
                    >
                      <i className="las la-redo-alt mr-1 sm:mr-2 text-xs sm:text-sm flex-shrink-0"></i>
                      <span className="whitespace-nowrap">Đặt lại</span>
                    </button>
                    <button
                      onClick={() => {
                        if (selectedQuickFilter === -1) {
                          handleCustomPriceApply();
                        }
                        close();
                      }}
                      className="px-3 py-1.5 sm:px-6 sm:py-2 text-xs sm:text-sm font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-600 transition-colors flex-shrink-0 whitespace-nowrap"
                    >
                      Tìm ngay
                    </button>
                  </div>
                </div>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
    );
  };

  const renderTabsAreaFilter = () => {
    return (
      <Popover className="relative">
        {({ open, close }) => (
          <>
            <Popover.Button
              className={`flex items-center justify-center px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-full border transition-all whitespace-nowrap min-w-fit relative ${
                hasDistrictFilter
                  ? "border-neutral-400 bg-neutral-100 dark:bg-neutral-800 dark:border-neutral-600"
                  : "border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600"
              } ${open ? "!border-neutral-500" : ""}`}
            >
              <i className={`las la-map-marker text-sm sm:text-base mr-1 sm:mr-1.5 flex-shrink-0 ${
                hasDistrictFilter ? "text-neutral-700 dark:text-neutral-300" : "text-neutral-600 dark:text-neutral-400"
              }`}></i>
              <span className={`flex-shrink-0 font-medium ${
                hasDistrictFilter 
                  ? "text-neutral-900 dark:text-neutral-100" 
                  : "text-neutral-900 dark:text-neutral-100"
              }`}>
                {currentDistrict || "Khu vực"}
              </span>
              {hasDistrictFilter && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    clearDistrictFromUrl();
                  }}
                  className="ml-1.5 flex-shrink-0"
                >
                  {renderXClear()}
                </span>
              )}
              <i className={`las la-chevron-down ml-1 sm:ml-1.5 text-xs flex-shrink-0 ${
                hasDistrictFilter ? "text-neutral-700 dark:text-neutral-300" : "text-neutral-600 dark:text-neutral-400"
              }`}></i>
            </Popover.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel className="absolute z-10 mt-3 left-1/2 -translate-x-1/2 w-[min(85vw,14rem)] px-4 sm:left-0 sm:translate-x-0 sm:w-screen sm:max-w-xs sm:px-0">
                <div className="overflow-hidden rounded-2xl shadow-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700">
                  <div className="relative flex flex-col px-5 py-4 space-y-2">
                    {districtOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setDistrictParam(option.value);
                          close();
                        }}
                        className={`text-left px-3 py-2 rounded-lg transition-colors ${
                          currentDistrict === option.value
                            ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-medium"
                            : "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
    );
  };

  const renderTabsSort = () => {
    return (
      <Popover className="relative">
        {({ open, close }) => (
          <>
            <Popover.Button
              className={`flex items-center justify-center px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-full border border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-6000 focus:outline-none text-neutral-900 dark:text-neutral-100 ${
                open ? "!border-neutral-500 " : ""
              }`}
            >
              <span className="whitespace-nowrap">{sortLabel}</span>
              <i className="las la-angle-down ml-1.5 sm:ml-2 text-xs"></i>
            </Popover.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel className="absolute z-10 mt-3 left-1/2 -translate-x-1/2 w-[min(85vw,14rem)] px-4 sm:left-0 sm:translate-x-0 sm:w-screen sm:max-w-xs sm:px-0">
                <div className="overflow-hidden rounded-2xl shadow-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700">
                  <div className="relative flex flex-col px-5 py-4 space-y-2">
                    <button onClick={() => { setSortParam("price_asc"); close(); }} className={`text-left px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 ${currentSort === 'price_asc' ? 'bg-neutral-100 dark:bg-neutral-800 font-medium' : ''}`}>Giá: thấp → cao</button>
                    <button onClick={() => { setSortParam("price_desc"); close(); }} className={`text-left px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 ${currentSort === 'price_desc' ? 'bg-neutral-100 dark:bg-neutral-800 font-medium' : ''}`}>Giá: cao → thấp</button>
                    {currentSort ? (
                      <button onClick={() => { setSortParam(""); close(); }} className="text-left px-3 py-2 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800">Bỏ sắp xếp</button>
                    ) : null}
                  </div>
                </div>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
    );
  };

  const renderMoreFilterItem = (
    data: {
      name: string;
      defaultChecked?: boolean;
    }[]
  ) => {
    const list1 = data.filter((_, i) => i < data.length / 2);
    const list2 = data.filter((_, i) => i >= data.length / 2);
    return (
      <div className="grid grid-cols-2 gap-8">
        <div className="flex flex-col space-y-5">
          {list1.map((item) => (
            <Checkbox
              key={item.name}
              name={item.name}
              label={item.name}
              defaultChecked={!!item.defaultChecked}
            />
          ))}
        </div>
        <div className="flex flex-col space-y-5">
          {list2.map((item) => (
            <Checkbox
              key={item.name}
              name={item.name}
              label={item.name}
              defaultChecked={!!item.defaultChecked}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderTabMoreFilter = () => {
    return (
      <div>
        

        <Transition appear show={isOpenMoreFilter} as={Fragment}>
          <Dialog
            as="div"
            className="fixed inset-0 z-50 overflow-y-auto"
            onClose={closeModalMoreFilter}
          >
            <div className="min-h-screen text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-40 dark:bg-opacity-60" />
              </Transition.Child>

              {/* This element is to trick the browser into centering the modal contents. */}
              <span
                className="inline-block h-screen align-middle"
                aria-hidden="true"
              >
                &#8203;
              </span>
              <Transition.Child
                className="inline-block py-8 px-2 h-screen w-full max-w-4xl"
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <div className="inline-flex flex-col w-full max-w-4xl text-left align-middle transition-all transform overflow-hidden rounded-2xl bg-white dark:bg-neutral-900 dark:border dark:border-neutral-700 dark:text-neutral-100 shadow-xl h-full">
                  <div className="relative flex-shrink-0 px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 text-center">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900"
                    >
                      More filters
                    </Dialog.Title>
                    <span className="absolute left-3 top-3">
                      <ButtonClose onClick={closeModalMoreFilter} />
                    </span>
                  </div>

                  <div className="flex-grow overflow-y-auto">
                    <div className="px-10 divide-y divide-neutral-200 dark:divide-neutral-800">
                      <div className="py-7">
                        <h3 className="text-xl font-medium">Amenities</h3>
                        <div className="mt-6 relative ">
                          {renderMoreFilterItem(moreFilter1)}
                        </div>
                      </div>
                      <div className="py-7">
                        <h3 className="text-xl font-medium">Facilities</h3>
                        <div className="mt-6 relative ">
                          {renderMoreFilterItem(moreFilter2)}
                        </div>
                      </div>
                      <div className="py-7">
                        <h3 className="text-xl font-medium">Property type</h3>
                        <div className="mt-6 relative ">
                          {renderMoreFilterItem(moreFilter3)}
                        </div>
                      </div>
                      <div className="py-7">
                        <h3 className="text-xl font-medium">House rules</h3>
                        <div className="mt-6 relative ">
                          {renderMoreFilterItem(moreFilter4)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 flex-shrink-0 bg-neutral-50 dark:bg-neutral-900 dark:border-t dark:border-neutral-800 flex items-center justify-between">
                    <ButtonThird
                      onClick={closeModalMoreFilter}
                      sizeClass="px-4 py-2 sm:px-5"
                    >
                      Clear
                    </ButtonThird>
                    <ButtonPrimary
                      onClick={closeModalMoreFilter}
                      sizeClass="px-4 py-2 sm:px-5"
                    >
                      Apply
                    </ButtonPrimary>
                  </div>
                </div>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition>
      </div>
    );
  };

  const renderActiveFilterTags = () => {
    return (
      <div className="flex flex-wrap items-center gap-2 mt-2 lg:hidden">
        {hasPriceFilter && (
          <div className="flex items-center px-3 py-1.5 text-xs rounded-full border border-neutral-400 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100">
            <span className="mr-1.5 whitespace-nowrap">{`${formatVND(rangePrices[0])} - ${formatVND(rangePrices[1])}`}</span>
            <span 
              onClick={(e) => { 
                e.stopPropagation(); 
                clearPriceFromUrl(); 
              }}
              className="cursor-pointer"
            >
              {renderXClear('brown')}
            </span>
          </div>
        )}
        {hasDistrictFilter && (
          <div className="flex items-center px-3 py-1.5 text-xs rounded-full border border-neutral-400 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100">
            <span className="mr-1.5 whitespace-nowrap">{currentDistrict}</span>
            <span 
              onClick={(e) => { 
                e.stopPropagation(); 
                clearDistrictFromUrl(); 
              }}
              className="cursor-pointer"
            >
              {renderXClear('brown')}
            </span>
          </div>
        )}
      </div>
    );
  };

  const renderTabMoreFilterMobile = () => {
    return (
      <div>

        <Transition appear show={isOpenMoreFilterMobile} as={Fragment}>
          <Dialog
            as="div"
            className="fixed inset-0 z-50 overflow-y-auto"
            onClose={closeModalMoreFilterMobile}
          >
            <div className="min-h-screen text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-40 dark:bg-opacity-60" />
              </Transition.Child>

              {/* This element is to trick the browser into centering the modal contents. */}
              <span
                className="inline-block h-screen align-middle"
                aria-hidden="true"
              >
                &#8203;
              </span>
              <Transition.Child
                className="inline-block py-8 px-2 h-screen w-full max-w-4xl"
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <div className="inline-flex flex-col w-full max-w-4xl text-left align-middle transition-all transform overflow-hidden rounded-2xl bg-white dark:bg-neutral-900 dark:border dark:border-neutral-700 dark:text-neutral-100 shadow-xl h-full">
                  <div className="relative flex-shrink-0 px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 text-center">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900"
                    >
                      More filters
                    </Dialog.Title>
                    <span className="absolute left-3 top-3">
                      <ButtonClose onClick={closeModalMoreFilterMobile} />
                    </span>
                  </div>

                  <div className="flex-grow overflow-y-auto">
                    <div className="px-4 sm:px-6 divide-y divide-neutral-200 dark:divide-neutral-800">
                      {/* ---- */}
                      <div className="py-7">
                        <h3 className="text-xl font-medium">Khu vực</h3>
                        <div className="mt-4 grid grid-cols-1 gap-3">
                          {districtOptions.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => {
                                setDistrictParam(option.value);
                                if (!option.value) closeModalMoreFilterMobile();
                              }}
                              className={`text-left px-4 py-3 rounded-xl border transition-colors ${
                                currentDistrict === option.value
                                  ? "border-neutral-400 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-medium"
                                  : "border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      {/* ---- */}
                      <div className="py-7">
                        <h3 className="text-xl font-medium">Sắp xếp</h3>
                        <div className="mt-4 grid grid-cols-1 gap-3">
                          <button onClick={() => setSortParam('price_asc')} className={`text-left px-4 py-3 rounded-xl border ${currentSort === 'price_asc' ? 'border-neutral-400 bg-neutral-100 dark:bg-neutral-800' : 'border-neutral-200 dark:border-neutral-700'}`}>Giá: thấp → cao</button>
                          <button onClick={() => setSortParam('price_desc')} className={`text-left px-4 py-3 rounded-xl border ${currentSort === 'price_desc' ? 'border-neutral-400 bg-neutral-100 dark:bg-neutral-800' : 'border-neutral-200 dark:border-neutral-700'}`}>Giá: cao → thấp</button>
                          {currentSort ? (
                            <button onClick={() => setSortParam('')} className="text-left px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-500">Bỏ sắp xếp</button>
                          ) : null}
                        </div>
                      </div>
                      {/* ---- */}
                      <div className="py-7">
                        <h3 className="text-xl font-medium">Type of place</h3>
                        <div className="mt-6 relative ">
                          {renderMoreFilterItem(typeOfPaces)}
                        </div>
                      </div>

                      {/* ---- */}
                      <div className="py-7">
                        <h3 className="text-xl font-medium">Range Prices</h3>
                        <div className="mt-6 relative ">
                          <div className="relative flex flex-col space-y-8">
                            <div className="space-y-5">
                              <Slider
                                range
                                className="text-red-400"
                                min={0}
                                max={10000000}
                                value={[rangePrices[0], rangePrices[1]]}
                                allowCross={false}
                                onChange={(e) => setRangePrices(e as number[])}
                              />
                            </div>

                            <div className="flex justify-between space-x-5">
                              <div>
                                <label
                                  htmlFor="minPrice"
                                  className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                                >
                                  Min price
                                </label>
                                <div className="mt-1 relative rounded-md">
                                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-neutral-500 sm:text-sm">
                                      VND
                                    </span>
                                  </div>
                                  <input
                                    type="text"
                                    name="minPrice"
                                    disabled
                                    id="minPrice"
                                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-3 sm:text-sm border-neutral-200 rounded-full text-neutral-900"
                                    value={formatVND(rangePrices[0])}
                                  />
                                </div>
                              </div>
                              <div>
                                <label
                                  htmlFor="maxPrice"
                                  className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                                >
                                  Max price
                                </label>
                                <div className="mt-1 relative rounded-md">
                                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-neutral-500 sm:text-sm">
                                      VND
                                    </span>
                                  </div>
                                  <input
                                    type="text"
                                    disabled
                                    name="maxPrice"
                                    id="maxPrice"
                                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-3 sm:text-sm border-neutral-200 rounded-full text-neutral-900"
                                    value={formatVND(rangePrices[1])}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* ---- */}
                      <div className="py-7">
                        <h3 className="text-xl font-medium">Phòng</h3>
                        <div className="mt-6 relative flex flex-col space-y-5">
                          <NcInputNumber label="Giường" max={10} />
                          <NcInputNumber label="Phòng ngủ" max={10} />
                          <NcInputNumber label="Phòng tắm" max={10} />
                        </div>
                      </div>

                      {/* ---- */}
                      <div className="py-7">
                        <h3 className="text-xl font-medium">Amenities</h3>
                        <div className="mt-6 relative ">
                          {renderMoreFilterItem(moreFilter1)}
                        </div>
                      </div>

                      {/* ---- */}
                      <div className="py-7">
                        <h3 className="text-xl font-medium">Facilities</h3>
                        <div className="mt-6 relative ">
                          {renderMoreFilterItem(moreFilter2)}
                        </div>
                      </div>

                      {/* ---- */}
                      <div className="py-7">
                        <h3 className="text-xl font-medium">Property type</h3>
                        <div className="mt-6 relative ">
                          {renderMoreFilterItem(moreFilter3)}
                        </div>
                      </div>

                      {/* ---- */}
                      <div className="py-7">
                        <h3 className="text-xl font-medium">House rules</h3>
                        <div className="mt-6 relative ">
                          {renderMoreFilterItem(moreFilter4)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 sm:p-6 flex-shrink-0 bg-neutral-50 dark:bg-neutral-900 dark:border-t dark:border-neutral-800 flex items-center justify-between">
                    <ButtonThird
                      onClick={() => { clearPriceFromUrl(); closeModalMoreFilterMobile(); }}
                      sizeClass="px-4 py-2 sm:px-5"
                    >
                      Xoá giá
                    </ButtonThird>
                    <ButtonPrimary
                      onClick={() => { applyPriceToUrl(rangePrices[0], rangePrices[1]); closeModalMoreFilterMobile(); }}
                      sizeClass="px-4 py-2 sm:px-5"
                    >
                      Áp dụng
                    </ButtonPrimary>
                  </div>
                </div>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition>
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* Filter buttons row */}
      <div className="flex flex-wrap items-center gap-2 lg:gap-3 justify-between w-full overflow-visible">
        {/* Filter giá, Khu vực - hiển thị trên cả mobile và desktop */}
        <div className="flex flex-wrap items-center gap-2 lg:gap-3 flex-1 min-w-0">
          {renderTabsPriceFilter()}
          {renderTabsAreaFilter()}
        </div>
        {/* Sort - ngoài cùng bên phải trên tất cả thiết bị */}
        <div className="flex-shrink-0">
          {renderTabsSort()}
        </div>
      </div>
      {/* Active filter tags - chỉ hiển thị trên mobile */}
      {renderActiveFilterTags()}
      {/* More filters modal - chỉ hiển thị trên mobile */}
      <div className="lg:hidden">
        {renderTabMoreFilterMobile()}
      </div>
    </div>
  );
};

export default TabFilters;
