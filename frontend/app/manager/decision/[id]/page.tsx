'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCommodityTheme } from '@/components/ui/ThemeProvider';
import api from '@/lib/api';

interface BatchSummary {
  id: number;
  batch_id: string;
  commodity: string;
  variety: string;
  quantity_kg: number;
  current_location: string;
  remaining_life_days: number;
  quality_index: number;
  risk_level: 'HIGH' | 'MEDIUM' | 'LOW';
  at_risk_kg: number;
  status: string;
}

export default function ManagerDashboard() {
  const router = useRouter();
  const [batches, setBatches] = useState<BatchSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const total = batches.length;
  const healthy = batches.filter(b => b.risk_level === 'LOW').length;
  const atRisk = batches.filter(b => b.risk_level === 'HIGH' || b.risk_level === 'MEDIUM').length;
  const totalWasteKg = batches.reduce((sum, b) => sum + (b.at_risk_kg || 0), 0);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const res = await api.get('/batches/');
        setBatches(res.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch');
      } finally {
        setLoading(false);
      }
    };
    fetchBatches();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">📊 FreshOS Control Center</h1>
          <Link href="/" className="text-sm text-gray-500 hover:underline">
            ← Home
          </Link>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-center">
            <p className="text-2xl font-bold">{total}</p>
            <p className="text-xs text-gray-500">Total Batches</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-green-200 text-center">
            <p className="text-2xl font-bold text-green-600">{healthy}</p>
            <p className="text-xs text-gray-500">Healthy</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-red-200 text-center">
            <p className="text-2xl font-bold text-red-600">{atRisk}</p>
            <p className="text-xs text-gray-500">At Risk</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-orange-200 text-center">
            <p className="text-2xl font-bold text-orange-600">{totalWasteKg} kg</p>
            <p className="text-xs text-gray-500">Potential Waste</p>
          </div>
        </div>

        {/* Batch List */}
        <div className="space-y-3">
          <h2 className="font-semibold text-gray-700">⚠️ Batches</h2>
          {batches.length === 0 && (
            <div className="bg-white p-6 rounded-xl text-center text-gray-500">
              No batches found. Create a batch from the Farmer dashboard.
            </div>
          )}
          {batches.map((batch) => {
            const theme = getCommodityTheme(batch.commodity);
            const riskEmoji = batch.risk_level === 'HIGH' ? '🔴' : batch.risk_level === 'MEDIUM' ? '🟡' : '🟢';
            const riskColor = batch.risk_level === 'HIGH' ? 'text-red-600' : batch.risk_level === 'MEDIUM' ? 'text-yellow-600' : 'text-green-600';
            const bgColor = batch.risk_level === 'HIGH' ? 'bg-red-50' : batch.risk_level === 'MEDIUM' ? 'bg-yellow-50' : 'bg-green-50';

            return (
              <div
                key={batch.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition cursor-pointer"
                onClick={() => router.push(`/manager/decision/${batch.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{theme.icon}</span>
                    <div>
                      <p className="font-semibold">{batch.batch_id}</p>
                      <p className="text-sm text-gray-600">
                        {batch.commodity} {batch.variety} · {batch.quantity_kg} kg
                      </p>
                      <p className="text-xs text-gray-500">📍 {batch.current_location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${riskColor}`}>
                      {riskEmoji} {batch.risk_level}
                    </div>
                    {batch.at_risk_kg > 0 && (
                      <p className="text-xs text-red-500 mt-1">{batch.at_risk_kg} kg at risk</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">{batch.remaining_life_days.toFixed(1)} days left</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}