"""
doc_content_ch1_ch2.py
Chapters 1 & 2 for WealthOS Academic Project Report:
Chapter 1: Introduction
  1.1 Problem Definition & Description
  1.2 Aim and Objectives of the Project
  1.3 Scope of the Project
Chapter 2: System Analysis
  2.1 Existing System Analysis
    2.1.1 Background & Literature Survey
    2.1.2 Limitations of Existing System
  2.2 Proposed System Analysis
    2.2.1 Proposed System Description
    2.2.2 Advantages of Proposed System
  2.3 Software & Hardware Requirements
    2.3.1 Software Requirements (Table 2.1)
    2.3.2 Hardware Requirements (Table 2.2)
  2.4 Feasibility Study
    2.4.1 Technical Feasibility
    2.4.2 Robustness & Reliability
    2.4.3 Economic Feasibility
All styling is strictly black with zero blue elements.
"""

from docx.shared import Inches, Pt, RGBColor
from scripts.build_complete_documentation import (
    add_heading_1, add_heading_2, add_heading_3, add_body, add_bullet, add_callout, add_custom_table
)

def add_chapter_1(doc):
    add_heading_1(doc, "1. Introduction")
    
    add_body(
        doc,
        "Modern personal financial management has fundamentally transformed over the past decade. Where individuals once held "
        "modest savings accounts and occasional sovereign bonds, today's retail investors actively allocate capital across a highly "
        "complex, multi-asset landscape comprising Indian equities (NSE/BSE listed equities), mutual fund schemes, 24/7 liquid cryptocurrencies "
        "(e.g., Bitcoin, Ethereum, Solana), and traditional bullion precious metals (Gold and Silver). Modern Portfolio Theory (MPT), originally "
        "formulated by Nobel laureate Harry Markowitz in 1952, demonstrates that optimal risk-adjusted returns are achieved through strategic asset "
        "allocation and periodic rebalancing. By combining non-correlated assets, an investor constructs a portfolio along the Efficient Frontier, "
        "capturing upside returns while curtailing catastrophic downside volatility drawdowns.",
        space_after=8
    )
    add_body(
        doc,
        "However, maintaining an optimal target allocation across heterogeneous modern asset classes is extraordinarily challenging. Different "
        "asset classes operate under fundamentally divergent market mechanics, trading hours, liquidity structures, and volatility regimes. "
        "Cryptocurrency markets trade uninterrupted 24 hours a day, 365 days a year, exhibiting high intra-day price swings. Indian equity exchanges "
        "(NSE and BSE) operate strictly from 9:15 AM to 3:30 PM IST on weekdays, while mutual fund holdings calculate Net Asset Values (NAV) "
        "only once per business day at market close. Physical and digital gold markets fluctuate based on global spot prices and domestic commodity "
        "exchange (MCX) hours. Consequently, asset prices drift rapidly at asynchronous velocities, continuously distorting the investor's intended risk equilibrium.",
        space_after=8
    )
    
    # 1.1 Problem Definition & Description
    add_heading_2(doc, "1.1 Problem Definition & Description")
    add_body(
        doc,
        "Portfolio drift occurs when price movements cause the monetary proportion of an asset class to diverge from its initial target weight. "
        "Formally, consider a multi-asset portfolio comprising M distinct asset classes. Let n_i denote the quantity held in asset i, and let P_i(t) "
        "denote the prevailing real-time unit price of asset i at time t. The total portfolio valuation V(t) is defined as:",
        space_after=4
    )
    add_body(
        doc,
        "V(t) = Sum_{j=1 to M} [ n_j * P_j(t) ]",
        bold_prefix="Equation 1.1: ",
        space_after=4
    )
    add_body(
        doc,
        "The actual instantaneous weight w_i(t) of asset i at time t is consequently expressed as:",
        space_after=4
    )
    add_body(
        doc,
        "w_i(t) = ( n_i * P_i(t) ) / V(t)  where  Sum_{i=1 to M} w_i(t) = 1.0",
        bold_prefix="Equation 1.2: ",
        space_after=6
    )
    add_body(
        doc,
        "Let w_i* denote the investor's target strategic allocation weight (e.g., 40% Equities, 30% Mutual Funds, 20% Gold, 10% Crypto). "
        "The instantaneous percentage allocation drift delta_w_i(t) is governed by:",
        space_after=4
    )
    add_body(
        doc,
        "delta_w_i(t) = w_i(t) - w_i*",
        bold_prefix="Equation 1.3: ",
        space_after=6
    )
    add_body(
        doc,
        "When a high-beta asset such as Bitcoin rallies rapidly (e.g., +45% in a single month), its actual weight w_i(t) swells substantially "
        "beyond w_i*. If an investor intended to hold only 10% in high-risk crypto, an unmonitored rally can expand this exposure to 25% or 30% of "
        "their total net worth. When the subsequent market correction strikes, the portfolio suffers severe, unhedged capital destruction. "
        "Conversely, when an undervalued asset lags, the investor fails to accumulate shares at distressed valuations, forfeiting the classic "
        "buy-low, sell-high rebalancing premium.",
        space_after=8
    )
    add_body(
        doc,
        "Manual remediation of portfolio drift imposes severe cognitive and operational friction on retail investors:",
        space_after=4
    )
    add_bullet(doc, "Account Fragmentation:", "Investors hold assets across fragmented platforms—equities in Demat accounts (Zerodha, Groww), crypto on centralized exchanges (CoinDCX, Binance), mutual funds on registrar apps (CAMS, KFintech), and gold in sovereign bonds or physical lockers. Consolidating total portfolio net worth requires tedious manual calculation.")
    add_bullet(doc, "Cognitive Overload & Emotional Bias:", "Calculating cross-asset delta orders requires continuous mathematical recalculation. In practice, behavioural biases (loss aversion, FOMO) prevent investors from taking profits on rallying assets or deploying cash into declining assets.")
    add_bullet(doc, "Centralized Cybersecurity Vulnerabilities:", "Commercial cloud-based wealth management aggregators require users to upload sensitive KYC documents, PAN cards, Demat credentials, and bank account details onto remote servers. These centralized repositories represent lucrative honeypot targets for cyber attacks, credential stuffing, and extortion.")
    add_bullet(doc, "Infrequent Rebalancing Cadence:", "Traditional financial advisors and robo-advisors review portfolio allocations only once a month or once a quarter. In volatile market environments, quarterly rebalancing is far too sluggish to mitigate risk.")

    # 1.2 Aim and Objectives of the Project
    add_heading_2(doc, "1.2 Aim and Objectives of the Project")
    add_body(
        doc,
        "The overarching aim of WealthOS is to design, implement, and validate an autonomous, privacy-preserving, client-side wealth "
        "management platform that continuously mitigates portfolio drift across heterogeneous asset classes through agentic AI and mathematical optimization. "
        "The specific technical and research objectives are as follows:",
        space_after=6
    )
    add_bullet(doc, "Autonomous Continuous Drift Detection:", "Establish an asynchronous background execution engine operating on a 25-second heartbeat loop that polls real-time market feeds across crypto, Indian equities, mutual funds, and precious metals to track allocation drift against target weights.")
    add_bullet(doc, "Optimal Delta Trade Formulation:", "Implement a deadband rebalancing algorithm (tau = 5%) that computes exact monetary deltas required to restore target allocations, preventing portfolio churning and minimizing execution transaction friction.")
    add_bullet(doc, "Edge-First Zero-Knowledge Security Vault:", "Architect a client-side cryptographic storage framework leveraging the W3C Web Crypto API (AES-GCM-256) to ensure that net worth figures, transaction histories, and private credentials remain strictly on the user's browser without remote cloud leakage.")
    add_bullet(doc, "Dual-Agentic AI Architecture with Transparent CoT:", "Integrate a local on-device LLM (Ollama running Qwen 2.5 Coder 7B or Llama 3.2 3B) for private, zero-latency financial analysis and trade rationale formulation, complemented by a cloud fallback LLM (Google Gemini 1.5 Flash / Groq Llama 3.3 70B) for macroeconomic news synthesis.")
    add_bullet(doc, "Immutable Cryptographic Ledger & Audit Trail:", "Provide an immutable client-side transaction ledger with SHA-256 state hashing and UPI liquidity simulation, enabling auditable verification of every manual swap and autonomous rebalance order.")

    # 1.3 Scope of the Project
    add_heading_2(doc, "1.3 Scope of the Project")
    add_body(
        doc,
        "The scope of WealthOS encompasses the end-to-end engineering of a single-page progressive web application (PWA) running natively "
        "within standard Chromium-based and WebKit-based modern web browsers. Key functional scope elements include:",
        space_after=4
    )
    add_bullet(doc, "Multi-Asset Market Data Feeds:", "Direct REST API integrations with CoinGecko (cryptocurrencies), MFAPI.in (Indian mutual funds), Yahoo Finance / NSE feeds (equities), and spot bullion rates (Gold/Silver).")
    add_bullet(doc, "Mathematical Modeling & Simulation:", "Real-time portfolio valuation, dynamic weight calculation, deadband threshold triggers, and Geometric Brownian Motion (GBM) synthetic price simulation during offline or rate-limited scenarios.")
    add_bullet(doc, "Agentic AI Operations Console:", "An interactive natural language copilot capable of evaluating portfolio health, explaining the financial rationale behind rebalance suggestions, and answering investor queries.")
    add_bullet(doc, "Interactive Visual Analytics:", "Dynamic asset allocation donuts, target-versus-actual weight bar charts, real-time drift gauges, live order books, and transaction history ledgers built with Recharts.")
    add_callout(doc, "WealthOS operates on a zero-knowledge edge philosophy: the user's browser performs all portfolio valuation, cryptographic key derivation, and rebalancing math locally. Confidential financial telemetry never leaves the client device.", title="CORE ARCHITECTURAL PHILOSOPHY")

