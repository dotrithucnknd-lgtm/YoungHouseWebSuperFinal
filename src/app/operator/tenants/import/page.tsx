"use client";

import React, { useState, useRef } from "react";
import {
  ArrowLeftIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import {
  TEMPLATE_HEADERS,
  TEMPLATE_EXAMPLE,
  parseSheetRows,
  type TenantImportRow,
  type TenantImportResult,
} from "@/lib/tenantImport";

const CLIENT_BATCH_SIZE = 200;

export default function ImportTenantsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fileName, setFileName] = useState("");
  const [parsedRows, setParsedRows] = useState<TenantImportRow[]>([]);
  const [parseErrors, setParseErrors] = useState<{ row: number; message: string }[]>([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<TenantImportResult | null>(null);

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([TEMPLATE_HEADERS as unknown as string[], TEMPLATE_EXAMPLE]);
    ws["!cols"] = TEMPLATE_HEADERS.map(() => ({ wch: 22 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "KhachThue");
    XLSX.writeFile(wb, "mau-khach-thue.xlsx");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setResult(null);
    setProgress(0);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });

      const { valid, errors } = parseSheetRows(jsonRows);
      setParsedRows(valid);
      setParseErrors(errors);
    } catch (err) {
      console.error(err);
      alert("Không đọc được file. Vui lòng dùng file Excel (.xlsx) hoặc CSV theo mẫu.");
      setParsedRows([]);
      setParseErrors([]);
    }
  };

  const handleImport = async () => {
    if (parsedRows.length === 0) {
      alert("Không có dòng hợp lệ để nhập.");
      return;
    }

    if (!confirm(`Bạn sắp nhập ${parsedRows.length} khách thuê. Tiếp tục?`)) return;

    setImporting(true);
    setProgress(0);
    setResult(null);

    const aggregated: TenantImportResult = { success: 0, skipped: 0, errors: [...parseErrors] };
    const totalBatches = Math.ceil(parsedRows.length / CLIENT_BATCH_SIZE);

    try {
      for (let b = 0; b < totalBatches; b++) {
        const start = b * CLIENT_BATCH_SIZE;
        const batch = parsedRows.slice(start, start + CLIENT_BATCH_SIZE);

        const response = await fetch("/api/tenants/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tenants: batch, startRowIndex: start + 2 }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Lỗi nhập dữ liệu");

        aggregated.success += data.success;
        aggregated.skipped += data.skipped;
        aggregated.errors.push(...(data.errors || []));
        setProgress(Math.round(((b + 1) / totalBatches) * 100));
      }

      setResult(aggregated);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Có lỗi xảy ra";
      alert(message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/operator/tenants"
          className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">Nhập khách thuê hàng loạt</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Import hàng trăm đến hàng nghìn khách từ file Excel (.xlsx) hoặc CSV
          </p>
        </div>
      </div>

      {/* Step 1: Template */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 space-y-4">
        <div className="flex items-start gap-3">
          <span className="w-7 h-7 rounded-full bg-primary-6000 text-white text-sm font-bold flex items-center justify-center shrink-0">1</span>
          <div className="flex-1">
            <h2 className="font-bold text-neutral-900 dark:text-white">Tải file mẫu</h2>
            <p className="text-sm text-neutral-500 mt-1">
              Điền dữ liệu vào file mẫu. Cột bắt buộc: <strong>Họ tên</strong>, <strong>Số điện thoại</strong>, <strong>CCCD/CMND</strong>.
            </p>
            <button
              onClick={downloadTemplate}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded-lg text-sm font-medium transition-colors"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              Tải mẫu Excel (.xlsx)
            </button>
          </div>
        </div>
      </div>

      {/* Step 2: Upload */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 space-y-4">
        <div className="flex items-start gap-3">
          <span className="w-7 h-7 rounded-full bg-primary-6000 text-white text-sm font-bold flex items-center justify-center shrink-0">2</span>
          <div className="flex-1">
            <h2 className="font-bold text-neutral-900 dark:text-white">Chọn file dữ liệu</h2>
            <p className="text-sm text-neutral-500 mt-1">Hỗ trợ .xlsx, .xls, .csv — tối đa vài nghìn dòng mỗi lần.</p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 border-2 border-dashed border-neutral-300 dark:border-neutral-600 hover:border-primary-6000 rounded-xl text-sm font-medium transition-colors w-full sm:w-auto justify-center"
            >
              <ArrowUpTrayIcon className="w-5 h-5 text-neutral-400" />
              {fileName || "Chọn file Excel / CSV"}
            </button>
          </div>
        </div>
      </div>

      {/* Preview */}
      {(parsedRows.length > 0 || parseErrors.length > 0) && !result && (
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-neutral-900 dark:text-white">Xem trước</h2>
              <p className="text-sm text-neutral-500">
                {parsedRows.length} dòng hợp lệ
                {parseErrors.length > 0 && ` · ${parseErrors.length} dòng lỗi`}
              </p>
            </div>
            <button
              onClick={handleImport}
              disabled={importing || parsedRows.length === 0}
              className="px-5 py-2 bg-primary-6000 hover:bg-primary-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {importing ? `Đang nhập... ${progress}%` : `Nhập ${parsedRows.length} khách thuê`}
            </button>
          </div>

          {importing && (
            <div className="px-6 py-3 bg-neutral-50 dark:bg-neutral-900/50">
              <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-6000 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {parseErrors.length > 0 && (
            <div className="px-6 py-4 bg-yellow-50 dark:bg-yellow-900/10 border-b border-yellow-100 dark:border-yellow-900/20 max-h-40 overflow-y-auto">
              {parseErrors.slice(0, 20).map((e, i) => (
                <p key={i} className="text-xs text-yellow-800 dark:text-yellow-300">{e.message}</p>
              ))}
              {parseErrors.length > 20 && (
                <p className="text-xs text-yellow-600 mt-1">...và {parseErrors.length - 20} lỗi khác</p>
              )}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-neutral-500 uppercase bg-neutral-50 dark:bg-neutral-900/50">
                <tr>
                  <th className="px-4 py-3">Họ tên</th>
                  <th className="px-4 py-3">SĐT</th>
                  <th className="px-4 py-3">CCCD</th>
                  <th className="px-4 py-3">Ngày sinh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                {parsedRows.slice(0, 10).map((row, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2 font-medium">{row.name}</td>
                    <td className="px-4 py-2">{row.phone}</td>
                    <td className="px-4 py-2">{row.id_card_number}</td>
                    <td className="px-4 py-2 text-neutral-500">{row.dob || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {parsedRows.length > 10 && (
              <p className="px-4 py-3 text-xs text-neutral-400">...và {parsedRows.length - 10} dòng khác</p>
            )}
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <CheckCircleIcon className="w-8 h-8 text-green-500" />
            <div>
              <h2 className="font-bold text-lg text-neutral-900 dark:text-white">Hoàn tất nhập dữ liệu</h2>
              <p className="text-sm text-neutral-500">Kết quả import khách thuê</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center">
              <p className="text-2xl font-black text-green-600">{result.success}</p>
              <p className="text-xs text-green-700 dark:text-green-400 mt-1">Thành công</p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 text-center">
              <p className="text-2xl font-black text-yellow-600">{result.skipped}</p>
              <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">Bỏ qua (trùng)</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 text-center">
              <p className="text-2xl font-black text-red-600">
                {result.errors.filter((e) => !e.message.includes("đã tồn tại")).length}
              </p>
              <p className="text-xs text-red-700 dark:text-red-400 mt-1">Lỗi</p>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div className="border border-neutral-200 dark:border-neutral-700 rounded-xl max-h-48 overflow-y-auto">
              <div className="px-4 py-2 bg-neutral-50 dark:bg-neutral-900/50 flex items-center gap-2 text-xs font-semibold text-neutral-500 uppercase">
                <ExclamationTriangleIcon className="w-4 h-4" />
                Chi tiết lỗi / bỏ qua
              </div>
              <div className="divide-y divide-neutral-100 dark:divide-neutral-700">
                {result.errors.slice(0, 50).map((e, i) => (
                  <p key={i} className="px-4 py-2 text-xs text-neutral-600 dark:text-neutral-400">
                    Dòng {e.row}: {e.message}
                  </p>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => router.push("/operator/tenants")}
              className="px-5 py-2 bg-primary-6000 hover:bg-primary-700 text-white rounded-lg text-sm font-medium"
            >
              Xem danh sách khách thuê
            </button>
            <button
              onClick={() => {
                setResult(null);
                setParsedRows([]);
                setParseErrors([]);
                setFileName("");
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="px-5 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm font-medium"
            >
              Nhập file khác
            </button>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-neutral-50 dark:bg-neutral-900/40 rounded-xl border border-neutral-200 dark:border-neutral-700 p-5 space-y-2">
        <div className="flex items-center gap-2 text-sm font-bold text-neutral-700 dark:text-neutral-300">
          <DocumentTextIcon className="w-4 h-4" />
          Mẹo import nhanh
        </div>
        <ul className="text-sm text-neutral-500 space-y-1 list-disc list-inside">
          <li>Chuẩn bị file Excel từ danh sách cũ (Google Sheets → Tải xuống .xlsx)</li>
          <li>Hệ thống tự bỏ qua SĐT hoặc CCCD đã có — an toàn khi import lại</li>
          <li>File 1000+ dòng: chia thành 2–3 file hoặc import tuần tự, mỗi lần ~500–1000 dòng</li>
          <li>Sau khi import xong, lập hợp đồng riêng cho từng phòng</li>
        </ul>
      </div>
    </div>
  );
}
