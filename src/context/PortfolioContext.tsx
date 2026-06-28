import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { testDatasetAssets, testDatasetCash } from '../utils/testDataset';

export type AssetCategory = 'metals' | 'stocks' | 'mutual_funds' | 'crypto';

export interface Asset {
  ticker: string; name: string; qty: number; spotPrice: number; targetWeight: number;
  unit: string; priceHistory: number[]; change24h: number; marketCap: number;
  volume24h: number; category: AssetCategory; exchange?: string; volatility: number;
  avgBuyPrice?: number;
}

export interface ActivityItem {
  id: number; timestamp: string;
  type: 'scan' | 'action' | 'complete' | 'monitor' | 'alert' | 'boot';
  message: string; ticker?: string; category?: AssetCategory;
}

export interface AuditRecord {
  id: number; timestamp: string; model: string; interval: string;
  actions: string[]; transcript: string[]; driftBefore: number; driftAfter: number;
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  riskProfile?: 'conservative' | 'balanced' | 'aggressive';
  onboardingCompleted: boolean;
  bankName: string;
  bankAccount: string;
  bankBalance: number;
  ifsc: string;
  targetWealthGoal?: number;
  lowBalanceThreshold?: number;
  transactionPin?: string;
  credentialId?: string;
}

export interface BankTransaction {
  id: number;
  timestamp: string;
  type: 'deposit' | 'withdrawal' | 'auto_buy' | 'manual_buy' | 'rebalance';
  amount: number;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  description: string;
}

export interface SuggestedTrade {
  ticker: string;
  name: string;
  category: AssetCategory;
  action: 'BUY' | 'SELL';
  amount: number;
  qty: number;
  spotPrice: number;
  driftBefore: number;
  driftAfter: number;
}

interface PortfolioContextType {
  assets: Asset[]; cashBalance: number; totalPortfolioValue: number; driftIndex: number;
  auditRecords: AuditRecord[]; activityFeed: ActivityItem[]; investMode: 'auto' | 'suggested' | 'manual' | 'test';
  depositCash: (amount: number) => void; quickBuy: (ticker: string, amount: number) => void;
  buyAsset: (ticker: string, qty: number, price: number, category: AssetCategory, name: string, unit: string) => void;
  sellAsset: (ticker: string, qty: number, price: number) => void;
  runAgentCycle: (model: string, interval: string, onLog: (line: string) => void) => Promise<void>;
  isAgentRunning: boolean; setInvestMode: (mode: 'auto' | 'suggested' | 'manual' | 'test') => void;
  addActivity: (item: Omit<ActivityItem, 'id' | 'timestamp'>) => void;
  user: UserProfile | null;
  bankTransactions: BankTransaction[];
  registerUser: (name: string, email: string, bankName: string, bankBalance: number, password?: string, targetWealthGoal?: number, avatar?: string, credentialId?: string) => void;
  loginUser: (email: string, password?: string, useBiometrics?: boolean) => boolean;
  loginWithCredentialId: (credentialId: string) => boolean;
  logoutUser: () => void;
  completeOnboarding: (riskProfile: 'conservative' | 'balanced' | 'aggressive', budget: number, investMode: 'auto' | 'suggested' | 'manual' | 'test', allocations: Record<string, number>) => void;
  depositFromBank: (amount: number) => boolean;
  withdrawToBank: (amount: number) => boolean;
  liquidateAndWithdraw: (amount: number) => boolean;
  executeUpiTransfer: (person: string, amount: number) => boolean;
  updateProfile: (name: string, avatar: string, targetWealthGoal?: number, lowBalanceThreshold?: number, transactionPin?: string) => void;
  sendEmailAlert: (alertType: string, message: string) => Promise<boolean>;
  pendingTrade: SuggestedTrade | null;
  approvePendingTrade: () => void;
  rejectPendingTrade: () => void;
}

const generateHistory = (base: number, vol: number): number[] => {
  let price = base * (0.94 + Math.random() * 0.05);
  return [...Array(7)].map(() => {
    price = price * (1 + (Math.random() - 0.5) * vol);
    return parseFloat(price.toFixed(base > 1000 ? 0 : base > 10 ? 2 : 4));
  }).concat(base);
};

const COST_MULT: Record<string, number> = {
  GOLD: 0.87, SILVER: 0.82,
  RELIANCE: 0.78, TCS: 0.72, INFY: 0.85, HDFCBANK: 0.68, ICICIBANK: 0.75,
  SBI_BLUE: 0.88, HDFC_INDEX: 0.84, ICICI_BLUE: 0.79, NIPPON_GROWTH: 0.82,
  BTC: 0.62, ETH: 0.71, SOL: 0.58, XRP: 0.65, ADA: 0.70,
};

const initialAssetsBase: Omit<Asset, 'avgBuyPrice'>[] = [
  { ticker:'GOLD',          name:'Gold (24K)',             category:'metals',       qty:18,    spotPrice:7200,    targetWeight:15, unit:'g',      priceHistory:generateHistory(7200,0.015),    change24h:0.83,  marketCap:4850,     volume24h:312,    volatility:0.004, exchange:'MCX' },
  { ticker:'SILVER',        name:'Silver (Fine)',           category:'metals',       qty:790,   spotPrice:85,      targetWeight:10, unit:'g',      priceHistory:generateHistory(85,0.022),      change24h:-0.41, marketCap:1820,     volume24h:98,     volatility:0.006, exchange:'MCX' },
  
  { ticker:'RELIANCE',      name:'Reliance Industries',     category:'stocks',       qty:22,    spotPrice:2945,    targetWeight:7,  unit:'shares', priceHistory:generateHistory(2945,0.018),    change24h:1.45,  marketCap:199800,   volume24h:4820,   volatility:0.005, exchange:'NSE' },
  { ticker:'TCS',           name:'Tata Consultancy Svcs',   category:'stocks',       qty:15,    spotPrice:3820,    targetWeight:6,  unit:'shares', priceHistory:generateHistory(3820,0.014),    change24h:-0.32, marketCap:139600,   volume24h:2150,   volatility:0.004, exchange:'NSE' },
  { ticker:'INFY',          name:'Infosys Ltd',             category:'stocks',       qty:37,    spotPrice:1580,    targetWeight:5,  unit:'shares', priceHistory:generateHistory(1580,0.016),    change24h:0.78,  marketCap:65400,    volume24h:3890,   volatility:0.005, exchange:'NSE' },
  { ticker:'HDFCBANK',      name:'HDFC Bank Ltd',           category:'stocks',       qty:30,    spotPrice:1650,    targetWeight:5,  unit:'shares', priceHistory:generateHistory(1650,0.013),    change24h:-1.02, marketCap:125600,   volume24h:5120,   volatility:0.004, exchange:'NSE' },
  { ticker:'ICICIBANK',     name:'ICICI Bank Ltd',          category:'stocks',       qty:45,    spotPrice:1150,    targetWeight:5,  unit:'shares', priceHistory:generateHistory(1150,0.015),    change24h:0.45,  marketCap:80500,    volume24h:3450,   volatility:0.005, exchange:'NSE' },
  
  { ticker:'SBI_BLUE',      name:'SBI Bluechip Fund',       category:'mutual_funds', qty:500,   spotPrice:85.34,   targetWeight:5,  unit:'units',  priceHistory:generateHistory(85.34,0.008),   change24h:0.15,  marketCap:45200,    volume24h:820,    volatility:0.002, exchange:'BSE' },
  { ticker:'HDFC_INDEX',    name:'HDFC Index Nifty 50',     category:'mutual_funds', qty:800,   spotPrice:32.50,   targetWeight:5,  unit:'units',  priceHistory:generateHistory(32.50,0.007),   change24h:0.12,  marketCap:28400,    volume24h:610,    volatility:0.002, exchange:'BSE' },
  { ticker:'ICICI_BLUE',    name:'ICICI Pru Bluechip Fund', category:'mutual_funds', qty:450,   spotPrice:88.20,   targetWeight:5,  unit:'units',  priceHistory:generateHistory(88.20,0.009),   change24h:0.20,  marketCap:35200,    volume24h:540,    volatility:0.002, exchange:'BSE' },
  { ticker:'NIPPON_GROWTH', name:'Nippon India Growth Fund',category:'mutual_funds', qty:320,   spotPrice:125.40,  targetWeight:5,  unit:'units',  priceHistory:generateHistory(125.40,0.011),  change24h:-0.05, marketCap:21500,    volume24h:480,    volatility:0.003, exchange:'BSE' },
  
  { ticker:'BTC',           name:'Bitcoin',                category:'crypto',       qty:0.012, spotPrice:6044140, targetWeight:10, unit:'BTC',    priceHistory:generateHistory(6044140,0.032), change24h:2.34,  marketCap:13750000, volume24h:985000, volatility:0.009, exchange:'Binance' },
  { ticker:'ETH',           name:'Ethereum',               category:'crypto',       qty:0.21,  spotPrice:285000,  targetWeight:7,  unit:'ETH',    priceHistory:generateHistory(285000,0.038),  change24h:3.12,  marketCap:3420000,  volume24h:456000, volatility:0.010, exchange:'Binance' },
  { ticker:'SOL',           name:'Solana',                 category:'crypto',       qty:3.4,   spotPrice:12400,   targetWeight:5,  unit:'SOL',    priceHistory:generateHistory(12400,0.045),   change24h:-1.87, marketCap:578000,   volume24h:89000,  volatility:0.012, exchange:'Binance' },
  { ticker:'XRP',           name:'Ripple XRP',             category:'crypto',       qty:550,   spotPrice:48.50,   targetWeight:3,  unit:'XRP',    priceHistory:generateHistory(48.50,0.048),   change24h:1.20,  marketCap:284000,   volume24h:65000,  volatility:0.011, exchange:'Binance' },
  { ticker:'ADA',           name:'Cardano ADA',            category:'crypto',       qty:750,   spotPrice:35.20,   targetWeight:2,  unit:'ADA',    priceHistory:generateHistory(35.20,0.052),   change24h:-0.85, marketCap:125000,   volume24h:24000,  volatility:0.013, exchange:'Binance' },
];

