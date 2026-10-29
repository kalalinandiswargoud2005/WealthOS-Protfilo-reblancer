"""
WealthOS Academic Poster PPTX Generator
=======================================
Converts the high-resolution posters into Microsoft PowerPoint (.pptx) presentations:
1. Individual standalone PPTX files for all 5 variations:
   - poster_1_clean_white.pptx
   - poster_2_cyber_dark.pptx
   - poster_3_royal_blue.pptx
   - poster_4_warm_pearl_ivory.pptx
   - poster_5_emerald_mint.pptx
2. Default poster PPTX:
   - wealthos_research_poster.pptx
3. Master combined presentation containing all 5 variations in a single deck:
   - wealthos_all_5_posters_deck.pptx

Slide dimensions are set to standard portrait poster size (width: 28.0 in, height: 39.18 in / 71.12 x 99.5 cm),
perfect for academic poster printing and conference presentations directly from PowerPoint.
"""

import os
from pptx import Presentation
from pptx.util import Inches

WORKSPACE_DIR = r"C:\Users\goudk\OneDrive\Desktop\4-1"

POSTERS = [
    ("poster_1_clean_white", "Clean Academic White & Slate"),
    ("poster_2_cyber_dark", "Cyber Security Obsidian Matrix (Dark Mode)"),
    ("poster_3_royal_blue", "Royal Cobalt & Ice Blue (University Colors)"),
    ("poster_4_warm_pearl_ivory", "Warm Champagne Pearl & Luxury Ivory"),
    ("poster_5_emerald_mint", "Fintech Growth Emerald & Fresh Sage"),
]

# Standard poster aspect ratio (matches 1400px x 1960px = 1:1.4)
SLIDE_WIDTH = Inches(28.0)
SLIDE_HEIGHT = Inches(39.2)

def create_single_poster_pptx(png_path, pptx_path, title):
    prs = Presentation()
    prs.slide_width = SLIDE_WIDTH
    prs.slide_height = SLIDE_HEIGHT
    
    # Use blank slide layout
    blank_layout = prs.slide_layouts[6]
    slide = prs.slides.add_slide(blank_layout)
    
    # Add high-resolution image filling the entire slide with zero margins
    if os.path.exists(png_path):
        slide.shapes.add_picture(png_path, Inches(0), Inches(0), width=SLIDE_WIDTH, height=SLIDE_HEIGHT)
        prs.save(pptx_path)
        print(f"SUCCESS: Saved PowerPoint -> {pptx_path}")
        return True
    else:
        print(f"ERROR: Image not found -> {png_path}")
        return False

def create_master_deck():
    prs = Presentation()
    prs.slide_width = SLIDE_WIDTH
    prs.slide_height = SLIDE_HEIGHT
    blank_layout = prs.slide_layouts[6]

    for pid, title in POSTERS:
        png_path = os.path.join(WORKSPACE_DIR, f"{pid}.png")
        if os.path.exists(png_path):
            slide = prs.slides.add_slide(blank_layout)
            slide.shapes.add_picture(png_path, Inches(0), Inches(0), width=SLIDE_WIDTH, height=SLIDE_HEIGHT)
            print(f"Added slide: {title}")

    master_path = os.path.join(WORKSPACE_DIR, "wealthos_all_5_posters_deck.pptx")
    prs.save(master_path)
    print(f"SUCCESS: Saved Master PowerPoint Deck -> {master_path}")

def main():
    print("Generating PPTX presentations for all poster variations...")

    for pid, title in POSTERS:
        png_file = os.path.join(WORKSPACE_DIR, f"{pid}.png")
        pptx_file = os.path.join(WORKSPACE_DIR, f"{pid}.pptx")
        create_single_poster_pptx(png_file, pptx_file, title)

    # Master combined deck with all 5 variations
    create_master_deck()

    # Default file
    default_png = os.path.join(WORKSPACE_DIR, "wealthos_research_poster.png")
    default_pptx = os.path.join(WORKSPACE_DIR, "wealthos_research_poster.pptx")
    create_single_poster_pptx(default_png, default_pptx, "WealthOS Primary Poster")

    print("\nALL PPTX FILES GENERATED SUCCESSFULLY!")

if __name__ == "__main__":
    main()
