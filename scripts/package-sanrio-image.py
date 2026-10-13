"""Copy one generated composition to its required device pixel size."""
import argparse
from pathlib import Path
from PIL import Image, PngImagePlugin

parser = argparse.ArgumentParser()
parser.add_argument('source')
parser.add_argument('destination')
parser.add_argument('width', type=int)
parser.add_argument('height', type=int)
parser.add_argument('--prompt', default='')
parser.add_argument('--pixel', action='store_true')
args = parser.parse_args()
destination = Path(args.destination)
if destination.exists():
    raise SystemExit(f'Refusing to overwrite {destination}')
destination.parent.mkdir(parents=True, exist_ok=True)
with Image.open(args.source) as source:
    original_size = source.size
    ratio_error = abs((source.width / source.height) / (args.width / args.height) - 1)
    if ratio_error > 0.015:
        raise SystemExit(f'Composition aspect ratio mismatch: {source.size}')
    if source.mode == 'RGBA' and source.getchannel('A').getextrema() != (255, 255):
        raise SystemExit('Background is not fully opaque')
    image = source.convert('RGB')
    if image.size != (args.width, args.height):
        image = image.resize((args.width, args.height), Image.Resampling.NEAREST if args.pixel else Image.Resampling.LANCZOS)
    metadata = PngImagePlugin.PngInfo()
    metadata.add_text('Generation prompt', args.prompt)
    metadata.add_text('Source', str(Path(args.source).resolve()))
    metadata.add_text('Original dimensions', str(original_size))
    metadata.add_text('Sizing', 'Independently generated device composition; pixel dimensions normalized without cropping')
    image.save(destination, pnginfo=metadata)
print(f'{destination}: {args.width}x{args.height}; source {original_size}')
