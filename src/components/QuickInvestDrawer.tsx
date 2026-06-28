import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Zap, PlusCircle, TrendingUp, TrendingDown, DollarSign, Search } from 'lucide-react';
import { usePortfolio, type AssetCategory } from '../context/PortfolioContext';

interface Props { open: boolean; onClose: () => void; }

const CATEGORY_META: Record<AssetCategory, { label: string; color: string }> = {
  metals:       { label: 'Metals',       color: '#f59e0b' },
  stocks:       { label: 'Stocks',       color: '#6366f1' },
  mutual_funds: { label: 'Mutual Funds', color: '#34d399' },
  crypto:       { label: 'Crypto',       color: '#f43f5e' },
};

const formatPrice = (price: number) => {
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)}L`;
  if (price >= 1000) return `₹${price.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  return `₹${price.toFixed(2)}`;
};

const QuickInvestDrawer: React.FC<Props> = ({ open, onClose }) => {
  const { assets, cashBalance, depositCash, quickBuy } = usePortfolio();
  const [activeTab, setActiveTab] = useState<'deposit' | 'buy'>('deposit');
  const [depositAmount, setDepositAmount] = useState('');
  const [buyTicker, setBuyTicker] = useState(assets[0].ticker);
  const [buyAmount, setBuyAmount] = useState('');
  const [search, setSearch] = useState('');
  const [success, setSuccess] = useState('');

  if (!open) return null;

  const filteredAssets = assets.filter(a =>
    a.ticker.toLowerCase().includes(search.toLowerCase()) ||
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDeposit = () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) return;
    if (amount < 10 || amount > 1000000) {
      setSuccess('Limit exceeded: Amount must be between ₹10 and ₹10,00,000 (10 Lakhs).');
      setTimeout(() => setSuccess(''), 4000);
      return;
    }
    depositCash(amount);
    setSuccess(`₹${amount.toLocaleString('en-IN')} deposited successfully!`);
    setDepositAmount('');
    setTimeout(() => setSuccess(''), 3000);
  };

  const selectedAsset = assets.find(a => a.ticker === buyTicker) || assets[0];

  const handleBuy = () => {
    const amount = parseFloat(buyAmount);
    if (isNaN(amount) || amount <= 0 || amount > cashBalance) return;
    if (amount < 10 || amount > 1000000) {
      setSuccess('Limit exceeded: Order amount must be between ₹10 and ₹10,00,000 (10 Lakhs).');
      setTimeout(() => setSuccess(''), 4000);
      return;
    }
    quickBuy(buyTicker, amount);
    const units = (amount / selectedAsset.spotPrice);
    const unitsStr = units < 0.01 ? units.toFixed(6) : units.toFixed(4);
    setSuccess(`Bought ${unitsStr} ${selectedAsset.unit} of ${buyTicker}!`);
    setBuyAmount('');
    setTimeout(() => setSuccess(''), 3000);
  };

  return createPortal(
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-[#0D0D0F] border-l border-[#27272A] z-50 drawer-enter flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#27272A]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Quick Invest</h2>
              <p className="text-xs text-zinc-500">16 assets · Live prices</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-zinc-400" />
          </button>
        </div>

        {/* Cash Balance */}
        <div className="mx-5 mt-4 rounded-xl bg-[#141413] border border-[#27272A] p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-3.5 h-3.5 text-zinc-500" />
            <span className="text-xs text-zinc-500">Available Cash</span>
          </div>
          <div className="text-base font-bold text-white">₹{cashBalance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
        </div>

        {/* Tabs */}
        <div className="flex mx-5 mt-4 rounded-lg bg-[#141413] border border-[#27272A] p-1">
          {(['deposit', 'buy'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-md text-xs font-semibold transition-all ${activeTab === tab ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-zinc-400 hover:text-white'}`}>
              {tab === 'deposit' ? '+ Deposit Cash' : '⚡ Quick Buy'}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-5 mt-4 space-y-4">
          {activeTab === 'deposit' ? (
            <>
              <div>
                <label className="block text-[10px] text-zinc-500 mb-2 font-medium uppercase tracking-wider">Amount (₹)</label>
                <input type="number" value={depositAmount} onChange={e => setDepositAmount(e.target.value)}
                  placeholder="Enter amount..."
                  className="w-full bg-[#141413] border border-[#27272A] rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-amber-500/50 placeholder:text-zinc-600" />
              </div>
              <div>
                <label className="block text-[10px] text-zinc-500 mb-2 font-medium">Quick Select</label>
                <div className="grid grid-cols-3 gap-2">
                  {[5000, 10000, 25000, 50000, 100000, 200000].map(amt => (
                    <button key={amt} onClick={() => setDepositAmount(String(amt))}
                      className="py-2 rounded-lg bg-[#141413] border border-[#27272A] text-xs text-zinc-300 hover:border-amber-500/40 hover:text-amber-400 transition-all">
                      ₹{amt >= 100000 ? `${amt / 100000}L` : amt >= 1000 ? `${amt / 1000}K` : amt}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={handleDeposit}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold text-sm hover:from-amber-400 hover:to-orange-400 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2">
                <PlusCircle className="w-4 h-4" /> Deposit to Portfolio
              </button>
            </>
          ) : (
            <>
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search assets..."
                  className="w-full bg-[#141413] border border-[#27272A] rounded-lg pl-9 pr-4 py-2.5 text-white text-sm outline-none focus:border-amber-500/50 placeholder:text-zinc-600" />
              </div>

              {/* Asset List */}
              <div className="space-y-1 max-h-52 overflow-y-auto">
                {(Object.keys(CATEGORY_META) as AssetCategory[]).map(cat => {
                  const catAssets = filteredAssets.filter(a => a.category === cat);
                  if (!catAssets.length) return null;
                  return (
                    <div key={cat}>
                      <div className="text-[9px] text-zinc-600 uppercase tracking-widest font-semibold px-1 py-1.5" style={{ color: CATEGORY_META[cat].color }}>
                        {CATEGORY_META[cat].label}
                      </div>
                      {catAssets.map(asset => (
                        <button key={asset.ticker} onClick={() => setBuyTicker(asset.ticker)}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all border mb-1
                            ${buyTicker === asset.ticker ? 'border-amber-500/40 bg-amber-500/5' : 'border-transparent hover:bg-white/5'}`}>
                          <div className="text-left">
                            <div className="text-xs font-bold text-white">{asset.ticker}</div>
                            <div className="text-[9px] text-zinc-500">{asset.name}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-mono text-white">{formatPrice(asset.spotPrice)}</div>
                            <div className={`text-[9px] font-semibold ${asset.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {asset.change24h >= 0 ? <TrendingUp className="w-2.5 h-2.5 inline" /> : <TrendingDown className="w-2.5 h-2.5 inline" />}
                              {' '}{asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>

              {/* Selected asset info */}
              {selectedAsset && (
                <div className="rounded-lg bg-[#141413] border border-[#27272A] p-3 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-zinc-500">{selectedAsset.name}</div>
                    <div className="text-sm font-bold text-white">{formatPrice(selectedAsset.spotPrice)}/{selectedAsset.unit}</div>
                  </div>
                  <div className={`text-xs font-semibold ${selectedAsset.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {selectedAsset.change24h >= 0 ? '+' : ''}{selectedAsset.change24h.toFixed(2)}%
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[10px] text-zinc-500 mb-2 uppercase tracking-wider">Invest Amount (₹)</label>
                <input type="number" value={buyAmount} onChange={e => setBuyAmount(e.target.value)}
                  placeholder="Enter amount..." max={cashBalance}
                  className="w-full bg-[#141413] border border-[#27272A] rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-amber-500/50 placeholder:text-zinc-600" />
                {buyAmount && selectedAsset && !isNaN(parseFloat(buyAmount)) && (
                  <div className="mt-1 text-xs text-zinc-500">
                    ≈ {(parseFloat(buyAmount) / selectedAsset.spotPrice) < 0.01
                      ? (parseFloat(buyAmount) / selectedAsset.spotPrice).toFixed(6)
                      : (parseFloat(buyAmount) / selectedAsset.spotPrice).toFixed(4)
                    } {selectedAsset.unit}
                  </div>
                )}
              </div>

              <button onClick={handleBuy} disabled={!buyAmount || parseFloat(buyAmount) > cashBalance || parseFloat(buyAmount) <= 0}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold text-sm hover:from-emerald-400 hover:to-teal-400 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2">
                <Zap className="w-4 h-4" /> Execute Buy Order
              </button>
            </>
          )}

          {success && (
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-4 py-3 text-sm text-emerald-400 font-medium text-center animate-fade-in-up">
              ✓ {success}
            </div>
          )}
        </div>
      </div>
    </>,
    document.body
  );
};

export default QuickInvestDrawer;
