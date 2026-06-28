import React, { useMemo, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { AlertTriangle, CheckCircle, Target, Wallet, ChevronDown, Bot } from 'lucide-react';
import { usePortfolio, type AssetCategory } from '../context/PortfolioContext';
import GlowingSlider from '../components/GlowingSlider';

const CATEGORY_META: Record<AssetCategory, { label: string; color: string }> = {
  metals:       { label: 'Metals & Commodities', color: '#f59e0b' },
  stocks:       { label: 'Equities / Stocks',    color: '#6366f1' },
  mutual_funds: { label: 'Mutual Funds',          color: '#34d399' },
  crypto:       { label: 'Cryptocurrency',        color: '#f43f5e' },
};

const ASSET_COLORS: Record<string, string> = {
  GOLD: '#f59e0b', SILVER: '#94a3b8',
  RELIANCE: '#6366f1', TCS: '#818cf8', INFY: '#a5b4fc', HDFCBANK: '#c4b5fd', ICICIBANK: '#6366f1',
  SBI_BLUE: '#34d399', HDFC_INDEX: '#10b981', ICICI_BLUE: '#059669', NIPPON_GROWTH: '#34d399',
  BTC: '#f43f5e', ETH: '#fb7185', SOL: '#e879f9', XRP: '#fbbf24', ADA: '#f59e0b',
};

const formatPrice = (price: number) => {
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)}L`;
  if (price >= 1000) return `₹${price.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  return `₹${price.toFixed(2)}`;
};

