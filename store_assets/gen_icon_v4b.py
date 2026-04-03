from PIL import Image, ImageDraw
import math

S = 4800  # render size
FINAL = 1200
OUT = r"C:\Users\User\.openclaw\workspace\app1\shopify-app\quote-snap\store_assets\icon_v4b.png"

scale = S / FINAL

def s(v):
    """Scale a value from 1200-space to S-space."""
    if isinstance(v, (list, tuple)):
        return [int(x * scale) for x in v]
    return int(v * scale)

# Colors
BG = "#f0f4f8"
GREEN = "#008060"
WHITE = "#ffffff"
SHADOW = (0, 0, 0, 40)

img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# ── Background with rounded corners ──────────────────────────────────────────
bg_r = s(220)
bg_layer = Image.new("RGBA", (S, S), (0, 0, 0, 0))
bg_draw = ImageDraw.Draw(bg_layer)
bg_draw.rounded_rectangle([0, 0, S-1, S-1], radius=bg_r, fill=BG)
img = Image.alpha_composite(img, bg_layer)

def draw_shadow(base_img, rect, radius, offset=(0, 0), blur_r=30, alpha=40, color=(0,0,0)):
    """Approximate soft shadow by drawing offset rounded rects with decreasing alpha."""
    ox, oy = int(offset[0]*scale), int(offset[1]*scale)
    br = int(blur_r * scale)
    layers = 18
    for i in range(layers, 0, -1):
        t = i / layers
        a = int(alpha * t * t)
        expand = int(br * (1 - t))
        r = [rect[0] - expand + ox, rect[1] - expand + oy,
             rect[2] + expand + ox, rect[3] + expand + oy]
        layer = Image.new("RGBA", (S, S), (0, 0, 0, 0))
        d = ImageDraw.Draw(layer)
        d.rounded_rectangle(r, radius=radius + expand, fill=(*color, a))
        base_img = Image.alpha_composite(base_img, layer)
    return base_img

# ── LARGE bubble (green, center-left, slightly up) ───────────────────────────
# In 1200-space: 580x460, center around (490, 540)
lw, lh = s(580), s(460)
lx = s(200)   # left edge
ly = s(310)   # top edge  → center ~540
lr = s(72)    # corner radius

large_rect = [lx, ly, lx + lw, ly + lh]
img = draw_shadow(img, large_rect, lr, offset=(8, 10), blur_r=28, alpha=45)

# Draw large bubble body
layer = Image.new("RGBA", (S, S), (0, 0, 0, 0))
d = ImageDraw.Draw(layer)
d.rounded_rectangle(large_rect, radius=lr, fill=GREEN)
img = Image.alpha_composite(img, layer)

# Tail pointing bottom-left: triangle below bottom-left of bubble
tail_layer = Image.new("RGBA", (S, S), (0, 0, 0, 0))
td = ImageDraw.Draw(tail_layer)
tx_base = lx + s(80)
ty_base = ly + lh - s(2)
tail_pts = [
    (lx + s(40), ty_base),
    (tx_base, ty_base),
    (lx + s(15), ty_base + s(55)),
]
td.polygon(tail_pts, fill=GREEN)
img = Image.alpha_composite(img, tail_layer)

# Three white dots inside large bubble
dot_r = s(14)  # radius → 28px diameter
dot_y = ly + lh // 2
dot_spacing = s(58)
dot_cx = lx + lw // 2
dot_positions = [dot_cx - dot_spacing, dot_cx, dot_cx + dot_spacing]

dot_layer = Image.new("RGBA", (S, S), (0, 0, 0, 0))
dd = ImageDraw.Draw(dot_layer)
for dx in dot_positions:
    dd.ellipse([dx - dot_r, dot_y - dot_r, dx + dot_r, dot_y + dot_r], fill=WHITE)
img = Image.alpha_composite(img, dot_layer)

# ── SMALL bubble (white, center-right, overlapping) ──────────────────────────
sw, sh = s(320), s(240)
sx = s(590)   # left edge
sy = s(440)   # top edge
sr = s(52)
border = s(8)

