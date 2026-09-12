import os
import sys
import subprocess
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import numpy as np
import imageio_ffmpeg

# Paths
ARTIFACT_DIR = r"C:\Users\goudk\.gemini\antigravity-ide\brain\e76daa6a-e26f-46b1-b01c-0cb906605332"
DOCS_DIR = r"c:\Users\goudk\OneDrive\Desktop\4-1\docs"
PUBLIC_DIR = r"c:\Users\goudk\OneDrive\Desktop\4-1\public"

WIDTH = 1920
HEIGHT = 1080
FPS = 30

FONT_BOLD = "C:\\Windows\\Fonts\\segoeuib.ttf"
FONT_REG = "C:\\Windows\\Fonts\\segoeui.ttf"
FONT_SEMI = "C:\\Windows\\Fonts\\segoeuisl.ttf"

def get_font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except Exception:
        return ImageFont.load_default()

font_title_large = get_font(FONT_BOLD, 54)
font_title_mid = get_font(FONT_BOLD, 36)
font_badge = get_font(FONT_BOLD, 18)
font_hud_title = get_font(FONT_BOLD, 26)
font_hud_sub = get_font(FONT_REG, 18)
font_body = get_font(FONT_REG, 22)
font_small = get_font(FONT_REG, 16)

def create_hud_overlay(base_img, module_num, module_name, subtitle, badge_color):
    """Draw a modern glassmorphic HUD header bar onto the screenshot frame."""
    canvas = base_img.copy().convert("RGBA")
    overlay = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    
    # Top banner background bar
    bar_height = 80
    draw.rectangle([(0, 0), (WIDTH, bar_height)], fill=(13, 13, 15, 235))
    draw.line([(0, bar_height), (WIDTH, bar_height)], fill=(39, 39, 42, 255), width=2)
    
    # Bottom progress / status bar
    bot_height = 36
    draw.rectangle([(0, HEIGHT - bot_height), (WIDTH, HEIGHT)], fill=(13, 13, 15, 220))
    draw.line([(0, HEIGHT - bot_height), (WIDTH, HEIGHT - bot_height)], fill=(39, 39, 42, 255), width=1)
    
    # Module badge
    badge_text = f"MODULE {module_num}"
    badge_w = 140
    badge_h = 34
    bx = 28
    by = (bar_height - badge_h) // 2
    draw.rounded_rectangle([(bx, by), (bx + badge_w, by + badge_h)], radius=8, fill=(*badge_color, 40), outline=(*badge_color, 180), width=1)
    draw.text((bx + 18, by + 6), badge_text, font=font_badge, fill=(*badge_color, 255))
    
    # Title and subtitle
    tx = bx + badge_w + 24
    draw.text((tx, by - 2), module_name, font=font_hud_title, fill=(255, 255, 255, 255))
    draw.text((tx, by + 26), subtitle, font=font_hud_sub, fill=(161, 161, 170, 255))
    
    # Right brand stamp
    brand_x = WIDTH - 260
    draw.text((brand_x, by + 3), "WealthOS Rebalancer Pro", font=font_badge, fill=(245, 158, 11, 240))
    draw.text((brand_x, by + 23), "AUTONOMOUS SYSTEM LIVE", font=font_small, fill=(52, 211, 153, 220))
    
    # Bottom bar details
    draw.text((28, HEIGHT - bot_height + 8), "🟢 STATUS: AUTONOMOUS REBALANCER ENGAGED  |  16 ASSETS (NSE, MCX, BINANCE)  |  DRIFT TOLERANCE: ±0.4%", font=font_small, fill=(113, 113, 122, 255))
    draw.text((WIDTH - 280, HEIGHT - bot_height + 8), "AI ENGINE: GEMINI 2.5 FLASH", font=font_small, fill=(245, 158, 11, 230))
    
    canvas = Image.alpha_composite(canvas, overlay)
    return canvas.convert("RGB")

