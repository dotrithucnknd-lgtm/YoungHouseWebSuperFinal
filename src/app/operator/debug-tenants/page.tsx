"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

export default function DebugTenantsPage() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [tenantProfiles, setTenantProfiles] = useState<any[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const checkProfiles = async () => {
    setLoading(true);
    setError("");
    
    try {
      // Check profiles table
      console.log('Checking profiles...');
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'renter');

      if (profilesError) {
        console.error('Profiles error:', profilesError);
        setError(`Profiles error: ${profilesError.message}`);
      } else {
        console.log('Profiles found:', profilesData);
        setProfiles(profilesData || []);
      }

      // Check tenant_profiles table
      console.log('Checking tenant_profiles...');
      const { data: tenantProfilesData, error: tenantProfilesError } = await supabase
        .from('tenant_profiles')
        .select(`
          *,
          profiles (
            id,
            name,
            phone,
            DoB,
            role
          )
        `);

      if (tenantProfilesError) {
        console.error('Tenant profiles error:', tenantProfilesError);
        setError(prev => prev + `\nTenant profiles error: ${tenantProfilesError.message}`);
      } else {
        console.log('Tenant profiles found:', tenantProfilesData);
        setTenantProfiles(tenantProfilesData || []);
      }
    } catch (err: any) {
      console.error('Exception:', err);
      setError(`Exception: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      checkProfiles();
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-8">
          🔍 Debug Tenants Data
        </h1>

        {/* Current User */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">👤 Current User</h2>
          {user ? (
            <div className="space-y-2 font-mono text-sm">
              <div><strong>ID:</strong> {user.id}</div>
              <div><strong>Name:</strong> {user.name}</div>
              <div><strong>Role:</strong> <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded">{user.role}</span></div>
            </div>
          ) : (
            <div className="text-neutral-500">Not logged in</div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <h3 className="text-red-800 dark:text-red-200 font-semibold mb-2">❌ Errors:</h3>
            <pre className="text-sm text-red-700 dark:text-red-300 whitespace-pre-wrap">{error}</pre>
          </div>
        )}

        {/* Refresh Button */}
        <div className="mb-6">
          <button
            onClick={checkProfiles}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh Data'}
          </button>
        </div>

        {/* Profiles (role = renter) */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            📋 Profiles (role = renter): {profiles.length}
          </h2>
          {profiles.length === 0 ? (
            <div className="text-neutral-500">No renter profiles found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-100 dark:bg-neutral-900">
                  <tr>
                    <th className="px-4 py-2 text-left">ID</th>
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Phone</th>
                    <th className="px-4 py-2 text-left">Role</th>
                    <th className="px-4 py-2 text-left">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                  {profiles.map(profile => (
                    <tr key={profile.id}>
                      <td className="px-4 py-2 font-mono text-xs">{profile.id.substring(0, 8)}...</td>
                      <td className="px-4 py-2 font-semibold">{profile.name}</td>
                      <td className="px-4 py-2">{profile.phone}</td>
                      <td className="px-4 py-2">
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded text-xs">
                          {profile.role}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-xs">
                        {new Date(profile.created_at).toLocaleString('vi-VN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Tenant Profiles */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            📝 Tenant Profiles: {tenantProfiles.length}
          </h2>
          {tenantProfiles.length === 0 ? (
            <div className="text-neutral-500">No tenant profiles found</div>
          ) : (
            <div className="space-y-4">
              {tenantProfiles.map(tp => (
                <div key={tp.id} className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">
                        {(tp.profiles as any)?.name || 'N/A'}
                      </h3>
                      <div className="space-y-1 text-sm">
                        <div><strong>Phone:</strong> {(tp.profiles as any)?.phone}</div>
                        <div><strong>Email:</strong> {tp.metadata?.email || 'N/A'}</div>
                        <div><strong>ID Card:</strong> {tp.id_card_number || 'N/A'}</div>
                      </div>
                    </div>
                    <div className="text-sm">
                      <div><strong>Hometown:</strong> {tp.hometown || 'N/A'}</div>
                      <div><strong>Emergency:</strong> {tp.emergency_contact_name || 'N/A'}</div>
                      <div><strong>Emergency Phone:</strong> {tp.emergency_contact_phone || 'N/A'}</div>
                      <div><strong>Temp Residence:</strong> {tp.metadata?.has_temporary_residence ? '✅ Yes' : '❌ No'}</div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-neutral-500">
                    Created: {new Date(tp.created_at).toLocaleString('vi-VN')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-200 mb-3">
            📋 Kiểm tra
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-yellow-800 dark:text-yellow-300">
            <li>Nếu "Profiles (role = renter)" = 0 → Chưa có tenant nào được tạo</li>
            <li>Nếu "Tenant Profiles" = 0 → Bảng tenant_profiles trống hoặc bị chặn RLS</li>
            <li>Nếu có lỗi "new row violates row-level security" → Chạy DISABLE_RLS_EMERGENCY.sql</li>
            <li>Nếu có data ở đây nhưng không hiển thị ở trang Tenants → Lỗi ở fetchOwnerTenants</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
