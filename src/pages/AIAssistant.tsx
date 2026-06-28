import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, Send, RefreshCw, Zap, Activity, Power, PowerOff, Mic, Volume2, VolumeX, Sparkles, ChevronDown } from 'lucide-react';
import { usePortfolio, type ActivityItem } from '../context/PortfolioContext';

interface ChatMessage {
  id: number; role: 'user' | 'ai'; content: string; thought?: string; timestamp: string; isStreaming?: boolean;
}

const msgId = { current: 1 };

const QUICK_QUESTIONS = [
  "What is my portfolio doing right now?",
  "Which asset should I invest in next?",
  "Suggest a budget allocation for a Conservative Portfolio",
  "How does the AI Autopilot minimize drift?",
  "What is my current bank and deposit history?",
  "Where is my highest risk?",
  "Give me a crypto market summary",
  "Am I close to my target allocation?",
];

const ACTIVITY_ICONS: Record<ActivityItem['type'], string> = {
  scan: '🔍', action: '⚡', complete: '✅', monitor: '👁', alert: '⚠️', boot: '🚀',
};
const ACTIVITY_COLORS: Record<ActivityItem['type'], string> = {
  scan: 'text-blue-400', action: 'text-amber-400', complete: 'text-emerald-400',
  monitor: 'text-zinc-400', alert: 'text-orange-400', boot: 'text-purple-400',
};

const fmt = (n: number) => n.toLocaleString('en-IN', { maximumFractionDigits: 0 });
const fmtV = (v: number) => v > 100000 ? `₹${(v / 100000).toFixed(2)}L` : `₹${fmt(v)}`;

interface AIResponse {
  thought: string;
  content: string;
}

const ThoughtAccordion: React.FC<{ thought: string }> = ({ thought }) => {
  const [expanded, setExpanded] = useState(true);
  return (
    <div className="w-full rounded-xl border border-amber-500/10 bg-amber-500/5 overflow-hidden transition-all text-[10px] mb-1.5 max-w-[85%] self-start">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-3 py-1.5 flex items-center justify-between text-amber-400 font-bold hover:bg-amber-500/5 transition-all text-left font-mono"
      >
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 animate-pulse text-amber-400" />
          {expanded ? 'Thought Process' : 'Show Thought Process'}
        </span>
        <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>
      {expanded && (
        <div className="px-3 pb-2 pt-1 border-t border-amber-500/10 text-zinc-400 leading-relaxed whitespace-pre-line font-mono text-[9px] bg-[#09090b]/45">
          {thought}
        </div>
      )}
    </div>
  );
};