def fit_screenshot_to_1080p(img_path):
    """Load and center-fit screenshot inside 1920x1080 canvas with aspect ratio preserved."""
    img = Image.open(img_path).convert("RGB")
    target_w, target_h = WIDTH, HEIGHT
    
    # Calculate scale to fit inside 1920x1080 while leaving room for top HUD (80px) and bottom bar (36px)
    avail_h = target_h - 116
    avail_w = target_w
    
    # Scale screenshot to fit available height or width
    scale_w = avail_w / img.width
    scale_h = avail_h / img.height
    scale = min(scale_w, scale_h)
    
    new_w = int(img.width * scale)
    new_h = int(img.height * scale)
    resized = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    # Create dark background
    bg = Image.new("RGB", (target_w, target_h), (9, 9, 11))
    # Paste resized screenshot offset below the 80px HUD
    x_offset = (target_w - new_w) // 2
    y_offset = 80 + (avail_h - new_h) // 2
    bg.paste(resized, (x_offset, y_offset))
    return bg

def make_intro_frame(progress):
    """Render high-tech intro title card."""
    img = Image.new("RGBA", (WIDTH, HEIGHT), (9, 9, 11, 255))
    draw = ImageDraw.Draw(img)
    
    # Ambient glows
    center_x = WIDTH // 2
    center_y = HEIGHT // 2
    
    # Title container
    draw.rounded_rectangle([(center_x - 520, center_y - 240), (center_x + 520, center_y + 240)], radius=24, fill=(17, 17, 19, 240), outline=(39, 39, 42, 255), width=2)
    
    # Top amber badge
    draw.rounded_rectangle([(center_x - 170, center_y - 215), (center_x + 170, center_y - 175)], radius=12, fill=(245, 158, 11, 30), outline=(245, 158, 11, 200), width=1)
    draw.text((center_x - 145, center_y - 208), "AUTONOMOUS FINTECH PLATFORM", font=font_badge, fill=(245, 158, 11, 255))
    
    # Main Title
    t_text = "WealthOS Rebalancer Pro"
    draw.text((center_x - 390, center_y - 150), t_text, font=font_title_large, fill=(255, 255, 255, 255))
    
    # Subtitle
    sub_text = "Self-Driving Multi-Asset Portfolio Rebalancer Powered by Gemini AI"
    draw.text((center_x - 420, center_y - 65), sub_text, font=font_body, fill=(161, 161, 170, 255))
    
    # Divider line
    draw.line([(center_x - 450, center_y - 20), (center_x + 450, center_y - 20)], fill=(39, 39, 42, 255), width=1)
    
    # Feature Badges
    pills = [
        ("⚡ Autonomous Micro-Rebalancer", (16, 185, 129)),
        ("📊 16 Real-Time Live Assets", (59, 130, 246)),
        ("🤖 Gemini 2.5 Flash Agent", (245, 158, 11)),
        ("💳 Instant Settlement & UPI", (236, 72, 153))
    ]
    
    px_start = center_x - 450
    py_pos = center_y + 15
    for text, col in pills:
        draw.rounded_rectangle([(px_start, py_pos), (px_start + 430, py_pos + 42)], radius=10, fill=(*col, 25), outline=(*col, 160), width=1)
        draw.text((px_start + 24, py_pos + 10), text, font=font_badge, fill=(*col, 255))
        px_start += 470
        if px_start > center_x + 200:
            px_start = center_x - 450
            py_pos += 56
            
    # Bottom tech stack credits
    draw.text((center_x - 320, center_y + 160), "React 19  ·  Vite  ·  TypeScript  ·  TailwindCSS  ·  ApexCharts  ·  Supabase", font=font_small, fill=(113, 113, 122, 255))
    
    # Animated loading bar across the bottom of the card
    bar_w = int(900 * progress)
    draw.rectangle([(center_x - 450, center_y + 200), (center_x - 450 + bar_w, center_y + 204)], fill=(245, 158, 11, 255))
    
    return img.convert("RGB")

