import React, { useState } from 'react';
import { Landmark, Bot, Shield, Zap, ChevronRight, Menu, X, BarChart3, Wallet, QrCode, ShieldAlert } from 'lucide-react';
import QuickInvestDrawer from './QuickInvestDrawer';
import PaymentQRModal from './PaymentQRModal';
import { usePortfolio } from '../context/PortfolioContext';

type Page = 'portfolio' | 'assets' | 'ai' | 'agent' | 'bank' | 'admin';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const getNavGroups = (userEmail?: string) => {
  const groups = [
    {
      label: 'Portfolio',
      items: [
        { id: 'portfolio'    as Page, label: 'Overview',       icon: BarChart3 },
        { id: 'assets'       as Page, label: 'Assets',         icon: Landmark },
      ],
    },
    {
      label: 'Intelligence',
      items: [
        { id: 'ai'    as Page, label: 'AI Assistant',    icon: Bot },
        { id: 'agent' as Page, label: 'Agent Console',   icon: BarChart3 },
      ],
    },
    {
      label: 'Profile & Banking',
      items: [
        { id: 'bank'  as Page, label: 'Bank & Profile',   icon: Wallet },
      ],
    }
  ];

  if (userEmail?.toLowerCase().includes('nandu1212')) {
    groups.push({
      label: 'Administration',
      items: [
        { id: 'admin'  as Page, label: 'Admin Console',   icon: ShieldAlert },
      ],
    });
  }

  return groups;
};

const MOBILE_NAV = [
  { id: 'portfolio' as Page, label: 'Portfolio', icon: BarChart3 },
  { id: 'assets'  as Page, label: 'Assets',    icon: Landmark },
  { id: 'ai'      as Page, label: 'AI',        icon: Bot },
  { id: 'bank'    as Page, label: 'Banking',   icon: Wallet },
];

const TICKER_REPEAT = 5;

