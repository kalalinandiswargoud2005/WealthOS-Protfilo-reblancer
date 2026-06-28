# WealthOS: Project Development Guide

This document provides a comprehensive step-by-step guide to building the WealthOS project from scratch, including software installation, environment setup, and deployment to production platforms like Vercel and Render.

---

## 1. Prerequisites and Installation

### 1.1 Development Environment setup
- **Node.js**: Ensure Node.js (v18 or higher) is installed. It's required for running the React frontend.
- **Git**: Version control system to manage the codebase.
- **Antigravity IDE**: (Or your preferred IDE like VS Code). Install the IDE to utilize AI-assisted coding features like Gemini 3.1 Pro.

### 1.2 Initializing the Project
The project is built using **Vite**, a modern frontend build tool that is significantly faster than Create React App.

```bash
# Initialize a new Vite project with React and TypeScript
npm create vite@latest wealthos -- --template react-ts

# Navigate into the project folder
cd wealthos

# Install dependencies
npm install
```

---

## 2. Technology Stack Overview

| Technology | Full Form / Description | Version | Purpose in WealthOS |
| :--- | :--- | :--- | :--- |
| **React** | React JS Library | `^19.2.6` | Building the interactive User Interface and Component Architecture. |
| **TypeScript** | TypeScript | `~6.0.2` | Adding strict static typing to JavaScript for robustness and better DX. |
| **Vite** | Vite (French for "fast") | `^8.0.12` | Next-generation frontend tooling for lightning-fast HMR and building. |
| **Tailwind CSS** | Tailwind CSS Framework | `^4.3.1` | Utility-first CSS framework for rapid and highly customizable UI styling. |
| **ApexCharts** | React ApexCharts | `^2.1.1` | Rendering interactive financial data visualizations and drift charts. |
| **Lucide React** | Lucide Icon Library | `^1.21.0` | Providing scalable vector graphics for intuitive UI iconography. |
| **Ollama** | Local Large Language Models | `Latest` | Running open-weight models (Qwen 2.5 Coder, Llama 3.2) locally for privacy-preserving AI decisions. |
| **Supabase** | Supabase Postgres | `PostgreSQL 15` | Backend-as-a-Service providing the primary relational database for state management. |
| **Gemini 3.1 Pro** | Gemini 3.1 Pro Flash | `3.1 Pro` | Used during development as the core AI assistant within Antigravity IDE for code generation. |

---

## 3. Hardware Requirements (For Local AI Execution)

Running agentic AI logic completely on-device requires sufficient hardware capabilities, specifically for Ollama and local LLM execution.

*   **Minimum Setup:**
    *   **RAM:** 8GB (Sufficient for small quantized models like Qwen 2.5 1.5B or Llama 3.2 1B).
    *   **Processor:** Modern multi-core CPU (Intel i5 10th Gen+, AMD Ryzen 5+, Apple M1).
    *   **GPU:** Not strictly required, but highly recommended for fast token generation.
*   **Recommended Setup (For optimal performance):**
    *   **RAM:** 16GB - 32GB (Allows running 7B-8B parameter models comfortably).
    *   **Processor:** Apple Silicon (M1/M2/M3 Pro or Max) or Intel i7/i9 with a dedicated GPU (Nvidia RTX 3060 or better with at least 8GB VRAM).

---

## 4. Deployment Guide

### 4.1 Deploying the Frontend to Vercel
Vercel is the optimal platform for hosting React applications built with Vite due to its global Edge Network.

1.  **Push Code to GitHub:** Ensure your `wealthos` repository is pushed to a GitHub account.
2.  **Create Vercel Project:**
    *   Go to [Vercel.com](https://vercel.com) and log in with GitHub.
    *   Click "Add New..." -> "Project".
    *   Import your `wealthos` repository.
3.  **Configure Build Settings:**
    *   Framework Preset: **Vite**
    *   Build Command: `npm run build`
    *   Output Directory: `dist`
4.  **Environment Variables:** Add any required API keys (e.g., for Metals.dev or Supabase).
5.  **Deploy:** Click "Deploy". Vercel will automatically build and publish your application to a live URL.

### 4.2 Deploying Backend Services to Render (Supabase/Postgres)
While Supabase Cloud offers a managed solution, you can self-host Postgres on Render.

1.  Go to [Render.com](https://render.com).
2.  Click "New" -> "PostgreSQL".
3.  Configure your database instance (Name, Database, User, Region).
4.  Once spun up, Render provides an internal and external database URL. Use this URL in your application's environment variables to connect to the cloud database instead of local storage.

---

## 5. System Workflows

1. **Initialization:** The app boots up, fetching historical data from Supabase/LocalStorage and live data from external APIs (CoinGecko, MFAPI).
2. **Market Simulation:** The `PortfolioContext` applies a localized random-walk algorithm to simulate live market movements, causing real-time portfolio drift.
3. **Agent Cycle:** If set to 'Auto', the AI Agent awakens every 25 seconds, calculates drift against user targets, and executes autonomous trades using simulated API calls, recording all actions in the Immutable Audit Ledger.
