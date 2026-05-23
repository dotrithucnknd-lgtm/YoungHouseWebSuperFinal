export default function formatNumberVi(value?: number | string): string {
  if (value === undefined || value === null) return "0";
  const raw = typeof value === "number" ? String(value) : String(value);
  const digitsOnly = raw.replace(/\D/g, "");
  if (!digitsOnly) return "0";
  const num = Number(digitsOnly);
  return new Intl.NumberFormat("vi-VN").format(num);
}


