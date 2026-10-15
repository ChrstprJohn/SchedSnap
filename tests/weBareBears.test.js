import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { weBareBearsTemplates } from '../src/assets/weBareBearsTemplates.js';
import { wallpaperTemplates, deviceResolutions } from '../src/assets/templates.js';
import manifest from '../src/assets/cloudinaryManifest.js';
import { templateSchema } from '../shared/templateSchema.js';
import { matchesGalleryCategory } from '../src/config/collections.js';
import { drawWallpaper } from '../src/utils/canvasHelpers.js';
import { customizeWallpaperTemplate, galleryPreviewTemplate } from '../src/utils/wallpaperTheme.js';

test('WBB catalog includes 16 designs backed by 48 approved immutable device uploads', () => {
  const review = JSON.parse(readFileSync(new URL('../output/we-bare-bears/manifest.json', import.meta.url)));
  review.assets.push(...JSON.parse(readFileSync(new URL('../documentation/wbb-minimal-assets.json', import.meta.url))).assets);
  assert.equal(weBareBearsTemplates.length, 16);
  assert.equal(new Set(review.assets.map(a => a.sha256)).size, 48);
  for (const definition of weBareBearsTemplates) {
    templateSchema.parse({ ...definition, status: 'published' });
    assert.equal(matchesGalleryCategory(definition, 'we-bare-bears'), true);
    assert.equal(wallpaperTemplates.filter(t => t.id === definition.id).length, 1);
    for (const [device, size] of Object.entries(deviceResolutions)) {
      const path = definition.deviceImages[device];
      const asset = review.assets.find(a => a.path === `public${path}`);
      assert.ok(asset?.visuallyReviewed && asset.opaque && asset.dimensionsValid, path);
      assert.equal(manifest[path].width, size.width);
      assert.equal(manifest[path].height, size.height);
      assert.equal(manifest[path].publicId, `schedsnap${path.slice(0, -4)}-${asset.sha256.slice(0, 16)}`);
    }
  }
});

test('dense portrait schedules preserve fifteen meetings above the minimal bear artwork footer', () => {
  const schedule={classes:Array.from({length:3},(_,i)=>({courseCode:`CS ${101+i}`,subject:'Computer Science',meetings:['Monday','Tuesday','Wednesday','Thursday','Friday'].map(day=>({day,startTime:`${8+i*3}:00`,endTime:`${9+i*3}:30`,room:'Room 101'}))}))};
  for(const t of weBareBearsTemplates.filter(t => t.family === 'wbb-minimal'))for(const device of ['mobile','tablet']){
    const ctx={font:'',measureText(text){const size=Number(this.font.match(/([\d.]+)px/)?.[1]||36);return {width:text.length*size*0.52};},scale(){},translate(){},fillRect(){},fillText(){},beginPath(){},roundRect(){},arc(){},fill(){},stroke(){},save(){},restore(){},moveTo(){},lineTo(){}};
    const template=customizeWallpaperTemplate(galleryPreviewTemplate(t),{},device);
    const result=drawWallpaper({getContext:()=>ctx},{schedule,template,resolution:deviceResolutions[device]});
    assert.equal(result.overflow,false,`${t.id}/${device}`);
    assert.equal(result.plans.flatMap(p=>p.entries).length,15);
    const height=device==='mobile'?2400:3072;
    assert.ok(result.scheduleBounds.y+result.scheduleBounds.height<=height*0.69);
  }
});
