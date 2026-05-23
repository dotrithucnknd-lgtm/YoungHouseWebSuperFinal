"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { StayDataType } from "@/data/types";

interface CompareContextType {
  compareList: StayDataType[];
  addToCompare: (room: StayDataType) => boolean;
  removeFromCompare: (roomId: string | number) => void;
  clearCompare: () => void;
  isInCompare: (roomId: string | number) => boolean;
  compareCount: number;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

const MAX_COMPARE_ITEMS = 4; // Giới hạn tối đa 4 phòng để so sánh
const STORAGE_KEY = "compare_rooms";

export function CompareProvider({ children }: { children: ReactNode }) {
  const [compareList, setCompareList] = useState<StayDataType[]>([]);

  // Load từ localStorage khi component mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setCompareList(parsed);
      }
    } catch (error) {
      console.error("Error loading compare list from localStorage:", error);
    }
  }, []);

  // Lưu vào localStorage khi compareList thay đổi
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(compareList));
    } catch (error) {
      console.error("Error saving compare list to localStorage:", error);
    }
  }, [compareList]);

  const addToCompare = (room: StayDataType): boolean => {
    // Kiểm tra đã có trong list chưa
    if (isInCompare(room.id)) {
      return false; // Đã có rồi
    }

    // Kiểm tra số lượng tối đa
    if (compareList.length >= MAX_COMPARE_ITEMS) {
      return false; // Đã đạt giới hạn
    }

    setCompareList((prev) => [...prev, room]);
    return true;
  };

  const removeFromCompare = (roomId: string | number) => {
    setCompareList((prev) => prev.filter((room) => room.id !== roomId));
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  const isInCompare = (roomId: string | number): boolean => {
    return compareList.some((room) => room.id === roomId);
  };

  const compareCount = compareList.length;

  return (
    <CompareContext.Provider
      value={{
        compareList,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
        compareCount,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (context === undefined) {
    throw new Error("useCompare must be used within a CompareProvider");
  }
  return context;
}