const PortfolioDrift: React.FC = () => {
  const { 
    assets, cashBalance, totalPortfolioValue, driftIndex,
    investMode, setInvestMode, pendingTrade, approvePendingTrade, rejectPendingTrade
  } = usePortfolio();
  
  const [expandedCat, setExpandedCat] = useState<AssetCategory | null>(null);

  const investedValue = useMemo(() => assets.reduce((sum, a) => sum + a.qty * a.spotPrice, 0), [assets]);

  const assetData = useMemo(() =>
    assets.map(asset => {
      const value = asset.qty * asset.spotPrice;
      const currentWeight = investedValue > 0 ? (value / investedValue) * 100 : 0;
      return { ...asset, value, currentWeight, drift: currentWeight - asset.targetWeight };
    }),
    [assets, investedValue]
  );

  const categoryGroups = useMemo(() =>
    (Object.keys(CATEGORY_META) as AssetCategory[]).map(cat => {
      const catAssets = assetData.filter(a => a.category === cat);
      const catValue = catAssets.reduce((s, a) => s + a.value, 0);
      const catWeight = investedValue > 0 ? (catValue / investedValue) * 100 : 0;
      const catTarget = catAssets.reduce((s, a) => s + a.targetWeight, 0);
      const catDrift = catWeight - catTarget;
      return { cat, ...CATEGORY_META[cat], assets: catAssets, catValue, catWeight, catTarget, catDrift };
    }),
    [assetData, investedValue]
  );

  const driftStatus = driftIndex < 1 ? 'ALIGNED' : driftIndex < 3 ? 'MINOR_DRIFT' : 'ACTION_REQUIRED';
  const driftColor = driftStatus === 'ALIGNED' ? '#34d399' : driftStatus === 'MINOR_DRIFT' ? '#f59e0b' : '#ef4444';

  // Radar Chart: Target vs Current Weights by Category
  const radarOptions: ApexOptions = {
    chart: { type: 'radar', toolbar: { show: false }, background: 'transparent', dropShadow: { enabled: true, blur: 8, left: 1, top: 1, color: '#000', opacity: 0.5 }, animations: { dynamicAnimation: { speed: 800 } } },
    colors: ['#00b386', '#f59e0b'],
    stroke: { width: 3, colors: ['#00b386', '#f59e0b'], dashArray: [0, 5] },
    fill: { opacity: 0.25, colors: ['#00b386', '#f59e0b'] },
    markers: { size: 5, colors: ['#09090b'], strokeColors: ['#00b386', '#f59e0b'], strokeWidth: 3, hover: { size: 8 } },
    xaxis: { categories: categoryGroups.map(g => g.label.split(' ')[0]), labels: { style: { colors: categoryGroups.map(() => '#a1a1aa'), fontSize: '12px', fontFamily: 'Inter', fontWeight: 600 } } },
    yaxis: { show: false },
    plotOptions: { radar: { polygons: { strokeColors: '#27272a', strokeWidth: 1, connectorColors: '#27272a', fill: { colors: ['transparent', 'transparent'] } } } },
    legend: { show: true, position: 'bottom', labels: { colors: '#fff' }, markers: { shape: 'circle' } },
    tooltip: { theme: 'dark', y: { formatter: (v: number) => `${v.toFixed(1)}%` } },
  };

  const radarSeries = [
    { name: 'Target Weight', data: categoryGroups.map(g => parseFloat(g.catTarget.toFixed(1))) },
    { name: 'Current Weight', data: categoryGroups.map(g => parseFloat(g.catWeight.toFixed(1))) }
  ];

  return (
    <div className="p-4 md:p-6 space-y-5 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-white">Portfolio Allocation &amp; Drift Engine</h1>
          <p className="text-xs text-zinc-500 mt-0.5">16 assets · 4 categories · Live compliance monitoring</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border self-start sm:self-auto"
          style={{ color: driftColor, borderColor: `${driftColor}40`, background: `${driftColor}10` }}>
          {driftStatus === 'ALIGNED' ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
          {driftStatus.replace('_', ' ')}
        </div>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="col-span-2 rounded-xl bg-gradient-to-br from-[#1a1705] to-[#141413] border border-amber-500/20 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="w-4 h-4 text-amber-400" />
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Total Portfolio Value</span>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-white" style={{ fontVariantNumeric: 'tabular-nums' }}>
            ₹{totalPortfolioValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-zinc-500">
            <span>Invested: <span className="text-zinc-300">₹{investedValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span></span>
            <span>Cash: <span className="text-emerald-400">₹{cashBalance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span></span>
          </div>
        </div>

        <div className="rounded-xl bg-[#141413] border border-[#27272A] p-4">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-zinc-400" />
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Drift Index</span>
          </div>
          <div className="text-2xl md:text-3xl font-bold" style={{ color: driftColor }}>{driftIndex.toFixed(2)}%</div>
          <div className="text-xs text-zinc-500 mt-1">{driftStatus === 'ALIGNED' ? 'Well balanced' : 'Rebalancing suggested'}</div>
        </div>

        <div className="rounded-xl bg-[#141413] border border-[#27272A] p-4">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-1">Categories</div>
          <div className="text-2xl md:text-3xl font-bold text-white">4</div>
          <div className="mt-1 space-y-0.5">
            {categoryGroups.map(g => (
              <div key={g.cat} className="flex items-center justify-between text-[10px]">
                <span style={{ color: g.color }}>{g.label.split(' ')[0]}</span>
                <span className={g.catDrift >= 0 ? 'text-red-400' : 'text-amber-400'}>{g.catDrift >= 0 ? '+' : ''}{g.catDrift.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Autopilot Control Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Autopilot Mode Selector */}
        <div className="lg:col-span-1 rounded-2xl bg-[#0D0D0F] border border-[#27272A] p-5 flex flex-col justify-between min-h-[160px] relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-amber-400" />
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">AI Autopilot Console</h2>
            </div>
            <div className="flex bg-[#141413] border border-[#27272A] rounded-lg overflow-hidden">
              <button
                onClick={() => setInvestMode('auto')}
                className={`px-3 py-1 text-[10px] font-bold transition-all ${investMode === 'auto' ? 'bg-emerald-500 text-black' : 'text-zinc-500 hover:text-white'}`}
              >
                Auto
              </button>
              <button
                onClick={() => setInvestMode('suggested')}
                className={`px-3 py-1 text-[10px] font-bold transition-all border-l border-r border-[#27272A] ${investMode === 'suggested' ? 'bg-amber-500 text-black' : 'text-zinc-500 hover:text-white'}`}
              >
                Suggested
              </button>
              <button
                onClick={() => setInvestMode('manual')}
                className={`px-3 py-1 text-[10px] font-bold transition-all ${investMode === 'manual' ? 'bg-zinc-500 text-white' : 'text-zinc-500 hover:text-white'}`}
              >
                Manual
              </button>
            </div>
          </div>
          <p className="text-[11px] text-zinc-500 leading-relaxed mb-4">
            {investMode === 'auto'
              ? 'Autopilot is currently ACTIVE. The AI agent scans portfolio drift and automatically deploys cash to execute micro-rebalances.'
              : investMode === 'suggested'
              ? 'AI-Suggested is ACTIVE. The AI agent scans portfolio drift and suggests trades for you to manually execute.'
              : 'Manual Mode is ACTIVE. AI scans are disabled. You have full manual control.'
            }
          </p>
          <div className="flex items-center gap-2 mt-auto">
            <span className={`w-1.5 h-1.5 rounded-full ${investMode === 'auto' ? 'bg-emerald-400 animate-pulse' : investMode === 'suggested' ? 'bg-amber-400 animate-pulse' : 'bg-zinc-500'}`} />
            <span className="text-[9px] uppercase font-bold tracking-widest text-zinc-400">
              {investMode === 'auto' ? 'System Running: Auto' : investMode === 'suggested' ? 'System Awaiting Input' : 'System: Manual Only'}
            </span>
          </div>
        </div>

        {/* Manual Suggested Trade Card */}
        <div className="lg:col-span-2 rounded-2xl bg-[#0D0D0F] border border-[#27272A] p-5 relative overflow-hidden flex flex-col justify-between">
          {investMode === 'suggested' && pendingTrade ? (
            <>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400 animate-pulse" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Suggested Rebalance Order</span>
                </div>
                <div className="text-[9px] bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-md px-2 py-0.5 font-bold uppercase tracking-wider">
                  Deviation Alert
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-2">
                <div className="space-y-1 bg-[#141413] border border-[#27272A]/50 rounded-xl p-3">
                  <div className="text-[9px] text-zinc-500 uppercase font-semibold">Action &amp; Target</div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span className="text-emerald-400 font-extrabold">{pendingTrade.action}</span>
                    <span>{pendingTrade.name} ({pendingTrade.ticker})</span>
                  </div>
                  <div className="text-[11px] text-zinc-400 font-mono mt-1">
                    Value: ₹{pendingTrade.amount.toLocaleString('en-IN')} (approx. {pendingTrade.qty.toFixed(pendingTrade.ticker === 'BTC' ? 6 : 4)} units)
                  </div>
                </div>
                <div className="space-y-1 bg-[#141413] border border-[#27272A]/50 rounded-xl p-3">
                  <div className="text-[9px] text-zinc-500 uppercase font-semibold">Drift Impact</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-mono font-bold text-red-400">{pendingTrade.driftBefore.toFixed(1)}% drift</span>
                    <span className="text-zinc-500">→</span>
                    <span className="text-[10px] font-mono font-bold text-emerald-400">{pendingTrade.driftAfter.toFixed(1)}% drift</span>
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-1 leading-snug">
                    Executes order at live price: ₹{pendingTrade.spotPrice.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={approvePendingTrade}
                  className="flex-1 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black text-xs font-bold transition-all hover:scale-[1.01] hover:from-emerald-400 hover:to-teal-400 cursor-pointer shadow-lg shadow-emerald-500/10"
                >
                  Approve &amp; Rebalance
                </button>
                <button
                  onClick={rejectPendingTrade}
                  className="px-5 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-bold hover:bg-zinc-700 hover:text-white transition-all cursor-pointer"
                >
                  Reject Order
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-center h-full py-4 space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">System Aligned &amp; Healthy</h3>
                <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed max-w-sm">
                  {investMode === 'auto' 
                    ? 'Autopilot is scanning. No adjustments are needed because drifts are currently within normal bounds (±0.4%).'
                    : investMode === 'suggested'
                    ? 'No pending AI suggestions at this time. All target weights are aligned.'
                    : 'Manual mode active. No AI monitoring.'
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radar Drift Visualizer */}
        <div className="lg:col-span-2 rounded-3xl bg-[#0D0D0F] border border-[#27272A] p-6 shadow-2xl relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-500">
          <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-400" /> Sector Alignment Radar
              </h2>
              <p className="text-xs text-zinc-500 mt-1">Multi-dimensional view of portfolio drift vs model targets</p>
            </div>
          </div>
          <div className="flex justify-center -ml-4 mt-6">
            <ReactApexChart type="radar" height={380} width="100%" options={radarOptions} series={radarSeries} />
          </div>
        </div>

        {/* Drift Status Heatcard */}
        <div className="rounded-3xl bg-gradient-to-b from-[#141413] to-[#0D0D0F] border border-[#27272A] p-6 shadow-xl flex flex-col justify-between group hover:border-amber-500/30 transition-all duration-500">
          <div>
            <h2 className="text-lg font-bold text-white mb-6">Drift Magnitude</h2>
            <div className="space-y-4">
              {categoryGroups.map(g => (
                <div key={g.cat} className="p-3 rounded-xl bg-white/[0.02] border border-transparent hover:border-white/10 transition-colors">
                  <div className="flex justify-between items-center mb-2 text-xs font-semibold">
                    <span className="text-zinc-300">{g.label.split('/')[0].trim()}</span>
                    <span className={`font-mono ${Math.abs(g.catDrift) > 1 ? (g.catDrift > 0 ? 'text-red-400' : 'text-amber-400') : 'text-emerald-400'}`}>
                      {g.catDrift > 0 ? '+' : ''}{g.catDrift.toFixed(2)}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-[#1A1A1A] rounded-full overflow-hidden flex">
                    <div className="h-full bg-zinc-700" style={{ width: `${Math.min(g.catTarget, g.catWeight)}%` }} />
                    <div className={`h-full ${g.catDrift > 0 ? 'bg-red-500' : 'bg-amber-500'} glow-${g.catDrift > 0 ? 'red' : 'amber'}`} style={{ width: `${Math.abs(g.catDrift)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Matrix — Grouped by Category */}
      <div className="rounded-xl bg-[#141413] border border-[#27272A] overflow-hidden">
        <div className="px-4 md:px-5 py-4 border-b border-[#27272A] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-semibold text-white">Compliance Matrix</h2>
          </div>
          <div className="text-xs text-zinc-500">{assetData.filter(a => Math.abs(a.drift) > 0.5).length} assets need attention</div>
        </div>

        {/* Category Groups */}
        {categoryGroups.map(group => (
          <div key={group.cat} className="border-b border-[#27272A] last:border-b-0">
            {/* Category Header */}
            <button
              className="w-full flex items-center justify-between px-4 md:px-5 py-4 bg-[#0D0D0F] hover:bg-white/[0.04] transition-all duration-300 relative overflow-hidden group"
              onClick={() => setExpandedCat(expandedCat === group.cat ? null : group.cat)}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full" style={{ background: group.color }} />
                <span className="text-xs font-bold text-white">{group.label}</span>
                <span className="text-[10px] text-zinc-500">{group.assets.length} assets</span>
                <span className="text-[10px] font-mono" style={{ color: group.color }}>
                  {group.catDrift >= 0 ? '+' : ''}{group.catDrift.toFixed(2)}% drift
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-400 hidden sm:block">
                  ₹{group.catValue > 100000 ? `${(group.catValue / 100000).toFixed(2)}L` : group.catValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
                <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${expandedCat === group.cat ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {/* Assets in Category */}
            {(expandedCat === group.cat || expandedCat === null) && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b border-[#27272A]/50">
                      {['Ticker', 'Qty', 'Live Price', 'Value', 'Target %', 'Current %', 'Drift Status'].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold text-zinc-600 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {group.assets.map(asset => {
                      const color = ASSET_COLORS[asset.ticker] || '#f59e0b';
                      return (
                        <tr key={asset.ticker} className="border-b border-[#27272A]/30 hover:bg-white/[0.02] transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
                              <div>
                                <div className="text-xs font-bold text-white">{asset.ticker}</div>
                                <div className="text-[9px] text-zinc-600 hidden sm:block">{asset.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs font-mono text-zinc-400">
                            {asset.qty < 1 ? asset.qty.toFixed(6) : asset.qty.toLocaleString('en-IN')}
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-xs font-mono font-semibold text-white">{formatPrice(asset.spotPrice)}</div>
                            <div className={`text-[9px] font-semibold ${asset.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {asset.change24h >= 0 ? '▲' : '▼'}{Math.abs(asset.change24h).toFixed(2)}%
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs font-mono text-zinc-300">
                            {asset.value > 100000 ? `₹${(asset.value / 100000).toFixed(2)}L` : `₹${asset.value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                          </td>
                          <td className="px-4 py-3 text-xs font-mono font-semibold text-zinc-400">{asset.targetWeight.toFixed(1)}%</td>
                          <td className="px-4 py-3 text-xs font-mono font-semibold" style={{ color }}>{asset.currentWeight.toFixed(1)}%</td>
                          <td className="px-4 py-3 min-w-[220px]">
                            <GlowingSlider drift={parseFloat(asset.drift.toFixed(2))} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500">
        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-amber-500 glow-amber" /><span>Under-Allocated</span></div>
        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500 glow-green" /><span>Aligned (±0.5%)</span></div>
        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-red-500 glow-red" /><span>Over-Allocated</span></div>
      </div>
    </div>
  );
};

export default PortfolioDrift;
