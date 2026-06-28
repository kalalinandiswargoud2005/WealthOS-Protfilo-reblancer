import React, { useState, useMemo, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { Search, ChevronRight, TrendingUp, CalendarClock, RefreshCw } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import type { AssetCategory } from '../context/PortfolioContext';

interface FundListItem {
  schemeCode: string;
  ticker: string;
  name: string;
  category: string;
  risk: string;
  cagr3Y: number;
}

const POPULAR_FUNDS: FundListItem[] = [
  { schemeCode: '122639', ticker: 'PP_FLEXI', name: 'Parag Parikh Flexi Cap Fund Direct Growth', category: 'Flexi Cap', risk: 'Very High Risk', cagr3Y: 21.84 },
  { schemeCode: '119798', ticker: 'SBI_BLUE', name: 'SBI Bluechip Fund Direct Growth', category: 'Large Cap', risk: 'High Risk', cagr3Y: 15.42 },
  { schemeCode: '119063', ticker: 'HDFC_INDEX', name: 'HDFC Index Nifty 50 Plan Direct Growth', category: 'Index Fund', risk: 'Moderate Risk', cagr3Y: 13.90 },
  { schemeCode: '120227', ticker: 'ICICI_BLUE', name: 'ICICI Pru Bluechip Fund Direct Growth', category: 'Large Cap', risk: 'High Risk', cagr3Y: 16.12 },
  { schemeCode: '119853', ticker: 'NIPPON_GROWTH', name: 'Nippon India Growth Fund Direct Growth', category: 'Mid Cap', risk: 'Very High Risk', cagr3Y: 23.45 },
  { schemeCode: '120847', ticker: 'QUANT_SMALL', name: 'Quant Small Cap Fund Direct Growth', category: 'Small Cap', risk: 'Very High Risk', cagr3Y: 34.20 },
  { schemeCode: '120503', ticker: 'AXIS_SMALL', name: 'Axis Small Cap Fund Direct Growth', category: 'Small Cap', risk: 'Very High Risk', cagr3Y: 24.80 },
  { schemeCode: '119598', ticker: 'MIRAE_LARGE', name: 'Mirae Asset Large Cap Fund Direct Growth', category: 'Large Cap', risk: 'High Risk', cagr3Y: 14.95 },
  { schemeCode: '135796', ticker: 'TATA_DIGITAL', name: 'Tata Digital India Fund Direct Growth', category: 'Sectoral / Thematic', risk: 'Very High Risk', cagr3Y: 18.25 },
  { schemeCode: '127042', ticker: 'MOTILAL_MID', name: 'Motilal Oswal Midcap Fund Direct Growth', category: 'Mid Cap', risk: 'Very High Risk', cagr3Y: 26.50 },
];

const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const MutualFundsPage: React.FC = () => {
  const { assets, cashBalance, buyAsset } = usePortfolio();
  
  const mfAssets = useMemo(() => assets.filter(a => a.category === 'mutual_funds'), [assets]);

  const [selectedScheme, setSelectedScheme] = useState<string>('122639');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Navigation/Chart live values
  const [liveNavData, setLiveNavData] = useState<{ nav: number; name: string; history: number[] }>({ nav: 0, name: '', history: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [filterOwnedOnly, setFilterOwnedOnly] = useState(false);

  // Form input state
  const [investMode, setInvestMode] = useState<'SIP' | 'ONETIME'>('SIP');
  const [investAmount, setInvestAmount] = useState<number>(5000);
  const [tradeError, setTradeError] = useState<string | null>(null);
  const [tradeSuccess, setTradeSuccess] = useState<string | null>(null);

  const selectedFundDetail = useMemo(() => {
    return POPULAR_FUNDS.find(f => f.schemeCode === selectedScheme) || POPULAR_FUNDS[0];
  }, [selectedScheme]);

  // Find portfolio holdings of the selected fund
  const holding = useMemo(() => {
    return mfAssets.find(a => a.ticker === selectedFundDetail.ticker);
  }, [mfAssets, selectedFundDetail]);

  const ownedUnits = holding ? holding.qty : 0;

  // Fetch real Mutual Fund NAV history and metadata from MFAPI
  useEffect(() => {
    const fetchFundData = async () => {
      setIsLoading(true);
      setIsSyncing(true);
      try {
        const res = await fetch(`http://api.mfapi.in/mf/${selectedScheme}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.data && data.data.length > 0) {
            // Get latest 15 NAV ticks for chart
            const history = data.data
              .slice(0, 15)
              .map((d: any) => parseFloat(d.nav))
              .reverse();
            const currentNav = parseFloat(data.data[0].nav);
            setLiveNavData({
              nav: currentNav,
              name: data.meta.scheme_name || selectedFundDetail.name,
              history: history
            });
          }
        }
      } catch (err) {
        console.warn(`MFAPI fetch failed for scheme ${selectedScheme}, falling back:`, err);
      } finally {
        setIsLoading(false);
        setIsSyncing(false);
      }
    };

    fetchFundData();
  }, [selectedScheme, selectedFundDetail]);

  // Fallback nav if loading or failed
  const currentNav = liveNavData.nav || selectedFundDetail.cagr3Y * 5; // pseudo base NAV
  const navHistory = liveNavData.history.length > 0 ? liveNavData.history : [currentNav * 0.95, currentNav * 0.97, currentNav * 0.99, currentNav];

  // Search filter
  const filteredFunds = useMemo(() => {
    let list = POPULAR_FUNDS;
    if (filterOwnedOnly) {
      list = POPULAR_FUNDS.filter(f => {
        const h = mfAssets.find(a => a.ticker === f.ticker);
        return h && h.qty > 0;
      });
    }
    const q = searchQuery.toLowerCase().trim();
    if (!q) return list;
    return list.filter(f => f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q));
  }, [searchQuery, filterOwnedOnly, mfAssets]);

  // Handle transaction
  const handleInvest = () => {
    setTradeError(null);
    setTradeSuccess(null);
    if (isNaN(investAmount) || investAmount <= 0) {
      setTradeError('Enter a valid amount');
      return;
    }
    if (investAmount > cashBalance) {
      setTradeError(`Insufficient cash. Available: ₹${cashBalance.toLocaleString('en-IN')}`);
      return;
    }

    try {
      const purchasedUnits = investAmount / currentNav;
      buyAsset(
        selectedFundDetail.ticker,
        purchasedUnits,
        currentNav,
        'mutual_funds' as AssetCategory,
        selectedFundDetail.name,
        'units'
      );
      setTradeSuccess(`Successfully invested ₹${investAmount.toLocaleString('en-IN')}! Received ${purchasedUnits.toFixed(4)} units.`);
    } catch (e: any) {
      setTradeError(e.message || 'Transaction failed');
    }
  };

  const chartSeries = useMemo(() => {
    return [{ name: selectedFundDetail.ticker, data: navHistory }];
  }, [selectedFundDetail, navHistory]);

  const chartOptions: ApexOptions = {
    chart: { 
      type: 'area', toolbar: { show: false }, background: 'transparent',
      animations: { dynamicAnimation: { speed: 800 } },
      dropShadow: { enabled: true, top: 15, left: 0, blur: 20, color: '#00b386', opacity: 0.4 }
    },
    colors: ['#00b386'],
    fill: { type: 'gradient', gradient: { shade: 'dark', type: 'vertical', shadeIntensity: 1, gradientToColors: ['#00b386'], opacityFrom: 0.6, opacityTo: 0.0, stops: [0, 100] } },
    stroke: { curve: 'smooth', width: 4, lineCap: 'round' },
    markers: { size: 0, colors: ['#09090b'], strokeColors: '#00b386', strokeWidth: 3, hover: { size: 8 } },
    dataLabels: { enabled: false },
    xaxis: { labels: { show: false }, axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: { show: false },
    grid: { show: false },
    tooltip: { theme: 'dark', y: { formatter: (v: number) => `₹${v.toFixed(2)}` }, marker: { show: false } },
  };

  const totalMfValue = mfAssets.reduce((s, a) => {
    // If current selected fund matches, use the fresh NAV, otherwise the asset's spotPrice
    const match = POPULAR_FUNDS.find(f => f.ticker === a.ticker);
    const nav = (match && match.schemeCode === selectedScheme) ? currentNav : a.spotPrice;
    return s + a.qty * nav;
  }, 0);

  return (
    <div className="flex flex-col h-full bg-[#09090b] text-zinc-300 font-inter">
      {/* Top App Bar */}
      <div className="px-6 py-4 border-b border-[#27272a] bg-[#0d0d0f] flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            Mutual Funds Terminal
            {isSyncing ? <RefreshCw className="w-3.5 h-3.5 text-[#00b386] animate-spin" /> : <div className="w-2 h-2 rounded-full bg-emerald-500"></div>}
          </h1>
          <div className="hidden md:flex gap-6 text-sm font-semibold text-zinc-400">
            <button 
              onClick={() => setFilterOwnedOnly(false)}
              className={`pb-1 transition-all ${!filterOwnedOnly ? 'text-[#00b386] border-b-2 border-[#00b386]' : 'hover:text-white'}`}
            >
              Explore
            </button>
            <button 
              onClick={() => setFilterOwnedOnly(true)}
              className={`pb-1 transition-all ${filterOwnedOnly ? 'text-[#00b386] border-b-2 border-[#00b386]' : 'hover:text-white'}`}
            >
              Holdings ({mfAssets.filter(a => a.qty > 0).length})
            </button>
          </div>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Search mutual funds..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-full bg-zinc-850/50 border border-[#27272a] text-sm focus:outline-none focus:border-[#00b386]/50 transition-all w-64 md:w-80 text-white"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Left Column: Popular Funds Directory */}
          <div className="lg:col-span-1 bg-[#0d0d0f] border border-[#27272a] rounded-2xl p-4 flex flex-col h-[550px] overflow-hidden">
            <h3 className="text-xs font-bold uppercase text-zinc-400 mb-3 tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#00b386]" /> Discover Funds
            </h3>
            
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredFunds.map(fund => {
                const isSel = fund.schemeCode === selectedScheme;
                return (
                  <div 
                    key={fund.schemeCode}
                    onClick={() => {
                      setSelectedScheme(fund.schemeCode);
                      setTradeError(null);
                      setTradeSuccess(null);
                    }}
                    className={`p-3 rounded-xl cursor-pointer transition-all border ${isSel ? 'bg-zinc-800/40 border-[#00b386]' : 'bg-transparent border-transparent hover:bg-zinc-900'}`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-white leading-tight truncate max-w-[150px]">{fund.name}</span>
                      <span className="text-[10px] text-[#00b386] font-semibold">{fund.cagr3Y}%</span>
                    </div>
                    <div className="text-[9px] text-zinc-500 mt-1 flex justify-between">
                      <span>{fund.category}</span>
                      <span>3Y Return</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Center Column: Fund details and Chart */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#0d0d0f] border border-[#27272a] rounded-3xl p-6 shadow-2xl relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-500">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />
              {isLoading && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center rounded-3xl z-10">
                  <RefreshCw className="w-8 h-8 text-[#00b386] animate-spin" />
                </div>
              )}
              
              <div className="flex items-start gap-4 mb-4 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black text-lg">
                  {selectedFundDetail.ticker.slice(0, 2)}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">{liveNavData.name || selectedFundDetail.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded text-zinc-400 font-semibold uppercase">{selectedFundDetail.category}</span>
                    <span className="text-[10px] text-zinc-500 font-semibold">{selectedFundDetail.risk}</span>
                  </div>
                </div>
              </div>

              <div className="mb-2 relative z-10">
                <div className="text-3xl font-black text-white tracking-tight font-mono">
                  {formatPrice(currentNav)}
                </div>
                <div className="text-emerald-400 text-[10px] mt-1 font-bold">
                  LIVE NAV TICK (AMFI) · CODE: {selectedScheme}
                </div>
              </div>

              <div className="h-[280px] -mx-4 relative z-10">
                <ReactApexChart type="area" height="100%" options={chartOptions} series={chartSeries} />
              </div>
            </div>

            {/* Fund metrics */}
            <div className="bg-[#0d0d0f] border border-[#27272a] rounded-2xl p-6">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Fund Facts</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: '3Y Returns (CAGR)', value: `${selectedFundDetail.cagr3Y}%` },
                  { label: 'Fund House', value: selectedFundDetail.name.split(' ')[0] },
                  { label: 'Asset Type', value: 'Equity Growth' },
                  { label: 'Risk Profile', value: selectedFundDetail.risk },
                ].map(fact => (
                  <div key={fact.label}>
                    <div className="text-[10px] text-zinc-500 mb-1">{fact.label}</div>
                    <div className="text-xs font-bold text-zinc-200">{fact.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: SIP Order Panel & User Holdings */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#0d0d0f] border border-[#27272a] rounded-2xl p-6 shadow-xl sticky top-24">
              <div className="flex bg-zinc-850 p-1 rounded-xl mb-4">
                <button 
                  onClick={() => setInvestMode('SIP')}
                  className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${investMode === 'SIP' ? 'bg-[#27272a] text-white shadow' : 'text-zinc-500'}`}
                >
                  Monthly SIP
                </button>
                <button 
                  onClick={() => setInvestMode('ONETIME')}
                  className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${investMode === 'ONETIME' ? 'bg-[#27272a] text-white shadow' : 'text-zinc-500'}`}
                >
                  One-time
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-center">
                    <div className="text-[10px] text-zinc-500 mb-1">Investment Amount</div>
                    <input 
                      type="number" 
                      value={investAmount}
                      onChange={(e) => setInvestAmount(Number(e.target.value))}
                      className="w-full text-center text-2xl font-black text-white bg-transparent border-b border-[#27272a] focus:border-[#00b386] pb-2 outline-none font-mono"
                    />
                  </div>
                </div>

                {investMode === 'SIP' && (
                  <div className="flex items-center justify-between bg-zinc-950 border border-[#222] rounded-xl p-3">
                    <div className="flex items-center gap-2">
                      <CalendarClock className="w-4 h-4 text-[#00b386]" />
                      <span className="text-[10px] text-zinc-400">SIP Cycle Date</span>
                    </div>
                    <span className="text-[10px] font-bold text-white">5th of every month</span>
                  </div>
                )}

                <div className="bg-zinc-950 p-3 rounded-xl border border-[#222] text-xs">
                  <div className="flex justify-between mb-1">
                    <span className="text-zinc-500">Your Holdings:</span>
                    <span className="font-mono text-white">{ownedUnits.toFixed(4)} units</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Current Value:</span>
                    <span className="font-mono text-white">₹{Math.round(ownedUnits * currentNav).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {tradeError && <div className="text-[10px] text-red-400 font-mono text-center">{tradeError}</div>}
                {tradeSuccess && <div className="text-[10px] text-emerald-400 font-mono text-center">{tradeSuccess}</div>}

                <button 
                  onClick={handleInvest}
                  className="w-full py-3.5 bg-[#00b386] hover:bg-[#009973] text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md shadow-[#00b386]/20 flex items-center justify-center gap-1"
                >
                  Confirm {investMode === 'SIP' ? 'SIP' : 'Investment'} <ChevronRight className="w-4 h-4" />
                </button>

                <div className="text-center text-[9px] text-zinc-500">
                  Cash Balance: <span className="font-mono text-white">₹{Math.round(cashBalance).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="bg-[#0d0d0f] border border-[#27272a] rounded-2xl p-5">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-xs font-bold uppercase text-zinc-400 tracking-wider">MF Vault Value</h4>
                <span className="text-xs font-mono font-bold text-white">₹{Math.round(totalMfValue).toLocaleString('en-IN')}</span>
              </div>
              <div className="space-y-2">
                {mfAssets.map(asset => {
                  return (
                    <div 
                      key={asset.ticker}
                      className="flex justify-between p-2 rounded-xl bg-zinc-950 border border-[#222]"
                    >
                      <div>
                        <div className="text-xs font-bold text-white">{asset.ticker}</div>
                        <div className="text-[9px] text-zinc-500">{asset.qty.toFixed(3)} units</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-mono text-zinc-300">₹{Math.round(asset.qty * asset.spotPrice).toLocaleString('en-IN')}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MutualFundsPage;
