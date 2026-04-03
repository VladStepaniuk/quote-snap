from PIL import Image, ImageDraw, ImageFont
import math, os

OUT = r"C:\Users\User\.openclaw\workspace\app1\shopify-app\quote-snap\store_assets"
SIZE = 1200
GREEN = (0, 128, 96)
WHITE = (255, 255, 255)
LIGHT_GREY = (240, 244, 248)
LIGHT_GREEN = (0, 179, 134)

def aa_scale(factor=4):
    return SIZE * factor

def rounded_rect(draw, xy, radius, fill, outline=None, outline_width=0):
    x0, y0, x1, y1 = xy
    draw.rounded_rectangle([x0, y0, x1, y1], radius=radius, fill=fill, outline=outline, width=outline_width)

# ── icon_v2: Speech bubble with quotation marks ──────────────────────────────
def make_v2():
    S = aa_scale(4)
    img = Image.new("RGBA", (S, S), WHITE + (255,))
    draw = ImageDraw.Draw(img)

    # Speech bubble body
    pad = int(S * 0.12)
    tail_h = int(S * 0.10)
    bubble_x0 = pad
    bubble_y0 = pad
    bubble_x1 = S - pad
    bubble_y1 = S - pad - tail_h
    radius = int(S * 0.12)
    draw.rounded_rectangle([bubble_x0, bubble_y0, bubble_x1, bubble_y1],
                            radius=radius, fill=GREEN)

    # Tail (bottom-left triangle)
    tail_tip_x = int(S * 0.22)
    tail_tip_y = S - pad + int(S * 0.02)
    tail_base_x0 = int(S * 0.14)
    tail_base_x1 = int(S * 0.38)
    tail_base_y = bubble_y1
    draw.polygon([
        (tail_base_x0, tail_base_y),
        (tail_base_x1, tail_base_y),
        (tail_tip_x, tail_tip_y)
    ], fill=GREEN)

    # Quotation marks — drawn as two pairs of circles + rectangles
    # Each " mark = two thick teardrops/circles with stems
    def draw_quote_mark(cx, cy, r, gap):
        # Two circles side by side
        for dx in [-gap, gap]:
            lx = cx + dx
            # Circle (dot)
            draw.ellipse([lx - r, cy - r, lx + r, cy + r], fill=WHITE)
            # Stem going up
            stem_w = int(r * 0.85)
            stem_h = int(r * 1.6)
            draw.rounded_rectangle([
                lx - stem_w, cy - r - stem_h,
                lx + stem_w, cy - r + int(r * 0.3)
            ], radius=stem_w, fill=WHITE)

    bubble_cx = S // 2
    bubble_cy = (bubble_y0 + bubble_y1) // 2 - int(S * 0.03)

    r = int(S * 0.075)
    gap = int(S * 0.072)
    spacing = int(S * 0.22)

    draw_quote_mark(bubble_cx - spacing // 2, bubble_cy, r, gap)
    draw_quote_mark(bubble_cx + spacing // 2, bubble_cy, r, gap)

    img = img.resize((SIZE, SIZE), Image.LANCZOS)
    img.save(os.path.join(OUT, "icon_v2.png"))
    print("icon_v2.png saved")

# ── icon_v3: Clipboard with lines + checkmark ────────────────────────────────
def make_v3():
    S = aa_scale(4)
    img = Image.new("RGBA", (S, S), WHITE + (255,))
    draw = ImageDraw.Draw(img)

    # Clipboard body
    cb_x0 = int(S * 0.18)
    cb_y0 = int(S * 0.16)
    cb_x1 = S - int(S * 0.18)
    cb_y1 = S - int(S * 0.10)
    radius = int(S * 0.07)
    draw.rounded_rectangle([cb_x0, cb_y0, cb_x1, cb_y1], radius=radius, fill=GREEN)

    # Clip (top center)
    clip_w = int(S * 0.22)
    clip_h = int(S * 0.10)
    clip_x0 = S // 2 - clip_w // 2
    clip_x1 = S // 2 + clip_w // 2
    clip_y0 = cb_y0 - int(S * 0.045)
    clip_y1 = cb_y0 + int(S * 0.055)
    clip_r = int(clip_h * 0.45)
    draw.rounded_rectangle([clip_x0, clip_y0, clip_x1, clip_y1],
                            radius=clip_r, fill=WHITE)
    # Inner clip hole
    hole_w = int(clip_w * 0.45)
    hole_h = int(clip_h * 0.55)
    hole_x0 = S // 2 - hole_w // 2
    hole_x1 = S // 2 + hole_w // 2
    hole_y0 = clip_y0 + int(clip_h * 0.2)
    hole_y1 = hole_y0 + hole_h
    draw.rounded_rectangle([hole_x0, hole_y0, hole_x1, hole_y1],
                            radius=int(hole_h * 0.4), fill=GREEN)

    # 3 horizontal lines on clipboard face
    line_x0 = int(S * 0.28)
    line_x1 = int(S * 0.62)
    line_w = int(S * 0.055)
    line_r = line_w // 2
    line_y_start = int(S * 0.38)
    line_gap = int(S * 0.13)
    for i in range(3):
        ly = line_y_start + i * line_gap
        draw.rounded_rectangle([line_x0, ly, line_x1, ly + line_w],
                                radius=line_r, fill=WHITE)

    # Checkmark circle (bottom right of clipboard)
    ck_cx = int(S * 0.70)
    ck_cy = int(S * 0.72)
    ck_r = int(S * 0.11)
    # Circle background (white)
    draw.ellipse([ck_cx - ck_r, ck_cy - ck_r, ck_cx + ck_r, ck_cy + ck_r], fill=WHITE)
    # Checkmark lines
    ck_lw = int(S * 0.028)
    # left arm of check
    p1 = (ck_cx - int(ck_r * 0.42), ck_cy + int(ck_r * 0.05))
    p2 = (ck_cx - int(ck_r * 0.05), ck_cy + int(ck_r * 0.42))
    p3 = (ck_cx + int(ck_r * 0.45), ck_cy - int(ck_r * 0.38))
    draw.line([p1, p2], fill=GREEN, width=ck_lw)
    draw.line([p2, p3], fill=GREEN, width=ck_lw)

    img = img.resize((SIZE, SIZE), Image.LANCZOS)
    img.save(os.path.join(OUT, "icon_v3.png"))
    print("icon_v3.png saved")

# ── icon_v4: Two overlapping speech bubbles ───────────────────────────────────
def make_v4():
    S = aa_scale(4)
    img = Image.new("RGBA", (S, S), LIGHT_GREY + (255,))
    draw = ImageDraw.Draw(img)

    radius = int(S * 0.11)
    tail_size = int(S * 0.09)

    # Back bubble (larger, green, bottom-left offset)
    b_x0 = int(S * 0.08)
    b_y0 = int(S * 0.10)
    b_x1 = int(S * 0.78)
    b_y1 = int(S * 0.70)
    draw.rounded_rectangle([b_x0, b_y0, b_x1, b_y1], radius=radius, fill=GREEN)
    # Tail bottom-left
    bt_base_y = b_y1
    draw.polygon([
        (b_x0 + int(S * 0.06), bt_base_y),
        (b_x0 + int(S * 0.22), bt_base_y),
        (b_x0 + int(S * 0.04), bt_base_y + tail_size),
    ], fill=GREEN)

    # Front bubble (smaller, white with green border, top-right)
    border = int(S * 0.018)
    f_x0 = int(S * 0.38)
    f_y0 = int(S * 0.32)
    f_x1 = int(S * 0.92)
    f_y1 = int(S * 0.86)
    f_r = int(S * 0.10)
    # Border (draw slightly larger green rect first)
    draw.rounded_rectangle([f_x0, f_y0, f_x1, f_y1], radius=f_r, fill=GREEN)
    # White fill inside
    draw.rounded_rectangle([f_x0 + border, f_y0 + border, f_x1 - border, f_y1 - border],
                            radius=max(f_r - border, 0), fill=WHITE)
    # Tail bottom-right
    ft_base_y = f_y1
    ft_tip_x = int(S * 0.86)
    ft_tip_y = f_y1 + int(tail_size * 0.9)
    ft_base_x0 = int(S * 0.68)
    ft_base_x1 = int(S * 0.84)
    # Border tail
    draw.polygon([
        (ft_base_x0, ft_base_y),
        (ft_base_x1, ft_base_y),
        (ft_tip_x, ft_tip_y),
    ], fill=GREEN)
    # White tail over border tail
    shrink = border
    draw.polygon([
        (ft_base_x0 + shrink, ft_base_y - shrink),
        (ft_base_x1 - shrink, ft_base_y - shrink),
        (ft_tip_x, ft_tip_y - shrink * 2),
    ], fill=WHITE)

    # Three dots inside white bubble
    dot_r = int(S * 0.038)
    dot_y = (f_y0 + f_y1) // 2 + int(S * 0.02)
    dot_gap = int(S * 0.095)
    dot_cx = (f_x0 + f_x1) // 2
    for dx in [-dot_gap, 0, dot_gap]:
        x = dot_cx + dx
        draw.ellipse([x - dot_r, dot_y - dot_r, x + dot_r, dot_y + dot_r], fill=GREEN)

    img = img.resize((SIZE, SIZE), Image.LANCZOS)
    img.save(os.path.join(OUT, "icon_v4.png"))
    print("icon_v4.png saved")

make_v2()
make_v3()
make_v4()
print("All icons generated.")
