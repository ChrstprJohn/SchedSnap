import test from 'node:test';
import assert from 'node:assert/strict';
import { ghibliTemplates } from '../src/assets/ghibliTemplates.js';
import { templateSchema } from '../shared/templateSchema.js';
import { matchesGalleryCategory } from '../src/config/collections.js';
import manifest from '../src/assets/cloudinaryManifest.js';
import { drawWallpaper } from '../src/utils/canvasHelpers.js';
import { deviceResolutions } from '../src/assets/templates.js';
import { customizeWallpaperTemplate,galleryPreviewTemplate } from '../src/utils/wallpaperTheme.js';

test('nine Ghibli references have unique templates and three uploaded device compositions each', () => {
  assert.equal(ghibliTemplates.length,9);
  assert.equal(new Set(ghibliTemplates.map(t=>t.id)).size,9);
  const paths=[];
  for(const t of ghibliTemplates){
    const template=templateSchema.parse({...t,status:'published'});
    assert.equal(matchesGalleryCategory(template,'ghibli'),true);
    assert.equal(matchesGalleryCategory(template,'scenic'),false);
    assert.equal(template.image,template.deviceImages.mobile);
    for(const [device,[width,height]]of Object.entries({mobile:[1080,2400],tablet:[1600,2560],laptop:[1920,1080]})){
      const path=template.deviceImages[device],asset=manifest[path];
      paths.push(path);assert.ok(asset,`Uploaded artwork missing: ${path}`);
      assert.equal(asset.width,width);assert.equal(asset.height,height);
      assert.equal(templateSchema.safeParse({...template,image:manifest[template.image].url,deviceImages:Object.fromEntries(Object.entries(template.deviceImages).map(([d,p])=>[d,manifest[p].url]))}).success,true);
    }
  }
  assert.equal(new Set(paths).size,27);
});

test('dense portrait schedules preserve fifteen meetings above the Ghibli artwork footer', () => {
  const schedule={classes:Array.from({length:3},(_,i)=>({courseCode:`CS ${101+i}`,subject:'Computer Science',meetings:['Monday','Tuesday','Wednesday','Thursday','Friday'].map(day=>({day,startTime:`${8+i*3}:00`,endTime:`${9+i*3}:30`,room:'Room 101'}))}))};
  for(const t of ghibliTemplates)for(const device of ['mobile','tablet']){
    const ctx={font:'',measureText(text){const size=Number(this.font.match(/([\d.]+)px/)?.[1]||36);return {width:text.length*size*0.52};},scale(){},translate(){},fillRect(){},fillText(){},beginPath(){},roundRect(){},arc(){},fill(){},stroke(){},save(){},restore(){},moveTo(){},lineTo(){}};
    const template=customizeWallpaperTemplate(galleryPreviewTemplate(t),{},device);
    const result=drawWallpaper({getContext:()=>ctx},{schedule,template,resolution:deviceResolutions[device]});
    assert.equal(result.overflow,false,`${t.id}/${device}`);
    assert.equal(result.plans.flatMap(p=>p.entries).length,15);
    const height=device==='mobile'?2400:3072;
    assert.ok(result.scheduleBounds.y+result.scheduleBounds.height<=height*(t.family==='ghibli-closeup'?0.69:0.77));
  }
});
