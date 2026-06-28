import React, { useMemo, useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Layers,
  Zap,
  Filter,
  Clock,
  Shield,
  Sparkles,
  LineChart,
  Bitcoin,
  Landmark,
  Gem,
  Target,
  Bot,
  Terminal,
  Wallet,
  QrCode,
  ArrowUpRight,
  BarChart3
} from 'lucide-react';
import { usePortfolio, type AssetCategory } from '../context/PortfolioContext';
import QuickInvestDrawer from '../components/QuickInvestDrawer';
import PaymentQRModal from '../components/PaymentQRModal';

const CATEGORY_META: Record<AssetCategory, { label: string; color: string; emoji: string }> = {
  metals:       { label: 'Metals',       color: '#f59e0b', emoji: '🥇' },
  stocks:       { label: 'Stocks',       color: '#6366f1', emoji: '📈' },
  mutual_funds: { label: 'Mutual Funds', color: '#34d399', emoji: '📊' },
  crypto:       { label: 'Crypto',       color: '#f43f5e', emoji: '₿' },
};

const ASSET_COLORS: Record<string, string> = {
  GOLD: '#f59e0b', SILVER: '#94a3b8',
  RELIANCE: '#6366f1', TCS: '#818cf8', INFY: '#a5b4fc', HDFCBANK: '#c4b5fd', ICICIBANK: '#6366f1',
  SBI_BLUE: '#34d399', HDFC_INDEX: '#10b981', ICICI_BLUE: '#059669', NIPPON_GROWTH: '#34d399',
  BTC: '#f43f5e', ETH: '#fb7185', SOL: '#e879f9', XRP: '#fbbf24', ADA: '#f59e0b',
};

// Simulated cost basis multiplier
const COST_MULT: Record<string, number> = {
  GOLD: 0.87, SILVER: 0.82,
  RELIANCE: 0.78, TCS: 0.72, INFY: 0.85, HDFCBANK: 0.68, ICICIBANK: 0.75,
  SBI_BLUE: 0.88, HDFC_INDEX: 0.84, ICICI_BLUE: 0.79, NIPPON_GROWTH: 0.82,
  BTC: 0.62, ETH: 0.71, SOL: 0.58, XRP: 0.65, ADA: 0.70,
};

type FilterType = 'all' | AssetCategory;
type Page = 'market' | 'portfolio' | 'stocks' | 'crypto' | 'mutual_funds' | 'metals' | 'ai' | 'agent' | 'drift';

interface MarketWatchProps {
  onNavigate: (page: Page) => void;
}

const formatPrice = (price: number) => {
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)}L`;
  if (price >= 1000) return `₹${price.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  return `₹${price.toFixed(2)}`;
};

