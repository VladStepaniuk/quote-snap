from PIL import Image, ImageDraw, ImageFont
import os

# Canvas size (render at 2x, then downscale)
W, H = 2560, 1600
OUT_W, OUT_H = 1280, 800
OUT_DIR = os.path.dirname(os.path.abspath(__file__))

# Brand colours
C_PRIMARY = (0, 128, 96)        # #008060
C_DARK    = (17, 24, 39)        # #111827
C_LIGHT   = (249, 250, 251)     # #f9fafb
C_CARD    = (255, 255, 255)     # #ffffff
C_BORDER  = (229, 231, 235)     # #e5e7eb
C_MUTED   = (107, 114, 128)     # #6b7280
C_WHITE   = (255, 255, 255)
C_GREEN_LIGHT = (209, 250, 229) # light green badge bg
C_RED_LIGHT   = (254, 226, 226)
C_GREY_ICON   = (156, 163, 175)

FONTS_DIR = r"C:\Windows\Fonts"

def load_font(name, size):
    try:
        return ImageFont.truetype(os.path.join(FONTS_DIR, name), size)
    except:
        return None

def get_fonts():
    bold_names   = ["arialbd.ttf", "Arial Bold.ttf", "arial.ttf"]
    regular_names= ["arial.ttf", "Arial.ttf"]
    fonts = {}
    for sz_name, sz in [("h1",80),("h2",60),("h3",48),("h4",40),("body",34),("small",28),("xs",22)]:
        f = None
        for n in bold_names if "h" in sz_name else regular_names:
            f = load_font(n, sz)
            if f: break
        fonts[sz_name] = f or ImageFont.load_default()
    # bold variants
    for sz_name, sz in [("body_b",34),("small_b",28),("h4_b",40)]:
        f = None
        for n in bold_names:
            f = load_font(n, sz)
            if f: break
        fonts[sz_name] = f or ImageFont.load_default()
    return fonts

F = get_fonts()

def save(img, name):
    img = img.resize((OUT_W, OUT_H), Image.LANCZOS)
    img.save(os.path.join(OUT_DIR, name))
    print(f"Saved {name}")

def rounded_rect(draw, xy, radius, fill, outline=None, outline_width=2):
    x0,y0,x1,y1 = xy
    draw.rounded_rectangle([x0,y0,x1,y1], radius=radius, fill=fill,
                            outline=outline, width=outline_width)

def shadow_card(img, draw, xy, radius=24, fill=C_CARD, shadow_offset=6, shadow_blur=20):
    x0,y0,x1,y1 = xy
    # simple shadow: draw darker rounded rect offset
    shadow_img = Image.new("RGBA", img.size, (0,0,0,0))
    sd = ImageDraw.Draw(shadow_img)
    sd.rounded_rectangle([x0+shadow_offset, y0+shadow_offset, x1+shadow_offset, y1+shadow_offset],
                         radius=radius, fill=(0,0,0,40))
    img.paste(Image.alpha_composite(img.convert("RGBA"), shadow_img).convert("RGB"), (0,0))
    draw.rounded_rectangle([x0,y0,x1,y1], radius=radius, fill=fill, outline=C_BORDER, width=2)

