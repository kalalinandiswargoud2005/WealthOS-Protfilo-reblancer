import React, { useState, useEffect } from 'react';
import { Target, Shield, Sparkles, HelpCircle, ArrowRight, ArrowLeft, Bot, Coins } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';

type RiskType = 'conservative' | 'balanced' | 'aggressive';

const RISK_ALLOCATIONS: Record<RiskType, { stocks: number; crypto: number; mutual_funds: number; metals: number }> = {
  conservative: { metals: 30, mutual_funds: 45, stocks: 20, crypto: 5 },
  balanced:     { metals: 15, mutual_funds: 35, stocks: 40, crypto: 10 },
  aggressive:   { metals: 5,  mutual_funds: 15, stocks: 55, crypto: 25 }
};

const OnboardingPage: React.FC = () => {
  const { completeOnboarding, user } = usePortfolio();
  const [step, setStep] = useState(1);
  
  // Onboarding parameters
  const [goal, setGoal] = useState<string>('growth');
  const [risk, setRisk] = useState<RiskType>('balanced');
  const [budget, setBudget] = useState('20000');
  const [investMode, setInvestMode] = useState<'auto' | 'suggested' | 'manual'>('auto');
  
  // Custom target allocations (main categories)
  const [allocs, setAllocs] = useState({ stocks: 40, crypto: 10, mutual_funds: 35, metals: 15 });
  const [allocError, setAllocError] = useState('');

  // Update allocation suggestions based on risk profile
  useEffect(() => {
    setAllocs(RISK_ALLOCATIONS[risk]);
  }, [risk]);

  // Adjust specific category allocation
  const handleAllocChange = (category: keyof typeof allocs, val: number) => {
    setAllocs(prev => {
      const next = { ...prev, [category]: val };
      const sum = next.stocks + next.crypto + next.mutual_funds + next.metals;
      if (sum !== 100) {
        setAllocError(`Total allocation must equal 100%. Current: ${sum}%`);
      } else {
        setAllocError('');
      }
      return next;
    });
  };

  const handleLaunch = () => {
    const sum = allocs.stocks + allocs.crypto + allocs.mutual_funds + allocs.metals;
    if (sum !== 100) {
      setAllocError(`Total allocation must equal 100% before launching. Current: ${sum}%`);
      return;
    }

    const budgetVal = parseFloat(budget) || 0;
    if (budgetVal < 10 || budgetVal > 1000000) {
      setAllocError("Investment budget must be between ₹10 and ₹10,00,000 (10 Lakhs) per day.");
      return;
    }

    if (user && user.bankBalance < budgetVal) {
      setAllocError(`Initial budget (₹${budgetVal.toLocaleString('en-IN')}) exceeds your bank account balance (₹${user.bankBalance.toLocaleString('en-IN')}).`);
      return;
    }

    // Map 4 categories to 16 asset target weights proportionally:
    // GOLD: 60% of Metals, SILVER: 40% of Metals
    // RELIANCE: 25%, TCS: 22%, INFY: 18%, HDFCBANK: 18%, ICICIBANK: 17% of Stocks
    // SBI_BLUE: 25%, HDFC_INDEX: 25%, ICICI_BLUE: 25%, NIPPON_GROWTH: 25% of Mutual Funds
    // BTC: 35%, ETH: 25%, SOL: 18%, XRP: 12%, ADA: 10% of Crypto
    const m = allocs.metals;
    const s = allocs.stocks;
    const f = allocs.mutual_funds;
    const c = allocs.crypto;

    const mappedAllocations: Record<string, number> = {
      GOLD:          parseFloat((m * 0.60).toFixed(2)),
      SILVER:        parseFloat((m * 0.40).toFixed(2)),
      
      RELIANCE:      parseFloat((s * 0.25).toFixed(2)),
      TCS:           parseFloat((s * 0.22).toFixed(2)),
      INFY:          parseFloat((s * 0.18).toFixed(2)),
      HDFCBANK:      parseFloat((s * 0.18).toFixed(2)),
      ICICIBANK:     parseFloat((s * 0.17).toFixed(2)),
      
      SBI_BLUE:      parseFloat((f * 0.25).toFixed(2)),
      HDFC_INDEX:    parseFloat((f * 0.25).toFixed(2)),
      ICICI_BLUE:    parseFloat((f * 0.25).toFixed(2)),
      NIPPON_GROWTH: parseFloat((f * 0.25).toFixed(2)),
      
      BTC:           parseFloat((c * 0.35).toFixed(2)),
      ETH:           parseFloat((c * 0.25).toFixed(2)),
      SOL:           parseFloat((c * 0.18).toFixed(2)),
      XRP:           parseFloat((c * 0.12).toFixed(2)),
      ADA:           parseFloat((c * 0.10).toFixed(2)),
    };

    // Correct sum floating roundoff errors to hit exactly 100%
    const totalAssigned = Object.values(mappedAllocations).reduce((sum, v) => sum + v, 0);
    if (totalAssigned !== 100) {
      mappedAllocations.GOLD = parseFloat((mappedAllocations.GOLD + (100 - totalAssigned)).toFixed(2));
    }

    completeOnboarding(risk, budgetVal, investMode, mappedAllocations);
  };

  return (
    <div className="min-h-screen bg-[#09090B] flex items-center justify-center p-4 relative overflow-hidden font-inter">
      {/* Background blurs */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
      
      <div className="w-full max-w-xl bg-[#0D0D0F] border border-[#27272A] rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 animate-fade-in-up">
        {/* Progress header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#27272A]/60">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">AI Profiler Wizard</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-bold">
            <span className={step >= 1 ? 'text-amber-400' : ''}>1. Goals</span>
            <span>·</span>
            <span className={step >= 2 ? 'text-amber-400' : ''}>2. Mode</span>
            <span>·</span>
            <span className={step >= 3 ? 'text-amber-400' : ''}>3. Allocations</span>
          </div>
        </div>

        {/* Step 1: Goals & Risk */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-1.5">
                Tell us about your financial goals <HelpCircle className="w-4 h-4 text-zinc-500" />
              </h2>
              <p className="text-[11px] text-zinc-500 mt-0.5">Let the AI rebalancer customize its logic for you.</p>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">What is your primary focus?</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'safety', label: 'Capital Preservation', desc: 'Hedge inflation with low-risk metals & MFs.', risk: 'conservative' as const },
                  { id: 'growth', label: 'Balanced Growth', desc: 'Steady growth via a mix of equities & MFs.', risk: 'balanced' as const },
                  { id: 'alpha', label: 'Wealth Expansion', desc: 'Maximize alpha with stock & crypto risk.', risk: 'aggressive' as const }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => { setGoal(opt.id); setRisk(opt.risk); }}
                    className={`rounded-xl border p-3.5 text-left transition-all text-xs flex flex-col justify-between min-h-[100px]
                      ${goal === opt.id ? 'border-amber-500 bg-amber-500/5 text-white' : 'border-[#27272A] bg-[#141413] text-zinc-400 hover:border-zinc-700'}`}
                  >
                    <span className="font-bold text-white">{opt.label}</span>
                    <span className="text-[10px] text-zinc-500 leading-snug mt-2">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Investment Budget (From Connected Bank)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-3.5 text-xs text-zinc-500 font-semibold">₹</span>
                <input
                  type="number"
                  value={budget}
                  onChange={e => setBudget(e.target.value)}
                  placeholder="20000"
                  className="w-full bg-[#141413] border border-[#27272A] rounded-xl pl-8 pr-4 py-3 text-xs text-white outline-none focus:border-amber-500/50 font-mono font-bold"
                />
              </div>
              <div className="text-[10px] text-zinc-500">
                Connected bank account balance:{' '}
                <span className="text-zinc-300 font-bold font-mono">
                  ₹{user?.bankBalance.toLocaleString('en-IN') || '1,50,000'}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                onClick={() => setStep(2)}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black text-xs font-bold transition-all hover:scale-[1.01]"
              >
                Next Step: Rebalance Mode <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: AI Autopilot Mode */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-1.5">
                Choose Rebalancing Mode <Target className="w-4 h-4 text-zinc-500" />
              </h2>
              <p className="text-[11px] text-zinc-500 mt-0.5">Control how the WealthOS rebalancing agent behaves.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => setInvestMode('auto')}
                className={`rounded-2xl border p-5 text-left transition-all duration-300 flex flex-col justify-between min-h-[140px]
                  ${investMode === 'auto' ? 'border-emerald-500/40 bg-emerald-500/5 text-white' : 'border-[#27272A] bg-[#141413] text-zinc-400 hover:border-zinc-700'}`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${investMode === 'auto' ? 'bg-emerald-500/10 text-emerald-400 animate-pulse' : 'bg-white/5 text-zinc-500'}`}>
                    <Bot className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-white text-xs">AI Autopilot</span>
                </div>
                <p className="text-[10px] text-zinc-500 leading-relaxed mt-4">
                  Continuous AI scans. Automatically allocates cash to correct drift. **No manual input needed.**
                </p>
              </button>

              <button
                onClick={() => setInvestMode('suggested')}
                className={`rounded-2xl border p-5 text-left transition-all duration-300 flex flex-col justify-between min-h-[140px]
                  ${investMode === 'suggested' ? 'border-amber-500/40 bg-amber-500/5 text-white' : 'border-[#27272A] bg-[#141413] text-zinc-400 hover:border-zinc-700'}`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${investMode === 'suggested' ? 'bg-amber-500/10 text-amber-400' : 'bg-white/5 text-zinc-500'}`}>
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-white text-xs">AI-Suggested</span>
                </div>
                <p className="text-[10px] text-zinc-500 leading-relaxed mt-4">
                  AI scans and suggests trades to correct drift. You review and execute manually. **Assisted control.**
                </p>
              </button>

              <button
                onClick={() => setInvestMode('manual')}
                className={`rounded-2xl border p-5 text-left transition-all duration-300 flex flex-col justify-between min-h-[140px]
                  ${investMode === 'manual' ? 'border-zinc-400/40 bg-zinc-500/5 text-white' : 'border-[#27272A] bg-[#141413] text-zinc-400 hover:border-zinc-700'}`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${investMode === 'manual' ? 'bg-zinc-500/20 text-zinc-300' : 'bg-white/5 text-zinc-500'}`}>
                    <Shield className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-white text-xs">Manual Only</span>
                </div>
                <p className="text-[10px] text-zinc-500 leading-relaxed mt-4">
                  No AI scans or alerts. You make all investment decisions on your own. **Full control.**
                </p>
              </button>
            </div>

            <div className="flex items-center justify-between pt-3">
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-1 text-xs font-semibold text-zinc-400 hover:text-white"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black text-xs font-bold transition-all hover:scale-[1.01]"
              >
                Next: Review Targets <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Custom Target Allocations */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-1.5">
                Calibrate Asset Targets <Coins className="w-4 h-4 text-zinc-500" />
              </h2>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                AI suggested allocations based on your <span className="text-amber-400 font-bold">{risk}</span> risk profile.
              </p>
            </div>

            {allocError && (
              <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/25 rounded-xl px-3 py-2.5">
                {allocError}
              </div>
            )}

            {/* Target Sliders */}
            <div className="space-y-4 rounded-2xl bg-[#141413] border border-[#27272A] p-4">
              {[
                { cat: 'stocks' as const, label: 'NSE Equities / Stocks', color: 'bg-indigo-500' },
                { cat: 'mutual_funds' as const, label: 'SIP Mutual Funds', color: 'bg-emerald-500' },
                { cat: 'metals' as const, label: 'Precious Metals (Gold/Silver)', color: 'bg-amber-500' },
                { cat: 'crypto' as const, label: 'Cryptocurrencies', color: 'bg-rose-500' }
              ].map(item => (
                <div key={item.cat} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-zinc-300">{item.label}</span>
                    <span className="font-bold font-mono text-white">{allocs[item.cat]}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={allocs[item.cat]}
                    onChange={e => handleAllocChange(item.cat, parseInt(e.target.value) || 0)}
                    className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <div className="flex h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color}`} style={{ width: `${allocs[item.cat]}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Sum validation display */}
            <div className="flex justify-between items-center text-xs px-1">
              <span className="text-zinc-500">Allocation Target Sum:</span>
              <span className={`font-bold font-mono ${allocs.stocks + allocs.crypto + allocs.mutual_funds + allocs.metals === 100 ? 'text-emerald-400' : 'text-red-400'}`}>
                {allocs.stocks + allocs.crypto + allocs.mutual_funds + allocs.metals}% / 100%
              </span>
            </div>

            <div className="flex items-center justify-between pt-3">
              <button
                onClick={() => setStep(2)}
                className="flex items-center gap-1 text-xs font-semibold text-zinc-400 hover:text-white"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <button
                onClick={handleLaunch}
                className="flex items-center gap-1.5 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black text-xs font-bold transition-all hover:scale-[1.02] shadow-lg shadow-amber-500/10"
              >
                Launch WealthOS Engine <Sparkles className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingPage;
