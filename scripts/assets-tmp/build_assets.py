from PIL import Image, ImageDraw, ImageFont

BASE = "/Users/barmoshe/diagraw"
TMP = f"{BASE}/scripts/assets-tmp"

master = Image.open(f"{TMP}/master.png").convert("RGBA")

BG_DARK = (3, 21, 39, 255)       # --bg
CANVAS_BG = (1, 14, 30, 255)     # --canvas-bg
CYAN = (111, 216, 255, 255)      # brand cyan (#6fd8ff)
OFFWHITE = (234, 245, 255, 255)  # --text on dark

def fit_transparent(size, src=master):
    return src.resize((size, size), Image.LANCZOS)

def solid_bg_icon(size, bg, pad_frac=0.14):
    canvas = Image.new("RGBA", (size, size), bg)
    inner = int(round(size * (1 - 2 * pad_frac)))
    logo = master.resize((inner, inner), Image.LANCZOS)
    off = (size - inner) // 2
    canvas.alpha_composite(logo, (off, off))
    return canvas

# 1. Next.js file-convention app icon (transparent, Next generates the <link> tags)
fit_transparent(256).save(f"{BASE}/src/app/icon.png")

# 2. Apple touch icon: solid bg (iOS does not render alpha reliably), slight padding
solid_bg_icon(180, BG_DARK).convert("RGB").save(f"{BASE}/src/app/apple-icon.png")

# 3. Classic favicon.ico multi-size, transparent
master.resize((256, 256), Image.LANCZOS).save(
    f"{BASE}/src/app/favicon.ico",
    sizes=[(16, 16), (32, 32), (48, 48), (64, 64)],
)

# 4. README / general-purpose master logo (transparent)
fit_transparent(1024).save(f"{BASE}/public/logo.png")

# 5. Small crisp nav logo (transparent)
fit_transparent(256).save(f"{BASE}/public/logo-nav.png")

# 6. Open Graph / Twitter card: dark blueprint canvas + grid + logo + wordmark
OG_W, OG_H = 1200, 630
og = Image.new("RGBA", (OG_W, OG_H), CANVAS_BG)
draw = ImageDraw.Draw(og)

# faint graph-paper grid, matching the site's canvas motif
grid_color = (111, 216, 255, 18)
step = 30
for x in range(0, OG_W, step):
    draw.line([(x, 0), (x, OG_H)], fill=grid_color, width=1)
for y in range(0, OG_H, step):
    draw.line([(0, y), (OG_W, y)], fill=grid_color, width=1)
strong_grid = (111, 216, 255, 34)
step2 = 150
for x in range(0, OG_W, step2):
    draw.line([(x, 0), (x, OG_H)], fill=strong_grid, width=1)
for y in range(0, OG_H, step2):
    draw.line([(0, y), (OG_W, y)], fill=strong_grid, width=1)

# corner registration marks
def corner_marks(d, size=1200, h=630, t=22, m=36):
    for cx, cy, dx, dy in [(m, m, 1, 1), (size - m, m, -1, 1), (m, h - m, 1, -1), (size - m, h - m, -1, -1)]:
        d.line([(cx, cy), (cx + dx * t, cy)], fill=CYAN, width=2)
        d.line([(cx, cy), (cx, cy + dy * t)], fill=CYAN, width=2)

corner_marks(draw)

# logo, left side
logo_size = 380
logo_img = master.resize((logo_size, logo_size), Image.LANCZOS)
logo_pos = (78, (OG_H - logo_size) // 2)
og.alpha_composite(logo_img, logo_pos)

# wordmark + tagline, right side
title_font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 92)
kicker_font = ImageFont.truetype("/System/Library/Fonts/SFNSMono.ttf", 28)
tag_font = ImageFont.truetype("/System/Library/Fonts/SFNSMono.ttf", 30)

text_x = 78 + logo_size + 56
draw.text((text_x, 178), "MERMAID, IN MOTION", font=kicker_font, fill=(111, 216, 255, 210))
draw.text((text_x, 222), "Diagraw", font=title_font, fill=OFFWHITE)
draw.text((text_x, 340), "Diagrams that draw", font=tag_font, fill=(178, 210, 230, 235))
draw.text((text_x, 380), "themselves.", font=tag_font, fill=CYAN)

# thin baseline rule under the wordmark block, blueprint dimension-line style
draw.line([(text_x, 440), (OG_W - 78, 440)], fill=(111, 216, 255, 90), width=1)
draw.text((text_x, 456), "barmoshe.github.io/diagraw", font=kicker_font, fill=(150, 180, 200, 200))

og.convert("RGB").save(f"{BASE}/src/app/opengraph-image.png", quality=95)
og.convert("RGB").save(f"{BASE}/src/app/twitter-image.png", quality=95)

print("done")
