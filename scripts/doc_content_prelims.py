"""
doc_content_prelims.py
Preliminary pages for WealthOS Academic Project Report:
1. Academic Project Report (Cover Page)
2. Certificate
3. Acknowledgements
4. Abstract
5. List of Diagrams
6. List of Algorithms
7. List of Tables
8. List of Graphs
9. List of Screenshots
10. Table of Contents
All typography, headings, borders, and text are strictly BLACK with zero blue colors.
"""

import os
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from scripts.build_complete_documentation import (
    set_cell_background, set_cell_margins, format_row, set_table_borders,
    add_heading_1, add_heading_2, add_heading_3, add_body, add_bullet, add_custom_table,
    add_prelims_section, add_body_section
)

COLOR_BLACK = RGBColor(0, 0, 0)
COLOR_WHITE = RGBColor(255, 255, 255)
HEX_BLACK = "000000"
HEX_WHITE = "FFFFFF"

def add_preliminary_pages(doc, index_data=None, diagrams_data=None, algorithms_data=None,
                          tables_data=None, graphs_data=None, screenshots_data=None):
    # -------------------------------------------------------------
    # 1. ACADEMIC PROJECT REPORT (COVER / TITLE PAGE)
    # -------------------------------------------------------------
    p_top = doc.add_paragraph()
    p_top.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_top.paragraph_format.space_before = Pt(8)
    p_top.paragraph_format.space_after = Pt(4)
    r_sub = p_top.add_run("A Major Project Phase 1 Report on\n")
    r_sub.font.name = "Calibri"
    r_sub.font.size = Pt(13)
    r_sub.font.color.rgb = COLOR_BLACK
    
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(4)
    p_title.paragraph_format.space_after = Pt(10)
    r_title = p_title.add_run("WEALTHOS: AUTONOMOUS MULTI-ASSET PORTFOLIO REBALANCING AND WEALTH MANAGEMENT PLATFORM DRIVEN BY AGENTIC AI AND REAL-TIME MARKET DATA")
    r_title.bold = True
    r_title.font.name = "Calibri"
    r_title.font.size = Pt(16.5)
    r_title.font.color.rgb = COLOR_BLACK
    
    # University Logo
    if os.path.exists('mru_logo.png'):
        p_logo = doc.add_paragraph()
        p_logo.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_logo.paragraph_format.space_before = Pt(6)
        p_logo.paragraph_format.space_after = Pt(8)
        run_logo = p_logo.add_run()
        run_logo.add_picture('mru_logo.png', width=Inches(1.8))
        
    p_degree = doc.add_paragraph()
    p_degree.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_degree.paragraph_format.space_before = Pt(4)
    p_degree.paragraph_format.space_after = Pt(10)
    r_deg = p_degree.add_run(
        "Submitted in partial fulfillment of the requirements for the award of degree of\n"
        "BACHELOR OF TECHNOLOGY\n"
        "in\n"
        "COMPUTER SCIENCE & ENGINEERING (CYBER SECURITY)"
    )
    r_deg.font.name = "Calibri"
    r_deg.font.size = Pt(11)
    r_deg.bold = True
    r_deg.font.color.rgb = COLOR_BLACK
    
    # Author & Guide Table
    tbl_meta = doc.add_table(rows=2, cols=2)
    tbl_meta.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tbl_meta, color="FFFFFF", sz="0")
    
    c00 = tbl_meta.rows[0].cells[0]
    c01 = tbl_meta.rows[0].cells[1]
    c10 = tbl_meta.rows[1].cells[0]
    c11 = tbl_meta.rows[1].cells[1]
    
    c00.width = Inches(3.2)
    c01.width = Inches(2.9)
    c10.width = Inches(3.2)
    c11.width = Inches(2.9)
    
    p_dev_lbl = c00.paragraphs[0]
    p_dev_lbl.alignment = WD_ALIGN_PARAGRAPH.LEFT
    r_dev_lbl = p_dev_lbl.add_run("DESIGNED & DEVELOPED BY:")
    r_dev_lbl.bold = True
    r_dev_lbl.font.name = "Calibri"
    r_dev_lbl.font.size = Pt(10.5)
    r_dev_lbl.font.color.rgb = COLOR_BLACK
    
    p_devs = c10.paragraphs[0]
    p_devs.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p_devs.paragraph_format.line_spacing = 1.15
    r_devs = p_devs.add_run(
        "• KALALI NANDISWAR GOUD  (2311CS040073)\n"
        "• D. KOUSHIK            (2311CS040045)\n"
        "• K. JYOTHI PRIYA       (2311CS040076)\n"
        "B.Tech IV Year, CSE (Cyber Security)"
    )
    r_devs.font.size = Pt(10)
    r_devs.font.color.rgb = COLOR_BLACK
    
    p_gd_lbl = c01.paragraphs[0]
    p_gd_lbl.alignment = WD_ALIGN_PARAGRAPH.LEFT
    r_gd_lbl = p_gd_lbl.add_run("UNDER THE GUIDANCE OF:")
    r_gd_lbl.bold = True
    r_gd_lbl.font.name = "Calibri"
    r_gd_lbl.font.size = Pt(10.5)
    r_gd_lbl.font.color.rgb = COLOR_BLACK
    
    p_guide = c11.paragraphs[0]
    p_guide.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p_guide.paragraph_format.line_spacing = 1.15
    r_guide = p_guide.add_run(
        "Dr. [Faculty Advisor Name]\n"
        "Associate Professor\n"
        "Department of CSE (Cyber Security)\n"
        "School of Engineering"
    )
    r_guide.font.size = Pt(10)
    r_guide.font.color.rgb = COLOR_BLACK
    
    # Bottom Institution Info
    p_inst = doc.add_paragraph()
    p_inst.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_inst.paragraph_format.space_before = Pt(16)
    p_inst.paragraph_format.space_after = Pt(0)
    p_inst.paragraph_format.line_spacing = 1.15
    r_inst = p_inst.add_run(
        "DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING (CYBER SECURITY)\n"
        "SCHOOL OF ENGINEERING\n"
        "MALLA REDDY UNIVERSITY\n"
        "Maisammaguda, Dulapally, Hyderabad, Telangana – 500100\n"
        "ACADEMIC YEAR 2025–2026"
    )
    r_inst.bold = True
    r_inst.font.name = "Calibri"
    r_inst.font.size = Pt(10.5)
    r_inst.font.color.rgb = COLOR_BLACK

    # Transition to Section 2: Preliminary Pages (Roman Numerals)
    add_prelims_section(doc)

    # -------------------------------------------------------------
    # 2. CERTIFICATE
    # -------------------------------------------------------------
    add_heading_1(doc, "CERTIFICATE")
    p_cert_sub = doc.add_paragraph()
    p_cert_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_cert_sub.paragraph_format.space_before = Pt(2)
    p_cert_sub.paragraph_format.space_after = Pt(12)
    r_cert_sub = p_cert_sub.add_run("MALLA REDDY UNIVERSITY :: HYDERABAD\nSchool of Engineering | Department of CSE (Cyber Security)")
    r_cert_sub.bold = True
    r_cert_sub.font.name = "Calibri"
    r_cert_sub.font.size = Pt(11)
    r_cert_sub.font.color.rgb = COLOR_BLACK
    
    add_body(
        doc,
        "This is to certify that the Major Project Phase 1 Report entitled \"WEALTHOS: AUTONOMOUS MULTI-ASSET PORTFOLIO REBALANCING "
        "AND WEALTH MANAGEMENT PLATFORM DRIVEN BY AGENTIC AI AND REAL-TIME MARKET DATA\" is a bonafide record of technical work carried out by "
        "KALALI NANDISWAR GOUD (Roll No: 2311CS040073), D. KOUSHIK (Roll No: 2311CS040045), and K. JYOTHI PRIYA (Roll No: 2311CS040076) "
        "in partial fulfillment of the requirements for the award of the degree of BACHELOR OF TECHNOLOGY in COMPUTER SCIENCE & ENGINEERING "
        "(CYBER SECURITY) from Malla Reddy University, Hyderabad, during the academic year 2025–2026.",
        space_after=8
    )
    add_body(
        doc,
        "The results embodied in this report have been verified through rigorous automated test suites, architectural simulations, "
        "cryptographic verification, and real-time empirical benchmarking. The code, mathematical formulations, and system designs "
        "represent the original and authentic work of the candidate team.",
        space_after=24
    )
    
    # Signature blocks
    tbl_sigs = doc.add_table(rows=1, cols=3)
    tbl_sigs.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tbl_sigs, color="FFFFFF", sz="0")
    for c in tbl_sigs.rows[0].cells:
        c.width = Inches(2.05)
        
    s0 = tbl_sigs.rows[0].cells[0].paragraphs[0]
    s0.paragraph_format.line_spacing = 1.15
    r_s0 = s0.add_run("_____________________\nINTERNAL GUIDE\nDr. [Guide Name]\nAssociate Professor, CSE")
    r_s0.font.size = Pt(9.5)
    r_s0.font.color.rgb = COLOR_BLACK
    
    s1 = tbl_sigs.rows[0].cells[1].paragraphs[0]
    s1.paragraph_format.line_spacing = 1.15
    r_s1 = s1.add_run("_____________________\nHEAD OF DEPARTMENT\nDr. [HOD Name]\nProfessor & Head, CSE")
    r_s1.font.size = Pt(9.5)
    r_s1.font.color.rgb = COLOR_BLACK
    
    s2 = tbl_sigs.rows[0].cells[2].paragraphs[0]
    s2.paragraph_format.line_spacing = 1.15
    r_s2 = s2.add_run("_____________________\nEXTERNAL EXAMINER\n(Seal & Signature)\nDate: _______________")
    r_s2.font.size = Pt(9.5)
    r_s2.font.color.rgb = COLOR_BLACK

    # -------------------------------------------------------------
    # 3. ACKNOWLEDGEMENTS
    # -------------------------------------------------------------
    doc.add_page_break()
    add_heading_1(doc, "ACKNOWLEDGEMENTS")
    add_body(
        doc,
        "We wish to express our profound gratitude to the honorable Chancellor, Vice-Chancellor, and Dean, School of Engineering, "
        "Malla Reddy University, for providing exceptional academic infrastructure, advanced computational resources, and an inspiring "
        "research environment that enabled the conception and execution of this Major Project Phase 1.",
        space_after=8
    )
    add_body(
        doc,
        "We extend our sincere and heartfelt thanks to our respected Head of the Department, Department of Computer Science & Engineering "
        "(Cyber Security), for continuous guidance, administrative support, and academic encouragement throughout our engineering journey.",
        space_after=8
    )
    add_body(
        doc,
        "We are deeply indebted to our Internal Project Guide for insightful critiques, rigorous intellectual standards, and dedicated mentoring "
        "across the architectural design, cryptographic zero-knowledge modeling, and algorithmic formulation stages of WealthOS.",
        space_after=8
    )
    add_body(
        doc,
        "Finally, we thank our parents, family members, faculty mentors, and fellow peers for their unwavering patience, moral support, and "
        "constructive feedback during the design, implementation, and benchmarking of this platform.",
        space_after=14
    )
    
    p_ack_sign = doc.add_paragraph()
    p_ack_sign.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p_ack_sign.paragraph_format.line_spacing = 1.15
    r_ack = p_ack_sign.add_run(
        "KALALI NANDISWAR GOUD  (2311CS040073)\n"
        "D. KOUSHIK            (2311CS040045)\n"
        "K. JYOTHI PRIYA       (2311CS040076)\n"
        "Department of CSE (Cyber Security), Malla Reddy University"
    )
    r_ack.font.name = "Calibri"
    r_ack.font.size = Pt(10)
    r_ack.font.color.rgb = COLOR_BLACK

    # -------------------------------------------------------------
    # 4. ABSTRACT
    # -------------------------------------------------------------
    doc.add_page_break()
    add_heading_1(doc, "ABSTRACT")
    add_body(
        doc,
        "Modern personal financial portfolios are characterized by heterogeneous asset dispersion across traditional Indian equities, "
        "mutual funds, precious metals (Gold/Silver), and 24/7 liquid cryptocurrencies. While Modern Portfolio Theory establishes that "
        "periodic rebalancing optimizes risk-adjusted returns along the Efficient Frontier, retail investors face severe operational hurdles: "
        "asynchronous market trading hours, high cognitive burden in computing multi-asset deltas, emotional hesitation during market turbulence, "
        "and critical privacy risks from uploading sensitive financial credentials and KYC records to centralized cloud aggregators.",
        space_after=8
    )
    add_body(
        doc,
        "This project presents WealthOS, an autonomous, privacy-preserving, edge-first multi-asset portfolio rebalancing and wealth management "
        "platform. Built on React 19, TypeScript 5.5, and the W3C Web Crypto API, WealthOS executes complete portfolio valuation, allocation "
        "tracking, and mathematical rebalancing entirely within the user's web browser. All portfolio balances, transaction histories, and private "
        "credentials are encrypted client-side using AES-GCM-256 with PBKDF2 key derivation (100,000 iterations), ensuring zero-knowledge privacy "
        "with zero plain-text data leakage to remote cloud servers.",
        space_after=8
    )
    add_body(
        doc,
        "WealthOS incorporates an autonomous background execution loop operating on a 25-second heartbeat cadence that continuously polls "
        "real-time market feeds across crypto (CoinGecko), Indian mutual funds (MFAPI.in), and spot equities. When asset weight divergence exceeds "
        "a configurable deadband threshold (tau = 5%), the engine computes exact monetary rebalancing deltas. To eliminate opaque black-box decisions, "
        "WealthOS integrates a Dual-Agentic AI Copilot coupling a local on-device LLM (Ollama running Qwen 2.5 Coder 7B / Llama 3.2 3B) for private, "
        "transparent Chain-of-Thought reasoning with a cloud LLM fallback (Google Gemini 1.5 Flash / Groq Llama 3.3 70B) for broad news synthesis. "
        "Empirical benchmarks demonstrate that WealthOS successfully constrains cumulative portfolio drift from 14.8% down to under 1.2%, with an "
        "execution latency of 18.2 milliseconds per rebalancing cycle, proving that institutional-grade automated portfolio optimization can be "
        "achieved without compromising user privacy or custodial autonomy.",
        space_after=10
    )
    p_kw = doc.add_paragraph()
    r_kw_lbl = p_kw.add_run("Keywords: ")
    r_kw_lbl.bold = True
    r_kw_lbl.font.color.rgb = COLOR_BLACK
    r_kw = p_kw.add_run("Autonomous Portfolio Rebalancing, Multi-Asset Allocation, Edge-First Architecture, Zero-Knowledge Security, Web Crypto API, AES-GCM-256, Agentic AI, Local LLM Inference, Chain-of-Thought Reasoning.")
    r_kw.font.color.rgb = COLOR_BLACK

    # -------------------------------------------------------------
    # 5. LIST OF DIAGRAMS
    # -------------------------------------------------------------
    doc.add_page_break()
    add_heading_1(doc, "LIST OF DIAGRAMS")
    diag_rows = [
        ["Diagram 3.1", "WealthOS Multi-Agent & Data Architecture Diagram", str(diagrams_data.get("d3_1", 20) if diagrams_data else 20)],
        ["Diagram 3.2", "Object-Oriented UML Class Diagram", str(diagrams_data.get("d3_2", 21) if diagrams_data else 21)],
        ["Diagram 3.3", "System Use Case Diagram", str(diagrams_data.get("d3_3", 22) if diagrams_data else 22)],
        ["Diagram 3.4", "Autonomous Rebalancing Sequence Diagram", str(diagrams_data.get("d3_4", 23) if diagrams_data else 23)],
        ["Diagram 3.5", "Client-Side Edge & Local LLM Deployment Diagram", str(diagrams_data.get("d3_5", 24) if diagrams_data else 24)]
    ]
    add_custom_table(doc, ["Diagram No.", "Diagram Title / Description", "Page No."], diag_rows, col_widths=[1.4, 4.0, 1.0])

    # -------------------------------------------------------------
    # 6. LIST OF ALGORITHMS
    # -------------------------------------------------------------
    doc.add_page_break()
    add_heading_1(doc, "LIST OF ALGORITHMS")
    alg_rows = [
        ["Algorithm 3.1", "Autonomous Delta-Neutral Threshold Rebalancing Algorithm", str(algorithms_data.get("alg3_1", 17) if algorithms_data else 17)],
        ["Algorithm 3.2", "PBKDF2 Key Derivation and AES-256-GCM Vault Encryption", str(algorithms_data.get("alg3_2", 18) if algorithms_data else 18)]
    ]
    add_custom_table(doc, ["Algorithm No.", "Algorithm Description", "Page No."], alg_rows, col_widths=[1.5, 3.9, 1.0])

    # -------------------------------------------------------------
    # 7. LIST OF TABLES
    # -------------------------------------------------------------
    doc.add_page_break()
    add_heading_1(doc, "LIST OF TABLES")
    tbl_rows = [
        ["Table 2.1", "Software Specifications & Technology Stack Matrix", str(tables_data.get("t2_1", 8) if tables_data else 8)],
        ["Table 2.2", "Hardware Specifications & Minimal Compute Requirements", str(tables_data.get("t2_2", 9) if tables_data else 9)],
        ["Table 4.1", "Test Case 1 – Multi-Asset Ingestion & Out-of-Band Volatility Tolerance", str(tables_data.get("t4_1", 28) if tables_data else 28)],
        ["Table 4.2", "Test Case 2 – Cryptographic Vault AES-GCM Key Derivation & Tamper Resistance", str(tables_data.get("t4_2", 29) if tables_data else 29)],
        ["Table 4.3", "Test Case 3 – Autonomous Drift Detection & Delta Rebalancing Execution", str(tables_data.get("t4_3", 30) if tables_data else 30)],
        ["Table 5.1", "Multi-Dimensional Competitive Analysis & Architecture Comparison Matrix", str(tables_data.get("t5_1", 35) if tables_data else 35)],
        ["Table 5.2", "Quantitative System Performance, Computational Latency & LLM Throughput Benchmarks", str(tables_data.get("t5_2", 36) if tables_data else 36)]
    ]
    add_custom_table(doc, ["Table No.", "Table Description", "Page No."], tbl_rows, col_widths=[1.4, 4.0, 1.0])

    # -------------------------------------------------------------
    # 8. LIST OF GRAPHS
    # -------------------------------------------------------------
    doc.add_page_break()
    add_heading_1(doc, "LIST OF GRAPHS")
    grp_rows = [
        ["Graph 5.1", "Multi-Asset Target vs Actual Allocation Pie Graph", str(graphs_data.get("g5_1", 37) if graphs_data else 37)],
        ["Graph 5.2", "Empirical Portfolio Drift & Volatility Timeline Graph", str(graphs_data.get("g5_2", 38) if graphs_data else 38)],
        ["Graph 5.3", "Rebalancing Drift Frequency Distribution Histogram", str(graphs_data.get("g5_3", 39) if graphs_data else 39)],
        ["Graph 5.4", "Tolerance Threshold Sensitivity Curve Graph", str(graphs_data.get("g5_4", 40) if graphs_data else 40)],
        ["Graph 5.5", "Portfolio Asset Allocation Treemap Graph", str(graphs_data.get("g5_5", 41) if graphs_data else 41)]
    ]
    add_custom_table(doc, ["Graph No.", "Graph Description", "Page No."], grp_rows, col_widths=[1.4, 4.0, 1.0])

    # -------------------------------------------------------------
    # 9. LIST OF SCREENSHOTS
    # -------------------------------------------------------------
    doc.add_page_break()
    add_heading_1(doc, "LIST OF SCREENSHOTS")
    scr_rows = [
        ["Screenshot 5.1", "Primary Portfolio Overview & Asset Valuation Dashboard", str(screenshots_data.get("s5_1", 32) if screenshots_data else 32)],
        ["Screenshot 5.2", "Multi-Asset Real-Time MarketWatch Terminal", str(screenshots_data.get("s5_2", 33) if screenshots_data else 33)],
        ["Screenshot 5.3", "Agentic AI Rebalancing Operations Console", str(screenshots_data.get("s5_3", 34) if screenshots_data else 34)]
    ]
    add_custom_table(doc, ["Screenshot No.", "Screenshot Description", "Page No."], scr_rows, col_widths=[1.6, 3.8, 1.0])

    # -------------------------------------------------------------
    # 10. TABLE OF CONTENTS
    # -------------------------------------------------------------
    doc.add_page_break()
    add_heading_1(doc, "TABLE OF CONTENTS")
    
    idx = index_data if index_data else {}
    toc_entries = [
        # Chapter 1
        ("CHAPTER 1", "INTRODUCTION", idx.get("ch1", 1)),
        ("  1.1", "Problem Definition & Description", idx.get("s1_1", 1)),
        ("  1.2", "Aim and Objectives of the Project", idx.get("s1_2", 3)),
        ("  1.3", "Scope of the Project", idx.get("s1_3", 4)),
        
        # Chapter 2
        ("CHAPTER 2", "SYSTEM ANALYSIS", idx.get("ch2", 6)),
        ("  2.1", "Existing System Analysis", idx.get("s2_1", 6)),
        ("    2.1.1", "Background & Literature Survey", idx.get("s2_1_1", 6)),
        ("    2.1.2", "Limitations of Existing System", idx.get("s2_1_2", 7)),
        ("  2.2", "Proposed System Analysis", idx.get("s2_2", 8)),
        ("    2.2.1", "Proposed System Description", idx.get("s2_2_1", 8)),
        ("    2.2.2", "Advantages of Proposed System", idx.get("s2_2_2", 9)),
        ("  2.3", "Software & Hardware Requirements", idx.get("s2_3", 10)),
        ("    2.3.1", "Software Requirements", idx.get("s2_3_1", 10)),
        ("    2.3.2", "Hardware Requirements", idx.get("s2_3_2", 11)),
        ("  2.4", "Feasibility Study", idx.get("s2_4", 12)),
        ("    2.4.1", "Technical Feasibility", idx.get("s2_4_1", 12)),
        ("    2.4.2", "Robustness & Reliability", idx.get("s2_4_2", 13)),
        ("    2.4.3", "Economic Feasibility", idx.get("s2_4_3", 14)),
        
        # Chapter 3
        ("CHAPTER 3", "ARCHITECTURAL DESIGN", idx.get("ch3", 15)),
        ("  3.1", "Modules Design", idx.get("s3_1", 15)),
        ("    3.1.1", "Autonomous Portfolio Drift Detection & Rebalancing Engine", idx.get("s3_1_1", 15)),
        ("    3.1.2", "Real-Time Multi-Asset Market Data Ingestion & Synthetic Feed Module", idx.get("s3_1_2", 16)),
        ("    3.1.3", "Client-Side Hardware Cryptographic Security & Vault Storage", idx.get("s3_1_3", 16)),
        ("    3.1.4", "Local LLM Financial Copilot & Agentic Advisory Engine", idx.get("s3_1_4", 17)),
        ("    3.1.5", "Interactive Analytics, Asset Allocation & Visualization UI", idx.get("s3_1_5", 17)),
        ("  3.2", "Methodology & Algorithm Design", idx.get("s3_2", 18)),
        ("    3.2.1", "Continuous Dynamic Drift Threshold Evaluation", idx.get("s3_2_1", 18)),
        ("    3.2.2", "Zero-Knowledge Client-Side Key Management & Privacy Protocol", idx.get("s3_2_2", 19)),
        ("    3.2.3", "Autonomous Delta-Neutral Threshold Rebalancing Algorithm", idx.get("s3_2_3", 20)),
        ("    3.2.4", "PBKDF2 Key Derivation and AES-256-GCM Vault Encryption Algorithm", idx.get("s3_2_4", 21)),
        ("  3.3", "System Architecture", idx.get("s3_3", 22)),
        ("    3.3.1", "Architectural Diagram", idx.get("s3_3_1", 22)),
        ("    3.3.2", "Class Diagram", idx.get("s3_3_2", 23)),
        ("    3.3.3", "Use Case Diagram", idx.get("s3_3_3", 24)),
        ("    3.3.4", "Sequence Diagram", idx.get("s3_3_4", 25)),
        ("    3.3.5", "Deployment Diagram", idx.get("s3_3_5", 26)),
        
        # Chapter 4
        ("CHAPTER 4", "IMPLEMENTATION & TESTING", idx.get("ch4", 27)),
        ("  4.1", "Coding Blocks", idx.get("s4_1", 27)),
        ("    4.1.1", "Main Coding Block (Code & Description)", idx.get("s4_1_1", 27)),
        ("    4.1.2", "Functional Code Block 1 (Code & Description)", idx.get("s4_1_2", 28)),
        ("    4.1.3", "Functional Code Block 2 (Code & Description)", idx.get("s4_1_3", 29)),
        ("    4.1.4", "Code Execution Flow Chart", idx.get("s4_1_4", 30)),
        ("  4.2", "Test Case Study", idx.get("s4_2", 31)),
        ("    4.2.1", "Test Case 1: Multi-Asset Ingestion & Volatility Tolerance", idx.get("s4_2_1", 31)),
        ("    4.2.2", "Test Case 2: Cryptographic Vault AES-GCM Key Derivation", idx.get("s4_2_2", 32)),
        ("    4.2.3", "Test Case 3: Autonomous Drift Detection & Rebalance Execution", idx.get("s4_2_3", 33)),
        
        # Chapter 5
        ("CHAPTER 5", "RESULTS", idx.get("ch5", 34)),
        ("  5.1", "Resulting Images", idx.get("s5_1", 34)),
        ("    5.1.1", "Screen Shot 1: Primary Portfolio Overview & Valuation Dashboard", idx.get("s5_1_1", 34)),
        ("    5.1.2", "Screen Shot 2: Multi-Asset Real-Time MarketWatch Terminal", idx.get("s5_1_2", 35)),
        ("    5.1.3", "Screen Shot 3: Agentic AI Rebalancing Operations Console", idx.get("s5_1_3", 36)),
        ("  5.2", "Resulting Tables", idx.get("s5_2", 37)),
        ("    5.2.1", "Table 1: Multi-Dimensional Competitive Analysis Matrix", idx.get("s5_2_1", 37)),
        ("    5.2.2", "Table 2: Quantitative System Performance & Latency Benchmarks", idx.get("s5_2_2", 38)),
        ("  5.3", "Resulting Graphs", idx.get("s5_3", 39)),
        ("    5.3.1", "Graph 1: Multi-Asset Target vs Actual Allocation Pie Graph", idx.get("s5_3_1", 39)),
        ("    5.3.2", "Graph 2: Empirical Portfolio Drift & Volatility Timeline Graph", idx.get("s5_3_2", 40)),
        ("    5.3.3", "Graph 3: Rebalancing Drift Frequency Distribution Histogram", idx.get("s5_3_3", 41)),
        ("    5.3.4", "Graph 4: Tolerance Threshold Sensitivity Curve Graph", idx.get("s5_3_4", 42)),
        ("    5.3.5", "Graph 5: Portfolio Asset Allocation Treemap Graph", idx.get("s5_3_5", 43)),
        ("  5.4", "Results Analysis", idx.get("s5_4", 44)),
        ("    5.4.1", "Time Complexity", idx.get("s5_4_1", 44)),
        ("    5.4.2", "Space Complexity", idx.get("s5_4_2", 45)),
        ("    5.4.3", "Results Summary", idx.get("s5_4_3", 46)),
        
        # Chapter 6
        ("CHAPTER 6", "CONCLUSIONS & FUTURE SCOPE", idx.get("ch6", 47)),
        ("  6.1", "Conclusions", idx.get("s6_1", 47)),
        ("  6.2", "Future Scope", idx.get("s6_2", 48)),
        
        # Final pages
        ("FINAL", "Bibliography", idx.get("bib", 49)),
        ("FINAL", "Paper Draft & Poster", idx.get("paper", 51))
    ]
    
    toc_data = [[sec, title, str(pno)] for sec, title, pno in toc_entries]
    add_custom_table(doc, ["Section", "Chapter / Section Title", "Page No."], toc_data, col_widths=[1.5, 4.1, 0.8])

    # Transition to Section 3: Main Body (Arabic Numerals starting at 1)
    add_body_section(doc)

print("Preliminary pages configured with monochrome styling and exact required outline.")