const initialAssets: Asset[] = initialAssetsBase.map(a => ({
  ...a,
  avgBuyPrice: a.qty > 0 ? parseFloat((a.spotPrice * (COST_MULT[a.ticker] ?? 0.80)).toFixed(2)) : 0
}));

const now = () => new Date().toLocaleTimeString('en-IN', { hour12: false });

const PortfolioContext = createContext<PortfolioContextType | null>(null);

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const savedProfile = localStorage.getItem('wealthos_user_profile');
    if (savedProfile) {
      try {
        return JSON.parse(savedProfile);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [assets, setAssets] = useState<Asset[]>(() => {
    const savedProfile = localStorage.getItem('wealthos_user_profile');
    if (savedProfile) {
      try {
        const u = JSON.parse(savedProfile);
        const saved = localStorage.getItem(`wealthos_assets_${u.email.toLowerCase()}`);
        return saved ? JSON.parse(saved) : initialAssets;
      } catch (e) {}
    }
    return initialAssets;
  });

  const [cashBalance, setCashBalance] = useState<number>(() => {
    const savedProfile = localStorage.getItem('wealthos_user_profile');
    if (savedProfile) {
      try {
        const u = JSON.parse(savedProfile);
        const saved = localStorage.getItem(`wealthos_cash_balance_${u.email.toLowerCase()}`);
        return saved ? parseFloat(saved) : 50000;
      } catch (e) {}
    }
    return 50000;
  });

  const [isAgentRunning, setIsAgentRunning] = useState(false);
  const [investMode, setInvestModeState] = useState<'auto' | 'suggested' | 'manual' | 'test'>('auto');
  const investModeRef = useRef(investMode);
  useEffect(() => { investModeRef.current = investMode; }, [investMode]);
  const nextAuditId = useRef(109);
  const activityIdRef = useRef(20);
  const isRunningRef = useRef(false);

  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>(() => {
    const savedProfile = localStorage.getItem('wealthos_user_profile');
    if (savedProfile) {
      try {
        const u = JSON.parse(savedProfile);
        const saved = localStorage.getItem(`wealthos_bank_transactions_${u.email.toLowerCase()}`);
        return saved ? JSON.parse(saved) : [
          { id: 1, timestamp: new Date(Date.now() - 3600000 * 2).toLocaleDateString('en-IN') + ' ' + new Date(Date.now() - 3600000 * 2).toLocaleTimeString('en-IN', { hour12: false }), type: 'deposit', amount: 50000, status: 'COMPLETED', description: 'Initial portfolio setup deposit' }
        ];
      } catch (e) {}
    }
    return [
      { id: 1, timestamp: new Date(Date.now() - 3600000 * 2).toLocaleDateString('en-IN') + ' ' + new Date(Date.now() - 3600000 * 2).toLocaleTimeString('en-IN', { hour12: false }), type: 'deposit', amount: 50000, status: 'COMPLETED', description: 'Initial portfolio setup deposit' }
    ];
  });
  const nextTxId = useRef(2);
  const isLoaded = useRef(false);

  // Sync state to user-specific localStorage on changes
  useEffect(() => {
    if (user && isLoaded.current) {
      const emailKey = user.email.toLowerCase();
      localStorage.setItem(`wealthos_assets_${emailKey}`, JSON.stringify(assets));
    }
  }, [assets, user]);

  useEffect(() => {
    if (user && isLoaded.current) {
      const emailKey = user.email.toLowerCase();
      localStorage.setItem(`wealthos_cash_balance_${emailKey}`, cashBalance.toString());
    }
  }, [cashBalance, user]);

  useEffect(() => {
    if (user && isLoaded.current) {
      const emailKey = user.email.toLowerCase();
      localStorage.setItem(`wealthos_bank_transactions_${emailKey}`, JSON.stringify(bankTransactions));
    }
  }, [bankTransactions, user]);

  // When user changes (login/logout/register), load/restore their specific portfolio
  useEffect(() => {
    isLoaded.current = false;
    if (user) {
      const emailKey = user.email.toLowerCase();
      const savedAssets = localStorage.getItem(`wealthos_assets_${emailKey}`);
      const savedCash = localStorage.getItem(`wealthos_cash_balance_${emailKey}`);
      const savedTxs = localStorage.getItem(`wealthos_bank_transactions_${emailKey}`);

      if (savedAssets) {
        setAssets(JSON.parse(savedAssets));
      } else {
        if (emailKey === 'alex.mercer@wealthos.ai') {
          setAssets(initialAssets);
        } else {
          setAssets(initialAssets.map(a => ({ ...a, qty: 0 })));
        }
      }

      if (savedCash) {
        setCashBalance(parseFloat(savedCash));
      } else {
        setCashBalance(emailKey === 'alex.mercer@wealthos.ai' ? 50000 : 0);
      }

      if (savedTxs) {
        setBankTransactions(JSON.parse(savedTxs));
      } else {
        setBankTransactions(emailKey === 'alex.mercer@wealthos.ai' ? [
          { id: 1, timestamp: new Date(Date.now() - 3600000 * 2).toLocaleDateString('en-IN') + ' ' + new Date(Date.now() - 3600000 * 2).toLocaleTimeString('en-IN', { hour12: false }), type: 'deposit', amount: 50000, status: 'COMPLETED', description: 'Initial portfolio setup deposit' }
        ] : []);
      }
      isLoaded.current = true;
    } else {
      setAssets(initialAssets);
      setCashBalance(50000);
      setBankTransactions([
        { id: 1, timestamp: new Date(Date.now() - 3600000 * 2).toLocaleDateString('en-IN') + ' ' + new Date(Date.now() - 3600000 * 2).toLocaleTimeString('en-IN', { hour12: false }), type: 'deposit', amount: 50000, status: 'COMPLETED', description: 'Initial portfolio setup deposit' }
      ]);
    }
  }, [user]);

  const addBankTx = useCallback((type: BankTransaction['type'], amount: number, desc: string, status: BankTransaction['status'] = 'COMPLETED') => {
    setBankTransactions(prev => [
      {
        id: nextTxId.current++,
        timestamp: new Date().toLocaleDateString('en-IN') + ' ' + new Date().toLocaleTimeString('en-IN', { hour12: false }),
        type,
        amount,
        status,
        description: desc
      },
      ...prev
    ]);
  }, []);

  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([
    { id:1,  timestamp:'19:00:00', type:'boot',    message:'WealthOS Agent v2.4.1 initialized. Loading 16 assets...' },
    { id:2,  timestamp:'19:00:01', type:'scan',    message:'Bootstrapping portfolio state from Supabase Postgres...' },
    { id:3,  timestamp:'19:00:02', type:'complete',message:'Portfolio loaded. Total value: ₹8,89,125. Drift Index: 1.4%.' },
    { id:4,  timestamp:'19:00:05', type:'monitor', message:'Running full drift scan across Metals · Stocks · MF · Crypto...' },
    { id:5,  timestamp:'19:00:06', type:'alert',   message:'HDFCBANK is 0.9% below target. Flagged for next rebalance cycle.', ticker:'HDFCBANK', category:'stocks' },
    { id:6,  timestamp:'19:00:07', type:'monitor', message:'All other assets within ±0.5% threshold. No immediate action.' },
    { id:7,  timestamp:'19:05:00', type:'scan',    message:'Auto-scan #2. Checking crypto category volatility...' },
    { id:8,  timestamp:'19:05:02', type:'alert',   message:'BTC volatility spike detected (+2.34%). Monitoring closely.', ticker:'BTC', category:'crypto' },
    { id:9,  timestamp:'19:05:04', type:'complete',message:'Crypto within allocation range. No rebalance triggered.' },
    { id:10, timestamp:'19:10:00', type:'scan',    message:'Auto-scan #3. Metals category stable. MCX aligned with targets.' },
    { id:11, timestamp:'19:10:01', type:'monitor', message:'GOLD: current 15.1% vs target 15%. ✓ Aligned.' },
    { id:12, timestamp:'19:10:02', type:'monitor', message:'SILVER: current 7.8% vs target 8%. ⚠ Marginal under-allocation.' },
    { id:13, timestamp:'19:15:00', type:'action',  message:'Drift threshold crossed. Executing micro-rebalance for SILVER.', ticker:'SILVER', category:'metals' },
    { id:14, timestamp:'19:15:03', type:'complete',message:'✓ Bought SILVER 15g @ ₹85/g. Drift corrected.', ticker:'SILVER', category:'metals' },
  ]);

  const [auditRecords, setAuditRecords] = useState<AuditRecord[]>([
    { id:107, timestamp:'2026-06-18 09:30:06 AM', model:'Qwen 2.5 Coder', interval:'Daily Market Open',
      actions:['BUY SILVER 200g @ ₹84.50','SELL METAL_ETF 30 units @ ₹109.80'],
      transcript:['[09:30:01] Background Cron Task Awakened...','[09:30:02] Fetching state from Supabase...','[09:30:03] SILVER below target by -2.1%.','[09:30:05] BUY order executed.','[09:30:06] Row #107 synced.'],
      driftBefore:3.2, driftAfter:0.8, status:'SUCCESS' },
    { id:108, timestamp:'2026-06-19 09:30:09 AM', model:'Llama 3.2', interval:'Hourly',
      actions:['BUY BTC 0.0001 @ ₹69,45,000'],
      transcript:['[09:30:01] Cron awakened...','[09:30:02] BTC below target by -1.2%.','[09:30:05] BUY BTC executed.','[09:30:09] Row #108 synced.'],
      driftBefore:1.8, driftAfter:0.9, status:'SUCCESS' },
  ]);

  const addActivity = useCallback((item: Omit<ActivityItem, 'id' | 'timestamp'>) => {
    setActivityFeed(prev => [{
      ...item, id: activityIdRef.current++, timestamp: now(),
    }, ...prev.slice(0, 79)]);
  }, []);

  // Real-world live market data sync from public, CORS-enabled APIs
  useEffect(() => {
    const fetchRealWorldData = async () => {
      // 1. Fetch USD/INR Exchange Rate
      let usdinr = 83.5;
      try {
        const res = await fetch('http://open.er-api.com/v6/latest/USD');
        if (res.ok) {
          const data = await res.json();
          if (data && data.rates && data.rates.INR) {
            usdinr = data.rates.INR;
          }
        }
      } catch (e) {
        console.warn('Failed to fetch exchange rate, using fallback', e);
      }

      // 2. Fetch Crypto Prices from CoinGecko (BTC, ETH, SOL, XRP, ADA)
      let cryptoPrices: Record<string, { price: number; change: number }> = {};
      try {
        const res = await fetch('http://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,ripple,cardano&vs_currencies=inr&include_24hr_change=true');
        if (res.ok) {
          const data = await res.json();
          if (data.bitcoin) cryptoPrices.BTC = { price: data.bitcoin.inr, change: data.bitcoin.inr_24h_change };
          if (data.ethereum) cryptoPrices.ETH = { price: data.ethereum.inr, change: data.ethereum.inr_24h_change };
          if (data.solana) cryptoPrices.SOL = { price: data.solana.inr, change: data.solana.inr_24h_change };
          if (data.ripple) cryptoPrices.XRP = { price: data.ripple.inr, change: data.ripple.inr_24h_change };
          if (data.cardano) cryptoPrices.ADA = { price: data.cardano.inr, change: data.cardano.inr_24h_change };
        }
      } catch (e) {
        console.warn('Failed to fetch crypto prices', e);
      }

      // 3. Fetch Mutual Fund NAVs from MFAPI
      let mfNAVs: Record<string, number> = {};
      const mfSchemes = { SBI_BLUE: '119798', HDFC_INDEX: '119063', ICICI_BLUE: '120227', NIPPON_GROWTH: '119853' };
      for (const [key, code] of Object.entries(mfSchemes)) {
        try {
          const res = await fetch(`http://api.mfapi.in/mf/${code}`);
          if (res.ok) {
            const data = await res.json();
            if (data && data.data && data.data[0]) {
              mfNAVs[key] = parseFloat(data.data[0].nav);
            }
          }
        } catch (e) {
          console.warn(`Failed to fetch MF NAV for ${key}`, e);
        }
      }

      // 4. Fetch Metals.dev gold & silver prices (if key is configured in localStorage)
      let goldPrice = 0;
      let silverPrice = 0;
      const metalsDevKey = localStorage.getItem('metals_dev_api_key');
      if (metalsDevKey) {
        try {
          const res = await fetch(`http://api.metals.dev/v1/latest?api_key=${metalsDevKey}&currency=INR&unit=g`);
          if (res.ok) {
            const data = await res.json();
            if (data && data.metals) {
              goldPrice = data.metals.gold;
              silverPrice = data.metals.silver;
            }
          }
        } catch (e) {
          console.warn('Failed to fetch metals.dev prices, using fallback', e);
        }
      }

      // 5. Update assets state with authentic real-world baseline values
      setAssets(prev => {
        if (investModeRef.current === 'test') return prev;
        return prev.map(a => {
        let updatedPrice = a.spotPrice;
        let updatedChange = a.change24h;

        if (a.ticker === 'GOLD') {
          if (goldPrice > 0) {
            updatedPrice = goldPrice;
          } else {
            // Gold Spot in INR fallback: Comex Gold Spot price (~$2350 per troy ounce), 1 Troy Ounce = 31.1035g.
            // Add 15% Indian custom duty/taxes.
            const goldUSDPerOz = 2350;
            updatedPrice = parseFloat(((goldUSDPerOz * usdinr / 31.1035) * 1.15).toFixed(2));
          }
        } else if (a.ticker === 'SILVER') {
          if (silverPrice > 0) {
            updatedPrice = silverPrice;
          } else {
            // Silver Spot in INR fallback: Comex Silver Spot price (~$29.50 per troy ounce).
            const silverUSDPerOz = 29.50;
            updatedPrice = parseFloat((silverUSDPerOz * usdinr / 31.1035).toFixed(2));
          }
        } else if (['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK'].includes(a.ticker)) {
          // Adjust stock baseline prices with currency index
          const originalDefaults: Record<string, number> = { RELIANCE: 2945, TCS: 3820, INFY: 1580, HDFCBANK: 1650, ICICIBANK: 1150 };
          updatedPrice = parseFloat((originalDefaults[a.ticker] * (usdinr / 83.5)).toFixed(2));
        } else if (cryptoPrices[a.ticker]) {
          updatedPrice = cryptoPrices[a.ticker].price;
          updatedChange = parseFloat(cryptoPrices[a.ticker].change.toFixed(2));
        } else if (mfNAVs[a.ticker]) {
          updatedPrice = mfNAVs[a.ticker];
        }

        return {
          ...a,
          spotPrice: updatedPrice,
          change24h: updatedChange,
          priceHistory: generateHistory(updatedPrice, a.volatility)
        };
      });
      });
    };

    fetchRealWorldData();
    // Sync with real-world APIs every 90 seconds
    const interval = setInterval(fetchRealWorldData, 90000);
    return () => clearInterval(interval);
  }, []);

  // Live price ticks (with organic upward trend drift of +0.02% per tick)
  useEffect(() => {
    const iv = setInterval(() => {
      setAssets(prev => {
        if (investModeRef.current === 'test') return prev;
        return prev.map(a => {
        // Shift random walk center slightly positive (0.47 instead of 0.5) to simulate upward growth trends
        const f = 1 + (Math.random() - 0.47) * a.volatility;
        const np = parseFloat((a.spotPrice * f).toFixed(a.spotPrice > 100000 ? 0 : a.spotPrice > 100 ? 2 : 4));
        const nc = parseFloat((a.change24h + (Math.random() - 0.47) * 0.1).toFixed(2));
        return { ...a, spotPrice: np, change24h: Math.max(-8, Math.min(8, nc)) };
      });
      });
    }, 3000);
    return () => clearInterval(iv);
  }, []);

  const totalPortfolioValue = assets.reduce((s, a) => s + a.qty * a.spotPrice, 0) + cashBalance;

  const driftIndex = (() => {
    const inv = assets.reduce((s, a) => s + a.qty * a.spotPrice, 0);
    return assets.reduce((s, a) => {
      const cw = inv > 0 ? (a.qty * a.spotPrice / inv) * 100 : 0;
      return s + Math.abs(cw - a.targetWeight);
    }, 0) / 2;
  })();

  // Refs for auto-pilot (avoids stale closures)
  const assetsRef = useRef(assets);
  const cashRef = useRef(cashBalance);
  const driftRef = useRef(driftIndex);
  useEffect(() => { assetsRef.current = assets; }, [assets]);
  useEffect(() => { cashRef.current = cashBalance; }, [cashBalance]);
  useEffect(() => { driftRef.current = driftIndex; }, [driftIndex]);

  // Autonomous AI auto-pilot — runs every 25 seconds
  useEffect(() => {
    if (investMode !== 'auto' && investMode !== 'test') return;
    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

    const autoRun = async () => {
      if (isRunningRef.current) return;
      const drift = driftRef.current;
      const cash = cashRef.current;
      const currentAssets = assetsRef.current;

      addActivity({ type: 'scan', message: `Auto-pilot scan. Drift Index: ${drift.toFixed(2)}%. Checking thresholds...` });
      await sleep(600);

      if (drift > 0.4 && cash >= 10) {
        const inv = currentAssets.reduce((s, a) => s + a.qty * a.spotPrice, 0);
        const totalVal = inv + cash;
        
        // Calculate drifts based on total portfolio value instead of invested value to handle cold starts
        const drifts = currentAssets.map(a => {
          const cw = totalVal > 0 ? (a.qty * a.spotPrice / totalVal) * 100 : 0;
          return { ...a, drift: cw - a.targetWeight };
        });
        const under = drifts.reduce((a, b) => a.drift < b.drift ? a : b);
        
        const targetVal = (under.targetWeight / 100) * totalVal;
        const currentVal = under.qty * under.spotPrice;
        const gapVal = targetVal - currentVal;
        
        // Deploy up to 25% of cash or the gap size
        const deploy = Math.max(1, Math.min(cash, Math.max(cash * 0.25, gapVal)));

        if (deploy >= 1) {
          addActivity({ type: 'action', message: `Drift threshold exceeded. Auto-buying ${under.ticker} to correct ${Math.abs(under.drift).toFixed(1)}% gap.`, ticker: under.ticker, category: under.category });
          await sleep(800);

          const units = deploy / under.spotPrice;
          setAssets(prev => prev.map(a => {
            if (a.ticker !== under.ticker) return a;
            // High spotPrice assets (BTC) need high decimal precision (6-8), others need 4
            const dec = a.spotPrice > 100000 ? 7 : a.spotPrice > 100 ? 5 : 3;
            const newQty = parseFloat((a.qty + units).toFixed(dec));
            const currentAvg = a.avgBuyPrice || a.spotPrice;
            const newAvg = parseFloat((((a.qty * currentAvg) + deploy) / newQty).toFixed(2));
            return { ...a, qty: newQty, avgBuyPrice: newAvg };
          }));
          setCashBalance(prev => prev - deploy);
          addBankTx('rebalance', deploy, `Auto-bought ${under.ticker} to fix ${Math.abs(under.drift).toFixed(1)}% allocation drift`);

          await sleep(400);
          addActivity({ type: 'complete', message: `✓ Auto-executed: BUY ${under.ticker} ₹${deploy.toFixed(2)}. Portfolio drift reduced.`, ticker: under.ticker, category: under.category });
        }
      } else {
        addActivity({ type: 'monitor', message: `All assets within tolerance. Portfolio stable. Next check in 25s.` });
      }
    };

    autoRun();
    const timer = setInterval(autoRun, 25000);
    return () => clearInterval(timer);
  }, [investMode, addActivity, addBankTx]);

  const depositCash = useCallback((amount: number) => {
    setCashBalance(prev => prev + amount);
    addBankTx('deposit', amount, 'Deposited via QR Scanner / Top-up');
  }, [addBankTx]);

  const quickBuy = useCallback((ticker: string, amount: number) => {
    setAssets(prev => prev.map(a => {
      if (a.ticker !== ticker) return a;
      const units = amount / a.spotPrice;
      const dec = a.spotPrice > 100000 ? 6 : a.spotPrice > 100 ? 4 : 2;
      const newQty = parseFloat((a.qty + units).toFixed(dec));
      const currentAvg = a.avgBuyPrice || a.spotPrice;
      const newAvg = parseFloat((((a.qty * currentAvg) + amount) / newQty).toFixed(2));
      return { ...a, qty: newQty, avgBuyPrice: newAvg };
    }));
    setCashBalance(prev => prev - amount);
    addBankTx('manual_buy', amount, `Manually bought ${ticker} at live spot price`);
  }, [addBankTx]);

  const buyAsset = useCallback((ticker: string, qty: number, price: number, category: AssetCategory, name: string, unit: string) => {
    const totalCost = qty * price;
    setCashBalance(prev => {
      if (prev < totalCost) {
        throw new Error('Insufficient balance');
      }
      return prev - totalCost;
    });

    setAssets(prev => {
      const existing = prev.find(a => a.ticker === ticker);
      if (existing) {
        return prev.map(a => {
          if (a.ticker === ticker) {
            const dec = a.spotPrice > 100000 ? 7 : a.spotPrice > 100 ? 5 : 3;
            const newQty = parseFloat((a.qty + qty).toFixed(dec));
            const currentAvg = a.avgBuyPrice || a.spotPrice;
            const newAvg = parseFloat((((a.qty * currentAvg) + totalCost) / newQty).toFixed(2));
            return {
              ...a,
              qty: newQty,
              spotPrice: price,
              avgBuyPrice: newAvg
            };
          }
          return a;
        });
      } else {
        const newAsset: Asset = {
          ticker,
          name,
          category,
          qty,
          spotPrice: price,
          avgBuyPrice: price,
          targetWeight: 0,
          unit,
          priceHistory: generateHistory(price, category === 'crypto' ? 0.04 : category === 'stocks' ? 0.015 : category === 'metals' ? 0.01 : 0.008),
          change24h: 0,
          marketCap: 0,
          volume24h: 0,
          volatility: category === 'crypto' ? 0.045 : category === 'stocks' ? 0.016 : category === 'metals' ? 0.012 : 0.009
        };
        return [...prev, newAsset];
      }
    });

    addBankTx('manual_buy', totalCost, `Bought ${qty} ${unit} of ${ticker} @ ₹${price.toLocaleString('en-IN')}`);
    addActivity({
      type: 'complete',
      message: `✓ Bought ${qty} ${unit} of ${ticker} @ ₹${price.toLocaleString('en-IN')}`,
      ticker,
      category
    });
  }, [addBankTx, addActivity]);

  const sellAsset = useCallback((ticker: string, qty: number, price: number) => {
    let success = false;
    let category: AssetCategory = 'stocks';
    let unit = 'shares';
    
    setAssets(prev => {
      const existing = prev.find(a => a.ticker === ticker);
      if (!existing || existing.qty < qty) {
        return prev;
      }
      success = true;
      category = existing.category;
      unit = existing.unit;
      
      return prev.map(a => {
        if (a.ticker === ticker) {
          const dec = a.spotPrice > 100000 ? 7 : a.spotPrice > 100 ? 5 : 3;
          return {
            ...a,
            qty: parseFloat((a.qty - qty).toFixed(dec)),
            spotPrice: price
          };
        }
        return a;
      });
    });

    if (!success) {
      throw new Error('Insufficient asset quantity');
    }

    const proceeds = qty * price;
    setCashBalance(prev => prev + proceeds);

    addBankTx('auto_buy', proceeds, `Sold ${qty} ${unit} of ${ticker} @ ₹${price.toLocaleString('en-IN')}`);
    addActivity({
      type: 'complete',
      message: `✓ Sold ${qty} ${unit} of ${ticker} @ ₹${price.toLocaleString('en-IN')}`,
      ticker,
      category
    });
  }, [addBankTx, addActivity]);

  const registerUser = useCallback((name: string, email: string, bankName: string, bankBalance: number, password?: string, targetWealthGoal?: number, avatar?: string, credentialId?: string) => {
    const emailKey = email.toLowerCase();
    const newUser: UserProfile = {
      name,
      email: emailKey,
      avatar: avatar || 'http://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      onboardingCompleted: false,
      bankName,
      bankAccount: `XXXX XXXX ${Math.floor(1000 + Math.random() * 9000)}`,
      bankBalance,
      ifsc: `${bankName.toUpperCase().slice(0, 4)}0000124`,
      targetWealthGoal: targetWealthGoal || 500000,
      lowBalanceThreshold: 500,
      credentialId
    };
    setUser(newUser);
    localStorage.setItem('wealthos_user_profile', JSON.stringify(newUser));
    localStorage.setItem(`wealthos_user_profile_${emailKey}`, JSON.stringify(newUser));
    localStorage.setItem('wealthos_user_email', emailKey);
    localStorage.setItem(`wealthos_user_email_${emailKey}`, emailKey);
    if (password) {
      localStorage.setItem('wealthos_user_password', password);
      localStorage.setItem(`wealthos_user_password_${emailKey}`, password);
    }
    localStorage.setItem('wealthos_last_registered_email', emailKey);
    localStorage.setItem('wealthos_active_user_email', emailKey);

    localStorage.setItem(`wealthos_assets_${emailKey}`, JSON.stringify(initialAssets.map(a => ({ ...a, qty: 0, avgBuyPrice: 0 }))));
    localStorage.setItem(`wealthos_cash_balance_${emailKey}`, '0');
    localStorage.setItem(`wealthos_bank_transactions_${emailKey}`, JSON.stringify([]));
    localStorage.setItem(`wealthos_alerted_target_reached_${emailKey}`, 'false');
    localStorage.setItem(`wealthos_alerted_low_balance_${emailKey}`, 'false');

    setBankTransactions([]);
    setAssets(initialAssets.map(a => ({ ...a, qty: 0, avgBuyPrice: 0 })));
    setCashBalance(0);
  }, []);

  const loginUser = useCallback((email: string, password?: string, useBiometrics?: boolean) => {
    if (useBiometrics) {
      const lastEmail = localStorage.getItem('wealthos_last_registered_email') || 'alex.mercer@wealthos.ai';
      const savedProfile = localStorage.getItem(`wealthos_user_profile_${lastEmail}`);
      if (savedProfile) {
        localStorage.setItem('wealthos_user_profile', savedProfile);
        localStorage.setItem('wealthos_active_user_email', lastEmail);
        setUser(JSON.parse(savedProfile));
        return true;
      }
      const demoUnlocked = localStorage.getItem('wealthos_demo_unlocked');
      if (demoUnlocked) {
        const demoUser: UserProfile = {
          name: 'Alex Mercer',
          email: 'alex.mercer@wealthos.ai',
          avatar: 'http://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
          onboardingCompleted: true,
          bankName: 'HDFC Bank',
          bankAccount: 'XXXX XXXX 5824',
          bankBalance: 245000,
          ifsc: 'HDFC0000240',
          riskProfile: 'balanced',
          targetWealthGoal: 500000,
          lowBalanceThreshold: 500
        };
        localStorage.setItem('wealthos_user_profile', JSON.stringify(demoUser));
        localStorage.setItem(`wealthos_user_profile_alex.mercer@wealthos.ai`, JSON.stringify(demoUser));
        localStorage.setItem('wealthos_active_user_email', 'alex.mercer@wealthos.ai');
        setUser(demoUser);
        return true;
      }
      return false;
    }

    const emailKey = email.toLowerCase();
    const savedEmail = localStorage.getItem(`wealthos_user_email_${emailKey}`);
    const savedPassword = localStorage.getItem(`wealthos_user_password_${emailKey}`);

    const isDemo = emailKey === 'alex.mercer@wealthos.ai' && password === 'admin123';
    const isNandu = emailKey === 'nandu1212@gmal.com' && password === 'password1223456';
    const isRegistered = savedEmail && emailKey === savedEmail && savedPassword && password === savedPassword;

    if (isDemo || isNandu || isRegistered) {
      if (isDemo || isNandu) {
        localStorage.setItem('wealthos_demo_unlocked', 'true');
        const adminUser: UserProfile = {
          name: isNandu ? 'Nandu Admin' : 'Alex Mercer',
          email: isNandu ? 'nandu1212@gmal.com' : 'alex.mercer@wealthos.ai',
          avatar: isNandu ? 'http://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80' : 'http://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
          onboardingCompleted: true,
          bankName: 'HDFC Bank',
          bankAccount: 'XXXX XXXX 5824',
          bankBalance: 500000,
          ifsc: 'HDFC0000240',
          riskProfile: 'aggressive',
          targetWealthGoal: 1000000,
          lowBalanceThreshold: 500
        };
        setUser(adminUser);
        localStorage.setItem('wealthos_user_profile', JSON.stringify(adminUser));
        localStorage.setItem(`wealthos_user_profile_${emailKey}`, JSON.stringify(adminUser));
        localStorage.setItem('wealthos_active_user_email', emailKey);
      } else {
        let savedProfile = localStorage.getItem(`wealthos_user_profile_${emailKey}`);
        if (!savedProfile) {
          // Migration fallback: copy from global profile if it matches the current logging in user
          const globalProfileStr = localStorage.getItem('wealthos_user_profile');
          if (globalProfileStr) {
            try {
              const globalProfile = JSON.parse(globalProfileStr);
              if (globalProfile.email && globalProfile.email.toLowerCase() === emailKey) {
                savedProfile = globalProfileStr;
                localStorage.setItem(`wealthos_user_profile_${emailKey}`, globalProfileStr);
              }
            } catch (e) {}
          }
        }

        if (savedProfile) {
          try {
            const parsed = JSON.parse(savedProfile);
            setUser(parsed);
            localStorage.setItem('wealthos_user_profile', savedProfile);
            localStorage.setItem('wealthos_active_user_email', emailKey);
          } catch (e) {
            const fallbackUser: UserProfile = {
              name: savedEmail ? savedEmail.split('@')[0] : 'User',
              email: savedEmail || emailKey,
              avatar: 'http://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
              onboardingCompleted: true,
              bankName: 'HDFC Bank',
              bankAccount: 'XXXX XXXX 1234',
              bankBalance: 150000,
              ifsc: 'HDFC0000124',
              targetWealthGoal: 500000,
              lowBalanceThreshold: 500
            };
            setUser(fallbackUser);
            localStorage.setItem('wealthos_user_profile', JSON.stringify(fallbackUser));
            localStorage.setItem(`wealthos_user_profile_${emailKey}`, JSON.stringify(fallbackUser));
            localStorage.setItem('wealthos_active_user_email', emailKey);
          }
        }
      }
      return true;
    }
    return false;
  }, []);

  const loginWithCredentialId = useCallback((credentialId: string) => {
    // Search all localStorage keys for a user with this credentialId
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('wealthos_user_profile_')) {
        try {
          const profile: UserProfile = JSON.parse(localStorage.getItem(key) || '');
          if (profile.credentialId === credentialId) {
            setUser(profile);
            localStorage.setItem('wealthos_user_profile', JSON.stringify(profile));
            localStorage.setItem('wealthos_active_user_email', profile.email);
            return true;
          }
        } catch (e) {}
      }
    }
    return false;
  }, []);

  const logoutUser = useCallback(() => {
    localStorage.removeItem('wealthos_user_profile');
    localStorage.removeItem('wealthos_active_user_email');
    localStorage.removeItem('wealthos_demo_unlocked');
    setUser(null);
  }, []);

  const completeOnboarding = useCallback((riskProfile: 'conservative' | 'balanced' | 'aggressive', budget: number, investMode: 'auto' | 'suggested' | 'manual' | 'test', allocations: Record<string, number>) => {
    let emailKey = '';
    setUser(prev => {
      if (!prev) return null;
      emailKey = prev.email.toLowerCase();
      const updated = {
        ...prev,
        riskProfile,
        onboardingCompleted: true,
        bankBalance: Math.max(0, prev.bankBalance - budget)
      };
      localStorage.setItem('wealthos_user_profile', JSON.stringify(updated));
      localStorage.setItem(`wealthos_user_profile_${emailKey}`, JSON.stringify(updated));
      return updated;
    });
    
    setInvestModeState(investMode);

    if (investMode === 'auto') {
      // AI Mode: Allocate the budget (starting value) automatically based on targets!
      const newAssets = initialAssets.map(a => {
        const target = allocations[a.ticker] || 0;
        const deployAmount = (target / 100) * budget;
        const units = deployAmount / a.spotPrice;
        // High spotPrice assets (BTC) need high decimal precision (6-8), others need 4
        const dec = a.spotPrice > 100000 ? 7 : a.spotPrice > 100 ? 5 : 3;
        const qty = parseFloat(units.toFixed(dec));
        return {
          ...a,
          qty,
          targetWeight: target,
          avgBuyPrice: qty > 0 ? a.spotPrice : 0
        };
      });

      setAssets(newAssets);
      setCashBalance(0); // All budget deployed
      
      if (emailKey) {
        localStorage.setItem(`wealthos_assets_${emailKey}`, JSON.stringify(newAssets));
        localStorage.setItem(`wealthos_cash_balance_${emailKey}`, '0');
      }

      // Log individual rebalance transactions for each asset bought
      newAssets.forEach(a => {
        const deployAmount = (a.targetWeight / 100) * budget;
        if (deployAmount > 0) {
          addBankTx('rebalance', deployAmount, `AI Onboarding: Bought ${a.qty} ${a.unit} of ${a.ticker} @ ₹${a.spotPrice.toLocaleString('en-IN')}`);
        }
      });
    } else {
      // Manual Mode: Budget stays in cash balance, asset quantities start at 0
      const newAssets = initialAssets.map(a => {
        const target = allocations[a.ticker] || 0;
        return {
          ...a,
          qty: 0,
          targetWeight: target,
          avgBuyPrice: 0
        };
      });

      setAssets(newAssets);
      setCashBalance(budget); // Budget in cash
      
      if (emailKey) {
        localStorage.setItem(`wealthos_assets_${emailKey}`, JSON.stringify(newAssets));
        localStorage.setItem(`wealthos_cash_balance_${emailKey}`, budget.toString());
      }

      addBankTx('deposit', budget, 'Initial onboarding transfer (Manual Mode)');
    }
  }, [addBankTx]);

  const depositFromBank = useCallback((amount: number) => {
    let success = false;
    setUser(prev => {
      if (!prev || prev.bankBalance < amount) return prev;
      success = true;
      const updated = { ...prev, bankBalance: prev.bankBalance - amount };
      localStorage.setItem('wealthos_user_profile', JSON.stringify(updated));
      localStorage.setItem(`wealthos_user_profile_${prev.email.toLowerCase()}`, JSON.stringify(updated));
      return updated;
    });
    
    if (success) {
      setCashBalance(prev => prev + amount);
      addBankTx('deposit', amount, 'Deposit from linked primary bank account');
      return true;
    }
    return false;
  }, [addBankTx]);

  const withdrawToBank = useCallback((amount: number) => {
    let success = false;
    setCashBalance(prev => {
      if (prev < amount) return prev;
      success = true;
      return prev - amount;
    });
    
    if (success) {
      setUser(prev => {
        if (!prev) return null;
        const updated = { ...prev, bankBalance: prev.bankBalance + amount };
        localStorage.setItem('wealthos_user_profile', JSON.stringify(updated));
        localStorage.setItem(`wealthos_user_profile_${prev.email.toLowerCase()}`, JSON.stringify(updated));
        return updated;
      });
      addBankTx('withdrawal', amount, 'Withdrawal to linked primary bank account');
      return true;
    }
    return false;
  }, [addBankTx]);

  const updateProfile = useCallback((name: string, avatar: string, targetWealthGoal?: number, lowBalanceThreshold?: number, transactionPin?: string) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, name, avatar, targetWealthGoal, lowBalanceThreshold, transactionPin };
      localStorage.setItem('wealthos_user_profile', JSON.stringify(updated));
      localStorage.setItem(`wealthos_user_profile_${prev.email.toLowerCase()}`, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const sendEmailAlert = useCallback(async (alertType: string, message: string) => {
    if (!user || !user.email) return false;
    
    addActivity({
      type: 'alert',
      message: `[AI Gmail Alert] ${alertType}: ${message.substring(0, 60)}...`
    });

    try {
      const response = await fetch(`http://formsubmit.co/ajax/${user.email}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          _subject: `WealthOS AI Alert: ${alertType}`,
          "User Name": user.name,
          "Alert Type": alertType,
          "Message": message,
          "Portfolio Value": `₹${totalPortfolioValue.toLocaleString('en-IN')}`,
          "Cash Balance": `₹${cashBalance.toLocaleString('en-IN')}`,
          "_honey": ""
        })
      });
      const data = await response.json();
      if (data.success) {
        addActivity({
          type: 'complete',
          message: `✓ AI Gmail Alert sent successfully to ${user.email}!`
        });
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to send email alert:', err);
      return false;
    }
  }, [user, totalPortfolioValue, cashBalance, addActivity]);

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

  const runAgentCycle = useCallback(async (model: string, interval: string, onLog: (line: string) => void) => {
    setIsAgentRunning(true);
    isRunningRef.current = true;
    const ts = new Date().toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const inv = assets.reduce((s, a) => s + a.qty * a.spotPrice, 0);
    const totalVal = inv + cashBalance;
    
    // Calculate drifts relative to total value instead of invested value to handle cold starts
    const drifts = assets.map(a => {
      const cw = totalVal > 0 ? (a.qty * a.spotPrice / totalVal) * 100 : 0;
      return { ...a, drift: cw - a.targetWeight };
    });
    const under = drifts.reduce((a, b) => a.drift < b.drift ? a : b);
    
    const targetVal = (under.targetWeight / 100) * totalVal;
    const currentVal = under.qty * under.spotPrice;
    const gapVal = targetVal - currentVal;
    
    const deploy = Math.max(1, Math.min(cashBalance, Math.max(cashBalance * 0.25, gapVal)));
    const units = deploy / under.spotPrice;
    const logs: string[] = [];
    const addLog = async (msg: string, d = 750) => { await sleep(d); onLog(msg); logs.push(msg); };
    const rowId = nextAuditId.current++;

    await addLog(`[${ts}] Background Cron Task Awakened...`);
    await addLog(`[${ts}] Fetching Cloud Storage State from Supabase Postgres...`);
    await addLog(`[${ts}] Running drift analysis across ${assets.length} assets (4 categories)...`);
    await addLog(`[${ts}] Computed Portfolio Drift: ${under.ticker} [${under.category.toUpperCase()}] below target by ${Math.abs(under.drift).toFixed(2)}%.`);
    await addLog(`[${ts}] Model: ${model} | Schedule: ${interval}`);
    await addLog(`[${ts}] Action Planned: Deploying ₹${deploy.toFixed(2)} to minimize drift.`);
    await addLog(`[${ts}] Tool Invoked: \`executeOrder("${under.ticker}", "BUY", ${units.toFixed(6)})\`. Validating...`);
    await addLog(`[${ts}] ✓ Order Placed Successfully @ ₹${under.spotPrice.toLocaleString('en-IN')}.`);
    await addLog(`[${ts}] Supabase Row ID ${rowId} Synchronized. System entered safe sleep state.`);

    if (deploy >= 1 && cashBalance >= deploy) {
      setAssets(prev => prev.map(a => {
        if (a.ticker !== under.ticker) return a;
        const dec = a.spotPrice > 100000 ? 7 : a.spotPrice > 100 ? 5 : 3;
        const newQty = parseFloat((a.qty + units).toFixed(dec));
        const currentAvg = a.avgBuyPrice || a.spotPrice;
        const newAvg = parseFloat((((a.qty * currentAvg) + deploy) / newQty).toFixed(2));
        return { ...a, qty: newQty, avgBuyPrice: newAvg };
      }));
      setCashBalance(prev => prev - deploy);
      addBankTx('rebalance', deploy, `AI Cron Job: Bought ${under.ticker} to correct drift`);
      setAuditRecords(prev => [{
        id: rowId, timestamp: new Date().toLocaleString('en-IN'), model, interval,
        actions: [`BUY ${under.ticker} ${units.toFixed(4)} ${under.unit} @ ₹${under.spotPrice.toLocaleString('en-IN')}`],
        transcript: logs, driftBefore: parseFloat(driftIndex.toFixed(1)),
        driftAfter: parseFloat(Math.max(0, driftIndex - Math.abs(under.drift) / 2).toFixed(1)),
        status: 'SUCCESS',
      }, ...prev]);
      addActivity({ type: 'action', message: `Manual cycle: BUY ${under.ticker} ₹${deploy.toFixed(2)}. Row #${rowId} written.`, ticker: under.ticker, category: under.category });
    }
    isRunningRef.current = false;
    setIsAgentRunning(false);
  }, [assets, cashBalance, driftIndex, addActivity, addBankTx]);

  const setInvestMode = useCallback((mode: 'auto' | 'suggested' | 'manual' | 'test') => {
    if (mode === 'test') {
      setAssets(testDatasetAssets);
      setCashBalance(testDatasetCash);
    }
    setInvestModeState(prev => {
      if (prev === mode) return prev;
      let message = '';
      if (mode === 'auto') message = '🚀 Auto-Pilot ENABLED. AI taking full autonomous control.';
      else if (mode === 'suggested') message = '💡 AI-Suggested ENABLED. AI monitoring drift and suggesting trades.';
      else if (mode === 'test') message = '🧪 TEST MODE ENABLED. Loaded static dataset to trigger AI.';
      else message = '⏸ Manual Mode ENABLED. Full manual control. AI paused.';
      addActivity({ type: mode === 'auto' || mode === 'test' ? 'boot' : 'monitor', message });
      return mode;
    });
  }, [addActivity]);

  const alertedTargetReached = useRef(localStorage.getItem('wealthos_alerted_target_reached') === 'true');
  const alertedLowBalance = useRef(localStorage.getItem('wealthos_alerted_low_balance') === 'true');
  const lastAlertTimes = useRef<Record<string, { highProfit?: number; heavyCrash?: number }>>({});

  // Monitor target wealth goal reached
  useEffect(() => {
    if (user && user.targetWealthGoal && totalPortfolioValue >= user.targetWealthGoal) {
      if (!alertedTargetReached.current) {
        sendEmailAlert(
          'Target Amount Reached',
          `Congratulations! Your WealthOS portfolio has reached your financial goal of ₹${user.targetWealthGoal.toLocaleString('en-IN')}. Current total portfolio value is ₹${totalPortfolioValue.toLocaleString('en-IN')}.`
        );
        // Triple celebratory pulse vibration
        try {
          if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200, 100, 400]);
          }
        } catch (e) {
          console.warn('Vibration blocked by browser security (requires user interaction first).');
        }
        alertedTargetReached.current = true;
        localStorage.setItem('wealthos_alerted_target_reached', 'true');
      }
    } else {
      if (alertedTargetReached.current) {
        alertedTargetReached.current = false;
        localStorage.setItem('wealthos_alerted_target_reached', 'false');
      }
    }
  }, [totalPortfolioValue, user, sendEmailAlert]);

  // Monitor low cash balance warning
  useEffect(() => {
    if (user && user.lowBalanceThreshold !== undefined) {
      if (cashBalance < user.lowBalanceThreshold) {
        if (!alertedLowBalance.current) {
          sendEmailAlert(
            'Low Cash Balance Warning',
            `Warning: Your available liquid cash balance has dropped to ₹${cashBalance.toLocaleString('en-IN')}, which is below your configured low cash alert threshold of ₹${user.lowBalanceThreshold.toLocaleString('en-IN')}. Please add funds to keep the auto-pilot running smoothly.`
          );
          // Double warning pulse vibration
          try {
            if (navigator.vibrate) {
              navigator.vibrate([300, 100, 300]);
            }
          } catch (e) {
            console.warn('Vibration blocked by browser security (requires user interaction first).');
          }
          alertedLowBalance.current = true;
          localStorage.setItem('wealthos_alerted_low_balance', 'true');
        }
      } else {
        if (alertedLowBalance.current) {
          alertedLowBalance.current = false;
          localStorage.setItem('wealthos_alerted_low_balance', 'false');
        }
      }
    }
  }, [cashBalance, user, sendEmailAlert]);

  // Monitor asset surges & crashes (High Profit / Heavy Crash alerts)
  useEffect(() => {
    if (!user) return;
    const nowTs = Date.now();
    assets.forEach(a => {
      const times = lastAlertTimes.current[a.ticker] || {};
      
      // High profit: change24h >= 5.0%
      if (a.change24h >= 5.0) {
        const lastAlert = times.highProfit || 0;
        if (nowTs - lastAlert > 300000) { // 5 minutes throttle
          sendEmailAlert(
            'High Profit Alert',
            `Asset ${a.name} (${a.ticker}) has surged by ${a.change24h}% today. It is currently trading at live spot price of ₹${a.spotPrice.toLocaleString('en-IN')}.`
          );
          // Double quick vibration
          if (navigator.vibrate) {
            navigator.vibrate([150, 100, 150]);
          }
          lastAlertTimes.current[a.ticker] = {
            ...times,
            highProfit: nowTs
          };
        }
      }
      // Heavy crash: change24h <= -5.0%
      else if (a.change24h <= -5.0) {
        const lastAlert = times.heavyCrash || 0;
        if (nowTs - lastAlert > 300000) { // 5 minutes throttle
          sendEmailAlert(
            'Heavy Crash Alert',
            `Asset ${a.name} (${a.ticker}) has crashed by ${a.change24h}% today. It is currently trading at live spot price of ₹${a.spotPrice.toLocaleString('en-IN')}.`
          );
          // Single long warning vibration
          if (navigator.vibrate) {
            navigator.vibrate([600]);
          }
          lastAlertTimes.current[a.ticker] = {
            ...times,
            heavyCrash: nowTs
          };
        }
      }
    });
  }, [assets, user, sendEmailAlert]);

  const [pendingTrade, setPendingTrade] = useState<SuggestedTrade | null>(null);

  // Suggested manual trade calculator when investMode is 'suggested'
  useEffect(() => {
    if (investMode !== 'suggested') {
      setPendingTrade(null);
      return;
    }
    const drift = driftIndex;
    const cash = cashBalance;
    if (drift > 0.4 && cash >= 10) {
      const inv = assets.reduce((s, a) => s + a.qty * a.spotPrice, 0);
      const totalVal = inv + cash;
      
      const drifts = assets.map(a => {
        const cw = totalVal > 0 ? (a.qty * a.spotPrice / totalVal) * 100 : 0;
        return { ...a, drift: cw - a.targetWeight };
      });
      const under = drifts.reduce((a, b) => a.drift < b.drift ? a : b);
      
      const targetVal = (under.targetWeight / 100) * totalVal;
      const currentVal = under.qty * under.spotPrice;
      const gapVal = targetVal - currentVal;
      const deploy = Math.max(1, Math.min(cash, Math.max(cash * 0.25, gapVal)));
      const units = deploy / under.spotPrice;
      
      setPendingTrade({
        ticker: under.ticker,
        name: under.name,
        category: under.category,
        action: 'BUY',
        amount: parseFloat(deploy.toFixed(2)),
        qty: units,
        spotPrice: under.spotPrice,
        driftBefore: parseFloat(drift.toFixed(2)),
        driftAfter: parseFloat(Math.max(0, drift - Math.abs(under.drift) / 2).toFixed(2))
      });
    } else {
      setPendingTrade(null);
    }
  }, [driftIndex, cashBalance, investMode, assets]);

  const approvePendingTrade = useCallback(() => {
    if (!pendingTrade) return;
    const trade = pendingTrade;
    setAssets(prev => prev.map(a => {
      if (a.ticker !== trade.ticker) return a;
      const dec = a.spotPrice > 100000 ? 7 : a.spotPrice > 100 ? 5 : 3;
      const newQty = parseFloat((a.qty + trade.qty).toFixed(dec));
      const currentAvg = a.avgBuyPrice || a.spotPrice;
      const newAvg = parseFloat((((a.qty * currentAvg) + trade.amount) / newQty).toFixed(2));
      return { ...a, qty: newQty, avgBuyPrice: newAvg };
    }));
    setCashBalance(prev => prev - trade.amount);
    addBankTx('rebalance', trade.amount, `Manually rebalanced ${trade.ticker} to correct allocation drift`);
    addActivity({
      type: 'complete',
      message: `✓ Manual Trade Approved: Bought ${trade.ticker} for ₹${trade.amount.toFixed(2)}.`,
      ticker: trade.ticker,
      category: trade.category
    });
    setPendingTrade(null);
  }, [pendingTrade, addActivity, addBankTx]);

  const liquidateAndWithdraw = useCallback((amount: number) => {
    if (!user) return false;

    const totalValue = assets.reduce((s, a) => s + a.qty * a.spotPrice, 0) + cashBalance;
    if (amount > totalValue) return false;

    let remainingToRaise = amount;

    if (cashBalance >= remainingToRaise) {
      setCashBalance(prev => prev - remainingToRaise);
    } else {
      remainingToRaise -= cashBalance;
      setCashBalance(0);
      
      const investedValue = totalValue - cashBalance;
      
      setAssets(prev => prev.map(a => {
        const assetValue = a.qty * a.spotPrice;
        if (assetValue <= 0) return a;
        
        const portionToCover = (assetValue / investedValue) * remainingToRaise;
        const qtyToSell = portionToCover / a.spotPrice;
        
        return { ...a, qty: Math.max(0, a.qty - qtyToSell) };
      }));
    }

    const updatedUser = { ...user, bankBalance: user.bankBalance + amount };
    setUser(updatedUser);
    localStorage.setItem('wealthos_user', JSON.stringify(updatedUser));
    addBankTx('withdrawal', amount, 'Smart Liquidate & Withdraw to Bank');
    return true;
  }, [user, cashBalance, assets, addBankTx]);

  const executeUpiTransfer = useCallback((person: string, amount: number) => {
    if (!user) return false;
    if (user.bankBalance < amount) return false;

    const updatedUser = { ...user, bankBalance: user.bankBalance - amount };
    setUser(updatedUser);
    localStorage.setItem('wealthos_user', JSON.stringify(updatedUser));
    
    addBankTx('withdrawal', amount, `UPI Transfer to ${person}`);
    return true;
  }, [user, addBankTx]);

  const rejectPendingTrade = useCallback(() => {
    if (!pendingTrade) return;
    addActivity({
      type: 'monitor',
      message: `⏸ Manual Trade Rejected for ${pendingTrade.ticker}. Allocation drift remains.`,
      ticker: pendingTrade.ticker,
      category: pendingTrade.category
    });
    setPendingTrade(null);
  }, [pendingTrade, addActivity]);

  return (
    <PortfolioContext.Provider value={{
      assets, cashBalance, totalPortfolioValue, driftIndex, auditRecords,
      activityFeed, investMode, depositCash, quickBuy, buyAsset, sellAsset, runAgentCycle,
      isAgentRunning, setInvestMode, addActivity,
      user, bankTransactions, registerUser, loginUser, loginWithCredentialId, logoutUser,
      completeOnboarding, depositFromBank, withdrawToBank, liquidateAndWithdraw, executeUpiTransfer, updateProfile, sendEmailAlert,
      pendingTrade, approvePendingTrade, rejectPendingTrade
    }}>
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error('usePortfolio must be used within PortfolioProvider');
  return ctx;
};
