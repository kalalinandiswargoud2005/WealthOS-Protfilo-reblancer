import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, Send, RefreshCw, Zap, Activity, Power, PowerOff, Mic, Volume2, VolumeX, Sparkles, ChevronDown, Key } from 'lucide-react';
import { usePortfolio, type ActivityItem } from '../context/PortfolioContext';
import { GoogleGenAI } from '@google/genai';

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

// Array to hold utterances and prevent Chrome from aggressively garbage collecting them mid-sentence
const globalUtterances: SpeechSynthesisUtterance[] = [];


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
  const { assets, cashBalance, totalPortfolioValue, driftIndex, activityFeed, investMode, setInvestMode, user, executeUpiTransfer } = usePortfolio();
  
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
  
  // Gemini State
  const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem('wealthos_gemini_key') || import.meta.env.VITE_GEMINI_API_KEY || '');
  const [showKeyInput, setShowKeyInput] = useState(!geminiKey);
  const [tempKey, setTempKey] = useState('');

  const saveGeminiKey = () => {
    if (tempKey.trim()) {
      localStorage.setItem('wealthos_gemini_key', tempKey.trim());
      setGeminiKey(tempKey.trim());
      setShowKeyInput(false);
      setMessages(prev => [...prev, { id: msgId.current++, role: 'ai', content: '✅ **Gemini API Key saved successfully!**\n\nI am now running on advanced AI logic. How can I assist you?', timestamp: new Date().toLocaleTimeString('en-IN') }]);
    }
  };
  
  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const finalTranscriptRef = useRef('');

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);





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
      
      // Store reference to prevent garbage collection bug in Chromium browsers
      globalUtterances.push(utterance);
      utterance.onend = () => {
        const index = globalUtterances.indexOf(utterance);
        if (index > -1) globalUtterances.splice(index, 1);
      };
      
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
    
    // Intercept UPI Transfers
    const msg = text.toLowerCase();
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
      const mockContacts = ['nandu', 'person a', 'john', 'alice', 'bob'];
      const isUpi = person.includes('@') || /^\d{10}$/.test(person);
      let content = '';
      if (!mockContacts.includes(person) && !isUpi) {
        content = `❌ **Transaction Failed**\n\nRecipient "${person}" does not exist in your contacts.\n\nPlease provide a valid UPI number (e.g., 9876543210@upi or a 10-digit mobile number).`;
      } else {
        const pinMatch = msg.match(/pin\s*[:\-]?\s*(\d{4})/i) || msg.match(/\b(\d{4})\b/);
        if (!pinMatch) {
          content = `⚠️ **Transaction Failed**\n\nSecurity verification failed. Please provide your 4-digit UPI PIN in the same message to authorize the transfer of ₹${amount} to ${person}.\n\nExample: *"Send ${person} ${amount} PIN 1234"*`;
        } else {
          const pin = pinMatch[1];
          const expectedPin = user?.transactionPin || '1234';
          if (pin !== expectedPin) {
            content = `🚨 **Transaction Denied**\n\nInvalid PIN entered. For your security, this transaction has been blocked.`;
          } else {
            const success = executeUpiTransfer(person, amount);
            if (success) {
              content = `✅ **Transaction Successful**\n\nSuccessfully transferred **₹${amount.toLocaleString('en-IN')}** to **${person.toUpperCase()}**.\n\nThe funds have been deducted from your linked bank account. You can view this in your Banking Hub.`;
            } else {
              content = `❌ **Transaction Failed**\n\nInsufficient funds in your linked bank account to transfer ₹${amount.toLocaleString('en-IN')}.`;
            }
          }
        }
      }
      
      const aiMsg: ChatMessage = { id: msgId.current++, role: 'ai', content, thought: 'UPI transfer intent detected. Intercepting execution...', timestamp: new Date().toLocaleTimeString('en-IN') };
      setMessages(prev => [...prev, aiMsg]);
      setIsThinking(false);
      if (speechEnabled) speakText(content);
      return;
    }

    if (!geminiKey) {
      setShowKeyInput(true);
      const fallbackMsg: ChatMessage = { id: msgId.current++, role: 'ai', content: '⚠️ Please provide your Gemini API Key in the settings panel above to use the advanced AI assistant.', timestamp: new Date().toLocaleTimeString('en-IN') };
      setMessages(prev => [...prev, fallbackMsg]);
      setIsThinking(false);
      return;
    }

    try {
      const ai = new GoogleGenAI({ apiKey: geminiKey });
      const inv = assets.reduce((s, a) => s + a.qty * a.spotPrice, 0);
      const systemInstruction = `You are the WealthOS AI Assistant, a premium fintech wealth manager bot. 
User Name: ${user?.name || 'User'}
Total Portfolio Value: ₹${totalPortfolioValue.toLocaleString('en-IN')}
Invested Capital: ₹${inv.toLocaleString('en-IN')}
Cash Balance: ₹${cashBalance.toLocaleString('en-IN')}
Drift Index: ${driftIndex.toFixed(2)}%
Invest Mode: ${investMode} (auto = AI executes trades autonomously, suggested = AI suggests trades, manual = AI paused)

App Creators: This application was built by Team Leader Nandeeshwar, and team members Kowshik and Jyothi as their 4-1 Major Project Phase-1. If someone asks who made this, mention them proudly!

Current Holdings:
${assets.filter(a => a.qty > 0).map(a => `- ${a.ticker} (${a.name}): Qty ${a.qty}, Spot Price ₹${a.spotPrice}, Weight ${(a.qty * a.spotPrice / inv * 100).toFixed(1)}% (Target ${a.targetWeight}%), 24h Change ${a.change24h}%`).join('\n')}

Rules:
1. Be professional, crisp, and helpful. Use emojis reasonably.
2. For money values, use Indian Rupees (₹) and Indian number formatting (e.g. ₹1,50,000).
3. Do not invent fake portfolio data. Only rely on the context provided above.
4. You cannot execute trades directly via text. Instead, recommend trades for the user to approve in the dashboard, or inform them that Auto-Pilot will handle it.
5. If asked general knowledge questions, answer concisely and connect back to finance if possible.
6. Use markdown for bolding (**bold**) and bullet points.`;

      const aiMsgId = msgId.current++;
      const aiMsg: ChatMessage = { id: aiMsgId, role: 'ai', content: '', thought: 'Consulting Google Gemini...', timestamp: new Date().toLocaleTimeString('en-IN'), isStreaming: true };
      setMessages(prev => [...prev, aiMsg]);
      setIsThinking(false);

      // Only pass the last 5 messages to save tokens and context length
      const chatContext = messages.slice(-5).map(m => ({
        role: m.role === 'ai' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));
      chatContext.push({ role: 'user', parts: [{ text: text.trim() }] });

      const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: chatContext,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      let fullContent = '';
      for await (const chunk of responseStream) {
        if (chunk.text) {
          fullContent += chunk.text;
          setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, content: fullContent } : m));
        }
      }

      setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, isStreaming: false } : m));
      
      if (speechEnabled) {
        speakText(fullContent);
      }
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      const errorMsg: ChatMessage = { 
        id: msgId.current++, 
        role: 'ai', 
        content: `❌ **Failed to connect to Gemini API**\n\nError: ${error?.message || 'Unknown error'}. Please check your API key and try again.`, 
        timestamp: new Date().toLocaleTimeString('en-IN') 
      };
      setMessages(prev => [...prev, errorMsg]);
      setIsThinking(false);
      // If unauthorized, show key input again
      if (error?.message?.toLowerCase().includes('key') || error?.message?.toLowerCase().includes('auth')) {
         setShowKeyInput(true);
         setGeminiKey('');
         localStorage.removeItem('wealthos_gemini_key');
      }
    }
  }, [isThinking, geminiKey, speechEnabled, speakText, assets, cashBalance, totalPortfolioValue, driftIndex, investMode, user]);

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
            {showKeyInput && (
              <div className="mb-4 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-bold text-amber-400">Configure Gemini API Key</span>
                </div>
                <p className="text-xs text-amber-500/80">To enable advanced AI reasoning, please provide your Google Gemini API key. This is stored locally in your browser.</p>
                <div className="flex gap-2">
                  <input type="password" value={tempKey} onChange={e => setTempKey(e.target.value)} placeholder="AIzaSy..." className="flex-1 bg-[#141413] border border-[#27272A] rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-amber-500/50" />
                  <button onClick={saveGeminiKey} className="px-4 py-2 rounded-lg bg-amber-500 text-black text-xs font-bold hover:bg-amber-400">Save Key</button>
                  {geminiKey && <button onClick={() => setShowKeyInput(false)} className="px-4 py-2 rounded-lg bg-[#27272A] text-white text-xs font-bold hover:bg-[#3f3f46]">Cancel</button>}
                </div>
              </div>
            )}
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
