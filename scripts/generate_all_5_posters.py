"""
WealthOS 5-Variation Multi-Theme Research Poster Generator
==========================================================
Generates 5 distinct high-impact academic posters for the user to select from:
1. poster_1_clean_white      - Clean Academic White / Ice Slate (Print Standard)
2. poster_2_cyber_dark       - Cyber Security Obsidian Dark Mode (High Tech)
3. poster_3_royal_blue       - Royal Cobalt & Ice Blue (University Colors)
4. poster_4_warm_pearl_ivory - Warm Champagne Pearl & Luxury Ivory (Refined Warmth)
5. poster_5_emerald_mint     - Fintech Growth Emerald & Fresh Sage

Key Layout Enhancements Across All 5:
- ZERO empty space at the bottom: All 3 columns stretch perfectly and align at the bottom edge.
- Varied block sizes: Visual cards (screenshots, SVG charts, pie chart) are significantly expanded
  while text cards remain dense and legible.
- Official Malla Reddy University Logo embedded cleanly.
- Strict Cyber Security Branding: "DEPARTMENT OF CYBER SECURITY", Dr. G. Latha, B.Tech IV Year Cyber Security Alpha.
- Embedded SVG 16-Asset Allocation Pie / Donut Chart.
- Vector PDF via Headless Edge + 200 DPI razor-sharp PNG via PyMuPDF.
"""

import os
import subprocess
import base64
import shutil

WORKSPACE_DIR = r"C:\Users\goudk\OneDrive\Desktop\4-1"

def img_to_base64(rel_path):
    full_path = os.path.join(WORKSPACE_DIR, rel_path)
    if os.path.exists(full_path):
        with open(full_path, "rb") as f:
            b64 = base64.b64encode(f.read()).decode("utf-8")
            ext = os.path.splitext(full_path)[1].lower().replace(".", "")
            if ext == "jpg": ext = "jpeg"
            return f"data:image/{ext};base64,{b64}"
    return ""

img_logo = img_to_base64("mru_logo.png")
img_dash = img_to_base64(r"docs\dashboard_overview_reloaded_1782638745515.png")
img_market = img_to_base64(r"docs\market_watch_feed_1782638986982.png")
img_ai = img_to_base64(r"docs\ai_assistant_page_1782638876538.png")

# Theme definitions
THEMES = [
    {
        "id": "poster_1_clean_white",
        "name": "Clean Academic White & Slate",
        "body_bg": "#E2E8F0",
        "canvas_bg": "linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 45%, #F1F5F9 100%)",
        "canvas_border": "#1E3A8A",
        "inner_border": "#94A3B8",
        "header_bg": "#FFFFFF",
        "header_border": "#1E3A8A",
        "hero_bg": "linear-gradient(135deg, #0F172A 0%, #1E3A8A 60%, #1E40AF 100%)",
        "hero_border": "#3B82F6",
        "hero_accent": "#60A5FA",
        "meta_bg": "#FFFFFF",
        "meta_border": "#1E3A8A",
        "meta_label_bg": "#1E3A8A",
        "meta_links_bg": "#EFF6FF",
        "meta_links_border": "#3B82F6",
        "is_dark": False,
        "card_bg": "#FFFFFF",
        "text_main": "#0F172A",
        "text_muted": "#475569",
        "table_hover": "#F1F5F9",
        "table_border": "#E2E8F0",
    },
    {
        "id": "poster_2_cyber_dark",
        "name": "Cyber Security Obsidian Matrix (Dark Mode)",
        "body_bg": "#030712",
        "canvas_bg": "linear-gradient(180deg, #0B0F19 0%, #0F172A 50%, #080C16 100%)",
        "canvas_border": "#06B6D4",
        "inner_border": "#3B82F6",
        "header_bg": "#0F172A",
        "header_border": "#06B6D4",
        "hero_bg": "linear-gradient(135deg, #050811 0%, #0F172A 60%, #1E1B4B 100%)",
        "hero_border": "#06B6D4",
        "hero_accent": "#22D3EE",
        "meta_bg": "#0F172A",
        "meta_border": "#06B6D4",
        "meta_label_bg": "#0891B2",
        "meta_links_bg": "#1E293B",
        "meta_links_border": "#06B6D4",
        "is_dark": True,
        "card_bg": "#111827",
        "text_main": "#F8FAFC",
        "text_muted": "#94A3B8",
        "table_hover": "#1E293B",
        "table_border": "#334155",
    },
    {
        "id": "poster_3_royal_blue",
        "name": "Royal Cobalt & Ice Blue (University Colors)",
        "body_bg": "#172554",
        "canvas_bg": "linear-gradient(180deg, #EFF6FF 0%, #E0F2FE 40%, #F0F9FF 100%)",
        "canvas_border": "#1E40AF",
        "inner_border": "#F59E0B",
        "header_bg": "#FFFFFF",
        "header_border": "#1D4ED8",
        "hero_bg": "linear-gradient(135deg, #172554 0%, #1E3A8A 50%, #1D4ED8 100%)",
        "hero_border": "#F59E0B",
        "hero_accent": "#FBBF24",
        "meta_bg": "#FFFFFF",
        "meta_border": "#1D4ED8",
        "meta_label_bg": "#1D4ED8",
        "meta_links_bg": "#FEF3C7",
        "meta_links_border": "#F59E0B",
        "is_dark": False,
        "card_bg": "#FFFFFF",
        "text_main": "#0F172A",
        "text_muted": "#475569",
        "table_hover": "#EFF6FF",
        "table_border": "#E2E8F0",
    },
    {
        "id": "poster_4_warm_pearl_ivory",
        "name": "Warm Champagne Pearl & Luxury Ivory",
        "body_bg": "#78350F",
        "canvas_bg": "linear-gradient(180deg, #FAF8F5 0%, #F5EFEB 50%, #ECE4DB 100%)",
        "canvas_border": "#92400E",
        "inner_border": "#D97706",
        "header_bg": "#FFFDF9",
        "header_border": "#B45309",
        "hero_bg": "linear-gradient(135deg, #1C1917 0%, #292524 50%, #44403C 100%)",
        "hero_border": "#D97706",
        "hero_accent": "#FBBF24",
        "meta_bg": "#FFFDF9",
        "meta_border": "#B45309",
        "meta_label_bg": "#B45309",
        "meta_links_bg": "#FEF3C7",
        "meta_links_border": "#D97706",
        "is_dark": False,
        "card_bg": "#FFFFFF",
        "text_main": "#1C1917",
        "text_muted": "#57534E",
        "table_hover": "#FEF3C7",
        "table_border": "#E7E5E4",
    },
    {
        "id": "poster_5_emerald_mint",
        "name": "Fintech Growth Emerald & Fresh Sage",
        "body_bg": "#064E3B",
        "canvas_bg": "linear-gradient(180deg, #F0FDF4 0%, #ECFDF5 45%, #E6F4EA 100%)",
        "canvas_border": "#047857",
        "inner_border": "#10B981",
        "header_bg": "#FFFFFF",
        "header_border": "#059669",
        "hero_bg": "linear-gradient(135deg, #022C22 0%, #064E3B 55%, #047857 100%)",
        "hero_border": "#34D399",
        "hero_accent": "#6EE7B7",
        "meta_bg": "#FFFFFF",
        "meta_border": "#059669",
        "meta_label_bg": "#059669",
        "meta_links_bg": "#ECFDF5",
        "meta_links_border": "#10B981",
        "is_dark": False,
        "card_bg": "#FFFFFF",
        "text_main": "#064E3B",
        "text_muted": "#334155",
        "table_hover": "#ECFDF5",
        "table_border": "#D1FAE5",
    }
]

def generate_poster_html(theme):
    dark = theme["is_dark"]
    
    # Card styles based on dark vs light
    card_bg = theme["card_bg"]
    main_text = theme["text_main"]
    muted_text = theme["text_muted"]
    table_border = theme["table_border"]
    table_hover = theme["table_hover"]
    
    chart_bg = "#0B132B" if dark else "#F8FAFC"
    chart_border = "#1E293B" if dark else "#CBD5E1"
    math_bg = "#1E293B" if dark else "#FFFDF5"
    math_border = "#F59E0B" if dark else "#D97706"
    math_text = "#FDE68A" if dark else "#92400E"
    
    header_title_color = "#38BDF8" if dark else "#1E3A8A"
    header_dept_color = "#F59E0B" if dark else "#D97706"
    header_meta_color = "#E2E8F0" if dark else "#0F172A"
    
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>WealthOS: Privacy-Preserving Multi-Asset Portfolio Rebalancing - {theme['name']}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@700;800;900&family=Plus+Jakarta+Sans:wght@500;600;700;800;900&family=JetBrains+Mono:wght@500;600;700;800&display=swap" rel="stylesheet">

