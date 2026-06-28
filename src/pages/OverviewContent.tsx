import React, { useMemo, useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { TrendingUp, TrendingDown, Wallet, PieChart, BarChart2, Target, Zap, Activity } from 'lucide-react';
import { usePortfolio, type AssetCategory } from '../context/PortfolioContext';

const ASSET_COLORS: Record<string, string> = {
  GOLD:'#f59e0b', SILVER:'#94a3b8',
  RELIANCE:'#6366f1', TCS:'#818cf8', INFY:'#a5b4fc', HDFCBANK:'#c4b5fd', ICICIBANK:'#6366f1',
  SBI_BLUE:'#34d399', HDFC_INDEX:'#10b981', ICICI_BLUE:'#059669', NIPPON_GROWTH:'#34d399',
  BTC:'#f43f5e', ETH:'#fb7185', SOL:'#e879f9', XRP:'#fbbf24', ADA:'#f59e0b',
};

const CAT_COLORS: Record<AssetCategory, string> = {
  metals: '#f59e0b', stocks: '#818cf8', mutual_funds: '#10b981', crypto: '#f43f5e',
};

const CAT_LABELS: Record<AssetCategory, string> = {
  metals: 'Metals', stocks: 'Stocks', mutual_funds: 'Mutual Funds', crypto: 'Crypto',
};

const fmt = (n: number) => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
const fmtV = (v: number) => v >= 100000 ? `₹${(v / 100000).toFixed(2)}L` : fmt(v);
const fmtP = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;

// Simulate data arrays for sparklines
const generateSparklineData = (trend: 'up' | 'down', points: number) => {
  let val = 100;
  return Array.from({ length: points }, () => {
    val = val + (Math.random() - (trend === 'up' ? 0.3 : 0.7)) * 5;
    return val;
  });
};

const generate30DayHistory = (finalValue: number): number[] => {
  const arr: number[] = [];
  let val = finalValue * 0.82;
  for (let i = 0; i < 30; i++) {
    val = val * (1 + (Math.random() - 0.35) * 0.015);
    arr.push(Math.round(val));
  }
  arr.push(Math.round(finalValue));
  return arr;
};

const PortfolioOverview: React.FC = () => {
  const { assets, totalPortfolioValue, driftIndex } = usePortfolio();

  const investedValue = assets.reduce((s, a) => s + a.qty * a.spotPrice, 0);

  const assetData = useMemo(() => assets.map(a => {
    const value = a.qty * a.spotPrice;
    const costBasis = a.qty * (a.avgBuyPrice || a.spotPrice);
    const unrealizedPnL = value - costBasis;
    const pnlPct = costBasis > 0 ? ((value - costBasis) / costBasis) * 100 : 0;
    const weight = investedValue > 0 ? (value / investedValue) * 100 : 0;
    const drift = weight - a.targetWeight;
    return { ...a, value, costBasis, unrealizedPnL, pnlPct, weight, drift };
  }), [assets, investedValue]);

  const totalCostBasis = assetData.reduce((s, a) => s + a.costBasis, 0);
  const totalProfit = assetData.reduce((s, a) => a.unrealizedPnL > 0 ? s + a.unrealizedPnL : s, 0);
  const totalLoss = assetData.reduce((s, a) => a.unrealizedPnL < 0 ? s + Math.abs(a.unrealizedPnL) : s, 0);
  const profitPct = totalCostBasis > 0 ? (totalProfit / totalCostBasis) * 100 : 0;
  const lossPct = totalCostBasis > 0 ? (totalLoss / totalCostBasis) * 100 : 0;

  const categoryGroups = useMemo(() => {
    const cats: AssetCategory[] = ['metals', 'stocks', 'mutual_funds', 'crypto'];
    return cats.map(cat => {
      const catAssets = assetData.filter(a => a.category === cat);
      const catValue = catAssets.reduce((s, a) => s + a.value, 0);
      const catCost = catAssets.reduce((s, a) => s + a.costBasis, 0);
      const catPnL = catValue - catCost;
      const catPnLPct = catCost > 0 ? ((catValue - catCost) / catCost) * 100 : 0;
      const catWeight = investedValue > 0 ? (catValue / investedValue) * 100 : 0;
      const catTarget = catAssets.reduce((s, a) => s + a.targetWeight, 0);
      return { cat, label: CAT_LABELS[cat], color: CAT_COLORS[cat], assets: catAssets, catValue, catPnL, catPnLPct, catWeight, catTarget };
    });
  }, [assetData, investedValue]);

  const portfolioHistory = useMemo(() => generate30DayHistory(totalPortfolioValue), [totalPortfolioValue]);
  const sparkUp = useMemo(() => generateSparklineData('up', 15), []);
  const sparkDown = useMemo(() => generateSparklineData('down', 15), []);

  const days30 = Array.from({ length: 31 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (30 - i));
    return i === 30 ? 'Today' : `${d.getDate()} ${d.toLocaleString('en', { month: 'short' })}`;
  });

  const sparklineOpts = (color: string): ApexOptions => ({
    chart: { type: 'area', sparkline: { enabled: true }, animations: { enabled: true, speed: 800 } },
    stroke: { curve: 'smooth', width: 2 },
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0, stops: [0, 100] } },
    colors: [color],
    tooltip: { fixed: { enabled: false }, x: { show: false }, y: { title: { formatter: () => '' } }, marker: { show: false } }
  });

  const mainGrowthOpts: ApexOptions = {
    chart: { type: 'area', toolbar: { show: false }, background: 'transparent', dropShadow: { enabled: true, top: 15, left: 0, blur: 20, color: '#f59e0b', opacity: 0.4 }, animations: { dynamicAnimation: { speed: 800 } } },
    colors: ['#f59e0b'],
    fill: { type: 'gradient', gradient: { shade: 'dark', type: 'vertical', shadeIntensity: 1, gradientToColors: ['#f43f5e', '#ec4899'], opacityFrom: 0.7, opacityTo: 0.0, stops: [0, 50, 100] } },
    stroke: { curve: 'smooth', width: 4, lineCap: 'round' },
    markers: { size: 0, colors: ['#09090b'], strokeColors: '#f59e0b', strokeWidth: 3, hover: { size: 7 } },
    dataLabels: { enabled: false },
    xaxis: { categories: days30, labels: { style: { colors: '#71717a', fontSize: '10px', fontFamily: 'Inter' }, hideOverlappingLabels: true }, axisBorder: { show: false }, axisTicks: { show: false }, tooltip: { enabled: false } },
    yaxis: { labels: { style: { colors: '#71717a', fontSize: '11px', fontFamily: 'Inter', fontWeight: 600 }, formatter: (v: number) => fmtV(v) } },
    grid: { borderColor: '#27272a', strokeDashArray: 5, padding: { top: 0, right: 0, bottom: 0, left: 10 } },
    tooltip: { theme: 'dark', y: { formatter: (v: number) => fmtV(v) } },
  };

  const catDonutOpts: ApexOptions = {
    chart: { type: 'donut', background: 'transparent', animations: { dynamicAnimation: { speed: 1000 } } },
    colors: categoryGroups.map(g => g.color),
    labels: categoryGroups.map(g => g.label),
    legend: { show: false },
    dataLabels: { enabled: false },
    stroke: { width: 6, colors: ['#0D0D0F'] },
    plotOptions: { 
      pie: { 
        donut: { 
          size: '82%', 
          labels: { 
            show: true, 
            name: { color: '#a1a1aa', fontSize: '12px', fontFamily: 'Inter' },
            value: { color: '#fff', fontSize: '26px', fontWeight: '900', fontFamily: 'Inter', formatter: (v: any) => `${Number(v || 0).toFixed(1)}%` },
            total: { show: true, label: 'Invested', color: '#71717a', fontSize: '11px', formatter: () => fmtV(investedValue) }
          } 
        } 
      } 
    },
    tooltip: { theme: 'dark', y: { formatter: (v: number) => `${v.toFixed(1)}%` } },
  };

  const driftStatus = driftIndex < 1 ? { label: 'Perfectly Aligned', color: '#34d399', bg: 'from-emerald-500/20 to-emerald-900/10' } : 
                      driftIndex < 3 ? { label: 'Minor Drift Detected', color: '#f59e0b', bg: 'from-amber-500/20 to-amber-900/10' } : 
                                       { label: 'Rebalance Required', color: '#f43f5e', bg: 'from-rose-500/20 to-rose-900/10' };

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="p-4 md:p-8 space-y-6 font-inter bg-[#09090B] min-h-[calc(100vh-64px)] text-zinc-100 overflow-x-hidden animate-fade-in-up">
      
      {/* Stunning Header */}
      <div className="relative overflow-hidden rounded-3xl bg-[#0D0D0F] border border-[#27272A] p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none animate-pulse delay-1000" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-4 text-[10px] font-bold tracking-widest uppercase text-zinc-400">
              <Activity className="w-3.5 h-3.5 text-amber-400" /> Dashboard Live
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-500 tracking-tight">
              Wealth Overview
            </h1>
            <p className="text-sm text-zinc-400 mt-2 font-medium">Real-time performance and allocation of your digital & traditional assets.</p>
          </div>

          <div className={`px-5 py-4 rounded-2xl border bg-gradient-to-br ${driftStatus.bg} border-white/5 backdrop-blur-xl shadow-xl flex items-center gap-4 transition-all hover:scale-105 duration-300`}>
            <div className="relative flex items-center justify-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center border-2" style={{ borderColor: driftStatus.color, backgroundColor: `${driftStatus.color}20` }}>
                <Zap className="w-5 h-5" style={{ color: driftStatus.color }} />
              </div>
              <div className="absolute w-full h-full rounded-full animate-ping opacity-20" style={{ backgroundColor: driftStatus.color }} />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-0.5">System Status</div>
              <div className="text-sm font-black tracking-wide" style={{ color: driftStatus.color }}>{driftStatus.label}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Hero Metric Cards with Sparklines */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Value */}
        <div className="relative overflow-hidden rounded-2xl bg-[#141413] border border-[#27272A] p-5 group hover:border-amber-500/50 transition-colors">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Total Portfolio</div>
              <div className="text-3xl font-black text-white tracking-tighter">{fmtV(totalPortfolioValue)}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-emerald-400 z-10 relative">
            <TrendingUp className="w-4 h-4" /> +12.4% (30d)
          </div>
          <div className="absolute bottom-0 left-0 w-full h-16 opacity-40 group-hover:opacity-100 transition-opacity">
            <ReactApexChart type="area" height={60} options={sparklineOpts('#f59e0b')} series={[{ data: sparkUp }]} />
          </div>
        </div>

        {/* Invested Capital */}
        <div className="relative overflow-hidden rounded-2xl bg-[#141413] border border-[#27272A] p-5 group hover:border-indigo-500/50 transition-colors">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Capital Deployed</div>
              <div className="text-3xl font-black text-white tracking-tighter">{fmtV(totalCostBasis)}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-zinc-400 z-10 relative">
            Across 16 active assets
          </div>
          <div className="absolute bottom-0 left-0 w-full h-16 opacity-40 group-hover:opacity-100 transition-opacity">
            <ReactApexChart type="area" height={60} options={sparklineOpts('#818cf8')} series={[{ data: sparkUp.map(v => v * 0.8) }]} />
          </div>
        </div>

        {/* Total Profit */}
        <div className="relative overflow-hidden rounded-2xl bg-[#141413] border border-[#27272A] p-5 group hover:border-emerald-500/50 transition-colors">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Total Profits</div>
              <div className="text-3xl font-black text-emerald-400 tracking-tighter">+{fmtV(totalProfit)}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-400 z-10 relative">
            +{profitPct.toFixed(2)}% ROI
          </div>
          <div className="absolute bottom-0 left-0 w-full h-16 opacity-40 group-hover:opacity-100 transition-opacity">
            <ReactApexChart type="area" height={60} options={sparklineOpts('#10b981')} series={[{ data: sparkUp }]} />
          </div>
        </div>

        {/* Total Loss */}
        <div className="relative overflow-hidden rounded-2xl bg-[#141413] border border-[#27272A] p-5 group hover:border-rose-500/50 transition-colors">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Total Losses</div>
              <div className="text-3xl font-black text-rose-400 tracking-tighter">-{fmtV(totalLoss)}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-rose-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-rose-400 z-10 relative">
            -{lossPct.toFixed(2)}% Drawdown
          </div>
          <div className="absolute bottom-0 left-0 w-full h-16 opacity-40 group-hover:opacity-100 transition-opacity">
            <ReactApexChart type="area" height={60} options={sparklineOpts('#f43f5e')} series={[{ data: sparkDown }]} />
          </div>
        </div>
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Growth Line Chart (Takes up 2 cols) */}
        <div className="lg:col-span-2 rounded-3xl bg-[#0D0D0F] border border-[#27272A] p-6 relative overflow-hidden group hover:border-amber-500/30 transition-all duration-500 shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/10 transition-colors" />
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-amber-400" /> Performance Velocity
              </h2>
              <p className="text-xs text-zinc-500 mt-1">30-day historical value tracking with predictive glow</p>
            </div>
          </div>
          <div className="-ml-2 mt-4 relative z-10">
            <ReactApexChart type="area" height={320} options={mainGrowthOpts} series={[{ name: 'Portfolio Value', data: portfolioHistory }]} />
          </div>
        </div>

        {/* Dynamic Sector Allocation Donut */}
        <div className="rounded-3xl bg-[#0D0D0F] border border-[#27272A] p-6 flex flex-col relative overflow-hidden group hover:border-indigo-500/30 transition-all duration-500 shadow-xl">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <PieChart className="w-5 h-5 text-indigo-400" /> Sector Allocation
            </h2>
            <p className="text-xs text-zinc-500 mt-1">Deep dive into category distribution</p>
          </div>
          <div className="flex-1 flex flex-col justify-center mt-6 relative z-10">
            <ReactApexChart type="donut" height={280} options={catDonutOpts} series={categoryGroups.map(g => parseFloat(g.catWeight.toFixed(2)))} />
            
            <div className="mt-4 space-y-2.5">
              {categoryGroups.map(g => (
                <div key={g.cat} className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition-colors border border-transparent hover:border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ background: g.color, boxShadow: `0 0 10px ${g.color}80` }} />
                    <span className="text-xs font-bold text-zinc-300">{g.label}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="font-mono text-white font-semibold">{fmtV(g.catValue)}</span>
                    <span className="font-mono text-zinc-500 w-10 text-right">{g.catWeight.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Complete Holdings Table (Restored) */}
      <div className="rounded-3xl bg-[#0D0D0F] border border-[#27272A] relative overflow-hidden shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-[#27272A]">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-emerald-400" /> All Holdings Heatmap
            </h2>
            <p className="text-xs text-zinc-500 mt-1">Detailed performance metrics across all 16 active positions</p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="bg-[#141413] border-b border-[#27272A]">
                {['Asset', 'Price', 'Holdings', 'Current Value', 'Invested', 'P&L', 'Weight', '24h'].map(h => (
                  <th key={h} className="px-6 py-4 text-left text-[10px] font-bold text-zinc-500 uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categoryGroups.map(group => (
                <React.Fragment key={group.cat}>
                  {/* Category header row */}
                  <tr className="bg-[#1A1A1A]/30">
                    <td colSpan={8} className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: group.color, boxShadow: `0 0 8px ${group.color}` }} />
                        <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: group.color }}>{group.label}</span>
                        <span className="text-[10px] font-semibold text-zinc-600">· {group.assets.length} positions · {fmtV(group.catValue)}</span>
                      </div>
                    </td>
                  </tr>
                  {/* Asset rows */}
                  {group.assets.map(a => (
                    <tr key={a.ticker} className="border-b border-[#27272A]/40 hover:bg-white/[0.03] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black shadow-lg" style={{ background: `${ASSET_COLORS[a.ticker]}20`, color: ASSET_COLORS[a.ticker], border: `1px solid ${ASSET_COLORS[a.ticker]}40` }}>
                            {a.ticker.slice(0, 2)}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white">{a.ticker}</div>
                            <div className="text-[10px] text-zinc-500 hidden sm:block font-medium">{a.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs font-mono font-bold text-zinc-200">
                          {a.spotPrice >= 100000 ? `₹${(a.spotPrice / 100000).toFixed(2)}L` : a.spotPrice >= 1000 ? `₹${a.spotPrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : `₹${a.spotPrice.toFixed(2)}`}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono font-medium text-zinc-400">
                        {a.qty < 0.01 ? a.qty.toFixed(6) : a.qty < 1 ? a.qty.toFixed(4) : a.qty.toLocaleString('en-IN')} <span className="text-zinc-600 ml-1">{a.unit}</span>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono font-bold text-white">{fmtV(a.value)}</td>
                      <td className="px-6 py-4 text-xs font-mono font-medium text-zinc-500">{fmtV(a.costBasis)}</td>
                      <td className="px-6 py-4">
                        <div className={`text-xs font-bold ${a.unrealizedPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {a.unrealizedPnL >= 0 ? '+' : ''}{fmtV(Math.abs(a.unrealizedPnL))}
                        </div>
                        <div className={`text-[10px] font-semibold mt-0.5 ${a.pnlPct >= 0 ? 'text-emerald-500/80' : 'text-rose-500/80'}`}>{fmtP(a.pnlPct)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-[#1A1A1A] rounded-full overflow-hidden min-w-[60px] shadow-inner">
                            <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(a.weight / 20 * 100, 100)}%`, background: ASSET_COLORS[a.ticker] }} />
                          </div>
                          <span className="text-[11px] font-mono font-bold text-zinc-300 w-10 text-right">{a.weight.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-md ${a.change24h >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                          {a.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {Math.abs(a.change24h).toFixed(2)}%
                        </div>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default PortfolioOverview;
