import React, { useState } from 'react';
import { Wallet, Landmark, User, ArrowUpRight, ArrowDownLeft, Calendar, FileText, CheckCircle2, Shield, RefreshCw } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { downloadPortfolioPDF } from '../utils/pdfGenerator';

const PRESET_AVATARS = [
  'http://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80', // Male 1
  'http://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', // Female 1
  'http://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', // Female 2
  'http://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80', // Male 2
  'http://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80', // Female 3
  'http://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', // Male 3
];

const BankDetails: React.FC = () => {
  const { user, bankTransactions, depositFromBank, updateProfile, cashBalance, assets, sendEmailAlert } = usePortfolio();
  
  const [depositAmount, setDepositAmount] = useState('');
  const [profileName, setProfileName] = useState(user?.name || 'Alex Mercer');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || PRESET_AVATARS[0]);
  const [targetGoal, setTargetGoal] = useState(user?.targetWealthGoal?.toString() || '500000');
  const [lowBalanceAlert, setLowBalanceAlert] = useState(user?.lowBalanceThreshold?.toString() || '500');
  const [transactionPin, setTransactionPin] = useState(user?.transactionPin || '1234');
  const [avatarSelectorOpen, setAvatarSelectorOpen] = useState(false);
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [isDiagnosticRunning, setIsDiagnosticRunning] = useState(false);
  const [showRedAlert, setShowRedAlert] = useState(false);
  const [isRedAlertLoading, setIsRedAlertLoading] = useState(false);

  const [metalsKey, setMetalsKey] = useState(localStorage.getItem('metals_dev_api_key') || '');
  const [stockKey, setStockKey] = useState(localStorage.getItem('stock_api_key') || '');
  const [corsProxy, setCorsProxy] = useState(localStorage.getItem('cors_proxy_url') || '');

  const metalsKeySet = !!localStorage.getItem('metals_dev_api_key');
  const stockKeySet = !!localStorage.getItem('stock_api_key');
  const corsProxySet = !!localStorage.getItem('cors_proxy_url');

  const handleSaveApiKeys = (e: React.FormEvent) => {
    e.preventDefault();
    if (metalsKey.trim()) {
      localStorage.setItem('metals_dev_api_key', metalsKey.trim());
    } else {
      localStorage.removeItem('metals_dev_api_key');
    }

    if (stockKey.trim()) {
      localStorage.setItem('stock_api_key', stockKey.trim());
    } else {
      localStorage.removeItem('stock_api_key');
    }

    if (corsProxy.trim()) {
      localStorage.setItem('cors_proxy_url', corsProxy.trim());
    } else {
      localStorage.removeItem('cors_proxy_url');
    }

    setMessage('API credentials updated successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleClearApiKeys = () => {
    localStorage.removeItem('metals_dev_api_key');
    localStorage.removeItem('stock_api_key');
    localStorage.removeItem('cors_proxy_url');
    setMetalsKey('');
    setStockKey('');
    setCorsProxy('');
    setMessage('All API keys cleared. Using default smart fallbacks.');
    setTimeout(() => setMessage(''), 3000);
  };

  if (!user) {
    return (
      <div className="p-6 text-center text-zinc-500">
        Authentication required. Please log in first.
      </div>
    );
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    const targetVal = parseFloat(targetGoal) || 0;
    const lowBalVal = parseFloat(lowBalanceAlert) || 0;
    updateProfile(profileName, selectedAvatar, targetVal, lowBalVal, transactionPin);
    setAvatarSelectorOpen(false);
    setMessage('Profile settings saved successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleSystemDiagnostic = async () => {
    setIsDiagnosticRunning(true);
    // Vibrate device
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
    
    // Email status alert
    if (sendEmailAlert) {
      await sendEmailAlert(
        'System Diagnostic Report',
        `Diagnostic Status: Active & Operational. All components of your WealthOS Portfolio Rebalancing engine are running normally. Cash balance monitoring: ONLINE. Target wealth tracking: ONLINE. Simulated price feeds: ACTIVE (+0.02% drift).`
      );
    }
    
    setMessage('System check complete! Status diagnostic notification sent to your Gmail.');
    setTimeout(() => setMessage(''), 4000);
    setIsDiagnosticRunning(false);
  };

  const playSirenAlarm = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const duration = 2.5; // duration in seconds
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'sawtooth';
      
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.linearRampToValueAtTime(880, now + 0.5);
      osc.frequency.linearRampToValueAtTime(440, now + 1.0);
      osc.frequency.linearRampToValueAtTime(880, now + 1.5);
      osc.frequency.linearRampToValueAtTime(440, now + 2.0);
      osc.frequency.linearRampToValueAtTime(300, now + 2.5);
      
      gainNode.gain.setValueAtTime(0.3, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start(now);
      osc.stop(now + duration);
    } catch (err) {
      console.warn('Audio alert failed to play:', err);
    }
  };

  const handleRedAlert = async () => {
    setIsRedAlertLoading(true);
    
    // 1. Play siren sound
    playSirenAlarm();
    
    // 2. SOS vibration alert pattern
    if (navigator.vibrate) {
      navigator.vibrate([150, 100, 150, 100, 150, 100, 450, 150, 450, 150, 450, 150, 150, 100, 150, 100, 150]);
    }
    
    // 3. Dispatch critical hacked alert email via FormSubmit
    if (sendEmailAlert) {
      await sendEmailAlert(
        '🚨 CRITICAL SECURITY BREACH ALERT (SIMULATED) 🚨',
        `ALERT: Suspicious login activity and threat levels detected on your WealthOS account. Biometrics access revoked and withdrawals frozen temporarily as a safety protocol. Dispatched at: ${new Date().toLocaleString('en-IN')}`
      );
    }
    
    // 4. Show the visual red alert warning screen
    setShowRedAlert(true);
    setIsRedAlertLoading(false);
  };

  const handleEnrollBiometrics = async () => {
    setError('');
    setMessage('');
    try {
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);
      
      const createOptions: CredentialCreationOptions = {
        publicKey: {
          challenge,
          rp: { name: "WealthOS" },
          user: {
            id: new TextEncoder().encode(user.email),
            name: user.email,
            displayName: user.name
          },
          pubKeyCredParams: [
            { type: "public-key", alg: -7 },   // ES256
            { type: "public-key", alg: -257 }  // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: "platform", // triggers Windows Hello / Touch ID / Face ID
            userVerification: "required"
          },
          timeout: 60000
        }
      };

      const credential = await navigator.credentials.create(createOptions);
      if (credential) {
        localStorage.setItem('wealthos_biometric_enrolled', 'true');
        setMessage('Hardware biometrics (Windows Hello / Touch ID) enrolled successfully! You can now log in securely with one tap.');
      }
    } catch (err: any) {
      console.warn("Hardware WebAuthn enrollment failed:", err);
      setError(`Biometric enrollment failed: ${err.message || 'Canceled'}`);
    }
  };

  const handleDownloadPDF = (mode: 'full' | 'assets' | 'ai' | 'manual' = 'full') => {
    setIsPdfGenerating(true);
    try {
      downloadPortfolioPDF(user, assets, bankTransactions, cashBalance, mode);
      const title = mode === 'full' ? 'Full Account Statement' : mode === 'assets' ? 'Active Holdings' : mode === 'ai' ? 'AI Ledger' : 'Manual Ledger';
      setMessage(`PDF ${title} generated and downloaded successfully!`);
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      console.error(err);
      setError('Failed to generate PDF Statement.');
      setTimeout(() => setError(''), 4000);
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(depositAmount);
    if (!amt || amt <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    
    if (amt < 10 || amt > 1000000) {
      setError('Transaction limit exceeded. Amount must be between ₹10 and ₹10,00,000 (10 Lakhs).');
      return;
    }
    
    if (amt > user.bankBalance) {
      setError(`Insufficient bank balance. Max available: ₹${user.bankBalance.toLocaleString('en-IN')}`);
      return;
    }

    setError('');
    const success = depositFromBank(amt);
    if (success) {
      setDepositAmount('');
      setMessage(`Successfully transferred ₹${amt.toLocaleString('en-IN')} to WealthOS portfolio!`);
      setTimeout(() => setMessage(''), 4000);
    } else {
      setError('Transfer failed. Please check funds.');
    }
  };

  const getTxTypeBadge = (type: string) => {
    switch (type) {
      case 'deposit':
        return { label: 'Deposit', color: 'bg-emerald-500/10 text-emerald-400', icon: ArrowDownLeft };
      case 'withdrawal':
        return { label: 'Withdrawal', color: 'bg-rose-500/10 text-rose-400', icon: ArrowUpRight };
      case 'auto_buy':
      case 'rebalance':
        return { label: 'AI Rebalance', color: 'bg-amber-500/10 text-amber-400', icon: RefreshCw };
      case 'manual_buy':
        return { label: 'Buy Order', color: 'bg-blue-500/10 text-blue-400', icon: ArrowUpRight };
      default:
        return { label: 'Transaction', color: 'bg-zinc-500/10 text-zinc-400', icon: FileText };
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in-up">
      {/* Page Title */}
      <div>
        <h1 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
          <Landmark className="w-5 h-5 text-amber-400" /> Banking &amp; Profile Control Center
        </h1>
        <p className="text-xs text-zinc-500 mt-0.5">Manage connected bank credentials, transfer initial budgets, and review transaction history.</p>
      </div>

      {message && (
        <div className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 rounded-xl px-4 py-3">
          {message}
        </div>
      )}
      {error && (
        <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Col: Profile & Bank Detail */}
        <div className="lg:col-span-1 space-y-5">
          {/* Profile Card */}
          <div className="rounded-2xl bg-[#0D0D0F] border border-[#27272A] p-5 relative overflow-hidden group">
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <img
                  src={selectedAvatar}
                  alt={user.name}
                  className="w-20 h-20 rounded-full border-2 border-amber-500/30 object-cover"
                />
                <button
                  onClick={() => setAvatarSelectorOpen(!avatarSelectorOpen)}
                  className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-amber-500 text-black hover:bg-amber-400 transition-all flex items-center justify-center border-2 border-[#0D0D0F]"
                  title="Change avatar"
                >
                  <User className="w-3.5 h-3.5" />
                </button>
              </div>

              {avatarSelectorOpen ? (
                <form onSubmit={handleProfileSave} className="mt-4 w-full space-y-3 text-left">
                  <div className="space-y-1">
                    <label className="block text-[9px] text-zinc-500 uppercase tracking-wider font-semibold">Select Preset Avatar</label>
                    <div className="grid grid-cols-6 gap-2 justify-center py-1">
                      {PRESET_AVATARS.map(avatar => (
                        <button
                          type="button"
                          key={avatar}
                          onClick={() => setSelectedAvatar(avatar)}
                          className={`rounded-full overflow-hidden border-2 ${selectedAvatar === avatar ? 'border-amber-400' : 'border-transparent'} transition-all`}
                        >
                          <img src={avatar} className="w-8 h-8 object-cover" alt="preset avatar" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] text-zinc-500 uppercase tracking-wider font-semibold">Or Upload Profile Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full bg-[#141413] border border-[#27272A] rounded-xl px-3 py-1.5 text-[10px] text-zinc-400 outline-none file:mr-2 file:py-0.5 file:px-1.5 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-amber-500 file:text-black hover:file:bg-amber-400 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] text-zinc-500 uppercase tracking-wider font-semibold">Or Image URL</label>
                    <input
                      type="text"
                      value={selectedAvatar}
                      onChange={e => setSelectedAvatar(e.target.value)}
                      placeholder="Paste image link..."
                      className="w-full bg-[#141413] border border-[#27272A] rounded-xl px-3 py-2 text-[10px] text-white outline-none focus:border-amber-500/50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] text-zinc-500 uppercase tracking-wider font-semibold">Profile Name</label>
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={e => setProfileName(e.target.value)}
                      placeholder="User Profile Name"
                      className="w-full bg-[#141413] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] text-zinc-500 uppercase tracking-wider font-semibold">Target Wealth Goal (₹)</label>
                    <input
                      type="number"
                      required
                      value={targetGoal}
                      onChange={e => setTargetGoal(e.target.value)}
                      placeholder="Target Wealth Goal (e.g. 500000)"
                      className="w-full bg-[#141413] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] text-zinc-500 uppercase tracking-wider font-semibold">Low Cash Threshold Alert (₹)</label>
                    <input
                      type="number"
                      required
                      value={lowBalanceAlert}
                      onChange={e => setLowBalanceAlert(e.target.value)}
                      placeholder="Threshold (e.g. 500)"
                      className="w-full bg-[#141413] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] text-zinc-500 uppercase tracking-wider font-semibold">AI Security PIN (4-digit)</label>
                    <input
                      type="text"
                      maxLength={4}
                      pattern="\d{4}"
                      required
                      value={transactionPin}
                      onChange={e => setTransactionPin(e.target.value)}
                      placeholder="1234"
                      className="w-full bg-[#141413] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50 font-mono tracking-widest"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 py-2 rounded-xl bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 transition-all"
                    >
                      Save Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => { setAvatarSelectorOpen(false); setSelectedAvatar(user.avatar); setProfileName(user.name); setTargetGoal(user.targetWealthGoal?.toString() || '500000'); setLowBalanceAlert(user.lowBalanceThreshold?.toString() || '500'); setTransactionPin(user.transactionPin || '1234'); }}
                      className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-400 text-xs hover:text-white transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="mt-3 w-full flex flex-col items-center">
                  <div className="text-sm font-bold text-white">{user.name}</div>
                  <div className="text-xs text-zinc-500">{user.email}</div>
                  
                  <div className="flex flex-col items-center gap-1.5 mt-2 w-full">
                    <div className="inline-flex items-center gap-1.5 text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 uppercase tracking-widest border border-amber-500/20">
                      <Shield className="w-3 h-3" /> Risk Profile: {user.riskProfile || 'Balanced'}
                    </div>
                    {user.targetWealthGoal !== undefined && (
                      <div className="w-full mt-3 px-2 text-left bg-[#141413] border border-[#27272A]/50 rounded-xl p-3">
                        <div className="flex justify-between items-center text-[10px] text-zinc-400 font-semibold mb-1.5">
                          <span>Target Wealth Goal:</span>
                          {isEditingTarget ? (
                            <div className="flex items-center gap-1.5">
                              <input 
                                type="number" 
                                value={targetGoal} 
                                onChange={e => setTargetGoal(e.target.value)}
                                className="w-24 bg-zinc-900 border border-[#27272a] rounded px-1.5 py-0.5 text-white font-mono text-[10px]"
                              />
                              <button 
                                onClick={() => {
                                  updateProfile(user.name, user.avatar, parseFloat(targetGoal) || 500000, user.lowBalanceThreshold);
                                  setIsEditingTarget(false);
                                  setMessage('Target wealth goal updated successfully!');
                                  setTimeout(() => setMessage(''), 3000);
                                }}
                                className="text-[#00b386] font-bold hover:underline"
                              >
                                Save
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span className="text-white font-bold font-mono">₹{user.targetWealthGoal.toLocaleString('en-IN')}</span>
                              <button onClick={() => setIsEditingTarget(true)} className="text-[#00b386] text-[9px] hover:underline">Edit</button>
                            </div>
                          )}
                        </div>
                        {(() => {
                          const totalVal = assets.reduce((sum, a) => sum + a.qty * a.spotPrice, 0) + cashBalance;
                          const pct = Math.min((totalVal / user.targetWealthGoal) * 100, 100);
                          return (
                            <div className="space-y-1.5">
                              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                              <div className="text-[9px] text-zinc-500 text-right font-semibold font-mono">{pct.toFixed(1)}% achieved</div>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                    {user.lowBalanceThreshold !== undefined && (
                      <div className="w-full mt-2 px-3 py-2 text-left bg-[#141413]/55 border border-[#27272A]/30 rounded-xl flex items-center justify-between">
                        <span className="text-[10px] text-zinc-500 font-semibold">Low Cash Alert Limit:</span>
                        <span className="text-xs font-mono font-bold text-amber-400">₹{user.lowBalanceThreshold.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    
                    {/* System Diagnostic button */}
                    <button
                      onClick={handleSystemDiagnostic}
                      disabled={isDiagnosticRunning}
                      className="w-full mt-3 py-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/40 transition-all text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isDiagnosticRunning ? 'animate-spin' : ''}`} />
                      {isDiagnosticRunning ? 'Running Diagnostics...' : 'Run System Diagnostic'}
                    </button>

                    {/* Enroll Device Biometrics */}
                    <button
                      onClick={handleEnrollBiometrics}
                      className="w-full mt-2 py-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/40 transition-all text-xs font-bold flex items-center justify-center gap-1.5"
                    >
                      <Shield className="w-3.5 h-3.5 text-amber-400" />
                      Enroll Device Biometrics (Windows Hello / Touch ID)
                    </button>

                    {/* Emergency Red Security Alert button */}
                    <button
                      onClick={handleRedAlert}
                      disabled={isRedAlertLoading}
                      className="w-full mt-2 py-2.5 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10 hover:border-red-500/40 transition-all text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <Shield className={`w-3.5 h-3.5 ${isRedAlertLoading ? 'animate-pulse' : ''}`} />
                      {isRedAlertLoading ? 'Triggering Alarm...' : 'Trigger Emergency Breach (Red Alert)'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Connected Bank Card */}
          <div className="rounded-2xl bg-[#0D0D0F] border border-[#27272A] p-5 space-y-4">
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold flex items-center gap-1.5">
              <Landmark className="w-4 h-4 text-zinc-400" /> Linked Primary Bank
            </div>
            
            <div className="space-y-3 pt-1">
              <div>
                <div className="text-[9px] text-zinc-500">Bank Name</div>
                <div className="text-xs font-bold text-white">{user.bankName}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-[9px] text-zinc-500">Account Number</div>
                  <div className="text-xs font-mono font-semibold text-white">{user.bankAccount}</div>
                </div>
                <div>
                  <div className="text-[9px] text-zinc-500">IFSC Code</div>
                  <div className="text-xs font-mono font-semibold text-white">{user.ifsc}</div>
                </div>
              </div>
              <div className="pt-2 border-t border-[#27272A]/50">
                <div className="text-[9px] text-zinc-500">Primary Bank Account Balance</div>
                <div className="text-xl font-bold text-white font-mono">
                  ₹{user.bankBalance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </div>
                <div className="text-[9px] text-zinc-600 mt-0.5">Fund source for top-ups</div>
              </div>
            </div>
          </div>

          {/* API Gateway Credentials Panel */}
          <div className="rounded-2xl bg-[#0D0D0F] border border-[#27272A] p-5 space-y-4">
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-amber-400" /> API Gateway Credentials
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Configure your API keys for live institutional data feeds. If no keys are provided, the system automatically uses smart fallback feeds.
            </p>
            <form onSubmit={handleSaveApiKeys} className="space-y-3">
              <div className="space-y-1">
                <label className="block text-[9px] text-zinc-500 uppercase tracking-wider font-semibold">Metals.dev API Key</label>
                <input
                  type="password"
                  value={metalsKey}
                  onChange={e => setMetalsKey(e.target.value)}
                  placeholder="metals_dev_..."
                  className="w-full bg-[#141413] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50 font-mono"
                />
                <div className="text-[9px] flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${metalsKeySet ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  <span className={metalsKeySet ? 'text-emerald-400 animate-pulse' : 'text-zinc-500'}>
                    {metalsKeySet ? 'Institutional live feed active' : 'Fallback USD-INR Spot active'}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] text-zinc-500 uppercase tracking-wider font-semibold">RapidAPI Stock Feed Key</label>
                <input
                  type="password"
                  value={stockKey}
                  onChange={e => setStockKey(e.target.value)}
                  placeholder="rapidapi_key_..."
                  className="w-full bg-[#141413] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50 font-mono"
                />
                <div className="text-[9px] flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${stockKeySet ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  <span className={stockKeySet ? 'text-emerald-400 animate-pulse' : 'text-zinc-500'}>
                    {stockKeySet ? 'NSE Realtime Feed active' : 'Smart live-fluctuation engine active'}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] text-zinc-500 uppercase tracking-wider font-semibold">Custom CORS Proxy URL</label>
                <input
                  type="text"
                  value={corsProxy}
                  onChange={e => setCorsProxy(e.target.value)}
                  placeholder="http://cors-anywhere.herokuapp.com/"
                  className="w-full bg-[#141413] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50 font-mono text-[10px]"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 transition-all cursor-pointer"
                >
                  Save Credentials
                </button>
                {(metalsKeySet || stockKeySet || corsProxySet) && (
                  <button
                    type="button"
                    onClick={handleClearApiKeys}
                    className="px-3 py-2 rounded-xl bg-zinc-800 text-zinc-400 text-xs hover:text-white transition-all cursor-pointer"
                  >
                    Clear Keys
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Statement Downloader Card */}
          <div className="rounded-2xl bg-[#0D0D0F] border border-[#27272A] p-5 space-y-4">
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-amber-400" /> Account Reports
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Export your investment statements. Select from separate transaction and holdings records or download the full statement.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => handleDownloadPDF('full')}
                disabled={isPdfGenerating}
                className="w-full py-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-400 text-xs font-bold hover:bg-amber-500/10 hover:border-amber-500/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.01]"
              >
                <FileText className="w-4 h-4" /> 
                {isPdfGenerating ? 'Generating Statement...' : 'Download Full Statement (PDF)'}
              </button>
              
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadPDF('assets')}
                  disabled={isPdfGenerating}
                  className="py-2 px-1 rounded-xl border border-zinc-700 bg-white/5 text-zinc-300 text-[10px] font-bold hover:bg-white/10 hover:border-zinc-500 transition-all text-center truncate cursor-pointer font-semibold"
                >
                  Holdings
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadPDF('ai')}
                  disabled={isPdfGenerating}
                  className="py-2 px-1 rounded-xl border border-zinc-700 bg-white/5 text-zinc-300 text-[10px] font-bold hover:bg-white/10 hover:border-zinc-500 transition-all text-center truncate cursor-pointer font-semibold"
                >
                  AI Ledger
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadPDF('manual')}
                  disabled={isPdfGenerating}
                  className="py-2 px-1 rounded-xl border border-zinc-700 bg-white/5 text-zinc-300 text-[10px] font-bold hover:bg-white/10 hover:border-zinc-500 transition-all text-center truncate cursor-pointer font-semibold"
                >
                  Manual
                </button>
              </div>
            </div>
            <div className="text-[9px] text-zinc-600 text-center">
              Secured PDF Statement with SHA-256 Audit Trail
            </div>
          </div>

          {/* Email Alert Setup Card */}
          <div className="rounded-2xl bg-[#0D0D0F] border border-[#27272A] p-5 space-y-3">
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-400" /> AI Gmail Alerts
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">
              WealthOS sends critical alerts (Target Reached, High Asset Profit, Heavy Market Crash) to:
            </p>
            <div className="bg-[#141413] border border-[#27272A]/50 rounded-xl px-3 py-2 text-xs text-zinc-300 font-semibold font-mono truncate">
              {user.email}
            </div>
            <div className="rounded-lg bg-amber-500/5 border border-amber-500/10 p-2.5">
              <div className="text-[9px] text-amber-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                <Shield className="w-3 h-3" /> Action Required for Gmail Alerts
              </div>
              <div className="text-[9px] text-zinc-500 leading-snug">
                We route alerts via FormSubmit. The first notification sent will contain an activation email from FormSubmit.co. You must click that activation link to confirm and start receiving real emails.
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Deposit Cash and Transaction History */}
        <div className="lg:col-span-2 space-y-5">
          {/* Transfer cash card */}
          <div className="rounded-2xl bg-[#0D0D0F] border border-[#27272A] p-5">
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold mb-3 flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-emerald-400" /> Fund Portfolio Balance
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed mb-4">
              Transfer funds instantly from your linked bank account ({user.bankName}) to your WealthOS cash balance. Current available cash inside WealthOS is <span className="text-emerald-400 font-bold font-mono">₹{cashBalance.toLocaleString('en-IN')}</span>.
            </p>
            <form onSubmit={handleDeposit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <span className="absolute left-3 top-3 text-xs text-zinc-500">₹</span>
                <input
                  type="number"
                  placeholder="Enter amount to transfer"
                  value={depositAmount}
                  onChange={e => setDepositAmount(e.target.value)}
                  className="w-full bg-[#141413] border border-[#27272A] rounded-xl pl-7 pr-3 py-2.5 text-xs text-white outline-none focus:border-amber-500/50 font-mono"
                />
              </div>
              <button
                type="submit"
                className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black text-xs font-bold transition-all hover:scale-[1.01]"
              >
                Execute Bank Transfer
              </button>
            </form>
          </div>

          {/* Ledger Table */}
          <div className="rounded-2xl bg-[#0D0D0F] border border-[#27272A] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#27272A] flex items-center justify-between">
              <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-zinc-400" /> Transaction Ledger
              </div>
              <span className="text-[9px] text-zinc-500 font-mono">{bankTransactions.length} items logged</span>
            </div>

            <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
              {bankTransactions.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-600">
                  No bank transactions recorded.
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#27272A]/40 text-zinc-500 text-[10px] uppercase font-bold tracking-wider">
                      <th className="px-4 py-2">Date / Time</th>
                      <th className="px-4 py-2">Type</th>
                      <th className="px-4 py-2">Description</th>
                      <th className="px-4 py-2 text-right">Amount</th>
                      <th className="px-4 py-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bankTransactions.map(tx => {
                      const badge = getTxTypeBadge(tx.type);
                      const Icon = badge.icon;
                      return (
                        <tr key={tx.id} className="border-b border-[#27272A]/20 hover:bg-white/[0.01] transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap text-zinc-500 font-mono text-[10px]">
                            <Calendar className="w-3 h-3 inline mr-1 text-zinc-600" />
                            {tx.timestamp}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${badge.color}`}>
                              <Icon className="w-2.5 h-2.5" />
                              {badge.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-zinc-400 max-w-[200px] truncate" title={tx.description}>
                            {tx.description}
                          </td>
                          <td className={`px-4 py-3 text-right font-mono font-bold ${tx.type === 'deposit' ? 'text-emerald-400' : 'text-zinc-300'}`}>
                            {tx.type === 'deposit' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                          </td>
                          <td className="px-4 py-3">
                            <span className="flex items-center justify-center gap-1 text-[10px] font-bold text-emerald-400/90 bg-emerald-500/10 rounded px-1.5 py-0.5 border border-emerald-500/10">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> {tx.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Full Screen Security Breach Warning Overlay */}
      {showRedAlert && (
        <div className="fixed inset-0 z-[100] bg-red-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0D0D0F] border border-red-500/40 rounded-3xl w-full max-w-md p-6 text-center shadow-2xl shadow-red-500/10 animate-fade-in-up relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.1),transparent)] pointer-events-none" />
            <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-4 animate-pulse">
              <Shield className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-base font-black text-red-500 uppercase tracking-wider mb-2">⚠️ CRITICAL SECURITY WARNING ⚠️</h3>
            <p className="text-xs text-zinc-300 leading-relaxed mb-4">
              EMERGENCY SECURITY PROTOCOL INITIATED: A critical security breach has been simulated.
            </p>
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3 text-left space-y-2 mb-6">
              <div className="text-[10px] text-red-400 font-bold uppercase tracking-wider">Breach Summary:</div>
              <div className="text-[10px] text-zinc-400 leading-snug">
                • Alarm Siren tone generated and triggered via browser AudioContext.<br />
                • Physical haptic SOS warning vibration sequence activated.<br />
                • Hacked alert message dispatched to: <span className="text-white font-mono font-bold">{user.email}</span>.
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowRedAlert(false)}
              className="w-full py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-500 hover:scale-[1.01] transition-all cursor-pointer"
            >
              Deactivate Security Lock &amp; Mute Alarm
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankDetails;
