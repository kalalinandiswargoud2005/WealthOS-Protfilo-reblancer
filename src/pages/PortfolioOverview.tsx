import React, { useState } from 'react';
import OverviewContent from './OverviewContent';
import MarketWatch from './MarketWatch';
import PortfolioDrift from './PortfolioDrift';

type OverviewTab = 'overview' | 'market' | 'drift';

const PortfolioOverview: React.FC = () => {
  const [activeTab, setActiveTab] = useState<OverviewTab>('overview');

  const tabs: { id: OverviewTab; label: string }[] = [
    { id: 'overview', label: 'Portfolio Overview' },
    { id: 'market', label: 'Market Watch' },
    { id: 'drift', label: 'Drift & Allocations' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#09090B]">
      {/* Top Tabs Navigation */}
      <div className="flex-shrink-0 px-4 md:px-6 pt-6 pb-2 border-b border-[#27272A] bg-[#0D0D0F]">
        <h1 className="text-xl font-bold text-white mb-4">Portfolio Hub</h1>
        <div className="flex overflow-x-auto scrollbar-hide gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2 whitespace-nowrap
                ${activeTab === tab.id 
                  ? 'border-amber-400 text-amber-400 bg-amber-500/10' 
                  : 'border-transparent text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'overview' && <OverviewContent />}
        {activeTab === 'market' && <MarketWatch onNavigate={() => {}} />}
        {activeTab === 'drift' && <PortfolioDrift />}
      </div>
    </div>
  );
};

export default PortfolioOverview;
