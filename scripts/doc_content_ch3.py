"""
doc_content_ch3.py
Chapter 3 for WealthOS Academic Project Report:
Chapter 3: Architectural Design
  3.1 Modules Design
    3.1.1 Autonomous Portfolio Drift Detection & Rebalancing Engine
    3.1.2 Real-Time Multi-Asset Market Data Ingestion & Synthetic Feed Module
    3.1.3 Client-Side Hardware Cryptographic Security & Vault Storage
    3.1.4 Local LLM Financial Copilot & Agentic Advisory Engine
    3.1.5 Interactive Analytics, Asset Allocation & Visualization UI
  3.2 Methodology & Algorithm Design
    3.2.1 Continuous Dynamic Drift Threshold Evaluation
    3.2.2 Zero-Knowledge Client-Side Key Management & Privacy Protocol
    3.2.3 Autonomous Delta-Neutral Threshold Rebalancing Algorithm (Algorithm 3.1)
    3.2.4 PBKDF2 Key Derivation and AES-256-GCM Vault Encryption Algorithm (Algorithm 3.2)
  3.3 System Architecture
    3.3.1 Architectural Diagram (Diagram 3.1)
    3.3.2 Class Diagram (Diagram 3.2)
    3.3.3 Use Case Diagram (Diagram 3.3)
    3.3.4 Sequence Diagram (Diagram 3.4)
    3.3.5 Deployment Diagram (Diagram 3.5)
Strictly black typography, zero blue colors.
"""

from docx.shared import Inches, Pt, RGBColor
from scripts.build_complete_documentation import (
    add_heading_1, add_heading_2, add_heading_3, add_body, add_bullet,
    add_image_figure, add_code_block, add_callout
)

