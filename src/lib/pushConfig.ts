const AUDIENCE_ROLES: Record<string, string[]> = {
  all: ["admin", "manager", "sales", "operator", "staff", "tenant", "user"],
  renters: ["tenant", "user"],
  owners: ["sales", "operator", "staff"],
  admins: ["admin", "manager"],
};

export function getRolesForAudience(audience: string): string[] {
  return AUDIENCE_ROLES[audience] || AUDIENCE_ROLES.all;
}

export function isPushConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY &&
      process.env.VAPID_PRIVATE_KEY &&
      process.env.VAPID_SUBJECT
  );
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}