<style>
  * {{
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }}

  body {{
    background-color: {theme['body_bg']};
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    color: {main_text};
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 12px 0 20px 0;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }}

  /* Interactive Top Bar */
  .interactive-bar {{
    width: 1400px;
    max-width: 98vw;
    background: {'#1E293B' if dark else '#FFFFFF'};
    border: 2px solid {theme['canvas_border']};
    border-radius: 8px;
    padding: 8px 16px;
    margin-bottom: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 6px 16px rgba(0,0,0,0.25);
    color: {main_text};
  }}

  .interactive-bar-left {{
    display: flex;
    align-items: center;
    gap: 16px;
  }}

  .interactive-bar-title {{
    font-size: 13.5px;
    font-weight: 800;
    color: {theme['canvas_border']};
    display: flex;
    align-items: center;
    gap: 8px;
  }}

  .pulse-dot {{
    width: 9px;
    height: 9px;
    background: #10B981;
    border-radius: 50%;
    box-shadow: 0 0 8px #10B981;
  }}

  .slider-control {{
    display: flex;
    align-items: center;
    gap: 10px;
    background: {'#0F172A' if dark else '#F1F5F9'};
    padding: 4px 12px;
    border-radius: 6px;
    border: 1px solid {theme['inner_border']};
  }}

  .slider-control label {{
    font-size: 11.5px;
    color: {muted_text};
    font-weight: 700;
  }}

  .slider-control input[type="range"] {{
    width: 130px;
    cursor: pointer;
    accent-color: {theme['canvas_border']};
  }}

  .slider-val {{
    font-family: 'JetBrains Mono', monospace;
    font-size: 12.5px;
    font-weight: 800;
    color: {theme['canvas_border']};
    min-width: 46px;
  }}

  .btn-group {{
    display: flex;
    gap: 8px;
  }}

  .action-btn {{
    background: #1E3A8A;
    color: #FFFFFF;
    border: 1px solid #3B82F6;
    padding: 6px 14px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 6px;
  }}

  .action-btn:hover {{
    background: #2563EB;
  }}

  .action-btn.gold {{
    background: #D97706;
    border-color: #F59E0B;
  }}

  .action-btn.gold:hover {{
    background: #B45309;
  }}

  /* Main Poster Canvas - Snug & Flush Height to Eliminate Any Bottom Gap */
  .poster-canvas {{
    width: 1400px;
    background: {theme['canvas_bg']};
    border: 4px solid {theme['canvas_border']};
    box-shadow: 0 30px 70px rgba(0, 0, 0, 0.4);
    padding: 16px 18px 16px 18px;
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 10px;
    border-radius: 6px;
  }}

  .inner-trim-border {{
    position: absolute;
    inset: 5px;
    border: 1.5px solid {theme['inner_border']};
    pointer-events: none;
    border-radius: 4px;
  }}

  /* 1. University Header */
  .uni-header {{
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 16px;
    border-bottom: 3px solid {theme['canvas_border']};
    background: {theme['header_bg']};
    border-radius: 6px;
    box-shadow: 0 3px 10px rgba(0,0,0,0.1);
  }}

  .uni-left {{
    display: flex;
    align-items: center;
    gap: 20px;
  }}

  .uni-logo-img {{
    width: 92px;
    height: 84px;
    object-fit: contain;
    flex-shrink: 0;
    background: #FFFFFF;
    padding: 2px;
    border-radius: 4px;
  }}

  .uni-text h1 {{
    font-family: 'Outfit', sans-serif;
    font-size: 42px;
    font-weight: 900;
    color: {header_title_color};
    letter-spacing: 2px;
    line-height: 1.05;
    text-transform: uppercase;
  }}

  .uni-text h3 {{
    font-size: 18px;
    font-weight: 900;
    color: {header_dept_color};
    margin-top: 2px;
    letter-spacing: 1px;
    text-transform: uppercase;
  }}

  .uni-text p {{
    font-size: 12px;
    color: {muted_text};
    font-weight: 700;
    margin-top: 2px;
  }}

  .uni-meta {{
    text-align: right;
    font-size: 12px;
    color: {header_meta_color};
    line-height: 1.5;
    border-left: 2.5px solid {theme['canvas_border']};
    padding-left: 16px;
  }}

  .uni-meta strong {{
    color: {header_title_color};
  }}

  .track-tag {{
    display: inline-block;
    background: linear-gradient(90deg, #1E3A8A, #2563EB);
    color: #FFFFFF;
    padding: 3px 10px;
    border-radius: 4px;
    font-size: 10.5px;
    font-weight: 800;
    margin-top: 4px;
    letter-spacing: 0.5px;
  }}

  /* 2. Hero Title Banner */
  .hero-banner {{
    background: {theme['hero_bg']};
    color: #FFFFFF;
    border: 2px solid {theme['hero_border']};
    border-radius: 6px;
    padding: 12px 18px 10px 18px;
    position: relative;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
  }}

  .greek-fret {{
    height: 4px;
    background: repeating-linear-gradient(90deg, {theme['hero_border']} 0px, {theme['hero_border']} 8px, transparent 8px, transparent 12px);
    opacity: 0.9;
    margin-bottom: 7px;
  }}

  .hero-title {{
    font-size: 27px;
    font-weight: 900;
    line-height: 1.2;
    color: #FFFFFF;
    letter-spacing: -0.3px;
  }}

  .hero-title span {{
    color: {theme['hero_accent']};
  }}

  .hero-subtitle {{
    font-size: 13px;
    color: #E2E8F0;
    margin-top: 4px;
    font-weight: 600;
    line-height: 1.35;
  }}

  /* 4 Metric Badges */
  .hero-stats-row {{
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-top: 9px;
    padding-top: 8px;
    border-top: 1.5px solid rgba(255, 255, 255, 0.2);
  }}

  .stat-pill {{
    background: rgba(15, 23, 42, 0.7);
    border-radius: 6px;
    padding: 5px 8px;
    text-align: center;
    border: 1.5px solid;
  }}

  .stat-pill.gold {{ border-color: #F59E0B; }}
  .stat-pill.blue {{ border-color: #38BDF8; }}
  .stat-pill.emerald {{ border-color: #10B981; }}
  .stat-pill.purple {{ border-color: #A855F7; }}

  .stat-num {{
    font-family: 'JetBrains Mono', monospace;
    font-size: 21px;
    font-weight: 900;
  }}

  .stat-pill.gold .stat-num {{ color: #FBBF24; }}
  .stat-pill.blue .stat-num {{ color: #38BDF8; }}
  .stat-pill.emerald .stat-num {{ color: #34D399; }}
  .stat-pill.purple .stat-num {{ color: #C084FC; }}

  .stat-lbl {{
    font-size: 9.5px;
    color: #CBD5E1;
    margin-top: 1px;
    font-weight: 700;
    text-transform: uppercase;
  }}

  /* 3. Investigators Strip */
  .meta-strip {{
    display: grid;
    grid-template-columns: 140px 1.15fr 1.05fr 1.15fr 1.35fr 1.55fr;
    background: {theme['meta_bg']};
    border: 2px solid {theme['meta_border']};
    border-radius: 6px;
    overflow: hidden;
    align-items: stretch;
    box-shadow: 0 3px 10px rgba(0,0,0,0.08);
  }}

  .strip-label {{
    background: {theme['meta_label_bg']};
    color: #FFFFFF;
    font-weight: 900;
    font-size: 11px;
    letter-spacing: 0.8px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 6px;
  }}

  .team-card {{
    padding: 5px 10px;
    border-left: 1px solid {table_border};
    display: flex;
    flex-direction: column;
    justify-content: center;
  }}

  .team-name {{
    font-size: 13px;
    font-weight: 800;
    color: {main_text};
  }}

  .team-role {{
    font-size: 10.5px;
    font-weight: 700;
    color: {theme['canvas_border']};
    margin-top: 1px;
  }}

  .team-reg {{
    font-family: 'JetBrains Mono', monospace;
    font-size: 9.5px;
    color: {muted_text};
    font-weight: 600;
  }}

  .links-card {{
    padding: 5px 10px;
    border-left: 2px solid {theme['meta_links_border']};
    background: {theme['meta_links_bg']};
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 3px;
  }}

  .link-pill {{
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 10px;
    font-weight: 700;
    text-decoration: none;
    padding: 2px 6px;
    border-radius: 4px;
  }}

  .link-pill.github {{
    background: #0F172A;
    color: #FFFFFF;
  }}

  .link-pill.deploy {{
    background: #0284C7;
    color: #FFFFFF;
  }}

  /* 4. Three-Column Dense Core Grid - Completely Flush & Balanced */
  .grid-3col {{
    display: grid;
    grid-template-columns: 1fr 1.14fr 1fr;
    gap: 11px;
    align-items: stretch;
  }}

  .col-block {{
    display: flex;
    flex-direction: column;
    gap: 11px;
    justify-content: space-between;
  }}

  /* Common Card Styling */
  .card-box {{
    background: {card_bg};
    border-radius: 6px;
    padding: 9px 11px;
    display: flex;
    flex-direction: column;
    gap: 5px;
    box-shadow: 0 3px 10px rgba(0,0,0,0.06);
    border: 2px solid;
  }}

  /* Distinct Color Theming for Every Single Block */
  .theme-sapphire {{
    border-color: #2563EB;
    background: {'linear-gradient(180deg, #111827 0%, #1E293B 100%)' if dark else 'linear-gradient(180deg, #FFFFFF 0%, #EFF6FF 100%)'};
  }}
  .theme-sapphire .card-header {{ color: {'#60A5FA' if dark else '#1E40AF'}; border-bottom: 2px solid #2563EB; }}
  .theme-sapphire .sec-badge {{ background: #1E40AF; color: #FFFFFF; }}

  .theme-amber {{
    border-color: #D97706;
    background: {'linear-gradient(180deg, #111827 0%, #1E293B 100%)' if dark else 'linear-gradient(180deg, #FFFFFF 0%, #FFFBEB 100%)'};
  }}
  .theme-amber .card-header {{ color: {'#FBBF24' if dark else '#B45309'}; border-bottom: 2px solid #D97706; }}
  .theme-amber .sec-badge {{ background: #B45309; color: #FFFFFF; }}

  .theme-emerald {{
    border-color: #059669;
    background: {'linear-gradient(180deg, #111827 0%, #1E293B 100%)' if dark else 'linear-gradient(180deg, #FFFFFF 0%, #ECFDF5 100%)'};
  }}
  .theme-emerald .card-header {{ color: {'#34D399' if dark else '#047857'}; border-bottom: 2px solid #059669; }}
  .theme-emerald .sec-badge {{ background: #047857; color: #FFFFFF; }}

  .theme-violet {{
    border-color: #7C3AED;
    background: {'linear-gradient(180deg, #111827 0%, #1E293B 100%)' if dark else 'linear-gradient(180deg, #FFFFFF 0%, #F5F3FF 100%)'};
  }}
  .theme-violet .card-header {{ color: {'#C084FC' if dark else '#6D28D9'}; border-bottom: 2px solid #7C3AED; }}
  .theme-violet .sec-badge {{ background: #6D28D9; color: #FFFFFF; }}

  .theme-security {{
    border-color: #0D9488;
    background: {'linear-gradient(180deg, #111827 0%, #1E293B 100%)' if dark else 'linear-gradient(180deg, #FFFFFF 0%, #F0FDFA 100%)'};
  }}
  .theme-security .card-header {{ color: {'#2DD4BF' if dark else '#0F766E'}; border-bottom: 2px solid #0D9488; }}
  .theme-security .sec-badge {{ background: #0F766E; color: #FFFFFF; }}

  .theme-cyan {{
    border-color: #0284C7;
    background: {'linear-gradient(180deg, #111827 0%, #1E293B 100%)' if dark else 'linear-gradient(180deg, #FFFFFF 0%, #F0F9FF 100%)'};
  }}
  .theme-cyan .card-header {{ color: {'#38BDF8' if dark else '#0369A1'}; border-bottom: 2px solid #0284C7; }}
  .theme-cyan .sec-badge {{ background: #0369A1; color: #FFFFFF; }}

  .theme-coral {{
    border-color: #E11D48;
    background: {'linear-gradient(180deg, #111827 0%, #1E293B 100%)' if dark else 'linear-gradient(180deg, #FFFFFF 0%, #FFF1F2 100%)'};
  }}
  .theme-coral .card-header {{ color: {'#FB7185' if dark else '#BE123C'}; border-bottom: 2px solid #E11D48; }}
  .theme-coral .sec-badge {{ background: #BE123C; color: #FFFFFF; }}

  /* Screenshots Container: Crisp Pure White for clear visual contrast */
  .theme-white-showcase {{
    border-color: #0284C7;
    background: #FFFFFF !important;
    border-width: 2.5px;
    box-shadow: 0 4px 14px rgba(2, 132, 199, 0.2);
    color: #0F172A !important;
  }}
  .theme-white-showcase .card-header {{ color: #0F172A; border-bottom: 2.5px solid #0284C7; }}
  .theme-white-showcase .sec-badge {{ background: #0284C7; color: #FFFFFF; }}

  .theme-benchmark {{
    border-color: #4F46E5;
    background: {'linear-gradient(180deg, #111827 0%, #1E293B 100%)' if dark else 'linear-gradient(180deg, #FFFFFF 0%, #EEF2FF 100%)'};
  }}
  .theme-benchmark .card-header {{ color: {'#818CF8' if dark else '#3730A3'}; border-bottom: 2px solid #4F46E5; }}
  .theme-benchmark .sec-badge {{ background: #3730A3; color: #FFFFFF; }}

  .theme-ruby {{
    border-color: #DC2626;
    background: {'linear-gradient(180deg, #111827 0%, #1E293B 100%)' if dark else 'linear-gradient(180deg, #FFFFFF 0%, #FEF2F2 100%)'};
  }}
  .theme-ruby .card-header {{ color: {'#F87171' if dark else '#B91C1C'}; border-bottom: 2px solid #DC2626; }}
  .theme-ruby .sec-badge {{ background: #B91C1C; color: #FFFFFF; }}

  .theme-tangerine {{
    border-color: #EA580C;
    background: {'linear-gradient(180deg, #111827 0%, #1E293B 100%)' if dark else 'linear-gradient(180deg, #FFFFFF 0%, #FFF7ED 100%)'};
  }}
  .theme-tangerine .card-header {{ color: {'#FB923C' if dark else '#C2410C'}; border-bottom: 2px solid #EA580C; }}
  .theme-tangerine .sec-badge {{ background: #C2410C; color: #FFFFFF; }}

  .theme-audit {{
    border-color: #475569;
    background: {'linear-gradient(180deg, #111827 0%, #1E293B 100%)' if dark else 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)'};
  }}
  .theme-audit .card-header {{ color: {'#94A3B8' if dark else '#1E293B'}; border-bottom: 2px solid #475569; }}
  .theme-audit .sec-badge {{ background: #334155; color: #FFFFFF; }}

  .theme-amethyst {{
    border-color: #9333EA;
    background: {'linear-gradient(180deg, #111827 0%, #1E293B 100%)' if dark else 'linear-gradient(180deg, #FFFFFF 0%, #FAF5FF 100%)'};
  }}
  .theme-amethyst .card-header {{ color: {'#C084FC' if dark else '#7E22CE'}; border-bottom: 2px solid #9333EA; }}
  .theme-amethyst .sec-badge {{ background: #7E22CE; color: #FFFFFF; }}

  .theme-royalgold {{
    border-color: #B45309;
    background: {'linear-gradient(180deg, #111827 0%, #1E293B 100%)' if dark else 'linear-gradient(180deg, #FFFFFF 0%, #FEFCE8 100%)'};
  }}
  .theme-royalgold .card-header {{ color: {'#FBBF24' if dark else '#854D0E'}; border-bottom: 2px solid #B45309; }}
  .theme-royalgold .sec-badge {{ background: #854D0E; color: #FFFFFF; }}

  /* Card Headings */
  .card-header {{
    font-size: 13.5px;
    font-weight: 900;
    letter-spacing: 0.6px;
    text-transform: uppercase;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 4px;
    margin-bottom: 2px;
  }}

  .sec-badge {{
    font-size: 9.5px;
    padding: 2px 7px;
    border-radius: 4px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }}

  .prose-text {{
    font-size: 11.2px;
    line-height: 1.48;
    color: {main_text};
    text-align: justify;
  }}

  .prose-text strong {{
    color: {'#38BDF8' if dark else '#0F172A'};
    font-weight: 800;
  }}

  /* Math Card */
  .math-card {{
    background: {math_bg};
    border-left: 3.5px solid {math_border};
    border-radius: 0 4px 4px 0;
    padding: 5px 8px;
    margin: 2px 0;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10.2px;
    color: {math_text};
    line-height: 1.4;
    border-top: 1px solid {table_border};
    border-right: 1px solid {table_border};
    border-bottom: 1px solid {table_border};
  }}

  .math-card .math-lbl {{
    font-size: 8.5px;
    color: {math_border};
    text-transform: uppercase;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 800;
    display: block;
    margin-bottom: 1px;
  }}

  /* Academic Tables */
  .academic-table {{
    width: 100%;
    border-collapse: collapse;
    font-size: 10px;
    margin-top: 2px;
  }}

  .academic-table th {{
    background: {'#0F172A' if dark else '#0F172A'};
    color: #FFFFFF;
    font-weight: 800;
    text-align: left;
    padding: 5px 7px;
    font-size: 9.2px;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }}

  .academic-table td {{
    padding: 4.5px 7px;
    border-bottom: 1px solid {table_border};
    color: {main_text};
  }}

  .academic-table tr:hover td {{
    background: {table_hover};
  }}

  .academic-table td.num {{
    font-family: 'JetBrains Mono', monospace;
    font-size: 9.8px;
  }}

  .academic-table td.highlight {{
    color: {'#F59E0B' if dark else '#B45309'};
    font-weight: 800;
  }}

  .academic-table td.optimal {{
    background: {'#1E293B' if dark else '#FEF3C7'};
    color: {'#38BDF8' if dark else '#92400E'};
    font-weight: 800;
    border-left: 2.5px solid #D97706;
  }}

  .table-caption {{
    font-size: 8.8px;
    color: {muted_text};
    margin-top: 2px;
    font-style: italic;
  }}

  /* Donut / Pie Chart Layout */
  .vault-flex {{
    display: grid;
    grid-template-columns: 124px 1fr;
    gap: 8px;
    align-items: center;
    background: {chart_bg};
    border: 1px solid {chart_border};
    border-radius: 4px;
    padding: 6px;
  }}

  .pie-legend {{
    display: flex;
    flex-direction: column;
    gap: 3px;
    font-size: 9.2px;
    font-weight: 700;
  }}

  .pie-item {{
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 2.5px 5px;
    border-radius: 3px;
    background: {card_bg};
    border: 1px solid {table_border};
  }}

  .pie-dot {{
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 5px;
    display: inline-block;
  }}

  /* Screenshot Showcase - Expanded Size */
  .screenshot-showcase {{
    background: #FFFFFF;
    border-radius: 4px;
    padding: 6px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 7px;
    border: 1px solid #CBD5E1;
  }}

  .screen-card {{
    background: #FFFFFF !important;
    border: 1.5px solid #CBD5E1;
    border-radius: 4px;
    overflow: hidden;
    padding: 3px;
  }}

  .screen-card.full {{
    grid-column: span 2;
  }}

  .screen-card img {{
    width: 100%;
    height: 125px;
    object-fit: cover;
    display: block;
  }}

  .screen-card.full img {{
    height: 155px;
  }}

  .screen-cap {{
    padding: 4px 6px;
    font-size: 9.5px;
    color: #0F172A;
    background: #F8FAFC;
    font-weight: 800;
    border-top: 1px solid #CBD5E1;
    text-align: center;
  }}

  /* Vector Charts Box - Expanded Dimensions */
  .chart-box {{
    background: {chart_bg};
    border: 1px solid {chart_border};
    border-radius: 4px;
    padding: 7px;
    margin-top: 2px;
  }}

  .chart-header {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 9.8px;
    font-weight: 800;
    color: {main_text};
    margin-bottom: 4px;
  }}

  .chart-legend {{
    display: flex;
    gap: 8px;
    font-size: 8.8px;
    color: {muted_text};
    font-weight: 600;
  }}

  .legend-dot {{
    display: inline-block;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    margin-right: 3px;
  }}

  .dot-red {{ background: #DC2626; }}
  .dot-cyan {{ background: #0284C7; }}
  .dot-gold {{ background: #D97706; }}
  .dot-green {{ background: #059669; }}

  /* Print Optimization */
  @page {{
    size: 1400px 1960px;
    margin: 0;
  }}

  @media print {{
    body {{
      background: #FFFFFF !important;
      padding: 0 !important;
      margin: 0 !important;
    }}
    .interactive-bar {{
      display: none !important;
    }}
    .poster-canvas {{
      box-shadow: none !important;
      border: 4px solid {theme['canvas_border']} !important;
      margin: 0 !important;
      width: 1400px !important;
      padding: 14px !important;
    }}
  }}
</style>
</head>
<body>

<!-- Interactive Control Bar -->
<div class="interactive-bar" id="action-toolbar">
  <div class="interactive-bar-left">
    <div class="interactive-bar-title">
      <div class="pulse-dot"></div> WealthOS Academic Poster &middot; {theme['name']}
    </div>
    <div class="slider-control">
      <label for="theta-slider">Corridor &theta; Threshold:</label>
      <input type="range" id="theta-slider" min="0.1" max="1.0" step="0.05" value="0.4" oninput="updateSimulation(this.value)">
      <span class="slider-val" id="theta-val">0.40%</span>
    </div>
    <div style="font-size:11.5px; color:{main_text}; font-weight:700;">
      Simulated Trades/Mo: <strong style="color:#059669;" id="sim-trades">48</strong> | 
      Drift Suppression: <strong style="color:#D97706;" id="sim-suppression">85.6%</strong>
    </div>
  </div>
  <div class="btn-group">
    <button class="action-btn" onclick="window.print()">
      <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z"/></svg>
      Print / PDF
    </button>
  </div>
</div>

<div class="poster-canvas">
  <div class="inner-trim-border"></div>

  <!-- 1. UNIVERSITY HEADER -->
  <header class="uni-header">
    <div class="uni-left">
      <img class="uni-logo-img" src="{img_logo}" alt="Malla Reddy University Official Logo">
      <div class="uni-text">
        <h1>MALLA REDDY UNIVERSITY</h1>
        <h3>Department of Cyber Security</h3>
        <p>Maisammaguda, Dulapally, Medchal-Malkajgiri, Hyderabad, Telangana — 500100</p>
      </div>
    </div>
    <div class="uni-meta">
      <div><strong>Class:</strong> B.Tech IV Year — Cyber Security Alpha</div>
      <div><strong>Academic Year:</strong> 2026–2027</div>
      <div class="track-tag">FINANCIAL COMPUTING &amp; CYBER SECURITY TRACK</div>
    </div>
  </header>

  <!-- 2. HERO TITLE BANNER -->
  <section class="hero-banner">
    <div class="greek-fret"></div>
    <h1 class="hero-title">
      WEALTHOS: An Autonomous Multi-Asset Portfolio Rebalancing Platform with <span>Client-Side Privacy Preservation</span>
    </h1>
    <p class="hero-subtitle">
      Empirical Validation of a Deterministic L1-Corridor Drift Engine, Cryptographic Sandbox, and Edge Financial Copilot
    </p>

    <div class="hero-stats-row">
      <div class="stat-pill gold">
        <div class="stat-num">85.6%</div>
        <div class="stat-lbl">Cumulative Drift Reduction (&theta; = 0.40%)</div>
      </div>
      <div class="stat-pill blue">
        <div class="stat-num">0.0084 ms</div>
        <div class="stat-lbl">Vector Drift Latency (8.4 &mu;s Linear)</div>
      </div>
      <div class="stat-pill emerald">
        <div class="stat-num">+59.6%</div>
        <div class="stat-lbl">Risk-Adjusted Alpha (Sharpe 1.82 vs 1.14)</div>
      </div>
      <div class="stat-pill purple">
        <div class="stat-num">100%</div>
        <div class="stat-lbl">Client Sandbox Privacy (Zero Cloud Leak)</div>
      </div>
    </div>
  </section>

  <!-- 3. Investigators & Access -->
  <section class="meta-strip">
    <div class="strip-label">INVESTIGATORS &amp; ACCESS</div>
    
    <div class="team-card">
      <div class="team-name">Kalali Nandiswar Goud</div>
      <div class="team-role">Lead Systems Architect</div>
      <div class="team-reg">HT: 2311cs040073 &middot; IV Cyber Security</div>
    </div>

    <div class="team-card">
      <div class="team-name">D. Koushik</div>
      <div class="team-role">Quantitative Modeler</div>
      <div class="team-reg">HT: 2311cs040045 &middot; IV Cyber Security</div>
    </div>

    <div class="team-card">
      <div class="team-name">K. Jyothi Priya</div>
      <div class="team-role">Security Verification Eng.</div>
      <div class="team-reg">HT: 2311cs040076 &middot; IV Cyber Security</div>
    </div>

    <div class="team-card" style="border-left: 2px solid #D97706;">
      <div class="team-name">Dr. G. Latha</div>
      <div class="team-role">Faculty Project Supervisor</div>
      <div class="team-reg">Assoc. Professor, Dept. of Cyber Security</div>
    </div>

    <div class="links-card">
      <a class="link-pill github" href="https://github.com/kalalinandiswargoud2005/WealthOS-Protfilo-reblancer" target="_blank">
        <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
        GitHub: kalalinandiswargoud2005/WealthOS
      </a>
      <a class="link-pill deploy" href="https://wealth-os-protfilo-reblancer.vercel.app" target="_blank">
        <svg width="11" height="11" fill="currentColor" viewBox="0 0 24 24"><path d="M24 22.525H0l12-21.05 12 21.05z"/></svg>
        Live Vercel: wealth-os-protfilo-reblancer.vercel.app
      </a>
    </div>
  </section>

  <!-- 4. Dense 3-Column Grid -->
  <main class="grid-3col">

    <!-- ==================== COLUMN 1 ==================== -->
    <div class="col-block">

      <!-- Block 1 -->
      <div class="card-box theme-sapphire">
        <div class="card-header">
          <span>1. Introduction &amp; Problem Context</span>
          <span class="sec-badge">Motivation</span>
        </div>
        <p class="prose-text">
          Retail investors managing multi-asset portfolios across Indian equities (NSE), MCX precious metals, AMFI mutual funds, and cryptocurrencies experience continuous allocation drift caused by disjointed trading horizons and asymmetric market volatility. Unattended drift distorts predefined risk appetites and accelerates severe drawdown exposure during sudden market reversals. Commercial robo-advisors enforce rigid monthly reviews and mandate transmitting private balance sheets to third-party databases.
        </p>
        <p class="prose-text" style="margin-top:2px;">
          <strong>WealthOS</strong> resolves this structural bottleneck via an autonomous, client-hosted continuous corridor engine running directly inside the user's browser runtime. Polling a 25-second evaluation loop across 16 holdings, the system evaluates an L1-norm deviation index and executes disciplined rebalancing when drift exceeds <strong>&theta; = 0.40%</strong>, delivering institutional discipline with zero server leakage.
        </p>
      </div>

      <!-- Block 2 -->
      <div class="card-box theme-amber">
        <div class="card-header">
          <span>2. Mathematical Formulation</span>
          <span class="sec-badge">Algorithm</span>
        </div>
        <p class="prose-text">
          Let a portfolio contain <em>N = 16</em> assets with price vector <strong>P</strong>(<em>t</em>) and quantity vector <strong>Q</strong>(<em>t</em>). Total portfolio valuation at tick <em>t</em> is formulated as:
        </p>
        
        <div class="math-card">
          <span class="math-lbl">Equation 1: Dynamic Portfolio Valuation</span>
          V(t) = &sum;<sub>i=1</sub><sup>N</sup> P<sub>i</sub>(t) &middot; Q<sub>i</sub>(t) + Cash(t)
        </div>

        <p class="prose-text">
          The instantaneous asset allocation weight <em>w<sub>i</sub>(t)</em> and signed drift deviation <em>D<sub>i</sub>(t)</em> against target allocation <em>w<sub>i</sub><sup>*</sup></em> are:
        </p>

        <div class="math-card">
          <span class="math-lbl">Equation 2: Maximum Drift &amp; Corridor Trigger</span>
          w<sub>i</sub>(t) = [P<sub>i</sub>(t) &middot; Q<sub>i</sub>(t)] / V(t) &nbsp;&middot;&nbsp; 
          D<sub>max</sub>(t) = max<sub>i</sub> |w<sub>i</sub>(t) - w<sub>i</sub>*| &nbsp;&gt;&nbsp; &theta; = 0.40%
        </div>

        <p class="prose-text">
          When D<sub>max</sub>(t) &gt; &theta;, capital injection is computed via cash-first deployment:
        </p>

        <div class="math-card">
          <span class="math-lbl">Equation 3: Non-Liquidating Cash Deployment</span>
          &Delta;V<sub>k</sub> = min( Cash(t), (w<sub>k</sub>* - w<sub>k</sub>(t)) &middot; V(t) )
        </div>
        <p class="prose-text">
          Cash-first rebalancing prevents forced liquidations, mitigating capital gains taxation under Section 112A of the Indian Income Tax Act.
        </p>
      </div>

      <!-- Block 3: Donut & Pie Chart -->
      <div class="card-box theme-emerald">
        <div class="card-header">
          <span>3. 16-Asset Target Allocation &amp; Vault</span>
          <span class="sec-badge">Allocation</span>
        </div>

        <div class="vault-flex">
          <svg viewBox="0 0 120 120" width="118" height="118" style="display:block; margin:auto;">
            <!-- Equities: 40% (0 to 144 deg) -->
            <path d="M 60,60 L 60,10 A 50,50 0 0,1 107.55,75.45 Z" fill="#2563EB" stroke="#FFFFFF" stroke-width="1.5"/>
            <!-- Metals: 25% (144 to 234 deg) -->
            <path d="M 60,60 L 107.55,75.45 A 50,50 0 0,1 29.43,99.55 Z" fill="#D97706" stroke="#FFFFFF" stroke-width="1.5"/>
            <!-- Mutual Funds: 20% (234 to 306 deg) -->
            <path d="M 60,60 L 29.43,99.55 A 50,50 0 0,1 19.55,30.6 Z" fill="#059669" stroke="#FFFFFF" stroke-width="1.5"/>
            <!-- Crypto: 15% (306 to 360 deg) -->
            <path d="M 60,60 L 19.55,30.6 A 50,50 0 0,1 60,10 Z" fill="#7C3AED" stroke="#FFFFFF" stroke-width="1.5"/>

            <circle cx="60" cy="60" r="28" fill="{card_bg}" stroke="{table_border}" stroke-width="1"/>
            <text x="60" y="58" font-size="8" font-weight="900" fill="{main_text}" text-anchor="middle" font-family="'Plus Jakarta Sans',sans-serif">16 ASSETS</text>
            <text x="60" y="68" font-size="7" font-weight="700" fill="#D97706" text-anchor="middle" font-family="'JetBrains Mono',monospace">100% VAULT</text>
          </svg>

          <div class="pie-legend">
            <div class="pie-item"><span style="display:flex; align-items:center;"><span class="pie-dot" style="background:#2563EB;"></span>Equities</span> <span style="font-family:'JetBrains Mono'; color:#2563EB;">40%</span></div>
            <div class="pie-item"><span style="display:flex; align-items:center;"><span class="pie-dot" style="background:#D97706;"></span>Bullion</span> <span style="font-family:'JetBrains Mono'; color:#D97706;">25%</span></div>
            <div class="pie-item"><span style="display:flex; align-items:center;"><span class="pie-dot" style="background:#059669;"></span>Mutual Funds</span> <span style="font-family:'JetBrains Mono'; color:#059669;">20%</span></div>
            <div class="pie-item"><span style="display:flex; align-items:center;"><span class="pie-dot" style="background:#7C3AED;"></span>Crypto</span> <span style="font-family:'JetBrains Mono'; color:#7C3AED;">15%</span></div>
          </div>
        </div>

        <table class="academic-table" style="margin-top:4px;">
          <thead>
            <tr><th>Class</th><th>Sample Holdings</th><th>Target</th></tr>
          </thead>
          <tbody>
            <tr><td><strong>Precious Metals</strong></td><td>24K Gold MCX, 999 Silver</td><td class="num highlight">25.0%</td></tr>
            <tr><td><strong>Indian Equities</strong></td><td>RELIANCE, TCS, INFY, HDFC</td><td class="num highlight">40.0%</td></tr>
            <tr><td><strong>Mutual Funds</strong></td><td>SBI Bluechip, HDFC Nifty 50</td><td class="num highlight">20.0%</td></tr>
            <tr><td><strong>Crypto Assets</strong></td><td>BTC, ETH, SOL, XRP, ADA</td><td class="num highlight">15.0%</td></tr>
          </tbody>
        </table>
      </div>

      <!-- Block 4 -->
      <div class="card-box theme-violet">
        <div class="card-header">
          <span>4. Runtime Computational Profiling</span>
          <span class="sec-badge">V8 Engine</span>
        </div>
        <table class="academic-table">
          <thead>
            <tr><th>Pipeline Phase</th><th>Complexity</th><th>Latency (&mu;s)</th></tr>
          </thead>
          <tbody>
            <tr><td>Price Ingestion &amp; Dispatch</td><td class="num">O(N)</td><td class="num">3.20 &mu;s</td></tr>
            <tr><td>Vector Drift Calculation</td><td class="num">O(N)</td><td class="num highlight">8.40 &mu;s</td></tr>
            <tr><td>Capital Allocation Sizing</td><td class="num">O(1)</td><td class="num">14.20 &mu;s</td></tr>
            <tr><td>LocalStorage Persistence</td><td class="num">O(1)</td><td class="num">420.00 &mu;s</td></tr>
            <tr style="border-top:1.5px solid #7C3AED;"><td><strong>Total Autonomous Loop</strong></td><td class="num"><strong>O(N)</strong></td><td class="num optimal"><strong>445.80 &mu;s (&lt;0.5 ms)</strong></td></tr>
          </tbody>
        </table>
        <div class="table-caption">
          Table 2: Sub-millisecond execution benchmarked on Chrome V8 JavaScript runtime.
        </div>
      </div>

      <!-- Block 5 -->
      <div class="card-box theme-security">
        <div class="card-header">
          <span>5. Cyber Security &amp; Cryptographic Sandbox</span>
          <span class="sec-badge">Security</span>
        </div>
        <p class="prose-text">
          As engineered by the <strong>Department of Cyber Security</strong>, WealthOS operates under strict Zero-Trust client isolation:
        </p>
        <ul style="font-size:10.2px; color:{main_text}; line-height:1.42; margin-left:14px; margin-top:2px;">
          <li style="margin-bottom:3px;">
            <strong>Zero-Knowledge Ledgers:</strong> Financial balances and trade orders execute strictly inside the client's memory heap; zero plaintext ledgers are transmitted to external servers.
          </li>
          <li style="margin-bottom:3px;">
            <strong>WebAuthn Biometric Enclave:</strong> Rebalancing authorization and cash withdrawals require hardware-backed WebAuthn biometric passkey validation (Touch ID / Face ID).
          </li>
          <li>
            <strong>AES-GCM Local Encryption:</strong> Persistent local storage uses AES-GCM primitives with on-device derived keys, guarding against physical disk inspection.
          </li>
        </ul>
      </div>

    </div>

    <!-- ==================== COLUMN 2 (Expanded Visuals) ==================== -->
    <div class="col-block">

      <!-- Block 6: Expanded High-Resolution Drift Chart -->
      <div class="card-box theme-cyan">
        <div class="card-header">
          <span>6. Empirical Drift Trajectory (30 Days)</span>
          <span class="sec-badge">Primary Result</span>
        </div>
        <div class="chart-box">
          <div class="chart-header">
            <span>Portfolio Drift Over 43,200 Observation Ticks</span>
            <div class="chart-legend">
              <span><span class="legend-dot dot-red"></span>Static Unmanaged</span>
              <span><span class="legend-dot dot-cyan"></span>WealthOS Corridor</span>
              <span><span class="legend-dot dot-gold"></span>&theta; = 0.40% Bound</span>
            </div>
          </div>
          
          <svg viewBox="0 0 460 175" width="100%" height="175" style="display:block;">
            <line x1="40" y1="145" x2="450" y2="145" stroke="{table_border}" stroke-width="1"/>
            <line x1="40" y1="110" x2="450" y2="110" stroke="{table_border}" stroke-width="1"/>
            <line x1="40" y1="75" x2="450" y2="75" stroke="{table_border}" stroke-width="1"/>
            <line x1="40" y1="40" x2="450" y2="40" stroke="{table_border}" stroke-width="1"/>

            <text x="32" y="148" fill="{muted_text}" font-size="8.5" text-anchor="end" font-family="'JetBrains Mono',monospace">0.0%</text>
            <text x="32" y="113" fill="{muted_text}" font-size="8.5" text-anchor="end" font-family="'JetBrains Mono',monospace">3.0%</text>
            <text x="32" y="78" fill="{muted_text}" font-size="8.5" text-anchor="end" font-family="'JetBrains Mono',monospace">6.0%</text>
            <text x="32" y="43" fill="{muted_text}" font-size="8.5" text-anchor="end" font-family="'JetBrains Mono',monospace">9.0%</text>

            <text x="45" y="159" fill="{muted_text}" font-size="8.5" font-family="'JetBrains Mono',monospace">Day 0</text>
            <text x="140" y="159" fill="{muted_text}" font-size="8.5" font-family="'JetBrains Mono',monospace">Day 8</text>
            <text x="240" y="159" fill="{muted_text}" font-size="8.5" font-family="'JetBrains Mono',monospace">Day 16</text>
            <text x="340" y="159" fill="{muted_text}" font-size="8.5" font-family="'JetBrains Mono',monospace">Day 24</text>
            <text x="430" y="159" fill="{muted_text}" font-size="8.5" font-family="'JetBrains Mono',monospace">Day 30</text>

            <rect x="40" y="131" width="410" height="14" fill="#10B981" fill-opacity="0.18"/>
            <line x1="40" y1="131" x2="450" y2="131" stroke="#D97706" stroke-width="1.3" stroke-dasharray="3,3"/>
            <text x="446" y="126" fill="#D97706" font-size="8" text-anchor="end" font-weight="700" font-family="'JetBrains Mono',monospace">&theta; = 0.40% Corridor Bound</text>

            <!-- Unmanaged Drift Curve -->
            <path d="M 40,145 Q 70,138 100,128 T 160,110 T 220,95 T 280,75 T 350,56 T 410,42 T 450,30" 
                  fill="none" stroke="#DC2626" stroke-width="2.5"/>
            <circle cx="450" cy="30" r="4" fill="#DC2626"/>
            <text x="445" y="21" fill="#DC2626" font-size="9" font-weight="800" text-anchor="end" font-family="'JetBrains Mono',monospace">Unmanaged Peak: 8.92%</text>

            <!-- WealthOS Managed Corridor Wave -->
            <path d="M 40,145 
                     L 60,137 L 75,131 L 76,143 
                     L 105,135 L 120,131 L 121,143 
                     L 155,134 L 175,130 L 176,143 
                     L 210,136 L 230,131 L 231,143 
                     L 265,133 L 285,130 L 286,143 
                     L 320,137 L 340,131 L 341,143 
                     L 375,134 L 395,130 L 396,143 
                     L 430,136 L 445,132 L 450,140" 
                  fill="none" stroke="#0284C7" stroke-width="2.2"/>

            <circle cx="75" cy="131" r="3" fill="#059669"/>
            <circle cx="120" cy="131" r="3" fill="#059669"/>
            <circle cx="175" cy="130" r="3" fill="#059669"/>
            <circle cx="230" cy="131" r="3" fill="#059669"/>
            <circle cx="285" cy="130" r="3" fill="#059669"/>
            <circle cx="340" cy="131" r="3" fill="#059669"/>
            <circle cx="395" cy="130" r="3" fill="#059669"/>

            <rect x="220" y="10" width="185" height="22" rx="4" fill="{card_bg}" stroke="#0284C7" stroke-width="1.2"/>
            <text x="312" y="24" fill="#0284C7" font-size="9" font-weight="800" text-anchor="middle">85.6% Drift Suppression Achieved</text>
          </svg>
        </div>
        <div class="table-caption">
          Figure 1: High-frequency telemetry tracking unmanaged drift divergence vs. WealthOS corridor containment.
        </div>
      </div>

      <!-- Block 7: Expanded Pareto Sensitivity Chart -->
      <div class="card-box theme-coral">
        <div class="card-header">
          <span>7. Pareto Frontier: &theta; vs. Turnover</span>
          <span class="sec-badge">Sensitivity</span>
        </div>
        <div class="chart-box">
          <div class="chart-header">
            <span>Optimization of Tolerance Threshold &theta;</span>
            <div class="chart-legend">
              <span><span class="legend-dot dot-red"></span>Trade Count (Mo)</span>
              <span><span class="legend-dot dot-green"></span>Mean Drift (%)</span>
            </div>
          </div>

          <svg viewBox="0 0 460 150" width="100%" height="150" style="display:block;">
            <line x1="40" y1="115" x2="430" y2="115" stroke="{table_border}" stroke-width="1"/>
            <line x1="40" y1="80" x2="430" y2="80" stroke="{table_border}" stroke-width="1"/>
            <line x1="40" y1="45" x2="430" y2="45" stroke="{table_border}" stroke-width="1"/>
            <line x1="40" y1="15" x2="430" y2="15" stroke="{table_border}" stroke-width="1"/>

            <text x="34" y="118" fill="{muted_text}" font-size="8.5" text-anchor="end" font-family="'JetBrains Mono',monospace">0</text>
            <text x="34" y="83" fill="{muted_text}" font-size="8.5" text-anchor="end" font-family="'JetBrains Mono',monospace">150</text>
            <text x="34" y="48" fill="{muted_text}" font-size="8.5" text-anchor="end" font-family="'JetBrains Mono',monospace">300</text>
            <text x="34" y="18" fill="{muted_text}" font-size="8.5" text-anchor="end" font-family="'JetBrains Mono',monospace">450</text>

            <text x="70" y="128" fill="{muted_text}" font-size="8.5" text-anchor="middle" font-family="'JetBrains Mono',monospace">0.10%</text>
            <text x="140" y="128" fill="{muted_text}" font-size="8.5" text-anchor="middle" font-family="'JetBrains Mono',monospace">0.20%</text>
            <text x="210" y="128" fill="#B45309" font-size="9" font-weight="800" text-anchor="middle" font-family="'JetBrains Mono',monospace">0.40%*</text>
            <text x="280" y="128" fill="{muted_text}" font-size="8.5" text-anchor="middle" font-family="'JetBrains Mono',monospace">0.60%</text>
            <text x="350" y="128" fill="{muted_text}" font-size="8.5" text-anchor="middle" font-family="'JetBrains Mono',monospace">0.80%</text>
            <text x="410" y="128" fill="{muted_text}" font-size="8.5" text-anchor="middle" font-family="'JetBrains Mono',monospace">1.00%</text>

            <path d="M 70,22 L 140,70 L 210,102 L 280,107 L 350,109 L 410,110" 
                  fill="none" stroke="#DC2626" stroke-width="2.3"/>
            
            <path d="M 70,111 L 140,106 L 210,97 L 280,75 L 350,54 L 410,31" 
                  fill="none" stroke="#059669" stroke-width="2.3"/>

            <line x1="210" y1="12" x2="210" y2="115" stroke="#D97706" stroke-width="1.5" stroke-dasharray="3,3"/>
            <circle cx="210" cy="102" r="5" fill="#DC2626" stroke="#FFFFFF" stroke-width="1.5"/>
            <circle cx="210" cy="97" r="5" fill="#059669" stroke="#FFFFFF" stroke-width="1.5"/>

            <rect x="175" y="8" width="140" height="28" rx="4" fill="{card_bg}" stroke="#D97706" stroke-width="1.3"/>
            <text x="245" y="20" fill="#D97706" font-size="9" font-weight="800" text-anchor="middle">Optimal Pareto Frontier</text>
            <text x="245" y="31" fill="{main_text}" font-size="8" text-anchor="middle">48 Trades &middot; 0.14% Mean Drift</text>
          </svg>
        </div>
        <div class="table-caption">
          Figure 2: Empirical Pareto frontier identifying &theta; = 0.40% as the minimal churn operating point.
        </div>
      </div>

      <!-- Block 8: Expanded High-Definition System Screenshots -->
      <div class="card-box theme-white-showcase">
        <div class="card-header">
          <span>8. Verified Client System Interface</span>
          <span class="sec-badge">Live System</span>
        </div>
        
        <div class="screenshot-showcase">
          <div class="screen-card full">
            <img src="{img_dash}" alt="WealthOS Executive Dashboard">
            <div class="screen-cap">Production Dashboard: Live Portfolio Net Worth &amp; Real-Time Drift Gauges</div>
          </div>
          <div class="screen-card">
            <img src="{img_market}" alt="Market Watch Feed">
            <div class="screen-cap">Market Watch: 16-Asset Tick Telemetry</div>
          </div>
          <div class="screen-card">
            <img src="{img_ai}" alt="Financial Co-Pilot">
            <div class="screen-cap">AI Co-Pilot: Voice &amp; Edge Rationale</div>
          </div>
        </div>
        <div class="table-caption" style="text-align:center;">
          Figure 3: Shipped client-side single page application running React 19, TailwindCSS 4, and ApexCharts.
        </div>
      </div>

      <!-- Block 9: Expanded Industry Platform Benchmark -->
      <div class="card-box theme-benchmark">
        <div class="card-header">
          <span>9. Industry Platform Benchmark</span>
          <span class="sec-badge">Comparison</span>
        </div>
        <table class="academic-table">
          <thead>
            <tr>
              <th>Feature</th>
              <th>WealthOS (Ours)</th>
              <th>Vanguard / Betterment</th>
              <th>Zerodha / Groww</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Privacy Architecture</strong></td>
              <td class="num optimal">Client Sandbox (Zero Cloud)</td>
              <td>Centralized Cloud DB</td>
              <td>Broker Server Database</td>
            </tr>
            <tr>
              <td><strong>Rebalance Cadence</strong></td>
              <td class="num highlight">Continuous (25s Ticks)</td>
              <td>Quarterly / Annual</td>
              <td>Manual User Execution</td>
            </tr>
            <tr>
              <td><strong>Multi-Asset Scope</strong></td>
              <td class="num highlight">Stocks, Bullion, Crypto, MFs</td>
              <td>Equities + Bonds Only</td>
              <td>Equities + MFs Only</td>
            </tr>
            <tr>
              <td><strong>Advisory Fees</strong></td>
              <td class="num optimal">0.0% AUM (FOSS)</td>
              <td>0.25% - 0.65% AUM/yr</td>
              <td>Brokerage commissions</td>
            </tr>
            <tr>
              <td><strong>Tax Minimization</strong></td>
              <td class="num highlight">Cash-First Deployment</td>
              <td>Forced Asset Sale</td>
              <td>Manual Capital Gains</td>
            </tr>
          </tbody>
        </table>
        <div class="table-caption">
          Table 5: Feature comparison demonstrating institutional capability without recurring fees or privacy leakage.
        </div>
      </div>

    </div>

    <!-- ==================== COLUMN 3 (Balanced Rigorous Analysis) ==================== -->
    <div class="col-block">

      <!-- Block 10: 30-Day Simulation Benchmark -->
      <div class="card-box theme-ruby">
        <div class="card-header">
          <span>10. 30-Day Simulation Benchmark</span>
          <span class="sec-badge">Trial Data</span>
        </div>
        <table class="academic-table">
          <thead>
            <tr>
              <th>Evaluation Parameter</th>
              <th>Static Unmanaged</th>
              <th>WealthOS Autonomous</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Simulation Duration</td>
              <td class="num">43,200 Ticks</td>
              <td class="num highlight">43,200 Ticks</td>
            </tr>
            <tr>
              <td>Initial Capital Reserve</td>
              <td class="num">INR 10,00,000</td>
              <td class="num">INR 10,00,000</td>
            </tr>
            <tr>
              <td>Final Portfolio Net Worth</td>
              <td class="num">INR 10,48,250 (+4.8%)</td>
              <td class="num highlight">INR 11,24,680 (+12.5%)</td>
            </tr>
            <tr>
              <td>Maximum Allocation Drift</td>
              <td class="num" style="color:#DC2626; font-weight:700;">8.92% Peak</td>
              <td class="num highlight">0.58% Peak</td>
            </tr>
            <tr>
              <td>Mean Absolute Drift</td>
              <td class="num">3.41%</td>
              <td class="num highlight">0.14%</td>
            </tr>
            <tr>
              <td>Drift Reduction Ratio</td>
              <td class="num">Baseline (0.0%)</td>
              <td class="num optimal">85.6% Suppression</td>
            </tr>
            <tr>
              <td>Annualized Sharpe Ratio</td>
              <td class="num">1.14</td>
              <td class="num highlight">1.82 (+59.6% Alpha)</td>
            </tr>
            <tr>
              <td>Maximum Drawdown (MDD)</td>
              <td class="num" style="color:#DC2626; font-weight:700;">-14.2%</td>
              <td class="num highlight">-4.8% Dampened</td>
            </tr>
            <tr>
              <td>Vector Calculation Latency</td>
              <td class="num">N/A</td>
              <td class="num">0.0084 ms (8.4 &mu;s)</td>
            </tr>
            <tr>
              <td>Ledger Commit Latency</td>
              <td class="num">N/A</td>
              <td class="num">1.24 ms Atomic</td>
            </tr>
          </tbody>
        </table>
        <div class="table-caption">
          Table 3: Comprehensive 30-day continuous simulation results across 43,200 ticks.
        </div>
      </div>

      <!-- Block 11: Threshold Sensitivity Matrix -->
      <div class="card-box theme-tangerine">
        <div class="card-header">
          <span>11. Threshold Sensitivity Matrix (&theta;)</span>
          <span class="sec-badge">Calibration</span>
        </div>
        <table class="academic-table" id="sensitivity-table">
          <thead>
            <tr>
              <th>&theta; (%)</th>
              <th>Trades/Mo</th>
              <th>Mean Drift</th>
              <th>Suppression</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr data-theta="0.1">
              <td class="num">0.10%</td>
              <td class="num">412</td>
              <td class="num">0.04%</td>
              <td class="num">92.1%</td>
              <td style="color:#DC2626; font-weight:700;">High Churn</td>
            </tr>
            <tr data-theta="0.2">
              <td class="num">0.20%</td>
              <td class="num">184</td>
              <td class="num">0.08%</td>
              <td class="num">89.4%</td>
              <td>Sub-Optimal</td>
            </tr>
            <tr data-theta="0.4" class="optimal-row" style="background:{'#1E293B' if dark else '#FEF3C7'};">
              <td class="num highlight"><strong>0.40%</strong></td>
              <td class="num highlight"><strong>48</strong></td>
              <td class="num highlight"><strong>0.14%</strong></td>
              <td class="num highlight"><strong>85.6%</strong></td>
              <td class="highlight"><strong>Pareto Optimal</strong></td>
            </tr>
            <tr data-theta="0.6">
              <td class="num">0.60%</td>
              <td class="num">26</td>
              <td class="num">0.32%</td>
              <td class="num">74.2%</td>
              <td>Sluggish</td>
            </tr>
            <tr data-theta="0.8">
              <td class="num">0.80%</td>
              <td class="num">19</td>
              <td class="num">0.51%</td>
              <td class="num">62.8%</td>
              <td>Wide Corridor</td>
            </tr>
            <tr data-theta="1.0">
              <td class="num">1.00%</td>
              <td class="num">14</td>
              <td class="num">0.74%</td>
              <td class="num">49.1%</td>
              <td style="color:#DC2626; font-weight:700;">High Risk</td>
            </tr>
          </tbody>
        </table>
        <div class="table-caption">
          Table 4: Calibration matrix proving &theta; = 0.40% minimizes transactions while retaining 85.6% drift control.
        </div>
      </div>

      <!-- Block 12: Architecture & Code Audit -->
      <div class="card-box theme-audit">
        <div class="card-header">
          <span>12. Architecture &amp; Code Audit</span>
          <span class="sec-badge">Engineering Rigor</span>
        </div>
        <p class="prose-text">
          In contrast to speculative literature claiming multi-agent LLM consensus for financial transactions, an objective code audit reveals why WealthOS cleanly segregates duties:
        </p>
        <ul style="font-size:10.2px; color:{main_text}; line-height:1.42; margin-left:14px; margin-top:2px;">
          <li style="margin-bottom:3px;">
            <strong>Deterministic Sizing:</strong> Mathematical vector evaluation executes in <strong>0.0084 ms</strong> with zero hallucination risk, guaranteeing strict compliance with Modern Portfolio Theory.
          </li>
          <li style="margin-bottom:3px;">
            <strong>Generative AI Co-Pilot:</strong> Google Gemini 2.5 Flash and local Ollama are utilized strictly for natural language query answering and post-hoc audit narration.
          </li>
          <li>
            <strong>100% Client Isolation:</strong> Financial balances and private transaction histories reside strictly in the browser sandbox, completely eliminating cloud exposure.
          </li>
        </ul>
      </div>

      <!-- Block 13: Acknowledgments to Dr. G. Latha -->
      <div class="card-box theme-amethyst">
        <div class="card-header">
          <span>13. Acknowledgments &amp; Mentorship</span>
          <span class="sec-badge">Support</span>
        </div>
        <p class="prose-text">
          The student investigators express deep gratitude to our esteemed guide <strong>Dr. G. Latha</strong> (Associate Professor, Department of Cyber Security) for invaluable technical supervision, quantitative modeling mentorship, and security architecture guidance throughout the capstone project.
        </p>
        <p class="prose-text" style="margin-top:2px;">
          We gratefully acknowledge the <strong>Department of Cyber Security</strong> and the <strong>School of Engineering, Malla Reddy University</strong> for providing laboratory computing infrastructure. We also acknowledge public telemetry providers: CoinGecko, AMFI/MFAPI, MCX Bullion, and Metals.dev.
        </p>
      </div>

      <!-- Block 14: Conclusion & Roadmap -->
      <div class="card-box theme-royalgold">
        <div class="card-header">
          <span>14. Conclusion &amp; Roadmap</span>
          <span class="sec-badge">Summary</span>
        </div>
        <p class="prose-text">
          WealthOS demonstrates that institutional-quality portfolio rebalancing can be executed entirely client-side. Across 43,200 observation ticks, the deterministic corridor engine curbed portfolio drift by 85.6% and enhanced Sharpe ratio by 59.6% at sub-millisecond execution speeds.
        </p>
        <p class="prose-text" style="margin-top:2px;">
          <strong>Future Work:</strong> Connecting OAuth2 SEBI broker bridges (Zerodha Kite Connect), integrating Section 112A automated tax-loss harvesting, and deploying OS-level background service workers.
        </p>
      </div>

    </div>

  </main>

</div>

<script>
  function updateSimulation(val) {{
    const theta = parseFloat(val).toFixed(2);
    document.getElementById('theta-val').innerText = theta + '%';
    
    let trades = Math.round(48 * Math.pow(0.4 / theta, 1.3));
    let suppression = (85.6 - (theta - 0.4) * 55).toFixed(1);
    if (suppression > 94.0) suppression = "94.0";
    if (suppression < 45.0) suppression = "45.0";

    document.getElementById('sim-trades').innerText = trades;
    document.getElementById('sim-suppression').innerText = suppression + '%';

    const rows = document.querySelectorAll('#sensitivity-table tbody tr');
    rows.forEach(r => {{
      const rowTheta = parseFloat(r.getAttribute('data-theta'));
      if (Math.abs(rowTheta - parseFloat(theta)) < 0.12) {{
        r.style.background = '{'#1E293B' if dark else '#FEF3C7'}';
      }} else {{
        r.style.background = 'transparent';
      }}
    }});
  }}
</script>

</body>
</html>
"""
    return html

def main():
    edge_exe = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    has_edge = os.path.exists(edge_exe)
    
    try:
        import fitz
        has_fitz = True
    except ImportError:
        has_fitz = False

    print("Generating 5 distinct academic posters...")
    
    generated_files = []

    for theme in THEMES:
        tid = theme["id"]
        html_file = os.path.join(WORKSPACE_DIR, f"{tid}.html")
        pdf_file = os.path.join(WORKSPACE_DIR, f"{tid}.pdf")
        png_file = os.path.join(WORKSPACE_DIR, f"{tid}.png")

        html_code = generate_poster_html(theme)
        with open(html_file, "w", encoding="utf-8") as f:
            f.write(html_code)
        print(f"[{theme['name']}] HTML written -> {html_file}")

        if has_edge:
            cmd_pdf = [
                edge_exe,
                "--headless",
                "--disable-gpu",
                f"--print-to-pdf={pdf_file}",
                "--no-pdf-header-footer",
                html_file
            ]
            subprocess.run(cmd_pdf, capture_output=True, text=True)
            if os.path.exists(pdf_file):
                print(f"[{theme['name']}] PDF rendered -> {pdf_file}")
                
                if has_fitz:
                    doc = fitz.open(pdf_file)
                    page = doc[0]
                    pix = page.get_pixmap(dpi=200)
                    pix.save(png_file)
                    print(f"[{theme['name']}] 200 DPI PNG rendered ({pix.width}x{pix.height}) -> {png_file}")
                else:
                    cmd_png = [
                        edge_exe,
                        "--headless",
                        "--disable-gpu",
                        "--hide-scrollbars",
                        f"--screenshot={png_file}",
                        "--window-size=1420,2000",
                        html_file
                    ]
                    subprocess.run(cmd_png, capture_output=True, text=True)
                    print(f"[{theme['name']}] PNG rendered via Edge -> {png_file}")

        generated_files.append((tid, theme["name"], html_file, pdf_file, png_file))

    # Also update the primary default files to theme 1 (Clean Academic White)
    default_html = os.path.join(WORKSPACE_DIR, "wealthos_research_poster.html")
    default_pdf = os.path.join(WORKSPACE_DIR, "wealthos_research_poster.pdf")
    default_png = os.path.join(WORKSPACE_DIR, "wealthos_research_poster.png")
    
    shutil.copyfile(os.path.join(WORKSPACE_DIR, "poster_1_clean_white.html"), default_html)
    if os.path.exists(os.path.join(WORKSPACE_DIR, "poster_1_clean_white.pdf")):
        shutil.copyfile(os.path.join(WORKSPACE_DIR, "poster_1_clean_white.pdf"), default_pdf)
    if os.path.exists(os.path.join(WORKSPACE_DIR, "poster_1_clean_white.png")):
        shutil.copyfile(os.path.join(WORKSPACE_DIR, "poster_1_clean_white.png"), default_png)
    
    print("\nALL 5 POSTER VARIATIONS GENERATED SUCCESSFULLY!")

if __name__ == "__main__":
    main()
