"""Generate app.ico for Daily AI Digest using Pillow.

Uses the project's primary brand color (#00ff88 neon green on #0a0a0f dark)
with a simple circuit/AI node symbol.
"""

from PIL import Image, ImageDraw, ImageFont

SIZES = [16, 32, 48, 64, 128, 256, 512]
SUPERSAMPLE = 4  # Render at 4x then downscale for crisp anti-aliasing
BG_COLOR = (10, 10, 15)       # #0a0a0f
ACCENT_COLOR = (0, 255, 136)  # #00ff88


def draw_icon(size):
    """Draw at SUPERSAMPLE * size then downscale for crisp results."""
    ss = size * SUPERSAMPLE
    img = Image.new('RGBA', (ss, ss), BG_COLOR + (255,))
    draw = ImageDraw.Draw(img)

    margin = ss * 0.15
    center = ss / 2

    # Draw a rounded square border
    draw.rounded_rectangle(
        [margin, margin, ss - margin, ss - margin],
        radius=ss * 0.15,
        outline=ACCENT_COLOR,
        width=max(2, ss // 32),
    )

    # Draw "AI" text centered
    font_size = int(ss * 0.38)
    try:
        font = ImageFont.truetype('consola.ttf', font_size)
    except OSError:
        try:
            font = ImageFont.truetype('cour.ttf', font_size)
        except OSError:
            font = ImageFont.load_default()

    text = 'AI'
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    tx = center - tw / 2
    ty = center - th / 2 - bbox[1]
    draw.text((tx, ty), text, fill=ACCENT_COLOR, font=font)

    # Draw small dots at corners (circuit nodes)
    dot_r = max(2, ss // 24)
    positions = [
        (margin, margin),
        (ss - margin, margin),
        (margin, ss - margin),
        (ss - margin, ss - margin),
    ]
    for x, y in positions:
        draw.ellipse(
            [x - dot_r, y - dot_r, x + dot_r, y + dot_r],
            fill=ACCENT_COLOR,
        )

    # Downscale with high-quality resampling
    return img.resize((size, size), Image.LANCZOS)


if __name__ == '__main__':
    import os

    icons = [draw_icon(s) for s in SIZES]
    out_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'app.ico')
    icons[0].save(
        out_path,
        format='ICO',
        sizes=[(s, s) for s in SIZES],
        append_images=icons[1:],
    )
    print(f'Icon saved to {out_path}')