const AIAssistant: React.FC = () => {
  const { assets, cashBalance, totalPortfolioValue, driftIndex, activityFeed, investMode, setInvestMode, auditRecords, user, bankTransactions, executeUpiTransfer } = usePortfolio();
  
  // Chat History
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: msgId.current++, role: 'ai', timestamp: new Date().toLocaleTimeString('en-IN'),
    content: `Hello ${user?.name || 'there'}! I'm your WealthOS AI Wealth Manager. 🤖\n\nI'm currently running in **${investMode === 'auto' ? 'Auto-Pilot mode' : investMode === 'suggested' ? 'AI-Suggested mode' : 'Manual mode'}** — monitoring your portfolio of **16 assets** across Metals, Stocks, Mutual Funds, and Crypto.\n\nYour portfolio is currently valued at **${fmtV(totalPortfolioValue)}** with a drift index of **${driftIndex.toFixed(2)}%**.\n\nYour linked account is at **${user?.bankName}** with ₹${user?.bankBalance.toLocaleString('en-IN')} available.\n\nWhat would you like to know? You can ask me about allocation budgets, rebalancer drift, or bank deposits!`,
  }]);
  
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [activePanel, setActivePanel] = useState<'chat' | 'feed'>('chat');
  
  // Voice Synthesis & Input States
  const [isListening, setIsListening] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(false);
  
  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const finalTranscriptRef = useRef('');

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  const generateResponse = useCallback((message: string): AIResponse => {
    const msg = message.toLowerCase();
    
    // Safety abusive scan
    const abusiveWords = [
      'fuck', 'shit', 'bastard', 'crap', 'idiot', 'stupid', 'dumb', 
      'useless', 'trash', 'suck', 'nonsense', 'abusive', 'aggregator', 'scam', 'hacked',
      'bitch', 'asshole', 'cunt', 'dick'
    ];
    const isAbusive = abusiveWords.some(w => msg.includes(w));
    
    if (isAbusive) {
      return {
        thought: `uhh... wait... scanning input query safety tokens: "${message}"\n2. Safety policy triggered: Offensive or inappropriate content pattern matched.\n3. Action: Halt normal portfolio context synthesis. Generate safety advisory warning.\n4. Formatting warning output...`,
        content: `⚠️ **WealthOS Security Advisory**\n\nI noticed some inappropriate or abusive language in your query. As your WealthOS AI Wealth Assistant, I am designed to assist you with portfolio analytics, rebalancing diagnostics, and general financial inquiries in a professional and respectful environment.\n\nPlease keep our messages clean, and feel free to ask me about your asset weights, bank transfers, or standard investment rules instead!`
      };
    }

    const inv = assets.reduce((s, a) => s + a.qty * a.spotPrice, 0);
    const byCategory = {
      metals:       assets.filter(a => a.category === 'metals'),
      stocks:       assets.filter(a => a.category === 'stocks'),
      mutual_funds: assets.filter(a => a.category === 'mutual_funds'),
      crypto:       assets.filter(a => a.category === 'crypto'),
    };
    const catValues = {
      metals:       byCategory.metals.reduce((s, a) => s + a.qty * a.spotPrice, 0),
      stocks:       byCategory.stocks.reduce((s, a) => s + a.qty * a.spotPrice, 0),
      mutual_funds: byCategory.mutual_funds.reduce((s, a) => s + a.qty * a.spotPrice, 0),
      crypto:       byCategory.crypto.reduce((s, a) => s + a.qty * a.spotPrice, 0),
    };
    const drifts = assets.map(a => ({ ...a, drift: (a.qty * a.spotPrice / inv) * 100 - a.targetWeight }));
    const mostUnder = drifts.reduce((a, b) => a.drift < b.drift ? a : b);
    const bestAsset = [...assets].sort((a, b) => b.change24h - a.change24h)[0];
    const worstAsset = [...assets].sort((a, b) => a.change24h - b.change24h)[0];

    // Greetings: User asked hello -> AI answers hi
    if (msg === 'hi' || msg === 'hello' || msg === 'hey' || msg === 'good morning' || msg === 'good afternoon') {
      return {
        thought: `uhh... wait... greeting tokens detected: "${message}". Let's greet them back with a simple, friendly "hi" response. I will also remind them about their current WealthOS context, verifying their name: ${user?.name || 'user'}.`,
        content: `Hi ${user?.name || 'there'}! 👋\n\nI'm ready to assist you. Would you like to review today's portfolio updates, analyze allocation drift, or run bank diagnostics?`
      };
    }

    // UPI Transfer Check
    const upiMatch1 = msg.match(/(?:send|pay|transfer)\s+(?:to\s+)?([a-z0-9\s@\.\-]+?)\s+(?:rs|rupees|₹)?\s*(\d+)/i);
    const upiMatch2 = msg.match(/(?:send|pay|transfer)\s+(?:rs|rupees|₹)?\s*(\d+)\s+(?:to\s+)?([a-z0-9\s@\.\-]+?)(?=\s+pin|$)/i);
    const upiMatch = upiMatch1 || upiMatch2;
    
    if (upiMatch && (msg.includes('send') || msg.includes('pay') || msg.includes('transfer'))) {
      let amountStr = '';
      let person = '';
      
      if (upiMatch1) {
        person = upiMatch1[1].trim().toLowerCase();
        amountStr = upiMatch1[2];
      } else if (upiMatch2) {
        amountStr = upiMatch2[1];
        person = upiMatch2[2].trim().toLowerCase();
      }
      
      const amount = parseInt(amountStr);
      
      // Contact Validation
      const mockContacts = ['nandu', 'person a', 'john', 'alice', 'bob'];
      const isUpi = person.includes('@') || /^\d{10}$/.test(person);
      if (!mockContacts.includes(person) && !isUpi) {
        return {
          thought: `uhh... wait... user is trying to send to "${person}" which is neither a known contact nor a valid UPI format. Rejecting.`,
          content: `❌ **Transaction Failed**\n\nRecipient "${person}" does not exist in your contacts.\n\nPlease provide a valid UPI number (e.g., 9876543210@upi or a 10-digit mobile number).`
        };
      }

      const pinMatch = msg.match(/pin\s*[:\-]?\s*(\d{4})/i) || msg.match(/\b(\d{4})\b/);

      if (!pinMatch) {
        return {
          thought: `uhh... wait... user is trying to send money to ${person} but I don't see a 4-digit PIN. Rejecting transaction.`,
          content: `⚠️ **Transaction Failed**\n\nSecurity verification failed. Please provide your 4-digit UPI PIN in the same message to authorize the transfer of ₹${amount} to ${person}.\n\nExample: *"Send ${person} ${amount} PIN 1234"*`
        };
      }

      const pin = pinMatch[1];
      const expectedPin = user?.transactionPin || '1234';
      if (pin !== expectedPin) {
        return {
          thought: `uhh... wait... user is trying to send money but provided the wrong PIN (${pin}). Expected PIN is ${expectedPin}. Rejecting.`,
          content: `🚨 **Transaction Denied**\n\nInvalid PIN entered. For your security, this transaction has been blocked.`
        };
      }

      const success = executeUpiTransfer(person, amount);
      if (success) {
        return {
          thought: `uhh... wait... user requested a transfer of ${amount} to ${person} with correct PIN. Executing via PortfolioContext.`,
          content: `✅ **Transaction Successful**\n\nSuccessfully transferred **₹${amount.toLocaleString('en-IN')}** to **${person.toUpperCase()}**.\n\nThe funds have been deducted from your linked bank account. You can view this in your Banking Hub.`
        };
      } else {
        return {
          thought: `uhh... wait... user requested transfer but has insufficient bank balance.`,
          content: `❌ **Transaction Failed**\n\nInsufficient funds in your linked bank account to transfer ₹${amount.toLocaleString('en-IN')}.`
        };
      }
    }

    // Today's updates / detailed report
    if (msg.includes('update') || msg.includes('report') || msg.includes('detail')) {
      return {
        thought: `uhh... let's see... user is asking for today's updates and a detailed report. Let me analyze all 16 assets...\n- Gold & Silver: metals weight ${(catValues.metals / inv * 100).toFixed(1)}%\n- Equity: 5 NSE stocks weight ${(catValues.stocks / inv * 100).toFixed(1)}%\n- MFs: 4 schemes weight ${(catValues.mutual_funds / inv * 100).toFixed(1)}%\n- Crypto: 5 tokens weight ${(catValues.crypto / inv * 100).toFixed(1)}%\n- Drift index: ${driftIndex.toFixed(2)}%\n- Cash balance: ₹${cashBalance.toLocaleString('en-IN')}\nLet's construct a detailed markdown ledger report containing all details.`,
        content: `📊 **WealthOS Pro - Account Health & Discovery Report**\n*Generated at: ${new Date().toLocaleString('en-IN')}*\n\n---\n\n### 🚀 Executive Summary\n• **Total Portfolio Valuation:** **${fmtV(totalPortfolioValue)}**\n• **Invested Capital:** **${fmtV(inv)}**\n• **Available Liquid Balance:** **${fmtV(cashBalance)}**\n• **Drift Compliance index:** **${driftIndex.toFixed(2)}%** (Status: ${driftIndex < 1 ? '🟢 Safe' : '🟡 Warning'})\n• **Engine Mode:** **${investMode === 'auto' ? 'ACTIVE (Auto)' : investMode === 'suggested' ? 'SUGGESTED (Manual Execution)' : 'PAUSED (Manual Only)'}**\n\n### 📈 Active Market Movements\n• **Top Performing Holding:** **${bestAsset.ticker}** (${bestAsset.name}) is trading at **${fmtV(bestAsset.spotPrice)}** | **+${bestAsset.change24h.toFixed(2)}%** today.\n• **Worst Performing Holding:** **${worstAsset.ticker}** (${worstAsset.name}) is trading at **${fmtV(worstAsset.spotPrice)}** | **${worstAsset.change24h.toFixed(2)}%** today.\n\n### 💼 Position & Sector Breakdown\n• **🥈 Precious Metals:** ${fmtV(catValues.metals)} (${(catValues.metals / inv * 100).toFixed(1)}% weight)\n• **📈 NSE Stocks:** ${fmtV(catValues.stocks)} (${(catValues.stocks / inv * 100).toFixed(1)}% weight)\n• **📊 Mutual Funds:** ${fmtV(catValues.mutual_funds)} (${(catValues.mutual_funds / inv * 100).toFixed(1)}% weight)\n• **₿ Cryptocurrencies:** ${fmtV(catValues.crypto)} (${(catValues.crypto / inv * 100).toFixed(1)}% weight)\n\n### 🏦 Cash Flow & Liquidity\n• **Bank Account Link:** ${user?.bankName} (${user?.bankAccount})\n• **Available funds in Bank:** ₹${user?.bankBalance.toLocaleString('en-IN')}\n• **Last Deposit/Withdrawal:** ${bankTransactions[0]?.description || 'None'}\n\n### ⚡ Auto-Rebalance Suggestions\n• Underweighted target: **${mostUnder.ticker}** (${Math.abs(mostUnder.drift).toFixed(1)}% below target).\n• Suggested Action: Deploy ₹${Math.round(Math.min(cashBalance * 0.3, Math.abs(mostUnder.drift) * inv / 100)).toLocaleString('en-IN')} to correct drift.\n\n*Use the Banking tab to download a secure PDF version of this report.*`
      };
    }

    if (msg.includes('portfolio') || msg.includes('overview') || msg.includes('summary') || msg.includes('doing')) {
      return {
        thought: `uhh... wait... user wants a summary of the portfolio. Let me fetch current values...\n- Total: ${totalPortfolioValue}\n- Cash: ${cashBalance}\n- Drift: ${driftIndex.toFixed(2)}%\nLet's format the summary with beautiful emojis and percentages.`,
        content: `Here's your live portfolio summary:\n\n💰 **Total Value:** ${fmtV(totalPortfolioValue)}\n📊 **Invested:** ${fmtV(inv)}\n💵 **Cash Balance:** ${fmtV(cashBalance)}\n🎯 **Drift Index:** ${driftIndex.toFixed(2)}%\n\n**Category Breakdown:**\n• 🥇 Metals: ${fmtV(catValues.metals)} (${(catValues.metals / inv * 100).toFixed(1)}%)\n• 📈 Stocks: ${fmtV(catValues.stocks)} (${(catValues.stocks / inv * 100).toFixed(1)}%)\n• 📊 Mutual Funds: ${fmtV(catValues.mutual_funds)} (${(catValues.mutual_funds / inv * 100).toFixed(1)}%)\n• ₿ Crypto: ${fmtV(catValues.crypto)} (${(catValues.crypto / inv * 100).toFixed(1)}%)\n\n**Status:** ${driftIndex < 1 ? '✅ Portfolio is well-aligned.' : driftIndex < 3 ? '⚠️ Minor drift detected. I\'m handling it.' : '🚨 Significant drift. Auto-rebalancing in progress.'}\n\nI'm ${investMode === 'auto' ? 'actively monitoring and auto-rebalancing every 25 seconds.' : investMode === 'suggested' ? 'monitoring drift and suggesting trades for you to approve.' : 'in manual mode. Enable Auto-Pilot for hands-free management.'}`
      };
    }

    if (msg.includes('invest') || msg.includes('buy') || msg.includes('next') || msg.includes('recommend')) {
      const deployable = Math.min(cashBalance * 0.3, Math.abs(mostUnder.drift) * inv / 100);
      return {
        thought: `uhh... wait... user is asking for investment recommendations. Let's check which asset has the largest negative drift deviation...\n- Most underweighted is ${mostUnder.ticker} at ${mostUnder.drift.toFixed(2)}%\n- Suggested buy size: ${deployable}\nLet's draft our response.`,
        content: `Based on your current drift analysis, here's my recommendation:\n\n🎯 **Top Pick: ${mostUnder.ticker}** (${mostUnder.name})\n\n**Why:** It's currently ${Math.abs(mostUnder.drift).toFixed(1)}% below your target allocation — the biggest gap in your portfolio.\n\n**Current Position:**\n• Holdings: ${mostUnder.qty < 1 ? mostUnder.qty.toFixed(6) : mostUnder.qty.toLocaleString('en-IN')} ${mostUnder.unit}\n• Live Price: ${fmtV(mostUnder.spotPrice)}/${mostUnder.unit}\n• 24h Change: ${mostUnder.change24h >= 0 ? '+' : ''}${mostUnder.change24h.toFixed(2)}%\n\n**Suggested Action:** Deploy ₹${Math.round(deployable).toLocaleString('en-IN')} to bring it back on target.\n\n${investMode === 'auto' ? '✅ **Auto-Pilot is ON** — I\'ll execute this automatically in the next cycle.' : investMode === 'suggested' ? '💡 **AI-Suggested is ON** — Please approve this manually in the Portfolio Drift tab.' : '⚠️ Enable Auto-Pilot and I\'ll handle this for you without any input needed.'}`
      };
    }

    if (msg.includes('crypto') || msg.includes('bitcoin') || msg.includes('btc') || msg.includes('eth') || msg.includes('solana') || msg.includes('sol') || msg.includes('ripple') || msg.includes('xrp') || msg.includes('ada')) {
      const cryptoAssets = byCategory.crypto;
      const cryptoChange = cryptoAssets.reduce((s, a) => s + a.change24h, 0) / cryptoAssets.length;
      return {
        thought: `uhh... wait... user is asking about cryptocurrency assets. Let's fetch details of the 5 tokens: BTC, ETH, SOL, XRP, ADA...\n- Aggregating valuations and changes.\n- Average change is ${cryptoChange.toFixed(2)}%`,
        content: `Here's your crypto portfolio status:\n\n₿ **Total Crypto Value:** ${fmtV(catValues.crypto)}\n📊 **Portfolio Weight:** ${(catValues.crypto / inv * 100).toFixed(1)}% (Target: 22%)\n📈 **24h Avg Change:** ${cryptoChange >= 0 ? '+' : ''}${cryptoChange.toFixed(2)}%\n\n**Individual Holdings:**\n${cryptoAssets.map(a => `• **${a.ticker}** — ${fmtV(a.spotPrice)}/${a.unit} | ${a.change24h >= 0 ? '+' : ''}${a.change24h.toFixed(2)}% | ${a.qty < 1 ? a.qty.toFixed(4) : a.qty} ${a.unit}`).join('\n')}\n\n**Market Context:**\n• BTC Dominance: 58.4%\n• Fear & Greed Index: 72 (Greed)\n• Global Crypto MCap: $3.2T\n\n${cryptoChange > 0 ? '🟢 Crypto is in bullish momentum today.' : '🔴 Crypto is seeing short-term selling pressure.'} I'm monitoring volatility thresholds and will auto-rebalance if allocation drifts beyond ±0.5%.`
      };
    }

    if (msg.includes('stock') || msg.includes('equity') || msg.includes('nse') || msg.includes('reliance') || msg.includes('tcs') || msg.includes('infosys') || msg.includes('hdfc') || msg.includes('icici')) {
      const stockAssets = byCategory.stocks;
      const stockChange = stockAssets.reduce((s, a) => s + a.change24h, 0) / stockAssets.length;
      return {
        thought: `uhh... wait... user is asking about stock holdings. Let's fetch the 5 NSE stocks: RELIANCE, TCS, INFY, HDFCBANK, ICICIBANK...\n- Average stock change is ${stockChange.toFixed(2)}%`,
        content: `Here's your NSE equity portfolio:\n\n📈 **Total Stocks Value:** ${fmtV(catValues.stocks)}\n📊 **Portfolio Weight:** ${(catValues.stocks / inv * 100).toFixed(1)}% (Target: 28%)\n📈 **24h Avg Change:** ${stockChange >= 0 ? '+' : ''}${stockChange.toFixed(2)}%\n\n**Holdings:**\n${stockAssets.map(a => `• **${a.ticker}** — ₹${a.spotPrice.toLocaleString('en-IN')}/share | ${a.change24h >= 0 ? '+' : ''}${a.change24h.toFixed(2)}% | ${a.qty} shares = ${fmtV(a.qty * a.spotPrice)}`).join('\n')}\n\n**Market Context:**\n• Nifty 50: 24,580 (+1.2%)\n• India VIX: 13.4 (Low volatility)\n• FII Net Buy: ₹2,340 Cr today\n\nI track all 5 NSE positions continuously. Any drift beyond 0.5% triggers automatic rebalancing.`
      };
    }

    if (msg.includes('mutual') || msg.includes('fund') || msg.includes('sip') || msg.includes('nav')) {
      const mfAssets = byCategory.mutual_funds;
      return {
        thought: `uhh... wait... user is asking about mutual funds. Let's list the 4 schemes: SBI Bluechip, HDFC Index, ICICI Bluechip, Nippon Growth...\n- Gathering NAV updates and value.`,
        content: `Here's your Mutual Fund portfolio:\n\n📊 **Total MF Value:** ${fmtV(catValues.mutual_funds)}\n📊 **Portfolio Weight:** ${(catValues.mutual_funds / inv * 100).toFixed(1)}% (Target: 20%)\n\n**Fund Holdings:**\n${mfAssets.map(a => `• **${a.name}** (${a.ticker})\n  NAV: ₹${a.spotPrice.toFixed(2)} | Units: ${a.qty.toLocaleString('en-IN')} | Value: ${fmtV(a.qty * a.spotPrice)}`).join('\n')}\n\n**Fund Stats:**\n• Total AUM (Industry): ₹61.2L Cr (All-time high)\n• SIP inflows: ₹21,800 Cr/month\n• Average 3Y CAGR: 18.4%\n• Expense Ratio: ~0.85%\n\nMutual funds are updated daily at NAV close. I monitor weekly allocation drift and adjust when needed.`
      };
    }

    if (msg.includes('metal') || msg.includes('gold') || msg.includes('silver')) {
      const metalAssets = byCategory.metals;
      return {
        thought: `uhh... wait... user is asking about precious metals. Let's gather gold and silver holdings and spot prices from metals.dev.`,
        content: `Here's your Metals & Commodities portfolio:\n\n🥇 **Total Metals Value:** ${fmtV(catValues.metals)}\n📊 **Portfolio Weight:** ${(catValues.metals / inv * 100).toFixed(1)}% (Target: 30%)\n\n**Holdings:**\n${metalAssets.map(a => `• **${a.name}** (${a.ticker}) — ₹${a.spotPrice.toLocaleString('en-IN')}/${a.unit} | ${a.change24h >= 0 ? '+' : ''}${a.change24h.toFixed(2)}% | ${a.qty.toLocaleString('en-IN')} ${a.unit} = ${fmtV(a.qty * a.spotPrice)}`).join('\n')}\n\n**Macro Context:**\n• Gold-Silver Ratio: 84.7 (Neutral)\n• MCX Gold Premium: ₹240/g above London spot\n• RBI Gold Reserves: 822 tonnes\n• Global gold demand +8% YoY\n\nMetals serve as your portfolio's inflation hedge and safe-haven buffer. Target weight: 30%.`
      };
    }

    if (msg.includes('risk') || msg.includes('safe') || msg.includes('loss') || msg.includes('volatil')) {
      return {
        thought: `uhh... wait... analyzing portfolio risk structures. Cryptos have high volatility; Gold/MFs have low volatility. Let's compute average beta and provide protective insights.`,
        content: `Here's your portfolio risk analysis:\n\n⚠️ **Risk Profile: Moderate-High**\n\n**Risk by Category:**\n• 🥇 Metals (30%): LOW risk — inflation hedge, safe-haven\n• 📈 Stocks (28%): MEDIUM risk — large-cap NSE blue chips\n• 📊 Mutual Funds (20%): LOW-MEDIUM — professionally managed\n• ₿ Crypto (22%): HIGH risk — high volatility, high reward\n\n**Key Risk Metrics:**\n• Portfolio Beta: ~0.75 (less volatile than Nifty)\n• Crypto volatility: ±${(byCategory.crypto.reduce((s, a) => s + a.volatility, 0) / byCategory.crypto.length * 100).toFixed(1)}%/day\n• Max drawdown protection: Metals & MFs act as buffer\n• Correlation: Crypto & Gold are inversely correlated\n\n**My Risk Management:**\nI auto-rebalance when any asset drifts beyond 0.5% to prevent overexposure. No single asset will dominate your portfolio without my intervention.`
      };
    }

    // Dynamic Keyword matching for general knowledge questions
    if (msg.includes('compound interest') || msg.includes('compounding')) {
      return {
        thought: `uhh... wait... user is asking a general knowledge question about compounding. Let's explain the mathematical formula A = P(1 + r/n)^(nt) and present its compounding frequency benefits. Let's connect it to their WealthOS context.`,
        content: `**Compound Interest** is the interest calculated on the initial principal, which also includes all of the accumulated interest from previous periods. It's essentially "interest on interest." 🚀\n\n### 📐 Mathematical Formula\nThe formula for compound interest is:\n**A = P (1 + r/n)^(nt)**\n\nWhere:\n• **A** = final amount\n• **P** = principal amount\n• **r** = annual interest rate (decimal)\n• **n** = number of times interest compounds per year\n• **t** = time in years\n\n### 💡 Why Compounding matters in WealthOS:\n• **SIP Growth:** When you invest in Mutual Funds like **Nippon India Growth Fund** or **HDFC Index Fund**, the returns are reinvested, generating compounding growth over long durations.\n• **Autopilot Drift Correction:** Rebalancing ensures your profits from high-growth assets (like Crypto) are systematically reinvested into stable, compounding assets (like Gold & Blue-chips) to lock in gains and let them compound safely.`
      };
    }

    if (msg.includes('asset allocation') || msg.includes('diversif')) {
      return {
        thought: `uhh... wait... user is asking about asset allocation or diversification. Let's explain the core principles of dividing assets to reduce risk and connect it to their 16-asset target weights.`,
        content: `**Asset Allocation** is the strategy of dividing your investment portfolio among different asset categories, such as Stocks, Bonds, Cash, Precious Metals, and Cryptocurrencies. 📊\n\n### ⚖️ The Core Goal\nDifferent asset classes perform differently under various market conditions. Diversification reduces portfolio volatility because a drop in one category (e.g., a Crypto correction) can be offset by a rise or stability in another (e.g., Gold or Mutual Funds).\n\n### 💼 Your WealthOS Pro Target Allocation:\n• **Metals (30%):** Acts as a safe-haven hedge against high inflation.\n• **Stocks (28%):** Large-cap NSE companies driving equity returns.\n• **Crypto (22%):** High-growth, high-volatility speculative assets.\n• **Mutual Funds (20%):** Professionally managed compounding wealth generators.\n\nOur **Autopilot Rebalancer** runs continuously to keep your investments locked to these exact target weights.`
      };
    }

    if (msg.includes('who are you') || msg.includes('your name') || msg.includes('what do you do') || msg.includes('creator')) {
      return {
        thought: `uhh... wait... user is asking about me. Let's explain that I am the WealthOS AI Assistant, powered by advanced reasoning.`,
        content: `Hello! I am the **WealthOS Pro AI Assistant** (powered by advanced reasoning models similar to Gemini). 🤖\n\n### ⚡ My Primary Capabilities:\n1. **Real-time Drift Diagnostic:** I scan your portfolio of 16 assets across Metals, Stocks, MFs, and Cryptos every 25 seconds to check how far they have drifted from your target weights.\n2. **Autonomous Rebalancing (Autopilot):** If Autopilot is enabled, I automatically execute buy/sell orders using your cash balance to realign your portfolio.\n3. **Financial Q&A:** I can answer general financial questions, explain investment concepts, and warn against abusive messages to maintain a professional environment.\n4. **Voice Controls:** I can listen to your voice commands and talk back in real time like an Alexa-style voice assistant.`
      };
    }

    if (msg.includes('capital of') || msg.includes('capital city')) {
      const capitals: Record<string, string> = {
        'france': 'Paris', 'india': 'New Delhi', 'usa': 'Washington, D.C.', 'united states': 'Washington, D.C.',
        'germany': 'Berlin', 'uk': 'London', 'united kingdom': 'London', 'japan': 'Tokyo', 'china': 'Beijing',
        'italy': 'Rome', 'canada': 'Ottawa', 'australia': 'Canberra', 'russia': 'Moscow', 'brazil': 'Brasília'
      };
      let foundCountry = '';
      let foundCapital = '';
      for (const [country, cap] of Object.entries(capitals)) {
        if (msg.includes(country)) {
          foundCountry = country;
          foundCapital = cap;
          break;
        }
      }
      if (foundCapital) {
        return {
          thought: `uhh... wait... user is asking for the capital of ${foundCountry}. Let me check the geographical database... Found: ${foundCapital}. Let's provide a clean answer.`,
          content: `The capital of **${foundCountry.toUpperCase()}** is **${foundCapital}**. 🏛️\n\nLet me know if you have any other questions, or if you'd like to check today's updates for your WealthOS account!`
        };
      }
    }

    // Default conversational response fallback (thinking like Gemini)
    const queryWords = msg.split(' ').filter(w => w.length > 3);
    const mainSubject = queryWords.length > 0 ? queryWords[queryWords.length - 1] : 'this topic';

    return {
      thought: `uhh... let's see. The user is asking: "${message}". Let's check safety filters first... Clean. Now, let's analyze if this is a general knowledge question. Yes, they are asking about "${mainSubject}". Let me structure the answer into clear points and connect it back to their WealthOS dashboard context.`,
      content: `I'd be happy to discuss that! 🧠\n\nWhile my main objective is running your **WealthOS Pro** portfolio rebalancing dashboard, here is what you need to know about **${mainSubject}**:\n\n• **Core Concept:** Understanding the mechanics of ${mainSubject} helps make better-informed choices, whether in general knowledge or financial strategy.\n• **Macro Connection:** Broad market trends and currency rates (like the live USD/INR exchange rate we track) are heavily impacted by developments surrounding this topic.\n• **Dashboard Link:** You can monitor how global interest or volatility in this area shifts asset prices across your crypto holdings (like Bitcoin) or NSE stocks.\n\nIf you want to review your specific portfolio allocations, just ask me to **"generate today's updates report"**!`
    };
  }, [assets, cashBalance, totalPortfolioValue, driftIndex, investMode, auditRecords, user, bankTransactions]);

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

  const speakText = useCallback((text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // Mute ongoing speech
    
    // Clean text of markdown and emojis
    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/•/g, '')
      .replace(/₹/g, 'Rupees ')
      .replace(/\*/g, '')
      .replace(/#/g, '')
      .replace(/🤖|👥|🔍|⚡|✅|👁|⚠️|🚀|🥇|📈|📊|₿/g, '');

    // Split text into smaller chunks (sentences) to prevent browser cutoff bug
    const chunks = cleanText.match(/[^.!?\n]+[.!?\n]+/g) || [cleanText];
    
    chunks.forEach(chunk => {
      if (!chunk.trim()) return;
      const utterance = new SpeechSynthesisUtterance(chunk.trim());
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(v => v.lang.includes('en') && (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('samantha')));
      utterance.voice = femaleVoice || voices.find(v => v.lang.includes('en-IN') || v.lang.includes('en-US')) || voices[0];
      window.speechSynthesis.speak(utterance);
    });
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isThinking) return;

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    const userMsg: ChatMessage = { id: msgId.current++, role: 'user', content: text.trim(), timestamp: new Date().toLocaleTimeString('en-IN') };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);
    
    // Unlock AudioContext immediately upon user gesture (click/enter)
    if (speechEnabled && window.speechSynthesis) {
      const unlockUtterance = new SpeechSynthesisUtterance('');
      unlockUtterance.volume = 0;
      window.speechSynthesis.speak(unlockUtterance);
    }
    
    await sleep(800 + Math.random() * 600);

    const { thought, content } = generateResponse(text);
    const aiMsg: ChatMessage = { id: msgId.current++, role: 'ai', content: '', thought, timestamp: new Date().toLocaleTimeString('en-IN'), isStreaming: true };
    setMessages(prev => [...prev, aiMsg]);
    setIsThinking(false);

    // Stream characters
    for (let i = 0; i <= content.length; i++) {
      await sleep(8 + Math.random() * 8);
      setMessages(prev => prev.map(m => m.id === aiMsg.id ? { ...m, content: content.slice(0, i), isStreaming: i < content.length } : m));
    }

    if (speechEnabled) {
      speakText(content);
    }
  }, [isThinking, generateResponse, speechEnabled, speakText]);

  // Speech Recognition initialization
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-IN';

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event: any) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) final += event.results[i][0].transcript;
          else interim += event.results[i][0].transcript;
        }
        if (final) {
          finalTranscriptRef.current += final + ' ';
        }
        setInput(finalTranscriptRef.current + interim);
      };

      rec.onerror = (e: any) => {
        if (e.error !== 'no-speech') {
          console.error('Speech recognition error:', e.error);
        }
      };

      rec.onend = () => {
        if (isListeningRef.current) {
          // If it auto-stopped but the user hasn't toggled it off, restart it
          try { rec.start(); } catch (e) {}
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = rec;
    }

    return () => {
      isListeningRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [sendMessage]);

  const toggleListening = () => {
    if (isListeningRef.current) {
      // Manual stop
      isListeningRef.current = false;
      setIsListening(false);
      recognitionRef.current?.stop();
      if (input.trim()) {
        sendMessage(input);
      }
    } else {
      // Manual start
      isListeningRef.current = true;
      setIsListening(true);
      finalTranscriptRef.current = '';
      setInput('');
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      try { recognitionRef.current?.start(); } catch(e) {}
    }
  };

  const toggleSpeech = () => {
    setSpeechEnabled(prev => {
      const next = !prev;
      if (!next && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      return next;
    });
  };

  const renderMessageContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      const boldLine = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
      return <p key={i} className={`${line === '' ? 'h-2' : ''} text-xs leading-relaxed`} dangerouslySetInnerHTML={{ __html: boldLine }} />;
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#09090B]" style={{ height: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <div className="px-4 md:px-6 py-4 border-b border-[#27272A] flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white">WealthOS AI Assistant</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <div className={`w-1.5 h-1.5 rounded-full ${investMode === 'auto' ? 'bg-emerald-400 animate-pulse' : investMode === 'suggested' ? 'bg-amber-400 animate-pulse' : 'bg-zinc-500'}`} />
                <span className="text-[10px] text-zinc-500">{investMode === 'auto' ? 'Auto-Pilot Active — AI managing portfolio autonomously' : investMode === 'suggested' ? 'AI-Suggested Active — AI suggesting trades' : 'Manual Mode'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Mobile panel toggle */}
            <div className="flex md:hidden rounded-lg bg-[#141413] border border-[#27272A] p-0.5">
              <button onClick={() => setActivePanel('chat')} className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${activePanel === 'chat' ? 'bg-amber-500 text-black' : 'text-zinc-400'}`}>Chat</button>
              <button onClick={() => setActivePanel('feed')} className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all relative ${activePanel === 'feed' ? 'bg-amber-500 text-black' : 'text-zinc-400'}`}>
                Activity
                {investMode !== 'manual' && <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full animate-pulse ${investMode === 'auto' ? 'bg-emerald-400' : 'bg-amber-400'}`} />}
              </button>
            </div>
            {/* Voice response toggle */}
            <button onClick={toggleSpeech}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all border ${
                speechEnabled 
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20' 
                  : 'bg-[#141413] border border-[#27272A] text-zinc-500 hover:text-zinc-400'
              }`}
              title={speechEnabled ? "Voice output enabled" : "Voice output muted"}
            >
              {speechEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{speechEnabled ? 'Voice ON' : 'Mute'}</span>
            </button>
            {/* Mode toggle */}
            <button onClick={() => setInvestMode(investMode === 'auto' ? 'suggested' : investMode === 'suggested' ? 'manual' : 'auto')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${investMode === 'auto' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20' : investMode === 'suggested' ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20' : 'bg-zinc-800 border border-[#27272A] text-zinc-400 hover:border-zinc-700'}`}>
              {investMode === 'auto' ? <><Power className="w-3.5 h-3.5" /> Auto</> : investMode === 'suggested' ? <><Sparkles className="w-3.5 h-3.5" /> Suggested</> : <><PowerOff className="w-3.5 h-3.5" /> Manual</>}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Chat Panel */}
        <div className={`flex flex-col flex-1 min-w-0 ${activePanel === 'feed' ? 'hidden md:flex' : 'flex'} md:flex`}>
          {/* Messages */}
          <div ref={chatRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${msg.role === 'ai' ? 'bg-amber-500/20 border border-amber-500/30' : 'bg-indigo-500/20 border border-indigo-500/30'}`}>
                  {msg.role === 'ai' ? '🤖' : '👤'}
                </div>
                <div className={`max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col w-full`}>
                  {msg.role === 'ai' && msg.thought && (
                    <ThoughtAccordion thought={msg.thought} />
                  )}
                  <div className={`rounded-2xl px-4 py-3 text-xs leading-relaxed space-y-0.5 ${
                    msg.role === 'user'
                      ? 'bg-indigo-500/20 border border-indigo-500/20 text-indigo-100 rounded-tr-sm'
                      : 'bg-[#141413] border border-[#27272A] text-zinc-300 rounded-tl-sm w-full'
                  }`}>
                    {renderMessageContent(msg.content)}
                    {msg.isStreaming && <span className="inline-block w-1 h-3 bg-amber-400 ml-0.5 cursor-blink" />}
                  </div>
                  <div className="text-[9px] text-zinc-600 mt-1 px-1">{msg.timestamp}</div>
                </div>
              </div>
            ))}
            {isThinking && (
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-xs">🤖</div>
                <div className="bg-[#141413] border border-[#27272A] rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                  <RefreshCw className="w-3 h-3 text-amber-400 animate-spin" />
                  <span className="text-xs text-zinc-500">Analyzing your portfolio...</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Questions */}
          <div className="px-4 pb-2 flex-shrink-0">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {QUICK_QUESTIONS.slice(0, 8).map((q, i) => (
                <button key={i} onClick={() => sendMessage(q)} disabled={isThinking}
                  className="flex-shrink-0 text-[10px] font-medium px-3 py-1.5 rounded-full bg-[#141413] border border-[#27272A] text-zinc-400 hover:text-amber-400 hover:border-amber-500/40 transition-all whitespace-nowrap disabled:opacity-50">
                  {q.length > 35 ? q.slice(0, 35) + '…' : q}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-[#27272A] flex-shrink-0">
            <div className="flex gap-3 items-center">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
                placeholder="Ask about your portfolio, risk, or what the AI is doing..."
                className="flex-1 bg-[#141413] border border-[#27272A] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-amber-500/50 placeholder:text-zinc-600 transition-all"
                disabled={isThinking}
              />
              <button
                type="button"
                onClick={toggleListening}
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                  isListening 
                    ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/20' 
                    : 'bg-[#141413] border border-[#27272A] text-zinc-400 hover:text-amber-400 hover:border-amber-500/30'
                }`}
                title={isListening ? "Listening... Click to stop" : "Speak to AI"}
              >
                <Mic className="w-4 h-4" />
              </button>
              <button onClick={() => sendMessage(input)} disabled={!input.trim() || isThinking}
                className="w-11 h-11 rounded-xl bg-amber-500 text-black flex items-center justify-center hover:bg-amber-400 transition-all hover:scale-[1.05] active:scale-[0.95] disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20 flex-shrink-0">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px bg-[#27272A] flex-shrink-0" />

        {/* Live Activity Feed */}
        <div className={`w-full md:w-80 lg:w-96 flex-shrink-0 flex flex-col ${activePanel === 'chat' ? 'hidden md:flex' : 'flex'} md:flex`}>
          <div className="px-4 py-3 border-b border-[#27272A] flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white">Live AI Activity</span>
            </div>
            <div className={`flex items-center gap-1.5 text-[10px] font-semibold px-2 py-1 rounded-full ${investMode === 'auto' ? 'text-emerald-400 bg-emerald-500/10' : investMode === 'suggested' ? 'text-amber-400 bg-amber-500/10' : 'text-zinc-500 bg-[#141413]'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${investMode === 'auto' ? 'bg-emerald-400 animate-pulse' : investMode === 'suggested' ? 'bg-amber-400 animate-pulse' : 'bg-zinc-600'}`} />
              {investMode === 'auto' ? 'AUTO-PILOT' : investMode === 'suggested' ? 'AI-SUGGESTED' : 'PAUSED'}
            </div>
          </div>

          {/* Status banners */}
          {investMode === 'auto' && (
            <div className="mx-3 mt-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-3 flex-shrink-0">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] font-bold text-emerald-400">AI RUNNING AUTONOMOUSLY</span>
              </div>
              <p className="text-[10px] text-zinc-500">You don't need to do anything. The AI is monitoring, analyzing, and rebalancing your portfolio every 25 seconds. Just watch the activity feed below.</p>
            </div>
          )}

          {investMode === 'suggested' && (
            <div className="mx-3 mt-3 rounded-lg bg-amber-500/5 border border-amber-500/20 p-3 flex-shrink-0">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[10px] font-bold text-amber-400">AI SUGGESTIONS ACTIVE</span>
              </div>
              <p className="text-[10px] text-zinc-500">AI monitors drift and suggests trades, but you must manually review and execute them.</p>
            </div>
          )}

          {investMode === 'manual' && (
            <div className="mx-3 mt-3 rounded-lg bg-zinc-500/5 border border-zinc-500/20 p-3 flex-shrink-0">
              <div className="flex items-center gap-2 mb-1">
                <PowerOff className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-[10px] font-bold text-zinc-400">MANUAL MODE ACTIVE</span>
              </div>
              <p className="text-[10px] text-zinc-500">Auto-Pilot and AI suggestions are paused. Enable AI above to let it manage or suggest trades.</p>
            </div>
          )}

          {/* Feed Items */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 mt-2">
            {activityFeed.map(item => (
              <div key={item.id} className="rounded-lg bg-[#141413] border border-[#27272A] px-3 py-2.5 hover:border-zinc-600 transition-colors">
                <div className="flex items-start gap-2">
                  <span className="text-sm flex-shrink-0 mt-0.5">{ACTIVITY_ICONS[item.type]}</span>
                  <div className="min-w-0 flex-1">
                    <div className={`text-xs leading-relaxed font-medium ${ACTIVITY_COLORS[item.type]}`}>
                      {item.message}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] text-zinc-600 font-mono">{item.timestamp}</span>
                      {item.ticker && (
                        <>
                          <span className="text-zinc-700">·</span>
                          <span className="text-[9px] text-zinc-600">{item.ticker}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer stats */}
          <div className="p-3 border-t border-[#27272A] flex-shrink-0">
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Actions', value: activityFeed.filter(a => a.type === 'action' || a.type === 'complete').length },
                { label: 'Scans', value: activityFeed.filter(a => a.type === 'scan').length },
                { label: 'Alerts', value: activityFeed.filter(a => a.type === 'alert').length },
              ].map(s => (
                <div key={s.label} className="text-center rounded-lg bg-[#0D0D0F] border border-[#27272A] py-2">
                  <div className="text-sm font-bold text-white">{s.value}</div>
                  <div className="text-[9px] text-zinc-600">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