def text_center(draw, text, cx, y, font, fill):
    bbox = draw.textbbox((0,0), text, font=font)
    w = bbox[2]-bbox[0]
    draw.text((cx - w//2, y), text, font=font, fill=fill)

def text_left(draw, text, x, y, font, fill):
    draw.text((x, y), text, font=font, fill=fill)

def pill(draw, cx, cy, w, h, fill, text, tfont, tfill):
    draw.rounded_rectangle([cx-w//2, cy-h//2, cx+w//2, cy+h//2], radius=h//2, fill=fill)
    text_center(draw, text, cx, cy-h//2+6, tfont, tfill)

def green_dot(draw, x, y, r=10):
    draw.ellipse([x-r, y-r, x+r, y+r], fill=C_PRIMARY)

def toggle_on(draw, x, y):
    # pill shaped toggle
    draw.rounded_rectangle([x, y, x+80, y+40], radius=20, fill=C_PRIMARY)
    draw.ellipse([x+44, y+4, x+76, y+36], fill=C_WHITE)

def toggle_off(draw, x, y):
    draw.rounded_rectangle([x, y, x+80, y+40], radius=20, fill=C_BORDER)
    draw.ellipse([x+4, y+4, x+36, y+36], fill=C_WHITE)

def header_bar(draw, title="QuoteSnap", tabs=None):
    # 80px header -> 160px at 2x
    draw.rectangle([0,0,W,160], fill=C_PRIMARY)
    text_left(draw, title, 80, 48, F["h2"], C_WHITE)
    if tabs:
        tx = W - 80
        for t in reversed(tabs):
            bbox = draw.textbbox((0,0), t, font=F["small"])
            tw = bbox[2]-bbox[0]
            draw.text((tx-tw, 66), t, font=F["small"], fill=(255,255,255,200))
            tx -= tw + 60

def bottom_banner(draw, text):
    draw.rectangle([0, H-180, W, H], fill=C_PRIMARY)
    text_center(draw, text, W//2, H-140, F["h3"], C_WHITE)

# ─── SCREENSHOT 1 ────────────────────────────────────────────────────────────
def make_screenshot1():
    img = Image.new("RGB", (W,H), C_LIGHT)
    draw = ImageDraw.Draw(img)

    header_bar(draw, "QuoteSnap", ["Dashboard", "Inbox", "Billing", "Settings"])

    # Stat cards row
    card_y0, card_y1 = 220, 400
    stats = [("12", "Total quotes"), ("8", "Last 30 days"), ("2/5", "Rules used  ·  Starter")]
    card_w = 740
    gaps = [100, 960, 1820]
    for i,(val,lbl) in enumerate(stats):
        x0 = gaps[i]
        shadow_card(img, draw, [x0, card_y0, x0+card_w, card_y1])
        draw = ImageDraw.Draw(img)
        text_left(draw, val, x0+50, card_y0+40, F["h1"], C_PRIMARY)
        text_left(draw, lbl, x0+50, card_y0+150, F["body"], C_MUTED)

    # Two column cards
    col1_x0, col1_x1 = 100, 1220
    col2_x0, col2_x1 = 1340, 2460
    col_y0, col_y1 = 460, 1100

    shadow_card(img, draw, [col1_x0, col_y0, col1_x1, col_y1])
    draw = ImageDraw.Draw(img)
    text_left(draw, "Visibility rules", col1_x0+50, col_y0+40, F["h4_b"], C_DARK)

    # Rule rows
    rules = [
        ("All products", "All visitors", True),
        ("Specific product", "Tagged customers (VIP)", True),
    ]
    ry = col_y0 + 120
    for (scope, aud, on) in rules:
        draw.rounded_rectangle([col1_x0+40, ry-10, col1_x1-40, ry+80], radius=12,
                                fill=C_LIGHT, outline=C_BORDER, width=2)
        green_dot(draw, col1_x0+80, ry+30)
        text_left(draw, f"{scope}  —  {aud}", col1_x0+110, ry+10, F["body"], C_DARK)
        if on:
            toggle_on(draw, col1_x1-160, ry+10)
        else:
            toggle_off(draw, col1_x1-160, ry+10)
        ry += 120

    # Add rule button
    btn_y = ry + 20
    draw.rounded_rectangle([col1_x0+40, btn_y, col1_x0+360, btn_y+72], radius=16, fill=C_PRIMARY)
    text_left(draw, "+ Add rule", col1_x0+80, btn_y+14, F["body_b"], C_WHITE)

    # Recent quotes card
    shadow_card(img, draw, [col2_x0, col_y0, col2_x1, col_y1])
    draw = ImageDraw.Draw(img)
    text_left(draw, "Recent quotes", col2_x0+50, col_y0+40, F["h4_b"], C_DARK)

    quotes = [
        ("James Wilson", "james@acmeco.com", "Industrial Pump X200", "Need a quote for 50 units"),
        ("Sarah Chen", "sarah@designstudio.io", "Custom Embroidery Pack", ""),
    ]
    qy = col_y0 + 120
    for (name, email, product, msg) in quotes:
        draw.rounded_rectangle([col2_x0+40, qy-10, col2_x1-40, qy+160], radius=12,
                                fill=C_LIGHT, outline=C_BORDER, width=2)
        # Avatar circle
        av_cx, av_cy = col2_x0+100, qy+70
        draw.ellipse([av_cx-44, av_cy-44, av_cx+44, av_cy+44], fill=C_PRIMARY)
        initials = "".join(p[0] for p in name.split()[:2])
        bbox = draw.textbbox((0,0), initials, font=F["body_b"])
        iw = bbox[2]-bbox[0]
        draw.text((av_cx-iw//2, av_cy-22), initials, font=F["body_b"], fill=C_WHITE)

        text_left(draw, name, col2_x0+170, qy+10, F["body_b"], C_DARK)
        text_left(draw, email, col2_x0+170, qy+58, F["small"], C_MUTED)
        text_left(draw, product, col2_x0+170, qy+98, F["small"], C_PRIMARY)
        if msg:
            # truncate
            text_left(draw, f'"{msg}"', col2_x0+170, qy+132, F["xs"], C_MUTED)
        qy += 200

    bottom_banner(draw, "All your quote requests. One place.")
    save(img, "screenshot1.png")

# ─── SCREENSHOT 2 ────────────────────────────────────────────────────────────
def make_screenshot2():
    img = Image.new("RGB", (W,H), C_WHITE)
    draw = ImageDraw.Draw(img)

    # Simple store top nav bar (generic)
    draw.rectangle([0,0,W,100], fill=C_LIGHT)
    draw.rectangle([0,98,W,100], fill=C_BORDER)
    text_left(draw, "MyStore", 80, 28, F["h3"], C_DARK)
    for i, nav in enumerate(["Home", "Products", "About", "Contact"]):
        text_left(draw, nav, 600+i*200, 34, F["body"], C_MUTED)

    # Product area
    img_x0, img_y0 = 160, 180
    img_x1, img_y1 = img_x0+760, img_y0+760
    draw.rounded_rectangle([img_x0, img_y0, img_x1, img_y1], radius=24, fill=C_LIGHT, outline=C_BORDER, width=3)

    # Shopping bag icon (simple outline)
    bx, by = (img_x0+img_x1)//2, (img_y0+img_y1)//2
    # bag body
    draw.rounded_rectangle([bx-80, by-60, bx+80, by+100], radius=12, outline=C_GREY_ICON, width=6)
    # bag handle
    draw.arc([bx-50, by-120, bx+50, by-30], start=0, end=180, fill=C_GREY_ICON, width=6)

    # Product details right side
    rx = img_x1 + 120
    ry = img_y0

    text_left(draw, "Industrial Safety Gloves", rx, ry, F["h2"], C_DARK)
    text_left(draw, "Heavy Duty", rx, ry+80, F["h3"], C_MUTED)
    ry += 180

    desc = "Perfect for B2B and wholesale orders."
    text_left(draw, desc, rx, ry, F["body"], C_MUTED)
    text_left(draw, "Price available on request.", rx, ry+50, F["body"], C_MUTED)
    ry += 150

    # Price strikethrough + badge
    price_font = F["body"]
    draw.text((rx, ry), "£149.00", font=price_font, fill=C_MUTED)
    bbox = draw.textbbox((rx,ry), "£149.00", font=price_font)
    mid_y = (bbox[1]+bbox[3])//2
    draw.line([bbox[0], mid_y, bbox[2], mid_y], fill=C_MUTED, width=3)
    # badge
    badge_x = bbox[2]+30
    draw.rounded_rectangle([badge_x, ry-4, badge_x+320, ry+50], radius=12, fill=C_GREEN_LIGHT)
    text_left(draw, "Price on request", badge_x+16, ry+4, F["small"], C_PRIMARY)
    ry += 110

    # CTA Button
    btn_w = 680
    draw.rounded_rectangle([rx, ry, rx+btn_w, ry+100], radius=20, fill=C_PRIMARY)
    text_center(draw, "Request a Quote  →", rx+btn_w//2, ry+22, F["h4_b"], C_WHITE)
    ry += 140

    text_left(draw, "Fill in a short form — we'll get back to you within 24 hours", rx, ry, F["small"], C_MUTED)

    bottom_banner(draw, "Replace 'Add to Cart' with a quote button — no coding needed")
    save(img, "screenshot2.png")

# ─── SCREENSHOT 3 ────────────────────────────────────────────────────────────
def make_screenshot3():
    img = Image.new("RGB", (W,H), C_LIGHT)
    draw = ImageDraw.Draw(img)

    # Faint background grid / dots for depth
    for gx in range(0, W, 80):
        for gy in range(0, H, 80):
            draw.ellipse([gx-3,gy-3,gx+3,gy+3], fill=C_BORDER)

    # Central card
    card_x0, card_y0 = 580, 80
    card_x1, card_y1 = W-580, H-200
    shadow_card(img, draw, [card_x0, card_y0, card_x1, card_y1], radius=32)
    draw = ImageDraw.Draw(img)

    # Card title
    text_left(draw, "Add visibility rule", card_x0+60, card_y0+50, F["h3"], C_DARK)
    # Close X
    text_left(draw, "✕", card_x1-100, card_y0+46, F["h3"], C_MUTED)

    def field(label, value, y, is_select=False):
        text_left(draw, label, card_x0+60, y, F["small_b"], C_DARK)
        fy = y+44
        draw.rounded_rectangle([card_x0+60, fy, card_x1-60, fy+72], radius=14,
                                fill=C_WHITE, outline=C_BORDER, width=2)
        text_left(draw, value, card_x0+100, fy+16, F["body"], C_DARK)
        if is_select:
            text_left(draw, "▾", card_x1-120, fy+16, F["body"], C_MUTED)
        return fy+72+30

    y = card_y0 + 160
    y = field("Rule name", "Wholesale customers", y)
    y = field("Scope", "All products", y, True)
    y = field("Audience", "Tagged customers", y, True)
    y = field("Customer tag", "wholesale", y)
    y = field("Button label", "Request a Quote", y)

    # Checkboxes
    y += 10
    for label in ["Hide price", "Replace Add to Cart"]:
        draw.rounded_rectangle([card_x0+60, y, card_x0+104, y+44], radius=8, fill=C_PRIMARY)
        text_left(draw, "✓", card_x0+70, y+4, F["body_b"], C_WHITE)
        text_left(draw, label, card_x0+120, y+4, F["body"], C_DARK)
        y += 76

    y += 30
    # Save button
    draw.rounded_rectangle([card_x0+60, y, card_x0+360, y+80], radius=16, fill=C_PRIMARY)
    text_center(draw, "Save rule", card_x0+210, y+16, F["body_b"], C_WHITE)
    # Cancel link
    text_left(draw, "Cancel", card_x0+420, y+20, F["body"], C_MUTED)

    bottom_banner(draw, "Target the right customers with flexible rules")
    save(img, "screenshot3.png")

# ─── SCREENSHOT 4 ────────────────────────────────────────────────────────────
def make_screenshot4():
    img = Image.new("RGB", (W,H), C_LIGHT)
    draw = ImageDraw.Draw(img)

    # Left inbox card
    lx0, lx1 = 80, 1200
    ly0, ly1 = 80, H-200
    shadow_card(img, draw, [lx0, ly0, lx1, ly1])
    draw = ImageDraw.Draw(img)

    text_left(draw, "Inbox", lx0+60, ly0+44, F["h3"], C_DARK)
    # small badge
    draw.rounded_rectangle([lx0+260, ly0+48, lx0+340, ly0+96], radius=20, fill=C_GREEN_LIGHT)
    text_center(draw, "3", lx0+300, ly0+52, F["small_b"], C_PRIMARY)

    inbox_items = [
        ("James Wilson", "james@acmeco.com", "Industrial Pump X200", "2 min ago", True),
        ("Sarah Chen", "sarah@designstudio.io", "Custom Embroidery Pack", "1 hr ago", False),
        ("Marco Rossi", "marco@buildpro.it", "Safety Harness Kit — Pro", "Yesterday", False),
    ]
    iy = ly0 + 140
    for (name, email, product, time, unread) in inbox_items:
        row_fill = (240, 253, 244) if unread else C_LIGHT
        draw.rounded_rectangle([lx0+40, iy, lx1-40, iy+170], radius=16, fill=row_fill, outline=C_BORDER, width=2)
        if unread:
            draw.ellipse([lx0+56, iy+70, lx0+76, iy+90], fill=C_PRIMARY)

        # Avatar
        av_cx = lx0+130
        av_cy = iy+85
        draw.ellipse([av_cx-48, av_cy-48, av_cx+48, av_cy+48], fill=C_PRIMARY)
        initials = "".join(p[0] for p in name.split()[:2])
        bbox = draw.textbbox((0,0), initials, font=F["body_b"])
        iw = bbox[2]-bbox[0]
        draw.text((av_cx-iw//2, av_cy-22), initials, font=F["body_b"], fill=C_WHITE)

        text_left(draw, name, lx0+200, iy+20, F["body_b"], C_DARK)
        text_left(draw, email, lx0+200, iy+66, F["small"], C_MUTED)
        text_left(draw, product, lx0+200, iy+106, F["small"], C_PRIMARY)
        # time right
        bbox = draw.textbbox((0,0), time, font=F["xs"])
        tw = bbox[2]-bbox[0]
        draw.text((lx1-80-tw, iy+20), time, font=F["xs"], fill=C_MUTED)
        iy += 200

    # Right email card
    rx0, rx1 = 1300, W-80
    ry0, ry1 = 80, H-200
    shadow_card(img, draw, [rx0, ry0, rx1, ry1])
    draw = ImageDraw.Draw(img)

    # Logo mark
    lm_cx, lm_cy = rx0+100, ry0+100
    draw.ellipse([lm_cx-52, lm_cy-52, lm_cx+52, lm_cy+52], fill=C_PRIMARY)
    bbox = draw.textbbox((0,0), "Q", font=F["h3"])
    qw = bbox[2]-bbox[0]
    draw.text((lm_cx-qw//2, lm_cy-38), "Q", font=F["h3"], fill=C_WHITE)

    text_left(draw, "Email notification", rx0+180, ry0+60, F["h4_b"], C_DARK)
    text_left(draw, "Sent automatically on each new request", rx0+180, ry0+114, F["small"], C_MUTED)

    # Divider
    draw.line([rx0+60, ry0+180, rx1-60, ry0+180], fill=C_BORDER, width=2)

    # Email meta
    emy = ry0+210
    def email_row(label, val, y):
        text_left(draw, label, rx0+60, y, F["small_b"], C_MUTED)
        text_left(draw, val, rx0+200, y, F["small"], C_DARK)
        return y+60

    emy = email_row("To:", "merchant@mystore.com", emy)
    emy = email_row("From:", "noreply@quotesnap.app", emy)
    emy = email_row("Subject:", "New quote request — Industrial Pump X200", emy)

    draw.line([rx0+60, emy+10, rx1-60, emy+10], fill=C_BORDER, width=2)
    emy += 60

    # Body
    body_lines = [
        "Hi there,",
        "",
        "James Wilson (james@acmeco.com) has submitted a new",
        "quote request from your store.",
        "",
        "Product:    Industrial Pump X200",
        "Message:  \"Need a quote for 50 units\"",
        "",
    ]
    for line in body_lines:
        if line:
            text_left(draw, line, rx0+60, emy, F["body"], C_DARK)
        emy += 52

    # CTA link in email
    draw.rounded_rectangle([rx0+60, emy, rx0+480, emy+76], radius=14, fill=C_PRIMARY)
    text_center(draw, "View in QuoteSnap  →", rx0+270, emy+16, F["body_b"], C_WHITE)

    bottom_banner(draw, "Get notified instantly for every quote request")
    save(img, "screenshot4.png")

if __name__ == "__main__":
    make_screenshot1()
    make_screenshot2()
    make_screenshot3()
    make_screenshot4()
    print("All screenshots generated.")
