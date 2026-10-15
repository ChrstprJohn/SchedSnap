/* global console */
import process from 'node:process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { ghibliTemplates } from '../src/assets/ghibliTemplates.js';
import manifest from '../src/assets/cloudinaryManifest.js';
import { createCatalogStore, cloudConfigured } from '../server/catalogStore.js';
import { templateSchema } from '../shared/templateSchema.js';
const root=fileURLToPath(new URL('..',import.meta.url));
for(const file of ['.env.local','.env'])if(existsSync(resolve(root,file)))process.loadEnvFile(resolve(root,file));
if(!cloudConfigured(process.env))throw new Error('Cloudinary is not configured.');
const store=createCatalogStore(process.env),catalog=await store.read(true);
const existing=new Set(catalog.templates.map(t=>t.id)),publishedAt=new Date().toISOString();
const onlyIndex=process.argv.indexOf('--only');
const onlyId=onlyIndex<0?null:process.argv[onlyIndex+1];
if(onlyIndex>=0&&!ghibliTemplates.some(t=>t.id===onlyId))throw new Error('Unknown Ghibli design ID.');
const additions=ghibliTemplates.filter(t=>(!onlyId||t.id===onlyId)&&!existing.has(t.id)).map(t=>{
 const deviceImages=Object.fromEntries(Object.entries(t.deviceImages).map(([device,path])=>{
  const asset=manifest[path];
  if(!asset?.url||asset.cloud!==process.env.CLOUDINARY_CLOUD_NAME)throw new Error(`Upload missing for ${path}.`);
  return [device,asset.url];
 }));
 return templateSchema.parse({...t,image:deviceImages.mobile,deviceImages,status:'published',publishedAt});
});
console.log(`Catalog revision: ${catalog.revision}; ${additions.length} Ghibli additions, ${catalog.templates.length} existing records preserved.`);
if(process.argv.includes('--publish')&&additions.length){
 const index=process.argv.indexOf('--expect-revision');
 if(index<0||process.argv[index+1]!==catalog.revision)throw new Error('Pass the reviewed revision with --expect-revision.');
 const fresh=await store.read(true);if(!isDeepStrictEqual(fresh,catalog))throw new Error('Catalog changed; review again.');
 const proposed={...catalog,templates:[...additions,...catalog.templates]};await store.write(proposed);
 const saved=await store.read(true);if(!isDeepStrictEqual(saved.templates,proposed.templates))throw new Error('Post-publication verification failed.');
 console.log(`Published ${additions.length} Ghibli designs; existing records and dates unchanged.`);
}