small_rect = [sx, sy, sx + sw, sy + sh]
img = draw_shadow(img, small_rect, sr, offset=(6, 8), blur_r=22, alpha=50)

# Border layer
border_layer = Image.new("RGBA", (S, S), (0, 0, 0, 0))
bd = ImageDraw.Draw(border_layer)
bd.rounded_rectangle(small_rect, radius=sr, fill=GREEN)
img = Image.alpha_composite(img, border_layer)

# White fill (inset by border)
inner_rect = [sx + border, sy + border, sx + sw - border, sy + sh - border]
inner_r = max(sr - border, 0)
fill_layer = Image.new("RGBA", (S, S), (0, 0, 0, 0))
fd = ImageDraw.Draw(fill_layer)
fd.rounded_rectangle(inner_rect, radius=inner_r, fill=WHITE)
img = Image.alpha_composite(img, fill_layer)

# Tail pointing bottom-right
tail2_layer = Image.new("RGBA", (S, S), (0, 0, 0, 0))
td2 = ImageDraw.Draw(tail2_layer)
tx2 = sx + sw - s(80)
ty2 = sy + sh - s(2)
tail2_pts = [
    (tx2, ty2),
    (sx + sw - s(40), ty2),
    (sx + sw - s(15), ty2 + s(55)),
]
td2.polygon(tail2_pts, fill=GREEN)
img = Image.alpha_composite(img, tail2_layer)

# White fill over tail border overlap
tail2_fill_layer = Image.new("RGBA", (S, S), (0, 0, 0, 0))
tf2 = ImageDraw.Draw(tail2_fill_layer)
tail2_fill_pts = [
    (tx2 + border, ty2 - border),
    (sx + sw - s(40) - border, ty2 - border),
    (sx + sw - s(15) - border//2, ty2 + s(55) - border*2),
]
tf2.polygon(tail2_fill_pts, fill=WHITE)
img = Image.alpha_composite(img, tail2_fill_layer)

# ── Price tag icon inside small bubble ───────────────────────────────────────
# Centered in small bubble: ~100x120px (in 1200-space)
tag_w, tag_h = s(100), s(120)
tag_cx = sx + sw // 2
tag_cy = sy + sh // 2

tag_layer = Image.new("RGBA", (S, S), (0, 0, 0, 0))
tg = ImageDraw.Draw(tag_layer)

# Price tag shape: rounded rect body + pointed bottom (like a shield/tag)
# Build as polygon with rounded top corners approximated
tr = s(18)  # corner radius for tag
tx0 = tag_cx - tag_w // 2
ty0 = tag_cy - tag_h // 2
tx1 = tag_cx + tag_w // 2
# Body height (top rounded rect portion): ~85% of total height
body_h = int(tag_h * 0.80)
ty_body_bot = ty0 + body_h
ty1 = ty0 + tag_h  # tip of pointed bottom

# Draw rounded rect for body
tg.rounded_rectangle([tx0, ty0, tx1, ty_body_bot], radius=tr, fill=GREEN)

# Triangle for pointed bottom (overlapping slightly with body)
tip_pts = [
    (tx0, ty_body_bot - s(8)),
    (tx1, ty_body_bot - s(8)),
    (tag_cx, ty1),
]
tg.polygon(tip_pts, fill=GREEN)

# Small circle hole at top center
hole_r = s(11)
hole_cx = tag_cx
hole_cy = ty0 + s(22)
tg.ellipse([hole_cx - hole_r, hole_cy - hole_r,
            hole_cx + hole_r, hole_cy + hole_r], fill=WHITE)

img = Image.alpha_composite(img, tag_layer)

# ── Downscale & save ──────────────────────────────────────────────────────────
final = img.resize((FINAL, FINAL), Image.LANCZOS)

# Flatten onto white (just in case) — actually keep transparency for store assets
# Convert to RGB with white bg for PNG that some tools need, but store as RGBA
final.save(OUT, "PNG")
print(f"Saved: {OUT}")
