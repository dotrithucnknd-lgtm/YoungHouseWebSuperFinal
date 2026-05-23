"use client";

import React, { useState, useEffect, useRef, FC } from "react";
import { MapPinIcon } from "@heroicons/react/24/outline";
import { supabase } from "@/lib/supabaseClient";

export interface LocationSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onSelect?: (location: string) => void;
}

// Remove Vietnamese tones for search
const removeVietnameseTones = (str: string): string => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
};

interface LocationSuggestion {
  city?: string;
  district?: string;
  ward?: string;
  fullText: string;
}

const LocationSearchInput: FC<LocationSearchInputProps> = ({
  value,
  onChange,
  placeholder = "Bạn muốn tìm trọ ở đâu?",
  className = "",
  onSelect,
}) => {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch location suggestions from database
  const fetchLocations = async (searchText: string) => {
    if (!searchText || searchText.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const searchNormalized = removeVietnameseTones(searchText.toLowerCase());
      
      // Query all available rooms to filter client-side (for better Vietnamese search)
      const { data, error } = await supabase
        .from("rooms")
        .select("city, district, ward")
        .eq("status", "available")
        .limit(500); // Get more data to filter client-side

      if (error) {
        console.error("Error fetching locations:", error);
        setSuggestions([]);
        return;
      }

      // Process and deduplicate locations with Vietnamese accent-insensitive search
      const locationMap = new Map<string, LocationSuggestion>();
      
      data?.forEach((room) => {
        // Check city (with and without accents)
        if (room.city) {
          const cityNormalized = removeVietnameseTones(room.city.toLowerCase());
          if (cityNormalized.includes(searchNormalized)) {
            const key = `city:${room.city}`;
            if (!locationMap.has(key)) {
              locationMap.set(key, {
                city: room.city,
                fullText: room.city,
              });
            }
          }
        }
        
        // Check district
        if (room.district) {
          const districtNormalized = removeVietnameseTones(room.district.toLowerCase());
          if (districtNormalized.includes(searchNormalized)) {
            const key = `district:${room.district}`;
            if (!locationMap.has(key)) {
              locationMap.set(key, {
                district: room.district,
                fullText: room.district,
              });
            }
          }
        }
        
        // Check ward
        if (room.ward) {
          const wardNormalized = removeVietnameseTones(room.ward.toLowerCase());
          if (wardNormalized.includes(searchNormalized)) {
            const key = `ward:${room.ward}`;
            if (!locationMap.has(key)) {
              locationMap.set(key, {
                ward: room.ward,
                fullText: room.ward,
              });
            }
          }
        }
        
        // Full address combination
        if (room.city && room.district) {
          const fullAddress = `${room.ward ? room.ward + ", " : ""}${room.district}, ${room.city}`;
          const fullAddressNormalized = removeVietnameseTones(fullAddress.toLowerCase());
          if (fullAddressNormalized.includes(searchNormalized)) {
            const key = `full:${fullAddress}`;
            if (!locationMap.has(key)) {
              locationMap.set(key, {
                city: room.city,
                district: room.district,
                ward: room.ward,
                fullText: fullAddress,
              });
            }
          }
        }
      });

      // Sort by relevance (exact match first, then partial)
      const sortedSuggestions = Array.from(locationMap.values()).sort((a, b) => {
        const aLower = removeVietnameseTones(a.fullText.toLowerCase());
        const bLower = removeVietnameseTones(b.fullText.toLowerCase());
        
        // Exact match at start gets priority
        if (aLower.startsWith(searchNormalized) && !bLower.startsWith(searchNormalized)) return -1;
        if (bLower.startsWith(searchNormalized) && !aLower.startsWith(searchNormalized)) return 1;
        
        // Then by length (shorter = more specific)
        if (a.fullText.length !== b.fullText.length) {
          return a.fullText.length - b.fullText.length;
        }
        
        return a.fullText.localeCompare(b.fullText);
      });

      setSuggestions(sortedSuggestions.slice(0, 10)); // Limit to 10 suggestions
    } catch (error) {
      console.error("Error in fetchLocations:", error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (value) {
        fetchLocations(value);
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [value]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (location: LocationSuggestion) => {
    onChange(location.fullText);
    setShowSuggestions(false);
    if (onSelect) {
      onSelect(location.fullText);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setShowSuggestions(true);
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MapPinIcon className="h-5 w-5 text-neutral-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
        />
        {loading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
          </div>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelect(suggestion)}
              className="w-full text-left px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-700 flex items-center space-x-3 transition-colors"
            >
              <MapPinIcon className="h-5 w-5 text-neutral-400 flex-shrink-0" />
              <span className="text-neutral-700 dark:text-neutral-200">{suggestion.fullText}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationSearchInput;

