import json
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
data = json.loads((root / 'documentation/onepiece-reference-3.json').read_text(encoding='utf-8'))
for variant in data['variants']:
    destination = root / variant['destination']
    destination.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(variant['source']) as original:
        output = original.convert('RGB').resize((variant['width'], variant['height']), Image.Resampling.LANCZOS)
        output.save(destination, 'PNG')
    with Image.open(destination) as saved:
        assert saved.size == (variant['width'], variant['height'])
        assert saved.mode == 'RGB'
        print(f'{destination.relative_to(root)} {saved.size}')
