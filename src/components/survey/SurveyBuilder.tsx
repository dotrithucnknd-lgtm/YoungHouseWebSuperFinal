"use client";

import React from "react";
import Input from "@/shared/Input";
import Textarea from "@/shared/Textarea";
import ButtonPrimary from "@/shared/ButtonPrimary";
import { PlusIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/outline";
import type { SurveyQuestionInput, SurveyQuestionType } from "@/lib/surveyServices";

export interface SurveyFormData {
  title: string;
  description: string;
  is_active: boolean;
  expires_at: string;
  questions: SurveyQuestionInput[];
}

interface SurveyBuilderProps {
  data: SurveyFormData;
  onChange: (data: SurveyFormData) => void;
  onSubmit: () => void;
  submitting?: boolean;
  submitLabel?: string;
}

const QUESTION_TYPES: { value: SurveyQuestionType; label: string }[] = [
  { value: "text", label: "Văn bản ngắn" },
  { value: "textarea", label: "Văn bản dài" },
  { value: "single_choice", label: "Chọn một đáp án" },
  { value: "multiple_choice", label: "Chọn nhiều đáp án" },
];

export default function SurveyBuilder({
  data,
  onChange,
  onSubmit,
  submitting = false,
  submitLabel = "Lưu khảo sát",
}: SurveyBuilderProps) {
  const updateQuestion = (index: number, patch: Partial<SurveyQuestionInput>) => {
    const questions = [...data.questions];
    questions[index] = { ...questions[index], ...patch };
    onChange({ ...data, questions });
  };

  const addQuestion = () => {
    onChange({
      ...data,
      questions: [
        ...data.questions,
        {
          question_text: "",
          question_type: "text",
          options: [],
          is_required: true,
          sort_order: data.questions.length,
        },
      ],
    });
  };

  const removeQuestion = (index: number) => {
    const questions = data.questions
      .filter((_, i) => i !== index)
      .map((q, i) => ({ ...q, sort_order: i }));
    onChange({ ...data, questions });
  };

  const moveQuestion = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= data.questions.length) return;
    const questions = [...data.questions];
    [questions[index], questions[newIndex]] = [questions[newIndex], questions[index]];
    onChange({
      ...data,
      questions: questions.map((q, i) => ({ ...q, sort_order: i })),
    });
  };

  const updateOption = (qIndex: number, optIndex: number, value: string) => {
    const questions = [...data.questions];
    const options = [...questions[qIndex].options];
    options[optIndex] = value;
    questions[qIndex] = { ...questions[qIndex], options };
    onChange({ ...data, questions });
  };

  const addOption = (qIndex: number) => {
    const questions = [...data.questions];
    questions[qIndex] = {
      ...questions[qIndex],
      options: [...questions[qIndex].options, ""],
    };
    onChange({ ...data, questions });
  };

  const removeOption = (qIndex: number, optIndex: number) => {
    const questions = [...data.questions];
    questions[qIndex] = {
      ...questions[qIndex],
      options: questions[qIndex].options.filter((_, i) => i !== optIndex),
    };
    onChange({ ...data, questions });
  };

  const needsOptions = (type: SurveyQuestionType) =>
    type === "single_choice" || type === "multiple_choice";

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Thông tin khảo sát</h3>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
            Tiêu đề <span className="text-red-500">*</span>
          </label>
          <Input
            value={data.title}
            onChange={(e) => onChange({ ...data, title: e.target.value })}
            placeholder="VD: Khảo sát khách hàng Young House"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
            Mô tả / Lời giới thiệu
          </label>
          <Textarea
            rows={6}
            value={data.description}
            onChange={(e) => onChange({ ...data, description: e.target.value })}
            placeholder="Nội dung chào mừng, hướng dẫn, thông tin giải thưởng..."
            className="w-full"
          />
        </div>

        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.is_active}
              onChange={(e) => onChange({ ...data, is_active: e.target.checked })}
              className="rounded text-primary-6000 focus:ring-primary-500"
            />
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Kích hoạt khảo sát (tenant có thể làm ngay)
            </span>
          </label>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Hạn chót (tùy chọn)
            </label>
            <Input
              type="datetime-local"
              value={data.expires_at}
              onChange={(e) => onChange({ ...data, expires_at: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
            Câu hỏi ({data.questions.length})
          </h3>
          <button
            type="button"
            onClick={addQuestion}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-6000 hover:text-primary-700"
          >
            <PlusIcon className="w-4 h-4" />
            Thêm câu hỏi
          </button>
        </div>

        {data.questions.map((q, index) => (
          <div
            key={index}
            className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 shadow-sm space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="text-sm font-bold text-primary-6000 mt-2">Câu {index + 1}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveQuestion(index, -1)}
                  disabled={index === 0}
                  className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30"
                >
                  <ArrowUpIcon className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveQuestion(index, 1)}
                  disabled={index === data.questions.length - 1}
                  className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30"
                >
                  <ArrowDownIcon className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => removeQuestion(index)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 dark:hover:bg-red-950/20"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            <Textarea
              rows={2}
              value={q.question_text}
              onChange={(e) => updateQuestion(index, { question_text: e.target.value })}
              placeholder="Nội dung câu hỏi..."
              className="w-full"
            />

            <div className="flex flex-wrap gap-4">
              <select
                value={q.question_type}
                onChange={(e) =>
                  updateQuestion(index, {
                    question_type: e.target.value as SurveyQuestionType,
                    options: needsOptions(e.target.value as SurveyQuestionType) ? q.options : [],
                  })
                }
                className="text-sm border border-neutral-200 dark:border-neutral-700 rounded-xl px-3 py-2 bg-white dark:bg-neutral-900"
              >
                {QUESTION_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={q.is_required}
                  onChange={(e) => updateQuestion(index, { is_required: e.target.checked })}
                  className="rounded text-primary-6000"
                />
                Bắt buộc
              </label>
            </div>

            {needsOptions(q.question_type) && (
              <div className="space-y-2 pl-3 border-l-2 border-primary-200 dark:border-primary-800">
                <p className="text-xs font-semibold text-neutral-500 uppercase">Các lựa chọn</p>
                {q.options.map((opt, optIndex) => (
                  <div key={optIndex} className="flex gap-2">
                    <Input
                      value={opt}
                      onChange={(e) => updateOption(index, optIndex, e.target.value)}
                      placeholder={`Lựa chọn ${optIndex + 1}`}
                      className="flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => removeOption(index, optIndex)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addOption(index)}
                  className="text-xs text-primary-6000 hover:underline"
                >
                  + Thêm lựa chọn
                </button>
              </div>
            )}
          </div>
        ))}

        {data.questions.length === 0 && (
          <div className="text-center py-10 text-neutral-500 border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-2xl">
            Chưa có câu hỏi. Nhấn &quot;Thêm câu hỏi&quot; hoặc dùng mẫu có sẵn.
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <ButtonPrimary onClick={onSubmit} disabled={submitting || !data.title.trim()} className="px-8">
          {submitting ? "Đang lưu..." : submitLabel}
        </ButtonPrimary>
      </div>
    </div>
  );
}
