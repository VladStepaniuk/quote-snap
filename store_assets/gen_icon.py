from PIL import Image, ImageDraw, ImageFilter
import math

SIZE = 1200
img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# Background with rounded corners
BG = (248, 250, 251, 255)
GREEN = (0, 128, 96, 255)
WHITE = (255, 255, 255, 255)

def rounded_rect(draw, xy, radius, fill):
    x0, y0, x1, y1 = xy
    draw.rectangle([x0 + radius, y0, x1 - radius, y1], fill=fill)
    draw.rectangle([x0, y0 + radius, x1, y1 - radius], fill=fill)
    draw.ellipse([x0, y0, x0 + 2*radius, y0 + 2*radius], fill=fill)
    draw.ellipse([x1 - 2*radius, y0, x1, y0 + 2*radius], fill=fill)
    draw.ellipse([x0, y1 - 2*radius, x0 + 2*radius, y1], fill=fill)
    draw.ellipse([x1 - 2*radius, y1 - 2*radius, x1, y1], fill=fill)

# Draw background
rounded_rect(draw, [0, 0, SIZE-1, SIZE-1], 200, BG)

# Shadow for speech bubble (slightly offset dark green)
shadow_color = (0, 90, 68, 80)
cx, cy = SIZE // 2, SIZE // 2 - 40

# Speech bubble dimensions
bw, bh = 720, 580
bx0 = cx - bw // 2
by0 = cy - bh // 2
bx1 = cx + bw // 2
by1 = cy + bh // 2
brad = 100

# Draw shadow
shadow_img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
sd = ImageDraw.Draw(shadow_img)
offset = 18
rounded_rect(sd, [bx0 + offset, by0 + offset, bx1 + offset, by1 + offset], brad, shadow_color)
# Tail shadow
tail_pts = [
    (cx - 80 + offset, by1 + offset),
    (cx - 180 + offset, by1 + 130 + offset),
    (cx + 60 + offset, by1 + offset),
]
sd.polygon(tail_pts, fill=shadow_color)
shadow_img = shadow_img.filter(ImageFilter.GaussianBlur(30))
img = Image.alpha_composite(img, shadow_img)
draw = ImageDraw.Draw(img)

# Draw speech bubble body
rounded_rect(draw, [bx0, by0, bx1, by1], brad, GREEN)

# Draw tail (bottom-left)
tail_pts = [
    (cx - 80, by1),
    (cx - 200, by1 + 140),
    (cx + 60, by1),
]
draw.polygon(tail_pts, fill=GREEN)

# Draw lightning bolt inside (white)
# Lightning bolt centered in bubble
lx, ly = cx, cy - 20  # center
# Bolt: top-right to center-left, then lower-right
bolt_scale = 1.0
bolt = [
    (lx + 60,  ly - 160),   # top right
    (lx - 10,  ly - 10),    # mid left
    (lx + 50,  ly - 10),    # mid right indent
    (lx - 60,  ly + 160),   # bottom left
    (lx + 10,  ly + 10),    # mid right lower
    (lx - 50,  ly + 10),    # mid left indent
]
draw.polygon(bolt, fill=WHITE)

# Save
img = img.convert("RGBA")
# Composite onto white for final PNG with no transparency
final = Image.new("RGB", (SIZE, SIZE), (248, 250, 251))
final.paste(img, mask=img.split()[3])
final.save(r"C:\Users\User\.openclaw\workspace\app1\shopify-app\quote-snap\store_assets\icon.png", "PNG")
print("Done!")
