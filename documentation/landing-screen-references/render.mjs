import { chromium } from 'file:///C:/Users/picar/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { writeFileSync } from 'node:fs';
const browser = await chromium.launch({headless:true, executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try {
 const page = await browser.newPage();
 await page.goto('http://127.0.0.1:5184/');
 const choices = {
  mobile: { 'little-friends':['little-friends-bunny-cheer','little-friends-kitten-excited'], mascot:['soft-axolotl-smile','pixel-pixel-frog'], pattern:['matcha-check','berry-speckles'] },
  tablet: { 'little-friends':['little-friends-kitten-excited','little-friends-bunny-cheer'], mascot:['doodle-capybara-heart-hands','goofy-black-cat-peek'], pattern:['blueprint-break','rose-check'] },
  laptop: { 'little-friends':['little-friends-bunny-cheer','little-friends-kitten-excited'], mascot:['soft-blue-bunny','doodle-frog-scarf'], pattern:['matcha-check','blueprint-break'] },
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
  writeFileSync(`documentation/landing-screen-references/${device}-${collection}-${index+1}.png`,Buffer.from(data,'base64'));
 }
 console.log('Rendered 18 exact gallery/export wallpaper references.');
} finally { await browser.close(); }
