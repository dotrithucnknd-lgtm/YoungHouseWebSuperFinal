export function formatVnd(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPriceRangeLabel(
  minPrice?: number | null,
  maxPrice?: number | null,
  fallbackPrice?: number | null
): string {
  const min = minPrice ?? fallbackPrice ?? 0;
  const max = maxPrice ?? min;

  if (!min) return "";
  if (max > min) return `${formatVnd(min)} - ${formatVnd(max)}`;
  return formatVnd(min);
}

export function formatPriceInput(value: string): string {
  if (!value) return "";
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function parsePriceInput(value: string): string {
  return value.replace(/\./g, "");
}
