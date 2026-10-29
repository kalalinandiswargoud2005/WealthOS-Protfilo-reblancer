"""
Safe Workspace Cleanup Utility for WealthOS
Removes temporary preview dumps, debug test outputs, backup artifacts, and lock files.
Preserves all source code, official research manuscripts, reports, datasets, and figures.
"""
import os
import glob

WORKSPACE = r"c:\Users\goudk\OneDrive\Desktop\4-1"

# Patterns of temporary/debug files to remove
PATTERNS_TO_REMOVE = [
    # Temporary Word lock files and backups
    "~$*",
    "*.bak",
    "Batch1_Final.docx.bak",
    "Batch 2 ppt_original_backup.pptx",

    # Scratch test outputs
    "test_out.pdf",
    "test_phase1.pdf",
    "test_sections_out.*",
    "test_sections_script.py",

    # Debug page snapshots
    "check_plain_p*.png",
    "debug_orig_page_*.png",
    "final_preview_p*.png",
    "student_proof_p*.png",

    # Redundant / temporary dumps
    "batch3_print.html",
    "codegalaxy_full.txt",
    "WealthOS_Publication_Paper - Copy.pdf",

    # Redundant individual poster copies (since wealthos_all_5_posters_deck.pptx contains all 5)
    "poster_1_clean_white.*",
    "poster_2_cyber_dark.*",
    "poster_3_royal_blue.*",
    "poster_4_warm_pearl_ivory.*",
    "poster_5_emerald_mint.*",
]

# Folders that were temporary build dumps
FOLDERS_TO_REMOVE = [
    "preview_batch1",
    "extracted_ppt_images",
]

def cleanup():
    removed_count = 0
    freed_bytes = 0

    # 1. Check and remove 0-byte WealthOS_Publication_Paper.pdf if corrupt
    zero_byte_pdf = os.path.join(WORKSPACE, "WealthOS_Publication_Paper.pdf")
    if os.path.exists(zero_byte_pdf) and os.path.getsize(zero_byte_pdf) == 0:
        os.remove(zero_byte_pdf)
        print(f"Removed 0-byte corrupt file: WealthOS_Publication_Paper.pdf")
        removed_count += 1

    # 2. Remove files matching patterns
    for pat in PATTERNS_TO_REMOVE:
        full_pat = os.path.join(WORKSPACE, pat)
        matches = glob.glob(full_pat)
        for f in matches:
            if os.path.isfile(f):
                try:
                    size = os.path.getsize(f)
                    os.remove(f)
                    freed_bytes += size
                    removed_count += 1
                    print(f"Removed file: {os.path.basename(f)} ({size:,} bytes)")
                except Exception as e:
                    print(f"Could not remove {f}: {e}")

    # 3. Remove temporary directories
    import shutil
    for folder in FOLDERS_TO_REMOVE:
        folder_path = os.path.join(WORKSPACE, folder)
        if os.path.exists(folder_path) and os.path.isdir(folder_path):
            try:
                # Count files inside
                f_count = sum(len(files) for _, _, files in os.walk(folder_path))
                shutil.rmtree(folder_path)
                removed_count += f_count
                print(f"Removed temporary directory: {folder} ({f_count} files)")
            except Exception as e:
                print(f"Could not remove folder {folder}: {e}")

    print("\n" + "="*50)
    print(f"CLEANUP COMPLETE: Removed {removed_count} items.")
    print(f"Total space freed: {freed_bytes / (1024*1024):.2f} MB")
    print("="*50)

if __name__ == "__main__":
    cleanup()
