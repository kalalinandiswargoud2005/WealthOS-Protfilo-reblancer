import React, { useState, useMemo, useEffect, useRef } from 'react';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { ArrowUpRight, Search, RefreshCw, ChevronLeft, TrendingUp, Compass, Landmark, Briefcase, Award, CalendarClock, LineChart } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import type { AssetCategory } from '../context/PortfolioContext';

const GROWW_API_TOKEN = 'eyJraWQiOiJaTUtjVXciLCJhbGciOiJFUzI1NiJ9.eyJleHAiOjI1NzA0NTI4MTksImlhdCI6MTc4MjA1MjgxOSwibmJmIjoxNzgyMDUyODE5LCJzdWIiOiJ7XCJ0b2tlblJlZklkXCI6XCI1ZmY1MjkwNS05ZTQxLTRlYTMtODc4Ny02Y2U5ZDJlMjUxYzZcIixcInZlbmRvckludGVncmF0aW9uS2V5XCI6XCJlMzFmZjIzYjA4NmI0MDZjODg3NGIyZjZkODQ5NTMxM1wiLFwidXNlckFjY291bnRJZFwiOlwiYWNmNTQ5NDktMTFlYS00Zjk1LTllNjMtN2VkNjY2NDBiYjU5XCIsXCJkZXZpY2VJZFwiOlwiODc1NjdlNGItZTkyMC01NWM0LWIzYzQtNjcwNWNlNzYyYjYwXCIsXCJzZXNzaW9uSWRcIjpcIjE2MGZlOTE2LWQ2ZTQtNGE3MS04M2I4LTVkYTcxNjBkY2MwZlwiLFwiYWRkaXRpb25hbERhdGFcIjpcIno1NC9NZzltdjE2WXdmb0gvS0EwYkRFR1ZWM1ZWSGV5bEJ4VzdiOW0wbVZSTkczdTlLa2pWZDNoWjU1ZStNZERhWXBOVi9UOUxIRmtQejFFQisybTdRPT1cIixcInJvbGVcIjpcImF1dGgtdG90cFwiLFwic291cmNlSXBBZGRyZXNzXCI6XCIxMDMuMjI0LjE1NC41OCwxMDQuMjIuNi4xMzMsMzUuMjQxLjIzLjEyM1wiLFwidHdvRmFFeHBpcnlUc1wiOjI1NzA0NTI4MTk2MTQsXCJ2ZW5kb3JOYW1lXCI6XCJncm93d0FwaVwifSIsImlzcyI6ImFwZXgtYXV0aC1wcm9kLWFwcCJ9.teLIW04S9hs28FKGVCO-hPvCcozYZZeanFh3FCnLCyVr7o01sgkU9OVQpkeKq5ZcybRoVAEX-YKXyXsGyJLJOQ';

interface StockListItem {
  ticker: string;
  name: string;
  industry: string;
  basePrice: number;
  marketCapCr: number;
  pe: number;
  divYield: number;
  volume: string;
  sparkline: number[];
}

