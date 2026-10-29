import docx

doc = docx.Document('SentinelAI_Documentation (1).docx')

print("--- CHECKING ENCODING AND TYPO ERRORS IN PARAGRAPHS ---")
bad_patterns = ['\ufffd', '[Guide Name]', '[HOD Name]', '[Project Coordinator]', 'PASTE SCREENSHOT', 'Figure', 'Table']
found_issues = []

for i, p in enumerate(doc.paragraphs):
    for bp in ['\ufffd', '[Guide Name]', '[HOD Name]', '[Project Coordinator]']:
        if bp in p.text:
            found_issues.append((i, bp, p.text[:80]))

print(f"Total placeholder/encoding issues in paragraphs: {len(found_issues)}")
for issue in found_issues[:15]:
    print(f"  P{issue[0]} contains '{issue[1]}': {issue[2]}")

print("\n--- CHECKING TABLES FOR PLACEHOLDERS ---")
tbl_issues = []
for t_idx, tbl in enumerate(doc.tables):
    for r_idx, row in enumerate(tbl.rows):
        for c_idx, cell in enumerate(row.cells):
            for bp in ['\ufffd', '[Guide Name]', 'PASTE SCREENSHOT']:
                if bp in cell.text:
                    tbl_issues.append((t_idx, r_idx, c_idx, bp, cell.text.replace('\n', ' ')[:60]))

print(f"Total table placeholder issues: {len(tbl_issues)}")
for ti in tbl_issues:
    print(f"  Table {ti[0]} R{ti[1]}C{ti[2]} ('{ti[3]}'): {ti[4]}")
