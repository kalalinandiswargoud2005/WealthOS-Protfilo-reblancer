import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches
import os

os.makedirs('generated_figures', exist_ok=True)

# -------------------------------------------------------------
# FIG 1: OVERALL ARCHITECTURE DIAGRAM
# -------------------------------------------------------------
def create_fig1():
    fig, ax = plt.subplots(figsize=(6, 5.5), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    accent_blue = '#2563eb'
    accent_purple = '#7c3aed'
    accent_green = '#059669'

    # Outer Container
    outer = patches.FancyBboxPatch((2, 2), 96, 96, boxstyle="round,pad=1", edgecolor='#94a3b8', facecolor='#ffffff', linewidth=1.2, linestyle='--')
    ax.add_patch(outer)
    ax.text(50, 95.5, "WealthOS Multi-Agent & Data Architecture", ha='center', va='center', fontsize=10, fontweight='bold', color='#0f172a')

    # Layer 1: External Data Aggregator
    l1 = patches.FancyBboxPatch((6, 75), 88, 16, boxstyle="round,pad=0.5", edgecolor=accent_blue, facecolor='#eff6ff', linewidth=1.2)
    ax.add_patch(l1)
    ax.text(50, 87, "Layer 1: Multi-Asset Real-Time Data Ingestion Engine", ha='center', va='center', fontsize=8.5, fontweight='bold', color='#1e40af')
    
    apis = ["CoinGecko API\n(Crypto Feed)", "MFAPI.in REST\n(Mutual Funds)", "Metals.dev API\n(Gold/Silver)", "ER-API / Forex\n(USD / INR)"]
    for i, api in enumerate(apis):
        sub = patches.Rectangle((8 + i*21.5, 76.5), 20, 8, edgecolor='#60a5fa', facecolor='#ffffff', linewidth=0.8)
        ax.add_patch(sub)
        ax.text(18 + i*21.5, 80.5, api, ha='center', va='center', fontsize=6.5, color='#1e293b', multialignment='center')

    # Layer 2: Central State Machine & Volatility Simulator
    l2 = patches.FancyBboxPatch((6, 44), 88, 26, boxstyle="round,pad=0.5", edgecolor=accent_purple, facecolor='#f5f3ff', linewidth=1.2)
    ax.add_patch(l2)
    ax.text(50, 66.5, "Layer 2: Reactive State Machine (React 19 Context + LocalStorage)", ha='center', va='center', fontsize=8.5, fontweight='bold', color='#5b21b6')

    modules = [
        ("Portfolio State Store\n16 Assets across 4 Classes\nTarget vs Current Weights", 8, 46.5, 26, 17),
        ("Market Volatility Engine\n3-Second Random-Walk Tick\nDrift Math: Di = |wi - w*|", 37, 46.5, 26, 17),
        ("Autonomous Daemon\n25-Second Periodic Loop\nThreshold: Delta > 0.4%", 66, 46.5, 26, 17)
    ]
    for title, x, y, w, h in modules:
        m_box = patches.Rectangle((x, y), w, h, edgecolor='#c084fc', facecolor='#ffffff', linewidth=0.8)
        ax.add_patch(m_box)
        ax.text(x + w/2, y + h/2, title, ha='center', va='center', fontsize=6.2, color='#1e293b', multialignment='center')

    # Layer 3: Decision & Execution Layer
    l3 = patches.FancyBboxPatch((6, 6), 88, 33, boxstyle="round,pad=0.5", edgecolor=accent_green, facecolor='#f0fdf4', linewidth=1.2)
    ax.add_patch(l3)
    ax.text(50, 36, "Layer 3: Agentic Intelligence & Execution Pipeline", ha='center', va='center', fontsize=8.5, fontweight='bold', color='#166534')

    exec_components = [
        ("Edge LLM Reasoning\nOllama (Qwen 2.5 / Llama)\nZero-Cloud Data Privacy", 8, 9, 26, 23),
        ("Order Routing Engine\nBalance Verification\nProportional Cash Allocation", 37, 9, 26, 23),
        ("Audit & Settlement\nImmutable Transaction Ledger\nChain-of-Thought Auditing", 66, 9, 26, 23)
    ]
    for title, x, y, w, h in exec_components:
        c_box = patches.Rectangle((x, y), w, h, edgecolor='#4ade80', facecolor='#ffffff', linewidth=0.8)
        ax.add_patch(c_box)
        ax.text(x + w/2, y + h/2, title, ha='center', va='center', fontsize=6.2, color='#1e293b', multialignment='center')

    # Arrows connecting layers
    ax.annotate("", xy=(50, 71.5), xytext=(50, 74.5), arrowprops=dict(arrowstyle="->", lw=1.2, color='#2563eb'))
    ax.annotate("", xy=(50, 40.5), xytext=(50, 43.5), arrowprops=dict(arrowstyle="->", lw=1.2, color='#7c3aed'))
    ax.annotate("", xy=(21, 40.5), xytext=(21, 43.5), arrowprops=dict(arrowstyle="->", lw=1.2, color='#7c3aed'))
    ax.annotate("", xy=(79, 40.5), xytext=(79, 43.5), arrowprops=dict(arrowstyle="->", lw=1.2, color='#7c3aed'))

    plt.tight_layout()
    plt.savefig('generated_figures/fig1_architecture.png', dpi=300, bbox_inches='tight')
    plt.close()
    print("Created fig1_architecture.png")

# -------------------------------------------------------------
# FIG 2: LEVEL-0 / LEVEL-1 DFD DIAGRAM
# -------------------------------------------------------------
def create_fig2():
    fig, ax = plt.subplots(figsize=(6, 4.5), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    # External Entities (Rectangles)
    investor = patches.Rectangle((4, 68), 18, 18, edgecolor='#0f172a', facecolor='#f1f5f9', linewidth=1.2)
    ax.add_patch(investor)
    ax.text(13, 77, "Retail\nInvestor", ha='center', va='center', fontsize=7.5, fontweight='bold')

    apis = patches.Rectangle((4, 14), 18, 18, edgecolor='#0f172a', facecolor='#f1f5f9', linewidth=1.2)
    ax.add_patch(apis)
    ax.text(13, 23, "External\nFinancial APIs", ha='center', va='center', fontsize=7.5, fontweight='bold')

    # Core Process (Circle / Ellipse)
    p0 = patches.Circle((50, 50), 19, edgecolor='#2563eb', facecolor='#eff6ff', linewidth=1.5)
    ax.add_patch(p0)
    ax.text(50, 53, "0.0\nWealthOS\nAutonomous", ha='center', va='center', fontsize=8, fontweight='bold', color='#1e40af')
    ax.text(50, 41, "Rebalancer", ha='center', va='center', fontsize=8, fontweight='bold', color='#1e40af')

    # Data Stores (Open-ended parallel lines)
    p_store = patches.FancyBboxPatch((76, 68), 20, 18, boxstyle="round,pad=0.2", edgecolor='#7c3aed', facecolor='#faf5ff', linewidth=1.2)
    ax.add_patch(p_store)
    ax.text(86, 77, "D1: Portfolio &\nTarget Weights", ha='center', va='center', fontsize=7, fontweight='bold', color='#5b21b6')

    l_store = patches.FancyBboxPatch((76, 14), 20, 18, boxstyle="round,pad=0.2", edgecolor='#059669', facecolor='#f0fdf4', linewidth=1.2)
    ax.add_patch(l_store)
    ax.text(86, 23, "D2: Transaction &\nAudit Ledger", ha='center', va='center', fontsize=7, fontweight='bold', color='#166534')

    # Connecting Flow Arrows
    ax.annotate("Set Target Weights /\nDeposit Cash", xy=(32, 60), xytext=(22, 73),
                arrowprops=dict(arrowstyle="->", lw=1, color='#0f172a'), fontsize=6.2)
    ax.annotate("Audit Log &\nPortfolio Alerts", xy=(22, 69), xytext=(33, 56),
                arrowprops=dict(arrowstyle="->", lw=1, color='#0f172a'), fontsize=6.2)

    ax.annotate("Live Market Ticks\n(Crypto, NAV, Forex)", xy=(32, 42), xytext=(22, 27),
                arrowprops=dict(arrowstyle="->", lw=1, color='#2563eb'), fontsize=6.2)

    ax.annotate("Drift Recalculation", xy=(76, 75), xytext=(67, 60),
                arrowprops=dict(arrowstyle="<->", lw=1, color='#7c3aed'), fontsize=6.2)

    ax.annotate("Immutable Order\nCommit", xy=(76, 25), xytext=(67, 42),
                arrowprops=dict(arrowstyle="->", lw=1, color='#059669'), fontsize=6.2)

    plt.tight_layout()
    plt.savefig('generated_figures/fig2_dfd.png', dpi=300, bbox_inches='tight')
    plt.close()
    print("Created fig2_dfd.png")

# -------------------------------------------------------------
# FIG 3: UML CLASS DIAGRAM
# -------------------------------------------------------------
def create_fig3():
    fig, ax = plt.subplots(figsize=(6, 5.2), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    def draw_class(x, y, w, h, title, attrs, methods, color):
        hdr_h = 4.5
        box = patches.Rectangle((x, y), w, h, edgecolor=color, facecolor='#ffffff', linewidth=1)
        ax.add_patch(box)
        hdr = patches.Rectangle((x, y + h - hdr_h), w, hdr_h, edgecolor=color, facecolor=color, linewidth=1)
        ax.add_patch(hdr)
        ax.text(x + w/2, y + h - hdr_h/2, title, ha='center', va='center', fontsize=6.8, fontweight='bold', color='#ffffff')
        
        curr_y = y + h - hdr_h - 2
        for attr in attrs:
            ax.text(x + 1.5, curr_y, attr, ha='left', va='center', fontsize=5.6, color='#1e293b')
            curr_y -= 2.6
        
        sep_line = curr_y - 0.5
        ax.plot([x, x + w], [sep_line, sep_line], color='#cbd5e1', lw=0.6)
        curr_y = sep_line - 2
        
        for meth in methods:
            ax.text(x + 1.5, curr_y, meth, ha='left', va='center', fontsize=5.6, color='#0f172a', fontstyle='italic')
            curr_y -= 2.6

    draw_class(4, 52, 43, 44, "PortfolioContext", 
               ["- assets: AssetHolding[]", "- cashBalance: float", "- driftIndex: float", "- investMode: enum", "- targetAllocation: Map"],
               ["+ calculateDrift(): float", "+ executeAutoRebalance()", "+ updatePrice(id, price)", "+ setInvestMode(mode)"], '#1e3a8a')

    draw_class(53, 52, 43, 44, "AssetHolding",
               ["+ id: string", "+ name: string", "+ category: AssetClass", "+ quantity: float", "+ currentPrice: float", "+ targetWeight: float"],
               ["+ getMarketValue(): float", "+ getWeight(): float", "+ getDrift(): float"], '#065f46')

    draw_class(4, 4, 43, 42, "RebalanceAgent",
               ["- threshold: float = 0.4%", "- scanInterval: int = 25s", "- llmModel: string", "- executionHistory: List"],
               ["+ evaluateDrift(): Order[]", "+ callOllamaReasoner(): Plan", "+ dispatchOrder(order): bool", "+ logAuditTrail()"], '#7c2d12')

    draw_class(53, 4, 43, 42, "AuditLedger",
               ["- transactionId: UUID", "- timestamp: DateTime", "- assetId: string", "- amount: float", "- reasoningTrace: string"],
               ["+ recordTrade(order)", "+ exportPDFStatement(): File", "+ getImmutableHistory()"], '#4c1d95')

    ax.annotate("", xy=(53, 74), xytext=(47, 74), arrowprops=dict(arrowstyle="->", lw=1, color='#1e293b'))
    ax.text(50, 76, "1..*", ha='center', fontsize=6, fontweight='bold')

    ax.annotate("", xy=(25, 52), xytext=(25, 46), arrowprops=dict(arrowstyle="->", lw=1, color='#1e293b'))
    ax.text(28, 49, "triggers", ha='left', fontsize=6, fontstyle='italic')

    ax.annotate("", xy=(53, 25), xytext=(47, 25), arrowprops=dict(arrowstyle="->", lw=1, color='#1e293b'))
    ax.text(50, 27, "logs to", ha='center', fontsize=6, fontstyle='italic')

    plt.tight_layout()
    plt.savefig('generated_figures/fig3_class_diagram.png', dpi=300, bbox_inches='tight')
    plt.close()
    print("Created fig3_class_diagram.png")

# -------------------------------------------------------------
# FIG 4: UML USE CASE DIAGRAM
# -------------------------------------------------------------
def create_fig4():
    fig, ax = plt.subplots(figsize=(6, 4.8), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    sys_box = patches.Rectangle((24, 4), 52, 92, edgecolor='#2563eb', facecolor='#f8fafc', linewidth=1.2, linestyle='--')
    ax.add_patch(sys_box)
    ax.text(50, 92, "WealthOS Platform Boundary", ha='center', va='center', fontsize=7.5, fontweight='bold', color='#1e40af')

    uc_list = [
        ("UC1: Set Target Asset Weights", 50, 81),
        ("UC2: View Real-Time Market Ticks", 50, 68),
        ("UC3: Continuous Drift Detection", 50, 55),
        ("UC4: Autonomous Trade Rebalancing", 50, 42),
        ("UC5: Query Financial AI Assistant", 50, 29),
        ("UC6: Download Audit & PDF Statement", 50, 16)
    ]
    for text, cx, cy in uc_list:
        ell = patches.Ellipse((cx, cy), 46, 9.5, edgecolor='#0284c7', facecolor='#ffffff', linewidth=1)
        ax.add_patch(ell)
        ax.text(cx, cy, text, ha='center', va='center', fontsize=6.3, fontweight='bold', color='#0f172a')

    def draw_actor(x, y, name):
        ax.plot([x], [y+5], 'o', color='#0f172a', markersize=6)
        ax.plot([x, x], [y+4, y], color='#0f172a', lw=1.2)
        ax.plot([x-3, x+3], [y+2.5, y+2.5], color='#0f172a', lw=1.2)
        ax.plot([x, x-3], [y, y-4], color='#0f172a', lw=1.2)
        ax.plot([x, x+3], [y, y-4], color='#0f172a', lw=1.2)
        ax.text(x, y-7, name, ha='center', va='center', fontsize=6.8, fontweight='bold', color='#0f172a')

    draw_actor(12, 60, "Retail\nInvestor")
    draw_actor(88, 60, "Autonomous\nAI Agent")
    draw_actor(88, 22, "External Market\nAPIs")

    for cy in [81, 68, 29, 16]:
        ax.plot([14, 27], [60, cy], color='#64748b', lw=0.9)

    for cy in [55, 42, 29]:
        ax.plot([86, 73], [60, cy], color='#64748b', lw=0.9)

    ax.plot([86, 73], [22, 68], color='#64748b', lw=0.9)

    plt.tight_layout()
    plt.savefig('generated_figures/fig4_use_case.png', dpi=300, bbox_inches='tight')
    plt.close()
    print("Created fig4_use_case.png")

# -------------------------------------------------------------
# FIG 5: UML SEQUENCE DIAGRAM
# -------------------------------------------------------------
def create_fig5():
    fig, ax = plt.subplots(figsize=(6, 5.5), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    lifelines = [
        ("MarketSimulator", 12),
        ("PortfolioContext", 37),
        ("RebalanceAgent", 63),
        ("AuditLedger", 88)
    ]

    for name, x in lifelines:
        box = patches.Rectangle((x-10, 92), 20, 6, edgecolor='#1e293b', facecolor='#f1f5f9', lw=1)
        ax.add_patch(box)
        ax.text(x, 95, name, ha='center', va='center', fontsize=6.4, fontweight='bold')
        ax.plot([x, x], [8, 92], color='#94a3b8', lw=0.8, linestyle='--')

    steps = [
        (84, 12, 37, "1: 3s Price Tick (Volatility)", True),
        (76, 37, 37, "2: Recalculate Drift Index Di", False),
        (67, 63, 37, "3: 25s Trigger: Read Drift", True, True),
        (58, 37, 63, "4: Return Current & Target Weights", True),
        (50, 63, 63, "5: Evaluate: Is Drift > 0.4%? [YES]", False),
        (42, 63, 37, "6: Execute Trade (Buy Under-allocated)", True),
        (34, 37, 37, "7: Deduct Cash, Update Asset Holdings", False),
        (25, 37, 88, "8: Write Transaction & Chain-of-Thought", True),
        (16, 88, 37, "9: Acknowledge Immutable Entry", True, True)
    ]

    for step in steps:
        if len(step) == 5:
            y, x1, x2, label, is_arrow = step
            is_return = False
        else:
            y, x1, x2, label, is_arrow, is_return = step

        if x1 == x2:
            ax.annotate("", xy=(x1, y-3), xytext=(x1+6, y), arrowprops=dict(arrowstyle="->", lw=0.9, color='#0f172a'))
            ax.plot([x1, x1+6], [y, y], color='#0f172a', lw=0.9)
            ax.plot([x1+6, x1+6], [y, y-3], color='#0f172a', lw=0.9)
            ax.text(x1+7, y-1.5, label, ha='left', va='center', fontsize=5.8, color='#0f172a', fontstyle='italic')
        else:
            style = "<-" if is_return else "->"
            ax.annotate("", xy=(x2, y), xytext=(x1, y), arrowprops=dict(arrowstyle=style, lw=1, color='#2563eb' if not is_return else '#64748b'))
            ax.text((x1+x2)/2, y+2, label, ha='center', va='bottom', fontsize=5.8, color='#0f172a', fontweight='bold' if not is_return else 'normal')

    plt.tight_layout()
    plt.savefig('generated_figures/fig5_sequence.png', dpi=300, bbox_inches='tight')
    plt.close()
    print("Created fig5_sequence.png")

# -------------------------------------------------------------
# FIG 6: UML ACTIVITY DIAGRAM
# -------------------------------------------------------------
def create_fig6():
    fig, ax = plt.subplots(figsize=(6, 5.5), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    start = patches.Circle((50, 95), 2.5, color='#0f172a')
    ax.add_patch(start)

    def draw_activity(x, y, w, h, text, color='#eff6ff', border='#2563eb'):
        box = patches.FancyBboxPatch((x-w/2, y-h/2), w, h, boxstyle="round,pad=0.3", edgecolor=border, facecolor=color, lw=1)
        ax.add_patch(box)
        ax.text(x, y, text, ha='center', va='center', fontsize=6.2, fontweight='bold', color='#0f172a', multialignment='center')

    def draw_diamond(x, y, size, text):
        pts = [(x, y+size), (x+size*1.3, y), (x, y-size), (x-size*1.3, y)]
        diamond = patches.Polygon(pts, edgecolor='#d97706', facecolor='#fffbeb', lw=1)
        ax.add_patch(diamond)
        ax.text(x, y, text, ha='center', va='center', fontsize=5.8, fontweight='bold', color='#92400e', multialignment='center')

    ax.annotate("", xy=(50, 89), xytext=(50, 92.5), arrowprops=dict(arrowstyle="->", lw=1))
    draw_activity(50, 85, 48, 7, "Fetch Market Prices & Tick Volatility Engine")

    ax.annotate("", xy=(50, 77.5), xytext=(50, 81.5), arrowprops=dict(arrowstyle="->", lw=1))
    draw_activity(50, 74, 48, 7, "Compute Portfolio Valuation & Drift Di")

    ax.annotate("", xy=(50, 66), xytext=(50, 70.5), arrowprops=dict(arrowstyle="->", lw=1))
    draw_diamond(50, 61, 4.8, "Drift Index\n> 0.4% ?")

    ax.plot([56.5, 84, 84, 50], [61, 61, 85, 85], color='#b45309', lw=0.9, linestyle=':')
    ax.annotate("", xy=(74, 85), xytext=(84, 85), arrowprops=dict(arrowstyle="->", lw=0.9, color='#b45309'))
    ax.text(64, 62.5, "[No: Maintain Holdings]", ha='left', fontsize=5.6, color='#b45309')

    ax.annotate("", xy=(50, 50.5), xytext=(50, 56.2), arrowprops=dict(arrowstyle="->", lw=1))
    ax.text(51, 53.5, "[Yes]", ha='left', fontsize=5.6, color='#0f172a', fontweight='bold')
    
    draw_diamond(50, 46, 4.5, "Invest Mode\n== Auto ?")

    ax.plot([43.5, 20, 20], [46, 46, 36], color='#b45309', lw=0.9)
    ax.annotate("", xy=(20, 36), xytext=(20, 46), arrowprops=dict(arrowstyle="->", lw=0.9, color='#b45309'))
    draw_activity(20, 31, 30, 7, "Display Suggested\nTrades to User", '#fef2f2', '#ef4444')

    ax.annotate("", xy=(50, 36), xytext=(50, 41.5), arrowprops=dict(arrowstyle="->", lw=1))
    ax.text(51, 38.5, "[Auto]", ha='left', fontsize=5.6, color='#0f172a', fontweight='bold')
    draw_activity(65, 31, 36, 7, "Select Most Under-Allocated Asset\n& Formulate Trade Order", '#f0fdf4', '#16a34a')

    ax.annotate("", xy=(50, 20), xytext=(65, 27.5), arrowprops=dict(arrowstyle="->", lw=1))
    ax.annotate("", xy=(50, 20), xytext=(20, 27.5), arrowprops=dict(arrowstyle="->", lw=1))
    draw_activity(50, 16, 50, 7, "Execute Settlement & Write Immutable Ledger Entry", '#faf5ff', '#7c3aed')

    ax.annotate("", xy=(50, 8), xytext=(50, 12.5), arrowprops=dict(arrowstyle="->", lw=1))
    end_outer = patches.Circle((50, 5), 3, edgecolor='#0f172a', facecolor='none', lw=1.2)
    end_inner = patches.Circle((50, 5), 1.8, color='#0f172a')
    ax.add_patch(end_outer)
    ax.add_patch(end_inner)

    plt.tight_layout()
    plt.savefig('generated_figures/fig6_activity.png', dpi=300, bbox_inches='tight')
    plt.close()
    print("Created fig6_activity.png")

create_fig1()
create_fig2()
create_fig3()
create_fig4()
create_fig5()
create_fig6()
print("ALL 6 DIAGRAMS GENERATED SUCCESSFULLY!")