def add_chapter_2(doc):
    doc.add_page_break()
    add_heading_1(doc, "2. System Analysis")
    
    # 2.1 Existing System Analysis
    add_heading_2(doc, "2.1 Existing System Analysis")
    
    add_heading_3(doc, "2.1.1 Background & Literature Survey")
    add_body(
        doc,
        "Portfolio rebalancing is grounded in Modern Portfolio Theory (Markowitz, 1952) and the Capital Asset Pricing Model (Sharpe, 1964). "
        "Subsequent research by Perold and Sharpe (1988) formalized dynamic asset allocation strategies, contrasting constant-mix strategies "
        "against buy-and-hold approaches. More recently, Vanguard research (Donohue & Westaway, 2014) established that opportunistic threshold-based "
        "rebalancing (monitoring allocations continuously and executing only when asset weights deviate by a specific tolerance band tau) significantly "
        "outperforms calendar-based rebalancing by reducing transaction costs while maintaining the investor's target risk profile.",
        space_after=6
    )
    add_body(
        doc,
        "Commercial solutions in the wealth management landscape have attempted to operationalize these principles through automated robo-advisors. "
        "Platforms such as Betterment and Wealthfront gained popularity by providing automated portfolio construction and periodic rebalancing. "
        "However, these platforms remain tethered to traditional, monolithic cloud architectures and are restricted to conventional securities. "
        "In the Indian retail market, discount brokers such as Zerodha (Kite) and Groww offer sophisticated order execution terminals but delegate "
        "all allocation tracking and rebalancing calculations to the investor. Furthermore, emerging algorithmic trading bots operate purely on "
        "high-frequency technical indicators rather than holistic, cross-asset portfolio risk equilibrium.",
        space_after=8
    )
    
    add_heading_3(doc, "2.1.2 Limitations of Existing System")
    add_body(
        doc,
        "A rigorous technical inspection of existing wealth management and robo-advisory platforms reveals severe structural limitations:",
        space_after=4
    )
    add_bullet(doc, "Centralized Honeypot Architecture & Privacy Hazards:", "Existing robo-advisory platforms require users to deposit funds or upload API credentials, PAN cards, and bank details to centralized cloud databases. These servers become high-value targets for data breaches, ransomware, and insider threats.")
    add_bullet(doc, "Siloed, Single-Asset Coverage:", "No existing platform seamlessly integrates Indian equities, direct mutual funds, digital bullion, and 24/7 liquid cryptocurrencies within a single unified rebalancing model.")
    add_bullet(doc, "Sluggish Rebalancing Cadence:", "Commercial platforms rely on monthly or quarterly calendar reviews. In fast-moving markets, quarterly rebalancing fails to prevent severe drawdowns during flash crashes or capture momentum during sudden asset surges.")
    add_bullet(doc, "Opaque Black-Box Decision Making:", "Commercial robo-advisors operate proprietary, closed-source algorithms. Investors receive no human-understandable explanation or Chain-of-Thought reasoning for why a particular asset was sold or purchased.")
    add_bullet(doc, "Recurring Management Fee Drag:", "Robo-advisors levy 0.25% to 0.75% annual Assets Under Management (AUM) advisory fees, substantially diminishing long-term compounding returns for retail investors.")

    # 2.2 Proposed System Analysis
    add_heading_2(doc, "2.2 Proposed System Analysis")
    
    add_heading_3(doc, "2.2.1 Proposed System Description")
    add_body(
        doc,
        "WealthOS is engineered as an autonomous, privacy-preserving, edge-first multi-asset portfolio rebalancing application. "
        "Operating entirely within the client's web browser, WealthOS synthesizes real-time market data ingestion, continuous mathematical "
        "drift evaluation, client-side cryptographic storage, and Dual-Agentic AI reasoning into a cohesive, responsive progressive web platform.",
        space_after=6
    )
    add_body(
        doc,
        "The proposed system establishes an autonomous 25-second background execution loop. During each cycle, the system polls real-time "
        "prices across crypto, equities, mutual funds, and precious metals. It recalculates the total portfolio valuation and evaluates whether "
        "any asset's actual allocation weight diverges from its target weight by more than the configurable tolerance threshold (tau = 5%). "
        "When drift is detected, the engine formulates optimal trade tickets to restore equilibrium. In autonomous mode, trades are executed "
        "instantly; in manual mode, proposed tickets are accompanied by transparent AI Chain-of-Thought explanations for investor confirmation.",
        space_after=8
    )
    
    add_heading_3(doc, "2.2.2 Advantages of Proposed System")
    add_body(
        doc,
        "The proposed WealthOS architecture delivers definitive advantages over traditional platforms:",
        space_after=4
    )
    add_bullet(doc, "Zero-Knowledge Data Sovereignty:", "All portfolio valuations, holding amounts, and transaction histories are encrypted client-side using AES-GCM-256 via the W3C Web Crypto API. No plain-text financial telemetry ever leaves the user's browser.")
    add_bullet(doc, "Unified Multi-Asset Rebalancing:", "Seamlessly harmonizes heterogeneous asset classes with divergent trading hours (24/7 crypto, daily NAV mutual funds, market-hours equities, spot bullion) under a single mathematical equilibrium framework.")
    add_bullet(doc, "Sub-Minute Autonomous Execution:", "The 25-second heartbeat loop suppresses drift continuously, preventing asset exposure skew and capturing the rebalancing premium without requiring user intervention.")
    add_bullet(doc, "Explainable AI via Local LLM:", "Integrates an on-device LLM (Ollama running Qwen 2.5 Coder 7B / Llama 3.2 3B) that synthesizes transparent Chain-of-Thought trade explanations with zero cloud data transmission and zero latency.")
    add_bullet(doc, "Zero Advisory Drag:", "100% open-source and client-executed, eliminating all recurring management commissions and advisory fee drag.")

    # 2.3 Software & Hardware Requirements
    add_heading_2(doc, "2.3 Software & Hardware Requirements")
    
    add_heading_3(doc, "2.3.1 Software Requirements")
    add_body(
        doc,
        "The software architecture of WealthOS is engineered using open web standards, modern JavaScript runtimes, and local AI execution layers. "
        "Table 2.1 specifies the software dependencies, versions, and deployment specifications.",
        space_after=4
    )
    
    sw_headers = ["Layer / Subsystem", "Technology / Specification", "Version", "Functional Role in WealthOS"]
    sw_data = [
        ["Frontend Framework", "React 19 (Concurrent Mode)", "19.0.0", "Core reactive UI rendering, state management, and transitions"],
        ["Programming Language", "TypeScript", "5.5.4", "End-to-end static typing and mathematical model safety"],
        ["Application Bundler", "Vite", "5.4.2", "Sub-millisecond HMR and tree-shaken production bundling"],
        ["Cryptographic Security", "W3C Web Crypto API", "W3C Spec", "Client-side AES-GCM-256 vault encryption & PBKDF2 key derivation"],
        ["Local AI Runtime", "Ollama Engine", "0.3.12+", "Local host execution of Qwen 2.5 Coder 7B / Llama 3.2 3B"],
        ["Cloud AI Fallback", "Google Gemini 1.5 Flash / Groq", "REST API", "High-speed macroeconomic news analysis and broader summaries"],
        ["Visual Analytics", "Recharts & Lucide React", "2.12.7", "SVG asset allocation donuts, bar charts, and financial gauges"],
        ["Market Data Gateways", "CoinGecko, MFAPI.in, Yahoo Finance", "Public REST", "Asynchronous real-time quote feeds across all asset classes"],
        ["Runtime Environment", "Modern Web Browser", "Chrome 120+, Edge 120+", "Execution host for PWA, Web Crypto, and local IndexedDB"]
    ]
    add_custom_table(doc, sw_headers, sw_data, col_widths=[1.4, 1.8, 0.9, 2.3], caption="Table 2.1: Software Specifications & Technology Stack Matrix")
    
    add_heading_3(doc, "2.3.2 Hardware Requirements")
    add_body(
        doc,
        "WealthOS is engineered to execute efficiently on standard consumer-grade workstations. Because the mathematical drift engine runs "
        "in WebAssembly/JavaScript and the local LLM executes 4-bit quantized weights, high-end server hardware is not required. "
        "Table 2.2 specifies the minimal and recommended hardware configurations.",
        space_after=4
    )
    
    hw_headers = ["Hardware Component", "Minimum Client Requirement", "Recommended Workstation Setup", "Remarks"]
    hw_data = [
        ["Processor (CPU)", "Dual-Core x86_64 / ARM64 (2.0 GHz)", "8-Core Intel Core i7 / AMD Ryzen 7 / Apple M-Series", "Multi-threading accelerates local Ollama inference"],
        ["System Memory (RAM)", "8 GB DDR4", "16 GB DDR4/DDR5 or Unified Memory", "Enables local LLM model loading with low swap"],
        ["Storage Space", "2 GB free disk space", "10 GB SSD NVMe storage", "Accommodates 4-bit quantized LLM weights"],
        ["Network Adapter", "Standard 1 Mbps Internet connection", "Broadband connection (10+ Mbps)", "Required for real-time market quote polling"],
        ["Display Resolution", "1280 x 720 (HD)", "1920 x 1080 (Full HD) or higher", "Optimal rendering of multi-panel financial terminal"]
    ]
    add_custom_table(doc, hw_headers, hw_data, col_widths=[1.5, 1.8, 1.8, 1.3], caption="Table 2.2: Hardware Specifications & Minimal Compute Requirements")

    # 2.4 Feasibility Study
    add_heading_2(doc, "2.4 Feasibility Study")
    
    add_heading_3(doc, "2.4.1 Technical Feasibility")
    add_body(
        doc,
        "The technical feasibility of WealthOS was established through extensive architectural prototyping and performance benchmarking. "
        "First, Modern Web Browsers possess hardware-accelerated cryptographic primitives through the W3C Web Crypto API, capable of performing "
        "PBKDF2 key derivation and AES-GCM-256 block encryption in under 12 milliseconds. Second, React 19's concurrent rendering primitives "
        "allow high-frequency market quote streams to update background state without introducing frame drops or input lag in the visual UI. "
        "Third, recent breakthroughs in small language models (SLMs)—specifically Qwen 2.5 Coder 7B and Llama 3.2 3B running 4-bit quantization (GGUF)—allow "
        "high-quality financial reasoning to occur directly on consumer CPUs at 18 to 25 tokens per second. Consequently, the proposed architecture is technically viable.",
        space_after=6
    )
    
    add_heading_3(doc, "2.4.2 Robustness & Reliability")
    add_body(
        doc,
        "To ensure high availability and operational resilience against volatile network conditions, WealthOS implements a multi-tiered failover protocol:",
        space_after=4
    )
    add_bullet(doc, "Geometric Brownian Motion (GBM) Synthetic Price Simulator:", "If external public APIs (CoinGecko, MFAPI.in) experience network outages, rate-limiting HTTP 429 errors, or offline status, the system automatically activates a calibrated GBM stochastic price generator. This maintains continuous portfolio simulation and testing without crash interruptions.")
    add_bullet(doc, "Dual-AI Engine Failover:", "If the local Ollama daemon is uninstalled or unreachable, the copilot gracefully degrades to Google Gemini 1.5 Flash cloud API. If internet access is completely lost, the system falls back to rule-based mathematical trade templates.")
    add_bullet(doc, "Cryptographic Vault Integrity Checks:", "Every read and write operation to browser localStorage verifies an authentication tag (MAC) generated by AES-GCM. Any manual tampering with stored keys or corrupted payloads is caught immediately, triggering safe vault recovery.")
    
    add_heading_3(doc, "2.4.3 Economic Feasibility")
    add_body(
        doc,
        "WealthOS is economically advantageous for retail investors. Traditional wealth management services levy 0.25% to 0.75% in annual advisory "
        "fees, which over a 30-year investing horizon can reduce an investor's total accumulated portfolio wealth by upwards of 20% due to fee drag. "
        "By executing all valuation, optimization, and AI inference directly on the client's local hardware, WealthOS incurs zero cloud server costs, "
        "zero database maintenance overhead, and zero per-user subscription fees. The platform is entirely free and open-source, delivering "
        "exceptional economic value.",
        space_after=8
    )

print("Chapters 1 & 2 configured with strict black styling and required outline.")