const TOP_STOCKS: StockListItem[] = [
  { ticker: 'RELIANCE', name: 'Reliance Industries Ltd', industry: 'Energy / Oil & Gas', basePrice: 2945, marketCapCr: 1998000, pe: 28.5, divYield: 0.8, volume: '45,12,324', sparkline: [2920, 2935, 2910, 2940, 2930, 2945] },
  { ticker: 'TCS', name: 'Tata Consultancy Services Ltd', industry: 'Information Technology', basePrice: 3820, marketCapCr: 1396000, pe: 31.2, divYield: 1.4, volume: '12,45,210', sparkline: [3850, 3830, 3810, 3840, 3805, 3820] },
  { ticker: 'INFY', name: 'Infosys Ltd', industry: 'Information Technology', basePrice: 1580, marketCapCr: 654000, pe: 25.4, divYield: 2.1, volume: '88,99,215', sparkline: [1620, 1600, 1590, 1610, 1570, 1580] },
  { ticker: 'HDFCBANK', name: 'HDFC Bank Ltd', industry: 'Financial Services', basePrice: 1650, marketCapCr: 1256000, pe: 18.2, divYield: 1.1, volume: '1,45,80,240', sparkline: [1670, 1660, 1640, 1665, 1630, 1650] },
  { ticker: 'ICICIBANK', name: 'ICICI Bank Ltd', industry: 'Financial Services', basePrice: 1150, marketCapCr: 805000, pe: 17.6, divYield: 0.9, volume: '75,12,480', sparkline: [1130, 1145, 1135, 1155, 1140, 1150] },
  { ticker: 'BHARTIARTL', name: 'Bharti Airtel Ltd', industry: 'Telecommunication', basePrice: 1380, marketCapCr: 785000, pe: 42.1, divYield: 0.6, volume: '25,60,114', sparkline: [1350, 1362, 1355, 1375, 1368, 1380] },
  { ticker: 'SBIN', name: 'State Bank of India', industry: 'Financial Services', basePrice: 830, marketCapCr: 740000, pe: 11.2, divYield: 1.5, volume: '1,12,45,800', sparkline: [815, 825, 810, 835, 820, 830] },
  { ticker: 'ITC', name: 'ITC Ltd', industry: 'FMCG', basePrice: 425, marketCapCr: 530000, pe: 26.8, divYield: 3.8, volume: '95,12,400', sparkline: [415, 420, 418, 427, 422, 425] },
  { ticker: 'LT', name: 'Larsen & Toubro Ltd', industry: 'Construction & Engineering', basePrice: 3550, marketCapCr: 485000, pe: 38.6, divYield: 0.8, volume: '15,40,110', sparkline: [3510, 3530, 3505, 3540, 3525, 3550] },
  { ticker: 'TATAMOTORS', name: 'Tata Motors Ltd', industry: 'Automobile', basePrice: 960, marketCapCr: 320000, pe: 16.2, divYield: 0.6, volume: '1,24,55,900', sparkline: [930, 945, 935, 955, 940, 960] },
  { ticker: 'TATASTEEL', name: 'Tata Steel Ltd', industry: 'Metals & Mining', basePrice: 168, marketCapCr: 210000, pe: 14.8, divYield: 2.1, volume: '3,80,12,450', sparkline: [162, 165, 163, 167, 166, 168] },
  { ticker: 'JSWSTEEL', name: 'JSW Steel Ltd', industry: 'Metals & Mining', basePrice: 915, marketCapCr: 220000, pe: 22.4, divYield: 0.8, volume: '22,48,900', sparkline: [895, 905, 898, 912, 908, 915] },
  { ticker: 'BAJFINANCE', name: 'Bajaj Finance Ltd', industry: 'Financial Services', basePrice: 6950, marketCapCr: 428000, pe: 30.5, divYield: 0.5, volume: '14,50,000', sparkline: [6850, 6920, 6870, 6940, 6910, 6950] },
  { ticker: 'HCLTECH', name: 'HCL Technologies Ltd', industry: 'Information Technology', basePrice: 1340, marketCapCr: 365000, pe: 26.1, divYield: 3.2, volume: '28,50,000', sparkline: [1310, 1325, 1315, 1335, 1320, 1340] },
  { ticker: 'MARUTI', name: 'Maruti Suzuki India Ltd', industry: 'Automobile', basePrice: 12200, marketCapCr: 385000, pe: 28.2, divYield: 1.1, volume: '4,50,200', sparkline: [12000, 12150, 12050, 12180, 12100, 12200] },
];

