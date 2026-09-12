import React, { useState, useEffect } from 'react';
import { Shield, Key, Mail, User, Eye, EyeOff, Fingerprint, Sparkles, AlertTriangle, CheckCircle2, Send, Copy, Check } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';

const PRESET_AVATARS = [
  'http://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80', // Male 1
  'http://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', // Female 1
  'http://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', // Female 2
  'http://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80', // Male 2
  'http://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80', // Female 3
  'http://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', // Male 3
];

const DISPOSABLE_SPAM_DOMAINS = [
  'mailinator.com', 'tempmail.com', '10minutemail.com', 'trashmail.com',
  'yopmail.com', 'dispostable.com', 'guerrillamail.com', 'getnada.com',
  'throwawaymail.com', 'temp-mail.org', 'fakeinbox.com', 'sharklasers.com',
  'gmal.com', 'gamil.com', 'yaho.com', 'hotmial.com', 'outlok.com', 'test.com'
];

const validateEmailDetails = (emailStr: string) => {
  const clean = emailStr.trim().toLowerCase();
  if (!clean) return { isValid: false, isSpam: false, warning: '' };
  
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(clean)) {
    return { isValid: false, isSpam: false, warning: 'Enter a valid email address format (e.g. name@domain.com)' };
  }

  const domain = clean.split('@')[1];
  if (DISPOSABLE_SPAM_DOMAINS.includes(domain)) {
    const isTypo = ['gmal.com', 'gamil.com', 'yaho.com', 'hotmial.com', 'outlok.com'].includes(domain);
    return {
      isValid: false,
      isSpam: true,
      warning: isTypo 
        ? `⚠️ Email domain typo (@${domain}) detected! Did you mean gmail.com / yahoo.com?`
        : `⚠️ Disposable or fake email detected (@${domain}). Please enter a real personal or work email address.`
    };
  }

  return { isValid: true, isSpam: false, warning: '' };
};

