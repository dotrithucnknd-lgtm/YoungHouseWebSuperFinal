export type PortalRole =
  | "admin"
  | "manager"
  | "operator"
  | "staff"
  | "sales"
  | "tenant";

/** Manager và admin có quyền truy cập toàn hệ thống */
export function isMasterRole(role?: string | null): boolean {
  return role === "manager" || role === "admin";
}

/** Alias — manager là master role cao nhất */
export function hasMasterAccess(role?: string | null): boolean {
  return isMasterRole(role);
}

export function canAccessPortal(
  role: string | undefined | null,
  portal: PortalRole
): boolean {
  if (!role) return false;
  if (isMasterRole(role)) return true;
  return role === portal;
}

/** Quyền xem/sửa dữ liệu vận hành toàn bộ (không giới hạn owner) */
export function hasOperatorDataAccess(role?: string | null): boolean {
  return (
    role === "operator" ||
    role === "admin" ||
    role === "manager"
  );
}

/** Quyền quản trị người dùng, thay đổi role */
export function canManageUsers(role?: string | null): boolean {
  return isMasterRole(role);
}
