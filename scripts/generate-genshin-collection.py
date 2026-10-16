"""Generate and package all 36 Genshin Chibi wallpaper assets (12 designs x 3 devices)."""
import os
import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(r"c:\Users\Admin\source\repos\SchedSnap")
BRAIN = Path(r"C:\Users\Admin\.gemini\antigravity-ide\brain\78bc0a0e-6164-4918-bdb4-8d74fdcb4610")
UPLOADS = BRAIN / ".user_uploaded"
OUTPUT_DIR = ROOT / "public" / "wallpapers" / "scenic"

SIZES = {
    "mobile": (1080, 2400),
    "tablet": (1600, 2560),
    "laptop": (1920, 1080)
}

# Load and prepare user uploaded stickers
def load_chibi_stickers():
    faruzan = Image.open(UPLOADS / "media_1791889323066.png").convert("RGBA")
    hutao = Image.open(UPLOADS / "media_1791889430897.png").convert("RGBA")
    columbina = Image.open(UPLOADS / "media_1791889558117.png").convert("RGBA")

    # Mavuika: key out white background to RGBA
    mavuika_raw = Image.open(UPLOADS / "media_1791889460040.jpg").convert("RGBA")
    data = []
    for pixel in mavuika_raw.getdata():
        if pixel[0] > 235 and pixel[1] > 235 and pixel[2] > 235:
            data.append((255, 255, 255, 0))
        else:
            data.append(pixel)
    mavuika_raw.putdata(data)

    return {
        "faruzan": faruzan,
        "hutao": hutao,
        "mavuika": mavuika_raw,
        "columbina": columbina
    }

