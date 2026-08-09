'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { getCommodityTheme } from '@/components/ui/ThemeProvider';

interface Event {
  id: number;
  batch_id: number;
  event_type: string;
  temperature_c: number | null;
  location: string | null;
  description: string;
  timestamp: string;
}

interface BatchInfo {
  id: number;
  batch_id: string;
  commodity: string;
  variety: string;
  quantity_kg: number;
  current_location: string;
  remaining_life_days: number;
  quality_index: number;
  status: string;
}

export default function OperatorTimeline() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [batchId, setBatchId] = useState<string>(searchParams.get('batch') || '');
  const [batchInfo, setBatchInfo] = useState<BatchInfo | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTimeline = async () => {
      if (!batchId) {
        setLoading(false);
        return;
      }

      try {
        // 1. Fetch batch info using string identifier
        const batchRes = await api.get(`/batches/${batchId}`);
        setBatchInfo(batchRes.data);
        console.log('✅ Batch numeric ID:', batchRes.data.id); // Debug

        // 2. Fetch events using numeric ID
        try {
          const eventsRes = await api.get(`/events/batch/${batchRes.data.id}`);
          setEvents(eventsRes.data);
          console.log('✅ Events found:', eventsRes.data.length);
        } catch (err: any) {
          // If 404, it means no events – treat as empty
          if (err.response?.status === 404) {
            console.log('ℹ️ No events found for this batch');
            setEvents([]);
          } else {
            throw err;
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch timeline');
      } finally {
        setLoading(false);
      }
    };
    fetchTimeline();
  }, [batchId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (batchId.trim()) {
      window.location.href = `/operator/timeline?batch=${batchId.trim()}`;
    }
  };

  if (!batchId) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">📜 Batch Timeline</h1>
            <Link href="/operator" className="text-sm text-gray-500 hover:underline">
              ← Back
            </Link>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <p className="text-sm text-gray-600 mb-4">Enter a Batch ID to see its journey.</p>
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
                placeholder="e.g., MAN-001"
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                🔍 View
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error || !batchInfo) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto">
          <div className="bg-red-50 text-red-600 p-4 rounded-xl">
            ❌ {error || 'Batch not found'}
          </div>
          <Link href="/operator/timeline" className="block mt-4 text-blue-500 hover:underline">
            ← Try another batch
          </Link>
        </div>
      </div>
    );
  }

  const theme = getCommodityTheme(batchInfo.commodity);
  const eventEmojis: Record<string, string> = {
    temperature: '🌡️',
    location: '📍',
    quality_scan: '📷',
    harvest: '🌾',
  };

  const getEventColor = (event: Event) => {
    if (event.event_type === 'temperature') {
      const temp = event.temperature_c || 0;
      if (temp > 28) return 'bg-red-50 border-red-200 text-red-700';
      if (temp > 20) return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      return 'bg-green-50 border-green-200 text-green-700';
    }
    if (event.event_type === 'location') return 'bg-blue-50 border-blue-200 text-blue-700';
    if (event.event_type === 'quality_scan') return 'bg-purple-50 border-purple-200 text-purple-700';
    return 'bg-gray-50 border-gray-200 text-gray-700';
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.bgGradient} p-4`}>
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">📜 Batch Timeline</h1>
          <Link href="/operator" className="text-sm text-gray-500 hover:underline">
            ← Back
          </Link>
        </div>

        {/* Batch Summary */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{theme.icon}</span>
            <div>
              <h2 className="font-bold text-lg">{batchInfo.batch_id}</h2>
              <p className="text-sm text-gray-600">
                {batchInfo.commodity} {batchInfo.variety} · {batchInfo.quantity_kg} kg
              </p>
              <p className="text-xs text-gray-500">📍 {batchInfo.current_location}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-500">Remaining Life</p>
              <p className="font-semibold">{batchInfo.remaining_life_days.toFixed(1)} days</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Quality Index</p>
              <p className="font-semibold">{batchInfo.quality_index.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-300" />

          {events.length === 0 ? (
            <div className="bg-white p-6 rounded-xl text-center text-gray-500 border border-dashed border-gray-300">
              <p className="text-4xl mb-2">📭</p>
              <p>No events recorded for this batch yet.</p>
              <p className="text-xs mt-1">Add temperature or location events to see them here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event, idx) => {
                const emoji = eventEmojis[event.event_type] || '📌';
                const colorClass = getEventColor(event);
                const isFirst = idx === 0;
                const isLast = idx === events.length - 1;

                return (
                  <div key={event.id} className="relative pl-12">
                    <div className={`absolute left-2 top-1 w-4 h-4 rounded-full border-2 ${
                      isFirst ? 'bg-green-500 border-green-500' :
                      isLast ? 'bg-blue-500 border-blue-500' :
                      'bg-white border-gray-400'
                    }`} />

                    <div className={`rounded-xl p-4 border ${colorClass}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-medium">
                            {emoji} {event.event_type.toUpperCase()}
                          </span>
                          {event.description && (
                            <p className="text-sm mt-1">{event.description}</p>
                          )}
                          {event.event_type === 'temperature' && event.temperature_c !== null && (
                            <p className="text-sm font-bold mt-1">
                              {event.temperature_c}°C
                            </p>
                          )}
                          {event.event_type === 'location' && event.location && (
                            <p className="text-sm mt-1">📍 {event.location}</p>
                          )}
                        </div>
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          {new Date(event.timestamp).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 space-y-3">
          <button
            onClick={() => router.push(`/manager/decision/${batchInfo.id}`)}
            className="w-full py-3 rounded-xl text-white font-semibold"
            style={{ backgroundColor: theme.primary }}
          >
            📊 View Decision
          </button>
          <Link
            href="/operator"
            className="block w-full py-3 rounded-xl border-2 border-gray-300 text-gray-600 text-center font-semibold hover:bg-gray-50 transition"
          >
            ← Back to Operator
          </Link>
        </div>
      </div>
    </div>
  );
}