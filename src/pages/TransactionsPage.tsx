import React, { useState, useMemo } from 'react';
import { Search, ArrowDownLeft, ArrowUpRight, ShieldAlert, ShoppingCart, RefreshCw, Calendar } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';

type TxFilter = 'all' | 'deposit' | 'withdrawal' | 'trade' | 'rebalance';

const TransactionsPage: React.FC = () => {
  const { bankTransactions } = usePortfolio();
  const [filter, setFilter] = useState<TxFilter>('all');
  const [search, setSearch] = useState('');

  // Filter and Search Logic
  const filteredTransactions = useMemo(() => {
    return bankTransactions.filter(tx => {
      // 1. Filter by category
      if (filter !== 'all') {
        if (filter === 'trade') {
          if (tx.type !== 'auto_buy' && tx.type !== 'manual_buy') return false;
        } else if (tx.type !== filter) {
          return false;
        }
      }
      
      // 2. Filter by search query
      if (search.trim()) {
        const query = search.toLowerCase();
        return (
          tx.description.toLowerCase().includes(query) ||
          tx.type.toLowerCase().includes(query) ||
          tx.amount.toString().includes(query)
        );
      }

      return true;
    });
  }, [bankTransactions, filter, search]);

  const getTxStyle = (type: string) => {
    switch (type) {
      case 'deposit':
        return { label: 'Deposit', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: ArrowDownLeft };
      case 'withdrawal':
        return { label: 'Withdrawal', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20', icon: ArrowUpRight };
      case 'auto_buy':
        return { label: 'Auto Trade', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', icon: ShoppingCart };
      case 'manual_buy':
        return { label: 'Manual Buy', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: ShoppingCart };
      case 'rebalance':
        return { label: 'AI Rebalance', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20', icon: RefreshCw };
      default:
        return { label: 'Transaction', color: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20', icon: Calendar };
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 p-6 flex flex-col items-center justify-start relative overflow-hidden font-inter">
      {/* Background blurs */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-4xl bg-[#0D0D0F] border border-[#27272A]/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 animate-fade-in-up mt-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#27272A]/60 pb-6 mb-6">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-1.5 uppercase tracking-wide">
              Transaction History
            </h2>
            <p className="text-xs text-zinc-500 mt-1">Audit ledger of all cash movements, trades, and rebalances</p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search description, amount..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#141413] border border-[#27272A] rounded-xl pl-9 pr-4 py-2 text-xs text-white outline-none focus:border-amber-500/50"
            />
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-1.5 mb-6">
          {(['all', 'deposit', 'withdrawal', 'trade', 'rebalance'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border
                ${filter === f 
                  ? 'bg-amber-500 border-amber-500 text-black shadow-md shadow-amber-500/10' 
                  : 'bg-[#141413] border-[#27272A]/50 text-zinc-400 hover:border-zinc-700 hover:text-white'}`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1) + (f === 'trade' ? 's' : '')}
            </button>
          ))}
        </div>

        {/* Ledger Table */}
        <div className="overflow-hidden border border-[#27272A]/60 rounded-2xl bg-[#141413]">
          {filteredTransactions.length > 0 ? (
            <div className="divide-y divide-[#27272A]/40">
              {filteredTransactions.map(tx => {
                const style = getTxStyle(tx.type);
                const Icon = style.icon;
                const isNegative = tx.type === 'withdrawal' || tx.type === 'manual_buy' || tx.type === 'rebalance';
                
                return (
                  <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-white/[0.01] transition-all">
                    
                    {/* Left: icon and description */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${style.color}`}>
                        <Icon className="w-4.5 h-4.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-zinc-200 line-clamp-1">{tx.description}</div>
                        <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono mt-0.5">
                          <span>{tx.timestamp}</span>
                          <span>·</span>
                          <span className="font-semibold text-emerald-400 bg-emerald-500/5 px-1.5 py-0.5 rounded border border-emerald-500/10">{tx.status}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: amount */}
                    <div className="text-right flex-shrink-0 ml-4">
                      <div className={`text-sm font-black font-mono ${isNegative ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {isNegative ? '-' : '+'}₹{tx.amount.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 mt-0.5">{style.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <ShieldAlert className="w-10 h-10 text-zinc-600 mb-3" />
              <div className="text-sm font-bold text-zinc-400">No transactions found</div>
              <p className="text-xs text-zinc-600 mt-1 max-w-xs">No records matching selected filter or search query were found in this wallet.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default TransactionsPage;
