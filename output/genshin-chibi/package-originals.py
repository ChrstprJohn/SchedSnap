from PIL import Image,ImageOps,ImageDraw
from pathlib import Path
import json,hashlib,zipfile
root=Path(r'C:/Users/QCU/source/repos/SchedSnap')
rows=[('genshin-original-sketch-parade',r'C:/Users/QCU/AppData/Local/Temp/codex-clipboard-b91c6bff-dddd-4dd7-a60e-33e9b2fcb681.png'),('genshin-original-kaeya-map',r'C:/Users/QCU/AppData/Local/Temp/codex-clipboard-40df406d-28c0-44f5-b620-1db618b44b1b.png')]
sizes={'mobile':(1080,2400),'tablet':(1600,2560),'laptop':(1920,1080)}
assets=[]
sheet=Image.new('RGB',(1260,680),'#f4f1eb');draw=ImageDraw.Draw(sheet)
for row,(id,source) in enumerate(rows):
 im=Image.open(source).convert('RGB')
 for col,(device,size) in enumerate(sizes.items()):
  paper=im.crop((0,0,im.width,min(100,im.height))).resize((1,1)).getpixel((0,0))
  bg=Image.new('RGB',size,paper)
  fitted=ImageOps.contain(im,size,Image.Resampling.LANCZOS)
  bg.paste(fitted,((size[0]-fitted.width)//2,size[1]-fitted.height))
  dest=root/'public/wallpapers/scenic'/id/(device+'.png');dest.parent.mkdir(parents=True,exist_ok=True);bg.save(dest)
  thumb=ImageOps.contain(bg,(390,280));sheet.paste(thumb,(col*420+(420-thumb.width)//2,row*340+15))
  draw.text((col*420+10,row*340+305),id.replace('genshin-original-','')+' / '+device,fill='#34394a')
  assets.append(dict(id=id,device=device,path=dest.relative_to(root).as_posix(),width=size[0],height=size[1],opaque=True,dimensionsValid=True,source=source,sha256=hashlib.sha256(dest.read_bytes()).hexdigest()))
out=root/'output/genshin-chibi';sheet.save(out/'originals-preview.jpg',quality=94)
(out/'originals-manifest.json').write_text(json.dumps({'method':'Original supplied image scaled proportionally, bottom-centered over matching paper-color background; no redraw or crop.','assets':assets},indent=2))
with zipfile.ZipFile(out/'genshin-original-wallpapers.zip','w',zipfile.ZIP_DEFLATED) as z:
 for a in assets:z.write(root/a['path'],Path(a['path']).relative_to('public/wallpapers/scenic'))
print('6 original-design wallpapers saved and packaged')
