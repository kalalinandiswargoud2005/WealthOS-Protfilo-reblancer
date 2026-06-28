# WealthOS Pro – Complete Software Development Journey (SDLC Documentation)

---

## 1. Project Overview
**WealthOS Pro** is a modern, fintech-grade portfolio management and auto-rebalancing dashboard. Built as a 4-1 Major Project (Phase-1), it empowers users to track, analyze, and automatically rebalance diverse assets (Stocks, Cryptocurrencies, Precious Metals, and Mutual Funds) through an intelligent, AI-assisted interface. The system leverages local storage for session management and integrates bleeding-edge technologies like the Google Gemini LLM API and WebRTC QR scanning.

## 2. Requirement Analysis
During the initial phase, the team identified the following core requirements:
- **Core Functionality:** Track multiple asset classes with real-time (simulated) price variations.
- **Automation:** An "Auto-Pilot" engine capable of calculating portfolio drift and automatically executing trades to maintain target weights.
- **Analytics:** Interactive data visualization (Area/Donut charts) and downloadable PDF statements.
- **Intelligence:** A conversational AI Assistant capable of reasoning about the user's specific portfolio state.
- **Utility:** A UPI QR scanner for simulated wallet deposits.

## 3. Problem Statement
Retail investors often struggle to maintain their target asset allocations across highly volatile markets (e.g., Crypto vs. Mutual Funds). Without constant monitoring, portfolios suffer from "drift," leading to unintended risk exposure. Existing tools are heavily fragmented—requiring one app for stocks, another for crypto, and another for AI advice. **WealthOS Pro solves this by centralizing all assets into a single, automated, AI-driven dashboard.**

## 4. Technology Stack Selection
The following stack was explicitly chosen to meet the project's performance and scalability requirements:
- **Framework:** React (v19.0.0)
- **Language:** TypeScript (v5.7.0) - *Chosen to prevent runtime financial calculation errors.*
- **Bundler:** Vite (v8.0.0) - *Chosen for lightning-fast HMR over Webpack.*
- **Styling:** TailwindCSS (v4.0.0) - *Utility-first approach for rapid UI prototyping.*
- **Routing:** React Router DOM (v7.0.0) - *For seamless SPA navigation.*
- **Data Visualization:** ApexCharts & React-ApexCharts - *Superior financial rendering over Chart.js.*
- **AI Engine:** Google Gemini SDK (`@google/genai`) - *Chosen over OpenAI/Ollama for its massive context window and low latency.*
- **Utilities:** `html5-qrcode` (WebRTC camera), `jsPDF` & `html2canvas` (Report generation).

## 5. Software Architecture Design
WealthOS Pro is a **Client-Side Single Page Application (SPA)**. 
- **View Layer:** React components handling UI and localized state.
- **State Layer:** React Context API acting as the central store for all portfolio and transaction data.
- **Persistence Layer:** HTML5 LocalStorage acting as the pseudo-database.
- **External Interfaces:** The application communicates outwardly to the Google Gemini API for LLM inference.

## 6. Environment Setup
The development environment required Node.js (v20+). 
- `npm create vite@latest` was used to scaffold the environment.
- ESLint and TypeScript configs were enforced strictly.
- A `.env` file was established to securely manage the `VITE_GEMINI_API_KEY` away from source control.

## 7. Project Initialization
The folder structure was systematically designed for scalability:
- `src/components/` - Highly reusable, isolated UI elements (Modals, Drawers).
- `src/pages/` - High-level route views (Dashboard, MarketWatch, AIAssistant).
- `src/context/` - The global state engine (`PortfolioContext.tsx`).
- `src/utils/` - Independent logic scripts (e.g., PDF generators).
Git was initialized (`git init`), and an initial commit was pushed to a shared GitHub repository for team collaboration.

## 8. UI/UX Design Process
The UI was designed using a "Glassmorphism" fintech aesthetic.
- **Theme:** Exclusively Dark Mode. Base background `#09090B`.
- **Color Palette:** Amber (`#f59e0b`) for warnings/actions, Emerald (`#10b981`) for success/growth, and Zinc for subtle borders.
- **Micro-interactions:** Extensive use of CSS hover scales (`hover:scale-105`), active click states, and `animate-pulse` for the Auto-Pilot indicators.

## 9. Frontend Development
Frontend development was divided by modules. It involved heavy use of Tailwind CSS grids and flexboxes to ensure absolute responsiveness across mobile, tablet, and desktop viewports. The `App.tsx` shell houses the dynamic Sidebar and top Header, while `<Routes>` swaps out the core views seamlessly without browser reloads.

## 10. Backend/API Development
While Phase-1 lacks a traditional Node.js/Postgres backend, the application relies heavily on two "API" architectures:
1. **The Internal Context API:** Functions like `executeUpiTransfer` and `autoRebalance` act as the internal backend, processing logic before committing to the database (LocalStorage).
2. **The External LLM API:** Connecting to Google's GenAI endpoints via REST.

## 11. Database Design
The application utilizes HTML5 `localStorage` formatted as JSON objects.
- **User Schema:** `{ name: string, email: string, transactionPin: string }`
- **Asset Schema:** `{ ticker: string, category: 'metals'|'stocks'|'crypto'|'mutual_funds', qty: number, spotPrice: number, targetWeight: number }`
- **Transaction Schema:** `{ id: number, type: 'deposit'|'withdrawal', amount: number, timestamp: string }`

