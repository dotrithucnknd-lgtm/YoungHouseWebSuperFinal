/**
 * Debug utilities for RLS (Row Level Security) issues
 * Use these functions to troubleshoot permission errors
 */

import { supabase } from '@/lib/supabaseClient';

export interface RLSDebugInfo {
  isAuthenticated: boolean;
  userId: string | null;
  userEmail: string | null;
  userRole: string | null;
  userName: string | null;
  canInsertRooms: boolean;
  errorMessage?: string;
}

/**
 * Get comprehensive debug information about current user's RLS permissions
 */
export async function debugRLSPermissions(): Promise<RLSDebugInfo> {
  const debugInfo: RLSDebugInfo = {
    isAuthenticated: false,
    userId: null,
    userEmail: null,
    userRole: null,
    userName: null,
    canInsertRooms: false,
  };

  try {
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      debugInfo.errorMessage = `Auth error: ${authError.message}`;
      return debugInfo;
    }

    if (!user) {
      debugInfo.errorMessage = 'User not authenticated';
      return debugInfo;
    }

    debugInfo.isAuthenticated = true;
    debugInfo.userId = user.id;
    debugInfo.userEmail = user.email || null;

    // Get user profile and role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('name, role')
      .eq('id', user.id)
      .single();

    if (profileError) {
      debugInfo.errorMessage = `Profile error: ${profileError.message}`;
      return debugInfo;
    }

    if (profile) {
      debugInfo.userRole = profile.role;
      debugInfo.userName = profile.name;
    }

    // Test INSERT permission by attempting a dry-run insert
    // This will fail if RLS policies are not set up correctly
    const testRoomData = {
      owner_id: user.id,
      title: 'RLS Test Room - Will Not Be Created',
      address: 'Test Address',
      price: 1000000,
      area: 20,
      status: 'hidden', // Use hidden status to avoid showing in public
    };

    // Try to insert (we'll delete it immediately if successful)
    const { data: testRoom, error: insertError } = await supabase
      .from('rooms')
      .insert(testRoomData)
      .select()
      .single();

    if (insertError) {
      debugInfo.canInsertRooms = false;
      debugInfo.errorMessage = `INSERT test failed: ${insertError.message}`;
      
      // Clean up if somehow created
      const roomData = testRoom as any;
      if (roomData?.id) {
        await supabase.from('rooms').delete().eq('id', roomData.id);
      }
      
      return debugInfo;
    }

    // Success! Clean up test room
    const roomData = testRoom as any;
    if (roomData?.id) {
      await supabase.from('rooms').delete().eq('id', roomData.id);
      debugInfo.canInsertRooms = true;
    }

    return debugInfo;
  } catch (error: any) {
    debugInfo.errorMessage = `Unexpected error: ${error.message}`;
    return debugInfo;
  }
}

/**
 * Print debug info to console in a readable format
 */
export async function printRLSDebugInfo(): Promise<void> {
  console.group('🔍 RLS Debug Information');
  
  const info = await debugRLSPermissions();
  
  console.log('Authentication:', info.isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated');
  console.log('User ID:', info.userId || 'N/A');
  console.log('Email:', info.userEmail || 'N/A');
  console.log('Name:', info.userName || 'N/A');
  console.log('Role:', info.userRole || 'N/A');
  console.log('Can Insert Rooms:', info.canInsertRooms ? '✅ Yes' : '❌ No');
  
  if (info.errorMessage) {
    console.error('Error:', info.errorMessage);
  }
  
  if (!info.canInsertRooms) {
    console.group('💡 Troubleshooting Tips');
    console.log('1. Check if user role is "operator" in profiles table');
    console.log('2. Verify RLS policies are set up correctly (run fix_rls_policies.sql)');
    console.log('3. Check Storage bucket policies for room-images');
    console.log('4. Try logging out and logging back in');
    console.log('5. See FIX_RLS_ERROR_GUIDE.md for detailed instructions');
    console.groupEnd();
  }
  
  console.groupEnd();
}

/**
 * Check if current user has owner role
 */
export async function isUserOwner(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    return profile?.role === 'operator';
  } catch {
    return false;
  }
}

/**
 * Check if current user can create rooms
 */
export async function canUserCreateRooms(): Promise<{ can: boolean; reason?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { can: false, reason: 'User not authenticated' };
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return { can: false, reason: 'User profile not found' };
    }

    if (profile.role !== 'operator' && profile.role !== 'admin') {
      return { can: false, reason: `User role is "${profile.role}", must be "operator" or "admin"` };
    }

    return { can: true };
  } catch (error: any) {
    return { can: false, reason: error.message };
  }
}

/**
 * Get user's current role
 */
export async function getUserRole(): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    return profile?.role || null;
  } catch {
    return null;
  }
}

