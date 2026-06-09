"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import SurveyBuilder, { type SurveyFormData } from "@/components/survey/SurveyBuilder";
import { createSurvey, YOUNG_HOUSE_SURVEY_TEMPLATE } from "@/lib/surveyServices";
import Link from "next/link";
import { ArrowLeftIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";

const emptyForm: SurveyFormData = {
  title: "",
  description: "",
  is_active: false,
  expires_at: "",
  questions: [],
};

export default function ManagerNewSurveyPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState<SurveyFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const loadTemplate = () => {
    setForm({
      title: YOUNG_HOUSE_SURVEY_TEMPLATE.title,
      description: YOUNG_HOUSE_SURVEY_TEMPLATE.description,
      is_active: false,
      expires_at: "",
      questions: YOUNG_HOUSE_SURVEY_TEMPLATE.questions.map((q) => ({ ...q })),
    });
  };

  const handleSubmit = async () => {
    if (!user || !form.title.trim()) return;
    if (form.questions.length === 0) {
      alert("Vui lòng thêm ít nhất một câu hỏi");
      return;
    }

    setSubmitting(true);
    const { data, error } = await createSurvey(
      {
        title: form.title,
        description: form.description,
        is_active: form.is_active,
        expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      },
      form.questions,
      user.id
    );
    setSubmitting(false);

    if (error) {
      alert("Lỗi tạo khảo sát: " + error);
      return;
    }

    router.push(`/manager/surveys/${data!.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/manager/surveys"
            className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Tạo khảo sát mới</h2>
            <p className="text-sm text-neutral-500">Thiết kế phiếu khảo sát gửi cho khách thuê</p>
          </div>
        </div>
        <button
          type="button"
          onClick={loadTemplate}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-primary-300 text-primary-700 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-950/20"
        >
          <DocumentDuplicateIcon className="w-4 h-4" />
          Dùng mẫu Young House
        </button>
      </div>

      <SurveyBuilder
        data={form}
        onChange={setForm}
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel="Tạo khảo sát"
      />
    </div>
  );
}
