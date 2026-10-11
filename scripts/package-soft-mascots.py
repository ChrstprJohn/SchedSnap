"""Index transparent mascot masters without creating padded device images."""
from pathlib import Path
import json
import sys
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PACK = sys.argv[sys.argv.index('--pack') + 1] if '--pack' in sys.argv else ('pixel-mascots' if '--pixel' in sys.argv else 'mascots')
if PACK not in {'mascots', 'pixel-mascots', 'goofy-mascots', 'doodle-mascots'}:
    raise SystemExit('Unknown mascot pack')
BASE = ROOT / 'public/images' / PACK
assets = []
for source in sorted((BASE / 'masters').glob('*.png')):
    with Image.open(source) as image:
        alpha = image.getchannel('A')
        assert alpha.getextrema() == (0, 255), source.name
        assets.append({'id': source.stem, 'master': f'/images/{PACK}/masters/{source.name}',
                       'masterSize': list(image.size), 'alphaBounds': list(alpha.getbbox())})
previous = json.loads((BASE / 'manifest.json').read_text(encoding='utf-8-sig'))
previous['assets'] = assets
(BASE / 'manifest.json').write_text(json.dumps(previous, indent=2) + '\n', encoding='utf-8')
print(f'Indexed {len(assets)} transparent master cutouts; no device copies generated.')
