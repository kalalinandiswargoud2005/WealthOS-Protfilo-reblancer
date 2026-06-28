# WealthOS: Five Modules Documentation

WealthOS is structured into five core modules, each handling a distinct functional domain of the autonomous wealth management platform.

---

## Module 1: Autonomous AI Rebalancing Agent
This is the core intelligence engine of WealthOS. Powered by on-device LLMs (like Qwen 2.5 Coder or Llama 3.2 via Ollama), this module continuously evaluates the portfolio's state. 
- **Function:** Calculates "Drift" (the deviation between target asset allocations and actual market value weights).
- **Execution:** When drift exceeds the 0.4% threshold, the agent autonomously formulates and executes a plan to buy under-allocated assets using available cash, restoring the portfolio to its optimal state.
- **Privacy:** Operates entirely client-side or on a secure local network to ensure financial data privacy.

## Module 2: Multi-Asset Data Aggregation Engine
To make accurate decisions, the AI needs real-time market data across diverse asset classes.
- **Function:** Polls external APIs to fetch live prices.
  - **Crypto:** CoinGecko API (BTC, ETH, SOL, etc.)
  - **Mutual Funds:** MFAPI.in (SBI Bluechip, HDFC Index, etc.)
  - **Commodities:** Metals.dev (Gold, Silver)
  - **Forex:** ER-API (USD/INR conversion)
- **Simulation:** Applies a localized random-walk algorithm to simulate live, second-by-second market volatility and organic portfolio drift for the AI to react to.

## Module 3: Live Trading Dashboard and Analytics
The primary user interface where investors visualize their wealth and agent operations.
- **Function:** Renders real-time, interactive financial charts using React ApexCharts.
- **Features:** Displays total portfolio value, cash balance, and a breakdown of assets by category (Stocks, Crypto, Metals, Mutual Funds).
- **Control:** Allows users to manually execute "Quick Buys", adjust target weights, and monitor the live ticker tape of market movements.

## Module 4: Audit Ledger and Transaction Management
Since an AI is autonomously managing funds, transparency and trust are paramount.
- **Function:** Acts as an immutable record of all system and AI actions.
- **Features:** 
  - **Chain-of-Thought Transcript:** Logs the exact reasoning the AI used before executing a trade (e.g., "Scanning portfolio... Silver drift is -2.1%... Executing BUY order").
  - **Bank Integration:** Manages a simulated banking layer, tracking deposits, withdrawals, and trade settlements to ensure accurate cash flow accounting.

## Module 5: User Onboarding & Financial Profiling
A crucial module for personalizing the AI's behavior to the specific investor's goals and risk tolerance.
- **Function:** Guides new users through initial setup and capital allocation.
- **Features:**
  - Captures demographic data, linked bank accounts, and initial deposit amounts.
  - Assesses the user's Risk Profile (Conservative, Balanced, Aggressive) to automatically suggest initial Target Weights for the portfolio.
  - Provides a secure login mechanism (with biometric simulation) to protect access to the financial dashboard.
