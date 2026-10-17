"""Regenerate committed landing WebPs from local originals (requires Pillow)."""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / 'public'
sources = {
    'images/hero/hero-phones-stacked.png': [640, 768, 960, 1448],
    'images/maker/maker-capybara-static.png': [320],
    'brand/schedsnap-mark.webp': [128],
}
for device in ['mobile', 'tablet', 'laptop']:
    for collection in ['featured', 'mascot', 'pattern']:
        folder = 'catalog-mobile' if device == 'mobile' else f'refreshed/{device}'
        name = 'pattern-blue' if device == 'laptop' and collection == 'pattern' else collection
        sources[f'images/collections/{folder}/{name}.png'] = [560, 960]

original_bytes = delivery_bytes = 0
for source, widths in sources.items():
    path = PUBLIC / source
    with Image.open(path) as original:
        original.load()
        original_bytes += path.stat().st_size
        for width in widths:
            height = round(original.height * width / original.width)
            resized = original.resize((width, height), Image.Resampling.LANCZOS)
            destination = path.with_name(f'{path.stem}-{width}.webp')
            resized.save(destination, 'WEBP', quality=88, method=6, exact=True)
            with Image.open(destination) as result:
                assert result.size == (width, height), destination
                assert ('A' in result.getbands()) == ('A' in original.getbands()), destination
            assert destination.stat().st_size < path.stat().st_size, destination
            delivery_bytes += destination.stat().st_size
            print(f'{destination.relative_to(ROOT)}: {destination.stat().st_size:,} bytes')
            if source == 'images/hero/hero-phones-stacked.png':
                avif = destination.with_suffix('.avif')
                resized.save(avif, 'AVIF', quality=70, speed=6)
                with Image.open(avif) as result:
                    assert result.size == (width, height) and 'A' in result.getbands(), avif
                delivery_bytes += avif.stat().st_size
                print(f'{avif.relative_to(ROOT)}: {avif.stat().st_size:,} bytes')
print(f'{original_bytes:,} source bytes -> {delivery_bytes:,} bytes across all delivery sizes')

# Keep the full-size tutorial artwork for desktop and supply smaller mobile files.
for source in (PUBLIC / 'images/how-it-works').glob('*.webp'):
    if source.stem.endswith('-560'):
        continue
    with Image.open(source) as original:
        resized = original.resize((560, round(original.height * 560 / original.width)), Image.Resampling.LANCZOS)
        destination = source.with_name(f'{source.stem}-560.webp')
        resized.save(destination, 'WEBP', quality=85, method=6, exact=True)
        assert destination.stat().st_size < source.stat().st_size, destination
        print(f'{destination.relative_to(ROOT)}: {destination.stat().st_size:,} bytes')
