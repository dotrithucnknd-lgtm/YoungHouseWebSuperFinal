export interface TenantImportRow {
  name: string;
  phone: string;
  id_card_number: string;
  dob?: string;
  email?: string;
  gender?: string;
  occupation?: string;
  hometown?: string;
  id_card_issue_date?: string;
  id_card_issue_place?: string;
  has_temporary_residence?: boolean;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
}

export interface TenantImportResult {
  success: number;
  skipped: number;
  errors: { row: number; message: string }[];
}

/** Cột bắt buộc trong file mẫu */
export const TEMPLATE_HEADERS = [
  "Họ tên",
  "Số điện thoại",
  "CCCD/CMND",
  "Ngày sinh",
  "Email",
  "Giới tính",
  "Nghề nghiệp",
  "Quê quán",
  "Ngày cấp CCCD",
  "Nơi cấp CCCD",
  "Đăng ký tạm trú",
  "Liên hệ khẩn cấp - Tên",
  "Liên hệ khẩn cấp - SĐT",
  "Liên hệ khẩn cấp - Quan hệ",
] as const;

export const TEMPLATE_EXAMPLE = [
  "Nguyễn Văn A",
  "0912345678",
  "001204028543",
  "2000-01-15",
  "nguyenvana@gmail.com",
  "Nam",
  "Sinh viên",
  "Hà Nội",
  "2020-05-10",
  "Cục Cảnh sát QLHC về TTXH",
  "Không",
  "Nguyễn Thị B",
  "0987654321",
  "Cha/Mẹ",
];

const COLUMN_ALIASES: Record<string, keyof TenantImportRow> = {
  ho_ten: "name",
  hoten: "name",
  ten: "name",
  name: "name",
  ho_va_ten: "name",

  so_dien_thoai: "phone",
  sodienthoai: "phone",
  sdt: "phone",
  phone: "phone",
  dien_thoai: "phone",

  cccd: "id_card_number",
  cmnd: "id_card_number",
  cmnd_cccd: "id_card_number",
  cccd_cmnd: "id_card_number",
  id_card_number: "id_card_number",
  so_cccd: "id_card_number",

  ngay_sinh: "dob",
  ngaysinh: "dob",
  dob: "dob",
  sinh_nhat: "dob",

  email: "email",

  gioi_tinh: "gender",
  gioitinh: "gender",
  gender: "gender",

  nghe_nghiep: "occupation",
  nghenghiep: "occupation",
  occupation: "occupation",

  que_quan: "hometown",
  quequan: "hometown",
  hometown: "hometown",
  dia_chi: "hometown",

  ngay_cap_cccd: "id_card_issue_date",
  ngaycapcccd: "id_card_issue_date",
  id_card_issue_date: "id_card_issue_date",

  noi_cap_cccd: "id_card_issue_place",
  noicapcccd: "id_card_issue_place",
  id_card_issue_place: "id_card_issue_place",

  dang_ky_tam_tru: "has_temporary_residence",
  dangkytamtru: "has_temporary_residence",
  tam_tru: "has_temporary_residence",

  lien_he_khan_cap_ten: "emergency_contact_name",
  lienhekhancap_ten: "emergency_contact_name",
  nguoi_lien_he: "emergency_contact_name",
  emergency_contact_name: "emergency_contact_name",

  lien_he_khan_cap_sdt: "emergency_contact_phone",
  lienhekhancap_sdt: "emergency_contact_phone",
  emergency_contact_phone: "emergency_contact_phone",

  lien_he_khan_cap_quan_he: "emergency_contact_relationship",
  lienhekhancap_quanhe: "emergency_contact_relationship",
  emergency_contact_relationship: "emergency_contact_relationship",
};

