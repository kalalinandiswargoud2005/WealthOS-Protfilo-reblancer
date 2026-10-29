"""
build_complete_documentation.py
Defines styling primitives, XML helpers, table formatting, callout boxes,
code blocks, image figures, and section/page numbering structures for WealthOS.
All typography, headings, borders, and table formatting are strictly BLACK (0, 0, 0)
with zero blue colors, adhering to strict academic publication standards.
"""

import os
import sys
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.enum.section import WD_SECTION_START
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

# STRICT MONOCHROME PALETTE: PURE BLACK FOR ALL TEXT, HEADINGS, AND BORDERS
COLOR_BLACK = RGBColor(0, 0, 0)
COLOR_WHITE = RGBColor(255, 255, 255)
HEX_BLACK = "000000"
HEX_WHITE = "FFFFFF"
HEX_LIGHT_GRAY = "F5F5F5"
HEX_ROW_ALT = "FAFAFA"
HEX_BORDER = "000000"

def set_cell_background(cell, hex_color):
    """Sets background color of a table cell."""
    tcPr = cell._element.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=140, right=140):
    """Sets cell padding in dxa (1 pt = 20 dxa)."""
    tcPr = cell._element.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}>'
                      f'<w:top w:w="{top}" w:type="dxa"/>'
                      f'<w:bottom w:w="{bottom}" w:type="dxa"/>'
                      f'<w:left w:w="{left}" w:type="dxa"/>'
                      f'<w:right w:w="{right}" w:type="dxa"/>'
                      f'</w:tcMar>')
    tcPr.append(tcMar)

def set_table_borders(table, color=HEX_BORDER, sz="6", val="single"):
    """Applies clean, solid black academic borders to a table."""
    tblPr = table._element.xpath('w:tblPr')
    if tblPr:
        borders = parse_xml(
            f'<w:tblBorders {nsdecls("w")}>'
            f'<w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
            f'<w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
            f'<w:insideH w:val="{val}" w:sz="4" w:space="0" w:color="CCCCCC"/>'
            f'<w:insideV w:val="none"/>'
            f'<w:left w:val="none"/>'
            f'<w:right w:val="none"/>'
            f'</w:tblBorders>'
        )
        tblPr[0].append(borders)

def make_row_header(row):
    """Marks a table row as a repeating header across page splits."""
    trPr = row._element.get_or_add_trPr()
    trPr.append(parse_xml(f'<w:tblHeader {nsdecls("w")}/>'))

def make_row_cant_split(row):
    """Prevents a table row from awkwardly breaking across pages."""
    trPr = row._element.get_or_add_trPr()
    trPr.append(parse_xml(f'<w:cantSplit {nsdecls("w")}/>'))

def add_page_number_field(run):
    """Inserts a native Word PAGE field into a text run."""
    fld1 = parse_xml(r'<w:fldChar %s w:fldCharType="begin"/>' % nsdecls('w'))
    instr = parse_xml(r'<w:instrText %s xml:space="preserve"> PAGE </w:instrText>' % nsdecls('w'))
    fld2 = parse_xml(r'<w:fldChar %s w:fldCharType="separate"/>' % nsdecls('w'))
    fld3 = parse_xml(r'<w:fldChar %s w:fldCharType="end"/>' % nsdecls('w'))
    run._r.append(fld1)
    run._r.append(instr)
    run._r.append(fld2)
    run._r.append(fld3)

def format_row(row, bg_color, is_header=False, bold=False, font_size=9.5, align=WD_ALIGN_PARAGRAPH.LEFT):
    make_row_cant_split(row)
    if is_header:
        make_row_header(row)
    for cell in row.cells:
        set_cell_background(cell, bg_color)
        set_cell_margins(cell, top=90, bottom=90, left=130, right=130)
        cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
        for p in cell.paragraphs:
            p.alignment = align
            p.paragraph_format.space_before = Pt(0)
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.05
            for r in p.runs:
                r.font.name = "Calibri"
                r.font.size = Pt(font_size)
                r.bold = bold
                if is_header:
                    r.font.color.rgb = COLOR_WHITE
                else:
                    r.font.color.rgb = COLOR_BLACK

