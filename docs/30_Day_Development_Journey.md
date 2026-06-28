# WealthOS Pro: 4-1 Major Project (Phase-1) Development Steps

This document is a hyper-detailed, granular guide of the entire Software Development Life Cycle (SDLC) for **WealthOS Pro**. It records every action, command, technology choice, and victory—reconstructing the step-by-step journey of our team as we built our **4-1 Major Project (Phase-1)**.

---

## 👥 Team Structure & Module Delegation

To ensure organized contribution, the project was architected into **5 core modules**, which were delegated among our 3 team members:

**1. Core Architecture & Global State Module**
- **Assignee:** Nandeeshwar (Team Leader)
- **Responsibilities:** Project scaffolding, Vite/Tailwind configuration, building the `PortfolioContext` for global state management, and implementing HTML5 LocalStorage for session persistence.

**2. Auto-Pilot Rebalancing Engine Module**
- **Assignee:** Nandeeshwar (Team Leader)
- **Responsibilities:** Designing the mathematical algorithms for drift calculation, setting up the background interval scanning, and building the logic to simulate asset buying/selling based on target weights.

**3. Data Visualization & Reporting Module**
- **Assignee:** Kowshik (Team Member)
- **Responsibilities:** Designing the Dashboard UI, integrating interactive `ApexCharts` (Area and Donut charts), building the Market Watch grids, and creating the downloadable PDF statement generator using `jsPDF` and `html2canvas`.

**4. Gemini AI Assistant & Voice Integration Module**
- **Assignee:** Jyothi (Team Member)
- **Responsibilities:** Building the Chat interface, integrating the Google Gemini cloud API, engineering dynamic context prompts, managing response streaming, and implementing the Web Speech API for voice output.

**5. Payment Gateway & Authentication Module**
- **Assignee:** Jyothi (Team Member)
- **Responsibilities:** Integrating the WebRTC UPI QR Scanner (`html5-qrcode`), building the mock authentication (Login) flow, and developing the banking/wallet transaction simulation pages.

---

## Phase 1: Inception, Architecture, & Scaffolding

### Step 1: Project Kick-Off & Stack Selection
- The team met to finalize the abstract for Phase-1. We decided to build a "fintech-grade" dashboard to track and auto-rebalance multiple asset classes.
- Drafted the Software Requirements Specification (SRS) outlining our 5 modules.
- **Technology Stack & Versions Finalized (Team Decision):** 
  - *Framework:* **React (v19.0.0)** - Chosen for its latest hooks and component reusability.
  - *Language:* **TypeScript (v5.7.0)** - Strict typing prevents runtime financial calculation errors.
  - *Bundler:* **Vite (v8.0.0)** - Chosen over Webpack/CRA for lightning-fast Hot Module Replacement.
  - *Styling:* **TailwindCSS (v4.0.0)** - Utility-first styling for rapid prototyping without separate CSS files.
  - *Routing:* **React Router DOM (v7.0.0)** - For seamless Single Page Application (SPA) navigation.

### Step 2: Environment Setup & Scaffolding
- Opened the terminal to scaffold the React app.
  - *Command:* `npm create vite@latest 4-1 -- --template react-ts`
- Configured Git (`git init`, `git branch -M main`) and added team members as collaborators.
- Installed the Design System.
  - *Command:* `npm install tailwindcss @tailwindcss/vite lucide-react`

### Step 3: Architectural Skeleton & Routing
- Installed React Router (`npm install react-router-dom`) to build out the SPA shell.
- Created the fundamental folder structure (`src/components`, `src/pages`, `src/context`, `src/utils`).
- Built the master layout in `App.tsx` featuring a responsive Sidebar and Header.
- Implemented `<BrowserRouter>` and linked placeholder pages.

### Step 4: State Management & Database Design
- Began work on the core data layer. Since Phase-1 relies on client-side storage, utilized the **React Context API** paired with HTML5 `localStorage`.
- Created `PortfolioContext.tsx` and designed the `Asset` TypeScript interface.
- Hardcoded the initial mock state for 16 assets across 4 categories to have data to test the UI against.

### Step 5: The Math Engine & Auto-Pilot Logic
- Wrote the core business logic.
- Defined the drift calculation algorithm: `drift = (current_weight_percentage - target_weight_percentage)`.
- Created the `autoRebalance` interval using `useEffect` and `setInterval`. It scans the portfolio every 25 seconds and executes simulated trades using the `cashBalance`.

### Step 6: Visualizing Data (The Dashboard)
- Began work on the analytics UI.
  - *Command:* `npm install apexcharts react-apexcharts`
  - *Why ApexCharts:* Far superior to standard Chart.js for financial data (glowing area charts, donut charts) and works perfectly with React.
- Implemented a dark-themed Area Chart to show historical portfolio value and a Donut Chart for asset distribution.

### Step 7: First Merge & Review
- The team conducted a code review.
- Merged the dashboard and Context API into the `main` branch. 

---

## Phase 2: Feature Expansion & Utilities

### Step 8: Market Watch & Grid UI
- Built `MarketWatch.tsx` with segmented tabs.
- Designed asset cards using Tailwind grids for mobile responsiveness, utilizing `lucide-react` icons.

### Step 9: Transaction History & Banking
- Built `TransactionsPage.tsx` to simulate bank deposits.
- Created `QuickInvestDrawer.tsx`, wiring it to update the global `cashBalance` inside `PortfolioContext`.

### Step 10: PDF Statement Generation
- Tackled the report generation requirement for Phase-1.
  - *Command:* `npm install jspdf html2canvas`
  - *Why jsPDF & html2canvas:* `html2canvas` captures the React DOM (like our complex ApexCharts) and `jspdf` compiles it into a downloadable document.
