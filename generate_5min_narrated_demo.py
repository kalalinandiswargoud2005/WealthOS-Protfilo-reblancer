import os
import sys
import json
import subprocess
import shutil
from PIL import Image, ImageDraw, ImageFont
import numpy as np
import imageio_ffmpeg

BASE_DIR = r"c:\Users\goudk\OneDrive\Desktop\4-1"
ARTIFACT_DIR = r"C:\Users\goudk\.gemini\antigravity-ide\brain\e76daa6a-e26f-46b1-b01c-0cb906605332"
DOCS_DIR = os.path.join(BASE_DIR, "docs")
PUBLIC_DIR = os.path.join(BASE_DIR, "public")
AUDIO_DIR = os.path.join(DOCS_DIR, "narration_audio")
TEMP_VIDEO_DIR = os.path.join(DOCS_DIR, "temp_scenes")

os.makedirs(TEMP_VIDEO_DIR, exist_ok=True)
os.makedirs(PUBLIC_DIR, exist_ok=True)

WIDTH = 1920
HEIGHT = 1080
FPS = 30

FONT_BOLD = "C:\\Windows\\Fonts\\segoeuib.ttf"
FONT_REG = "C:\\Windows\\Fonts\\segoeui.ttf"

def get_font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except Exception:
        return ImageFont.load_default()

font_title_large = get_font(FONT_BOLD, 46)
font_badge = get_font(FONT_BOLD, 17)
font_hud_title = get_font(FONT_BOLD, 23)
font_hud_sub = get_font(FONT_REG, 16)
font_caption = get_font(FONT_BOLD, 21)
font_small = get_font(FONT_REG, 15)

def get_audio_duration(file_path):
    ff = imageio_ffmpeg.get_ffmpeg_exe()
    cmd = [ff, "-i", file_path]
    res = subprocess.run(cmd, stderr=subprocess.PIPE, stdout=subprocess.PIPE, text=True)
    for line in res.stderr.split("\n"):
        if "Duration:" in line:
            parts = line.split("Duration:")[1].split(",")[0].strip()
            h, m, s = parts.split(":")
            return float(h)*3600 + float(m)*60 + float(s)
    return 30.0

def fit_image_to_canvas(img_path):
    """Fit screenshot inside 1920x1080 leaving top HUD (75px) and bottom caption bar (85px)."""
    img = Image.open(img_path).convert("RGB")
    avail_h = HEIGHT - 165
    avail_w = WIDTH
    
    scale = min(avail_w / img.width, avail_h / img.height)
    new_w = int(img.width * scale)
    new_h = int(img.height * scale)
    resized = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    bg = Image.new("RGB", (WIDTH, HEIGHT), (9, 9, 11))
    x_offset = (WIDTH - new_w) // 2
    y_offset = 75 + (avail_h - new_h) // 2
    bg.paste(resized, (x_offset, y_offset))
    return bg

def make_title_card(title_text, subtitle_text, badges):
    """Draw a dedicated title/intro/outro card."""
    img = Image.new("RGB", (WIDTH, HEIGHT), (9, 9, 11))
    draw = ImageDraw.Draw(img)
    cx, cy = WIDTH // 2, HEIGHT // 2
    
    # Outer frame
    draw.rounded_rectangle([(cx - 560, cy - 240), (cx + 560, cy + 240)], radius=24, fill=(17, 17, 19), outline=(39, 39, 42), width=2)
    
    # Pill badge
    draw.rounded_rectangle([(cx - 180, cy - 210), (cx + 180, cy - 170)], radius=12, fill=(35, 25, 12), outline=(245, 158, 11), width=1)
    draw.text((cx - 150, cy - 202), "WEALTHOS REBALANCER PRO", font=font_badge, fill=(245, 158, 11))
    
    # Title & Subtitle
    draw.text((cx - 480, cy - 145), title_text, font=font_title_large, fill=(255, 255, 255))
    draw.text((cx - 480, cy - 75), subtitle_text, font=font_hud_sub, fill=(161, 161, 170))
    
    draw.line([(cx - 500, cy - 30), (cx + 500, cy - 30)], fill=(39, 39, 42), width=1)
    
    # Badges
    bx = cx - 500
    by = cy + 10
    for text, col in badges:
        draw.rounded_rectangle([(bx, by), (bx + 480, by + 44)], radius=10, fill=(20, 20, 25), outline=col, width=1)
        draw.text((bx + 20, by + 12), text, font=font_badge, fill=col)
        bx += 520
        if bx > cx + 100:
            bx = cx - 500
            by += 58
            
    # Progress line
    draw.rectangle([(cx - 500, cy + 215), (cx + 500, cy + 219)], fill=(245, 158, 11))
    return img