const formatPrice = (price: number) => {
  return `₹${price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const StocksPage: React.FC = () => {
  const { assets, cashBalance, buyAsset, sellAsset } = usePortfolio();
  
  const stockAssets = useMemo(() => assets.filter(a => a.category === 'stocks'), [assets]);

  const [view, setView] = useState<'explore' | 'detail'>('explore');
  const [selectedTicker, setSelectedTicker] = useState<string>('RELIANCE');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Tab states for Top Movers
  const [activeMoverTab, setActiveMoverTab] = useState<'gainers' | 'losers' | 'volume'>('gainers');
  
  // Real-time states
  const [livePrices, setLivePrices] = useState<Record<string, { ltp: number; close: number }>>({});
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Order entry states
  const [orderQty, setOrderQty] = useState<string>('1');
  const [tradeError, setTradeError] = useState<string | null>(null);
  const [tradeSuccess, setTradeSuccess] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, []);

  // Search Autocomplete queries
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const res = await fetch(`http://api.groww.in/v1/api/search/v1/entity?q=${encodeURIComponent(searchQuery)}&size=10`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.content) {
            const mapped = data.content
              .filter((item: any) => item.entity_type === 'STOCK' || item.entity_type === 'company')
              .map((item: any) => ({
                ticker: item.ticker || item.title.split(' ')[0].toUpperCase(),
                name: item.title,
                industry: 'NSE Listed Company'
              }));
            
            if (mapped.length > 0) {
              setSearchResults(mapped);
              setShowDropdown(true);
              return;
            }
          }
        }
      } catch (err) {
        console.warn("Groww Auto-suggest API failed, using local fallback search:", err);
      }

      const q = searchQuery.toLowerCase();
      const localMatches = TOP_STOCKS.filter(s => 
        s.name.toLowerCase().includes(q) || s.ticker.toLowerCase().includes(q)
      );
      setSearchResults(localMatches);
      setShowDropdown(true);
    };

    const delayDebounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const selectedStockDetail = useMemo(() => {
    const match = TOP_STOCKS.find(s => s.ticker === selectedTicker);
    if (match) return match;
    
    const matchSearch = searchResults.find(s => s.ticker === selectedTicker);
    if (matchSearch) {
      return {
        ticker: matchSearch.ticker,
        name: matchSearch.name,
        industry: matchSearch.industry,
        basePrice: 1500,
        marketCapCr: 50000,
        pe: 22.4,
        divYield: 1.0,
        volume: '15,22,100',
        sparkline: [1480, 1495, 1490, 1510, 1485, 1500]
      };
    }

    const matchHoldings = stockAssets.find(a => a.ticker === selectedTicker);
    return {
      ticker: selectedTicker,
      name: matchHoldings ? matchHoldings.name : selectedTicker,
      industry: 'NSE Stock',
      basePrice: matchHoldings ? matchHoldings.spotPrice : 1000,
      marketCapCr: 45000,
      pe: 20.0,
      divYield: 1.2,
      volume: '12,50,000',
      sparkline: [980, 995, 990, 1005, 995, 1000]
    };
  }, [selectedTicker, searchResults, stockAssets]);

  const holding = useMemo(() => {
    return stockAssets.find(a => a.ticker === selectedTicker);
  }, [stockAssets, selectedTicker]);

  const ownedQty = holding ? holding.qty : 0;

  // Poll Groww quote for detail view
  useEffect(() => {
    if (view !== 'detail') return;

    const fetchGrowwData = async () => {
      setIsSyncing(true);
      const newLivePrices = { ...livePrices };

      try {
        const res = await fetch(`http://api.groww.in/v1/live-data/quote?exchange=NSE&segment=CASH&trading_symbol=${selectedTicker}`, {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${GROWW_API_TOKEN}`,
            'X-API-VERSION': '1.0'
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.ltp) {
            newLivePrices[selectedTicker] = {
              ltp: data.ltp,
              close: data.close || selectedStockDetail.basePrice
            };
          }
        }
      } catch (err) {
        console.warn(`Groww Quote API failed for ${selectedTicker}, using fallback:`, err);
      }

      if (!newLivePrices[selectedTicker]) {
        const base = selectedStockDetail.basePrice;
        const jitter = (Math.random() - 0.49) * (base * 0.004);
        newLivePrices[selectedTicker] = {
          ltp: parseFloat((base + jitter).toFixed(2)),
          close: base
        };
      }

      setLivePrices(newLivePrices);
      setIsSyncing(false);
    };

    fetchGrowwData();
    const interval = setInterval(fetchGrowwData, 10000);
    return () => clearInterval(interval);
  }, [selectedTicker, selectedStockDetail, view]);

  const currentLive = livePrices[selectedTicker] || { ltp: selectedStockDetail.basePrice, close: selectedStockDetail.basePrice };
  const currentPrice = currentLive.ltp;
  const currentChangePct = ((currentLive.ltp - currentLive.close) / currentLive.close) * 100;
  
  const isUp = currentChangePct >= 0;
  const chartColor = isUp ? '#00b386' : '#eb5b3c';

  // Buy/Sell Order handlers
  const handleBuy = () => {
    setTradeError(null);
    setTradeSuccess(null);
    const qty = parseInt(orderQty);
    if (isNaN(qty) || qty <= 0) {
      setTradeError('Enter a valid quantity');
      return;
    }
    const cost = qty * currentPrice;
    if (cost > cashBalance) {
      setTradeError(`Insufficient balance. Cost: ₹${cost.toLocaleString('en-IN')} vs Available: ₹${cashBalance.toLocaleString('en-IN')}`);
      return;
    }

    try {
      buyAsset(
        selectedTicker,
        qty,
        currentPrice,
        'stocks' as AssetCategory,
        selectedStockDetail.name,
        'shares'
      );
      setTradeSuccess(`Successfully bought ${qty} shares of ${selectedTicker}!`);
    } catch (e: any) {
      setTradeError(e.message || 'Transaction failed');
    }
  };

  const handleSell = () => {
    setTradeError(null);
    setTradeSuccess(null);
    const qty = parseInt(orderQty);
    if (isNaN(qty) || qty <= 0) {
      setTradeError('Enter a valid quantity');
      return;
    }
    if (qty > ownedQty) {
      setTradeError(`Insufficient holdings. You own ${ownedQty} shares`);
      return;
    }

    try {
      sellAsset(selectedTicker, qty, currentPrice);
      setTradeSuccess(`Successfully sold ${qty} shares of ${selectedTicker}!`);
    } catch (e: any) {
      setTradeError(e.message || 'Transaction failed');
    }
  };

  // Sparkline generator helper
  const getSparklineOptions = (color: string): ApexOptions => ({
    chart: { type: 'line', sparkline: { enabled: true }, animations: { enabled: false } },
    stroke: { curve: 'smooth', width: 1.5 },
    colors: [color],
    tooltip: { enabled: false }
  });

  const chartSeries = useMemo(() => {
    const base = selectedStockDetail.basePrice;
    let val = base * 0.98;
    const history = Array.from({ length: 15 }).map(() => {
      val = val * (1 + (Math.random() - 0.5) * 0.01);
      return parseFloat(val.toFixed(2));
    });
    history.push(currentPrice);
    return [{ name: selectedTicker, data: history }];
  }, [selectedStockDetail, currentPrice, selectedTicker]);

  const chartOptions: ApexOptions = {
    chart: { type: 'line', toolbar: { show: false }, background: 'transparent' },
    colors: [chartColor],
    stroke: { curve: 'smooth', width: 2.5 },
    xaxis: { labels: { show: false }, axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: { show: false },
    grid: { show: false },
    dataLabels: { enabled: false },
    tooltip: { theme: 'dark', y: { formatter: (v: number) => `₹${v.toFixed(2)}` }, marker: { show: false } },
  };

  const totalStocksValue = stockAssets.reduce((s, a) => {
    const live = livePrices[a.ticker]?.ltp || a.spotPrice;
    return s + a.qty * live;
  }, 0);

  // Mover lists based on selection
  const moversList = useMemo(() => {
    if (activeMoverTab === 'gainers') {
      return [
        { ticker: 'TATAMOTORS', name: 'Tata Motors', price: 968.80, change: 21.35, pct: 6.18, up: true, volume: '1,20,44,120', sparkline: [920, 930, 940, 948, 968] },
        { ticker: 'TATASTEEL', name: 'Tata Steel', price: 169.50, change: 5.75, pct: 2.22, up: true, volume: '3,10,48,220', sparkline: [162, 164, 163, 166, 169] },
        { ticker: 'BHARTIARTL', name: 'Bharti Airtel', price: 1910.80, change: 36.00, pct: 1.92, up: true, volume: '44,22,110', sparkline: [1870, 1890, 1880, 1900, 1910] },
        { ticker: 'RELIANCE', name: 'Reliance Industries', price: 2948.50, change: 18.30, pct: 0.62, up: true, volume: '48,99,200', sparkline: [2920, 2930, 2925, 2940, 2948] },
      ];
    } else if (activeMoverTab === 'losers') {
      return [
        { ticker: 'INFY', name: 'Infosys', price: 1530.15, change: -76.10, pct: -6.75, up: false, volume: '95,12,480', sparkline: [1610, 1590, 1580, 1550, 1530] },
        { ticker: 'HDFCBANK', name: 'HDFC Bank', price: 1618.50, change: -18.60, pct: -1.40, up: false, volume: '1,12,00,000', sparkline: [1640, 1630, 1625, 1620, 1618] },
        { ticker: 'TCS', name: 'Tata Consultancy Svcs', price: 3810.00, change: -45.10, pct: -1.18, up: false, volume: '18,50,000', sparkline: [3860, 3840, 3830, 3815, 3810] },
        { ticker: 'ICICIBANK', name: 'ICICI Bank', price: 1145.20, change: -8.40, pct: -0.73, up: false, volume: '62,40,110', sparkline: [1155, 1150, 1148, 1146, 1145] },
      ];
    } else {
      return [
        { ticker: 'TATASTEEL', name: 'Tata Steel', price: 169.50, change: 5.75, pct: 2.22, up: true, volume: '4,78,99,182', sparkline: [162, 164, 163, 166, 169] },
        { ticker: 'ZOMATO', name: 'Zomato Ltd', price: 264.30, change: 5.75, pct: 2.22, up: true, volume: '2,90,61,365', sparkline: [250, 255, 258, 260, 264] },
        { ticker: 'INDHOTEL', name: 'Indian Hotels Co', price: 724.75, change: 14.30, pct: 2.01, up: true, volume: '31,77,687', sparkline: [710, 715, 712, 720, 724] },
        { ticker: 'BHARTIARTL', name: 'Bharti Airtel', price: 1910.80, change: 36.00, pct: 1.92, up: true, volume: '1,59,18,432', sparkline: [1870, 1890, 1880, 1900, 1910] },
      ];
    }
  }, [activeMoverTab]);

  return (
    <div className="flex flex-col h-full bg-[#09090b] text-zinc-300 font-inter">
      {/* Groww Top App Bar */}
      <div className="px-6 py-4 border-b border-[#27272a] bg-[#0d0d0f] flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            Stocks Terminal
            {isSyncing ? <RefreshCw className="w-3.5 h-3.5 text-[#00b386] animate-spin" /> : <div className="w-2 h-2 rounded-full bg-emerald-500"></div>}
          </h1>
          <div className="hidden md:flex gap-6 text-sm font-semibold text-zinc-400">
            <button 
              onClick={() => setView('explore')}
              className={`pb-1 transition-all ${view === 'explore' ? 'text-[#00b386] border-b-2 border-[#00b386]' : 'hover:text-white'}`}
            >
              Explore
            </button>
            <button 
              onClick={() => {
                if (stockAssets.length > 0) {
                  setSelectedTicker(stockAssets[0].ticker);
                  setView('detail');
                } else {
                  setView('explore');
                }
              }}
              className={`pb-1 transition-all ${view === 'detail' ? 'text-[#00b386] border-b-2 border-[#00b386]' : 'hover:text-white'}`}
            >
              Holdings ({stockAssets.length})
            </button>
          </div>
        </div>

        {/* Search bar dropdown */}
        <div className="relative" ref={dropdownRef}>
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Search Groww..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => { if (searchResults.length > 0) setShowDropdown(true); }}
            className="pl-10 pr-4 py-2 rounded-full bg-zinc-850/50 border border-[#27272a] text-sm focus:outline-none focus:border-[#00b386]/50 transition-all w-64 md:w-80 text-white"
          />
          {showDropdown && searchResults.length > 0 && (
            <div className="absolute right-0 mt-2 w-85 bg-[#121214] border border-[#27272a] rounded-xl shadow-2xl z-30 max-h-80 overflow-y-auto p-2">
              <div className="text-[10px] text-zinc-500 uppercase font-bold px-3 py-1.5 border-b border-[#222]">Search Results</div>
              {searchResults.map(stock => (
                <div
                  key={stock.ticker}
                  onClick={() => {
                    setSelectedTicker(stock.ticker);
                    setView('detail');
                    setShowDropdown(false);
                    setSearchQuery('');
                    setTradeError(null);
                    setTradeSuccess(null);
                  }}
                  className="flex justify-between items-center px-3 py-2 hover:bg-zinc-800/50 rounded-lg cursor-pointer animate-fade-in"
                >
                  <div>
                    <div className="text-xs font-bold text-white">{stock.ticker}</div>
                    <div className="text-[10px] text-zinc-500 truncate max-w-[180px]">{stock.name}</div>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#00b386]" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {view === 'explore' ? (
          /* EXPLORE VIEW (GROWW HOMEPAGE) */
          <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
            
            {/* Market Indices ticker row */}
            <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {[
                { name: 'NIFTY 50', val: '24,013.10', chg: '-154.90', pct: '-0.64%', up: false },
                { name: 'SENSEX', val: '76,802.90', chg: '-607.08', pct: '-0.78%', up: false },
                { name: 'BANKNIFTY', val: '57,695.75', chg: '-278.05', pct: '-0.48%', up: false },
                { name: 'MIDCPNIFTY', val: '14,618.95', chg: '+23.30', pct: '+0.16%', up: true },
                { name: 'FINNIFTY', val: '26,431.15', chg: '-110.15', pct: '-0.42%', up: false },
              ].map(index => (
                <div key={index.name} className="flex-shrink-0 bg-[#0d0d0f] border border-[#27272a] rounded-xl px-4 py-2.5 flex flex-col justify-between w-48 shadow-lg shadow-black/25">
                  <span className="text-[10px] font-bold text-zinc-500">{index.name}</span>
                  <div className="flex items-baseline gap-2 mt-1.5">
                    <span className="text-sm font-bold text-white font-mono">{index.val}</span>
                    <span className={`text-[10px] font-mono font-bold ${index.up ? 'text-[#00b386]' : 'text-[#eb5b3c]'}`}>
                      {index.chg} ({index.pct})
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Sector Hero Area Chart */}
            <div className="bg-[#0d0d0f] border border-[#27272a] rounded-3xl p-6 shadow-2xl relative overflow-hidden group hover:border-indigo-500/30 transition-all duration-500">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors pointer-events-none" />
              <div className="flex justify-between items-start mb-2 relative z-10">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <LineChart className="w-5 h-5 text-indigo-400" /> NIFTY 50 Benchmark Velocity
                  </h2>
                  <p className="text-xs text-zinc-500 mt-1">Live simulation of Indian Equities performance index</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-white font-mono">24,013.10</div>
                  <div className="text-xs font-bold text-emerald-400 mt-1">+1.24% Today</div>
                </div>
              </div>
              <div className="-mx-2 mt-4 relative z-10">
                <ReactApexChart 
                  type="area" height={220}
                  options={{
                    chart: { type: 'area', toolbar: { show: false }, background: 'transparent', animations: { dynamicAnimation: { speed: 800 } }, dropShadow: { enabled: true, top: 15, left: 0, blur: 20, color: '#6366f1', opacity: 0.4 } },
                    colors: ['#6366f1'],
                    fill: { type: 'gradient', gradient: { shade: 'dark', type: 'vertical', shadeIntensity: 1, gradientToColors: ['#818cf8', '#a5b4fc'], opacityFrom: 0.7, opacityTo: 0.0, stops: [0, 50, 100] } },
                    stroke: { curve: 'smooth', width: 4, lineCap: 'round' },
                    markers: { size: 0, colors: ['#09090b'], strokeColors: '#6366f1', strokeWidth: 3, hover: { size: 7 } },
                    xaxis: { labels: { show: false }, axisBorder: { show: false }, axisTicks: { show: false }, tooltip: { enabled: false } },
                    yaxis: { show: false },
                    grid: { show: false },
                    dataLabels: { enabled: false },
                    tooltip: { theme: 'dark', y: { formatter: (v) => `₹${v.toFixed(2)}` } }
                  }}
                  series={[{ name: 'NIFTY 50', data: Array.from({length: 30}, (_, i) => 23000 + (Math.sin(i / 3) * 500) + (i * 30) + Math.random() * 200) }]}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2/3 Content Column */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Most bought stocks on Groww */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h2 className="text-sm font-bold uppercase text-zinc-400 tracking-wider">Most bought stocks on WealthOS</h2>
                    <span className="text-[11px] text-[#00b386] font-semibold cursor-pointer hover:underline">See more</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { ticker: 'INFY', name: 'Infosys', price: 1051.40, change: -76.10, pct: -6.75, up: false },
                      { ticker: 'NEWINDIA', name: 'New India Assurance', price: 202.31, change: 23.64, pct: 13.23, up: true },
                      { ticker: 'TATSILV', name: 'TATSILV', price: 22.48, change: -0.86, pct: -3.68, up: false },
                      { ticker: 'IFCI', name: 'IFCI', price: 85.73, change: 3.42, pct: 4.16, up: true },
                    ].map(stock => (
                      <div 
                        key={stock.ticker}
                        onClick={() => {
                          setSelectedTicker(stock.ticker);
                          setView('detail');
                        }}
                        className="bg-[#0d0d0f] border border-[#27272a] hover:border-zinc-500 rounded-2xl p-4 cursor-pointer transition-all flex flex-col justify-between h-32 shadow-xl hover:shadow-black/60 group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-[10px] font-black text-white group-hover:scale-105 transition-transform">
                            {stock.ticker.slice(0, 2)}
                          </div>
                          <ArrowUpRight className="w-4 h-4 text-zinc-700 group-hover:text-white transition-colors" />
                        </div>
                        <div className="mt-3">
                          <div className="text-xs font-bold text-white truncate">{stock.name}</div>
                          <div className="text-[11px] font-mono text-zinc-400 mt-1">₹{stock.price.toFixed(2)}</div>
                          <div className={`text-[10px] font-bold ${stock.up ? 'text-[#00b386]' : 'text-[#eb5b3c]'}`}>
                            {stock.change > 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.pct}%)
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top movers today */}
                <div className="bg-[#0d0d0f] border border-[#27272a] rounded-2xl p-5 shadow-xl">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-[#222] pb-3 mb-4">
                    <h2 className="text-sm font-bold uppercase text-zinc-400 tracking-wider">Top Movers Today</h2>
                    <div className="flex bg-zinc-950 p-0.5 rounded-lg border border-[#222]">
                      {[
                        { id: 'gainers', label: 'Gainers' },
                        { id: 'losers', label: 'Losers' },
                        { id: 'volume', label: 'Volume Shockers' }
                      ].map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveMoverTab(tab.id as any)}
                          className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${activeMoverTab === tab.id ? 'bg-zinc-850 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="divide-y divide-[#222]">
                    {moversList.map(stock => {
                      const color = stock.up ? '#00b386' : '#eb5b3c';
                      return (
                        <div 
                          key={stock.ticker}
                          onClick={() => {
                            setSelectedTicker(stock.ticker);
                            setView('detail');
                          }}
                          className="py-3 flex items-center justify-between hover:bg-zinc-800/10 cursor-pointer rounded-lg px-2 transition-colors"
                        >
                          <div className="flex items-center gap-3 w-1/3">
                            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-[10px] font-black text-white">
                              {stock.ticker.slice(0, 2)}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-white">{stock.name}</div>
                              <div className="text-[9px] text-zinc-500">{stock.ticker}</div>
                            </div>
                          </div>
                          
                          {/* Sparkline */}
                          <div className="w-20 h-8">
                            <ReactApexChart 
                              options={getSparklineOptions(color)} 
                              series={[{ data: stock.sparkline }]} 
                              type="line" 
                              height="100%" 
                            />
                          </div>

                          <div className="text-right">
                            <div className="text-xs font-mono font-bold text-white">₹{stock.price.toFixed(2)}</div>
                            <div className={`text-[10px] font-bold ${stock.up ? 'text-[#00b386]' : 'text-[#eb5b3c]'}`}>
                              {stock.change > 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.pct}%)
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Sectors trending today */}
                <div className="bg-[#0d0d0f] border border-[#27272a] rounded-2xl p-5 shadow-xl">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-sm font-bold uppercase text-zinc-400 tracking-wider">Sectors Trending Today</h2>
                    <span className="text-[11px] text-[#00b386] font-semibold cursor-pointer hover:underline">See all sectors</span>
                  </div>

                  <div className="space-y-4">
                    {[
                      { sector: 'Water Distribution', gainers: 7, losers: 2, pct: '+5.25%', up: true },
                      { sector: 'Education', gainers: 17, losers: 18, pct: '+3.84%', up: true },
                      { sector: 'Bearings', gainers: 8, losers: 3, pct: '+2.91%', up: true },
                      { sector: 'Footwear', gainers: 7, losers: 6, pct: '-2.27%', up: false },
                      { sector: 'Information Technology', gainers: 102, losers: 130, pct: '-3.01%', up: false },
                      { sector: 'Auto Retail', gainers: 3, losers: 4, pct: '-3.45%', up: false }
                    ].map(sec => {
                      const total = sec.gainers + sec.losers;
                      const gainerRatio = (sec.gainers / total) * 100;
                      return (
                        <div key={sec.sector} className="flex items-center justify-between gap-4 py-1">
                          <div className="w-1/3">
                            <div className="text-xs font-bold text-white">{sec.sector}</div>
                            <div className="text-[9px] text-zinc-500 mt-0.5">{sec.gainers} Gainers · {sec.losers} Losers</div>
                          </div>

                          <div className="flex-1 h-1.5 rounded-full bg-zinc-800 flex overflow-hidden max-w-[200px]">
                            <div className="bg-[#00b386]" style={{ width: `${gainerRatio}%` }} />
                            <div className="bg-[#eb5b3c]" style={{ width: `${100 - gainerRatio}%` }} />
                          </div>

                          <div className={`text-xs font-bold font-mono text-right w-16 ${sec.up ? 'text-[#00b386]' : 'text-[#eb5b3c]'}`}>
                            {sec.pct}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Right 1/3 Sidebar Column */}
              <div className="space-y-6">
                
                {/* Your Investments Card */}
                <div className="bg-[#0d0d0f] border border-[#27272a] rounded-2xl p-5 shadow-xl">
                  <h3 className="text-xs font-bold uppercase text-zinc-400 tracking-wider mb-4">Your Investments</h3>
                  {stockAssets.length > 0 ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] text-zinc-500">Current Value:</span>
                        <span className="text-sm font-mono font-bold text-white">₹{Math.round(totalStocksValue).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] text-zinc-500">Holdings:</span>
                        <span className="text-sm font-bold text-zinc-300">{stockAssets.length} Stocks</span>
                      </div>
                      <button 
                        onClick={() => {
                          setSelectedTicker(stockAssets[0].ticker);
                          setView('detail');
                        }}
                        className="w-full py-2 bg-[#00b386]/10 text-[#00b386] border border-[#00b386]/20 rounded-xl text-xs font-bold hover:bg-[#00b386]/20 transition-all"
                      >
                        View Holdings Dashboard
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <div className="w-12 h-12 rounded-full bg-zinc-950 flex items-center justify-center mx-auto mb-3 border border-[#222]">
                        <Briefcase className="w-5 h-5 text-zinc-600" />
                      </div>
                      <div className="text-xs font-bold text-white">You haven't invested yet</div>
                      <p className="text-[10px] text-zinc-500 mt-1 max-w-[200px] mx-auto">Explore popular Nifty stocks to place your first trade.</p>
                    </div>
                  )}
                </div>

                {/* Products & Tools */}
                <div className="bg-[#0d0d0f] border border-[#27272a] rounded-2xl p-5 shadow-xl">
                  <h3 className="text-xs font-bold uppercase text-zinc-400 tracking-wider mb-4">Products & Tools</h3>
                  <div className="space-y-3">
                    {[
                      { icon: Compass, label: 'IPO', count: '7 open', color: 'text-amber-400', bg: 'bg-amber-400/10' },
                      { icon: Landmark, label: 'Bonds', count: '12 open', color: 'text-blue-400', bg: 'bg-blue-400/10' },
                      { icon: Briefcase, label: 'ETFs', count: null, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                      { icon: TrendingUp, label: 'Intraday Screener', count: null, color: 'text-rose-400', bg: 'bg-rose-400/10' },
                      { icon: CalendarClock, label: 'Stocks SIP', count: null, color: 'text-purple-400', bg: 'bg-purple-400/10' },
                      { icon: Award, label: 'All Stocks Screener', count: null, color: 'text-teal-400', bg: 'bg-teal-400/10' }
                    ].map((tool, i) => (
                      <div key={i} className="flex items-center justify-between p-2 hover:bg-zinc-800/20 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-[#222]">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tool.bg}`}>
                            <tool.icon className={`w-4 h-4 ${tool.color}`} />
                          </div>
                          <span className="text-xs font-bold text-zinc-200">{tool.label}</span>
                        </div>
                        {tool.count && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-850 text-zinc-400 font-mono font-bold border border-[#222]">
                            {tool.count}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trading Screens */}
                <div className="bg-[#0d0d0f] border border-[#27272a] rounded-2xl p-5 shadow-xl">
                  <h3 className="text-xs font-bold uppercase text-zinc-400 tracking-wider mb-4">Trading screens</h3>
                  <div className="space-y-3">
                    {[
                      { strategy: 'Resistance breakouts', trend: 'Bullish', color: 'text-[#00b386] bg-[#00b386]/10' },
                      { strategy: 'MACD above signal line', trend: 'Bullish', color: 'text-[#00b386] bg-[#00b386]/10' },
                      { strategy: 'RSI overbought', trend: 'Bearish', color: 'text-[#eb5b3c] bg-[#eb5b3c]/10' },
                      { strategy: 'RSI oversold', trend: 'Bullish', color: 'text-[#00b386] bg-[#00b386]/10' }
                    ].map((screen, i) => (
                      <div key={i} className="p-3 rounded-xl bg-zinc-950 border border-[#222] hover:border-zinc-650 cursor-pointer flex justify-between items-center transition-all">
                        <div>
                          <div className="text-xs font-bold text-white">{screen.strategy}</div>
                          <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded mt-1.5 ${screen.color}`}>
                            {screen.trend}
                          </span>
                        </div>
                        <ArrowUpRight className="w-3.5 h-3.5 text-zinc-600" />
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

          </div>
        ) : (
          /* TRADING DETAIL VIEW */
          <div className="max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Back to Explore button */}
            <div className="lg:col-span-4 flex items-center justify-between pb-2 border-b border-[#222]">
              <button 
                onClick={() => setView('explore')}
                className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-all font-semibold"
              >
                <ChevronLeft className="w-4 h-4" /> Back to Explore
              </button>
            </div>

            {/* Left Column: Stocks Directory catalog */}
            <div className="lg:col-span-1 bg-[#0d0d0f] border border-[#27272a] rounded-2xl p-4 flex flex-col h-[520px] overflow-hidden">
              <h3 className="text-xs font-bold uppercase text-zinc-400 mb-3 tracking-wider">Catalog</h3>
              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                {TOP_STOCKS.map(stock => {
                  const isSel = stock.ticker === selectedTicker;
                  return (
                    <div
                      key={stock.ticker}
                      onClick={() => {
                        setSelectedTicker(stock.ticker);
                        setTradeError(null);
                        setTradeSuccess(null);
                      }}
                      className={`p-2.5 rounded-xl cursor-pointer transition-all border ${isSel ? 'bg-zinc-800/40 border-[#00b386]' : 'bg-transparent border-transparent hover:bg-zinc-900'}`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-black text-white">{stock.ticker}</span>
                        <span className="text-[10px] text-zinc-500 font-mono">₹{stock.basePrice}</span>
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-0.5 truncate">{stock.name}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Center Column: Chart & Fundamentals */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[#0d0d0f] border border-[#27272a] rounded-2xl p-6 shadow-xl">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg">
                      {selectedTicker.slice(0, 2)}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white tracking-tight">{selectedStockDetail.name}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-zinc-800 px-2 py-0.5 rounded text-zinc-400 font-semibold">{selectedTicker}</span>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest">{selectedStockDetail.industry}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-2">
                  <div className="text-3xl font-black text-white tracking-tight font-mono">
                    {formatPrice(currentPrice)}
                  </div>
                  <div className={`flex items-center gap-1.5 text-xs font-bold mt-1 ${isUp ? 'text-[#00b386]' : 'text-[#eb5b3c]'}`}>
                    {isUp ? '+' : ''}{(currentPrice - currentLive.close).toFixed(2)} ({isUp ? '+' : ''}{currentChangePct.toFixed(2)}%)
                    <span className="text-zinc-500 text-[10px] font-normal ml-1">Today</span>
                  </div>
                </div>

                <div className="h-[280px] -mx-4">
                  <ReactApexChart type="line" height="100%" options={chartOptions} series={chartSeries} />
                </div>
              </div>

              <div className="bg-[#0d0d0f] border border-[#27272a] rounded-2xl p-6">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Key Fundamentals</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Market Cap', value: `₹${(selectedStockDetail.marketCapCr / 100).toFixed(1)}B Cr` },
                    { label: 'P/E Ratio', value: selectedStockDetail.pe.toFixed(2) },
                    { label: 'Div Yield', value: `${selectedStockDetail.divYield.toFixed(2)}%` },
                    { label: 'NSE Ticker', value: selectedTicker },
                  ].map(f => (
                    <div key={f.label}>
                      <div className="text-[10px] text-zinc-500 mb-1">{f.label}</div>
                      <div className="text-xs font-bold text-zinc-200">{f.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Order Entry & Vault */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-[#0d0d0f] border border-[#27272a] rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between border-b border-[#27272a] pb-3 mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-white border-b-2 border-[#00b386] pb-3 -mb-4">Delivery Order</span>
                  <span className="text-[10px] text-zinc-500 font-mono">Cash: ₹{Math.round(cashBalance).toLocaleString('en-IN')}</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] text-zinc-500 block mb-1">Quantity (shares)</label>
                    <input 
                      type="number" 
                      value={orderQty} 
                      onChange={e => setOrderQty(e.target.value)}
                      className="w-full bg-zinc-900 border border-[#27272a] rounded-xl px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-[#00b386]" 
                    />
                  </div>

                  <div className="bg-zinc-950 p-3 rounded-xl border border-[#222]">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-500">Estimated Cost:</span>
                      <span className="font-mono text-white">₹{(parseInt(orderQty) * currentPrice || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-500">Your Holdings:</span>
                      <span className="font-mono text-white">{ownedQty} shares</span>
                    </div>
                  </div>

                  {tradeError && <div className="text-[10px] text-red-400 font-mono">{tradeError}</div>}
                  {tradeSuccess && <div className="text-[10px] text-emerald-400 font-mono">{tradeSuccess}</div>}

                  <div className="flex gap-2 pt-2">
                    <button 
                      onClick={handleBuy}
                      className="flex-1 py-3 bg-[#00b386] hover:bg-[#009973] text-white text-xs font-black rounded-xl transition-all uppercase tracking-widest shadow-md shadow-[#00b386]/20"
                    >
                      BUY
                    </button>
                    <button 
                      onClick={handleSell}
                      className="flex-1 py-3 bg-[#eb5b3c] hover:bg-[#d54e32] text-white text-xs font-black rounded-xl transition-all uppercase tracking-widest shadow-md shadow-[#eb5b3c]/20"
                    >
                      SELL
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-[#0d0d0f] border border-[#27272a] rounded-2xl p-5">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-xs font-bold uppercase text-zinc-400 tracking-wider">Stocks Vault</h4>
                  <span className="text-xs font-mono font-bold text-white">₹{Math.round(totalStocksValue).toLocaleString('en-IN')}</span>
                </div>
                <div className="space-y-2">
                  {stockAssets.map(asset => {
                    const live = livePrices[asset.ticker]?.ltp || asset.spotPrice;
                    return (
                      <div 
                        key={asset.ticker}
                        onClick={() => setSelectedTicker(asset.ticker)}
                        className={`flex justify-between p-2 rounded-xl bg-zinc-950 border border-[#222] cursor-pointer hover:border-zinc-500 transition-colors ${selectedTicker === asset.ticker ? 'border-[#00b386]' : ''}`}
                      >
                        <div>
                          <div className="text-xs font-bold text-white">{asset.ticker}</div>
                          <div className="text-[9px] text-zinc-500">{asset.qty} shares</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-mono text-zinc-300">₹{Math.round(asset.qty * live).toLocaleString('en-IN')}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default StocksPage;
