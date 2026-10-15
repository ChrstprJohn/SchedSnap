"""Create review sheets from verified Canvas previews, without altering artwork."""
import json
import sys
from pathlib import Path
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parents[1]
output = root / ('output/genshin-namecards-2' if 'namecards-2' in sys.argv else 'output/genshin-backgrounds' if 'backgrounds' in sys.argv else 'output/genshin')
manifest = json.loads((output / 'manifest.json').read_text(encoding='utf-8'))
ids = list(dict.fromkeys(asset['id'] for asset in manifest['assets']))
for device in ('mobile', 'tablet', 'laptop'):
    cell_width = 320 if device != 'laptop' else 440
    cell_height = 780 if device == 'mobile' else 580 if device == 'tablet' else 300
    columns = 3 if len(ids) == 6 else min(5, len(ids))
    rows = (len(ids) + columns - 1) // columns
    sheet = Image.new('RGB', (cell_width * columns, cell_height * rows), '#e9e9ee')
    draw = ImageDraw.Draw(sheet)
    for index, design in enumerate(ids):
        x, y = (index % columns) * cell_width, (index // columns) * cell_height
        draw.text((x + 12, y + 12), design.replace('genshin-', '').replace('-', ' ').title(), fill='#282831')
        source = output / f'qa/{design}-{device}-sample.png'
        with Image.open(source) as original:
            thumb = original.convert('RGB')
            thumb.thumbnail((cell_width - 20, cell_height - 45), Image.Resampling.LANCZOS)
            sheet.paste(thumb, (x + (cell_width - thumb.width) // 2, y + 35))
    sheet.save(output / f'{device}-preview.jpg', quality=94)
print('Created mobile, tablet and laptop review sheets.')
