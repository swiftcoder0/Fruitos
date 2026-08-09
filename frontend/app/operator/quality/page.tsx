'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { getCommodityTheme } from '@/components/ui/ThemeProvider';

interface QualityResult {
  batch_id: number;
  batch_identifier: string;
  quality_index: number;
  ripeness: string;
  defects: string;
  remaining_life_days: number;
  analysis_details: string;
}

export default function OperatorQuality() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [batchId, setBatchId] = useState<string>(searchParams.get('batch') || '');
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<QualityResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // If batch ID came from query param, auto-fetch
  useEffect(() => {
    if (batchId && searchParams.get('batch')) {
      // Just pre-fill, user will upload photo
    }
  }, [batchId, searchParams]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selected);
    }
  };

  const handleSubmit = async () => {
    if (!batchId.trim()) {
      setError('Please enter a Batch ID');
      return;
    }
    if (!file) {
      setError('Please select an image to upload');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // First, verify batch exists
      await api.get(`/batches/${batchId.trim()}`);

      // Upload quality image
      const formData = new FormData();
      formData.append('file', file);

      const res = await api.post(`/quality/inspect?batch_identifier=${batchId.trim()}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze quality');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">📷 Quality Inspection</h1>
          <Link href="/operator" className="text-sm text-gray-500 hover:underline">
            ← Back
          </Link>
        </div>

        {/* If no result, show form */}
        {!result ? (
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
            <p className="text-sm text-gray-600">Enter Batch ID and upload a photo for quality analysis.</p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Batch ID</label>
              <input
                type="text"
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
                placeholder="e.g., MAN-001"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload Photo</label>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition"
                onClick={() => fileInputRef.current?.click()}
              >
                {preview ? (
                  <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                ) : (
                  <div>
                    <p className="text-4xl mb-2">📸</p>
                    <p className="text-sm text-gray-500">Click to upload or drag & drop</p>
                    <p className="text-xs text-gray-400">JPG, PNG (max 10MB)</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              {file && (
                <p className="text-xs text-gray-500 mt-1">Selected: {file.name}</p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm">
                ❌ {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? '⏳ Analyzing...' : '🔍 Analyze Quality'}
              </button>
              <button
                onClick={resetForm}
                className="px-4 py-3 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 transition"
              >
                Clear
              </button>
            </div>
          </div>
        ) : (
          // Result Display
          <div>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Quality Status */}
              <div className="p-4 border-b" style={{ backgroundColor: `${getCommodityTheme('Mango').primary}15` }}>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-lg">Batch {result.batch_identifier}</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    result.quality_index > 0.7 ? 'bg-green-100 text-green-700' :
                    result.quality_index > 0.4 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {result.quality_index > 0.7 ? '✅ GOOD' :
                     result.quality_index > 0.4 ? '⚡ FAIR' : '⚠️ POOR'}
                  </span>
                </div>
              </div>

              {/* Image Preview */}
              {preview && (
                <div className="p-4 border-b">
                  <img src={preview} alt="Quality inspection" className="max-h-48 mx-auto rounded-lg" />
                </div>
              )}

              {/* Metrics */}
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 p-3 rounded-xl text-center">
                    <p className="text-xs text-gray-500">Ripeness</p>
                    <p className="text-lg font-semibold">{result.ripeness}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl text-center">
                    <p className="text-xs text-gray-500">Defects</p>
                    <p className="text-lg font-semibold">{result.defects}</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-xl text-center">
                  <p className="text-xs text-gray-500">Quality Index</p>
                  <p className="text-2xl font-bold" style={{ color: getCommodityTheme('Mango').primary }}>
                    {result.quality_index.toFixed(2)}
                  </p>
                </div>

                <div className="bg-blue-50 p-3 rounded-xl text-center border border-blue-200">
                  <p className="text-xs text-gray-500">Remaining Life</p>
                  <p className="text-xl font-bold text-blue-700">{result.remaining_life_days} days</p>
                </div>

                <div className="text-xs text-gray-400 text-center italic">
                  {result.analysis_details}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 space-y-3">
              <button
                onClick={() => router.push(`/operator/timeline?batch=${result.batch_id}`)}
                className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
              >
                📜 View Timeline
              </button>
              <button
                onClick={resetForm}
                className="w-full py-3 rounded-xl border-2 border-gray-300 text-gray-600 font-semibold hover:bg-gray-50 transition"
              >
                🔄 Inspect Another Batch
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}