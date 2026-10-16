import json, shutil, hashlib
from pathlib import Path
from PIL import Image, ImageOps

root = Path(__file__).resolve().parents[2]
jobs = json.loads((root / 'output/genshin-simple/ice-forest-jobs.json').read_text(encoding='utf-8'))
sizes = {'mobile': (1080,2400), 'tablet': (1600,2560), 'laptop': (1920,1080)}
for job in jobs:
    char, device = job['character'], job['device']
    source = root / f'output/genshin-simple/sources/{char}-{device}.png'
    source.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(job['source'], source)
    target = root / f'public/wallpapers/scenic/genshin-chibi-{char}/{device}.png'
    target.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(source) as im:
        assert im.getbbox() is not None
        image = ImageOps.fit(im.convert('RGB'), sizes[device], method=Image.Resampling.LANCZOS)
        image.save(target)
    with Image.open(target) as final:
        assert final.size == sizes[device] and final.mode == 'RGB'
    print(str(target.relative_to(root)), sizes[device], hashlib.sha256(target.read_bytes()).hexdigest())