const Layout: React.FC<LayoutProps> = ({ children, currentPage, onNavigate }) => {
  const { assets, investMode, activityFeed, user, logoutUser } = usePortfolio();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [qrOpen, setQrOpen]         = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const tickerData = Array.from({ length: TICKER_REPEAT }, () => assets).flat();

  const handleNav = (page: Page) => { onNavigate(page); setSidebarOpen(false); };

  const latestActivity = activityFeed[0];
  const navGroups = getNavGroups(user?.email);

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="px-5 py-4 border-b border-[#27272A] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20 flex-shrink-0">
            <Shield className="w-4 h-4 text-black" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">WealthOS</div>
            <div className="text-[9px] text-zinc-500 tracking-widest uppercase">Rebalancer Pro</div>
          </div>
        </div>
        <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1 text-zinc-500 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Profile Info */}
      {user && (
        <div className="px-5 py-3 border-b border-[#27272A]/60 flex items-center gap-3 bg-[#111113]">
          <button onClick={() => handleNav('bank')} className="relative flex-shrink-0 group">
            <img src={user.avatar} className="w-9 h-9 rounded-full border border-amber-500/20 group-hover:border-amber-400 transition-colors object-cover" alt="User Avatar" />
            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-[8px] text-white">Edit</div>
          </button>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-white truncate">{user.name}</div>
            <div className="text-[9px] text-zinc-500 truncate">{user.email}</div>
          </div>
          <button onClick={() => logoutUser()} className="p-1.5 rounded bg-white/5 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors" title="Log out">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      )}

      {/* Nav groups */}
      <nav className="p-3 space-y-4">
        {navGroups.map(group => (
          <div key={group.label}>
            <div className="px-2 mb-1.5 text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{group.label}</div>
            <div className="space-y-0.5">
              {group.items.map(item => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button key={item.id} onClick={() => handleNav(item.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all relative
                      ${isActive ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'}`}>
                    {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-amber-400 rounded-full" />}
                    <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-amber-400' : 'text-zinc-500'}`} />
                    <span>{item.label}</span>
                    {item.id === 'ai' && investMode !== 'manual' && (
                      <span className={`ml-auto w-1.5 h-1.5 rounded-full animate-pulse ${investMode === 'auto' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                    )}
                    {isActive && <ChevronRight className="w-3 h-3 ml-auto text-amber-400/60" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Latest AI Activity */}
      {latestActivity && (
        <div className="mx-3 mb-2 rounded-lg bg-[#141413] border border-[#27272A] p-2.5">
          <div className="text-[9px] text-zinc-600 uppercase tracking-wider mb-1">Latest AI Action</div>
          <div className="text-[10px] text-zinc-400 leading-relaxed line-clamp-2">{latestActivity.message}</div>
          <div className="text-[9px] text-zinc-600 mt-1 font-mono">{latestActivity.timestamp}</div>
        </div>
      )}

      {/* QR Pay */}
      <div className="px-3 pb-2">
        <button onClick={() => { setQrOpen(true); setSidebarOpen(false); }}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-[#27272A] bg-[#141413] text-zinc-400 text-xs font-semibold hover:text-amber-400 hover:border-amber-500/30 transition-all">
          <QrCode className="w-3.5 h-3.5" /> Pay / Receive QR
        </button>
      </div>

      {/* Quick Invest */}
      <div className="px-3 pb-3">
        <button onClick={() => { setDrawerOpen(true); setSidebarOpen(false); }}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-black text-xs font-bold hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/20 hover:scale-[1.01]">
          <Zap className="w-3.5 h-3.5" /> Quick Invest
        </button>
      </div>

      {/* System Status */}
      <div className="px-3 pb-3">
        <div className="rounded-lg bg-[#141413] border border-[#27272A] p-2.5">
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${investMode === 'auto' ? 'bg-emerald-400 animate-pulse' : investMode === 'suggested' ? 'bg-amber-400 animate-pulse' : 'bg-zinc-500'}`} />
            <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-semibold">{investMode === 'auto' ? 'Auto-Pilot Active' : investMode === 'suggested' ? 'AI-Suggested Active' : 'Manual Mode'}</span>
          </div>
          <div className="text-[9px] text-zinc-600 mt-0.5">16 Assets · 4 Categories · Supabase ✓</div>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-[#09090B] text-white overflow-hidden font-inter">
      {sidebarOpen && <div className="fixed inset-0 bg-black/70 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed md:relative top-0 left-0 h-full w-60 flex-shrink-0 flex flex-col border-r border-[#27272A] bg-[#0D0D0F] z-40 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} overflow-y-auto scrollbar-hide`}>
        <SidebarContent />
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#0D0D0F] border-b border-[#27272A] flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-lg bg-white/5 text-zinc-400">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Shield className="w-3 h-3 text-black" />
            </div>
            <span className="text-sm font-bold text-white">WealthOS</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setQrOpen(true)} className="p-1.5 rounded-lg bg-white/5 text-zinc-400 hover:text-amber-400">
              <QrCode className="w-4 h-4" />
            </button>
            <button onClick={() => setDrawerOpen(true)} className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <Zap className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Ticker */}
        <div className="h-9 bg-[#0D0D0F] border-b border-[#27272A] overflow-hidden flex items-center relative flex-shrink-0">
          <div className="absolute inset-0 flex items-center">
            <div className="ticker-scroll flex items-center gap-5 whitespace-nowrap">
              {tickerData.map((a, i) => (
                <span key={i} className="flex items-center gap-1.5 text-[11px]">
                  <span className="text-zinc-500 font-semibold">{a.ticker}</span>
                  <span className="text-white font-medium">
                    {a.spotPrice >= 100000 ? `₹${(a.spotPrice / 100000).toFixed(2)}L` : a.spotPrice >= 1000 ? `₹${a.spotPrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : `₹${a.spotPrice.toFixed(2)}`}
                  </span>
                  <span className={`text-[9px] font-bold ${a.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {a.change24h >= 0 ? '▲' : '▼'}{Math.abs(a.change24h).toFixed(2)}%
                  </span>
                  <span className="text-zinc-700">·</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto">{children}</main>

        {/* Mobile bottom nav */}
        <div className="md:hidden flex items-center border-t border-[#27272A] bg-[#0D0D0F] flex-shrink-0">
          {(() => {
            const nav = [...MOBILE_NAV];
            if (user?.email?.toLowerCase().includes('nandu1212')) {
              nav.push({ id: 'admin' as Page, label: 'Admin', icon: ShieldAlert });
            }
            return nav;
          })().map(item => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button key={item.id} onClick={() => onNavigate(item.id)}
                className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold transition-colors relative ${isActive ? 'text-amber-400' : 'text-zinc-500'}`}>
                <Icon className="w-5 h-5" />
                {item.label}
                {item.id === 'ai' && investMode !== 'manual' && <span className={`absolute top-1.5 right-1/4 w-1.5 h-1.5 rounded-full animate-pulse ${investMode === 'auto' ? 'bg-emerald-400' : 'bg-amber-400'}`} />}
              </button>
            );
          })}
        </div>
      </div>

      <QuickInvestDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <PaymentQRModal open={qrOpen} onClose={() => setQrOpen(false)} />
    </div>
  );
};

export default Layout;