## 12. State Management
**React Context API** was chosen over Redux. The `PortfolioContext` serves as the single source of truth. It manages the `assets` array, `cashBalance`, and `investMode`. It also houses the `useEffect` hooks responsible for hydrating the application state from `localStorage` on boot, and serializing changes back to storage upon modification.

## 13. AI Integration
The AI integration is the flagship feature. 
- **Prompt Engineering:** We built a dynamic `systemInstruction` string that injects the user's live `totalPortfolioValue`, `cashBalance`, and an array of their assets directly into the prompt.
- **Streaming:** Using `ai.models.generateContentStream`, the application streams the AI's response chunk-by-chunk for a ChatGPT-like UX.
- **Voice:** The browser's native `SpeechSynthesis` API reads the AI's response aloud upon completion.

## 14. Feature Development
- **QR Scanner:** Integrated `html5-qrcode` to tap into the device camera, decoding UPI strings.
- **Statement Downloads:** Implemented `html2canvas` to screenshot the ApexCharts, and `jsPDF` to bundle those images into a downloadable PDF format.
- **Auto-Pilot Engine:** A mathematical engine that runs a background interval every 25 seconds to correct drift by executing simulated localized trades.

## 15. Testing & Debugging
The team relied heavily on manual E2E (End-to-End) testing. 
- **QR Testing:** Tested across mobile and desktop cameras. Discovered focus issues with the default `qrbox` parameter.
- **Network Testing:** Discovered that Vite's `basicSsl` plugin caused secure-context issues on local IP addresses, breaking WebRTC. 

## 16. Performance Optimization
- **React Optimization:** Wrapped heavy context functions and event handlers in `useCallback` to prevent unnecessary re-renders of the complex ApexCharts.
- **Lazy Loading Strategy:** Response text from Gemini is streamed asynchronously, preventing UI lockup while waiting for full API returns.

## 17. Version Control (Git & GitHub)
The project utilized Git for version control. 
- The `main` branch acted as the production source of truth.
- A strict `.gitignore` file was utilized to ensure `node_modules` and the `.env` file (containing the Gemini API Key) were never pushed to the public repository.

## 18. Production Build
The production build leverages Vite's Rollup configuration.
- **Command:** `tsc -b && vite build`
- **Optimization:** Vite minifies the Javascript and CSS. 
- **PWA Limits:** During the build process, the generated JS chunk exceeded 2MB, breaking the default Service Worker cache limits. This was solved by modifying `vite.config.ts`.

## 19. Deployment
The application is deployed on **Vercel**.
- Vercel was chosen for its zero-configuration CI/CD pipeline for Vite.
- Every push to the GitHub `main` branch automatically triggers a new optimized build.
- The `VITE_GEMINI_API_KEY` was securely added to the Vercel Environment Variables dashboard.

## 20. Challenges Faced
1. **Ollama Hardware Constraints:** Attempting to run a 7B parameter LLM locally for privacy caused severe UI latency and battery drain.
2. **QR Scanner Focus:** The scanner failed to read QR codes from external phone screens due to restrictive scanning parameters.
3. **PWA Chunk Size Limit:** The heavy libraries (ApexCharts, jsPDF, GenAI) caused the build chunk to exceed the 2MB Service Worker limit.

## 21. Solutions Implemented
1. **Cloud Pivot:** Abandoned local Ollama models in favor of the lightning-fast Google Gemini cloud API.
2. **Scanner Tuning:** Removed the `qrbox` constraint and increased `fps` to 20 in `PaymentQRModal.tsx`.
3. **Vite Config Update:** Added `workbox: { maximumFileSizeToCacheInBytes: 5000000 }` to `vite.config.ts` to allow 5MB chunks.

## 22. Lessons Learned
- **Architecture:** Context API is incredibly powerful for SPA state but requires careful use of `useCallback`/`useMemo` to prevent massive re-render trees.
- **Hardware vs Cloud:** While "privacy-first" local AI (Ollama) is ideal in theory, modern web applications still require cloud APIs (Gemini) to maintain acceptable UX on consumer hardware.
- **WebRTC Limits:** Browser APIs for cameras and microphones require strict HTTPS contexts to function, severely complicating local network testing.

## 23. Future Enhancements
For Phase-2 of the Major Project, the team plans to:
- Migrate the database from `localStorage` to **PostgreSQL**.
- Build a true backend server using **Node.js/Express**.
- Integrate OAuth2 for Google/GitHub login.
- Connect to real broker APIs (like Zerodha Kite API) for actual trade execution instead of simulated trades.

## 24. Conclusion
WealthOS Pro successfully bridges the gap between static portfolio trackers and advanced algorithmic trading terminals. By successfully completing Phase-1, the team demonstrated mastery over modern React development, complex state management, WebRTC integrations, and the integration of cutting-edge Generative AI APIs.

## 25. Appendix
- **Frontend Framework:** React (https://react.dev)
- **Bundler:** Vite (https://vitejs.dev)
- **Styling:** TailwindCSS (https://tailwindcss.com)
- **AI SDK:** Google GenAI (https://aistudio.google.com)
- **Charts:** ApexCharts (https://apexcharts.com)
- **Scanner:** HTML5-QRCode (https://github.com/mebjas/html5-qrcode)