def make_outro_frame(progress):
    """Render high-impact outro card."""
    img = Image.new("RGBA", (WIDTH, HEIGHT), (9, 9, 11, 255))
    draw = ImageDraw.Draw(img)
    center_x = WIDTH // 2
    center_y = HEIGHT // 2
    
    draw.rounded_rectangle([(center_x - 480, center_y - 220), (center_x + 480, center_y + 220)], radius=24, fill=(17, 17, 19, 240), outline=(39, 39, 42, 255), width=2)
    
    draw.rounded_rectangle([(center_x - 140, center_y - 190), (center_x + 140, center_y - 150)], radius=12, fill=(16, 185, 129, 30), outline=(16, 185, 129, 200), width=1)
    draw.text((center_x - 110, center_y - 183), "LIVE DEMO COMPLETE", font=font_badge, fill=(16, 185, 129, 255))
    
    draw.text((center_x - 390, center_y - 120), "WealthOS Rebalancer Pro", font=font_title_large, fill=(255, 255, 255, 255))
    draw.text((center_x - 300, center_y - 45), "Autonomous  ·  Real-Time  ·  Intelligent FinTech", font=font_body, fill=(245, 158, 11, 255))
    
    draw.line([(center_x - 420, center_y + 5), (center_x + 420, center_y + 5)], fill=(39, 39, 42, 255), width=1)
    
    draw.text((center_x - 380, center_y + 35), "📁 GitHub Repository:", font=font_hud_title, fill=(255, 255, 255, 255))
    draw.text((center_x - 380, center_y + 75), "github.com/kalalinandiswargoud2005/WealthOS-Protfilo-reblancer", font=font_body, fill=(59, 130, 246, 255))
    
    draw.text((center_x - 220, center_y + 140), "Ready for Production Deployment & Evaluation", font=font_badge, fill=(161, 161, 170, 255))
    return img.convert("RGB")

def zoom_frame(img, zoom_factor):
    """Apply micro-zoom motion to create cinematic camera glide."""
    if zoom_factor == 1.0:
        return img
    w, h = img.size
    new_w = int(w * zoom_factor)
    new_h = int(h * zoom_factor)
    resized = img.resize((new_w, new_h), Image.Resampling.BILINEAR)
    
    # Crop back to original dimensions centered
    left = (new_w - w) // 2
    top = (new_h - h) // 2
    return resized.crop((left, top, left + w, top + h))