def setup_cover_section(doc):
    """Configures Section 1 (Cover Page) with no headers or footers."""
    sec1 = doc.sections[0]
    sec1.page_width = Inches(8.27)
    sec1.page_height = Inches(11.69)
    sec1.top_margin = Inches(1.0)
    sec1.bottom_margin = Inches(1.0)
    sec1.left_margin = Inches(1.15)
    sec1.right_margin = Inches(1.0)
    sec1.different_first_page_header_footer = True
    
    # Ensure header & footer are empty
    hdr = sec1.header
    for p in hdr.paragraphs:
        p.text = ""
    ftr = sec1.footer
    for p in ftr.paragraphs:
        p.text = ""
    return sec1

def add_prelims_section(doc):
    """Creates Section 2 for Preliminary Pages with Roman numeral page numbering."""
    sec2 = doc.add_section(WD_SECTION_START.NEW_PAGE)
    sec2.page_width = Inches(8.27)
    sec2.page_height = Inches(11.69)
    sec2.top_margin = Inches(1.0)
    sec2.bottom_margin = Inches(1.0)
    sec2.left_margin = Inches(1.15)
    sec2.right_margin = Inches(1.0)
    sec2.header.is_linked_to_previous = False
    sec2.footer.is_linked_to_previous = False
    
    # Empty header for clean academic front matter
    hdr = sec2.header
    for p in hdr.paragraphs:
        p.text = ""
        
    # Roman page numbering starting at ii (since Cover is i)
    sectPr2 = sec2._sectPr
    pgNumType2 = parse_xml(r'<w:pgNumType %s w:fmt="lowerRoman" w:start="2"/>' % nsdecls('w'))
    sectPr2.append(pgNumType2)
    
    # Footer: Centered Roman page number strictly black
    p_ftr = sec2.footer.paragraphs[0]
    p_ftr.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_ftr.paragraph_format.space_before = Pt(4)
    r_ftr = p_ftr.add_run()
    r_ftr.font.name = "Calibri"
    r_ftr.font.size = Pt(9.5)
    r_ftr.font.color.rgb = COLOR_BLACK
    add_page_number_field(r_ftr)
    return sec2

def add_body_section(doc):
    """Creates Section 3 for Main Chapters with Arabic numerals starting at 1."""
    sec3 = doc.add_section(WD_SECTION_START.NEW_PAGE)
    sec3.page_width = Inches(8.27)
    sec3.page_height = Inches(11.69)
    sec3.top_margin = Inches(1.0)
    sec3.bottom_margin = Inches(1.0)
    sec3.left_margin = Inches(1.15)
    sec3.right_margin = Inches(1.0)
    sec3.header.is_linked_to_previous = False
    sec3.footer.is_linked_to_previous = False
    
    # Arabic numbering starting at 1
    sectPr3 = sec3._sectPr
    pgNumType3 = parse_xml(r'<w:pgNumType %s w:fmt="decimal" w:start="1"/>' % nsdecls('w'))
    sectPr3.append(pgNumType3)
    
    # Running Header: strictly black
    p_hdr = sec3.header.paragraphs[0]
    p_hdr.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p_hdr.paragraph_format.space_after = Pt(0)
    r_hdr = p_hdr.add_run("WealthOS: Autonomous Multi-Asset Portfolio Rebalancing Platform | Major Project Report")
    r_hdr.font.name = "Calibri"
    r_hdr.font.size = Pt(8.5)
    r_hdr.font.italic = True
    r_hdr.font.color.rgb = COLOR_BLACK
    
    # Running Footer: Left institution, Right page number - strictly black
    p_ftr = sec3.footer.paragraphs[0]
    p_ftr.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p_ftr.paragraph_format.space_before = Pt(4)
    r_inst = p_ftr.add_run("Department of CSE (Cyber Security) • Malla Reddy University")
    r_inst.font.name = "Calibri"
    r_inst.font.size = Pt(8.5)
    r_inst.font.color.rgb = COLOR_BLACK
    
    # Tab stop for right-aligned page number
    r_tab = p_ftr.add_run("\t\tPage ")
    r_tab.font.name = "Calibri"
    r_tab.font.size = Pt(8.5)
    r_tab.font.color.rgb = COLOR_BLACK
    
    r_num = p_ftr.add_run()
    r_num.font.name = "Calibri"
    r_num.font.size = Pt(8.5)
    r_num.bold = True
    r_num.font.color.rgb = COLOR_BLACK
    add_page_number_field(r_num)
    return sec3

