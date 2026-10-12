import { chromium } from 'file:///C:/Users/picar/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { writeFileSync } from 'node:fs';
const browser = await chromium.launch({headless:true, executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try {
 const page = await browser.newPage();
 await page.goto('http://127.0.0.1:5184/');
 const choices = {
  mobile: { 'featured':['island-postcard'] },
  tablet: { 'featured':['soft-bee-butter','moonlit-blossoms'] },
  laptop: { 'featured':['cozy-city'] },
 };
 for(const [device,collections] of Object.entries(choices)) for(const [collection,ids] of Object.entries(collections)) for(const [index,id] of ids.entries()) {
  const data=await page.evaluate(async ({device,id,index})=>{
   const {wallpaperTemplates,deviceResolutions,tabletLandscapeResolution,templateSchedule}=await import('/src/assets/templates.js');
   const {prepareWallpaperAssets}=await import('/src/utils/wallpaperAssets.js');
   const {drawWallpaper}=await import('/src/utils/canvasHelpers.js');
   const template=wallpaperTemplates.find(t=>t.id===id);
   if(!template) throw Error('Missing template '+id);
   const resolution=device==='tablet'&&index===1?tabletLandscapeResolution:deviceResolutions[device];
   const backgroundImage=await prepareWallpaperAssets(template,resolution);
   const canvas=document.createElement('canvas');
   const layout=drawWallpaper(canvas,{schedule:templateSchedule,template,resolution,backgroundImage});
   if(layout.overflow) throw Error('Overflow '+id);
   return canvas.toDataURL('image/png').split(',')[1];
  },{device,id,index});
  writeFileSync(`documentation/landing-variety/${device}-${collection}-${index+1}.png`,Buffer.from(data,'base64'));
 }
 console.log('Rendered four varied wallpaper references.');
} finally { await browser.close(); }

