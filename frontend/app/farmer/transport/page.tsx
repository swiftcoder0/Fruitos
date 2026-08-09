'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { getCommodityTheme } from '@/components/ui/ThemeProvider';

interface Truck {
  truck_id: string;
  capacity_kg: number;
  cost: number;
  travel_hours: number;
  available: boolean;
  score: number;
  cost_per_kg: number;
  rank: number;
  recommended: boolean;
}

interface TransportResponse {
  feasible: Truck[];
  recommended: Truck | null;
  message: string;
}

export default function FarmerTransport() {
  const router = useRouter();
  const [data, setData] = useState<TransportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1000);
  const [destination, setDestination] = useState('Kanpur');

  useEffect(() => {
    const fetchTransport = async () => {
      try {
        // Try to get crop and batch info
        try {
          const cropRes = await api.get('/crops/1');
          if (cropRes.data && cropRes.data.quantity_kg) {
            setQuantity(cropRes.data.quantity_kg);
          }
          // Try to get destination from batch
          const batchesRes = await api.get('/batches/');
          if (batchesRes.data && batchesRes.data.length > 0) {
            const latestBatch = batchesRes.data[batchesRes.data.length - 1];
            if (latestBatch.destination) {
              setDestination(latestBatch.destination);
            }
          }
        } catch (e) {
          // Use defaults
        }

        const res = await api.get(`/transport/options?quantity_kg=${quantity}&destination=${destination}`);
        setData(res.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch transport options');
      } finally {
        setLoading(false);
      }
    };
    fetchTransport();
  }, [quantity, destination]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-red-600">Error: {error || 'No data'}</div>
      </div>
    );
  }

  const theme = getCommodityTheme('Mango');

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.bgGradient} p-4`}>
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">🚚 Transport to {destination}</h1>
          <Link href="/farmer" className="text-sm text-gray-500 hover:underline">
            ← Back
          </Link>
        </div>

        {/* Batch Info */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">📦 Quantity</span>
            <span className="font-semibold">{quantity} kg</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-gray-500">📍 Destination</span>
            <span className="font-semibold">{destination}</span>
          </div>
        </div>

        {/* Message */}
        {data.message && (
          <div className="bg-blue-50 text-blue-700 p-3 rounded-xl text-sm mb-4 border border-blue-200">
            💡 {data.message}
          </div>
        )}

        {/* Trucks List */}
        <div className="space-y-3">
          {data.feasible.length === 0 && (
            <div className="bg-white p-6 rounded-xl text-center text-gray-500">
              No trucks available for {quantity} kg to {destination}.
              <br />
              <span className="text-xs">Try adjusting quantity or destination.</span>
            </div>
          )}
          {data.feasible.map((truck) => {
            const isRecommended = truck.recommended;
            return (
              <div
                key={truck.truck_id}
                className={`bg-white rounded-xl shadow-sm border p-4 ${
                  isRecommended ? 'border-2' : 'border-gray-200'
                }`}
                style={isRecommended ? { borderColor: theme.primary } : {}}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-lg">{truck.truck_id}</span>
                      {isRecommended && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: theme.primary }}>
                          BEST
                        </span>
                      )}
                      {truck.available && (
                        <span className="text-xs text-green-600">✅ Available</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Capacity: {truck.capacity_kg} kg · Travel: {truck.travel_hours} hours
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold" style={{ color: theme.primaryDark }}>
                      ₹{truck.cost.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">₹{truck.cost_per_kg}/kg</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recommended Truck Highlight */}
        {data.recommended && (
          <div className="mt-4 p-4 rounded-xl border-2" style={{ borderColor: theme.primary, backgroundColor: `${theme.primary}10` }}>
            <p className="text-sm font-medium" style={{ color: theme.primaryDark }}>
              🏆 Recommended: {data.recommended.truck_id}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Cost: ₹{data.recommended.cost.toLocaleString()} · {data.recommended.travel_hours} hours · {data.recommended.capacity_kg} kg capacity
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 space-y-3">
          <button
            onClick={() => router.push('/farmer/harvest')}
            className="w-full py-3 rounded-xl text-white font-semibold"
            style={{ backgroundColor: theme.primary }}
          >
            🌾 Confirm Transport & Harvest
          </button>
          <button
            onClick={() => router.push('/farmer/markets')}
            className="w-full py-3 rounded-xl border-2 font-semibold"
            style={{ borderColor: theme.primary, color: theme.primary }}
          >
            ← Back to Markets
          </button>
        </div>
      </div>
    </div>
  );
}