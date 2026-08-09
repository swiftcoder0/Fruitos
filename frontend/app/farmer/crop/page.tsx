'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

export default function RegisterCrop() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      await api.post('/crops/', payload);
      router.push('/farmer');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register crop');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">🌱 Register Crop</h1>
          <Link href="/farmer" className="text-sm text-gray-500 hover:underline">
            ← Back
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4">
            {error}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Commodity</label>
            <select
              name="commodity"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="Mango">Mango</option>
              <option value="Avocado">Avocado</option>
              <option value="Tomato">Tomato</option>
              <option value="Orange">Orange</option>
              <option value="Apple">Apple</option>
              <option value="Banana">Banana</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Variety</label>
            <input
              name="variety"
              type="text"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="e.g., Dashehari"
              defaultValue="Dashehari"
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
              <option value="Approaching harvest">Approaching harvest</option>
              <option value="Ready">Ready</option>
              <option value="Overripe">Overripe</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-600 text-white py-3 rounded-xl font-medium hover:bg-amber-700 transition disabled:opacity-50"
          >
            {loading ? 'Registering...' : '✅ Register Crop'}
          </button>
        </form>
      </div>
    </div>
  );
}