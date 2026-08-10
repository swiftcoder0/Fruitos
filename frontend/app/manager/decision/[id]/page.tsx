'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCommodityTheme } from '@/components/ui/ThemeProvider';
import api from '@/lib/api';

interface DecisionData {
  batch_id: number;
  batch_identifier: string;
  commodity: string;
  variety: string;
  location: string;
  remaining_life_days: number;
  quality_index: number;
  risk: {
    inventory_kg: number;
    expected_demand_kg: number;
    at_risk_kg: number;
    excess_percentage: number;
    risk_level: string;
    message: string;
  };
  safety_check: {
    is_safe: boolean;
    reason: string;
    min_safe_temp: number;
    max_safe_temp: number;
    storage_temp: number | null;
  };
  actions: Record<string, any>;
  recommendation: any;
  explanation: string;
  current_temperature: number | null;
}

export default function DecisionPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [data, setData] = useState<DecisionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMock, setIsMock] = useState(false);

  useEffect(() => {
    const fetchDecision = async () => {
      try {
        // Check if we're in mock mode
        const storedBatch = sessionStorage.getItem('mockBatch');
        if (storedBatch) {
          const mockBatch = JSON.parse(storedBatch);
          // For mock mode, we need to fetch decision from backend or generate mock
          // Since decision endpoint needs real data, let's try to call it
          // If backend fails, use mock decision data
        }

        // Try real backend first
        const res = await api.get(`/decisions/${id}`);
        setData(res.data);
        setIsMock(false);
      } catch (err: any) {
        // If backend fails, try mock data from sessionStorage
        const storedBatch = sessionStorage.getItem('mockBatch');
        const storedCrop = sessionStorage.getItem('mockCrop');
        
        if (storedBatch && storedCrop) {
          const batch = JSON.parse(storedBatch);
          const crop = JSON.parse(storedCrop);
          // Generate mock decision data
          const mockData: DecisionData = {
            batch_id: batch.id,
            batch_identifier: batch.batch_id,
            commodity: crop.commodity,
            variety: crop.variety,
            location: crop.location,
            remaining_life_days: 7,
            quality_index: 0.87,
            current_temperature: 25,
            risk: {
              inventory_kg: crop.quantity_kg,
              expected_demand_kg: crop.quantity_kg * 0.6,
              at_risk_kg: crop.quantity_kg * 0.4,
              excess_percentage: 40,
              risk_level: 'HIGH',
              message: '⚠️ High risk – demand significantly lower than inventory.',
            },
            safety_check: {
              is_safe: true,
              reason: '✅ Temperature 25°C is safe for this commodity.',
              min_safe_temp: 13,
              max_safe_temp: 30,
              storage_temp: 25,
            },
            actions: {
              hold: { net_value: 22500, waste_kg: 400, feasible: true, reason: 'Hold action' },
              markdown10: { net_value: 25000, waste_kg: 300, feasible: true, reason: '10% markdown' },
              markdown25: { net_value: 26875, waste_kg: 150, feasible: true, reason: '25% markdown' },
              transfer: { net_value: 48920, waste_kg: 0, feasible: true, reason: 'Transfer to Kanpur' },
              rescue: { net_value: 15000, waste_kg: 0, feasible: true, reason: 'Rescue' },
              coldstore_x: { net_value: 52500, waste_kg: 0, feasible: false, reason: '❌ 5°C unsafe' },
            },
            recommendation: {
              action: 'transfer',
              net_value: 48920,
              waste_kg: 0,
              reason: 'Best net value after transport & spoilage.',
            },
            explanation: '✅ Recommended: TRANSFER\nNet value: ₹48,920 | Waste: 0 kg\n\n📊 All actions evaluated...',
          };
          setData(mockData);
          setIsMock(true);
        } else {
          setError(err instanceof Error ? err.message : 'Failed to fetch decision');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDecision();
  }, [id]);

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
        <div className="text-red-600">Error: {error || 'No data found'}</div>
      </div>
    );
  }

  const theme = getCommodityTheme(data.commodity);
  const actionLabels: Record<string, string> = {
    hold: 'Hold',
    markdown10: 'Markdown 10%',
    markdown25: 'Markdown 25%',
    transfer: 'Transfer',
    rescue: 'Rescue',
    coldstore_x: 'Cold Store X',
  };

  const riskColors = {
    HIGH: 'text-red-600 bg-red-50 border-red-200',
    MEDIUM: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    LOW: 'text-green-600 bg-green-50 border-green-200',
  };

  const riskEmojis = {
    HIGH: '🔴',
    MEDIUM: '🟡',
    LOW: '🟢',
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.bgGradient} p-4`}>
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <span className="text-2xl font-bold" style={{ color: theme.primary }}>
            {theme.icon} FreshOS
          </span>
          <Link href="/manager" className="text-sm text-gray-500 hover:underline">
            ← Back
          </Link>
        </div>

        {isMock && (
          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-xl mb-4 text-sm text-yellow-800">
            ⚡ Mock Mode: Showing sample decision data.
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Risk Header */}
          <div className={`px-4 py-3 flex justify-between items-center border-b ${
            riskColors[data.risk.risk_level as keyof typeof riskColors]
          }`}>
            <span className="font-semibold text-gray-700">
              DECISION · {data.batch_identifier}
            </span>
            <span className="font-semibold">
              {riskEmojis[data.risk.risk_level as keyof typeof riskEmojis]} {data.risk.risk_level} RISK
            </span>
          </div>

          {/* Crop Info */}
          <div className="px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{theme.icon}</span>
              <div>
                <h2 className="font-bold text-lg">{data.commodity} {data.variety}</h2>
                <p className="text-sm text-gray-500">
                  📍 {data.location} · {data.risk.at_risk_kg}kg at risk
                </p>
              </div>
            </div>
          </div>

          {/* Recommendation */}
          {data.recommendation && (
            <div className="mx-4 p-4 rounded-xl mb-3"
                 style={{ backgroundColor: `${theme.primary}15`, borderColor: theme.primary }}>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium" style={{ color: theme.primary }}>
                    RECOMMENDED
                  </p>
                  <p className="text-xl font-bold" style={{ color: theme.primaryDark }}>
                    {actionLabels[data.recommendation.action] || data.recommendation.action}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">net value</p>
                  <p className="text-xl font-bold" style={{ color: theme.primary }}>
                    ₹{data.recommendation.net_value.toLocaleString()}
                  </p>
                  <p className="text-sm text-green-600">{data.recommendation.waste_kg}kg waste</p>
                </div>
              </div>
            </div>
          )}

          {/* All Options */}
          <div className="px-4 pb-4">
            <p className="text-sm font-semibold text-gray-600 mb-2">ALL OPTIONS COMPARED</p>
            {Object.entries(data.actions).map(([key, action]) => {
              const label = actionLabels[key] || key;
              const isWinner = data.recommendation?.action === key;
              const isRejected = !action.feasible;

              return (
                <div
                  key={key}
                  className={`flex justify-between items-center py-2 px-3 rounded-lg mb-1
                    ${isWinner ? 'border-2' : 'border border-gray-100'}
                    ${isRejected ? 'bg-gray-50 opacity-60' : 'bg-white'}`}
                  style={isWinner ? { borderColor: theme.primary } : {}}
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${isWinner ? 'font-bold' : ''}`}>
                      {label}
                    </span>
                    {isWinner && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                            style={{ backgroundColor: theme.primary }}>
                        WINNER
                      </span>
                    )}
                    {isRejected && (
                      <span className="text-xs text-gray-400">❌ UNSAFE</span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className={`text-sm ${isWinner ? 'font-bold' : ''}`}>
                      ₹{action.net_value.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">{action.waste_kg}kg waste</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Explanation */}
        {data.explanation && (
          <div className="mt-4 bg-white rounded-xl p-4 shadow-md">
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {data.explanation}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button
            className="flex-1 py-3 rounded-xl text-white font-semibold"
            style={{ backgroundColor: theme.primary }}
          >
            ✅ Approve Action
          </button>
          <Link
            href={`/manager/show-work/${data.batch_id}`}
            className="px-4 py-3 rounded-xl border-2 font-semibold text-center"
            style={{ borderColor: theme.primary, color: theme.primary }}
          >
            🔍 Show Work
          </Link>
        </div>
      </div>
    </div>
  );
}