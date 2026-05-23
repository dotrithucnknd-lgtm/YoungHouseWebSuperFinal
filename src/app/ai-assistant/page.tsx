"use client";

import React from "react";

export default function AIAssistantPage() {
  const [question, setQuestion] = React.useState("");
  const [answer, setAnswer] = React.useState<string>("");
  const [listings, setListings] = React.useState<Array<{id:string;title:string;price_per_night:number;address?:string;city?:string;district?:string;ward?:string;image?:string|null}>>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string>("");

  const ask = async () => {
    setLoading(true);
    setError("");
    setAnswer("");
    try {
      const res = await fetch("/api/rag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `Request failed: ${res.status}`);
      }
      const data = await res.json();
      setAnswer(data.answer || "");
      setListings(Array.isArray(data.listings) ? data.listings : []);
    } catch (e: any) {
      setError(e?.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-4">AI Assistant</h1>
      <div className="mb-4">
        <textarea
          className="w-full border rounded p-3 min-h-[120px]"
          placeholder="Nhập câu hỏi của bạn..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
      </div>
      <button
        onClick={ask}
        disabled={loading || !question.trim()}
        className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
      >
        {loading ? "Đang hỏi..." : "Hỏi AI"}
      </button>
      {error ? (
        <div className="mt-4 text-red-600 whitespace-pre-wrap">{error}</div>
      ) : null}
      {answer ? (
        <div className="mt-6 p-4 border rounded whitespace-pre-wrap bg-white">{answer}</div>
      ) : null}
      {listings && listings.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {listings.map((item) => (
            <div key={item.id} className="border rounded overflow-hidden bg-white">
              {item.image ? (
                <img src={item.image} alt={item.title} className="w-full h-40 object-cover" />
              ) : null}
              <div className="p-3">
                <div className="font-medium mb-1">{item.title}</div>
                <div className="text-sm text-gray-600">{item.address || [item.ward, item.district, item.city].filter(Boolean).join(", ")}</div>
                <div className="mt-1 font-semibold">{new Intl.NumberFormat('vi-VN').format(item.price_per_night)} đ</div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}



