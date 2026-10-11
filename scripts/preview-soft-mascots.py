"""Make review proofs and validate the packaged mascot files."""
from pathlib import Path
import sys
import json
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
PACK = sys.argv[sys.argv.index('--pack') + 1] if '--pack' in sys.argv else ('pixel-mascots' if '--pixel' in sys.argv else 'mascots')
if PACK not in {'mascots', 'pixel-mascots', 'goofy-mascots', 'doodle-mascots'}:
    raise SystemExit('Unknown mascot pack')
PIXEL = PACK == 'pixel-mascots'
LABEL = 'soft-mascots' if PACK == 'mascots' else PACK
BASE = ROOT / 'public/images' / PACK
OUT = ROOT / 'documentation/previews'
OUT.mkdir(parents=True, exist_ok=True)
manifest = json.loads((BASE / 'manifest.json').read_text())
assets = manifest['assets']
columns, cell = 5, 280
rows = (len(assets) + columns - 1) // columns
sheet = Image.new('RGB', (columns * cell, rows * (cell + 32)), '#faf6ef')
draw = ImageDraw.Draw(sheet)
for index, record in enumerate(assets):
    image = Image.open(ROOT / 'public' / record['master'].lstrip('/')).convert('RGBA')
    image = image.crop(image.getchannel('A').getbbox())
    image.thumbnail((240, 240), Image.Resampling.NEAREST if PIXEL else Image.Resampling.LANCZOS)
    x, y = (index % columns) * cell, (index // columns) * (cell + 32)
    sheet.paste(image, (x + (cell - image.width) // 2, y + (cell - image.height) // 2), image)
    draw.text((x + 14, y + cell), record['id'], fill='#182b43')
    for device, spec in record.get('formats', {}).items():
        for extension in ['png', 'webp']:
            path = ROOT / 'public' / spec[extension].lstrip('/')
            with Image.open(path) as export:
                assert export.size == (spec['width'], spec['height']), str(path)
                assert export.mode == 'RGBA', str(path)
                assert export.getchannel('A').getextrema() == (0, 255), str(path)
                assert export.getchannel('A').getbbox() is not None, str(path)
sheet.save(OUT / f'{LABEL}-contact-sheet.jpg', quality=94)

proof = Image.new('RGB', (1200, 620), '#faf6ef')
if not assets[0].get('formats'):
    print(f'Validated {len(assets)} transparent master cutouts and saved contact sheet.')
    sys.exit(0)
draw = ImageDraw.Draw(proof)
for i, device in enumerate(['mobile', 'tablet', 'laptop']):
    spec = assets[0]['formats'][device]
    image = Image.open(ROOT / 'public' / spec['png'].lstrip('/')).convert('RGBA')
    image.thumbnail((360, 550), Image.Resampling.NEAREST if PIXEL else Image.Resampling.LANCZOS)
    background = Image.new('RGBA', image.size, '#dce9e3')
    background.alpha_composite(image)
    x, y = i * 400 + (400 - image.width) // 2, 30
    proof.paste(background.convert('RGB'), (x, y))
    draw.text((i * 400 + 30, 590), f"{device}: {spec['width']} x {spec['height']}", fill='#182b43')
proof.save(OUT / f'{LABEL}-device-proof.jpg', quality=94)
print(f'Validated {len(assets)} masters and {len(assets) * 6} transparent device exports.')
