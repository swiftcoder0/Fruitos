'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

export default function OperatorDashboard() {
  const router = useRouter();
  const [batchId, setBatchId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [batchInfo, setBatchInfo] = useState<any>(null);

  const handleScan = async () => {
    if (!batchId.trim()) {
      setError('Please enter a Batch ID');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/batches/${batchId.trim()}`);
      setBatchInfo(res.data);
      // Navigate to quality inspection with the batch ID
      router.push(`/operator/quality?batch=${batchId.trim()}`);
    } catch (err) {
      setError('Batch not found. Please check the ID.');
      setBatchInfo(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">📷 Operator Dashboard</h1>
          <Link href="/" className="text-sm text-gray-500 hover:underline">
            ← Home
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
          <p className="text-sm text-gray-600">Enter Batch ID to inspect quality</p>

          <div className="flex gap-2">
            <input
              type="text"
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              placeholder="e.g., MAN-001"
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleScan}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? '...' : '🔍 Scan'}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm">
              ❌ {error}
            </div>
          )}

          <div className="border-t border-gray-200 pt-4">
            <p className="text-sm text-gray-500">— OR —</p>
            <Link
              href="/operator/quality"
              className="block w-full mt-2 bg-gray-200 text-gray-700 text-center py-2 rounded-lg font-medium hover:bg-gray-300 transition"
            >
              📸 Upload Photo for Quality Check
            </Link>
          </div>
        </div>

        <div className="mt-4 text-center">
          <Link href="/manager" className="text-sm text-gray-500 hover:underline">
            Go to Manager Control Center →
          </Link>
        </div>
      </div>
    </div>
  );
}