from PIL import Image, ImageOps, ImageDraw
import json
from pathlib import Path

root = Path('documentation/previews/onepiece-adventure')
variants = [variant for number in range(1, 5) for variant in json.loads(Path(f'documentation/onepiece-adventure-reference-{number}.json').read_text(encoding='utf-8'))['variants']]
for device, size in {'mobile': (270, 600), 'tablet': (270, 432), 'laptop': (360, 203)}.items():
    sheet = Image.new('RGB', (4 * (size[0] + 20) + 20, 3 * (size[1] + 50) + 20), '#f1f3f5')
    draw = ImageDraw.Draw(sheet)
    for index, variant in enumerate(variants):
        x = 20 + index % 4 * (size[0] + 20)
        y = 20 + index // 4 * (size[1] + 50)
        with Image.open(root / f"{variant['id']}-{device}.png") as image:
            sheet.paste(ImageOps.contain(image, size), (x, y + 30))
        draw.text((x, y + 8), variant['name'], fill='#102d45')
    sheet.save(root / f'{device}-contact-sheet.jpg', quality=92)
