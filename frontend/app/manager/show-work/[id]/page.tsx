'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { getCommodityTheme } from '@/components/ui/ThemeProvider';

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
}

export default function ShowYourWork() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<DecisionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/decisions/${id}`);
        setData(res.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
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
  const riskEmoji = data.risk.risk_level === 'HIGH' ? '🔴' : data.risk.risk_level === 'MEDIUM' ? '🟡' : '🟢';

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.bgGradient} p-4`}>
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">🔍 Show Your Work</h1>
          <Link href={`/manager/decision/${id}`} className="text-sm text-gray-500 hover:underline">
            ← Back
          </Link>
        </div>

        <div className="space-y-4">
          {/* Batch Info */}
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{theme.icon}</span>
              <div>
                <h2 className="font-bold text-lg">{data.batch_identifier}</h2>
                <p className="text-sm text-gray-600">
                  {data.commodity} {data.variety}
                </p>
              </div>
              <span className="ml-auto text-2xl">{riskEmoji}</span>
            </div>
          </div>

          {/* 📌 Source: Quality Index */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <p className="font-semibold">📊 Quality Index</p>
            </div>
            <div className="p-4">
              <p className="text-2xl font-bold" style={{ color: theme.primary }}>
                {data.quality_index.toFixed(2)}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <span className="font-medium">📖 Source:</span> Mock analysis
                <span className="text-xs text-gray-400 ml-2">(will be ML model)</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                ⚠️ Currently using simulated values for demo.
              </p>
            </div>
          </div>

          {/* 📌 Source: Remaining Life */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <p className="font-semibold">⏳ Remaining Life</p>
            </div>
            <div className="p-4">
              <p className="text-2xl font-bold text-blue-600">
                {data.remaining_life_days.toFixed(1)} days
              </p>
              <div className="mt-2 space-y-1 text-sm">
                <p><span className="font-medium">📖 Source:</span> Q10 model with temperature history</p>
                <p className="text-gray-600">🔢 Base: 7.0 days @ 13°C</p>
                <p className="text-gray-600">📊 Quality multiplier: {data.quality_index.toFixed(2)}</p>
                <p className="text-xs text-gray-400 mt-1">
                  ⚠️ Q10 coefficient (2.0) from literature; base life and multiplier are assumptions.
                </p>
              </div>
            </div>
          </div>

          {/* 📌 Source: Demand */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <p className="font-semibold">📈 Demand Forecast</p>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500">Inventory</p>
                  <p className="font-bold">{data.risk.inventory_kg} kg</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Expected Demand</p>
                  <p className="font-bold">{data.risk.expected_demand_kg} kg</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                <span className="font-medium">📖 Source:</span> demand_mock.csv
              </p>
              <p className="text-xs text-gray-400 mt-1">
                ⚠️ Fallback: 500kg if CSV lookup fails.
              </p>
            </div>
          </div>

          {/* 📌 Source: Safety */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <p className="font-semibold">🛡️ Safety Check</p>
            </div>
            <div className="p-4">
              <div className={`p-3 rounded-xl text-sm ${data.safety_check.is_safe ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {data.safety_check.is_safe ? '✅ Safe' : '❌ Unsafe'}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                <span className="font-medium">📖 Source:</span> commodity_parameters.json
              </p>
              <p className="text-sm text-gray-600">
                Safe range: {data.safety_check.min_safe_temp}–{data.safety_check.max_safe_temp}°C
              </p>
              <p className="text-xs text-gray-400 mt-1">
                📚 Cited: USDA/FDA guidelines for {data.commodity} storage
              </p>
            </div>
          </div>

          {/* 📌 Action Comparison */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <p className="font-semibold">💰 Action Economics</p>
            </div>
            <div className="p-4 space-y-2">
              {Object.entries(data.actions).map(([key, action]) => {
                const isWinner = data.recommendation?.action === key;
                return (
                  <div
                    key={key}
                    className={`flex justify-between items-center p-2 rounded-lg text-sm ${
                      isWinner ? 'bg-amber-50 border border-amber-200' : ''
                    }`}
                  >
                    <span className={isWinner ? 'font-bold' : ''}>
                      {key.toUpperCase()}
                      {isWinner && ' ⭐'}
                    </span>
                    <span>₹{action.net_value.toLocaleString()}</span>
                    <span className="text-gray-500">{action.waste_kg}kg waste</span>
                    <span className={action.feasible ? 'text-green-600' : 'text-red-600'}>
                      {action.feasible ? '✅' : '❌'}
                    </span>
                  </div>
                );
              })}
              <p className="text-xs text-gray-400 mt-2">
                📖 Source: economics.py – price, markdowns, transport costs are assumptions.
              </p>
            </div>
          </div>

          {/* Bottom */}
          <div className="bg-white rounded-2xl shadow-lg p-4 text-center">
            <p className="text-sm text-gray-600">
              📌 Every number in this decision is traceable.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Some values are mock/assumptions for demo – replace with real data in production.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Link
              href={`/manager/decision/${id}`}
              className="flex-1 py-3 rounded-xl text-white text-center font-semibold"
              style={{ backgroundColor: theme.primary }}
            >
              ← Back to Decision
            </Link>
            <Link
              href="/manager"
              className="flex-1 py-3 rounded-xl border-2 text-center font-semibold"
              style={{ borderColor: theme.primary, color: theme.primary }}
            >
              📊 Control Center
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}