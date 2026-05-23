"use client";

import React, { useEffect, useState } from "react";
import { fetchUniversities, DatabaseUniversity } from "@/lib/supabaseServices";

interface UniversitySelectorProps {
  selectedUniversities: string[];
  onChange: (universityIds: string[]) => void;
}

const UniversitySelector: React.FC<UniversitySelectorProps> = ({
  selectedUniversities,
  onChange,
}) => {
  const [universities, setUniversities] = useState<DatabaseUniversity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUniversities();
  }, []);

  const loadUniversities = async () => {
    try {
      const { universities: data, error } = await fetchUniversities();
      if (!error) {
        setUniversities(data);
      }
    } catch (error) {
      console.error("Error loading universities:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (universityId: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedUniversities, universityId]);
    } else {
      onChange(selectedUniversities.filter(id => id !== universityId));
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Trường đại học gần đây
        </label>
        <div className="animate-pulse">
          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-32 mb-2"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-neutral-100 dark:bg-neutral-800 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
        Trường đại học gần đây
      </label>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        Chọn các trường đại học gần phòng trọ của bạn để thu hút sinh viên
      </p>
      
      <div className="space-y-2">
        {universities.map((university) => (
          <label
            key={university.id}
            className="flex items-center gap-3 p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
          >
            <input
              type="checkbox"
              checked={selectedUniversities.includes(university.id)}
              onChange={(e) => handleCheckboxChange(university.id, e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-neutral-100 border-neutral-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <div className="flex-1">
              <div className="font-medium text-neutral-900 dark:text-white">
                {university.short_name}
              </div>
              <div className="text-sm text-neutral-500 dark:text-neutral-400">
                {university.name}
              </div>
              {university.address && (
                <div className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                  📍 {university.address}
                </div>
              )}
            </div>
          </label>
        ))}
      </div>

      {selectedUniversities.length > 0 && (
        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-600 dark:text-blue-400">
            ✅ Đã chọn {selectedUniversities.length} trường đại học
          </p>
        </div>
      )}
    </div>
  );
};

export default UniversitySelector;