- Added a "Download Statement" button. 

### Step 11: The QR Scanner Integration (Part 1)
- Started working on the UPI scanning module.
  - *Command:* `npm install html5-qrcode`
  - *Why:* It's the most robust library for tapping into native WebRTC camera streams in the browser.
- Built `PaymentQRModal.tsx`. 

### Step 12: Debugging the QR Scanner
- Investigated why the camera struggled to focus on external screens. Realized the default `qrbox` parameter restricted the camera's search area too aggressively.
- Removed the `qrbox` parameter and increased `fps: 20` to force faster frame analysis. Tested successfully.
- Wired the decoded string to trigger a simulated bank transfer in the Context API.

### Step 13: Local Storage Persistence
- Wrote `useEffect` hooks in `PortfolioContext.tsx` to serialize `assets` and `cashBalance` to standard HTML5 `localStorage` via `JSON.stringify`, ensuring session data survives page reloads perfectly.

### Step 14: Mid-Project Refactor & Polish
- Wrapped heavy context functions in `useCallback` to prevent unnecessary React re-renders.

---

## Phase 3: Mocking AI, Ollama Testing, & Authentication

### Step 15: Mock Authentication System
- Built a simple Login page to satisfy the Phase-1 auth requirement, simulated by storing a `user` object in `localStorage`. 

### Step 16: Designing the AI Assistant UI
- Built the UI for the flagship feature: The AI Assistant.
- Designed `AIAssistant.tsx` resembling a modern ChatGPT interface with a split-screen design.

### Step 17 & 18: UPI Chat Interception & Mock Engine
- Collaborated on a mock engine. Wrote a `generateResponse()` function using regex to intercept keywords.
- Added a natural language transaction feature: Typing "Send Nandu 500 PIN 1234", wiring it to deduct funds from `PortfolioContext` instantly.

### Step 19: Privacy-First AI Exploration with Ollama
- The team wanted a highly secure AI that processes portfolio data entirely offline. Spearheaded this by installing **Ollama** locally.
- Downloaded the `llama3` and `mistral` models via Ollama to test local inference capabilities.
- Attempted to wire the frontend to `http://localhost:11434/api/generate`.
- **Problem:** While Ollama was incredibly secure (zero data left the machine), running a 7B parameter model locally proved too slow on standard project laptops, causing UI lockups and extreme battery drain.

### Step 20: Voice Output Integration
- Utilized the browser's native `window.speechSynthesis` API for offline, zero-latency text-to-speech, adding a "Voice ON/OFF" toggle.

### Step 21: Strategy Pivot to Google Gemini
- Acknowledging the hardware limitations of Ollama for Phase-1 demonstrations, the team pivoted to a cloud API.
- **Selected Google Gemini (gemini-2.5-flash)**.
  - *Why Gemini:* Incredible speed (fixes the Ollama latency issue), massive context window (ideal for feeding in large JSON portfolio data), and the official `@google/genai` SDK is perfectly suited for modern TypeScript environments.

---

## Phase 4: Deep Tech, Gemini API, & Optimization

### Step 22: Gemini SDK Integration
- Installed the SDK: `npm install @google/genai`.
- Created a `.env` file containing `VITE_GEMINI_API_KEY`. Added `.env` to `.gitignore` to prevent secret leakage on our GitHub repo.

### Step 23: Secure API Key Management UI
- Built a fallback UI. If the `.env` key isn't present, an input box appears allowing the project guide to provide their own Gemini API Key during evaluation.

### Step 24: Prompt Engineering & Context Injection
- Designed a dynamic `systemInstruction`. Mapped the `totalPortfolioValue` and `assets` array into the prompt.
- Tested it. Asked Gemini, "Which asset should I buy?" It correctly identified the underweighted assets based on live Context state!

### Step 25: API Response Streaming
- Refactored `sendMessage` to use `ai.models.generateContentStream`.
- Set up an async `for await` loop. The AI's response now types out onto the screen flawlessly in real-time.

### Step 26: Syncing Voice with Streaming
- Refactored the speech logic to wait until the `generateContentStream` loop finished entirely before speaking to prevent overlapping audio bugs.

### Step 27: HTTPS & Local Environment Bugs
- Removed `@vitejs/plugin-basic-ssl` from `vite.config.ts` to fix local network QR scanning bugs caused by secure context requirements on non-HTTPS IP addresses.

### Step 28: Preparing for Production Build
- Ran a production build test: `npm run build` (`tsc -b && vite build`).
- **Warning:** Vite-plugin-PWA threw an error because the bundled JS chunk exceeded the 2MB Service Worker cache limit.
- Fixed `vite.config.ts` by adding `workbox: { maximumFileSizeToCacheInBytes: 5000000 }`.
- Build succeeded perfectly.

---

## Phase 5: Deployment & Submission Prep

### Step 29: Production Deployment
- Pushed the pristine codebase to the GitHub `main` branch.
- **Hosting Choice:** Vercel.
  - *Why Vercel:* Chosen for its zero-config CI/CD pipeline for Vite projects, automatically building and deploying upon every GitHub push.
- Configured the Environment Variables in the Vercel dashboard (`VITE_GEMINI_API_KEY`).
- Deployment successful! The Phase-1 app is now live on a global URL.

### Step 30: Final Review & Project Submission
- The team conducted a final end-to-end walkthrough.
- Tested the QR Scanner on mobile. Working flawlessly.
- Tested the PDF report generation and verified the chart renders.
- Verified the Auto-Pilot logic successfully simulated a rebalance cycle, and interacted with the Gemini AI to ensure context injection worked in production.
- Generated this Documentation Package as part of the project report deliverables.
- The team successfully submitted **WealthOS Pro (Phase-1)** for the 4-1 Major Project review! 🎓🚀