function normalizeHeader(header: string): string {
  return header
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

function parseBool(value: unknown): boolean | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const s = String(value).trim().toLowerCase();
  if (["co", "có", "yes", "true", "1", "da", "đã", "dang ky"].some((v) => s.includes(v))) return true;
  if (["khong", "không", "no", "false", "0", "chua", "chưa"].some((v) => s.includes(v))) return false;
  return undefined;
}

function parseDate(value: unknown): string | undefined {
  if (!value) return undefined;
  const s = String(value).trim();
  if (!s) return undefined;

  // Excel serial date number
  if (/^\d+(\.\d+)?$/.test(s)) {
    const num = parseFloat(s);
    if (num > 30000 && num < 60000) {
      const date = new Date((num - 25569) * 86400 * 1000);
      return date.toISOString().split("T")[0];
    }
  }

  // dd/mm/yyyy or dd-mm-yyyy
  const dmy = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmy) {
    const [, d, m, y] = dmy;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  // yyyy-mm-dd
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  return s;
}

function cleanPhone(value: unknown): string {
  return String(value ?? "")
    .trim()
    .replace(/[\s.\-()]/g, "");
}

function cleanCccd(value: unknown): string {
  return String(value ?? "").trim().replace(/\s/g, "");
}

export function mapRawRow(raw: Record<string, unknown>): Partial<TenantImportRow> {
  const mapped: Partial<TenantImportRow> = {};

  for (const [key, value] of Object.entries(raw)) {
    const field = COLUMN_ALIASES[normalizeHeader(key)];
    if (!field || value === undefined || value === null || String(value).trim() === "") continue;

    if (field === "has_temporary_residence") {
      mapped.has_temporary_residence = parseBool(value);
    } else if (field === "dob" || field === "id_card_issue_date") {
      mapped[field] = parseDate(value);
    } else if (field === "phone") {
      mapped.phone = cleanPhone(value);
    } else if (field === "id_card_number") {
      mapped.id_card_number = cleanCccd(value);
    } else {
      (mapped as Record<string, string>)[field] = String(value).trim();
    }
  }

  return mapped;
}

export function validateImportRow(row: Partial<TenantImportRow>, rowIndex: number): TenantImportRow | string {
  const name = row.name?.trim();
  const phone = row.phone?.trim();
  const id_card_number = row.id_card_number?.trim();

  if (!name) return `Dòng ${rowIndex}: Thiếu họ tên`;
  if (!phone) return `Dòng ${rowIndex}: Thiếu số điện thoại`;
  if (!id_card_number) return `Dòng ${rowIndex}: Thiếu CCCD/CMND`;

  if (!/^\d{9,12}$/.test(phone.replace(/^\+84/, "0").replace(/^84/, "0"))) {
    return `Dòng ${rowIndex}: SĐT không hợp lệ (${phone})`;
  }

  return {
    name,
    phone: phone.replace(/^\+84/, "0").replace(/^84/, "0"),
    id_card_number,
    dob: row.dob,
    email: row.email,
    gender: row.gender,
    occupation: row.occupation,
    hometown: row.hometown,
    id_card_issue_date: row.id_card_issue_date,
    id_card_issue_place: row.id_card_issue_place,
    has_temporary_residence: row.has_temporary_residence,
    emergency_contact_name: row.emergency_contact_name,
    emergency_contact_phone: row.emergency_contact_phone,
    emergency_contact_relationship: row.emergency_contact_relationship,
  };
}

export function parseSheetRows(sheetRows: Record<string, unknown>[]): {
  valid: TenantImportRow[];
  errors: { row: number; message: string }[];
} {
  const valid: TenantImportRow[] = [];
  const errors: { row: number; message: string }[] = [];

  sheetRows.forEach((raw, index) => {
    const rowIndex = index + 2; // header is row 1
    const mapped = mapRawRow(raw);
    const result = validateImportRow(mapped, rowIndex);
    if (typeof result === "string") {
      errors.push({ row: rowIndex, message: result });
    } else {
      valid.push(result);
    }
  });

  return { valid, errors };
}
