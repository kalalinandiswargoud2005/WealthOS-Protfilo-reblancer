# WealthOS Pro – Highly Detailed SDLC Flowchart

This diagram visualizes the granular actions, technical decisions, and team interactions across all 5 phases of the 4-1 Major Project development lifecycle.

```mermaid
graph TD
    %% Node Styling
    classDef member fill:#1E1E2E,stroke:#8B5CF6,stroke-width:2px,color:#fff,font-weight:bold,stroke-dasharray: 5 5
    classDef doc fill:#181825,stroke:#313244,stroke-width:1px,color:#cdd6f4
    classDef tech fill:#11111B,stroke:#f59e0b,stroke-width:2px,color:#fff
    classDef error fill:#450a0a,stroke:#ef4444,stroke-width:2px,color:#fca5a5
    classDef success fill:#064e3b,stroke:#10b981,stroke-width:2px,color:#6ee7b7
    classDef action fill:#181825,stroke:#4b5563,stroke-width:1px,color:#e5e7eb

    %% Team Members
    N([Nandeeshwar - Team Lead]):::member
    K([Kowshik - Team Member]):::member
    J([Jyothi - Team Member]):::member

    %% Phase 1
    subgraph Phase 1: Inception & Architecture
        N --> SRS[Draft Software Requirements Spec]:::doc
        SRS --> Stack{Tech Stack Decision}:::tech
        Stack --> |Frontend| React[React v19 + TS]:::tech
        Stack --> |Bundler| Vite[Vite v8]:::tech
        Stack --> |Styling| Tailwind[TailwindCSS v4]:::tech
        
        Vite --> Scaffold[npm create vite@latest]:::action
        Scaffold --> GitInit[git init & Add Collaborators]:::action
        
        K --> Router[npm install react-router-dom]:::action
        Router --> Skeleton[App.tsx Layout & Routing]:::action
        
        N --> Context[React Context API + LocalStorage]:::action
        Context --> Engine[Drift Math Engine: drift = current - target]:::action
        Engine --> AutoPilot[autoRebalance setInterval 25s]:::action
        
        K --> Apex[npm install apexcharts]:::action
        Apex --> Dashboard[Build Area & Donut Charts]:::action
        Dashboard --> Merge1((Merge to Main)):::success
    end

    %% Phase 2
    subgraph Phase 2: Utilities & Integrations
        Merge1 --> K2[Kowshik]
        K2 --> MarketWatch[Build MarketWatch.tsx Grid]:::action
        K2 --> jsPDF[npm install jspdf html2canvas]:::action
        jsPDF --> PDFBtn[Build PDF Download Statement Feature]:::success
        
        Merge1 --> J2[Jyothi]
        J2 --> Transactions[Build TransactionsPage.tsx]:::action
        J2 --> QRCode[npm install html5-qrcode]:::action
        QRCode --> QRModal[Build PaymentQRModal.tsx]:::action
        
        QRModal --> QRError{Camera Focus Failing?}:::error
        QRError -- Yes --> FixQR[Remove qrbox, set fps: 20]:::success
        
        Merge1 --> N2[Nandeeshwar]
        N2 --> LocalStorage[useEffect Sync Context to LocalStorage]:::success
        N2 --> Optimize[useCallback to prevent re-renders]:::action
    end

    %% Phase 3
    subgraph Phase 3: AI Prototyping & Mocking
        FixQR --> Phase3Start((Start AI Phase))
        Phase3Start --> MockAuth[Simulate Login via LocalStorage]:::action
        Phase3Start --> ChatUI[Design ChatGPT-style AI Interface]:::action
        Phase3Start --> MockAI[Build Regex Mock Engine & UPI Interceptor]:::action
        
        Phase3Start --> Ollama[Install Local Ollama]:::action
        Ollama --> LocalLLM{Test llama3 & mistral locally}:::tech
        LocalLLM -- Latency & Battery Drain --> LocalFail[Hardware Limitations Reached]:::error
        LocalLLM -- Secure Offline Inference --> PrivacyWin[High Privacy]:::success
        
        LocalFail --> PivotToCloud[Decision: Pivot to Cloud API]:::highlight
        Phase3Start --> Voice[window.speechSynthesis for Voice UI]:::action
    end

    %% Phase 4
    subgraph Phase 4: Gemini Cloud Integration
        PivotToCloud --> J4[Jyothi]
        J4 --> SDK[npm install @google/genai]:::tech
        SDK --> Env[.env config + Fallback Key UI]:::action
        
        N4[Nandeeshwar] --> PromptEng[Inject Live Portfolio State into Prompt]:::action
        PromptEng --> SyncAI[Context Syncs with Gemini]:::success
        
        J4 --> Streaming[ai.models.generateContentStream]:::action
        Streaming --> SyncVoice[Wait for Stream to finish before Voice TTS]:::action
        
        SyncVoice --> HTTPSBug{QR Fails on Local Network?}:::error
        HTTPSBug -- Yes --> FixHTTPS[Remove @vitejs/plugin-basic-ssl]:::success
    end

    %% Phase 5
    subgraph Phase 5: Build & Deployment
        FixHTTPS --> BuildTest[npm run build: tsc -b && vite build]:::action
        BuildTest --> PWABug{JS Chunk > 2MB?}:::error
        PWABug -- Yes --> FixPWA[Update workbox maximumFileSizeToCacheInBytes]:::success
        
        FixPWA --> Push[Push pristine code to GitHub main]:::action
        Push --> Vercel[Vercel CI/CD Auto-Deployment]:::tech
        Vercel --> ConfigureEnv[Add VITE_GEMINI_API_KEY to Vercel]:::action
        ConfigureEnv --> LiveURL((App is Live!)):::success
        
        LiveURL --> FinalQA[Team Final QA Walkthrough]:::action
        FinalQA --> Report[Generate 30-Day SDLC Documentation]:::action
        Report --> Submit[Submit 4-1 Phase-1 Project 🎓]:::success
    end
```