def add_sticker_border(im, border_width=12, border_color=(255, 255, 255, 255), shadow_offset=10):
    """Add white die-cut sticker outline and soft drop shadow."""
    w, h = im.size
    pad = border_width + shadow_offset + 14
    canvas = Image.new("RGBA", (w + pad * 2, h + pad * 2), (0, 0, 0, 0))

    # Mask from alpha
    alpha = im.split()[-1]
    border_mask = alpha.filter(ImageFilter.MaxFilter(border_width * 2 + 1))

    # Shadow
    shadow_mask = border_mask.filter(ImageFilter.GaussianBlur(6))
    shadow_layer = Image.new("RGBA", border_mask.size, (0, 0, 0, 60))
    canvas.paste(shadow_layer, (pad + shadow_offset // 2, pad + shadow_offset), shadow_mask)

    # White border
    border_layer = Image.new("RGBA", border_mask.size, border_color)
    canvas.paste(border_layer, (pad, pad), border_mask)

    # Original sticker
    canvas.paste(im, (pad, pad), im)
    return canvas

def make_gradient(width, height, color1, color2, vertical=True):
    """Create a 2-color smooth gradient."""
    base = Image.new("RGB", (width, height), color1)
    top = Image.new("RGB", (width, height), color2)
    mask = Image.new("L", (width, height))
    draw = ImageDraw.Draw(mask)
    if vertical:
        for y in range(height):
            alpha = int(255 * (y / height))
            draw.line([(0, y), (width, y)], fill=alpha)
    else:
        for x in range(width):
            alpha = int(255 * (x / width))
            draw.line([(x, 0), (x, height)], fill=alpha)
    return Image.composite(top, base, mask)

def resize_fill_or_pad(im, target_w, target_h, bg_color):
    """Proportionally fit and fill background without distortion."""
    target_ratio = target_w / target_h
    im_ratio = im.width / im.height

    if abs(target_ratio - im_ratio) < 0.05:
        return im.resize((target_w, target_h), Image.Resampling.LANCZOS).convert("RGB")

    # Scale to cover target
    scale = max(target_w / im.width, target_h / im.height)
    new_w = int(round(im.width * scale))
    new_h = int(round(im.height * scale))
    scaled = im.resize((new_w, new_h), Image.Resampling.LANCZOS)

    # Center crop
    left = (new_w - target_w) // 2
    top = (new_h - target_h) // 2
    cropped = scaled.crop((left, top, left + target_w, top + target_h))
    return cropped.convert("RGB")

def build_composed_wallpaper(device, bg_colors, sticker, motifs="stars", schedule_surface="#ffffffd9", schedule_border="#e8c4bc"):
    w, h = SIZES[device]
    canvas = make_gradient(w, h, bg_colors[0], bg_colors[1], vertical=(device != "laptop"))
    draw = ImageDraw.Draw(canvas, "RGBA")

    # Add geometric watermark / decorative motifs
    motif_layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    mdraw = ImageDraw.Draw(motif_layer)

    if motifs == "gears":
        # Sumeru gear / circle motifs
        for cx, cy, r in [(150, 180, 120), (w - 120, 260, 90), (w - 180, h - 220, 140), (200, h - 180, 100)]:
            mdraw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=(255, 255, 255, 40), width=4)
            mdraw.ellipse([cx - r//2, cy - r//2, cx + r//2, cy + r//2], outline=(255, 255, 255, 30), width=2)
    elif motifs == "blossoms":
        # Plum blossom / butterfly floating circles
        for cx, cy, r in [(120, 220, 80), (w - 160, 200, 110), (w - 140, h - 300, 130), (180, h - 240, 90)]:
            mdraw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=(255, 255, 255, 50), width=3)
            # 5-petal flower
            for angle in range(0, 360, 72):
                rad = math.radians(angle)
                px = cx + int((r * 0.7) * math.cos(rad))
                py = cy + int((r * 0.7) * math.sin(rad))
                mdraw.ellipse([px - 25, py - 25, px + 25, py + 25], fill=(255, 255, 255, 30))
    elif motifs == "flames":
        # Natlan tribal angular sun/chevron motifs
        for y_offset in [150, h - 250]:
            mdraw.line([(0, y_offset), (w, y_offset)], fill=(255, 255, 255, 45), width=3)
            for x in range(50, w, 150):
                mdraw.polygon([(x, y_offset), (x + 40, y_offset - 35), (x + 80, y_offset)], fill=(255, 255, 255, 35))
    elif motifs == "wings":
        # Columbina halo / celestial stars
        for cx, cy in [(180, 200), (w - 180, 240), (w - 200, h - 220), (220, h - 200)]:
            # 4-point star
            for length in [60, 25]:
                mdraw.line([(cx - length, cy), (cx + length, cy)], fill=(255, 255, 255, 50), width=3)
                mdraw.line([(cx, cy - length), (cx, cy + length)], fill=(255, 255, 255, 50), width=3)
            mdraw.ellipse([cx - 40, cy - 40, cx + 40, cy + 40], outline=(255, 255, 255, 35), width=2)

    canvas.paste(motif_layer, (0, 0), motif_layer)

    # Layout card zones based on device
    card_layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    cdraw = ImageDraw.Draw(card_layer)

    if device == "mobile":
        # Top 25% clear for clock. Center card for timetable (Y: 720 to 2160)
        card_box = [60, 750, w - 60, 2160]
        cdraw.rounded_rectangle(card_box, radius=48, fill=schedule_surface, outline=schedule_border, width=4)
        
        # Sub-header bar
        cdraw.rounded_rectangle([90, 780, w - 90, 880], radius=24, fill=(255, 255, 255, 180))

        # Sticker placement: resting atop card header
        framed_sticker = add_sticker_border(sticker, border_width=14)
        st_size = 480
        scaled_st = framed_sticker.resize((st_size, int(framed_sticker.height * (st_size / framed_sticker.width))), Image.Resampling.LANCZOS)
        # Place centered or slightly right above the card
        paste_x = (w - scaled_st.width) // 2 + 120
        paste_y = card_box[1] - (scaled_st.height * 2 // 3)
        card_layer.paste(scaled_st, (paste_x, paste_y), scaled_st)

    elif device == "tablet":
        # Tablet portrait: card box in lower 70%
        card_box = [100, 700, w - 100, 2380]
        cdraw.rounded_rectangle(card_box, radius=56, fill=schedule_surface, outline=schedule_border, width=5)
        cdraw.rounded_rectangle([140, 740, w - 140, 860], radius=28, fill=(255, 255, 255, 180))

        framed_sticker = add_sticker_border(sticker, border_width=16)
        st_size = 560
        scaled_st = framed_sticker.resize((st_size, int(framed_sticker.height * (st_size / framed_sticker.width))), Image.Resampling.LANCZOS)
        paste_x = w - scaled_st.width - 120
        paste_y = card_box[1] - (scaled_st.height * 3 // 4)
        card_layer.paste(scaled_st, (paste_x, paste_y), scaled_st)

    else: # laptop 1920 x 1080
        # Schedule card occupies left 60%
        card_box = [80, 100, 1180, 980]
        cdraw.rounded_rectangle(card_box, radius=40, fill=schedule_surface, outline=schedule_border, width=4)
        cdraw.rounded_rectangle([110, 130, 1150, 220], radius=20, fill=(255, 255, 255, 180))

        # Sticker showcase on right side (1200 to 1920)
        framed_sticker = add_sticker_border(sticker, border_width=18)
        st_size = 620
        scaled_st = framed_sticker.resize((st_size, int(framed_sticker.height * (st_size / framed_sticker.width))), Image.Resampling.LANCZOS)
        paste_x = 1260 + (600 - scaled_st.width) // 2
        paste_y = (h - scaled_st.height) // 2
        card_layer.paste(scaled_st, (paste_x, paste_y), scaled_st)

    canvas.paste(card_layer, (0, 0), card_layer)
    return canvas.convert("RGB")

def main():
    print("Loading chibi stickers...")
    stickers = load_chibi_stickers()

    # Pre-generated AI images to package
    ai_masters = {
        "genshin-faruzan-buffering": {
            "mobile": BRAIN / "faruzan_buffer_mob_1791889996573.jpg",
            "tablet": BRAIN / "faruzan_buffer_tab_1791890089780.jpg",
            "laptop": BRAIN / "faruzan_buffer_lap_1791890103175.jpg"
        },
        "genshin-faruzan-workshop": {
            "mobile": BRAIN / "faruzan_ws_mob_1791890130554.jpg",
            "tablet": BRAIN / "faruzan_ws_tab_1791890144778.jpg",
            "laptop": BRAIN / "faruzan_ws_lap_1791890157589.jpg"
        },
        "genshin-faruzan-teatime": {
            "mobile": BRAIN / "faruzan_tea_mob_1791889181026.jpg" if (BRAIN / "faruzan_tea_mob_1791889181026.jpg").exists() else BRAIN / "faruzan_tea_mob_1791890181026.jpg",
            "tablet": BRAIN / "faruzan_tea_tab_1791890193596.jpg",
            "laptop": BRAIN / "faruzan_tea_lap_1791890205762.jpg"
        },
        "genshin-hu-tao-prank": {
            "mobile": BRAIN / "hutao_prank_mob_1791890228280.jpg",
            "tablet": BRAIN / "hutao_prank_tab_1791890239599.jpg",
            "laptop": BRAIN / "hutao_prank_lap_1791890250850.jpg"
        },
    }

    # Configuration for all 12 designs
    designs_config = [
        # Faruzan
        ("genshin-faruzan-buffering", "ai", None),
        ("genshin-faruzan-workshop", "ai", None),
        ("genshin-faruzan-teatime", "ai", None),
        # Hu Tao
        ("genshin-hu-tao-prank", "ai", None),
        ("genshin-hu-tao-vigil", "compose", {
            "bg": ("#2b1f2e", "#442b47"), "sticker": stickers["hutao"],
            "motifs": "blossoms", "surface": "#2b1f2ed9", "border": "#784b7a"
        }),
        ("genshin-hu-tao-teatime", "compose", {
            "bg": ("#fcf1eb", "#f5dbd0"), "sticker": stickers["hutao"],
            "motifs": "blossoms", "surface": "#ffffffeb", "border": "#ddb9b1"
        }),
        # Mavuika
        ("genshin-mavuika-speed", "compose", {
            "bg": ("#fbf0e8", "#f4d6c8"), "sticker": stickers["mavuika"],
            "motifs": "flames", "surface": "#fffffff0", "border": "#f0bfad"
        }),
        ("genshin-mavuika-stadium", "compose", {
            "bg": ("#fdf5ec", "#f9e0c5"), "sticker": stickers["mavuika"],
            "motifs": "flames", "surface": "#fffffff0", "border": "#ecc89e"
        }),
        ("genshin-mavuika-hearth", "compose", {
            "bg": ("#eee5f2", "#f7dcd5"), "sticker": stickers["mavuika"],
            "motifs": "flames", "surface": "#ffffffeb", "border": "#cfbedd"
        }),
        # Columbina
        ("genshin-columbina-lullaby", "compose", {
            "bg": ("#f2f1f8", "#dedbe9"), "sticker": stickers["columbina"],
            "motifs": "wings", "surface": "#fffffff0", "border": "#c3bfde"
        }),
        ("genshin-columbina-elegance", "compose", {
            "bg": ("#f7eff3", "#ebd8e1"), "sticker": stickers["columbina"],
            "motifs": "wings", "surface": "#fffffff2", "border": "#d9bfc8"
        }),
        ("genshin-columbina-serenade", "compose", {
            "bg": ("#faf4f7", "#eedfe6"), "sticker": stickers["columbina"],
            "motifs": "wings", "surface": "#fffffff2", "border": "#e5cbd4"
        }),
    ]

    total_created = 0
    for design_id, mode, cfg in designs_config:
        design_dir = OUTPUT_DIR / design_id
        design_dir.mkdir(parents=True, exist_ok=True)
        print(f"Processing {design_id}...")

        for device, (tw, th) in SIZES.items():
            dest = design_dir / f"{device}.png"

            if mode == "ai" and design_id in ai_masters and device in ai_masters[design_id]:
                src_path = ai_masters[design_id][device]
                with Image.open(src_path) as im:
                    rendered = resize_fill_or_pad(im, tw, th, "#ffffff")
                    rendered.save(dest, "PNG")
            else:
                rendered = build_composed_wallpaper(
                    device=device,
                    bg_colors=cfg["bg"],
                    sticker=cfg["sticker"],
                    motifs=cfg["motifs"],
                    schedule_surface=cfg["surface"],
                    schedule_border=cfg["border"]
                )
                rendered.save(dest, "PNG")

            assert dest.exists(), f"Failed to save {dest}"
            with Image.open(dest) as check:
                assert check.size == (tw, th), f"Size mismatch for {dest}: {check.size} vs {(tw, th)}"
                assert check.mode == "RGB", f"Mode must be RGB for {dest}, got {check.mode}"

            total_created += 1
            print(f"  -> {device}.png: {tw}x{th} (OK)")

    print(f"\nAll {total_created} images successfully generated and verified!")

if __name__ == "__main__":
    main()
