import colorsys
from PIL import Image

SRC = "/Users/barmoshe/Downloads/2e9c3681-dffc-48f3-801d-09c5e7cd6832.png"
OUT_DIR = "/Users/barmoshe/diagraw/scripts/assets-tmp"

im = Image.open(SRC).convert("RGB")
w, h = im.size
px = im.load()

out = Image.new("RGBA", (w, h))
opx = out.load()

S_LO, S_HI = 0.05, 0.16

for y in range(h):
    for x in range(w):
        r, g, b = px[x, y]
        hh, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
        if s <= S_LO:
            a = 0.0
        elif s >= S_HI:
            a = 1.0
        else:
            a = (s - S_LO) / (S_HI - S_LO)
        opx[x, y] = (r, g, b, int(round(a * 255)))

# crop to content bounding box with padding
bbox = out.getbbox()
pad_frac = 0.04
bx0, by0, bx1, by1 = bbox
bw, bh = bx1 - bx0, by1 - by0
pad = int(round(max(bw, bh) * pad_frac))
side = max(bw, bh) + pad * 2
cx, cy = (bx0 + bx1) // 2, (by0 + by1) // 2
half = side // 2
crop_box = (cx - half, cy - half, cx - half + side, cy - half + side)

square = Image.new("RGBA", (side, side), (0, 0, 0, 0))
# paste with clamping in case crop_box exceeds original bounds
src_crop = out.crop((max(0, crop_box[0]), max(0, crop_box[1]), min(w, crop_box[2]), min(h, crop_box[3])))
paste_x = max(0, -crop_box[0])
paste_y = max(0, -crop_box[1])
square.paste(src_crop, (paste_x, paste_y), src_crop)

square.save(f"{OUT_DIR}/master.png")
print("master size:", square.size, "bbox:", bbox)