def add_chapter_3(doc):
    doc.add_page_break()
    add_heading_1(doc, "3. Architectural Design")
    
    add_body(
        doc,
        "WealthOS is engineered according to a highly modular, decoupled, edge-first architecture. By enforcing strict separation of concerns, "
        "the failure or network latency of an external service—such as an intermittent public API outage or a delayed AI response—does not compromise "
        "the core portfolio valuation, local vault encryption, or client-side trade execution pipelines. This chapter details the functional "
        "modules, algorithmic methods, formal architectural models, and analytical visualizations governing the platform.",
        space_after=8
    )
    
    # 3.1 Modules Design
    add_heading_2(doc, "3.1 Modules Design")
    
    # 3.1.1 Module 1
    add_heading_3(doc, "3.1.1 Autonomous Portfolio Drift Detection & Rebalancing Engine")
    add_body(
        doc,
        "The Autonomous Portfolio Drift Detection & Rebalancing Engine serves as the central mathematical heartbeat of WealthOS. "
        "Operating on an asynchronous 25-second continuous interval timer, the engine aggregates the latest asset prices, calculates total portfolio "
        "valuation V(t), and determines the instantaneous percentage weight w_i(t) for every holding. It compares w_i(t) against the user's strategic "
        "target allocation w_i* to evaluate the percentage drift delta_w_i(t) = w_i(t) - w_i*. If the absolute drift of any asset exceeds the configured "
        "tolerance threshold (tau = 5%), the module triggers the rebalancing pipeline. In autonomous mode, the engine automatically calculates and "
        "simulates rebalance trade tickets; in manual mode, it issues visual alert banners and prompts the user for one-click authorization.",
        space_after=6
    )
    
    # 3.1.2 Module 2
    add_heading_3(doc, "3.1.2 Real-Time Multi-Asset Market Data Ingestion & Synthetic Feed Module")
    add_body(
        doc,
        "This module ingests streaming market quotes across four divergent asset classes with asynchronous REST polling and intelligent rate-limiting: "
        "(1) Cryptocurrencies: Direct REST integration with CoinGecko (/api/v3/simple/price) tracking Bitcoin, Ethereum, and Solana spot quotes; "
        "(2) Mutual Funds: REST fetching from MFAPI.in (/mf/{scheme_code}) tracking official daily Net Asset Values (NAV) for Indian mutual funds; "
        "(3) Indian Equities: Live quote tracking for NIFTY 50 blue-chip equities; and "
        "(4) Bullion & Metals: Spot prices per gram for 24K Gold and 999 Silver in INR. "
        "The module incorporates exponential backoff to handle rate limits and features a calibrated Geometric Brownian Motion (GBM) synthetic price "
        "simulator to maintain live operation during offline or network-throttled conditions.",
        space_after=6
    )
    
    # 3.1.3 Module 3
    add_heading_3(doc, "3.1.3 Client-Side Hardware Cryptographic Security & Vault Storage")
    add_body(
        doc,
        "The Client-Side Cryptographic Security & Vault Storage module provides zero-knowledge privacy for all sensitive financial data. "
        "Using the native W3C Web Crypto API (window.crypto.subtle), the system derives an AES-GCM-256 key from the user's master passphrase "
        "using PBKDF2 (Password-Based Key Derivation Function 2) with 100,000 SHA-256 iterations and a 16-byte cryptographically secure salt. "
        "All portfolio holdings, target weights, cash balances, and transaction histories are encrypted with a unique 12-byte initialization vector (IV) "
        "before being committed to browser localStorage under the key 'wealthos_encrypted_vault'. The module also maintains an immutable client-side "
        "transaction ledger with SHA-256 state hashing and UPI fiat liquidity simulation.",
        space_after=6
    )
    
    # 3.1.4 Module 4
    add_heading_3(doc, "3.1.4 Local LLM Financial Copilot & Agentic Advisory Engine")
    add_body(
        doc,
        "WealthOS features a dual-engine agentic AI copilot architecture designed for explainable, private financial advisory: "
        "(1) Local On-Device LLM: Connects via localhost HTTP (port 11434) to an Ollama runtime executing compact, high-efficiency models "
        "(Qwen 2.5 Coder 7B or Llama 3.2 3B). This engine analyzes private portfolio allocations and synthesizes step-by-step Chain-of-Thought (CoT) "
        "trade explanations completely on-device without cloud data egress; and "
        "(2) Cloud LLM Fallback: Integrates Google Gemini 1.5 Flash and Groq Cloud (Llama 3.3 70B) for high-speed macroeconomic news analysis and broad market summaries.",
        space_after=6
    )
    
    # 3.1.5 Module 5
    add_heading_3(doc, "3.1.5 Interactive Analytics, Asset Allocation & Visualization UI")
    add_body(
        doc,
        "Built using React 19 and Tailwind CSS, this module renders a professional financial terminal. It includes interactive SVG-based "
        "Recharts components displaying asset allocation donuts, target-versus-actual weight comparison bar charts, and real-time drift gauges. "
        "It also features a live MarketWatch terminal displaying 24-hour price variations, visual sparklines, a simulated order book with bid/ask depth, "
        "and an interactive transaction ledger viewing panel.",
        space_after=8
    )

    # 3.2 Methodology & Algorithm Design
    add_heading_2(doc, "3.2 Methodology & Algorithm Design")
    
    # 3.2.1 Method 1
    add_heading_3(doc, "3.2.1 Continuous Dynamic Drift Threshold Evaluation")
    add_body(
        doc,
        "Method 1 establishes the mathematical formulation for continuous drift evaluation. At each discrete time step t, the system computes "
        "the total portfolio valuation V(t) as the inner product of the quantity vector n and the price vector P(t). "
        "The instantaneous asset weight vector w(t) is evaluated. The absolute drift vector Delta(t) = |w(t) - w*| is compared element-wise "
        "against the tolerance threshold tau (default 5.0%). If max_i (Delta_i(t)) >= tau, a rebalancing state trigger is dispatched.",
        space_after=6
    )
    
    # 3.2.2 Method 2
    add_heading_3(doc, "3.2.2 Zero-Knowledge Client-Side Key Management & Privacy Protocol")
    add_body(
        doc,
        "Method 2 defines the zero-knowledge client-side privacy protocol. When the investor enters their master passphrase, it is never stored "
        "in plain text or submitted across any network socket. Instead, the raw passphrase string is converted into a CryptoKey object via "
        "subtle.importKey(), stretched through PBKDF2-HMAC-SHA256, and used to instantiate an AES-GCM-256 cipher. All encryption and decryption "
        "operations occur within the browser's isolated sandboxed memory context.",
        space_after=6
    )
    
    # 3.2.3 Algorithm 1
    add_heading_3(doc, "3.2.3 Autonomous Delta-Neutral Threshold Rebalancing Algorithm")
    add_body(
        doc,
        "Algorithm 3.1 formally specifies the autonomous delta-neutral threshold rebalancing procedure. "
        "It determines whether portfolio drift has breached the tolerance threshold, computes the monetary surplus of overweight assets, "
        "generates necessary simulated sell orders to replenish cash reserves, and subsequently executes simulated buy orders for underweight assets.",
        space_after=4
    )
    alg1_text = (
        "ALGORITHM 3.1: Autonomous Delta-Neutral Threshold Rebalancing\n"
        "Input: Asset holdings A = {a_1, ..., a_M}, Quantities n, Real-time prices P(t),\n"
        "       Target weights w*, Tolerance threshold tau (default 0.05), Cash balance C\n"
        "Output: Executed rebalancing orders list O, Updated holdings A', Updated cash C'\n\n"
        "1.  V_total <- C + Sum_{i=1 to M} ( n_i * P_i(t) )\n"
        "2.  For each asset a_i in A:\n"
        "3.      v_i <- n_i * P_i(t)\n"
        "4.      w_i <- v_i / V_total\n"
        "5.      delta_w_i <- w_i - w*_i\n"
        "6.  End For\n"
        "7.  drift_max <- max_{i} ( |delta_w_i| )\n"
        "8.  If drift_max < tau Then Return (No rebalancing required)\n"
        "9.  O <- Empty List\n"
        "10. // Phase 1: Liquidate overweight assets (delta_w_i > 0)\n"
        "11. For each asset a_i where delta_w_i > 0:\n"
        "12.     surplus_val <- delta_w_i * V_total\n"
        "13.     qty_to_sell <- surplus_val / P_i(t)\n"
        "14.     Append Order(SELL, a_i, qty_to_sell, P_i(t)) to O\n"
        "15.     C <- C + surplus_val\n"
        "16.     n_i <- n_i - qty_to_sell\n"
        "17. End For\n"
        "18. // Phase 2: Accumulate underweight assets (delta_w_i < 0)\n"
        "19. For each asset a_j where delta_w_j < 0:\n"
        "20.     deficit_val <- |delta_w_j| * V_total\n"
        "21.     alloc_val <- min(deficit_val, C)\n"
        "22.     qty_to_buy <- alloc_val / P_j(t)\n"
        "23.     Append Order(BUY, a_j, qty_to_buy, P_j(t)) to O\n"
        "24.     C <- C - alloc_val\n"
        "25.     n_j <- n_j + qty_to_buy\n"
        "26. End For\n"
        "27. Record O to Transaction Ledger with SHA-256 state hash\n"
        "28. Return (O, A', C')"
    )
    add_code_block(doc, alg1_text, caption="Algorithm 3.1: Autonomous Delta-Neutral Threshold Rebalancing")
    
    # 3.2.4 Algorithm 2
    add_heading_3(doc, "3.2.4 PBKDF2 Key Derivation and AES-256-GCM Vault Encryption Algorithm")
    add_body(
        doc,
        "Algorithm 3.2 specifies the client-side cryptographic storage algorithm utilizing the W3C Web Crypto API. "
        "It handles master passphrase ingestion, salt generation, PBKDF2 key stretching, and authenticated ciphertext generation with GCM tag verification.",
        space_after=4
    )
    alg2_text = (
        "ALGORITHM 3.2: PBKDF2 Key Derivation and AES-256-GCM Vault Encryption\n"
        "Input: User Master Passphrase P_master, Plaintext Vault State JSON S_plain\n"
        "Output: Serialized Encrypted Vault Payload E_vault (Salt, IV, Ciphertext, MAC)\n\n"
        "1.  salt <- crypto.getRandomValues(new Uint8Array(16))\n"
        "2.  iv <- crypto.getRandomValues(new Uint8Array(12))  // 96-bit standard GCM IV\n"
        "3.  raw_key_bytes <- TextEncoder.encode(P_master)\n"
        "4.  key_material <- subtle.importKey(\"raw\", raw_key_bytes, \"PBKDF2\", false, [\"deriveKey\"])\n"
        "5.  derived_key <- subtle.deriveKey(\n"
        "        { name: \"PBKDF2\", salt: salt, iterations: 100000, hash: \"SHA-256\" },\n"
        "        key_material,\n"
        "        { name: \"AES-GCM\", length: 256 },\n"
        "        false,\n"
        "        [\"encrypt\", \"decrypt\"]\n"
        "    )\n"
        "6.  encoded_plaintext <- TextEncoder.encode(S_plain)\n"
        "7.  ciphertext_with_tag <- subtle.encrypt(\n"
        "        { name: \"AES-GCM\", iv: iv, tagLength: 128 },\n"
        "        derived_key,\n"
        "        encoded_plaintext\n"
        "    )\n"
        "8.  E_vault <- JSON.stringify({\n"
        "        salt: base64(salt),\n"
        "        iv: base64(iv),\n"
        "        data: base64(ciphertext_with_tag)\n"
        "    })\n"
        "9.  Commit E_vault to localStorage[\"wealthos_encrypted_vault\"]\n"
        "10. Return E_vault"
    )
    add_code_block(doc, alg2_text, caption="Algorithm 3.2: PBKDF2 Key Derivation and AES-256-GCM Vault Encryption")

    # 3.3 System Architecture
    add_heading_2(doc, "3.3 System Architecture")
    
    # 3.3.1 Architectural Diagram
    add_heading_3(doc, "3.3.1 Architectural Diagram")
    add_image_figure(doc, "generated_figures/fig1_architecture.png", "Diagram 3.1: WealthOS Multi-Agent & Data Architecture Diagram", width=Inches(5.3))
    add_body(
        doc,
        "Diagram 3.1 depicts the three-tier decoupled architecture of WealthOS: "
        "(1) Layer 1: Multi-Asset Real-Time Data Ingestion Engine polling CoinGecko, MFAPI.in, Metals.dev, and Forex feeds; "
        "(2) Layer 2: Reactive State Machine managing the portfolio state store, 3-second market volatility simulator, and 25-second autonomous daemon; and "
        "(3) Layer 3: Agentic Intelligence & Execution Pipeline executing edge LLM reasoning via Ollama, proportional order routing, and immutable audit logging.",
        space_after=8
    )
    
    # 3.3.2 Class Diagram
    add_heading_3(doc, "3.3.2 Class Diagram")
    add_image_figure(doc, "generated_figures/fig3_class_diagram.png", "Diagram 3.2: Object-Oriented UML Class Diagram", width=Inches(5.3))
    add_body(
        doc,
        "Diagram 3.2 presents the formal object-oriented class structure. Key entities include PortfolioContext (managing global state, cash balances, "
        "and drift recalculation), AssetHolding (encapsulating asset attributes, market values, and weight deltas), RebalanceAgent (governing the "
        "25-second scan interval, threshold evaluation, and Ollama reasoning dispatch), and AuditLedger (recording immutable transaction entries with SHA-256 hashes).",
        space_after=8
    )
    
    # 3.3.3 Use Case Diagram
    add_heading_3(doc, "3.3.3 Use Case Diagram")
    add_image_figure(doc, "generated_figures/fig4_use_case.png", "Diagram 3.3: System Use Case Diagram", width=Inches(5.3))
    add_body(
        doc,
        "Diagram 3.3 models the interactions between primary system actors (Retail Investor, Autonomous AI Agent, External Market APIs) and core system "
        "use cases. Key use cases include UC1 (Set Target Asset Weights), UC2 (View Real-Time Market Ticks), UC3 (Continuous Drift Detection), "
        "UC4 (Autonomous Trade Rebalancing), UC5 (Query Financial AI Assistant), and UC6 (Download Audit & PDF Statement).",
        space_after=8
    )
    
    # 3.3.4 Sequence Diagram
    add_heading_3(doc, "3.3.4 Sequence Diagram")
    add_image_figure(doc, "generated_figures/fig5_sequence.png", "Diagram 3.4: Autonomous Rebalancing Sequence Diagram", width=Inches(5.3))
    add_body(
        doc,
        "Diagram 3.4 outlines the chronological execution sequence across MarketSimulator, PortfolioContext, RebalanceAgent, and AuditLedger. "
        "It details the 3-second volatility price tick, drift recalculation, 25-second periodic trigger, threshold breach confirmation, "
        "trade execution, cash adjustment, and immutable ledger acknowledgement.",
        space_after=8
    )
    
    # 3.3.5 Deployment Diagram
    add_heading_3(doc, "3.3.5 Deployment Diagram")
    add_image_figure(doc, "generated_figures/fig_deployment.png", "Diagram 3.5: Client-Side Edge & Local LLM Deployment Diagram", width=Inches(5.3))
    add_body(
        doc,
        "Diagram 3.5 illustrates the physical deployment topology of WealthOS. The client workstation hosts the web browser runtime (executing the React 19 "
        "PWA, Web Crypto subsystem, and LocalStorage vault) and the local OS host (executing the Ollama inference server on port 11434 via private IPC). "
        "Outbound HTTPS connections are restricted to public market data gateways (CoinGecko, MFAPI.in, Yahoo Finance) and the optional cloud LLM fallback, "
        "enforcing strict zero-knowledge data containment on the client machine.",
        space_after=8
    )

print("Chapter 3 configured with strict black styling and required outline.")
