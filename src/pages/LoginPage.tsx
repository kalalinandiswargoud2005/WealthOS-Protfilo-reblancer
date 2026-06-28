import React, { useState } from 'react';
import { Shield, Key, Mail, User, Eye, EyeOff, Fingerprint, Sparkles } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';

const PRESET_AVATARS = [
  'http://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80', // Male 1
  'http://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', // Female 1
  'http://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', // Female 2
  'http://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80', // Male 2
  'http://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80', // Female 3
  'http://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', // Male 3
];

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
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
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
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = loginUser(email, password);
    if (!success) setError('Invalid email or password');
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

    // Particles array
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
      'rgba(245, 158, 11, 0.15)', // Amber
      'rgba(251, 191, 36, 0.15)', // Gold
      'rgba(99, 102, 241, 0.15)',  // Indigo
      'rgba(168, 85, 247, 0.15)'   // Purple
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

    // Mouse position state
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

      // Draw connections
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

      // Draw and update particles
      particles.forEach(p => {
        // Attraction or repulsion to mouse
        if (mouse.x > -1000) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.hypot(dx, dy);
          if (dist < mouse.radius) {
            // Push away gently
            const force = (mouse.radius - dist) / mouse.radius;
            p.vx -= (dx / dist) * force * 0.05;
            p.vy -= (dy / dist) * force * 0.05;
          }
        }

        // Apply friction
        p.vx *= 0.98;
        p.vy *= 0.98;

        // Apply constant velocity drift
        p.x += p.vx + Math.sign(p.vx) * 0.1;
        p.y += p.vy + Math.sign(p.vy) * 0.1;

        // Bounce on boundaries
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
          <div className="mb-4 text-xs text-red-400 bg-red-500/10 border border-red-500/25 rounded-xl px-3 py-2.5">
            {error}
          </div>
        )}

        {/* Forms */}
        <form onSubmit={isSignUp ? handleRegister : handleLogin} className="space-y-4">
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
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-zinc-600" />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-[#141413] border border-[#27272A] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none focus:border-amber-500/50"
              />
            </div>
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

          {/* Action Button */}
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black text-xs font-bold transition-all hover:from-amber-400 hover:to-orange-400 shadow-lg shadow-amber-500/10 hover:scale-[1.01] mt-2"
          >
            {isSignUp ? 'Register & Continue' : 'Sign In'}
          </button>
        </form>

        {/* Biometrics Trigger (If signing in) */}
        {!isSignUp && (
          <div className="mt-4 pt-4 border-t border-[#27272A]/60 flex flex-col gap-2.5">
            <div className="text-[10px] text-zinc-500 text-center uppercase tracking-widest font-semibold">Or use biometrics</div>
            <button
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
            onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
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
