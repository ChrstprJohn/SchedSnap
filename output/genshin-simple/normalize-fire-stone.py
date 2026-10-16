from PIL import Image, ImageOps
from pathlib import Path
import shutil, hashlib, json
root=Path.cwd()
base=Path('C:/Users/Admin/.codex/generated_images/01a14373-c63f-74a2-8fd8-ae1b66e58775')
rows=[["zhongli","mobile","exec-8fe54c93-5d79-4a5e-88ca-3b452ed85886.png","zhongli-pilot-prompt"],["zhongli","tablet","exec-4853cc9a-3c9c-4ad4-ad1d-5139697ab653.png","zhongli-tablet-prompt"],["zhongli","laptop","exec-5882db93-477d-40ad-9f59-4729ae20bebd.png","zhongli-laptop-prompt"],["mavuika","mobile","exec-314e10fd-adbe-4fc0-a103-a6049740a8cb.png","mavuika-mobile-simple-prompt"],["mavuika","tablet","exec-58d8b741-c883-4a1d-a6c9-3d19e21eab21.png","mavuika-tablet-simple-prompt"],["mavuika","laptop","exec-a97530fe-07ed-49ae-85a4-eda3f8088753.png","mavuika-laptop-simple-prompt"]]
sizes={'mobile':(1080,2400),'tablet':(1600,2560),'laptop':(1920,1080)}
report=[]
for character,device,name,prompt in rows:
 source=base/name
 archive=root/'output/genshin-simple/sources'/f'{character}-{device}.png'
 archive.parent.mkdir(parents=True,exist_ok=True)
 shutil.copy2(source,archive)
 with Image.open(source) as im:
  native=im.size
  final=ImageOps.fit(im.convert('RGB'),sizes[device],method=Image.Resampling.LANCZOS)
  dest=root/f'public/wallpapers/scenic/genshin-chibi-{character}/{device}.png'
  dest.parent.mkdir(parents=True,exist_ok=True)
  final.save(dest)
 with Image.open(dest) as checked:
  assert checked.size==sizes[device] and checked.mode=='RGB'
 report.append({'character':character,'device':device,'source':str(archive),'native':native,'path':str(dest),'size':sizes[device],'sha256':hashlib.sha256(dest.read_bytes()).hexdigest()})
print(json.dumps(report,indent=2))
