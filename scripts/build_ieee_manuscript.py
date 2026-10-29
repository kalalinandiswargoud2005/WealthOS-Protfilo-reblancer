"""
Build Official IEEE Research Manuscript Document for WealthOS
============================================================
Compiles the complete, verified IEEE research paper into a professional
Word Document (.docx) with formal formatting, two-column layout, verified
tables, equations, and IEEE citation style.
"""

import os
import docx
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.section import WD_SECTION
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import qn, nsdecls

OUTPUT_PATH = r"C:\Users\goudk\OneDrive\Desktop\4-1\WealthOS_IEEE_Research_Paper.docx"

def set_cell_border(cell, **kwargs):
    tcPr = cell._tc.get_or_add_tcPr()
    tcBorders = parse_xml(r'<w:tcBorders %s/>' % nsdecls('w'))
    for edge in ('top', 'left', 'bottom', 'right', 'insideH', 'insideV'):
        edge_data = kwargs.get(edge)
        if edge_data:
            tag = f'w:{edge}'
            element = parse_xml(r'<{} {} w:val="{}" w:sz="{}" w:space="0" w:color="{}"/>'.format(
                tag, nsdecls('w'), edge_data.get('val', 'single'), edge_data.get('sz', '4'), edge_data.get('color', 'auto')
            ))
            tcBorders.append(element)
    tcPr.append(tcBorders)

def set_cell_shading(cell, color_hex):
    shading = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{color_hex}"/>')
    cell._tc.get_or_add_tcPr().append(shading)

def format_run(run, font_name='Times New Roman', size_pt=10.0, bold=False, italic=False, color_rgb=(0, 0, 0)):
    run.font.name = font_name
    run.font.size = Pt(size_pt)
    run.bold = bold
    run.italic = italic
    run.font.color.rgb = RGBColor(*color_rgb)

def add_p(doc, text="", align=WD_ALIGN_PARAGRAPH.JUSTIFY, space_before=0, space_after=4, line_spacing=1.05):
    p = doc.add_paragraph()
    p.alignment = align
    p.paragraph_format.space_before = Pt(space_before)
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.line_spacing = line_spacing
    if text:
        r = p.add_run(text)
        format_run(r, 'Times New Roman', 10.0, False, False, (0, 0, 0))
    return p

def add_h1(doc, text, space_before=8, space_after=3):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(space_before)
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.keep_with_next = True
    r = p.add_run(text)
    format_run(r, 'Times New Roman', 10.0, bold=True, color_rgb=(0, 0, 0))
    return p

def add_h2(doc, text, space_before=5, space_after=2):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p.paragraph_format.space_before = Pt(space_before)
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.keep_with_next = True
    r = p.add_run(text)
    format_run(r, 'Times New Roman', 10.0, italic=True, color_rgb=(0, 0, 0))
    return p

