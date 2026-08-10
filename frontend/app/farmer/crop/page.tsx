'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCommodityTheme } from '@/components/ui/ThemeProvider';
import api from '@/lib/api';

// Commodity options with icons, colors, and default variety
const COMMODITIES = [
  { value: 'Mango', label: '🥭 Mango', color: '#F59E0B', defaultVariety: 'Dashehari' },
  { value: 'Avocado', label: '🥑 Avocado', color: '#10B981', defaultVariety: 'Hass' },
  { value: 'Orange', label: '🍊 Orange', color: '#F97316', defaultVariety: 'Nagpur' },
  { value: 'Tomato', label: '🍅 Tomato', color: '#EF4444', defaultVariety: 'Roma' },
  { value: 'Apple', label: '🍎 Apple', color: '#DC2626', defaultVariety: 'Fuji' },
  { value: 'Banana', label: '🍌 Banana', color: '#EAB308', defaultVariety: 'Robusta' },
  { value: 'Guava', label: '🫒 Guava', color: '#84CC16', defaultVariety: 'Lucknow-49' },
];

export default function RegisterCrop() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useMock, setUseMock] = useState(false);
  const [selectedCommodity, setSelectedCommodity] = useState('Mango');
  const [variety, setVariety] = useState('Dashehari');

  // Update variety when commodity changes
  const handleCommodityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const commodity = e.target.value;
    setSelectedCommodity(commodity);
    const found = COMMODITIES.find(c => c.value === commodity);
    setVariety(found ? found.defaultVariety : '');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      farmer_name: formData.get('farmer_name') as string,
      location: formData.get('location') as string,
      commodity: formData.get('commodity') as string,
      variety: formData.get('variety') as string,
      quantity_kg: parseFloat(formData.get('quantity_kg') as string),
      maturity_stage: formData.get('maturity_stage') as string,
    };

    try {
      if (useMock) {
        const mockCrop = {
          id: Date.now(),
          ...payload,
          harvest_window_start: new Date(Date.now() + 2*86400000).toISOString(),
          harvest_window_end: new Date(Date.now() + 4*86400000).toISOString(),
          weather_risk: 'Rain risk increasing after window',
        };
        sessionStorage.setItem('mockCrop', JSON.stringify(mockCrop));
        await new Promise((resolve) => setTimeout(resolve, 500));
        router.push('/farmer');
      } else {
        await api.post('/crops/', payload);
        router.push('/farmer');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register crop. Try using Mock Mode.');
    } finally {
      setLoading(false);
    }
  };

  const theme = getCommodityTheme('Mango');

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">🌱 Register Crop</h1>
          <Link href="/farmer" className="text-sm text-gray-500 hover:underline">
            ← Back
          </Link>
        </div>

        {/* Mock Mode Toggle */}
        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-xl mb-4 flex items-center justify-between">
          <span className="text-sm text-yellow-800">⚡ Backend not available?</span>
          <button
            onClick={() => setUseMock(!useMock)}
            className={`px-3 py-1 rounded text-xs font-semibold ${
              useMock ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'
            }`}
          >
            {useMock ? 'Mock ON' : 'Mock OFF'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm">
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Farmer Name</label>
            <input
              name="farmer_name"
              type="text"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Enter your name"
              defaultValue="Ramesh"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              name="location"
              type="text"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Farm location"
              defaultValue="Lucknow"
            />
          </div>

          {/* Commodity Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Commodity</label>
            <select
              name="commodity"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
              onChange={handleCommodityChange}
              value={selectedCommodity}
            >
              {COMMODITIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Variety – dynamically updated */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Variety</label>
            <input
              name="variety"
              type="text"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Enter variety"
              value={variety}
              onChange={(e) => setVariety(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (kg)</label>
            <input
              name="quantity_kg"
              type="number"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="e.g., 1000"
              defaultValue={1000}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Maturity Stage</label>
            <select
              name="maturity_stage"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="Approaching harvest">🌱 Approaching harvest</option>
              <option value="Ready">✅ Ready</option>
              <option value="Overripe">⚠️ Overripe</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-600 text-white py-3 rounded-xl font-medium hover:bg-amber-700 transition disabled:opacity-50"
            style={{ backgroundColor: theme.primary }}
          >
            {loading ? '⏳ Registering...' : '✅ Register Crop'}
          </button>
        </form>

        <div className="mt-4 text-center text-xs text-gray-400">
          {useMock ? 'Mock mode: data is not saved to backend.' : 'Data will be saved to backend.'}
        </div>
      </div>
    </div>
  );
}