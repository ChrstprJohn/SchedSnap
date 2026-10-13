"""Read-only Sanrio wallpaper inspection; contact sheets and optional final manifest."""
import argparse
import hashlib
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
REFS = Path('C:/Users/Administrator/.codex/attachments/9e3de9e5-9bce-463a-aca3-b781338ff769')
GROUPS = {'parade': (1, ['candy', 'music', 'balloons']), 'pixel': (2, ['rose', 'lilac', 'mint']), 'tea': (3, ['strawberry', 'patisserie', 'flowers']), 'gingham': (4, ['strawberry', 'ribbon', 'daisy'])}
SIZES = {'mobile': (1080, 2400), 'tablet': (1600, 2560), 'laptop': (1920, 1080)}
OUT = ROOT / 'output/sanrio/review'

def sheet(entries, target, title, columns=3, cell=(500, 660)):
    rows = (len(entries) + columns - 1) // columns
    canvas = Image.new('RGB', (cell[0]*columns, cell[1]*rows+48), '#e3e4e7')
    draw = ImageDraw.Draw(canvas)
    draw.text((12, 14), title, fill='black')
    for i, (label, path) in enumerate(entries):
        x, y = (i % columns)*cell[0], (i // columns)*cell[1]+48
        draw.text((x+10, y+8), label, fill='black')
        with Image.open(path) as original:
            thumb = original.convert('RGB')
            thumb.thumbnail((cell[0]-20, cell[1]-45), Image.Resampling.LANCZOS)
            canvas.paste(thumb, (x+(cell[0]-thumb.width)//2, y+35))
    canvas.save(target)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--final-manifest', action='store_true')
    args = parser.parse_args()
    OUT.mkdir(parents=True, exist_ok=True)
    sheet([(f'Reference {n}: {g}', REFS / f'image-{n}.png') for g,(n,_) in GROUPS.items()], OUT/'references.jpg', 'User source references', 4, (450, 820))
    assets = []
    missing = []
    for group, (reference, variants) in GROUPS.items():
        entries = []
        qa = {'sample': [], 'dense': []}
        for variant in variants:
            design = f'sanrio-{group}-{variant}'
            for device, expected in SIZES.items():
                path = ROOT / f'public/wallpapers/scenic/{design}/{device}.png'
                if not path.exists():
                    missing.append(str(path.relative_to(ROOT)))
                    continue
                with Image.open(path) as im:
                    rgba = im.convert('RGBA')
                    alpha = rgba.getchannel('A').getextrema()
                    assets.append({'id': design, 'device': device, 'reference': reference, 'group': group, 'variant': variant, 'path': path.relative_to(ROOT).as_posix(), 'format': im.format, 'mode': im.mode, 'width': im.width, 'height': im.height, 'expectedDimensions': list(expected), 'dimensionsValid': im.size == expected, 'alphaExtrema': list(alpha), 'opaque': alpha == (255,255), 'sha256': hashlib.sha256(path.read_bytes()).hexdigest()})
                entries.append((f'{variant} / {device}', path))
                for kind in qa:
                    render = ROOT / f'output/sanrio/qa/{design}-{device}-{kind}.png'
                    if render.exists():
                        qa[kind].append((f'{variant} / {device} / {kind}', render))
        if entries:
            sheet(entries, OUT/f'{group}-artwork.jpg', f'{group}: artwork', 3)
        for kind, renders in qa.items():
            if renders:
                sheet(renders, OUT/f'{group}-{kind}.jpg', f'{group}: actual Canvas / {kind}', 3)
    report = {'assetCount': len(assets), 'expectedCount': 36, 'missing': missing, 'invalidDimensions': [a['path'] for a in assets if not a['dimensionsValid']], 'nonOpaque': [a['path'] for a in assets if not a['opaque']], 'uniqueHashes': len({a['sha256'] for a in assets})}
    print(json.dumps(report, indent=2))
    if args.final_manifest:
        if missing or report['invalidDimensions'] or report['nonOpaque'] or report['uniqueHashes'] != 36:
            raise SystemExit('Final manifest requires 36 distinct valid opaque assets.')
        (ROOT/'output/sanrio/manifest.json').write_text(json.dumps({'requirements': {'references': 4, 'variantsPerReference': 3, 'devices': {d: list(s) for d,s in SIZES.items()}, 'opaque': True}, 'validation': report, 'assets': assets}, indent=2)+'\n', encoding='utf-8')

if __name__ == '__main__':
    main()