def add_callout(doc, text, title="KEY ARCHITECTURAL HIGHLIGHT"):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = tbl.rows[0].cells[0]
    cell.width = Inches(6.12)
    set_cell_background(cell, HEX_LIGHT_GRAY)
    set_cell_margins(cell, top=130, bottom=130, left=170, right=170)
    
    tcPr = cell._element.get_or_add_tcPr()
    borders = parse_xml(
        f'<w:tcBorders {nsdecls("w")}>'
        f'<w:top w:val="none"/>'
        f'<w:left w:val="single" w:sz="24" w:space="0" w:color="000000"/>'
        f'<w:bottom w:val="none"/>'
        f'<w:right w:val="none"/>'
        f'</w:tcBorders>'
    )
    tcPr.append(borders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1.15
    r_title = p.add_run(f"[{title}]\n")
    r_title.bold = True
    r_title.font.name = "Calibri"
    r_title.font.size = Pt(10.5)
    r_title.font.color.rgb = COLOR_BLACK
    
    r_body = p.add_run(text)
    r_body.italic = True
    r_body.font.name = "Calibri"
    r_body.font.size = Pt(10)
    r_body.font.color.rgb = COLOR_BLACK
    
    p_spacer = doc.add_paragraph()
    p_spacer.paragraph_format.space_before = Pt(0)
    p_spacer.paragraph_format.space_after = Pt(4)

def add_heading_1(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(16)
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.keep_with_next = True
    r = p.add_run(text)
    r.bold = True
    r.font.name = "Calibri"
    r.font.size = Pt(15.5)
    r.font.color.rgb = COLOR_BLACK
    return p

def add_heading_2(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(12)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.keep_with_next = True
    r = p.add_run(text)
    r.bold = True
    r.font.name = "Calibri"
    r.font.size = Pt(13)
    r.font.color.rgb = COLOR_BLACK
    return p

def add_heading_3(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(9)
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.keep_with_next = True
    r = p.add_run(text)
    r.bold = True
    r.font.name = "Calibri"
    r.font.size = Pt(11.5)
    r.font.color.rgb = COLOR_BLACK
    return p

def add_body(doc, text, bold_prefix=None, space_after=5):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.line_spacing = 1.15
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        r_pre.bold = True
        r_pre.font.name = "Calibri"
        r_pre.font.size = Pt(11)
        r_pre.font.color.rgb = COLOR_BLACK
    r = p.add_run(text)
    r.font.name = "Calibri"
    r.font.size = Pt(11)
    r.font.color.rgb = COLOR_BLACK
    return p

def add_bullet(doc, bold_prefix, text):
    p = doc.add_paragraph(style='List Bullet')
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(3.5)
    p.paragraph_format.line_spacing = 1.15
    r_pre = p.add_run(bold_prefix + " ")
    r_pre.bold = True
    r_pre.font.name = "Calibri"
    r_pre.font.size = Pt(10.5)
    r_pre.font.color.rgb = COLOR_BLACK
    
    r = p.add_run(text)
    r.font.name = "Calibri"
    r.font.size = Pt(10.5)
    r.font.color.rgb = COLOR_BLACK
    return p

def add_image_figure(doc, img_path, caption, width=Inches(5.3)):
    if not os.path.exists(img_path):
        print(f"WARNING: Image not found: {img_path}")
        return
    p_img = doc.add_paragraph()
    p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_img.paragraph_format.space_before = Pt(8)
    p_img.paragraph_format.space_after = Pt(3)
    p_img.paragraph_format.keep_with_next = True
    run_img = p_img.add_run()
    run_img.add_picture(img_path, width=width)
    
    p_cap = doc.add_paragraph()
    p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_cap.paragraph_format.space_before = Pt(2)
    p_cap.paragraph_format.space_after = Pt(8)
    p_cap.paragraph_format.keep_with_next = False
    r_cap = p_cap.add_run(caption)
    r_cap.bold = True
    r_cap.font.name = "Calibri"
    r_cap.font.size = Pt(9.5)
    r_cap.font.color.rgb = COLOR_BLACK

def add_code_block(doc, code_text, caption=None):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = tbl.rows[0].cells[0]
    cell.width = Inches(6.12)
    set_cell_background(cell, "111111") # Dark monochrome terminal
    set_cell_margins(cell, top=120, bottom=120, left=160, right=160)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(0)
    p.paragraph_format.line_spacing = 1.05
    r = p.add_run(code_text)
    r.font.name = "Consolas"
    r.font.size = Pt(9.0)
    r.font.color.rgb = RGBColor(245, 245, 245)
    
    if caption:
        p_cap = doc.add_paragraph()
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.paragraph_format.space_before = Pt(3)
        p_cap.paragraph_format.space_after = Pt(8)
        r_cap = p_cap.add_run(caption)
        r_cap.bold = True
        r_cap.font.name = "Calibri"
        r_cap.font.size = Pt(9.0)
        r_cap.font.color.rgb = COLOR_BLACK

def add_table_caption(doc, text):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(10)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.keep_with_next = True
    r = p.add_run(text)
    r.bold = True
    r.font.name = "Calibri"
    r.font.size = Pt(10)
    r.font.color.rgb = COLOR_BLACK
    return p

def add_custom_table(doc, headers, data, col_widths=None, caption=None):
    if caption:
        add_table_caption(doc, caption)
    tbl = doc.add_table(rows=len(data) + 1, cols=len(headers))
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tbl, color="000000", sz="6")
    
    # Format header: pure black background with crisp white bold text
    hdr_row = tbl.rows[0]
    format_row(hdr_row, HEX_BLACK, is_header=True, bold=True, font_size=9.5)
    for c_idx, h_text in enumerate(headers):
        hdr_row.cells[c_idx].paragraphs[0].text = h_text
        hdr_row.cells[c_idx].paragraphs[0].runs[0].font.name = "Calibri"
        hdr_row.cells[c_idx].paragraphs[0].runs[0].bold = True
        hdr_row.cells[c_idx].paragraphs[0].runs[0].font.color.rgb = COLOR_WHITE
        
    # Format data rows: strictly black text on alternating white/light gray background
    for r_idx, row_data in enumerate(data):
        row = tbl.rows[r_idx + 1]
        bg = HEX_WHITE if r_idx % 2 == 0 else HEX_ROW_ALT
        format_row(row, bg, is_header=False, bold=False, font_size=9.0)
        for c_idx, val in enumerate(row_data):
            row.cells[c_idx].paragraphs[0].text = str(val)
            row.cells[c_idx].paragraphs[0].runs[0].font.name = "Calibri"
            row.cells[c_idx].paragraphs[0].runs[0].font.color.rgb = COLOR_BLACK
            if c_idx == 0:
                row.cells[c_idx].paragraphs[0].runs[0].bold = True
                
    # Apply column widths if provided
    if col_widths:
        for row in tbl.rows:
            for c_idx, w in enumerate(col_widths):
                row.cells[c_idx].width = Inches(w)
                
    p_spacer = doc.add_paragraph()
    p_spacer.paragraph_format.space_before = Pt(0)
    p_spacer.paragraph_format.space_after = Pt(6)

print("Strictly monochrome formatting primitives defined.")