const LoginPage: React.FC = () => {
  const { loginUser, registerUser, loginWithCredentialId } = usePortfolio();
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bankName, setBankName] = useState('HDFC Bank');
  const [bankBalance, setBankBalance] = useState('150000');
  const [targetWealthGoal, setTargetWealthGoal] = useState('500000');
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0]);
  const [rememberMe, setRememberMe] = useState(true);

  // OTP Verification state
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [otpCode, setOtpCode] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(120);
  const [otpCopied, setOtpCopied] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [emailWarning, setEmailWarning] = useState('');

  // Auto-fill remembered credentials on mount
  useEffect(() => {
    const savedRemEmail = localStorage.getItem('wealthos_remembered_email');
    const savedRemPass = localStorage.getItem('wealthos_remembered_password');
    if (savedRemEmail) {
      setEmail(savedRemEmail);
    }
    if (savedRemPass) {
      setPassword(savedRemPass);
    }
  }, []);

  // Real-time email validation
  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (!val.trim()) {
      setEmailWarning('');
      return;
    }
    const check = validateEmailDetails(val);
    setEmailWarning(check.warning);
  };

  // OTP Timer countdown
  useEffect(() => {
    let timerId: any;
    if (step === 'otp' && otpTimer > 0) {
      timerId = setInterval(() => setOtpTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(timerId);
  }, [step, otpTimer]);

  const generateAndSendOtp = () => {
    setError('');
    const emailCheck = validateEmailDetails(email);
    if (!emailCheck.isValid) {
      setError(emailCheck.warning || 'Please enter a valid, non-disposable email address.');
      return;
    }
    if (isSignUp && !name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!password) {
      setError('Please enter a secure password.');
      return;
    }

    // Generate random 6-digit OTP code
    const generated = Math.floor(100000 + Math.random() * 900000).toString();
    setOtpCode(generated);
    setEnteredOtp('');
    setOtpTimer(120);
    setStep('otp');
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (enteredOtp.trim() !== otpCode) {
      setError('Invalid 6-digit OTP code. Please check and try again.');
      return;
    }

    // Save remembered credentials if checked
    if (rememberMe) {
      localStorage.setItem('wealthos_remembered_email', email.trim().toLowerCase());
      localStorage.setItem('wealthos_remembered_password', password);
    } else {
      localStorage.removeItem('wealthos_remembered_email');
      localStorage.removeItem('wealthos_remembered_password');
    }

    if (isSignUp) {
      let credentialId: string | undefined;

      try {
        const challenge = new Uint8Array(32);
        crypto.getRandomValues(challenge);
        const userId = new Uint8Array(16);
        crypto.getRandomValues(userId);

        const credential = await navigator.credentials.create({
          publicKey: {
            challenge,
            rp: { name: "WealthOS Gateway", id: window.location.hostname },
            user: {
              id: userId,
              name: email,
              displayName: name
            },
            pubKeyCredParams: [{ type: "public-key", alg: -7 }, { type: "public-key", alg: -257 }],
            authenticatorSelection: { 
              authenticatorAttachment: "platform", 
              userVerification: "required",
              residentKey: "required",
              requireResidentKey: true
            },
            timeout: 60000,
            attestation: "none"
          }
        }) as PublicKeyCredential;

        if (credential) {
          credentialId = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
        }
      } catch (err) {
        console.log("WebAuthn not supported or cancelled by user", err);
      }

      registerUser(name, email, bankName, parseFloat(bankBalance), password, parseFloat(targetWealthGoal), selectedAvatar, credentialId);
    } else {
      const success = loginUser(email, password);
      if (!success) {
        setStep('form');
        setError('Invalid email or password. Please verify your credentials.');
      }
    }
  };

  const triggerBiometrics = async () => {
    setError('');
    try {
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const credential = await navigator.credentials.get({
        publicKey: {
          challenge,
          rpId: window.location.hostname,
          userVerification: "required",
          timeout: 60000
        }
      }) as PublicKeyCredential;

      if (credential) {
        const credentialId = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
        const success = loginWithCredentialId(credentialId);
        if (!success) {
          setError('Biometric login failed: Credential not recognized for any user.');
        }
      }
    } catch (err) {
      console.error("Biometric error", err);
      setError('Biometric authentication failed or was cancelled.');
    }
  };

  React.useEffect(() => {
    const canvas = document.getElementById('login-interactive-bg') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particleCount = 70;
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
    }> = [];

    const colors = [
      'rgba(245, 158, 11, 0.15)',
      'rgba(251, 191, 36, 0.15)',
      'rgba(99, 102, 241, 0.15)',
      'rgba(168, 85, 247, 0.15)'
    ];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 3 + 1,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    const mouse = { x: -1000, y: -1000, radius: 120 };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseout', handleMouseLeave);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      ctx.lineWidth = 0.5;
      for (let i = 0; i < particleCount; i++) {
        for (let j = i + 1; j < particleCount; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (dist < 100) {
            const alpha = (1 - dist / 100) * 0.12;
            ctx.strokeStyle = `rgba(245, 158, 11, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      particles.forEach(p => {
        if (mouse.x > -1000) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.hypot(dx, dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            p.vx -= (dx / dist) * force * 0.05;
            p.vy -= (dy / dist) * force * 0.05;
          }
        }

        p.vx *= 0.98;
        p.vy *= 0.98;

        p.x += p.vx + Math.sign(p.vx) * 0.1;
        p.y += p.vy + Math.sign(p.vy) * 0.1;

        if (p.x < 0 || p.x > width) { p.vx *= -1; p.x = Math.max(0, Math.min(width, p.x)); }
        if (p.y < 0 || p.y > height) { p.vy *= -1; p.y = Math.max(0, Math.min(height, p.y)); }

        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseout', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const copyOtpToClipboard = () => {
    navigator.clipboard.writeText(otpCode);
    setOtpCopied(true);
    setTimeout(() => setOtpCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#09090B] flex items-center justify-center p-4 relative overflow-hidden font-inter">
      {/* Interactive Background Canvas */}
      <canvas id="login-interactive-bg" className="absolute inset-0 w-full h-full pointer-events-none z-0" />

      {/* Premium Background Blurs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-[#0D0D0F] border border-[#27272A] rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 animate-fade-in-up">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 items-center justify-center shadow-lg shadow-amber-500/20 mb-3">
            <Shield className="w-6 h-6 text-black" />
          </div>
          <h2 className="text-xl font-black text-white flex items-center justify-center gap-1.5">
            WealthOS Gateway <Sparkles className="w-4.5 h-4.5 text-amber-400" />
          </h2>
          <p className="text-xs text-zinc-500 mt-1">Autonomous Portfolio Rebalancer Secure Login</p>
        </div>

        {error && (
          <div className="mb-4 text-xs text-red-400 bg-red-500/10 border border-red-500/25 rounded-xl px-3 py-2.5 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: INITIAL DETAILS ENTRY FORM */}
        {step === 'form' ? (
          <form onSubmit={(e) => { e.preventDefault(); generateAndSendOtp(); }} className="space-y-4">
            {isSignUp && (
              <>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Choose Profile Avatar</label>
                  <div className="flex items-center justify-between bg-[#141413] border border-[#27272A] rounded-xl p-2">
                    <div className="flex gap-2.5 overflow-x-auto py-0.5 scrollbar-thin">
                      {PRESET_AVATARS.map((avatar, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedAvatar(avatar)}
                          className={`w-9 h-9 rounded-full overflow-hidden border-2 flex-shrink-0 transition-all ${selectedAvatar === avatar ? 'border-amber-500 scale-[1.06]' : 'border-transparent opacity-50 hover:opacity-100'}`}
                        >
                          <img src={avatar} className="w-full h-full object-cover" alt={`Preset avatar ${idx + 1}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 w-4 h-4 text-zinc-600" />
                    <input
                      type="text"
                      required
                      placeholder="Enter full name"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full bg-[#141413] border border-[#27272A] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none focus:border-amber-500/50"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Email Address (Real Email Required)</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-zinc-600" />
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => handleEmailChange(e.target.value)}
                  className={`w-full bg-[#141413] border rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none transition-all ${emailWarning ? 'border-amber-500/80 bg-amber-500/5' : 'border-[#27272A] focus:border-amber-500/50'}`}
                />
              </div>
              {emailWarning && (
                <div className="text-[10px] text-amber-400 mt-1 flex items-start gap-1 font-medium bg-amber-500/10 border border-amber-500/20 rounded-lg p-2">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <span>{emailWarning}</span>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Secure Password</label>
              <div className="relative">
                <Key className="absolute left-3.5 top-3 w-4 h-4 text-zinc-600" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-[#141413] border border-[#27272A] rounded-xl pl-10 pr-10 py-2.5 text-xs text-white outline-none focus:border-amber-500/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-zinc-500 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Registration Fields */}
            {isSignUp && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Your Bank Name</label>
                  <select
                    value={bankName}
                    onChange={e => setBankName(e.target.value)}
                    className="w-full bg-[#141413] border border-[#27272A] rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-amber-500/50"
                  >
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="SBI Bank">State Bank of India</option>
                    <option value="Axis Bank">Axis Bank</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Bank Balance (₹)</label>
                  <input
                    type="number"
                    placeholder="150000"
                    value={bankBalance}
                    onChange={e => setBankBalance(e.target.value)}
                    className="w-full bg-[#141413] border border-[#27272A] rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-amber-500/50 font-mono"
                  />
                </div>

                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Target Wealth Goal (₹)</label>
                  <input
                    type="number"
                    placeholder="500000"
                    value={targetWealthGoal}
                    onChange={e => setTargetWealthGoal(e.target.value)}
                    className="w-full bg-[#141413] border border-[#27272A] rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-amber-500/50 font-mono"
                  />
                </div>
              </div>
            )}

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={rememberMe} 
                  onChange={e => setRememberMe(e.target.checked)}
                  className="rounded border-[#27272A] bg-[#141413] text-amber-500 focus:ring-0 w-3.5 h-3.5"
                />
                <span className="text-xs text-zinc-400">Remember my login details</span>
              </label>
            </div>

            {/* Action Button: Send OTP */}
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black text-xs font-bold transition-all hover:from-amber-400 hover:to-orange-400 shadow-lg shadow-amber-500/10 hover:scale-[1.01] mt-2 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" /> Send Email OTP & Continue
            </button>
          </form>
        ) : (
          /* STEP 2: 6-DIGIT OTP VERIFICATION FORM */
          <form onSubmit={handleVerifyOtp} className="space-y-5 animate-fade-in">
            {/* Interactive OTP Toast / Copyable Notification */}
            <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-indigo-500/15 border border-amber-500/30 rounded-2xl p-4 text-center relative overflow-hidden shadow-lg">
              <div className="text-[11px] text-zinc-400 uppercase font-bold tracking-widest flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400" /> OTP Sent to {email}
              </div>
              <div className="text-2xl font-black text-white tracking-widest font-mono my-2 flex items-center justify-center gap-3">
                <span>{otpCode}</span>
                <button
                  type="button"
                  onClick={copyOtpToClipboard}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-normal text-amber-300 transition-all flex items-center gap-1"
                  title="Copy OTP"
                >
                  {otpCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="text-[10px]">{otpCopied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <div className="text-[10px] text-zinc-400">
                Code expires in: <span className="font-mono text-amber-400 font-bold">{Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block text-center">
                Enter 6-Digit Email Verification Code
              </label>
              <input
                type="text"
                maxLength={6}
                required
                autoFocus
                placeholder="0 0 0 0 0 0"
                value={enteredOtp}
                onChange={e => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-[#141413] border border-[#27272A] rounded-2xl py-3 px-4 text-center text-xl font-bold font-mono tracking-[0.5em] text-amber-400 outline-none focus:border-amber-500 shadow-inner"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black text-xs font-bold transition-all hover:from-amber-400 hover:to-orange-400 shadow-lg shadow-amber-500/10 hover:scale-[1.01] flex items-center justify-center gap-2"
            >
              <Shield className="w-4 h-4" /> Verify OTP & {isSignUp ? 'Complete Registration' : 'Sign In'}
            </button>

            <div className="flex justify-between items-center text-xs pt-1">
              <button
                type="button"
                onClick={() => setStep('form')}
                className="text-zinc-500 hover:text-white underline"
              >
                ← Back to details
              </button>
              <button
                type="button"
                onClick={generateAndSendOtp}
                className="text-amber-400 hover:text-amber-300 font-semibold"
              >
                Resend OTP
              </button>
            </div>
          </form>
        )}

        {/* Biometrics Trigger (If signing in & step is form) */}
        {!isSignUp && step === 'form' && (
          <div className="mt-4 pt-4 border-t border-[#27272A]/60 flex flex-col gap-2.5">
            <div className="text-[10px] text-zinc-500 text-center uppercase tracking-widest font-semibold">Or use biometrics</div>
            <button
              type="button"
              onClick={triggerBiometrics}
              className="w-full py-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-400 text-xs font-bold hover:bg-amber-500/10 hover:border-amber-500/40 transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
            >
              <Fingerprint className="w-4 h-4" /> Log In with Fingerprint / Face ID
            </button>
          </div>
        )}

        {/* Toggle link */}
        <div className="mt-6 text-center text-xs">
          <span className="text-zinc-500">{isSignUp ? 'Already registered?' : 'New to WealthOS?'}</span>{' '}
          <button
            type="button"
            onClick={() => { setIsSignUp(!isSignUp); setError(''); setStep('form'); }}
            className="text-amber-400 hover:text-amber-300 font-bold underline underline-offset-4"
          >
            {isSignUp ? 'Sign In Here' : 'Create Account'}
          </button>
        </div>
      </div>

    </div>
  );
};

export default LoginPage;

