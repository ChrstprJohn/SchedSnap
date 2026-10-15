from PIL import Image, ImageOps, ImageDraw
from pathlib import Path
import hashlib,json,zipfile
root=Path(r'C:/Users/QCU/source/repos/SchedSnap')
ids=["genshin-kaeya-atlas","genshin-tidal-sketches","genshin-celestial-promise","genshin-paimon-starlight","genshin-teyvat-sketch-parade"]
sizes={'mobile':(1080,2400),'tablet':(1600,2560),'laptop':(1920,1080)}
out=root/'output/genshin-chibi';out.mkdir(parents=True,exist_ok=True)
records=[]
sheet=Image.new('RGB',(1260,1600),'#f4f1eb');draw=ImageDraw.Draw(sheet)
for row,id in enumerate(ids):
 for col,(device,size) in enumerate(sizes.items()):
  p=root/'public/wallpapers/scenic'/id/(device+'.png')
  with Image.open(p) as im:
   assert im.size==size,(p,im.size)
   assert 'A' not in im.getbands() or im.getchannel('A').getextrema()==(255,255),p
   thumb=ImageOps.contain(im.convert('RGB'),(390,270))
   x=col*420+(420-thumb.width)//2;y=row*320+30
   sheet.paste(thumb,(x,y));draw.text((col*420+12,row*320+305),id.replace('genshin-','')+' / '+device,fill='#34394a')
  records.append({'path':p.relative_to(root).as_posix(),'width':size[0],'height':size[1],'opaque':True,'dimensionsValid':True,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
assert len(records)==15
(out/'manifest.json').write_text(json.dumps({'assets':records},indent=2))
sheet.save(out/'collection-preview.jpg',quality=93)
with zipfile.ZipFile(out/'genshin-chibi-wallpapers.zip','w',zipfile.ZIP_DEFLATED) as z:
 for item in records:z.write(root/item['path'],Path(item['path']).relative_to('public/wallpapers/scenic'))
print('Verified and packaged 15 exact-size opaque PNGs')
