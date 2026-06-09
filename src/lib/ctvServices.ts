import { supabase } from './supabaseClient';

// ============================
// CTV Interfaces
// ============================

export interface CTVProfile {
  id: string;
  profile_id: string;
  referral_code: string;
  commission_rate: number;
  bank_name: string | null;
  bank_account: string | null;
  bank_owner: string | null;
  status: 'pending' | 'active' | 'suspended';
  total_earned: number;
  total_paid: number;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface CTVProfileWithUser extends CTVProfile {
  profiles: {
    id: string;
    name: string;
    phone: string | null;
    role: string;
  };
}

export interface CTVReferral {
  id: string;
  ctv_id: string;
  booking_id: string | null;
  room_id: string;
  referred_user_id: string | null;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
}

export interface CTVReferralWithDetails extends CTVReferral {
  ctv_profiles: {
    id: string;
    referral_code: string;
    profiles: {
      name: string;
    };
  };
  rooms: {
    id: string;
    title: string;
    price: number;
    address: string;
  };
  referred_profile: {
    name: string;
    phone: string | null;
  } | null;
}

export interface CTVCommission {
  id: string;
  ctv_id: string;
  referral_id: string;
  amount: number;
  commission_rate: number;
  room_price: number;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  paid_at: string | null;
  approved_by: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface CTVCommissionWithDetails extends CTVCommission {
  ctv_profiles: {
    id: string;
    referral_code: string;
    bank_name: string | null;
    bank_account: string | null;
    bank_owner: string | null;
    profiles: {
      id: string;
      name: string;
      phone: string | null;
    };
  };
  ctv_referrals: {
    id: string;
    rooms: {
      title: string;
      address: string;
    };
  };
}

export interface CTVStats {
  totalCTVs: number;
  activeCTVs: number;
  pendingCTVs: number;
  totalReferrals: number;
  confirmedReferrals: number;
  totalCommissions: number;
  pendingCommissions: number;
  totalEarned: number;
  totalPaid: number;
}

// ============================
// CTV Profile Functions
// ============================

/** Fetch all CTV profiles with user info (admin) */
export async function fetchAllCTVProfiles(): Promise<{ data: CTVProfileWithUser[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('ctv_profiles')
      .select(`
        *,
        profiles:profile_id (
          id, name, phone, role
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching CTV profiles:', error);
      return { data: [], error: error.message };
    }

    return { data: (data || []) as CTVProfileWithUser[], error: null };
  } catch (err: any) {
    return { data: [], error: err.message };
  }
}

/** Fetch a single CTV profile by profile_id */
export async function fetchCTVProfileByUserId(userId: string): Promise<{ data: CTVProfileWithUser | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('ctv_profiles')
      .select(`
        *,
        profiles:profile_id (
          id, name, phone, role
        )
      `)
      .eq('profile_id', userId)
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as CTVProfileWithUser, error: null };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}

/** Generate unique referral code */
function generateReferralCode(name: string): string {
  const cleanName = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-zA-Z0-9]/g, '')
    .substring(0, 6)
    .toUpperCase();
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CTV-${cleanName}-${randomSuffix}`;
}

/** Auto-create active CTV profile for internal sales staff */
export async function ensureSalesCTVProfile(
  userId: string,
  userName: string
): Promise<{ data: CTVProfileWithUser | null; error: string | null }> {
  const existing = await fetchCTVProfileByUserId(userId);
  if (existing.data) return existing;
  if (existing.error && !existing.error.includes('0 rows')) {
    return { data: null, error: existing.error };
  }

  try {
    const referralCode = generateReferralCode(userName);
    const { data, error } = await supabase
      .from('ctv_profiles')
      .insert({
        profile_id: userId,
        referral_code: referralCode,
        status: 'active',
        commission_rate: 10,
      })
      .select(`
        *,
        profiles:profile_id ( id, name, phone, role )
      `)
      .single();

    if (error) return { data: null, error: error.message };
    return { data: data as CTVProfileWithUser, error: null };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}

/** Register as CTV */
export async function registerAsCTV(
  userId: string,
  userName: string,
  bankInfo?: { bank_name?: string; bank_account?: string; bank_owner?: string }
): Promise<{ data: CTVProfile | null; error: string | null }> {
  try {
    const referralCode = generateReferralCode(userName);

    const { data, error } = await supabase
      .from('ctv_profiles')
      .insert({
        profile_id: userId,
        referral_code: referralCode,
        bank_name: bankInfo?.bank_name || null,
        bank_account: bankInfo?.bank_account || null,
        bank_owner: bankInfo?.bank_owner || null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Error registering as CTV:', error);
      return { data: null, error: error.message };
    }

    return { data: data as CTVProfile, error: null };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}

/** Update CTV status (admin) */
export async function updateCTVStatus(
  ctvId: string,
  status: 'active' | 'suspended' | 'pending',
  note?: string
): Promise<{ error: string | null }> {
  try {
    const updateData: any = { status, updated_at: new Date().toISOString() };
    if (note !== undefined) updateData.note = note;

    // If activating, also update profile role to 'ctv'
    if (status === 'active') {
      const { data: ctvProfile } = await supabase
        .from('ctv_profiles')
        .select('profile_id')
        .eq('id', ctvId)
        .single();

      if (ctvProfile) {
        await supabase
          .from('profiles')
          .update({ role: 'ctv' })
          .eq('id', ctvProfile.profile_id);
      }
    }

    const { error } = await supabase
      .from('ctv_profiles')
      .update(updateData)
      .eq('id', ctvId);

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (err: any) {
    return { error: err.message };
  }
}

/** Update CTV commission rate (admin) */
export async function updateCTVCommissionRate(
  ctvId: string,
  commissionRate: number
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from('ctv_profiles')
      .update({ commission_rate: commissionRate, updated_at: new Date().toISOString() })
      .eq('id', ctvId);

    if (error) return { error: error.message };
    return { error: null };
  } catch (err: any) {
    return { error: err.message };
  }
}

/** Update CTV bank info */
export async function updateCTVBankInfo(
  ctvId: string,
  bankInfo: { bank_name: string; bank_account: string; bank_owner: string }
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from('ctv_profiles')
      .update({
        ...bankInfo,
        updated_at: new Date().toISOString(),
      })
      .eq('id', ctvId);

    if (error) return { error: error.message };
    return { error: null };
  } catch (err: any) {
    return { error: err.message };
  }
}

// ============================
// CTV Referral Functions
// ============================

/** Fetch all referrals (admin) */
export async function fetchAllReferrals(): Promise<{ data: CTVReferralWithDetails[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('ctv_referrals')
      .select(`
        *,
        ctv_profiles:ctv_id (
          id, referral_code,
          profiles:profile_id ( name )
        ),
        rooms:room_id (
          id, title, price, address
        ),
        referred_profile:referred_user_id (
          name, phone
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return { data: [], error: error.message };
    }

    return { data: (data || []) as CTVReferralWithDetails[], error: null };
  } catch (err: any) {
    return { data: [], error: err.message };
  }
}

/** Fetch referrals by CTV */
export async function fetchReferralsByCTV(ctvId: string): Promise<{ data: CTVReferralWithDetails[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('ctv_referrals')
      .select(`
        *,
        ctv_profiles:ctv_id (
          id, referral_code,
          profiles:profile_id ( name )
        ),
        rooms:room_id (
          id, title, price, address
        ),
        referred_profile:referred_user_id (
          name, phone
        )
      `)
      .eq('ctv_id', ctvId)
      .order('created_at', { ascending: false });

    if (error) {
      return { data: [], error: error.message };
    }

    return { data: (data || []) as CTVReferralWithDetails[], error: null };
  } catch (err: any) {
    return { data: [], error: err.message };
  }
}

/** Create a referral tracking */
export async function createReferral(
  ctvId: string,
  roomId: string,
  bookingId?: string,
  referredUserId?: string
): Promise<{ data: CTVReferral | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('ctv_referrals')
      .insert({
        ctv_id: ctvId,
        room_id: roomId,
        booking_id: bookingId || null,
        referred_user_id: referredUserId || null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as CTVReferral, error: null };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}

/** Lookup CTV by referral code */
export async function lookupCTVByReferralCode(code: string): Promise<{ data: CTVProfile | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('ctv_profiles')
      .select('*')
      .eq('referral_code', code)
      .eq('status', 'active')
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as CTVProfile, error: null };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}

// ============================
// CTV Commission Functions
// ============================

/** Fetch all commissions (admin) */
export async function fetchAllCommissions(): Promise<{ data: CTVCommissionWithDetails[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('ctv_commissions')
      .select(`
        *,
        ctv_profiles:ctv_id (
          id, referral_code, bank_name, bank_account, bank_owner,
          profiles:profile_id ( id, name, phone )
        ),
        ctv_referrals:referral_id (
          id,
          rooms:room_id ( title, address )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return { data: [], error: error.message };
    }

    return { data: (data || []) as CTVCommissionWithDetails[], error: null };
  } catch (err: any) {
    return { data: [], error: err.message };
  }
}

/** Fetch commissions by CTV */
export async function fetchCommissionsByCTV(ctvId: string): Promise<{ data: CTVCommissionWithDetails[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('ctv_commissions')
      .select(`
        *,
        ctv_profiles:ctv_id (
          id, referral_code, bank_name, bank_account, bank_owner,
          profiles:profile_id ( id, name, phone )
        ),
        ctv_referrals:referral_id (
          id,
          rooms:room_id ( title, address )
        )
      `)
      .eq('ctv_id', ctvId)
      .order('created_at', { ascending: false });

    if (error) {
      return { data: [], error: error.message };
    }

    return { data: (data || []) as CTVCommissionWithDetails[], error: null };
  } catch (err: any) {
    return { data: [], error: err.message };
  }
}

/** Approve commission (admin) */
export async function approveCommission(
  commissionId: string,
  approvedBy: string,
  note?: string
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from('ctv_commissions')
      .update({
        status: 'approved',
        approved_by: approvedBy,
        note: note || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', commissionId);

    if (error) return { error: error.message };
    return { error: null };
  } catch (err: any) {
    return { error: err.message };
  }
}

/** Mark commission as paid (admin) */
export async function markCommissionPaid(
  commissionId: string,
  note?: string
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from('ctv_commissions')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        note: note || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', commissionId);

    if (error) return { error: error.message };
    return { error: null };
  } catch (err: any) {
    return { error: err.message };
  }
}

/** Reject commission (admin) */
export async function rejectCommission(
  commissionId: string,
  note: string
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from('ctv_commissions')
      .update({
        status: 'rejected',
        note,
        updated_at: new Date().toISOString(),
      })
      .eq('id', commissionId);

    if (error) return { error: error.message };
    return { error: null };
  } catch (err: any) {
    return { error: err.message };
  }
}

// ============================
// CTV Statistics
// ============================

/** Fetch CTV overview stats (admin) */
export async function fetchCTVStats(): Promise<{ data: CTVStats; error: string | null }> {
  try {
    // CTV counts
    const { data: allCTVs } = await supabase
      .from('ctv_profiles')
      .select('id, status, total_earned, total_paid');

    const totalCTVs = allCTVs?.length || 0;
    const activeCTVs = allCTVs?.filter((c: any) => c.status === 'active').length || 0;
    const pendingCTVs = allCTVs?.filter((c: any) => c.status === 'pending').length || 0;
    const totalEarned = allCTVs?.reduce((sum: number, c: any) => sum + (c.total_earned || 0), 0) || 0;
    const totalPaid = allCTVs?.reduce((sum: number, c: any) => sum + (c.total_paid || 0), 0) || 0;

    // Referral counts
    const { data: allReferrals } = await supabase
      .from('ctv_referrals')
      .select('id, status');

    const totalReferrals = allReferrals?.length || 0;
    const confirmedReferrals = allReferrals?.filter((r: any) => r.status === 'confirmed').length || 0;

    // Commission counts
    const { data: allCommissions } = await supabase
      .from('ctv_commissions')
      .select('id, status');

    const totalCommissions = allCommissions?.length || 0;
    const pendingCommissions = allCommissions?.filter((c: any) => c.status === 'pending').length || 0;

    return {
      data: {
        totalCTVs,
        activeCTVs,
        pendingCTVs,
        totalReferrals,
        confirmedReferrals,
        totalCommissions,
        pendingCommissions,
        totalEarned,
        totalPaid,
      },
      error: null,
    };
  } catch (err: any) {
    return {
      data: {
        totalCTVs: 0, activeCTVs: 0, pendingCTVs: 0,
        totalReferrals: 0, confirmedReferrals: 0,
        totalCommissions: 0, pendingCommissions: 0,
        totalEarned: 0, totalPaid: 0,
      },
      error: err.message,
    };
  }
}

/** Format VND currency */
export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Lookup user profile by email (admin) */
export async function lookupUserByEmail(email: string): Promise<{
  data: { id: string; name: string; phone: string | null; role: string } | null;
  error: string | null;
}> {
  try {
    // Search in auth.users via profiles join
    // Since we can't directly query auth.users with anon key,
    // we'll match by looking up profiles that have this email in auth
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      // Fallback: try to find by name/phone if admin API not available
      // The admin API requires service_role key, so let's search profiles instead
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, name, phone, role')
        .ilike('name', `%${email}%`);

      if (profileError || !profiles?.length) {
        return { data: null, error: 'Không tìm thấy user với thông tin này' };
      }
      return { data: profiles[0] as any, error: null };
    }

    const matchedUser = authData?.users?.find(u => u.email === email);
    if (!matchedUser) {
      return { data: null, error: 'Không tìm thấy user với email này' };
    }

    // Get profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, name, phone, role')
      .eq('id', matchedUser.id)
      .single();

    if (profileError || !profile) {
      return { data: null, error: 'User chưa có profile trong hệ thống' };
    }

    return { data: profile as any, error: null };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}

/** Admin directly add a CTV by profile_id (auto active) */
export async function adminAddCTV(
  profileId: string,
  profileName: string,
  commissionRate: number = 10,
  bankInfo?: { bank_name?: string; bank_account?: string; bank_owner?: string }
): Promise<{ data: CTVProfile | null; error: string | null }> {
  try {
    // Check if already a CTV
    const { data: existing } = await supabase
      .from('ctv_profiles')
      .select('id')
      .eq('profile_id', profileId)
      .single();

    if (existing) {
      return { data: null, error: 'User này đã là CTV rồi' };
    }

    const referralCode = generateReferralCode(profileName);

    const { data, error } = await supabase
      .from('ctv_profiles')
      .insert({
        profile_id: profileId,
        referral_code: referralCode,
        commission_rate: commissionRate,
        bank_name: bankInfo?.bank_name || null,
        bank_account: bankInfo?.bank_account || null,
        bank_owner: bankInfo?.bank_owner || null,
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    // Update profile role to 'ctv'
    await supabase
      .from('profiles')
      .update({ role: 'ctv' })
      .eq('id', profileId);

    return { data: data as CTVProfile, error: null };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}

/** Search profiles for adding CTV (admin) */
export async function searchProfiles(query: string): Promise<{
  data: { id: string; name: string; phone: string | null; role: string }[];
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, phone, role')
      .or(`name.ilike.%${query}%,phone.ilike.%${query}%`)
      .limit(10);

    if (error) return { data: [], error: error.message };
    return { data: (data || []) as any[], error: null };
  } catch (err: any) {
    return { data: [], error: err.message };
  }
}


