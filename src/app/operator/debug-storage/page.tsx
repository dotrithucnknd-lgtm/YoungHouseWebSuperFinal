"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function DebugStoragePage() {
  const [buckets, setBuckets] = useState<any[]>([]);
  const [testResult, setTestResult] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    checkBuckets();
    checkCurrentUser();
  }, []);

  const checkCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setCurrentUser(profile);
    }
  };

  const checkBuckets = async () => {
    const { data, error } = await supabase.storage.listBuckets();
    if (error) {
      setTestResult(`❌ Lỗi khi list buckets: ${error.message}`);
    } else {
      setBuckets(data || []);
      const hasIdCards = data?.some(b => b.id === 'id-cards');
      if (hasIdCards) {
        setTestResult(`✅ Bucket "id-cards" tồn tại`);
      } else {
        setTestResult(`❌ Bucket "id-cards" KHÔNG tồn tại. Vui lòng chạy fix_all_tenant_rls.sql`);
      }
    }
  };

  const testUpload = async () => {
    setLoading(true);
    setTestResult("Đang test upload...");

    try {
      // Create a test file
      const testBlob = new Blob(['test content'], { type: 'text/plain' });
      const testFile = new File([testBlob], 'test.txt', { type: 'text/plain' });

      const fileName = `test-${Date.now()}.txt`;
      
      const { data, error } = await supabase.storage
        .from('id-cards')
        .upload(fileName, testFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        setTestResult(`❌ Upload thất bại: ${error.message}\n\nChi tiết: ${JSON.stringify(error, null, 2)}`);
      } else {
        setTestResult(`✅ Upload thành công!\n\nFile path: ${data.path}`);
        
        // Clean up test file
        await supabase.storage.from('id-cards').remove([fileName]);
      }
    } catch (error: any) {
      setTestResult(`❌ Exception: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testImageUpload = async () => {
    setLoading(true);
    setTestResult("Đang test upload ảnh...");

    try {
      // Create a 1x1 pixel PNG
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'red';
        ctx.fillRect(0, 0, 1, 1);
      }

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/png');
      });

      const testFile = new File([blob], 'test.png', { type: 'image/png' });
      const fileName = `test-${Date.now()}.png`;
      
      console.log('Uploading test image...');
      const { data, error } = await supabase.storage
        .from('id-cards')
        .upload(fileName, testFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        setTestResult(`❌ Upload ảnh thất bại: ${error.message}\n\nChi tiết: ${JSON.stringify(error, null, 2)}`);
      } else {
        console.log('Upload success:', data);
        const { data: { publicUrl } } = supabase.storage
          .from('id-cards')
          .getPublicUrl(fileName);
        
        setTestResult(`✅ Upload ảnh thành công!\n\nFile path: ${data.path}\nPublic URL: ${publicUrl}`);
        
        // Clean up test file
        await supabase.storage.from('id-cards').remove([fileName]);
      }
    } catch (error: any) {
      console.error('Exception:', error);
      setTestResult(`❌ Exception: ${error.message}\n\nStack: ${error.stack}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-8">
          🔍 Debug Storage & Upload
        </h1>

        {/* Current User */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">👤 Current User</h2>
          {currentUser ? (
            <div className="space-y-2 font-mono text-sm">
              <div><strong>ID:</strong> {currentUser.id}</div>
              <div><strong>Name:</strong> {currentUser.name}</div>
              <div><strong>Role:</strong> <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded">{currentUser.role}</span></div>
              <div><strong>Phone:</strong> {currentUser.phone}</div>
            </div>
          ) : (
            <div className="text-neutral-500">Loading...</div>
          )}
        </div>

        {/* Buckets List */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">📦 Storage Buckets</h2>
            <button
              onClick={checkBuckets}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
            >
              Refresh
            </button>
          </div>
          
          {buckets.length > 0 ? (
            <div className="space-y-2">
              {buckets.map((bucket) => (
                <div 
                  key={bucket.id}
                  className={`p-3 rounded border ${
                    bucket.id === 'id-cards' 
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                      : 'border-neutral-200 dark:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{bucket.id}</div>
                      <div className="text-sm text-neutral-500">
                        {bucket.public ? '🌐 Public' : '🔒 Private'} • 
                        Max: {(bucket.file_size_limit / 1024 / 1024).toFixed(1)}MB
                      </div>
                    </div>
                    {bucket.id === 'id-cards' && (
                      <span className="text-green-600 dark:text-green-400 font-semibold">✓ Target Bucket</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-neutral-500">No buckets found</div>
          )}
        </div>

        {/* Test Upload */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🧪 Test Upload</h2>
          
          <div className="flex gap-3 mb-4">
            <button
              onClick={testUpload}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Text File Upload'}
            </button>
            
            <button
              onClick={testImageUpload}
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Image Upload'}
            </button>
          </div>

          {testResult && (
            <div className={`p-4 rounded-lg font-mono text-sm whitespace-pre-wrap ${
              testResult.includes('✅') 
                ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200' 
                : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
            }`}>
              {testResult}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-200 mb-3">
            📋 Hướng dẫn fix lỗi
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-yellow-800 dark:text-yellow-300">
            <li>Kiểm tra bucket "id-cards" có tồn tại không (phần Buckets ở trên)</li>
            <li>Nếu không có, chạy <code className="bg-yellow-100 dark:bg-yellow-900 px-2 py-1 rounded">fix_all_tenant_rls.sql</code> trong Supabase SQL Editor</li>
            <li>Click "Test Image Upload" để test upload ảnh</li>
            <li>Nếu thành công ở đây nhưng vẫn lỗi ở modal, thử hard refresh (Ctrl+Shift+R)</li>
            <li>Nếu vẫn lỗi "schema invalid", đợi 5-10 phút để Supabase refresh cache</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

