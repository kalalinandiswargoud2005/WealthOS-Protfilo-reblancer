"""
Plagiarism & Similarity Audit Script for WealthOS Manuscript
============================================================
Extracts text from WealthOS_IEEE_Research_Paper.docx and checks
against existing repository files to ensure the text is original,
free from verbatim copy-pasting, and properly paraphrased.
"""

import os
import docx
import re
from collections import Counter

MANUSCRIPT_PATH = r"C:\Users\goudk\OneDrive\Desktop\4-1\WealthOS_IEEE_Research_Paper.docx"
REPO_DIR = r"C:\Users\goudk\OneDrive\Desktop\4-1"

def clean_text(text):
    text = text.lower()
    text = re.sub(r'[^a-z0-9\s]', ' ', text)
    return ' '.join(text.split())

def get_ngrams(words, n=6):
    return set(' '.join(words[i:i+n]) for i in range(len(words)-n+1))

# 1. Read manuscript text
doc = docx.Document(MANUSCRIPT_PATH)
manuscript_paras = [p.text.strip() for p in doc.paragraphs if len(p.text.strip()) > 30]
manuscript_text = ' '.join(manuscript_paras)
manuscript_words = clean_text(manuscript_text).split()
manuscript_ngrams_6 = get_ngrams(manuscript_words, 6)
manuscript_ngrams_8 = get_ngrams(manuscript_words, 8)

print(f"Manuscript word count: {len(manuscript_words)} words")
print(f"Extracted {len(manuscript_ngrams_6)} unique 6-grams and {len(manuscript_ngrams_8)} unique 8-grams.")

# 2. Compare against previous project docs
target_files = [
    r"docs\Project_Documentation.md",
    r"docs\System_Architecture.md",
    r"Abstract.md",
    r"Project_Synopsis.md",
    r"build_batch3_docx.py"
]

results = []

for rel_path in target_files:
    full_path = os.path.join(REPO_DIR, rel_path)
    if not os.path.exists(full_path):
        continue
    
    with open(full_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    content_words = clean_text(content).split()
    content_ngrams_6 = get_ngrams(content_words, 6)
    content_ngrams_8 = get_ngrams(content_words, 8)
    
    matched_6 = manuscript_ngrams_6.intersection(content_ngrams_6)
    matched_8 = manuscript_ngrams_8.intersection(content_ngrams_8)
    
    sim_ratio_6 = (len(matched_6) / len(manuscript_ngrams_6)) * 100.0 if manuscript_ngrams_6 else 0
    sim_ratio_8 = (len(matched_8) / len(manuscript_ngrams_8)) * 100.0 if manuscript_ngrams_8 else 0
    
    results.append({
        "file": rel_path,
        "shared_6_grams": len(matched_6),
        "shared_8_grams": len(matched_8),
        "similarity_6g_pct": round(sim_ratio_6, 2),
        "similarity_8g_pct": round(sim_ratio_8, 2),
        "sample_overlaps": list(matched_8)[:3]
    })

print("\n--- SIMILARITY COMPARISON AGAINST EXISTING REPO FILES ---")
for r in results:
    print(f"\nTarget: {r['file']}")
    print(f"  8-gram Similarity: {r['similarity_8g_pct']}% (Shared 8-word phrases: {r['shared_8_grams']})")
    if r['sample_overlaps']:
        print(f"  Sample verbatim phrases: {r['sample_overlaps']}")

out_file = r"C:\Users\goudk\OneDrive\Desktop\4-1\artifacts\plagiarism_audit_report.json"
import json
with open(out_file, "w") as f:
    json.dump(results, f, indent=2)

print(f"\nAudit complete. Saved results to {out_file}")