def render_frame(base_img, mod_num, mod_title, mod_sub, badge_rgb, caption_text):
    """Direct RGB rendering of top HUD and bottom captions bar."""
    frame = base_img.copy()
    draw = ImageDraw.Draw(frame)
    
    # 1. Top HUD Bar (75px)
    hud_h = 75
    draw.rectangle([(0, 0), (WIDTH, hud_h)], fill=(13, 13, 15))
    draw.line([(0, hud_h), (WIDTH, hud_h)], fill=(39, 39, 42), width=2)
    
    # Module badge
    bx = 28
    by = 16
    bw = 145
    bh = 38
    draw.rounded_rectangle([(bx, by), (bx + bw, by + bh)], radius=8, fill=(25, 25, 28), outline=badge_rgb, width=1)
    draw.text((bx + 16, by + 9), f"MODULE {mod_num} / 10", font=font_badge, fill=badge_rgb)
    
    # Title & Subtitle
    tx = bx + bw + 20
    draw.text((tx, by - 2), mod_title, font=font_hud_title, fill=(255, 255, 255))
    draw.text((tx, by + 26), mod_sub, font=font_hud_sub, fill=(161, 161, 170))
    
    # Right telemetry badge
    rx = WIDTH - 340
    draw.rounded_rectangle([(rx, by + 4), (rx + 310, by + bh - 4)], radius=8, fill=(24, 24, 27), outline=(39, 39, 42), width=1)
    draw.ellipse([(rx + 14, by + 14), (rx + 24, by + 24)], fill=(16, 185, 129))
    draw.text((rx + 32, by + 9), "VOICEOVER: EN-IN (INDIAN ENGLISH)", font=font_small, fill=(228, 228, 231))
    
    # 2. Bottom Captions Bar (85px)
    cap_h = 85
    cy_start = HEIGHT - cap_h
    draw.rectangle([(0, cy_start), (WIDTH, HEIGHT)], fill=(10, 10, 12))
    draw.line([(0, cy_start), (WIDTH, cy_start)], fill=(39, 39, 42), width=2)
    
    # Voice indicator icon
    draw.rounded_rectangle([(28, cy_start + 18), (64, cy_start + 66)], radius=6, fill=(30, 25, 15), outline=(245, 158, 11), width=1)
    draw.text((36, cy_start + 28), "AI", font=font_badge, fill=(245, 158, 11))
    
    # Subtitle Text
    draw.text((80, cy_start + 28), caption_text, font=font_caption, fill=(255, 255, 255))
    return frame