const MarketWatch: React.FC<MarketWatchProps> = ({ onNavigate }) => {
  const { assets, cashBalance, totalPortfolioValue, driftIndex, investMode } = usePortfolio();
  const [filter, setFilter] = useState<FilterType>('all');
  const [currentTime, setCurrentTime] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);

  // Update clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Filtered assets for search/volatility trends
  const filtered = useMemo(() =>
    filter === 'all' ? assets : assets.filter(a => a.category === filter),
    [assets, filter]
  );

  // Holdings assets (owned assets where qty > 0)
  const holdings = useMemo(() =>
    assets.filter(a => a.qty > 0).map(a => {
      const value = a.qty * a.spotPrice;
      const costBasis = a.qty * a.spotPrice * (COST_MULT[a.ticker] ?? 0.8);
      const pnl = value - costBasis;
      const pnlPct = (pnl / costBasis) * 100;
      return { ...a, value, pnl, pnlPct };
    }),
    [assets]
  );

  // Aggregate stats
  const investedValue = useMemo(() => holdings.reduce((s, a) => s + a.value, 0), [holdings]);
  const totalCostBasis = useMemo(() => holdings.reduce((s, a) => s + (a.qty * a.spotPrice * (COST_MULT[a.ticker] ?? 0.8)), 0), [holdings]);
  const totalUnrealizedPnL = investedValue - totalCostBasis;
  const totalPnLPct = totalCostBasis > 0 ? (totalUnrealizedPnL / totalCostBasis) * 100 : 0;
  const total24hChange = useMemo(() => holdings.reduce((s, a) => s + (a.value * a.change24h / 100), 0), [holdings]);
  const total24hPct = investedValue > 0 ? (total24hChange / investedValue) * 100 : 0;

  // Asset class valuations
  const categoryVals = useMemo(() => {
    const vals = { stocks: 0, crypto: 0, mutual_funds: 0, metals: 0 };
    holdings.forEach(h => {
      vals[h.category] += h.value;
    });
    return vals;
  }, [holdings]);

  // App list definition
  const apps = [
    {
      id: 'portfolio' as Page,
      label: 'All Portfolio',
      icon: BarChart3,
      desc: 'Overall returns ledger',
      bg: 'from-violet-600/20 to-purple-600/5 hover:border-violet-500/40 hover:shadow-violet-500/5',
      badge: `₹${(totalPortfolioValue / 100000).toFixed(1)}L`,
      iconColor: 'text-violet-400',
      badgeColor: 'bg-violet-500/10 text-violet-300'
    },
    {
      id: 'stocks' as Page,
      label: 'Stocks (NSE)',
      icon: LineChart,
      desc: 'Indian equity listings',
      bg: 'from-indigo-600/20 to-blue-600/5 hover:border-indigo-500/40 hover:shadow-indigo-500/5',
      badge: categoryVals.stocks > 0 ? `₹${(categoryVals.stocks / 100000).toFixed(1)}L` : '0.00',
      iconColor: 'text-indigo-400',
      badgeColor: 'bg-indigo-500/10 text-indigo-300'
    },
    {
      id: 'crypto' as Page,
      label: 'Cryptos',
      icon: Bitcoin,
      desc: 'Digital assets & tokens',
      bg: 'from-rose-600/20 to-orange-600/5 hover:border-rose-500/40 hover:shadow-rose-500/5',
      badge: categoryVals.crypto > 0 ? `₹${(categoryVals.crypto / 100000).toFixed(1)}L` : '0.00',
      iconColor: 'text-rose-400',
      badgeColor: 'bg-rose-500/10 text-rose-300'
    },
    {
      id: 'mutual_funds' as Page,
      label: 'Mutual Funds',
      icon: Landmark,
      desc: 'SIPs & passive funds',
      bg: 'from-emerald-600/20 to-teal-600/5 hover:border-emerald-500/40 hover:shadow-emerald-500/5',
      badge: categoryVals.mutual_funds > 0 ? `₹${(categoryVals.mutual_funds / 100000).toFixed(1)}L` : '0.00',
      iconColor: 'text-emerald-400',
      badgeColor: 'bg-emerald-500/10 text-emerald-300'
    },
    {
      id: 'metals' as Page,
      label: 'Gold & Metals',
      icon: Gem,
      desc: 'Commodity hedges',
      bg: 'from-amber-600/20 to-orange-600/5 hover:border-amber-500/40 hover:shadow-amber-500/5',
      badge: categoryVals.metals > 0 ? `₹${(categoryVals.metals / 100000).toFixed(1)}L` : '0.00',
      iconColor: 'text-amber-400',
      badgeColor: 'bg-amber-500/10 text-amber-300'
    },
    {
      id: 'drift' as Page,
      label: 'Drift Index',
      icon: Target,
      desc: 'Compliance monitor',
      bg: 'from-cyan-600/20 to-blue-600/5 hover:border-cyan-500/40 hover:shadow-cyan-500/5',
      badge: `${driftIndex.toFixed(1)}% drift`,
      iconColor: 'text-cyan-400',
      badgeColor: driftIndex > 3 ? 'bg-red-500/10 text-red-300' : 'bg-emerald-500/10 text-emerald-300'
    },
    {
      id: 'ai' as Page,
      label: 'AI Co-pilot',
      icon: Bot,
      desc: 'Portfolio advisor chat',
      bg: 'from-fuchsia-600/20 to-purple-600/5 hover:border-fuchsia-500/40 hover:shadow-fuchsia-500/5',
      badge: 'Active',
      iconColor: 'text-fuchsia-400',
      badgeColor: 'bg-fuchsia-500/10 text-fuchsia-300 animate-pulse'
    },
    {
      id: 'agent' as Page,
      label: 'AI Autopilot',
      icon: Terminal,
      desc: 'Drift rebalance loops',
      bg: 'from-zinc-600/20 to-slate-600/5 hover:border-zinc-500/40 hover:shadow-zinc-500/5',
      badge: investMode === 'auto' ? 'Active' : investMode === 'suggested' ? 'Suggested' : 'Manual',
      iconColor: 'text-zinc-400',
      badgeColor: investMode === 'auto' ? 'bg-emerald-500/10 text-emerald-300' : investMode === 'suggested' ? 'bg-amber-500/10 text-amber-300' : 'bg-zinc-500/10 text-zinc-400'
    }
  ];


  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in-up">
      {/* Header with clock */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0D0D0F] border border-[#27272A] p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Shield className="w-5 h-5 text-black" />
          </div>
          <div>
            <h1 className="text-base md:text-lg font-black text-white flex items-center gap-2">
              WealthOS Launchpad <Sparkles className="w-4 h-4 text-amber-400" />
            </h1>
            <p className="text-[11px] text-zinc-500">Autonomous Wealth Rebalancing System</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-zinc-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl font-mono">
            <Clock className="w-3.5 h-3.5 text-zinc-500" />
            {currentTime || '00:00:00'}
          </div>
          <div className="flex items-center gap-2 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live Sync
          </div>
        </div>
      </div>

      {/* Net Worth Hero Dashboard Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Net worth card */}
        <div className="lg:col-span-2 rounded-2xl bg-gradient-to-br from-[#1a1508] via-[#0D0D0F] to-[#0D0D0F] border border-amber-500/20 p-5 flex flex-col justify-between relative overflow-hidden group shadow-2xl">
          <div className="absolute right-0 top-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-all" />
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-amber-400" /> Total Net Worth
              </span>
              <span className="text-[10px] text-zinc-500">Cash: <span className="text-emerald-400 font-bold font-mono">₹{cashBalance.toLocaleString('en-IN')}</span></span>
            </div>
            <div className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-none glow-text font-mono">
              ₹{totalPortfolioValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 mt-6 pt-4 border-t border-[#27272A]/40 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-500">Today:</span>
              <span className={`font-bold flex items-center font-mono ${total24hPct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {total24hPct >= 0 ? '+' : ''}{total24hPct.toFixed(2)}%
                {total24hPct >= 0 ? <TrendingUp className="w-3 h-3 ml-0.5" /> : <TrendingDown className="w-3 h-3 ml-0.5" />}
              </span>
            </div>
            <div className="w-px h-3.5 bg-zinc-800" />
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-500">All-time P&L:</span>
              <span className={`font-bold font-mono ${totalPnLPct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {totalUnrealizedPnL >= 0 ? '+' : ''}₹{Math.round(totalUnrealizedPnL).toLocaleString('en-IN')} ({totalPnLPct.toFixed(1)}%)
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="rounded-2xl bg-[#0D0D0F] border border-[#27272A] p-5 flex flex-col justify-between">
          <div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold mb-2">Fund Allocation Actions</div>
            <p className="text-xs text-zinc-500 leading-relaxed">Instantly add test cash balance via QR scanner code or invest cash directly into rebalance targets.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <button
              onClick={() => setQrOpen(true)}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#27272A] bg-[#141413] text-zinc-400 text-xs font-semibold hover:text-amber-400 hover:border-amber-500/30 transition-all hover:scale-[1.02]"
            >
              <QrCode className="w-4 h-4 text-amber-400" /> QR Transfer
            </button>
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black text-xs font-bold hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/20 hover:scale-[1.02]"
            >
              <Zap className="w-4 h-4" /> Quick Invest
            </button>
          </div>
        </div>
      </div>

      {/* Interactive App Launcher Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-amber-400" /> My Apps &amp; Services
          </span>
          <span className="text-[10px] text-zinc-500 font-mono">8 Applications Available</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {apps.map(app => {
            const Icon = app.icon;
            return (
              <button
                key={app.id}
                onClick={() => onNavigate(app.id)}
                className={`rounded-2xl border border-[#27272A] bg-[#0D0D0F] p-4 text-left transition-all duration-300 hover:scale-[1.04] flex flex-col justify-between min-h-[140px] group bg-gradient-to-b ${app.bg}`}
              >
                <div className="flex items-start justify-between w-full">
                  <div className={`w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-300 group-hover:scale-110`}>
                    <Icon className={`w-4 h-4 ${app.iconColor}`} />
                  </div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${app.badgeColor}`}>
                    {app.badge}
                  </span>
                </div>
                <div className="mt-4">
                  <div className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors flex items-center gap-1">
                    {app.label} <ArrowUpRight className="w-3 h-3 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="text-[9px] text-zinc-500 mt-0.5 leading-snug line-clamp-2">{app.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* My Assets Holdings Widget */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Wallet className="w-4 h-4 text-amber-400" /> My Active Assets
          </span>
          <span className="text-[10px] text-zinc-500 font-mono">{holdings.length} Positions</span>
        </div>

        {holdings.length === 0 ? (
          <div className="rounded-2xl bg-[#0D0D0F] border border-[#27272A] p-8 text-center">
            <div className="text-sm font-semibold text-zinc-400 mb-1">No Assets Invested Yet</div>
            <div className="text-xs text-zinc-500 mb-4">You have ₹{cashBalance.toLocaleString('en-IN')} cash idle. Quick invest to get started!</div>
            <button
              onClick={() => setDrawerOpen(true)}
              className="px-4 py-2 bg-amber-500 text-black text-xs font-bold rounded-lg hover:bg-amber-400 transition-all"
            >
              Start Investing
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {holdings.map(asset => {
              const color = ASSET_COLORS[asset.ticker] || '#f59e0b';
              const meta = CATEGORY_META[asset.category];
              return (
                <div
                  key={asset.ticker}
                  onClick={() => onNavigate(asset.category as Page)}
                  className="rounded-2xl bg-[#0D0D0F] border border-[#27272A] p-4 cursor-pointer hover:border-zinc-500 transition-all duration-300 group hover:shadow-lg hover:shadow-white/[0.01]"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black group-hover:scale-105 transition-transform"
                        style={{ background: `${color}15`, color }}
                      >
                        {asset.ticker.slice(0, 2)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors flex items-center gap-1">
                          {asset.ticker}
                        </div>
                        <div className="text-[8px] text-zinc-500 uppercase tracking-widest font-semibold">{meta.label}</div>
                      </div>
                    </div>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${asset.change24h >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                      {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(1)}%
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[10px] text-zinc-500 font-medium">
                      {asset.qty < 0.01 ? asset.qty.toFixed(6) : asset.qty.toLocaleString('en-IN')} {asset.unit}
                    </div>
                    <div className="text-lg font-bold text-white font-mono leading-none tracking-tight">
                      {formatPrice(asset.value)}
                    </div>
                  </div>

                  {/* Visual allocation bar */}
                  <div className="mt-4 pt-3 border-t border-[#27272A]/40 flex items-center justify-between text-[9px] text-zinc-500 font-mono">
                    <span>Spot: {formatPrice(asset.spotPrice)}</span>
                    <span style={{ color }}>Weight: {((asset.value / totalPortfolioValue) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Market Watch Discover Ticker / Live Feed Section */}
      <div className="space-y-4 pt-4 border-t border-[#27272A]/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-amber-400" /> Market Discovery &amp; Volatility Feed
            </h2>
            <p className="text-[11px] text-zinc-500">Live price monitoring &amp; historical charts for 16 assets</p>
          </div>
          {/* Filter Chips */}
          <div className="flex flex-wrap gap-2 items-center self-start sm:self-auto">
            <Filter className="w-3.5 h-3.5 text-zinc-500" />
            {(['all', ...Object.keys(CATEGORY_META)] as FilterType[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border
                  ${filter === f
                    ? 'bg-amber-500 text-black border-amber-500'
                    : 'bg-[#141413] border-[#27272A] text-zinc-400 hover:text-white hover:border-zinc-600'}`}
              >
                {f === 'all' ? 'All Assets' : CATEGORY_META[f as AssetCategory].label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Charts and Volume Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Volatility lists */}
          <div className="lg:col-span-3 space-y-3">
            {filtered.map(asset => {
              const color = ASSET_COLORS[asset.ticker] || '#f59e0b';
              const meta = CATEGORY_META[asset.category];
              return (
                <div key={asset.ticker} className="rounded-xl bg-[#0D0D0F] border border-[#27272A] p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 justify-between">
                  <div className="flex items-center gap-3 min-w-[200px]">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">{asset.ticker}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full border bg-white/5 text-zinc-400" style={{ color: meta.color, borderColor: `${meta.color}25` }}>
                          {meta.label}
                        </span>
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">{asset.name}</div>
                    </div>
                  </div>

                  {/* Sparkline chart */}
                  <div className="flex-1 max-w-[150px] hidden sm:block relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent to-black/20 z-10 pointer-events-none" />
                    <ReactApexChart
                      key={`area-discover-${asset.ticker}`}
                      type="area" height={55}
                      options={{
                        chart: { type: 'area', sparkline: { enabled: true }, animations: { dynamicAnimation: { speed: 800 } }, background: 'transparent', dropShadow: { enabled: true, top: 2, left: 0, blur: 2, color: color, opacity: 0.2 } },
                        colors: [color],
                        stroke: { curve: 'smooth', width: 2.5 },
                        fill: { type: 'gradient', gradient: { shade: 'dark', type: 'vertical', opacityFrom: 0.5, opacityTo: 0.0, stops: [0, 100] } },
                        tooltip: { enabled: false }
                      }}
                      series={[{ name: asset.ticker, data: asset.priceHistory }]}
                    />
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 text-right">
                    <div className="text-left sm:text-right">
                      <div className="text-xs font-bold text-white font-mono">{formatPrice(asset.spotPrice)}</div>
                      <div className="text-[9px] text-zinc-500 mt-0.5">/{asset.unit}</div>
                    </div>
                    <div className={`text-xs font-bold font-mono ${asset.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Volume bars and summary */}
          <div className="lg:col-span-2 space-y-4">
            {/* Fear & Greed Gauge */}
            <div className="rounded-2xl bg-gradient-to-br from-[#141413] to-[#0D0D0F] border border-[#27272A] p-4 relative overflow-hidden shadow-xl group hover:border-emerald-500/30 transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />
              <div className="flex justify-between items-start mb-2">
                <div className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5 z-10 relative">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" /> Fear &amp; Greed Index
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 z-10 relative">
                  GREED
                </span>
              </div>
              <div className="-mb-6 mt-4 relative z-10 flex justify-center">
                <ReactApexChart
                  type="radialBar" height={200}
                  options={{
                    chart: { type: 'radialBar', offsetY: -10, sparkline: { enabled: true } },
                    plotOptions: {
                      radialBar: {
                        startAngle: -90, endAngle: 90, track: { background: '#27272a', strokeWidth: '100%', margin: 5, dropShadow: { enabled: true, top: 0, left: 0, blur: 3, opacity: 0.5 } },
                        dataLabels: { name: { show: false }, value: { offsetY: -2, fontSize: '28px', fontWeight: 900, color: '#fff', formatter: (val) => `${val}` } }
                      }
                    },
                    fill: { type: 'gradient', gradient: { shade: 'dark', type: 'horizontal', gradientToColors: ['#00b386'], stops: [0, 100] }, colors: ['#f59e0b'] },
                    stroke: { lineCap: 'round' }
                  }}
                  series={[72]}
                />
              </div>
            </div>

            <div className="rounded-2xl bg-[#0D0D0F] border border-[#27272A] p-4 shadow-xl">
              <div className="text-xs font-semibold text-zinc-300 mb-4 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-400" /> 24h Volume Heatmap (Cr)
              </div>
              <ReactApexChart
                key={`vol-bar-${filter}`}
                type="bar" height={180}
                options={{
                  chart: { type: 'bar', toolbar: { show: false }, background: 'transparent', animations: { dynamicAnimation: { speed: 800 } } },
                  colors: filtered.map(a => ASSET_COLORS[a.ticker] || '#f59e0b'),
                  plotOptions: { bar: { borderRadius: 4, distributed: true, columnWidth: '50%' } },
                  dataLabels: { enabled: false },
                  xaxis: {
                    categories: filtered.map(a => a.ticker),
                    labels: { style: { colors: '#71717a', fontSize: '10px', fontFamily: 'Inter', fontWeight: 600 }, rotate: -45 },
                    axisBorder: { show: false }, axisTicks: { show: false },
                  },
                  yaxis: { labels: { style: { colors: '#71717a', fontSize: '10px', fontFamily: 'Inter', fontWeight: 600 }, formatter: (v: number) => `₹${v}` } },
                  grid: { borderColor: '#27272a', strokeDashArray: 4 },
                  legend: { show: false },
                  tooltip: { theme: 'dark', y: { formatter: (v: number) => `₹${v} Cr` } },
                }}
                series={[{ name: 'Volume (Cr)', data: filtered.map(a => a.volume24h) }]}
              />
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              {[
                { label: 'Nifty 50', value: '24,580', change: '+1.2%', up: true },
                { label: 'BTC Dom.', value: '58.4%', change: '+0.3%', up: true },
                { label: 'MCX Gold', value: '₹7,180/g', change: '+0.8%', up: true },
                { label: 'VIX Vol.', value: '14.2', change: '-2.1%', up: false },
              ].map((stat, i) => (
                <div key={i} className="rounded-xl bg-[#141413] border border-[#27272A] p-3 flex flex-col justify-between hover:border-zinc-600 transition-colors">
                  <span className="text-[10px] text-zinc-500 font-semibold mb-1 uppercase tracking-wider">{stat.label}</span>
                  <div className="flex items-end justify-between">
                    <div className="text-sm font-bold text-white font-mono">{stat.value}</div>
                    <div className={`text-[9px] font-bold ${stat.up ? 'text-emerald-400' : 'text-rose-400'} flex items-center gap-0.5`}>
                      {stat.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {stat.change}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Render Slide-in drawers and modals */}
      <QuickInvestDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <PaymentQRModal open={qrOpen} onClose={() => setQrOpen(false)} />
    </div>
  );
};

export default MarketWatch;
