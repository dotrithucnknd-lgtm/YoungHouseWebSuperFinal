"use client";

import React, { useState } from "react";
import Input from "@/shared/Input";
import Textarea from "@/shared/Textarea";
import ButtonPrimary from "@/shared/ButtonPrimary";
import type { SurveyQuestion, SurveyWithQuestions } from "@/lib/surveyServices";

interface SurveyFormProps {
  survey: SurveyWithQuestions;
  onSubmit: (answers: Record<string, string | string[]>) => Promise<void>;
  submitting?: boolean;
}

export default function SurveyForm({ survey, onSubmit, submitting = false }: SurveyFormProps) {
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setAnswer = (questionId: string, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    for (const q of survey.questions) {
      if (!q.is_required) continue;
      const val = answers[q.id];
      if (q.question_type === "multiple_choice") {
        if (!Array.isArray(val) || val.length === 0) newErrors[q.id] = "Vui lòng chọn ít nhất một đáp án";
      } else if (!val || (typeof val === "string" && !val.trim())) {
        newErrors[q.id] = "Câu hỏi này là bắt buộc";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(answers);
  };

  const renderQuestion = (q: SurveyQuestion, index: number) => (
    <div
      key={q.id}
      className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 sm:p-6 shadow-sm"
    >
      <label className="block text-sm font-semibold text-neutral-900 dark:text-white mb-3">
        <span className="text-primary-6000 mr-1">{index + 1}.</span>
        {q.question_text}
        {q.is_required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {q.question_type === "text" && (
        <Input
          value={(answers[q.id] as string) || ""}
          onChange={(e) => setAnswer(q.id, e.target.value)}
          placeholder="Nhập câu trả lời..."
        />
      )}

      {q.question_type === "textarea" && (
        <Textarea
          rows={4}
          value={(answers[q.id] as string) || ""}
          onChange={(e) => setAnswer(q.id, e.target.value)}
          placeholder="Nhập câu trả lời..."
          className="w-full"
        />
      )}

      {q.question_type === "single_choice" && (
        <div className="space-y-2">
          {q.options.map((opt) => (
            <label
              key={opt}
              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                answers[q.id] === opt
                  ? "border-primary-500 bg-primary-50 dark:bg-primary-950/20"
                  : "border-neutral-200 dark:border-neutral-700 hover:border-primary-300"
              }`}
            >
              <input
                type="radio"
                name={q.id}
                value={opt}
                checked={answers[q.id] === opt}
                onChange={() => setAnswer(q.id, opt)}
                className="text-primary-6000 focus:ring-primary-500"
              />
              <span className="text-sm text-neutral-800 dark:text-neutral-200">{opt}</span>
            </label>
          ))}
        </div>
      )}

      {q.question_type === "multiple_choice" && (
        <div className="space-y-2">
          {q.options.map((opt) => {
            const selected = ((answers[q.id] as string[]) || []).includes(opt);
            return (
              <label
                key={opt}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  selected
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-950/20"
                    : "border-neutral-200 dark:border-neutral-700 hover:border-primary-300"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => {
                    const current = (answers[q.id] as string[]) || [];
                    const next = selected ? current.filter((v) => v !== opt) : [...current, opt];
                    setAnswer(q.id, next);
                  }}
                  className="text-primary-6000 focus:ring-primary-500 rounded"
                />
                <span className="text-sm text-neutral-800 dark:text-neutral-200">{opt}</span>
              </label>
            );
          })}
        </div>
      )}

      {errors[q.id] && <p className="mt-2 text-xs text-red-500">{errors[q.id]}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {survey.description && (
        <div className="bg-primary-50 dark:bg-primary-950/20 border border-primary-200/50 dark:border-primary-900/30 rounded-2xl p-5 sm:p-6">
          <p className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-line leading-relaxed">
            {survey.description}
          </p>
        </div>
      )}

      {survey.questions.map((q, i) => renderQuestion(q, i))}

      <div className="flex justify-end pt-2">
        <ButtonPrimary type="submit" disabled={submitting} className="px-8">
          {submitting ? "Đang gửi..." : "Gửi khảo sát"}
        </ButtonPrimary>
      </div>
    </form>
  );
}
