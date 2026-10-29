"""
replace_sentinel_in_place.py
Directly transforms SentinelAI_Documentation (1).docx in-place:
Preserves the EXACT layout, styles, fonts, margins, headers, footers, section breaks,
and table formats while replacing all content with WealthOS content, resolving all
indexing errors, character encoding glitches, and inserting real diagrams & screenshots.
"""

import os
import sys
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH

def set_para_clean(p, text, bold_prefix=None):
    """Replaces paragraph text while preserving style."""
    p.text = ""
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        r_pre.bold = True
    r = p.add_run(text)
    return p

print("Loaded helper.")
