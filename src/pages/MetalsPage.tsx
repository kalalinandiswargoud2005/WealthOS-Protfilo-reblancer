import React, { useState, useMemo, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { Lock, ArrowUpRight, ArrowDownRight, Anchor } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import type { AssetCategory } from '../context/PortfolioContext';

interface MetalListItem {
  ticker: string;
  name: string;
  unit: string;
  basePrice: number;
  macroIndicator: string;
}

const METALS_LIST: MetalListItem[] = [
  { ticker: 'GOLD', name: 'Gold (24K Bullion)', unit: 'g', basePrice: 7200, macroIndicator: 'Comex Gold Spot: $2,350/oz' },
  { ticker: 'SILVER', name: 'Silver (Fine Bullion)', unit: 'g', basePrice: 85, macroIndicator: 'Comex Silver Spot: $29.5/oz' },
  { ticker: 'PLATINUM', name: 'Platinum (950 Spot)', unit: 'g', basePrice: 2820, macroIndicator: 'NYMEX Plat Spot: $980/oz' },
  { ticker: 'PALLADIUM', name: 'Palladium (999 Spot)', unit: 'g', basePrice: 3150, macroIndicator: 'NYMEX Pall Spot: $1,050/oz' }
];

const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const MetalsPage: React.FC = () => {
  const { assets, cashBalance, buyAsset, sellAsset } = usePortfolio();
  
  const metalAssets = useMemo(() => assets.filter(a => a.category === 'metals'), [assets]);
  
  const [selectedMetal, setSelectedMetal] = useState<string>('GOLD');
  const [livePrices, setLivePrices] = useState<Record<string, number>>({});
  
  // Trade parameters
  const [tradeQty, setTradeQty] = useState<string>('10');
  const [tradeError, setTradeError] = useState<string | null>(null);
  const [tradeSuccess, setTradeSuccess] = useState<string | null>(null);

  const selectedMetalDetail = useMemo(() => {
    return METALS_LIST.find(m => m.ticker === selectedMetal) || METALS_LIST[0];
  }, [selectedMetal]);

  // Jitter spot pricing on metals to simulate live exchange ticks
  useEffect(() => {
    const applyJitter = () => {
      setLivePrices(prev => {
        const next = { ...prev };
        METALS_LIST.forEach(metal => {
          // Find if we have synced spot from context, else use catalog basePrice
          const match = metalAssets.find(a => a.ticker === metal.ticker);
          const base = next[metal.ticker] || (match ? match.spotPrice : metal.basePrice);
          const jitter = (Math.random() - 0.49) * (base * 0.002);
          next[metal.ticker] = parseFloat((base + jitter).toFixed(2));
        });
        return next;
      });
    };

    applyJitter();
    const interval = setInterval(applyJitter, 4000); // Ticks every 4s
    return () => clearInterval(interval);
  }, [metalAssets]);

  const activePrice = livePrices[selectedMetal] || selectedMetalDetail.basePrice;

  // Retrieve current physical vault holding
  const holding = useMemo(() => {
    return metalAssets.find(a => a.ticker === selectedMetal);
  }, [metalAssets, selectedMetal]);

  const ownedQty = holding ? holding.qty : 0;

  // Gold-Silver macro ratio
  const goldPrice = livePrices['GOLD'] || 7200;
  const silverPrice = livePrices['SILVER'] || 85;
  const goldSilverRatio = (goldPrice / silverPrice).toFixed(2);

  // Handle Buy
  const handleBuy = () => {
    setTradeError(null);
    setTradeSuccess(null);
    const qty = parseFloat(tradeQty);
    if (isNaN(qty) || qty <= 0) {
      setTradeError('Enter a valid quantity');
      return;
    }
    const cost = qty * activePrice;
    if (cost > cashBalance) {
      setTradeError(`Insufficient balance. Cost: ₹${cost.toLocaleString('en-IN')} vs Available: ₹${cashBalance.toLocaleString('en-IN')}`);
      return;
    }

    try {
      buyAsset(
        selectedMetal,
        qty,
        activePrice,
        'metals' as AssetCategory,
        selectedMetalDetail.name,
        selectedMetalDetail.unit
      );
      setTradeSuccess(`Successfully bought ${qty}${selectedMetalDetail.unit} of physical ${selectedMetal}!`);
    } catch (e: any) {
      setTradeError(e.message || 'Transaction failed');
    }
  };

  // Handle Sell
  const handleSell = () => {
    setTradeError(null);
    setTradeSuccess(null);
    const qty = parseFloat(tradeQty);
    if (isNaN(qty) || qty <= 0) {
      setTradeError('Enter a valid quantity');
      return;
    }
    if (qty > ownedQty) {
      setTradeError(`Insufficient vault holdings. You own ${ownedQty}${selectedMetalDetail.unit}`);
      return;
    }

    try {
      sellAsset(selectedMetal, qty, activePrice);
      setTradeSuccess(`Successfully sold ${qty}${selectedMetalDetail.unit} of physical ${selectedMetal}!`);
    } catch (e: any) {
      setTradeError(e.message || 'Transaction failed');
    }
  };

  // Chart setup
  const chartSeries = useMemo(() => {
    const match = metalAssets.find(a => a.ticker === selectedMetal);
    let history = match ? [...match.priceHistory] : [];
    if (history.length === 0) {
      // Mock history
      let val = selectedMetalDetail.basePrice * 0.98;
      history = Array.from({ length: 8 }).map(() => {
        val = val * (1 + (Math.random() - 0.5) * 0.008);
        return parseFloat(val.toFixed(2));
      });
    }
    history[history.length - 1] = activePrice;
    return [{ name: `${selectedMetal} Spot`, data: history }];
  }, [selectedMetal, selectedMetalDetail, activePrice, metalAssets]);

  const metalColor = selectedMetal === 'GOLD' ? '#f59e0b' : selectedMetal === 'SILVER' ? '#94a3b8' : '#e2e8f0';

  const chartOptions: ApexOptions = {
    chart: { 
      type: 'area', toolbar: { show: false }, background: 'transparent',
      animations: { dynamicAnimation: { speed: 800 } },
      dropShadow: { enabled: true, top: 15, left: 0, blur: 20, color: metalColor, opacity: 0.4 }
    },
    colors: [metalColor],
    fill: { type: 'gradient', gradient: { shade: 'dark', type: 'vertical', shadeIntensity: 1, gradientToColors: [metalColor], opacityFrom: 0.6, opacityTo: 0.0, stops: [0, 100] } },
    stroke: { curve: 'smooth', width: 4, lineCap: 'round' },
    markers: { size: 0, colors: ['#09090b'], strokeColors: metalColor, strokeWidth: 3, hover: { size: 8 } },
    dataLabels: { enabled: false },
    xaxis: { labels: { show: false }, axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: { labels: { style: { colors: '#71717a', fontSize: '10px', fontFamily: 'monospace' }, formatter: (v: number) => `₹${v.toLocaleString('en-IN')}` } },
    grid: { borderColor: '#1f1f22', strokeDashArray: 2 },
    tooltip: { theme: 'dark', y: { formatter: (v: number) => `₹${v.toLocaleString('en-IN')}` } },
  };

  const totalMetalsValue = metalAssets.reduce((s, a) => {
    const price = livePrices[a.ticker] || a.spotPrice;
    return s + a.qty * price;
  }, 0);

  return (
    <div className="flex flex-col h-full bg-[#050505] text-zinc-300 font-inter">
      {/* Institutional Header */}
      <div className="px-6 py-4 border-b border-[#222] bg-[#0a0a0a] flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-amber-500/10 border border-amber-500/20 rounded flex items-center justify-center">
            <Anchor className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-widest uppercase">Global Commodities Desk</h1>
            <div className="text-[10px] text-zinc-500 font-mono mt-0.5">MCX / NYMEX Spot physical vault</div>
          </div>
        </div>
        <div className="flex gap-8">
          <div className="text-right hidden md:block">
            <div className="text-[9px] text-zinc-500 uppercase font-semibold">Gold-Silver Ratio</div>
            <div className="text-sm font-bold text-white font-mono">{goldSilverRatio}</div>
          </div>
          <div className="text-right">
            <div className="text-[9px] text-zinc-500 uppercase font-semibold">Vault Holdings</div>
            <div className="text-sm font-bold text-amber-400 font-mono">₹{Math.round(totalMetalsValue).toLocaleString('en-IN')}</div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Left Column: Spot Metals Directory */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#0a0a0a] border border-[#222] rounded-lg">
              <div className="p-3 border-b border-[#222] bg-[#111]">
                <h2 className="text-xs font-bold text-white uppercase tracking-wider">Spot Metals</h2>
              </div>
              <div className="p-2 space-y-1.5">
                {METALS_LIST.map(metal => {
                  const isGold = metal.ticker === 'GOLD';
                  const price = livePrices[metal.ticker] || metal.basePrice;
                  const match = metalAssets.find(a => a.ticker === metal.ticker);
                  const chg = match ? match.change24h : 0.42;
                  const isUp = chg >= 0;
                  return (
                    <div 
                      key={metal.ticker}
                      onClick={() => {
                        setSelectedMetal(metal.ticker);
                        setTradeError(null);
                        setTradeSuccess(null);
                      }}
                      className={`p-3 rounded border cursor-pointer transition-all ${selectedMetal === metal.ticker ? `bg-[#1a1a1a] ${isGold ? 'border-amber-500/50' : 'border-slate-400/50'}` : 'bg-transparent border-transparent hover:bg-[#111]'}`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-xs font-black ${isGold ? 'text-amber-400' : 'text-slate-300'}`}>{metal.ticker}</span>
                        <span className={`text-[9px] font-bold ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                          {isUp ? '+' : ''}{chg.toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-end">
                        <span className="text-base font-mono text-white">{formatPrice(price)}</span>
                        <span className="text-[9px] text-zinc-500">/{metal.unit}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Macro Indicators */}
            <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-4">
              <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">Macro Benchmarks</h2>
              <div className="space-y-4">
                {METALS_LIST.map(m => (
                  <div key={m.ticker} className="flex justify-between text-xs border-b border-[#1b1b1f] pb-2">
                    <span className="text-zinc-500 font-bold">{m.ticker}:</span>
                    <span className="font-mono text-zinc-300">{m.macroIndicator}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Center Column: Spot Pricing Chart */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-[#0a0a0a] border border-[#222] rounded-3xl p-6 flex-1 min-h-[380px] shadow-2xl relative overflow-hidden group hover:border-amber-500/30 transition-all duration-500">
              <div className={`absolute top-0 left-0 w-64 h-64 rounded-full blur-3xl pointer-events-none transition-colors opacity-10 group-hover:opacity-20 ${selectedMetal === 'GOLD' ? 'bg-amber-500' : selectedMetal === 'SILVER' ? 'bg-slate-400' : 'bg-zinc-400'}`} />
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                  <h2 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Anchor className={`w-5 h-5 ${selectedMetal === 'GOLD' ? 'text-amber-500' : 'text-slate-400'}`} /> {selectedMetalDetail.name} Velocity
                  </h2>
                  <div className="text-[10px] text-zinc-500 mt-1">London Bullion Market Association (LBMA) Reference Spot</div>
                </div>
                <div className="flex gap-2">
                  <button className="px-2.5 py-1 bg-white text-black rounded text-[10px] font-bold">1M SPOT</button>
                </div>
              </div>
              
              <div className="h-[280px] -mx-2">
                <ReactApexChart type="area" height="100%" options={chartOptions} series={chartSeries} />
              </div>
            </div>
          </div>

          {/* Right Column: Execution Order Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-5">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#222]">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Vault Order Desk</h3>
                <span className="text-[9px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20 font-bold">LIVE MCX</span>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-[10px] text-zinc-400 mb-1.5">
                    <span>Quantity ({selectedMetalDetail.unit})</span>
                    <span>Holdings: {ownedQty.toLocaleString('en-IN')}{selectedMetalDetail.unit}</span>
                  </div>
                  <input 
                    type="number" 
                    value={tradeQty} 
                    onChange={e => setTradeQty(e.target.value)}
                    className="w-full bg-[#111] border border-[#222] rounded px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-amber-500/50" 
                  />
                </div>

                <div className="bg-[#111] p-3 rounded border border-[#222] text-xs">
                  <div className="flex justify-between mb-1">
                    <span className="text-zinc-500">Order Value:</span>
                    <span className="font-mono text-white">₹{Math.round(parseFloat(tradeQty) * activePrice || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Available Cash:</span>
                    <span className="font-mono text-white">₹{Math.round(cashBalance).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {tradeError && <div className="text-[10px] text-red-400 font-mono text-center">{tradeError}</div>}
                {tradeSuccess && <div className="text-[10px] text-emerald-400 font-mono text-center">{tradeSuccess}</div>}

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button 
                    onClick={handleBuy}
                    className="py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded transition-colors flex justify-center items-center gap-1"
                  >
                    BUY <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={handleSell}
                    className="py-3 bg-red-600 hover:bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded transition-colors flex justify-center items-center gap-1"
                  >
                    SELL <ArrowDownRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-5">
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-[#222]">
                <Lock className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Vault Registry</h3>
              </div>
              <div className="space-y-2.5">
                {metalAssets.map(asset => (
                  <div key={asset.ticker} className="flex justify-between items-center text-xs">
                    <span className="text-zinc-400 font-bold">{asset.name}:</span>
                    <span className="font-mono text-white">{asset.qty.toLocaleString('en-IN')}{asset.unit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MetalsPage;
