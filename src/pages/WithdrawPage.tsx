import React, { useState } from 'react';
import { Landmark, ArrowUpRight, HelpCircle, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';

const WithdrawPage: React.FC = () => {
  const { user, cashBalance, assets, liquidateAndWithdraw } = usePortfolio();
  const totalPortfolioValue = assets.reduce((s, a) => s + a.qty * a.spotPrice, 0) + cashBalance;
  const investedCapital = assets.reduce((s, a) => s + (a.qty * (a.avgBuyPrice || a.spotPrice)), 0);
  const assetProfits = Math.max(0, assets.reduce((s, a) => s + (a.qty * a.spotPrice) - (a.qty * (a.avgBuyPrice || a.spotPrice)), 0));
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    
    const withdrawAmount = parseFloat(amount);
    if (!withdrawAmount || withdrawAmount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }

    if (withdrawAmount > totalPortfolioValue) {
      setError(`Insufficient funds. Your total portfolio value is only ₹${totalPortfolioValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}.`);
      return;
    }

    setLoading(true);
    // Simulate process
    setTimeout(() => {
      const success = liquidateAndWithdraw(withdrawAmount);
      setLoading(false);
      if (success) {
        setMessage(`Successfully withdrew ₹${withdrawAmount.toLocaleString('en-IN')} to ${user?.bankName}.`);
        setAmount('');
        if (navigator.vibrate) {
          try {
            navigator.vibrate([100, 50, 100]);
          } catch (err) {}
        }
      } else {
        setError('Withdrawal failed. Please check cash limits.');
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 p-6 flex flex-col items-center justify-start relative overflow-hidden font-inter">
      {/* Background blurs */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg bg-[#0D0D0F] border border-[#27272A]/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 animate-fade-in-up mt-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-rose-500/10 items-center justify-center shadow-lg border border-rose-500/20 mb-3">
            <ArrowUpRight className="w-6 h-6 text-rose-400" />
          </div>
          <h2 className="text-xl font-black text-white flex items-center justify-center gap-1.5 uppercase tracking-wide">
            Withdraw Cash
          </h2>
          <p className="text-xs text-zinc-500 mt-1">Transfer liquid cash back to your primary bank account</p>
        </div>

        {/* Balance Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-[#141413] border border-[#27272A]/50 rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Max Withdrawable (Total Value)</span>
            <span className="text-xl font-black text-amber-400 font-mono mt-1">₹{totalPortfolioValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
          </div>
          <div className="bg-[#141413] border border-[#27272A]/50 rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Linked Bank Balance</span>
            <span className="text-xl font-black text-emerald-400 font-mono mt-1">₹{user?.bankBalance.toLocaleString('en-IN') || '0'}</span>
          </div>
        </div>

        {/* Bank Connection Details */}
        <div className="bg-[#141413] border border-[#27272A]/60 rounded-2xl p-4 mb-6 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Landmark className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-white uppercase tracking-wider">{user?.bankName || 'Linked Bank'}</div>
            <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{user?.bankAccount || 'XXXX XXXX XXXX'} · IFSC {user?.ifsc || 'IFSC0000000'}</div>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full">
            <ShieldCheck className="w-3 h-3" /> SECURE
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 text-xs text-red-400 bg-red-500/10 border border-red-500/25 rounded-xl px-3 py-2.5">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 rounded-xl px-3 py-2.5">
            {message}
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2 mb-6">
          <button 
            onClick={() => setAmount(investedCapital.toFixed(0))}
            className="flex-1 py-2 rounded-lg bg-[#141413] border border-[#27272A] text-[10px] font-bold text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors"
          >
            Invested: ₹{investedCapital.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </button>
          <button 
            onClick={() => setAmount(assetProfits.toFixed(0))}
            className="flex-1 py-2 rounded-lg bg-[#141413] border border-[#27272A] text-[10px] font-bold text-emerald-400 hover:text-emerald-300 hover:border-emerald-500/50 transition-colors"
          >
            Profits: ₹{assetProfits.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </button>
          <button 
            onClick={() => setAmount(totalPortfolioValue.toFixed(0))}
            className="flex-1 py-2 rounded-lg bg-[#141413] border border-[#27272A] text-[10px] font-bold text-amber-400 hover:text-amber-300 hover:border-amber-500/50 transition-colors"
          >
            Max: ₹{totalPortfolioValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </button>
        </div>

        {/* Withdraw Form */}
        <form onSubmit={handleWithdraw} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Withdrawal Amount</label>
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-xs text-zinc-500 font-semibold">₹</span>
              <input
                type="number"
                required
                disabled={loading}
                placeholder="Enter amount to withdraw"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full bg-[#141413] border border-[#27272A] rounded-xl pl-8 pr-4 py-3 text-xs text-white outline-none focus:border-amber-500/50 font-mono font-bold"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-black text-xs font-bold transition-all hover:from-rose-400 hover:to-orange-400 shadow-lg shadow-rose-500/10 hover:scale-[1.01] flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Processing Withdrawal...
              </>
            ) : (
              <>
                Confirm Transfer <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="flex items-center justify-center gap-1.5 mt-6 text-[10px] text-zinc-600 font-medium">
          <HelpCircle className="w-3.5 h-3.5" /> Funds usually settle within 2-4 seconds through RTGS/IMPS gateway.
        </div>
      </div>
    </div>
  );
};

export default WithdrawPage;
