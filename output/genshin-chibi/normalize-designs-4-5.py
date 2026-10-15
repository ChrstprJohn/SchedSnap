from PIL import Image
from pathlib import Path
import json,hashlib
root=Path(r'C:/Users/QCU/source/repos/SchedSnap')
rows=[["genshin-paimon-starlight","mobile","exec-27b190c3-8bb8-414a-9847-ff33ba32b089.png",1080,2400],["genshin-paimon-starlight","tablet","exec-e98bfdc9-5513-4459-ba24-7c11a41a00c7.png",1600,2560],["genshin-paimon-starlight","laptop","exec-f64c298e-ce2c-480d-a04f-1fe153905239.png",1920,1080],["genshin-teyvat-sketch-parade","mobile","exec-e3bb27a1-2e83-45be-8a48-481b32cd5aaf.png",1080,2400],["genshin-teyvat-sketch-parade","tablet","exec-acbd3169-eee6-4b86-a235-afd8bf7b2072.png",1600,2560],["genshin-teyvat-sketch-parade","laptop","exec-28a42862-eb5e-45e2-84c0-1ce87bf1a920.png",1920,1080]]
results=[]
for design,device,source,w,h in rows:
 p=root/'public/wallpapers/scenic'/design/(device+'.png')
 im=Image.open(p).convert('RGB')
 original=im.size
 im=im.resize((w,h),Image.Resampling.LANCZOS)
 im.save(p,optimize=True)
 results.append(dict(path=str(p),originalSize=original,width=w,height=h,opaque=True,sha256=hashlib.sha256(p.read_bytes()).hexdigest()))
print(json.dumps(results))
