import type { Asset } from '../context/PortfolioContext';

// A static test dataset used when the AI Agent is in "Test Mode".
// This dataset intentionally introduces a significant drift in SILVER and BTC 
// to instantly trigger the rebalancing agent for demonstration purposes.

export const testDatasetAssets: Asset[] = [
  { 
    ticker: 'GOLD', name: 'Gold (24K)', category: 'metals', 
    qty: 20, spotPrice: 7200, targetWeight: 15, unit: 'g', 
    priceHistory: [7100, 7150, 7180, 7200, 7200], change24h: 0.1, 
    marketCap: 4850, volume24h: 312, volatility: 0.004, exchange: 'MCX',
    avgBuyPrice: 7100
  },
  { 
    // Intentional heavy under-allocation to trigger a BUY
    ticker: 'SILVER', name: 'Silver (Fine)', category: 'metals', 
    qty: 100, spotPrice: 85, targetWeight: 10, unit: 'g', 
    priceHistory: [80, 82, 84, 85, 85], change24h: -2.5, 
    marketCap: 1820, volume24h: 98, volatility: 0.006, exchange: 'MCX',
    avgBuyPrice: 80
  },
  { 
    ticker: 'RELIANCE', name: 'Reliance Industries', category: 'stocks', 
    qty: 22, spotPrice: 2945, targetWeight: 7, unit: 'shares', 
    priceHistory: [2900, 2920, 2945, 2945], change24h: 1.45, 
    marketCap: 199800, volume24h: 4820, volatility: 0.005, exchange: 'NSE',
    avgBuyPrice: 2800
  },
  { 
    ticker: 'TCS', name: 'Tata Consultancy Svcs', category: 'stocks', 
    qty: 15, spotPrice: 3820, targetWeight: 6, unit: 'shares', 
    priceHistory: [3800, 3810, 3820], change24h: -0.32, 
    marketCap: 139600, volume24h: 2150, volatility: 0.004, exchange: 'NSE',
    avgBuyPrice: 3750
  },
  { 
    ticker: 'INFY', name: 'Infosys Ltd', category: 'stocks', 
    qty: 37, spotPrice: 1580, targetWeight: 5, unit: 'shares', 
    priceHistory: [1550, 1570, 1580], change24h: 0.78, 
    marketCap: 65400, volume24h: 3890, volatility: 0.005, exchange: 'NSE',
    avgBuyPrice: 1500
  },
  { 
    ticker: 'HDFCBANK', name: 'HDFC Bank Ltd', category: 'stocks', 
    qty: 30, spotPrice: 1650, targetWeight: 5, unit: 'shares', 
    priceHistory: [1600, 1620, 1650], change24h: -1.02, 
    marketCap: 125600, volume24h: 5120, volatility: 0.004, exchange: 'NSE',
    avgBuyPrice: 1600
  },
  { 
    ticker: 'ICICIBANK', name: 'ICICI Bank Ltd', category: 'stocks', 
    qty: 45, spotPrice: 1150, targetWeight: 5, unit: 'shares', 
    priceHistory: [1100, 1120, 1150], change24h: 0.45, 
    marketCap: 80500, volume24h: 3450, volatility: 0.005, exchange: 'NSE',
    avgBuyPrice: 1100
  },
  { 
    ticker: 'SBI_BLUE', name: 'SBI Bluechip Fund', category: 'mutual_funds', 
    qty: 500, spotPrice: 85.34, targetWeight: 5, unit: 'units', 
    priceHistory: [80, 82, 85.34], change24h: 0.15, 
    marketCap: 45200, volume24h: 820, volatility: 0.002, exchange: 'BSE',
    avgBuyPrice: 80
  },
  { 
    ticker: 'HDFC_INDEX', name: 'HDFC Index Nifty 50', category: 'mutual_funds', 
    qty: 800, spotPrice: 32.50, targetWeight: 5, unit: 'units', 
    priceHistory: [30, 31, 32.50], change24h: 0.12, 
    marketCap: 28400, volume24h: 610, volatility: 0.002, exchange: 'BSE',
    avgBuyPrice: 30
  },
  { 
    ticker: 'ICICI_BLUE', name: 'ICICI Pru Bluechip Fund', category: 'mutual_funds', 
    qty: 450, spotPrice: 88.20, targetWeight: 5, unit: 'units', 
    priceHistory: [85, 87, 88.20], change24h: 0.20, 
    marketCap: 35200, volume24h: 540, volatility: 0.002, exchange: 'BSE',
    avgBuyPrice: 85
  },
  { 
    ticker: 'NIPPON_GROWTH', name: 'Nippon India Growth Fund', category: 'mutual_funds', 
    qty: 320, spotPrice: 125.40, targetWeight: 5, unit: 'units', 
    priceHistory: [120, 122, 125.40], change24h: -0.05, 
    marketCap: 21500, volume24h: 480, volatility: 0.003, exchange: 'BSE',
    avgBuyPrice: 120
  },
  { 
    // Intentional under-allocation
    ticker: 'BTC', name: 'Bitcoin', category: 'crypto', 
    qty: 0.001, spotPrice: 6044140, targetWeight: 10, unit: 'BTC', 
    priceHistory: [6000000, 6020000, 6044140], change24h: 2.34, 
    marketCap: 13750000, volume24h: 985000, volatility: 0.009, exchange: 'Binance',
    avgBuyPrice: 6000000
  },
  { 
    ticker: 'ETH', name: 'Ethereum', category: 'crypto', 
    qty: 0.21, spotPrice: 285000, targetWeight: 7, unit: 'ETH', 
    priceHistory: [280000, 282000, 285000], change24h: 3.12, 
    marketCap: 3420000, volume24h: 456000, volatility: 0.010, exchange: 'Binance',
    avgBuyPrice: 280000
  },
  { 
    ticker: 'SOL', name: 'Solana', category: 'crypto', 
    qty: 3.4, spotPrice: 12400, targetWeight: 5, unit: 'SOL', 
    priceHistory: [12000, 12200, 12400], change24h: -1.87, 
    marketCap: 578000, volume24h: 89000, volatility: 0.012, exchange: 'Binance',
    avgBuyPrice: 12000
  },
  { 
    ticker: 'XRP', name: 'Ripple XRP', category: 'crypto', 
    qty: 550, spotPrice: 48.50, targetWeight: 3, unit: 'XRP', 
    priceHistory: [45, 47, 48.50], change24h: 1.20, 
    marketCap: 284000, volume24h: 65000, volatility: 0.011, exchange: 'Binance',
    avgBuyPrice: 45
  },
  { 
    ticker: 'ADA', name: 'Cardano ADA', category: 'crypto', 
    qty: 750, spotPrice: 35.20, targetWeight: 2, unit: 'ADA', 
    priceHistory: [30, 32, 35.20], change24h: -0.85, 
    marketCap: 125000, volume24h: 24000, volatility: 0.013, exchange: 'Binance',
    avgBuyPrice: 30
  }
];

export const testDatasetCash = 150000; // Provide enough cash for agent to rebalance
