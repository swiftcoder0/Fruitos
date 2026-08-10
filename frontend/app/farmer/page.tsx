'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight, MapPin, Package, Radio, Home as HomeIcon,
  IndianRupee, Boxes, ChevronRight, ArrowUp, ArrowDown, CloudRain,
  Calendar, Store, QrCode, Clock, Sun,
} from 'lucide-react';
import api from '@/lib/api';
import { getCommodityTheme } from '@/components/ui/ThemeProvider';

// ---------------------------------------------------------------------------
// MOCK DATA for Mandi ticker only (static)
// ---------------------------------------------------------------------------
const MANDI_TICKS = [
  { name: 'Lucknow · Mango', price: 48, dir: 'up' },
  { name: 'Kanpur · Mango', price: 54, dir: 'up' },
  { name: 'Delhi · Mango', price: 63, dir: 'down' },
  { name: 'Nagpur · Santra', price: 42, dir: 'down' },
  { name: 'Jalgaon · Kela', price: 28, dir: 'down' },
  { name: 'Kolar · Tamatar', price: 19, dir: 'up' },
];

const JALI_BG = `repeating-linear-gradient(45deg, rgba(255,255,255,0.07) 0 1px, transparent 1px 12px),
                  repeating-linear-gradient(-45deg, rgba(255,255,255,0.07) 0 1px, transparent 1px 12px)`;

function daysUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
}

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

interface Market {
  name: string;
  price_per_kg: number;
  transport_cost: number;
  deterioration_loss: number;
  net_value: number;
  distance_km: number;
  travel_hours: number;
  recommended?: boolean;
}

