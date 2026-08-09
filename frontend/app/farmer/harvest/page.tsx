'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { getCommodityTheme } from '@/components/ui/ThemeProvider';

interface Crop {
  id: number;
  farmer_name: string;
  location: string;
  commodity: string;
  variety: string;
  quantity_kg: number;
  maturity_stage: string;
  harvest_window_start: string;
  harvest_window_end: string;
  weather_risk: string;
}

interface Batch {
  id: number;
  batch_id: string;
  quantity_kg: number;
  origin: string;
  destination: string;
  harvest_time: string;
  current_location: string;
  quality_index: number;
  ripeness: string;
  defects: string;
  remaining_life_days: number;
  status: string;
  qr_code_base64: string;
}

export default function FarmerHarvest() {
  const router = useRouter();
  const [crop, setCrop] = useState<Crop | null>(null);
  const [batch, setBatch] = useState<Batch | null>(null);
  const [loading, setLoading] = useState(true);
  const [harvesting, setHarvesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [destination, setDestination] = useState('Kanpur');

  useEffect(() => {
    const fetchCrop = async () => {
      try {
        // Fetch crop ID 1 (adjust as needed)
        const res = await api.get('/crops/1');
        setCrop(res.data);

        // Try to get destination from latest batch
        try {
          const batchesRes = await api.get('/batches/');
          if (batchesRes.data && batchesRes.data.length > 0) {
            const latestBatch = batchesRes.data[batchesRes.data.length - 1];
            if (latestBatch.destination) {
              setDestination(latestBatch.destination);
            }
          }
        } catch (e) {
          // Use default
        }
      } catch (err) {
        setError('No crop found. Please register a crop first.');
      } finally {
        setLoading(false);
      }
    };
    fetchCrop();
  }, []);

  const handleHarvest = async () => {
    if (!crop) return;
    setHarvesting(true);
    setError(null);

    try {
      const payload = {
        crop_id: crop.id,
        quantity_kg: crop.quantity_kg,
        origin: crop.location,
        destination: destination,
      };
      const res = await api.post('/batches/', payload);
      setBatch(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to harvest');
    } finally {
      setHarvesting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600" />
      </div>
    );
  }

  if (!crop) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold">🌾 Harvest</h1>
          <p className="text-gray-600 mt-4">No crop found. Please register a crop first.</p>
          <Link href="/farmer/crop" className="block mt-4 bg-amber-600 text-white text-center py-2 rounded-xl">
            Register Crop
          </Link>
        </div>
      </div>
    );
  }

  const theme = getCommodityTheme(crop.commodity);

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.bgGradient} p-4`}>
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">🌾 Harvest Confirmation</h1>
          <Link href="/farmer" className="text-sm text-gray-500 hover:underline">
            ← Back
          </Link>
        </div>

        {!batch ? (
          // Before Harvest
          <div>
            <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
              <h2 className="font-semibold text-lg">Confirm Harvest Details</h2>

              <div className="space-y-3">
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-600">Crop</span>
                  <span className="font-medium">{crop.commodity} {crop.variety}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-600">Farmer</span>
                  <span className="font-medium">{crop.farmer_name}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-600">Location</span>
                  <span className="font-medium">{crop.location}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-600">Quantity</span>
                  <span className="font-medium">{crop.quantity_kg} kg</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-600">Maturity</span>
                  <span className="font-medium">{crop.maturity_stage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Destination</span>
                  <span className="font-medium">{destination}</span>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm">
                  ❌ {error}
                </div>
              )}

              <button
                onClick={handleHarvest}
                disabled={harvesting}
                className="w-full py-3 rounded-xl text-white font-semibold disabled:opacity-50"
                style={{ backgroundColor: theme.primary }}
              >
                {harvesting ? '🌾 Harvesting...' : '🌾 Confirm Harvest'}
              </button>
            </div>

            <div className="mt-4 text-center">
              <Link href="/farmer/transport" className="text-sm text-gray-500 hover:underline">
                ← Change Transport
              </Link>
            </div>
          </div>
        ) : (
          // After Harvest – Batch Created
          <div>
            <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
              <div className="text-center">
                <div className="text-4xl mb-2">✅</div>
                <h2 className="text-xl font-bold text-green-600">Batch Created!</h2>
              </div>

              <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Batch ID</span>
                  <span className="font-mono font-bold">{batch.batch_id}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">Commodity</span>
                  <span>{crop.commodity}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">Quantity</span>
                  <span>{batch.quantity_kg} kg</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">Harvest Time</span>
                  <span>{new Date(batch.harvest_time).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">Destination</span>
                  <span>{batch.destination}</span>
                </div>
              </div>

              {/* QR Code */}
              {batch.qr_code_base64 && (
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-2">Scan to track your batch</p>
                  <div className="inline-block bg-white p-4 rounded-xl border border-gray-200">
                    <img
                      src={batch.qr_code_base64}
                      alt={`QR Code for ${batch.batch_id}`}
                      className="w-48 h-48 mx-auto"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Scan this QR code to view batch details
                  </p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm">
                  ❌ {error}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-6 space-y-3">
              <button
                onClick={() => router.push(`/manager/decision/${batch.id}`)}
                className="w-full py-3 rounded-xl text-white font-semibold"
                style={{ backgroundColor: theme.primary }}
              >
                📊 View Decision
              </button>
              <button
                onClick={() => router.push('/manager')}
                className="w-full py-3 rounded-xl border-2 font-semibold"
                style={{ borderColor: theme.primary, color: theme.primary }}
              >
                📊 Go to Control Center
              </button>
              <button
                onClick={() => {
                  // Download QR as image
                  const link = document.createElement('a');
                  link.href = batch.qr_code_base64;
                  link.download = `${batch.batch_id}-qr.png`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="w-full py-3 rounded-xl bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition"
              >
                ⬇️ Download QR
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}