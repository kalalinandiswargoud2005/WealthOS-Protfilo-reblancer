import { useState } from 'react';
import { PortfolioProvider, usePortfolio } from './context/PortfolioContext';
import Layout from './components/Layout';
import AgentTerminal from './pages/AgentTerminal';
import AssetsPage from './pages/AssetsPage';
import AIAssistant from './pages/AIAssistant';
import PortfolioOverview from './pages/PortfolioOverview';
import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import BankDetails from './pages/BankDetails';
import AdminDashboard from './pages/AdminDashboard';

type Page = 'portfolio' | 'assets' | 'ai' | 'agent' | 'bank' | 'admin';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('portfolio');
  const { user } = usePortfolio();

  const renderPage = () => {
    switch (currentPage) {
      case 'portfolio':    return <PortfolioOverview />;
      case 'assets':       return <AssetsPage />;
      case 'ai':           return <AIAssistant />;
      case 'agent':        return <AgentTerminal />;
      case 'bank':         return <BankDetails />;
      case 'admin':        return user?.email?.toLowerCase().includes('nandu1212') ? <AdminDashboard /> : <PortfolioOverview />;
      default:             return <PortfolioOverview />;
    }
  };

  if (!user) {
    return <LoginPage />;
  }

  if (!user.onboardingCompleted) {
    return <OnboardingPage />;
  }

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}

function App() {
  return (
    <PortfolioProvider>
      <AppContent />
    </PortfolioProvider>
  );
}

export default App;