def build_scene_video(scene_idx, scene_info, total_scenes):
    scene_id = scene_info["id"]
    audio_file = os.path.join(AUDIO_DIR, f"{scene_id}.mp3")
    duration = get_audio_duration(audio_file)
    total_frames = int(duration * FPS) + 5
    
    temp_video = os.path.join(TEMP_VIDEO_DIR, f"temp_{scene_id}.mp4")
    out_video = os.path.join(TEMP_VIDEO_DIR, f"scene_{scene_idx:02d}_{scene_id}.mp4")
    
    captions = scene_info["captions"]
    cap_count = len(captions)
    
    print(f"[{scene_idx}/{total_scenes}] Encoding {scene_id} ({duration:.1f}s, {total_frames} frames)...")
    
    # Pre-render base visual
    if scene_info.get("is_card"):
        base_img = make_title_card(scene_info["title"], scene_info["sub"], scene_info["badges"])
    else:
        base_img = fit_image_to_canvas(scene_info["image_path"])
        
    # Pre-render caption frames into raw bytes (1 per caption)
    raw_caption_buffers = []
    for cap_text in captions:
        frame_img = render_frame(base_img, scene_info["num"], scene_info["title"], scene_info["sub"], scene_info["color"], cap_text)
        raw_caption_buffers.append(np.array(frame_img).tobytes())
        
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    
    # High-speed ultrafast pipe
    cmd = [
        ffmpeg_exe, "-y",
        "-f", "rawvideo",
        "-vcodec", "rawvideo",
        "-s", f"{WIDTH}x{HEIGHT}",
        "-pix_fmt", "rgb24",
        "-r", str(FPS),
        "-i", "-",
        "-c:v", "libx264",
        "-preset", "ultrafast",
        "-crf", "20",
        "-pix_fmt", "yuv420p",
        temp_video
    ]
    
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stderr=subprocess.DEVNULL)
    
    frames_per_cap = total_frames // cap_count
    remaining = total_frames
    
    for i in range(cap_count):
        count = frames_per_cap if i < cap_count - 1 else remaining
        raw_chunk = raw_caption_buffers[i]
        for _ in range(count):
            proc.stdin.write(raw_chunk)
        remaining -= count
        
    proc.stdin.close()
    proc.wait()
    
    # Mux with Audio
    mux_cmd = [
        ffmpeg_exe, "-y",
        "-i", temp_video,
        "-i", audio_file,
        "-c:v", "copy",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        out_video
    ]
    subprocess.run(mux_cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    if os.path.exists(temp_video):
        os.remove(temp_video)
        
    print(f"  -> Generated {out_video} ({os.path.getsize(out_video)/(1024*1024):.2f} MB)")
    return out_video

def main():
    print("=================================================================")
    print("  WealthOS Rebalancer Pro — 5-Minute Indian Narration Generator  ")
    print("=================================================================")
    
    scenes = [
        {
            "id": "scene01_intro",
            "num": "01",
            "title": "Welcome to WealthOS Rebalancer Pro",
            "sub": "Autonomous Multi-Asset Portfolio Rebalancing Powered by Agentic Intelligence",
            "color": (245, 158, 11),
            "image_path": os.path.join(ARTIFACT_DIR, "initial_dashboard_1789215250792.png"),
            "captions": [
                "Welcome to WealthOS Rebalancer Pro — an autonomous wealth management platform.",
                "Traditional portfolio rebalancing causes emotional bias, high tax drag, and delayed execution.",
                "WealthOS continuously tracks cross-asset drift, executing autonomous micro-rebalancing."
            ]
        },
        {
            "id": "scene02_architecture",
            "num": "02",
            "title": "System Architecture & Live Data Engineering",
            "sub": "React 19 + TypeScript + Vite + Gemini 2.5 Flash + Supabase Audit Ledger",
            "color": (59, 130, 246),
            "image_path": os.path.join(BASE_DIR, "generated_figures", "fig1_architecture.png"),
            "captions": [
                "Architected on React 19, TypeScript, and Vite with a high-throughput state machine.",
                "Real-time market adapters stream equity from NSE, metals from MCX, and crypto from Binance.",
                "The intelligence layer orchestrates Gemini 2.5 Flash with immutable ledger records."
            ]
        },
        {
            "id": "scene03_dashboard",
            "num": "03",
            "title": "Executive Portfolio Dashboard & Live Tickers",
            "sub": "Real-Time Net Worth · 24h P&L · Liquid Cash · Streaming Market Ticker Tape",
            "color": (16, 185, 129),
            "image_path": os.path.join(ARTIFACT_DIR, "dashboard_top_1789215417954.png"),
            "captions": [
                "The Executive Dashboard offers a single pane of glass view of complete investor net worth.",
                "The streaming ticker provides real-time spot updates across all tracked assets continuously.",
                "Instant visibility into liquid cash reserves, 24h P&L, and overall portfolio health."
            ]
        },
        {
            "id": "scene04_drift",
            "num": "04",
            "title": "Algorithmic Drift Detection & Tolerance Engine",
            "sub": "Target vs Current Allocations · ±0.4% Drift Threshold · Zero-Loss Optimization",
            "color": (236, 72, 153),
            "image_path": os.path.join(ARTIFACT_DIR, "drift_allocations_tab_1789215375731.png"),
            "captions": [
                "A core pillar of WealthOS is its mathematical Drift Detection Engine.",
                "The agent compares live asset weights against targets with a strict ±0.4% tolerance band.",
                "Precision micro-rebalancing eliminates market friction and minimizes capital gains tax."
            ]
        },
        {
            "id": "scene05_vault",
            "num": "05",
            "title": "Multi-Asset Vault & Cross-Market Holdings",
            "sub": "16 Diversified Assets Across Precious Metals, Indian Equities, Crypto & Mutual Funds",
            "color": (168, 85, 247),
            "image_path": os.path.join(ARTIFACT_DIR, "dashboard_scrolled_holdings_1789215339800.png"),
            "captions": [
                "The Multi-Asset Vault manages sixteen diversified assets across four core classes.",
                "Precious metals on MCX India, bluechip equities on the National Stock Exchange.",
                "Top cryptocurrencies on Binance and domestic index mutual funds from SBI, HDFC, and ICICI."
            ]
        },
        {
            "id": "scene06_market_watch",
            "num": "06",
            "title": "Institutional-Grade Market Watch Feed",
            "sub": "Sub-second Spot Prices · 24h Volume & Volatility · Interactive ApexCharts",
            "color": (6, 182, 212),
            "image_path": os.path.join(ARTIFACT_DIR, "market_watch_tab_1789215969422.png"),
            "captions": [
                "The Market Watch module provides active investors with streaming sub-second price telemetry.",
                "Inspect 24-hour volume, day highs and lows, volatility coefficients, and interactive charts.",
                "Execute manual buy or sell rebalancing orders on demand with live spot confirmation."
            ]
        },
        {
            "id": "scene07_agent_console",
            "num": "07",
            "title": "Autonomous Agent Console & Execution Loop",
            "sub": "Auto-Pilot Daemon · 25s Cycle Transcripts · Model Telemetry · Zero Human Bias",
            "color": (245, 158, 11),
            "image_path": os.path.join(ARTIFACT_DIR, "dashboard_scrolled_further_1789215313712.png"),
            "captions": [
                "Inside the Agent Console, inspect the continuous autonomous loop running in the background.",
                "Supports three operational modes: Fully Autonomous Auto-Pilot, AI-Suggested, and Manual.",
                "The agent awakens every 25 seconds, streaming transparent execution logs and audit trails."
            ]
        },
        {
            "id": "scene08_ai_assistant",
            "num": "08",
            "title": "Gemini 2.5 Flash Financial Intelligence Co-Pilot",
            "sub": "Natural Language Queries · Voice Commands & Audio Synthesis · Macro Insights",
            "color": (16, 185, 129),
            "image_path": os.path.join(DOCS_DIR, "ai_assistant_page_1782638876538.png"),
            "captions": [
                "The AI Assistant acts as a personal financial strategist powered by Google Gemini 2.5 Flash.",
                "Interact through natural language text or voice commands with full audio responses.",
                "Explains rebalancing rationales, evaluates risk profiles, and provides proactive insights."
            ]
        },
        {
            "id": "scene09_banking_upi",
            "num": "09",
            "title": "Settlement Ledger, Instant UPI QR & Biometrics",
            "sub": "Cryptographic Audit Trails · Dynamic UPI QR Deposits · FIDO2 WebAuthn Passkeys",
            "color": (236, 72, 153),
            "image_path": os.path.join(DOCS_DIR, "transactions_history_1782638849030.png"),
            "captions": [
                "Financial integrity and security are built into the core banking and settlement ledger.",
                "Instant UPI deposits and payouts via dynamic QR codes with live settlement confirmation.",
                "Enterprise-grade FIDO2 WebAuthn biometric passkeys for fingerprint and facial recognition login."
            ]
        },
        {
            "id": "scene10_conclusion",
            "num": "10",
            "title": "Production Readiness & Academic Viva Demonstration",
            "sub": "Self-Driving FinTech · Open-Source Architecture · Major Project Demonstration",
            "color": (245, 158, 11),
            "is_card": True,
            "badges": [
                ("Autonomous Agentic Rebalancing", (16, 185, 129)),
                ("16 Real-Time Live Market Feeds", (59, 130, 246)),
                ("Gemini 2.5 Flash Intelligence", (245, 158, 11)),
                ("Public GitHub Repository Ready", (236, 72, 153))
            ],
            "captions": [
                "WealthOS Rebalancer Pro showcases the power of combining Agentic AI with FinTech.",
                "Bridging the gap between passive buy-and-hold investing and active algorithmic optimization.",
                "All source code and documentation are live on GitHub. Thank you for watching."
            ]
        }
    ]
    
    rendered_clips = []
    for idx, scene_info in enumerate(scenes, start=1):
        clip_path = build_scene_video(idx, scene_info, len(scenes))
        rendered_clips.append(clip_path)
        
    print("\n--- All 10 scenes rendered! Concatenating into final 5-minute video ---")
    
    concat_list_file = os.path.join(TEMP_VIDEO_DIR, "concat_list.txt")
    with open(concat_list_file, "w", encoding="utf-8") as f:
        for clip in rendered_clips:
            normalized = clip.replace("\\", "/")
            f.write(f"file '{normalized}'\n")
            
    final_output_docs = os.path.join(DOCS_DIR, "wealthos_5min_demo.mp4")
    final_alias_docs = os.path.join(DOCS_DIR, "demo_5min.mp4")
    final_alias_pub = os.path.join(PUBLIC_DIR, "demo_5min.mp4")
    
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    
    concat_cmd = [
        ffmpeg_exe, "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", concat_list_file,
        "-c", "copy",
        final_output_docs
    ]
    
    subprocess.run(concat_cmd, check=True)
    print("Final 5-minute video successfully concatenated!")
    
    shutil.copy2(final_output_docs, final_alias_docs)
    shutil.copy2(final_output_docs, final_alias_pub)
    
    final_dur = get_audio_duration(final_output_docs)
    final_size_mb = os.path.getsize(final_output_docs) / (1024 * 1024)
    
    print("\n=================================================================")
    print("  DEMO VIDEO GENERATION COMPLETE!                                ")
    print(f"  File Path: {final_output_docs}                                 ")
    print(f"  Duration:  {final_dur:.1f} seconds ({final_dur/60:.2f} minutes)")
    print(f"  File Size: {final_size_mb:.2f} MB                              ")
    print("=================================================================\n")

if __name__ == "__main__":
    main()
