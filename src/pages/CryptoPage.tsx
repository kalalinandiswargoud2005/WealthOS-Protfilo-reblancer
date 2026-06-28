import React, { useState, useEffect, useMemo } from 'react';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { ArrowUpRight, ArrowDownRight, Activity, Zap, BarChart2, Shield, Search } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import type { AssetCategory } from '../context/PortfolioContext';

interface CoinData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  price_change_percentage_24h: number;
}

// Fallback top cryptos in case CoinGecko rate limits us
const FALLBACK_COINS: CoinData[] = [
  { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', image: '', current_price: 6044140, market_cap: 119000000000000, total_volume: 2500000000000, price_change_percentage_24h: 2.34 },
  { id: 'ethereum', symbol: 'eth', name: 'Ethereum', image: '', current_price: 285000, market_cap: 34000000000000, total_volume: 1200000000000, price_change_percentage_24h: 3.12 },
  { id: 'solana', symbol: 'sol', name: 'Solana', image: '', current_price: 12400, market_cap: 5700000000000, total_volume: 400000000000, price_change_percentage_24h: -1.87 },
  { id: 'ripple', symbol: 'xrp', name: 'Ripple XRP', image: '', current_price: 48.50, market_cap: 2800000000000, total_volume: 150000000000, price_change_percentage_24h: 1.20 },
  { id: 'cardano', symbol: 'ada', name: 'Cardano ADA', image: '', current_price: 35.20, market_cap: 1200000000000, total_volume: 50000000000, price_change_percentage_24h: -0.85 },
  { id: 'dogecoin', symbol: 'doge', name: 'Dogecoin', image: '', current_price: 10.80, market_cap: 1500000000000, total_volume: 80000000000, price_change_percentage_24h: 4.52 },
  { id: 'shiba-inu', symbol: 'shib', name: 'Shiba Inu', image: '', current_price: 0.0016, market_cap: 900000000000, total_volume: 35000000000, price_change_percentage_24h: -2.15 },
  { id: 'binancecoin', symbol: 'bnb', name: 'BNB', image: '', current_price: 48500, market_cap: 7500000000000, total_volume: 120000000000, price_change_percentage_24h: 0.95 },
  { id: 'polkadot', symbol: 'dot', name: 'Polkadot', image: '', current_price: 520, market_cap: 720000000000, total_volume: 30000000000, price_change_percentage_24h: 1.05 },
  { id: 'matic-network', symbol: 'polygon', name: 'Polygon', image: '', current_price: 48.20, market_cap: 480000000000, total_volume: 25000000000, price_change_percentage_24h: -3.42 },
];

const ASSET_COLORS: Record<string, string> = {
  BTC: '#f59e0b', ETH: '#6366f1', SOL: '#a855f7', XRP: '#3b82f6', ADA: '#0284c7',
  DOGE: '#eab308', SHIB: '#f97316', BNB: '#eab308', DOT: '#e11d48', POLYGON: '#8b5cf6'
};

const getAssetColor = (ticker: string) => {
  return ASSET_COLORS[ticker.toUpperCase()] || '#ec4899';
};

const CryptoPage: React.FC = () => {
  const { assets, cashBalance, buyAsset, sellAsset } = usePortfolio();
  
  const [coins, setCoins] = useState<CoinData[]>(FALLBACK_COINS);
  const [selectedId, setSelectedId] = useState<string>('bitcoin');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Form input state
  const [tradeQty, setTradeQty] = useState<string>('0.1');
  const [tradeError, setTradeError] = useState<string | null>(null);
  const [tradeSuccess, setTradeSuccess] = useState<string | null>(null);
  
  const [orderBook, setOrderBook] = useState<{ asks: { price: number, size: number }[], bids: { price: number, size: number }[] }>({ asks: [], bids: [] });
  const [filterOwnedOnly, setFilterOwnedOnly] = useState(false);

  // Fetch top 100 cryptocurrencies in INR
  useEffect(() => {
    const fetchTopCoins = async () => {
      try {
        const res = await fetch('http://api.coingecko.com/api/v3/coins/markets?vs_currency=inr&order=market_cap_desc&per_page=100&page=1&sparkline=false&x_cg_demo_api_key=CG-8vJAa46j1uEXJTZQRqkaygVN');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setCoins(data.map((c: any) => ({
              id: c.id,
              symbol: c.symbol,
              name: c.name,
              image: c.image,
              current_price: c.current_price,
              market_cap: c.market_cap,
              total_volume: c.total_volume,
              price_change_percentage_24h: c.price_change_percentage_24h || 0
            })));
          }
        }
      } catch (err) {
        console.warn("CoinGecko List API Error, using fallback:", err);
      }
    };

    fetchTopCoins();
    const interval = setInterval(fetchTopCoins, 45000); // Poll every 45s
    return () => clearInterval(interval);
  }, []);

  const activeCoin = useMemo(() => {
    return coins.find(c => c.id === selectedId) || coins[0] || FALLBACK_COINS[0];
  }, [coins, selectedId]);

  const activeTicker = activeCoin.symbol.toUpperCase();

  // Search filtered coins
  const filteredCoins = useMemo(() => {
    let list = coins;
    if (filterOwnedOnly) {
      list = coins.filter(c => {
        const holding = assets.find(a => a.ticker === c.symbol.toUpperCase() && a.category === 'crypto');
        return holding && holding.qty > 0;
      });
    }
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(c => c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q));
  }, [coins, searchQuery, filterOwnedOnly, assets]);

  // Find users holdings of the selected coin in context
  const portfolioHolding = useMemo(() => {
    return assets.find(a => a.ticker === activeTicker && a.category === 'crypto');
  }, [assets, activeTicker]);

  const ownedQty = portfolioHolding ? portfolioHolding.qty : 0;

  // Simulate Order Book around the live selected price
  useEffect(() => {
    if (!activeCoin.current_price) return;
    
    const updateOrderBook = () => {
      const basePrice = activeCoin.current_price;
      const spread = basePrice * 0.00015; // 0.015% spread
      
      const asks = Array.from({ length: 12 }).map((_, i) => ({
        price: basePrice + spread + (i * basePrice * 0.0004) + (Math.random() * basePrice * 0.0002),
        size: Math.random() * (activeTicker === 'BTC' ? 0.8 : activeTicker === 'ETH' ? 8 : 450)
      })).sort((a, b) => b.price - a.price);

      const bids = Array.from({ length: 12 }).map((_, i) => ({
        price: basePrice - spread - (i * basePrice * 0.0004) - (Math.random() * basePrice * 0.0002),
        size: Math.random() * (activeTicker === 'BTC' ? 0.8 : activeTicker === 'ETH' ? 8 : 450)
      })).sort((a, b) => b.price - a.price);

      setOrderBook({ asks, bids });
    };

    updateOrderBook();
    const obInterval = setInterval(updateOrderBook, 900); // 900ms fast ticks
    return () => clearInterval(obInterval);
  }, [activeCoin.current_price, activeTicker]);

  // Handle Buy
  const handleBuy = () => {
    setTradeError(null);
    setTradeSuccess(null);
    const qty = parseFloat(tradeQty);
    if (isNaN(qty) || qty <= 0) {
      setTradeError('Enter a valid quantity');
      return;
    }
    const cost = qty * activeCoin.current_price;
    if (cost > cashBalance) {
      setTradeError(`Insufficient cash. Cost: ₹${cost.toLocaleString('en-IN')} vs Balance: ₹${cashBalance.toLocaleString('en-IN')}`);
      return;
    }

    try {
      buyAsset(
        activeTicker,
        qty,
        activeCoin.current_price,
        'crypto' as AssetCategory,
        activeCoin.name,
        activeTicker
      );
      setTradeSuccess(`Successfully bought ${qty} ${activeTicker}!`);
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
      setTradeError(`Insufficient holdings. You own ${ownedQty} ${activeTicker}`);
      return;
    }

    try {
      sellAsset(activeTicker, qty, activeCoin.current_price);
      setTradeSuccess(`Successfully sold ${qty} ${activeTicker}!`);
    } catch (e: any) {
      setTradeError(e.message || 'Transaction failed');
    }
  };

  // Setup ApexCharts parameters
  const chartSeries = useMemo(() => {
    // Return a simulated high-vol history matching coin baseline
    const base = activeCoin.current_price;
    let price = base * 0.96;
    const history = Array.from({ length: 15 }).map(() => {
      price = price * (1 + (Math.random() - 0.5) * 0.03);
      return parseFloat(price.toFixed(base > 1000 ? 0 : 4));
    });
    history.push(base);
    return [{ name: activeCoin.name, data: history }];
  }, [activeCoin]);

  const color = getAssetColor(activeTicker);

  const chartOptions: ApexOptions = {
    chart: { 
      type: 'area', toolbar: { show: false }, background: 'transparent', 
      animations: { dynamicAnimation: { speed: 800 } },
      dropShadow: { enabled: true, top: 10, left: 0, blur: 15, color: color, opacity: 0.4 } 
    },
    colors: [color],
    fill: { type: 'gradient', gradient: { shade: 'dark', type: 'vertical', shadeIntensity: 1, gradientToColors: [color], opacityFrom: 0.6, opacityTo: 0.0, stops: [0, 100] } },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 4, lineCap: 'round' },
    markers: { size: 0, colors: ['#09090b'], strokeColors: color, strokeWidth: 3, hover: { size: 8 } },
    xaxis: { labels: { show: false }, axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: { labels: { style: { colors: '#71717a', fontSize: '10px', fontFamily: 'monospace' }, formatter: (v: number) => `₹${v.toLocaleString('en-IN')}` } },
    grid: { borderColor: '#1f1f23', strokeDashArray: 3, xaxis: { lines: { show: true } }, yaxis: { lines: { show: true } } },
    theme: { mode: 'dark' },
    tooltip: { theme: 'dark', y: { formatter: (v: number) => `₹${v.toLocaleString('en-IN')}` } },
  };

  const totalCryptoValue = assets
    .filter(a => a.category === 'crypto')
    .reduce((s, a) => {
      const match = coins.find(c => c.symbol.toUpperCase() === a.ticker);
      const pr = match ? match.current_price : a.spotPrice;
      return s + a.qty * pr;
    }, 0);

  return (
    <div className="flex flex-col h-full bg-[#070708] text-zinc-300 font-inter">
      {/* Exchange Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-[#222] bg-[#0c0c0e] flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            {activeCoin.image ? (
              <img src={activeCoin.image} alt={activeCoin.name} className="w-8 h-8 rounded-full" />
            ) : (
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs" style={{ backgroundColor: color }}>
                {activeTicker.slice(0, 3)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black text-white">{activeTicker}/INR</h1>
                <span className="text-[9px] px-1.5 py-0.5 rounded border border-[#222] bg-zinc-800 text-zinc-400">SPOT</span>
              </div>
            </div>
          </div>
          
          {/* Explore / Holdings Tabs */}
          <div className="hidden md:flex gap-4 text-xs font-semibold text-zinc-400 pl-4 border-l border-[#222]">
            <button 
              onClick={() => setFilterOwnedOnly(false)}
              className={`pb-1 transition-colors ${!filterOwnedOnly ? 'text-white border-b border-rose-500' : 'hover:text-white'}`}
            >
              Explore
            </button>
            <button 
              onClick={() => setFilterOwnedOnly(true)}
              className={`pb-1 transition-colors ${filterOwnedOnly ? 'text-white border-b border-rose-500' : 'hover:text-white'}`}
            >
              Holdings ({assets.filter(a => a.category === 'crypto' && a.qty > 0).length})
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-6 border-l border-[#222] pl-6">
            <div>
              <div className="text-[9px] text-zinc-500 uppercase">Live Price</div>
              <div className={`text-xs font-mono font-bold ${activeCoin.price_change_percentage_24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                ₹{activeCoin.current_price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div>
              <div className="text-[9px] text-zinc-500 uppercase">24h Change</div>
              <div className={`text-xs font-mono font-bold ${activeCoin.price_change_percentage_24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {activeCoin.price_change_percentage_24h >= 0 ? '+' : ''}{activeCoin.price_change_percentage_24h.toFixed(2)}%
              </div>
            </div>
            <div>
              <div className="text-[9px] text-zinc-500 uppercase">24h Volume</div>
              <div className="text-xs font-mono font-bold text-white">
                ₹{(activeCoin.total_volume / 10000000).toFixed(2)} Cr
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-[9px] text-zinc-500 uppercase flex items-center gap-1">
            <Shield className="w-3 h-3 text-emerald-400"/> CoinGecko Terminal
          </div>
          <div className="text-[10px] font-bold text-zinc-400 font-mono mt-0.5">Top 100 Cryptos</div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        {/* Left Column: Markets list */}
        <div className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-[#222] bg-[#0c0c0e] flex flex-col flex-shrink-0">
          <div className="p-3 border-b border-[#222] flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-rose-400" />
              <h2 className="text-[10px] font-bold text-white uppercase tracking-wider">Markets</h2>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-7 pr-2 py-1 rounded bg-[#131316] border border-[#222] text-xs text-white focus:outline-none focus:border-rose-500/50 transition-colors"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-[#0c0c0e] z-10">
                <tr className="border-b border-[#222]">
                  <th className="text-left py-2 px-3 text-[9px] text-zinc-500 font-semibold uppercase">Token</th>
                  <th className="text-right py-2 px-3 text-[9px] text-zinc-500 font-semibold uppercase">Price</th>
                  <th className="text-right py-2 px-3 text-[9px] text-zinc-500 font-semibold uppercase">Chg</th>
                </tr>
              </thead>
              <tbody>
                {filteredCoins.map(coin => {
                  const isUp = coin.price_change_percentage_24h >= 0;
                  const isSelected = selectedId === coin.id;
                  return (
                    <tr 
                      key={coin.id} 
                      onClick={() => {
                        setSelectedId(coin.id);
                        setTradeError(null);
                        setTradeSuccess(null);
                      }}
                      className={`cursor-pointer transition-colors border-b border-[#141416]/50 ${isSelected ? 'bg-white/[0.05]' : 'hover:bg-white/[0.02]'}`}
                    >
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-zinc-400'}`}>{coin.symbol.toUpperCase()}</span>
                          <span className="text-[9px] text-zinc-600 hidden sm:inline truncate max-w-[80px]">{coin.name}</span>
                        </div>
                      </td>
                      <td className={`py-2 px-3 text-right text-[10px] font-mono ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                        {coin.current_price >= 100000 ? `₹${(coin.current_price/100000).toFixed(2)}L` : coin.current_price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-2 px-3 text-right text-[9px] font-mono">
                        <span className={isUp ? 'text-emerald-400' : 'text-red-400'}>
                          {isUp ? '+' : ''}{coin.price_change_percentage_24h.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Middle Column: Chart & Action Panel */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#070708]">
          {/* Chart area */}
          <div className="flex-1 min-h-[300px] p-4 flex flex-col border-b border-[#222]">
            <div className="flex justify-between items-center mb-2">
              <div className="flex gap-2">
                {['1H', '1D', '1W', '1M', '1Y'].map(tf => (
                  <button key={tf} className={`text-[10px] font-bold px-2 py-1 rounded ${tf === '1W' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
                    {tf}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <BarChart2 className="w-4 h-4 text-zinc-500 hover:text-white cursor-pointer" />
              </div>
            </div>
            <div className="flex-1 -mx-2">
              <ReactApexChart type="area" height="100%" options={chartOptions} series={chartSeries} />
            </div>
          </div>
          
          {/* Order / Portfolio Area */}
          <div className="h-52 flex-shrink-0 bg-[#0c0c0e] p-4 flex flex-col md:flex-row gap-4 border-t border-[#222]">
            {/* Holdings & Order Form Widget */}
            <div className="flex-1 border border-[#222] rounded-xl bg-[#121214] p-4 flex flex-col justify-between">
              <div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" /> My {activeTicker} Holdings
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">Cash: ₹{cashBalance.toLocaleString('en-IN')}</span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <div className="bg-[#1a1a1f] p-2 rounded-lg border border-[#27272c]">
                    <div className="text-[9px] text-zinc-500">Balance</div>
                    <div className="text-sm font-bold text-white font-mono">
                      {ownedQty < 1 ? ownedQty.toFixed(6) : ownedQty.toLocaleString('en-IN')} {activeTicker}
                    </div>
                  </div>
                  <div className="bg-[#1a1a1f] p-2 rounded-lg border border-[#27272c]">
                    <div className="text-[9px] text-zinc-500">Value (INR)</div>
                    <div className="text-sm font-bold text-emerald-400 font-mono">
                      ₹{Math.round(ownedQty * activeCoin.current_price).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-3 flex items-center gap-3">
                <div className="flex-1 flex gap-2 items-center">
                  <input
                    type="text"
                    value={tradeQty}
                    onChange={e => setTradeQty(e.target.value)}
                    placeholder="Qty"
                    className="w-full bg-[#1e1e24] border border-[#2d2d34] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                  />
                  <span className="text-xs font-bold text-zinc-400 font-mono">{activeTicker}</span>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button 
                    onClick={handleBuy}
                    className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded transition-colors"
                  >
                    Buy
                  </button>
                  <button 
                    onClick={handleSell}
                    className="px-4 py-1.5 bg-rose-500 hover:bg-rose-400 text-black text-xs font-bold rounded transition-colors"
                  >
                    Sell
                  </button>
                </div>
              </div>
              
              {tradeError && <div className="text-[9px] text-red-400 font-mono mt-1">{tradeError}</div>}
              {tradeSuccess && <div className="text-[9px] text-emerald-400 font-mono mt-1">{tradeSuccess}</div>}
            </div>

            {/* Total Crypto Portfolio Summary */}
            <div className="w-full md:w-64 border border-[#222] rounded-xl bg-[#121214] p-4 flex flex-col justify-between">
              <div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Total Crypto Holdings</div>
                <div className="text-xl font-black text-white font-mono mt-2 tracking-tight">
                  ₹{Math.round(totalCryptoValue).toLocaleString('en-IN')}
                </div>
              </div>
              <div className="text-[9px] text-zinc-500 leading-relaxed mt-2">
                Real-time values synchronized with live CoinGecko index feed. Transaction changes are instantly reflected in your main dashboard balance.
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Simulated Live Order Book */}
        <div className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-[#222] bg-[#0c0c0e] flex flex-col flex-shrink-0">
          <div className="p-3 border-b border-[#222] flex items-center justify-between">
            <h2 className="text-[10px] font-bold text-white uppercase tracking-wider">Live Order Book</h2>
            <div className="text-[9px] text-zinc-500 font-mono">10x Depth</div>
          </div>
          
          <div className="flex-1 flex flex-col p-1.5 min-h-[400px]">
            <div className="flex text-[9px] text-zinc-500 uppercase font-semibold px-2 pb-1.5 border-b border-[#222] mb-1">
              <div className="flex-1">Price (INR)</div>
              <div className="flex-1 text-right">Amount ({activeTicker})</div>
              <div className="flex-1 text-right">Total</div>
            </div>
            
            {/* Asks (Red, top half) */}
            <div className="flex-1 flex flex-col-reverse justify-start overflow-hidden">
              {orderBook.asks.map((ask, i) => {
                const total = ask.price * ask.size;
                const maxTotal = orderBook.asks[0]?.price * orderBook.asks[0]?.size * 2 || 1;
                const widthPct = Math.min((total / maxTotal) * 100, 100);
                return (
                  <div key={`ask-${i}`} className="flex text-[10px] font-mono px-2 py-0.5 hover:bg-white/[0.05] relative group cursor-pointer">
                    <div className="absolute right-0 top-0 bottom-0 bg-red-500/10 z-0 transition-all" style={{ width: `${widthPct}%` }} />
                    <div className="flex-1 text-red-400 font-semibold z-10">
                      {ask.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </div>
                    <div className="flex-1 text-right text-zinc-300 z-10">{ask.size.toFixed(activeTicker === 'BTC' ? 5 : activeTicker === 'ETH' ? 3 : 1)}</div>
                    <div className="flex-1 text-right text-zinc-500 z-10">₹{(total / 1000).toFixed(1)}K</div>
                  </div>
                );
              })}
            </div>
            
            {/* Current Price spread */}
            <div className="my-1.5 py-1.5 border-y border-[#222] flex items-center justify-between px-2">
              <div className={`text-sm font-black font-mono ${activeCoin.price_change_percentage_24h >= 0 ? 'text-emerald-400' : 'text-red-400'} flex items-center gap-1`}>
                {activeCoin.current_price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                {activeCoin.price_change_percentage_24h >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              </div>
              <div className="text-[9px] text-zinc-500 font-mono text-right">
                <span className="text-white">Spread:</span> {(activeCoin.current_price * 0.00015).toFixed(2)}
              </div>
            </div>

            {/* Bids (Green, bottom half) */}
            <div className="flex-1 flex flex-col justify-start overflow-hidden">
              {orderBook.bids.map((bid, i) => {
                const total = bid.price * bid.size;
                const maxTotal = orderBook.bids[0]?.price * orderBook.bids[0]?.size * 2 || 1;
                const widthPct = Math.min((total / maxTotal) * 100, 100);
                return (
                  <div key={`bid-${i}`} className="flex text-[10px] font-mono px-2 py-0.5 hover:bg-white/[0.05] relative group cursor-pointer">
                    <div className="absolute right-0 top-0 bottom-0 bg-emerald-500/10 z-0 transition-all" style={{ width: `${widthPct}%` }} />
                    <div className="flex-1 text-emerald-400 font-semibold z-10">
                      {bid.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </div>
                    <div className="flex-1 text-right text-zinc-300 z-10">{bid.size.toFixed(activeTicker === 'BTC' ? 5 : activeTicker === 'ETH' ? 3 : 1)}</div>
                    <div className="flex-1 text-right text-zinc-500 z-10">₹{(total / 1000).toFixed(1)}K</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CryptoPage;
