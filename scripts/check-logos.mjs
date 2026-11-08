import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {loadCatalog} from './catalog.mjs';

const {tools}=loadCatalog();
const {logos}=JSON.parse(readFileSync(new URL('../dist/logo-sources.json',import.meta.url)));
assert.deepEqual(Object.keys(logos).sort(),Array.from(tools,t=>t.id).sort(),'Logo coverage differs from catalog');
for(const t of tools){
 const logo=logos[t.id];
 assert.match(logo.file,new RegExp(`^assets/logos/${t.id}\\.(svg|png|ico|jpg|webp)$`));
 for(const key of ['sourcePage','assetUrl'])assert.equal(new URL(logo[key]).protocol,'https:',`Invalid ${key}: ${t.id}`);
 assert.ok(['product','family','publisher'].includes(logo.scope),`Missing identity scope: ${t.id}`);
 assert.ok(['brand-mark','site-icon','publisher-icon','inline-mark','inline-icon'].includes(logo.kind),`Missing asset kind: ${t.id}`);
 assert.equal(logo.publisher,t.org,`Publisher mismatch: ${t.id}`);
 assert.match(logo.checked,/^\d{4}-\d{2}-\d{2}$/);
 const bytes=readFileSync(new URL('../dist/'+logo.file,import.meta.url));
 assert.equal(bytes.length,logo.bytes,`Changed asset size: ${t.id}`);
 assert.equal(createHash('sha256').update(bytes).digest('hex'),logo.sha256,`Changed asset content: ${t.id}`);
 if(logo.file.endsWith('.svg')){
  const svg=bytes.toString();
  assert.match(svg,/<svg[\s>]/);
  assert.doesNotMatch(svg,/<(?:script|foreignObject|iframe)\b|\bon\w+\s*=/i,`Active SVG: ${t.id}`);
 }else assert.ok(bytes.subarray(0,4).equals(Buffer.from([0x89,0x50,0x4e,0x47]))||bytes.subarray(0,4).equals(Buffer.from([0,0,1,0]))||bytes.subarray(0,3).equals(Buffer.from([0xff,0xd8,0xff]))||bytes.subarray(0,4).toString()==='RIFF',`Invalid image: ${t.id}`);
}
const files=new Set(Object.values(logos).map(l=>l.file.split('/').pop()));
for(const file of readdirSync(new URL('../dist/assets/logos/',import.meta.url)))assert.ok(file==='README.md'||files.has(file),`Untracked logo asset: ${file}`);
console.log(`Verified ${tools.length} official-source image files, provenance and SHA-256 integrity.`);