def main():
    print("--- Generating WealthOS Pro Demo Working Video ---")
    
    scenes_meta = [
        # (module_num, title, subtitle, badge_rgb, screenshot_path, duration_frames)
        (
            "01",
            "Executive Portfolio Dashboard — Live Overview",
            "Net Worth ₹8,94,845  ·  Live Streaming Ticker  ·  Target Allocation  ·  24h P&L +₹14,280",
            (245, 158, 11), # Amber
            os.path.join(ARTIFACT_DIR, "initial_dashboard_1789215250792.png"),
            80 # ~2.6s
        ),
        (
            "02",
            "Drift Detection Engine — Rebalancing Matrix",
            "Automated Drift Scanning  ·  Tolerance Threshold ±0.4%  ·  Live Allocation Deviation",
            (16, 185, 129), # Emerald
            os.path.join(ARTIFACT_DIR, "drift_allocations_tab_1789215375731.png"),
            80 # ~2.6s
        ),
        (
            "03",
            "Multi-Asset Vault — Holdings & Category Distribution",
            "Metals (MCX Gold/Silver)  ·  NSE Stocks  ·  Binance Crypto  ·  Mutual Funds",
            (59, 130, 246), # Blue
            os.path.join(ARTIFACT_DIR, "dashboard_scrolled_holdings_1789215339800.png"),
            80 # ~2.6s
        ),
        (
            "04",
            "Real-Time Market Watch — Streaming Price Feed",
            "Sub-second Spot Prices  ·  24h Volatility Index  ·  Interactive Trading Chart",
            (168, 85, 247), # Purple
            os.path.join(ARTIFACT_DIR, "market_watch_tab_1789215969422.png"),
            80 # ~2.6s
        ),
        (
            "05",
            "Gemini AI Assistant — Financial Intelligence",
            "Gemini 2.5 Flash Autonomous Agent  ·  Natural Language & Voice Commands  ·  Risk Insights",
            (245, 158, 11), # Amber
            os.path.join(DOCS_DIR, "ai_assistant_page_1782638876538.png"),
            80 # ~2.6s
        ),
        (
            "06",
            "Settlement & Banking Ledger — Audit Trail & UPI",
            "Automated Rebalance Execution  ·  Biometric Security  ·  Instant UPI QR Deposit",
            (236, 72, 153), # Rose
            os.path.join(DOCS_DIR, "transactions_history_1782638849030.png"),
            80 # ~2.6s
        ),
    ]

    # Pre-render base frames
    print("Pre-rendering scene frames...")
    prepared_scenes = []
    for num, title, sub, col, path, dur in scenes_meta:
        fitted = fit_screenshot_to_1080p(path)
        hud_frame = create_hud_overlay(fitted, num, title, sub, col)
        prepared_scenes.append((hud_frame, dur))

    INTRO_FRAMES = 55  # ~1.8s
    OUTRO_FRAMES = 55  # ~1.8s
    FADE_FRAMES = 12   # ~0.4s cross-fade

    mp4_path = os.path.join(DOCS_DIR, "wealthos_demo.mp4")
    print(f"Encoding Full HD 1080p MP4 to: {mp4_path}")

    # Initialize video encoder with H.264
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    
    # Direct FFmpeg pipe for ultra-fast, high quality encoding
    cmd = [
        ffmpeg_exe,
        "-y",
        "-f", "rawvideo",
        "-vcodec", "rawvideo",
        "-s", f"{WIDTH}x{HEIGHT}",
        "-pix_fmt", "rgb24",
        "-r", str(FPS),
        "-i", "-",
        "-c:v", "libx264",
        "-preset", "medium",
        "-crf", "20",
        "-pix_fmt", "yuv420p",
        "-movflags", "+faststart",
        mp4_path
    ]
    
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)

    def write_frame(img):
        raw = np.array(img).tobytes()
        proc.stdin.write(raw)

    # 1. Intro Card
    print("Writing Intro...")
    for i in range(INTRO_FRAMES):
        prog = i / float(INTRO_FRAMES)
        frame = make_intro_frame(prog)
        write_frame(frame)

    # 2. Walk through each scene
    prev_frame = make_intro_frame(1.0)
    
    for idx, (scene_img, dur) in enumerate(prepared_scenes):
        print(f"Writing Scene {idx + 1}/{len(prepared_scenes)}...")
        # Cross-fade from prev_frame into scene_img
        for f in range(FADE_FRAMES):
            alpha = f / float(FADE_FRAMES)
            blend = Image.blend(prev_frame, scene_img, alpha)
            write_frame(blend)
            
        # Hold scene with subtle cinematic micro-zoom
        for f in range(dur):
            # Slow subtle zoom from 1.000 to 1.025
            zoom = 1.0 + (f / float(dur)) * 0.025
            zoomed = zoom_frame(scene_img, zoom)
            write_frame(zoomed)
            
        prev_frame = zoom_frame(scene_img, 1.025)

    # 3. Cross-fade to Outro
    print("Writing Outro...")
    outro_first = make_outro_frame(0.0)
    for f in range(FADE_FRAMES):
        alpha = f / float(FADE_FRAMES)
        blend = Image.blend(prev_frame, outro_first, alpha)
        write_frame(blend)

    for i in range(OUTRO_FRAMES):
        prog = i / float(OUTRO_FRAMES)
        frame = make_outro_frame(prog)
        write_frame(frame)

    proc.stdin.close()
    proc.wait()
    print(f"✓ MP4 Video successfully written to {mp4_path} ({os.path.getsize(mp4_path) / (1024*1024):.2f} MB)")

    # Generate Animated WebP for instant inline autoplay in GitHub README
    webp_path = os.path.join(DOCS_DIR, "wealthos_demo.webp")
    print(f"Generating optimized animated WebP for GitHub README to: {webp_path}")
    
    # Convert MP4 to WebP with FFmpeg (smooth 15fps, 960 width for perfect compression & fast load on GitHub)
    webp_cmd = [
        ffmpeg_exe,
        "-y",
        "-i", mp4_path,
        "-vf", "fps=14,scale=960:-1:flags=lanczos",
        "-vcodec", "libwebp",
        "-lossless", "0",
        "-compression_level", "4",
        "-q:v", "72",
        "-loop", "0",
        webp_path
    ]
    subprocess.run(webp_cmd, check=True)
    print(f"✓ Animated WebP successfully generated: {webp_path} ({os.path.getsize(webp_path) / (1024*1024):.2f} MB)")

    # Also copy to public directory so web users/evaluators can access it
    os.makedirs(PUBLIC_DIR, exist_ok=True)
    import shutil
    shutil.copy2(mp4_path, os.path.join(PUBLIC_DIR, "demo.mp4"))
    shutil.copy2(webp_path, os.path.join(PUBLIC_DIR, "demo.webp"))
    shutil.copy2(mp4_path, os.path.join(DOCS_DIR, "demo.mp4"))
    shutil.copy2(webp_path, os.path.join(DOCS_DIR, "demo.webp"))
    print("✓ Copied demo assets to docs/demo.mp4, docs/demo.webp, public/demo.mp4, public/demo.webp")

if __name__ == "__main__":
    main()
