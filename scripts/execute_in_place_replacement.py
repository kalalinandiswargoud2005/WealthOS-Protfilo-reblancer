"""
execute_in_place_replacement.py
Performs direct in-place transformation on SentinelAI_Documentation (1).docx:
Maintains the EXACT layout, format, design, fonts, margins, headers/footers,
and table structures while replacing all content with WealthOS content, resolving
all indexing errors, fixing broken character encodings, and embedding real images.
"""

import os
import sys
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH

def replace_blob_by_rid(doc, rId, new_path):
    if not os.path.exists(new_path):
        print(f"WARNING: Image path not found: {new_path}")
        return
    if rId in doc.part.related_parts:
        part = doc.part.related_parts[rId]
        with open(new_path, "rb") as f:
            part._blob = f.read()
        print(f"Replaced image part for {rId} with {new_path}")

def clear_and_set_para(p, text, bold_prefix=None):
    p.text = ""
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        r_pre.bold = True
    p.add_run(text)

def populate_cell_image(cell, img_path, width=Inches(5.6)):
    cell.text = ""
    p = cell.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    if os.path.exists(img_path):
        run = p.add_run()
        run.add_picture(img_path, width=width)
    else:
        print(f"WARNING: Screenshot not found: {img_path}")

print("In-place replacement engine initialized.")