export default function FarmerDashboard() {
  const router = useRouter();
  const [crop, setCrop] = useState<Crop | null>(null);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ------------------------------------------------------------
  // FIX: fetch latest crop or mock from sessionStorage
  // ------------------------------------------------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Check sessionStorage for mock crop (from mock registration)
        const stored = sessionStorage.getItem('mockCrop');
        if (stored) {
          const mockCrop = JSON.parse(stored);
          setCrop(mockCrop);
          // fetch markets with its quantity
          const marketRes = await api.get(`/markets/?quantity_kg=${mockCrop.quantity_kg || 1000}`);
          const marketData = marketRes.data.markets || [];
          if (marketRes.data.recommended) {
            const rec = marketRes.data.recommended;
            const found = marketData.find((m: any) => m.market === rec.market);
            if (found) found.recommended = true;
          }
          setMarkets(marketData);
          setLoading(false);
          return;
        }

        // 2. If backend is available, fetch the LATEST crop
        try {
          // get all crops and pick the one with highest id
          const cropsRes = await api.get('/crops/');
          if (cropsRes.data && cropsRes.data.length > 0) {
            const latestCrop = cropsRes.data.sort((a: any, b: any) => b.id - a.id)[0];
            setCrop(latestCrop);
            const marketRes = await api.get(`/markets/?quantity_kg=${latestCrop.quantity_kg || 1000}`);
            const marketData = marketRes.data.markets || [];
            if (marketRes.data.recommended) {
              const rec = marketRes.data.recommended;
              const found = marketData.find((m: any) => m.market === rec.market);
              if (found) found.recommended = true;
            }
            setMarkets(marketData);
            setLoading(false);
            return;
          }
        } catch {
          // backend may be down – fall through to default
        }

        // 3. fallback: default mango (if nothing found)
        const defaultCrop = {
          id: 1,
          farmer_name: 'Ramesh',
          location: 'Lucknow',
          commodity: 'Mango',
          variety: 'Dashehari',
          quantity_kg: 1000,
          maturity_stage: 'Approaching harvest',
          harvest_window_start: new Date(Date.now() + 2*86400000).toISOString(),
          harvest_window_end: new Date(Date.now() + 4*86400000).toISOString(),
          weather_risk: 'Rain risk increasing after window',
        };
        setCrop(defaultCrop);
        setError('Showing sample Mango. Please register your crop.');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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

  if (error && !crop) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#EFE6DA' }}>
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <Link
            href="/farmer/crop"
            className="inline-block px-6 py-3 rounded-xl text-white font-semibold"
            style={{ background: '#FF6B1A' }}
          >
            Register Crop
          </Link>
        </div>
      </div>
    );
  }

  // theme is now dynamic based on actual crop.commodity
  const theme = crop ? getCommodityTheme(crop.commodity) : getCommodityTheme('Mango');
  const bestMarket = markets.find((m) => m.recommended) || markets[0];
  const daysToHarvest = crop ? daysUntil(crop.harvest_window_start) : 0;

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
        @keyframes pulseRing { 0% { box-shadow: 0 0 0 0 rgba(196,70,10,0.35); } 70% { box-shadow: 0 0 0 8px rgba(196,70,10,0); } 100% { box-shadow: 0 0 0 0 rgba(196,70,10,0); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .fade-item { animation: fadeUp 0.5s cubic-bezier(.2,.8,.2,1) both; }
      `}</style>

      <div
        style={{
          width: '100%',
          maxWidth: '100%',
          background: paper,
          overflow: 'hidden',
          minHeight: '100vh',
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
              <Package size={16} color="#fff" />
            </div>
            <div>
              <div className="display" style={{ fontSize: 19, fontWeight: 700, color: ink, letterSpacing: -0.3, lineHeight: 1 }}>
                Fresh<span style={{ color: theme.primary }}>OS</span>
              </div>
              <div className="deva" style={{ fontSize: 9.5, color: sub, fontWeight: 600 }}>
                किसान डैशबोर्ड
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10.5, color: sub, fontWeight: 600 }}>
            <Radio size={11} color="#2F9E44" /> LIVE
          </div>
        </div>

        {/* Mandi Ticker */}
        <MandiTicker ticks={MANDI_TICKS} />

        {/* Main Content – crop is guaranteed non-null here */}
        {crop && (
          <FarmerHome
            ink={ink}
            sub={sub}
            card={card}
            line={line}
            crop={crop}
            theme={theme}
            daysToHarvest={daysToHarvest}
            bestMarket={bestMarket}
            onGoMarkets={() => router.push('/farmer/markets')}
          />
        )}

        {/* Bottom Navigation */}
        <div style={{ display: 'flex', borderTop: `1px solid ${line}`, background: card }}>
          {[
            ['home', 'Home', HomeIcon],
            ['markets', 'Markets', Store],
          ].map((item, index) => {
            const [key, label, Icon] = item;
            return (
              <button
                key={index}
                onClick={() => {
                  if (key === 'home') router.push('/farmer');
                  if (key === 'markets') router.push('/farmer/markets');
                }}
                style={{
                  flex: 1,
                  border: 'none',
                  background: 'transparent',
                  padding: '12px 0 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 3,
                  position: 'relative',
                }}
              >
                <Icon size={18} color={'#C9BBAB'} />
                <span style={{ fontSize: 10.5, fontWeight: 600, color: '#C9BBAB' }}>{label}</span>
              </button>
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 8, background: card }}>
          <div style={{ width: 120, height: 4, borderRadius: 4, background: '#E7D9C8' }} />
        </div>
      </div>
    </div>
  );
}

// ---------- Sub Components ----------
function MandiTicker({ ticks }: { ticks: typeof MANDI_TICKS }) {
  const items = [...ticks, ...ticks];
  return (
    <div style={{ background: '#2B211A', padding: '6px 0', overflow: 'hidden', marginBottom: 4 }}>
      <div style={{ display: 'flex', width: 'max-content', animation: 'marquee 22s linear infinite' }}>
        {items.map((t, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '0 16px',
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ fontSize: 10.5, color: '#D9C8B8', fontWeight: 600 }}>{t.name}</span>
            <span className="mono" style={{ fontSize: 10.5, color: '#fff', fontWeight: 600 }}>
              ₹{t.price}/kg
            </span>
            {t.dir === 'up' ? <ArrowUp size={10} color="#5FD08A" /> : <ArrowDown size={10} color="#FF8A65" />}
          </div>
        ))}
      </div>
    </div>
  );
}

interface FarmerHomeProps {
  ink: string;
  sub: string;
  card: string;
  line: string;
  crop: Crop;
  theme: any;
  daysToHarvest: number;
  bestMarket: any;
  onGoMarkets: () => void;
}

function FarmerHome({
  ink,
  sub,
  card,
  line,
  crop,
  theme,
  daysToHarvest,
  bestMarket,
  onGoMarkets,
}: FarmerHomeProps) {
  return (
    <div style={{ padding: '10px 20px 18px' }}>
      <div className="fade-item" style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12.5, color: sub, fontWeight: 600 }}>Good morning, {crop.farmer_name}</div>
        <div className="display" style={{ fontSize: 21, fontWeight: 700, color: ink }}>
          Your {crop.variety} {crop.commodity}
        </div>
      </div>

      {/* Hero: crop status */}
      <div
        className="fade-item"
        style={{
          animationDelay: '80ms',
          background: `linear-gradient(135deg, ${theme.primary}, ${theme.primaryDark})`,
          borderRadius: 20,
          padding: '16px 16px 14px',
          marginBottom: 14,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, backgroundImage: JALI_BG }} />
        <div style={{ position: 'absolute', right: -18, bottom: -22, fontSize: 90, opacity: 0.18, lineHeight: 1 }}>
          {theme.icon}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, position: 'relative' }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#fff',
              animation: 'pulseRing 0.9s ease-out infinite',
            }}
          />
          <span
            className="mono"
            style={{
              fontSize: 10.5,
              fontWeight: 700,
              color: '#fff',
              opacity: 0.85,
              letterSpacing: 0.6,
            }}
          >
            {crop.maturity_stage.toUpperCase()} · {daysToHarvest}D TO WINDOW
          </span>
        </div>
        <div className="display" style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 2, position: 'relative' }}>
          Harvest in {daysToHarvest} days
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 11.5,
            color: '#fff',
            opacity: 0.85,
            position: 'relative',
          }}
        >
          <MapPin size={10} /> {crop.location} · {crop.quantity_kg.toLocaleString('en-IN')}kg
        </div>
      </div>

      {/* Quick stats */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
        <div className="fade-item" style={{ animationDelay: '140ms', flex: 1, background: card, border: `1px solid ${line}`, borderRadius: 16, padding: '12px 14px' }}>
          <IndianRupee size={14} color={theme.primary} />
          <div className="mono" style={{ fontSize: 17, fontWeight: 600, color: ink, marginTop: 6 }}>
            ₹{bestMarket?.net_value?.toLocaleString('en-IN') || '—'}
          </div>
          <div style={{ fontSize: 10, color: sub, fontWeight: 600 }}>expected net value</div>
        </div>
        <div className="fade-item" style={{ animationDelay: '200ms', flex: 1, background: card, border: `1px solid ${line}`, borderRadius: 16, padding: '12px 14px' }}>
          <Boxes size={14} color={theme.primary} />
          <div className="mono" style={{ fontSize: 17, fontWeight: 600, color: ink, marginTop: 6 }}>
            {crop.quantity_kg.toLocaleString('en-IN')}kg
          </div>
          <div style={{ fontSize: 10, color: sub, fontWeight: 600 }}>total quantity</div>
        </div>
      </div>

      {/* Harvest window + weather */}
      <div className="fade-item" style={{ animationDelay: '240ms', background: card, border: `1px solid ${line}`, borderRadius: 16, padding: '13px 16px', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <Calendar size={14} color={theme.primary} />
          <span style={{ fontSize: 12.5, fontWeight: 700, color: ink }}>Suggested harvest window</span>
        </div>
        <div className="mono" style={{ fontSize: 15, color: ink, fontWeight: 600, marginBottom: 8 }}>
          {new Date(crop.harvest_window_start).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          {' – '}
          {new Date(crop.harvest_window_end).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingTop: 8, borderTop: `1px dashed ${line}` }}>
          <CloudRain size={12} color="#E8830A" />
          <span style={{ fontSize: 11, color: sub }}>{crop.weather_risk}</span>
        </div>
      </div>

      {/* Best market preview */}
      <button
        onClick={onGoMarkets}
        className="fade-item"
        style={{
          animationDelay: '300ms',
          width: '100%',
          textAlign: 'left',
          background: `${theme.primary}15`,
          border: `1px solid ${theme.primary}30`,
          borderRadius: 16,
          padding: '13px 16px',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Store size={13} color={theme.primaryDark} />
            <span style={{ fontSize: 11, fontWeight: 700, color: theme.primaryDark, letterSpacing: 0.4 }}>BEST MARKET</span>
          </div>
          <div className="display" style={{ fontSize: 16, fontWeight: 700, color: ink }}>
            {bestMarket?.market || 'Kanpur'}
          </div>
          <div style={{ fontSize: 10.5, color: sub, marginTop: 1 }}>beats Delhi's higher price after transport & spoilage</div>
        </div>
        <ChevronRight size={18} color={theme.primaryDark} />
      </button>

      {/* Quick actions */}
      <div style={{ fontSize: 11, fontWeight: 700, color: sub, letterSpacing: 0.6, marginBottom: 8 }}>QUICK ACTIONS</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { label: 'Find best market', icon: Store, delay: 340, path: '/farmer/markets' },
          { label: 'View weather risk', icon: Sun, delay: 390, path: '/farmer' },
          { label: 'View crop / batch', icon: QrCode, delay: 440, path: '/farmer/harvest' },
        ].map(({ label, icon: Icon, delay }, index) => (
          <Link
            key={index}
            href={label === 'Find best market' ? '/farmer/markets' : '/farmer/harvest'}
            className="fade-item"
            style={{
              animationDelay: `${delay}ms`,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              textAlign: 'left',
              background: card,
              border: `1px solid ${line}`,
              borderRadius: 14,
              padding: '12px 14px',
              width: '100%',
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: `${theme.primary}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon size={15} color={theme.primaryDark} />
            </div>
            <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: ink }}>{label}</span>
            <ArrowRight size={14} color={sub} />
          </Link>
        ))}
      </div>
    </div>
  );
}