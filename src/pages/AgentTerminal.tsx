import React, { useState, useRef, useEffect } from 'react';
import { Bot, ChevronDown, ChevronUp, Clock, Cpu, TerminalSquare, CheckCircle2, AlertCircle, Zap, RefreshCw } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';

const MODELS = ['Qwen 2.5 Coder', 'Llama 3.2', 'Mistral 7B', 'DeepSeek Coder'];
const INTERVALS = ['Hourly', 'Daily Market Open', 'Custom Cron (*/30 * * * *)', 'Manual Only'];

export const getLineColor = (line: string) => {
  if (line.startsWith('[SYSTEM]')) return 'text-zinc-500';
  if (line.includes('✓') || line.includes('complete') || line.includes('Successfully')) return 'text-emerald-400';
  if (line.includes('Drift') || line.includes('below target')) return 'text-amber-300';
  if (line.includes('Tool Invoked') || line.includes('executeOrder')) return 'text-purple-400';
  if (line.includes('Supabase')) return 'text-blue-400';
  if (line.includes('Action Planned') || line.includes('Deploying')) return 'text-cyan-400';
  return 'text-zinc-300';
};

const AgentTerminal: React.FC = () => {
  const { auditRecords, runAgentCycle, isAgentRunning, cashBalance, investMode, setInvestMode } = usePortfolio();

  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [selectedInterval, setSelectedInterval] = useState(INTERVALS[1]);
  const [terminalLines, setTerminalLines] = useState<string[]>([
    '[SYSTEM] WealthOS Agent v2.4.1 initialized.',
    '[SYSTEM] Supabase connection: ACTIVE',
    '[SYSTEM] Ready. Awaiting execution trigger...',
  ]);
  const [expandedRecord, setExpandedRecord] = useState<number | null>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLines]);

  const handleForceRun = async () => {
    if (isAgentRunning) return;
    setTerminalLines(prev => [...prev, '', `[TRIGGER] Autonomous cycle initiated by Agent.`]);
    await runAgentCycle(selectedModel, selectedInterval, (line: string) => {
      setTerminalLines(prev => [...prev, line]);
    });
    setTerminalLines(prev => [...prev, '[SYSTEM] Agent cycle complete. Monitoring resumed.']);
  };

  const handleForceRunRef = useRef(handleForceRun);
  useEffect(() => { handleForceRunRef.current = handleForceRun; }, [handleForceRun]);

  useEffect(() => {
    if (investMode === 'manual') return;
    const iv = setInterval(() => {
      handleForceRunRef.current();
    }, 5000);
    return () => clearInterval(iv);
  }, [investMode]);

  const statusColor = (status: string) => {
    if (status === 'SUCCESS') return 'text-emerald-400';
    if (status === 'PARTIAL') return 'text-amber-400';
    return 'text-red-400';
  };
  const statusIcon = (status: string) => {
    if (status === 'SUCCESS') return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
    if (status === 'PARTIAL') return <AlertCircle className="w-3.5 h-3.5 text-amber-400" />;
    return <AlertCircle className="w-3.5 h-3.5 text-red-400" />;
  };

  const getLineColor = (line: string) => {
    if (line.startsWith('[SYSTEM]')) return 'text-zinc-500';
    if (line.startsWith('[TRIGGER]')) return 'text-amber-400';
    if (line.includes('✓') || line.includes('complete') || line.includes('Successfully')) return 'text-emerald-400';
    if (line.includes('Drift') || line.includes('below target')) return 'text-amber-300';
    if (line.includes('Tool Invoked') || line.includes('executeOrder')) return 'text-purple-400';
    if (line.includes('Supabase')) return 'text-blue-400';
    if (line.includes('Action Planned') || line.includes('Deploying')) return 'text-cyan-400';
    return 'text-zinc-300';
  };

  return (
    <div className="p-4 md:p-6 space-y-5 md:space-y-6 animate-fade-in-up">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Agentic AI Operations Console</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Configure, monitor, and audit the autonomous rebalancing agent</p>
        </div>
        <div className="flex items-center gap-2">
          {isAgentRunning ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full">
              <RefreshCw className="w-3 h-3 animate-spin" />
              Agent Running...
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-ring" />
              Agent Idle — Ready
            </div>
          )}
        </div>
      </div>

      {/* Main Split Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Left: Config Panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl bg-[#141413] border border-[#27272A] p-5 space-y-5">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-semibold text-white">Runtime Configuration</span>
            </div>

            {/* Model Selection */}
            <div>
              <label className="block text-xs text-zinc-500 mb-2 font-medium uppercase tracking-wider">LLM Model Engine</label>
              <select
                value={selectedModel}
                onChange={e => setSelectedModel(e.target.value)}
                className="w-full bg-[#0D0D0F] border border-[#27272A] rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-amber-500/50 transition-all appearance-none cursor-pointer"
              >
                {MODELS.map(m => (
                  <option key={m} value={m} style={{ background: '#0D0D0F' }}>{m}</option>
                ))}
              </select>
              <div className="mt-1.5 text-[10px] text-zinc-600">Running on-device via Ollama runtime</div>
            </div>

            {/* Execution Interval */}
            <div>
              <label className="block text-xs text-zinc-500 mb-2 font-medium uppercase tracking-wider">Execution Schedule</label>
              <select
                value={selectedInterval}
                onChange={e => setSelectedInterval(e.target.value)}
                className="w-full bg-[#0D0D0F] border border-[#27272A] rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-amber-500/50 transition-all appearance-none cursor-pointer"
              >
                {INTERVALS.map(i => (
                  <option key={i} value={i} style={{ background: '#0D0D0F' }}>{i}</option>
                ))}
              </select>
            </div>

            {/* Agent Parameters */}
            <div className="rounded-lg bg-[#0D0D0F] border border-[#27272A] p-3 space-y-2.5">
              <div className="text-[10px] text-zinc-500 font-semibold uppercase tracking-widest mb-2">Agent Parameters</div>
              {[
                { label: 'Max Cash Deployment', value: '30% per cycle' },
                { label: 'Drift Threshold', value: '0.5% deviation' },
                { label: 'Order Type', value: 'Market Order' },
                { label: 'Cash Available', value: `₹${cashBalance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` },
              ].map(p => (
                <div key={p.label} className="flex items-center justify-between">
                  <span className="text-[11px] text-zinc-500">{p.label}</span>
                  <span className="text-[11px] text-zinc-300 font-mono font-medium">{p.value}</span>
                </div>
              ))}
            </div>

            {/* Automated Agent Indicator */}
            <div className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-sm">
              <Zap className="w-4 h-4" /> AGENT IS FULLY AUTONOMOUS
            </div>

            {/* Test Mode Toggle */}
            <button
              onClick={() => {
                if (investMode === 'test') {
                  setInvestMode('auto');
                } else {
                  setInvestMode('test');
                  setTerminalLines(prev => [...prev, '', '[SYSTEM] Test Dataset Loaded. Awaiting next autonomous cycle...']);
                }
              }}
              disabled={isAgentRunning}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg border text-sm font-bold transition-all
                ${investMode === 'test' 
                  ? 'bg-purple-500/20 border-purple-500/50 text-purple-400 hover:bg-purple-500/30' 
                  : 'bg-[#0D0D0F] border-[#27272A] text-zinc-400 hover:border-zinc-700 hover:text-white'
                }
                disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Cpu className="w-4 h-4" />
              {investMode === 'test' ? 'DISABLE TEST MODE' : 'ENABLE TEST DATASET MODE'}
            </button>

            {/* Next scheduled run */}
            <div className="flex items-center gap-2 text-xs text-zinc-600">
              <Clock className="w-3 h-3" />
              Next scheduled run: Tomorrow 09:30 AM IST
            </div>
          </div>
        </div>

        {/* Right: Terminal Console */}
        <div className="lg:col-span-3">
          <div className="rounded-xl bg-[#0A0A0A] border border-[#27272A] overflow-hidden h-full flex flex-col" style={{ minHeight: '420px' }}>
            {/* Terminal header bar */}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-[#141413] border-b border-[#27272A] flex-shrink-0">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-amber-500/70" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
              </div>
              <div className="flex-1 text-center">
                <span className="text-[10px] text-zinc-500 font-mono">wealthos-agent — zsh</span>
              </div>
              <TerminalSquare className="w-3.5 h-3.5 text-zinc-600" />
            </div>

            {/* Terminal output */}
            <div
              ref={terminalRef}
              className="flex-1 p-4 overflow-y-auto font-mono text-xs leading-relaxed space-y-0.5"
              style={{ background: '#080808' }}
            >
              {terminalLines.map((line, i) => (
                <div
                  key={i}
                  className={`terminal-line whitespace-pre-wrap ${getLineColor(line)} ${line === '' ? 'h-3' : ''}`}
                >
                  {line !== '' && (
                    <>
                      <span className="text-zinc-700 select-none mr-2">❯</span>
                      {line}
                    </>
                  )}
                </div>
              ))}
              {isAgentRunning && (
                <div className="text-zinc-500 font-mono text-xs flex items-center gap-1">
                  <span className="text-zinc-700">❯</span>
                  <span className="cursor-blink">█</span>
                </div>
              )}
            </div>

            {/* Terminal status bar */}
            <div className="px-4 py-1.5 bg-[#141413] border-t border-[#27272A] flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3 text-[10px] text-zinc-600 font-mono">
                <span>{selectedModel}</span>
                <span>·</span>
                <span>{selectedInterval}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-600 font-mono">
                <div className={`w-1.5 h-1.5 rounded-full ${isAgentRunning ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
                {isAgentRunning ? 'EXECUTING' : 'IDLE'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Ledger */}
      <div className="rounded-xl bg-[#141413] border border-[#27272A] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#27272A] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-semibold text-white">Past Audit Trace Ledger</h2>
          </div>
          <div className="text-xs text-zinc-500">{auditRecords.length} execution records</div>
        </div>

        <div className="divide-y divide-[#27272A]/50">
          {auditRecords.map(record => (
            <div key={record.id}>
              {/* Summary Row */}
              <div
                className="px-5 py-3.5 hover:bg-white/[0.02] transition-colors cursor-pointer"
                onClick={() => setExpandedRecord(expandedRecord === record.id ? null : record.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {statusIcon(record.status)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-white">Row #{record.id}</span>
                        <span className={`text-[10px] font-semibold ${statusColor(record.status)}`}>{record.status}</span>
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">{record.timestamp} · {record.model} · {record.interval}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-[10px] text-zinc-500">Drift Reduction</div>
                      <div className="text-xs font-mono font-semibold text-emerald-400">
                        {record.driftBefore.toFixed(1)}% → {record.driftAfter.toFixed(1)}%
                      </div>
                    </div>
                    <div className="text-right mr-2">
                      <div className="text-[10px] text-zinc-500">Actions</div>
                      <div className="text-xs text-zinc-300">{record.actions.length} order{record.actions.length !== 1 ? 's' : ''}</div>
                    </div>
                    {expandedRecord === record.id
                      ? <ChevronUp className="w-4 h-4 text-zinc-500" />
                      : <ChevronDown className="w-4 h-4 text-zinc-500" />
                    }
                  </div>
                </div>

                {/* Actions chips */}
                <div className="flex flex-wrap gap-1.5 mt-2 ml-7">
                  {record.actions.map((action, i) => (
                    <span key={i} className="text-[10px] bg-[#0D0D0F] border border-[#27272A] rounded-md px-2 py-0.5 text-zinc-400 font-mono">
                      {action}
                    </span>
                  ))}
                </div>
              </div>

              {/* Expanded Transcript */}
              {expandedRecord === record.id && (
                <div className="px-5 pb-4">
                  <div className="rounded-lg bg-[#080808] border border-[#27272A] p-4 font-mono text-xs leading-relaxed space-y-1">
                    <div className="text-[10px] text-zinc-600 mb-2 uppercase tracking-widest">── Chain-of-Thought Transcript ──</div>
                    {record.transcript.map((line, i) => (
                      <div key={i} className={`${getLineColor(line)} flex items-start gap-2`}>
                        <span className="text-zinc-700 mt-0.5 flex-shrink-0">❯</span>
                        <span>{line}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AgentTerminal;
