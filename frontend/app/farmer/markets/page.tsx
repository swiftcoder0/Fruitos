'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight, MapPin, Package, Radio, HomeIcon,
  IndianRupee, Boxes, ChevronRight, ArrowUp, ArrowDown,
  Calendar, Store, Clock, TrendingUp, Shield,
} from 'lucide-react';
import api from '@/lib/api';
import { getCommodityTheme } from '@/components/ui/ThemeProvider';

// jali lattice texture
const JALI_BG = `repeating-linear-gradient(45deg, rgba(255,255,255,0.07) 0 1px, transparent 1px 12px),
                  repeating-linear-gradient(-45deg, rgba(255,255,255,0.07) 0 1px, transparent 1px 12px)`;

interface Market {
  market: string;
  price_per_kg: number;
  transport_cost: number;
  deterioration_loss: number;
  net_value: number;
  distance_km: number;
  travel_hours: number;
  recommended?: boolean;
}

export default function FarmerMarkets() {
  const router = useRouter();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [recommended, setRecommended] = useState<Market | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1000);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Try to get crop quantity
        try {
          const cropRes = await api.get('/crops/1');
          if (cropRes.data?.quantity_kg) {
            setQuantity(cropRes.data.quantity_kg);
          }
        } catch {
          // Use default
        }

        const res = await api.get(`/markets/?quantity_kg=${quantity}`);
        const data = res.data;
        if (data.markets) {
          const marketsWithRecommendation = data.markets.map((m: any) => ({
            ...m,
            recommended: m.market === data.recommended?.market,
          }));
          setMarkets(marketsWithRecommendation);
          if (data.recommended) {
            const rec = marketsWithRecommendation.find((m: any) => m.market === data.recommended.market);
            setRecommended(rec || marketsWithRecommendation[0]);
          } else {
            setRecommended(marketsWithRecommendation[0]);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch markets');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [quantity]);

  const ink = '#2B211A',
    sub = '#8A7A6C',
    paper = '#FFFBF6',
    card = '#FFFFFF',
    line = '#F0E2D2';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#EFE6DA' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#FF6B1A' }} />
      </div>
    );
  }

  if (error || markets.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#EFE6DA' }}>
        <div className="text-center">
          <div className="text-red-600 mb-4">{error || 'No markets found'}</div>
          <Link href="/farmer" className="inline-block px-6 py-3 rounded-xl text-white font-semibold" style={{ background: '#FF6B1A' }}>
            ← Back
          </Link>
        </div>
      </div>
    );
  }

  const theme = getCommodityTheme('Mango');
  const best = recommended || markets.find((m) => m.recommended) || markets[0];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#EFE6DA',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Mono:wght@400;500;600&family=Noto+Sans+Devanagari:wght@500;600&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        .display { font-family: 'Space Grotesk', sans-serif; }
        .mono { font-family: 'IBM Plex Mono', monospace; }
        .deva { font-family: 'Noto Sans Devanagari', sans-serif; }
        button { cursor:pointer; font-family:'Inter',sans-serif; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .fade-item { animation: fadeUp 0.5s cubic-bezier(.2,.8,.2,1) both; }
      `}</style>

      <div
        style={{
          width: 390,
          background: paper,
          borderRadius: 38,
          overflow: 'hidden',
          boxShadow: '0 30px 60px rgba(43,33,26,0.35)',
          border: '8px solid #1A1410',
        }}
      >
        {/* Status Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '14px 22px 0',
            fontSize: 12.5,
            color: ink,
            fontWeight: 600,
          }}
        >
          <span>9:41</span>
          <span>●●●● 5G 92%</span>
        </div>

        {/* Header */}
        <div style={{ padding: '10px 22px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 9,
                background: theme.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Store size={16} color="#fff" />
            </div>
            <div>
              <div className="display" style={{ fontSize: 19, fontWeight: 700, color: ink, letterSpacing: -0.3, lineHeight: 1 }}>
                Fresh<span style={{ color: theme.primary }}>OS</span>
              </div>
              <div className="deva" style={{ fontSize: 9.5, color: sub, fontWeight: 600 }}>
                बाजार विश्लेषण
              </div>
            </div>
          </div>
          <button
            onClick={() => router.push('/farmer')}
            style={{ fontSize: 11, color: sub, fontWeight: 600, background: 'none', border: 'none' }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '6px 20px 18px' }}>
          <div className="fade-item" style={{ marginBottom: 4 }}>
            <div className="mono" style={{ fontSize: 11, letterSpacing: 1, color: sub, fontWeight: 600 }}>
              MARKET INTELLIGENCE
            </div>
            <div className="display" style={{ fontSize: 20, fontWeight: 700, color: ink }}>
              Where should this go?
            </div>
          </div>
          <div className="deva" style={{ fontSize: 11, color: sub, marginBottom: 14 }}>
            सबसे अच्छा बाज़ार
          </div>

          {/* Recommended */}
          <div
            className="fade-item"
            style={{
              animationDelay: '80ms',
              background: `linear-gradient(135deg, ${theme.primary}, ${theme.primaryDark})`,
              borderRadius: 20,
              padding: '18px 18px 16px',
              marginBottom: 18,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', inset: 0, backgroundImage: JALI_BG }} />
            <div
              style={{
                position: 'absolute',
                right: -20,
                top: -20,
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.12)',
              }}
            />
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#fff',
                opacity: 0.85,
                letterSpacing: 1.2,
                marginBottom: 6,
                position: 'relative',
              }}
            >
              RECOMMENDED
            </div>
            <div className="display" style={{ fontSize: 26, fontWeight: 700, color: '#fff', marginBottom: 10, position: 'relative' }}>
              {best?.market || 'Kanpur'}
            </div>
            <div style={{ display: 'flex', gap: 20, position: 'relative' }}>
              <div>
                <div className="mono" style={{ fontSize: 20, fontWeight: 600, color: '#fff' }}>
                  ₹{best?.net_value?.toLocaleString('en-IN') || '—'}
                </div>
                <div style={{ fontSize: 10.5, color: '#fff', opacity: 0.85 }}>net value</div>
              </div>
              <div>
                <div className="mono" style={{ fontSize: 20, fontWeight: 600, color: '#fff' }}>
                  ₹{best?.price_per_kg || 0}
                  <span style={{ fontSize: 12 }}>/kg</span>
                </div>
                <div style={{ fontSize: 10.5, color: '#fff', opacity: 0.85 }}>listed price</div>
              </div>
            </div>
          </div>

          {/* All markets */}
          <div style={{ fontSize: 11, fontWeight: 700, color: sub, letterSpacing: 0.6, marginBottom: 8 }}>
            ALL MARKETS COMPARED
          </div>
          <div style={{ background: card, border: `1px solid ${line}`, borderRadius: 16, overflow: 'hidden' }}>
            {markets.map((m, i) => (
              <div
                key={m.market}
                className="fade-item"
                style={{
                  animationDelay: `${180 + i * 60}ms`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  background: m.recommended ? `${theme.primary}15` : 'transparent',
                  borderTop: i === 0 ? 'none' : `1px solid ${line}`,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: ink }}>{m.market}</span>
                    {m.recommended && (
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          padding: '2px 7px',
                          borderRadius: 20,
                          background: theme.primary,
                          color: '#fff',
                        }}
                      >
                        BEST
                      </span>
                    )}
                  </div>
                  <div className="mono" style={{ fontSize: 11, color: sub, marginTop: 2 }}>
                    ₹{m.price_per_kg}/kg · {m.distance_km}km · {m.travel_hours}h
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="mono" style={{ fontSize: 14, fontWeight: 600, color: ink }}>
                    ₹{m.net_value.toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: 9.5, color: sub }}>net for {quantity.toLocaleString('en-IN')}kg</div>
                </div>
              </div>
            ))}
          </div>

          {/* Insight */}
          <div
            className="fade-item"
            style={{
              animationDelay: '360ms',
              marginTop: 14,
              display: 'flex',
              gap: 8,
              alignItems: 'flex-start',
              background: `${theme.primary}15`,
              border: `1px solid ${theme.primary}30`,
              borderRadius: 14,
              padding: '12px 14px',
            }}
          >
            <Clock size={14} color={theme.primaryDark} style={{ marginTop: 1, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: theme.primaryDark, lineHeight: 1.4 }}>
              Delhi lists the highest price, but long travel time and spoilage eat the value —{' '}
              <strong>{best?.market || 'Kanpur'}</strong> wins on what actually reaches your pocket.
            </span>
          </div>

          {/* Action */}
          <div className="fade-item" style={{ animationDelay: '420ms', marginTop: 16 }}>
            <button
              onClick={() => router.push('/farmer/transport')}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 16,
                border: 'none',
                background: theme.primary,
                color: '#fff',
                fontWeight: 700,
                fontSize: 15,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              🚚 Select {best?.market || 'Kanpur'} & Find Transport
              <ArrowRight size={18} />
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <Link href="/farmer" style={{ fontSize: 11, color: sub, textDecoration: 'none' }}>
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}