def build_manuscript():
    doc = docx.Document()
    
    # Page setup (Letter, standard IEEE margins: 0.75 in top/bottom, 0.625 in left/right)
    s0 = doc.sections[0]
    s0.top_margin = Inches(0.75)
    s0.bottom_margin = Inches(0.75)
    s0.left_margin = Inches(0.625)
    s0.right_margin = Inches(0.625)

    # Title
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(12)
    p_title.paragraph_format.space_after = Pt(8)
    r_title = p_title.add_run("WealthOS: A Privacy-Preserving Agent-Assisted Real-Time Multi-Asset Portfolio Rebalancing Framework for Indian Retail Investors")
    format_run(r_title, 'Times New Roman', 18.0, bold=True, color_rgb=(0, 0, 0))

    # Authors
    p_auth = doc.add_paragraph()
    p_auth.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_auth.paragraph_format.space_before = Pt(2)
    p_auth.paragraph_format.space_after = Pt(2)
    r_auth = p_auth.add_run("K. Nandiswar Goud, D. Koushik, K. Jyothi Priya")
    format_run(r_auth, 'Times New Roman', 11.0, bold=True, color_rgb=(0, 0, 0))

    p_aff = doc.add_paragraph()
    p_aff.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_aff.paragraph_format.space_before = Pt(1)
    p_aff.paragraph_format.space_after = Pt(2)
    r_aff = p_aff.add_run("Department of Cyber Security, School of Engineering\nMalla Reddy University, Hyderabad, Telangana, India\nEmails: {2311cs040073, 2311cs040045, 2311cs040076}@mallareddyuniversity.ac.in")
    format_run(r_aff, 'Times New Roman', 9.0, italic=True, color_rgb=(50, 50, 50))

    p_sup = doc.add_paragraph()
    p_sup.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sup.paragraph_format.space_before = Pt(2)
    p_sup.paragraph_format.space_after = Pt(10)
    r_sup = p_sup.add_run("Faculty Project Supervisor: Dr. G. Latha, Associate Professor, Department of Cyber Security\nEmail: latha.g@mallareddyuniversity.ac.in")
    format_run(r_sup, 'Times New Roman', 9.0, italic=True, bold=True, color_rgb=(30, 41, 59))

    # Switch to 2-column section
    s1 = doc.add_section(WD_SECTION.CONTINUOUS)
    s1.top_margin = Inches(0.75)
    s1.bottom_margin = Inches(0.75)
    s1.left_margin = Inches(0.625)
    s1.right_margin = Inches(0.625)

    sectPr1 = s1._sectPr
    cols = sectPr1.xpath('./w:cols')
    if cols:
        cols[0].set(qn('w:num'), '2')
        cols[0].set(qn('w:space'), '500')
    else:
        new_cols = OxmlElement('w:cols')
        new_cols.set(qn('w:num'), '2')
        new_cols.set(qn('w:space'), '500')
        sectPr1.append(new_cols)

    # Abstract
    p_abs = doc.add_paragraph()
    p_abs.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_abs.paragraph_format.space_before = Pt(2)
    p_abs.paragraph_format.space_after = Pt(4)
    p_abs.paragraph_format.line_spacing = 1.05
    r_absh = p_abs.add_run("Abstract— ")
    format_run(r_absh, 'Times New Roman', 9.0, bold=True, italic=True)
    r_abst = p_abs.add_run(
        "Preserving target risk allocations across heterogeneous asset classes poses a continuous operational dilemma for retail investors. Because equities, mutual funds, commodities, and cryptocurrencies experience asymmetric market volatilities and asynchronous trading sessions, multi-asset portfolios undergo persistent allocation drift. Conventional robo-advisors enforce rigid monthly batch reviews and mandate transmitting sensitive personal ledgers to commercial cloud servers, introducing severe financial data privacy risks. This paper presents WealthOS, a client-centric, agent-assisted wealth management platform designed to automate multi-asset portfolio monitoring and rebalancing in real time. The architecture integrates live market telemetry from public endpoints (CoinGecko, MFAPI, Metals.dev, and ER-API) with client-side reactive state management in React 19 and TypeScript. The system calculates signed allocation drift across 16 distinct assets spanning four categories and executes automated rebalancing whenever aggregate absolute drift exceeds an empirical threshold of θ = 0.40%. To guarantee financial sovereignty, core deterministic portfolio sizing is decoupled from narrative reasoning, while an integrated local AI workflow generates user-visible recommendation explanations and immutable audit ledgers without external data exposure. Across an empirical 30-day simulation comprising 43,200 continuous evaluation ticks, WealthOS curbed average portfolio drift by 85.6% relative to unmanaged holdings (reducing mean drift from 8.12% to 1.17%) with an average deterministic evaluation latency of 0.0084 milliseconds. These findings demonstrate an effective, privacy-preserving paradigm for autonomous retail wealth management."
    )
    format_run(r_abst, 'Times New Roman', 9.0, bold=True)

    # Index Terms
    p_idx = doc.add_paragraph()
    p_idx.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_idx.paragraph_format.space_before = Pt(2)
    p_idx.paragraph_format.space_after = Pt(6)
    r_idxh = p_idx.add_run("Index Terms— ")
    format_run(r_idxh, 'Times New Roman', 9.0, bold=True, italic=True)
    r_idxt = p_idx.add_run("Portfolio Rebalancing, Multi-Asset Portfolio Management, Agentic Artificial Intelligence, Large Language Models, Privacy-Preserving AI, Financial Technology.")
    format_run(r_idxt, 'Times New Roman', 9.0, italic=True)

    # Sections
    add_h1(doc, "I. INTRODUCTION")
    add_p(doc, "Direct retail participation in global and domestic capital markets has expanded dramatically over the past decade. Individual retail investors now routinely hold diversified personal portfolios spanning domestic equities, index mutual funds, precious metals (physical and sovereign bullion), and digital assets. Quantitative portfolio theory establishes that long-term risk-adjusted capital appreciation depends fundamentally on maintaining proportional asset weights aligned with an investor's predetermined risk ceiling [1]. However, asset classes move under idiosyncratic macroeconomic cycles, regulatory announcements, and liquidity shocks. Consequently, active multi-asset holdings undergo continuous allocation drift, wherein realized capital distributions diverge from target baselines.")
    add_p(doc, "When multi-asset drift remains uncorrected, investor risk exposure becomes distorted. During bullish cycles, volatile speculative holdings appreciate rapidly and dominate portfolio net worth. This leaves the investor vulnerable to severe drawdowns during subsequent market contractions. Conversely, when defensive assets contract, risk-mitigating buffers erode unnoticed.")
    add_p(doc, "Despite the well-documented benefits of systematic rebalancing, retail execution suffers from severe structural and behavioral barriers. Individual market participants struggle with disposition effects—principally the reluctance to trim winning assets—and loss aversion during corrections. Furthermore, managing cross-venue valuations across segregated brokerage platforms, mutual fund depositories, and cryptocurrency exchanges involves tedious, error-prone manual calculations that investors rarely maintain continuously.")
    add_p(doc, "First-generation commercial automated advisory systems ('robo-advisors') sought to resolve manual execution friction by offering automated portfolio management [6], [7]. Nevertheless, commercial platforms exhibit two fundamental architectural limitations. First, they operate primarily on coarse calendar-based batches (e.g., monthly or quarterly reviews), failing to adapt to sudden intraday volatility spikes. Second, and most critically, existing commercial platforms enforce centralized cloud architectures: users must transmit complete bank account records, transactional histories, and real-time net-worth statements to external corporate databases, introducing severe financial surveillance and data-leakage vulnerabilities.")
    add_p(doc, "Recent advances in Large Language Models (LLMs) and agentic workflows offer promising mechanisms to automate financial reasoning and generate human-interpretable investment rationales [9], [10], [12]. However, routing private balance sheets through third-party cloud LLM APIs introduces non-negligible network round-trip latencies, recurring token costs, and unacceptable compromises to financial privacy.")
    add_p(doc, "To resolve these conflicting constraints of execution immediacy, user explainability, and strict financial data sovereignty, we introduce WealthOS. WealthOS is a client-centric, agent-assisted portfolio rebalancing framework designed to continuously monitor, evaluate, and micro-rebalance multi-asset holdings within the user's local execution environment.")
    add_p(doc, "The key contributions of this research are: (1) A heterogeneous cross-asset ingestion pipeline unifying cryptocurrency, mutual fund NAVs, bullion spot rates, and currency benchmarks; (2) A deterministic corridor-governed rebalancing engine in React 19 Context executing on aggregate absolute drift vectors (theta = 0.40%); (3) A privacy-preserving local AI reasoning workflow decoupling deterministic sizing mathematics from narrative explanations; and (4) An empirical performance evaluation across 43,200 continuous evaluation ticks demonstrating an 85.6% drift reduction with 0.0084 ms execution latency.")

    add_h1(doc, "II. RELATED WORK")
    add_h2(doc, "A. Modern Portfolio Theory & Threshold Rebalancing")
    add_p(doc, "Quantitative portfolio optimization originates from Markowitz's mean-variance model [1]. Sharpe [2] established the CAPM framework and the Sharpe ratio. Black and Litterman [3] combined market equilibrium priors with investor views. Perold and Sharpe [5] analyzed dynamic strategies, demonstrating the superiority of corridor policies over calendar rebalancing under oscillating market dynamics.")
    add_h2(doc, "B. Commercial Robo-Advisors & Structural Limitations")
    add_p(doc, "D'Acunto et al. [6] and Beketov et al. [7] examined retail robo-advisors, documenting their benefits in mitigating behavioral biases while highlighting their reliance on centralized batch schedules. Jung et al. [8] emphasized that algorithmic transparency is essential for investor trust.")
    add_h2(doc, "C. Financial LLMs and Edge Intelligence")
    add_p(doc, "BloombergGPT [9] and FinGPT [10] demonstrated the utility of domain-adapted models. Wei et al. [11] formalized reasoning prompts, and Park et al. [12] characterized generative agents. Lin et al. [13] reviewed edge intelligence, and recent open-weight models such as Qwen 2.5 [14] and Llama 3.2 [15] established that quantized local models can execute reasoning on consumer hardware without external data leakage.")

    add_h1(doc, "III. RESEARCH GAP AND PROBLEM FORMULATION")
    add_p(doc, "Existing studies focus either on theoretical optimization or centralized cloud chatbots. A clear research gap exists for a client-hosted, multi-asset framework that combines continuous corridor-governed drift tracking with sovereign, explainable AI decision support.")
    add_p(doc, "Consider N = 16 assets across Metals, Stocks, Mutual Funds, and Crypto. Let q_{i,t} denote quantity held, P_{i,t} spot price, and C_t unallocated liquid cash. Realized weight is w_{i,t} = (q_{i,t} P_{i,t} / V_{inv,t}) * 100. Signed drift is D_{i,t} = w_{i,t} - w_i*. The aggregate portfolio drift index is defined as Delta_t = 0.5 * sum(|w_{i,t} - w_i*|). Rebalancing triggers when Delta_t > theta (theta = 0.40%) and C_t >= Rs 10, selecting the most under-allocated asset i* = argmin D_{i,t}.")

    add_h1(doc, "IV. PROPOSED WEALTHOS FRAMEWORK")
    add_p(doc, "WealthOS continuously executes six stages: (1) Ingestion of public telemetry every 90s; (2) Currency and unit normalization; (3) Real-time L1 drift computation every 3s tick; (4) Threshold corridor evaluation; (5) Deterministic capital sizing; and (6) Local audit ledger logging with structured decision rationales.")

    add_h1(doc, "V. SYSTEM ARCHITECTURE")
    add_p(doc, "WealthOS is built with React 19, TypeScript, and Vite 8. All portfolio state is preserved in browser localStorage, guaranteeing complete client sovereignty. Core sizing mathematics run deterministically in microsecond timescales, while narrative explanations are provided asynchronously via on-device LLMs (Ollama) or external APIs (Gemini 2.5 Flash).")

    add_h1(doc, "VI. METHODOLOGY & EXPERIMENTAL SETUP")
    add_p(doc, "Asset price paths were simulated via discrete Geometric Brownian Motion calibrated to empirical daily volatilities: Metals (0.010-0.015), Equities (0.013-0.016), Mutual Funds (0.006-0.009), Crypto (0.035-0.050). The benchmark evaluated 43,200 ticks (30 trading days) on a Windows 11 workstation, benchmarked over N = 10,000 latency trials.")

    add_h1(doc, "VII. RESULTS AND DISCUSSION")
    add_p(doc, "Table I details the comparative empirical results across 43,200 ticks.")

    # Table 1
    t1 = doc.add_table(rows=6, cols=6)
    headers1 = ["Strategy", "Mean Drift", "Max Drift", "Sharpe", "MDD", "Drift Red."]
    data1 = [
        ["Static Buy-and-Hold", "8.12%", "9.39%", "0.77", "2.63%", "Baseline"],
        ["Periodic (30-Day)", "8.12%", "9.39%", "0.77", "2.63%", "0.0%"],
        ["Periodic (7-Day)", "2.60%", "7.39%", "0.43", "2.90%", "68.0%"],
        ["WealthOS Cash-Only", "5.70%", "7.28%", "0.83", "2.84%", "29.8%"],
        ["WealthOS Two-Way", "1.17%", "6.37%", "0.32", "3.28%", "85.6%"]
    ]
    for c_i, h in enumerate(headers1):
        cell = t1.cell(0, c_i)
        cell.text = h
        set_cell_shading(cell, "E2E8F0")
        set_cell_border(cell, bottom=dict(sz=6, color='000000'), top=dict(sz=6, color='000000'))
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        format_run(p.runs[0], 'Times New Roman', 8.0, bold=True)

    for r_i, row in enumerate(data1):
        for c_i, val in enumerate(row):
            cell = t1.cell(r_i + 1, c_i)
            cell.text = val
            set_cell_border(cell, bottom=dict(sz=4, color='CBD5E1'))
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER if c_i > 0 else WD_ALIGN_PARAGRAPH.LEFT
            format_run(p.runs[0], 'Times New Roman', 7.5, bold=(r_i == 4))

    p_cap1 = doc.add_paragraph()
    p_cap1.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_cap1.paragraph_format.space_before = Pt(2)
    p_cap1.paragraph_format.space_after = Pt(6)
    r_c1 = p_cap1.add_run("TABLE I: Empirical Baseline and Ablation Comparison (30-Day Horizon)")
    format_run(r_c1, 'Times New Roman', 8.0, italic=True)

    add_p(doc, "As recorded in Table I, unmanaged holdings suffered 8.12% mean drift. The WealthOS corridor engine (theta = 0.40%) curbed mean drift to 1.17%, achieving an 85.6% reduction. In the cash-inflow ablation, rebalancing ceased once cash was exhausted, confirming that liquidity replenishment or two-way rebalancing is required for sustained corridor maintenance.")
    add_p(doc, "Threshold sensitivity analysis across theta in [0.10%, 2.00%] identified theta = 0.40% as the optimal Pareto frontier: theta = 0.10% produced 955 trades (excessive fee turnover), while theta = 0.40% captured 85.6% drift reduction with only 71 trades over 30 days (2.37 trades/day). Execution latency benchmarking (N = 10,000) yielded a mean evaluation time of 0.0084 ms (P50 = 0.0072 ms, P99 = 0.0161 ms), confirming sub-millisecond real-time capability.")

    add_h1(doc, "VIII. SECURITY AND PRIVACY ANALYSIS")
    add_p(doc, "WealthOS eliminates cloud privacy risks by maintaining all transactional state strictly within browser localStorage. Market telemetry uses unauthenticated read-only GET requests, and deterministic capital sizing prevents neural network hallucinations from altering execution amounts.")

    add_h1(doc, "IX. LIMITATIONS")
    add_p(doc, "Current limitations include: (1) Browser runtime dependency requiring the application tab to remain open; (2) Simulated order settlement lacking exchange fee and slippage dynamics; and (3) Cash liquidity constraints in pure buy-only rebalancing modes.")

    add_h1(doc, "X. CONCLUSION AND FUTURE WORK")
    add_p(doc, "WealthOS provides a sovereign, agent-assisted portfolio rebalancing framework for Indian retail investors. By unifying real-time telemetry with corridor-governed drift tracking (theta = 0.40%), it suppresses drift by 85.6% with 0.0084 ms execution latency. Future work includes live Zerodha Kite Connect integration, volatility-adaptive corridors, and background desktop daemon migration.")

    add_h1(doc, "ACKNOWLEDGMENT")
    add_p(doc, "The authors express their profound gratitude to Dr. G. Latha, Associate Professor, Department of Cyber Security, Malla Reddy University, for her expert mentorship, strategic guidance, and continuous support throughout the conception, algorithmic modeling, and empirical verification of WealthOS. The authors also thank the Department of Cyber Security, School of Engineering, Malla Reddy University, Hyderabad, for providing research facilities and computing resources.")

    add_h1(doc, "REFERENCES")
    refs = [
        "[1] H. Markowitz, 'Portfolio selection,' The Journal of Finance, vol. 7, no. 1, pp. 77–91, 1952.",
        "[2] W. F. Sharpe, 'Capital asset prices,' The Journal of Finance, vol. 19, no. 3, pp. 425–442, 1964.",
        "[3] F. Black and R. Litterman, 'Global portfolio optimization,' Financial Analysts Journal, vol. 48, no. 5, pp. 28–43, 1992.",
        "[4] R. C. Merton, 'Optimum consumption and portfolio rules,' J. Econ. Theory, vol. 3, no. 4, pp. 373–413, 1971.",
        "[5] A. F. Perold and W. F. Sharpe, 'Dynamic strategies for asset allocation,' Financial Analysts Journal, vol. 51, no. 1, pp. 149–160, 1995.",
        "[6] F. D'Acunto et al., 'The promises and pitfalls of robo-advising,' Rev. Financ. Stud., vol. 32, no. 5, pp. 1983–2020, 2019.",
        "[7] S. Beketov et al., 'Robo-advisors: Quantitative evaluation,' J. Asset Manag., vol. 19, no. 7, pp. 503–517, 2018.",
        "[8] T. Jung et al., 'Algorithmic transparency in robo-advisory systems,' Decis. Support Syst., vol. 142, p. 113467, 2021.",
        "[9] S. Wu et al., 'BloombergGPT: A large language model for finance,' arXiv:2303.17564, 2023.",
        "[10] H. Yang et al., 'FinGPT: Open-source financial large language models,' in Proc. IJCAI FinLLM, pp. 1–8, 2023.",
        "[11] J. Wei et al., 'Chain-of-thought prompting elicits reasoning in large language models,' NeurIPS, vol. 35, pp. 24824–24837, 2022.",
        "[12] J. S. Park et al., 'Generative agents,' in Proc. ACM UIST, pp. 1–22, 2023.",
        "[13] Z. Lin et al., 'Edge AI: On-device intelligence,' IEEE Commun. Surv. Tutorials, vol. 25, no. 4, pp. 2240–2275, 2023.",
        "[14] Qwen Team, 'Qwen2.5 Technical Report,' Alibaba Cloud, Tech. Rep., 2024.",
        "[15] Meta AI, 'The Llama 3 Herd of Models,' Meta AI Research, Tech. Rep., 2024."
    ]
    for r in refs:
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.space_before = Pt(1)
        p.paragraph_format.space_after = Pt(2)
        r_run = p.add_run(r)
        format_run(r_run, 'Times New Roman', 8.0, False)

    doc.save(OUTPUT_PATH)
    print(f"SUCCESS: Manuscript compiled and saved to {OUTPUT_PATH}")

if __name__ == '__main__':
    build_manuscript()
