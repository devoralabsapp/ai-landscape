import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {Script} from 'node:vm';
import {loadCatalog} from './catalog.mjs';

const {tools,categories,layers}=loadCatalog();
assert.ok(tools.length>0,'Catalog is empty');
assert.equal(new Set(tools.map(t=>t.id)).size,tools.length,'Duplicate tool IDs');
assert.equal(new Set(categories.map(c=>c.id)).size,categories.length,'Duplicate category IDs');
for(const c of categories){
  assert.ok(layers.some(l=>l.id===c.layer),`Unknown layer for ${c.name}`);
  assert.ok(tools.some(t=>t.category===c.id),`Empty category: ${c.name}`);
}
for(const t of tools){
  for(const key of ['id','name','org','kind','hosting','openness','description','best','note','url','status','checked']){
    assert.ok(typeof t[key]==='string'&&t[key].length,`Missing ${key} for ${t.name}`);
  }
  assert.ok(categories.some(c=>c.id===t.category),`Unknown category for ${t.name}`);
  assert.equal(new URL(t.url).protocol,'https:',`Non-HTTPS source for ${t.name}`);
  assert.ok(t.surfaces.length,`Missing surfaces for ${t.name}`);
  const p=t.product;
  assert.ok(p&&p.mode&&p.modelNote&&p.billingNote,`Missing product profile for ${t.id}`);
  for(const url of [p.modelUrl,p.pricingUrl,...p.groups.map(g=>g.source)])assert.equal(new URL(url).protocol,'https:',`Invalid product source for ${t.id}`);
  assert.equal(new Set(p.plans.map(x=>x.name)).size,p.plans.length,`Duplicate plan in ${t.id}`);
  for(const g of p.groups){
    assert.equal(new Set(g.models.map(m=>m.name)).size,g.models.length,`Duplicate model in ${t.id}/${g.name}`);
    for(const m of g.models){assert.ok(m.name,`Unnamed model in ${t.id}`);assert.ok(Number.isInteger(m.tier)&&m.tier>=0&&m.tier<=4,`Invalid model tier in ${t.id}`);assert.ok(['current','special','other','preview'].includes(m.status),`Invalid model state in ${t.id}`);}
  }
  for(const id of p.providerTools||[])assert.ok(tools.some(t=>t.id===id),`Unknown provider link ${id}`);
  if(p.mode==='ended')assert.equal(p.plans.length,0,`Retired product has active plans: ${t.id}`);
  else assert.ok(p.plans.length,`No pricing context for ${t.id}`);
  assert.match(t.checked,/^\d{4}-\d{2}-\d{2}$/);
}
for(const required of ['ChatGPT','Claude','Gemini','Muse','Antigravity','OpenCode','OpenClaw','Qoder']){
  assert.ok(tools.some(t=>t.name===required),`Missing requested tool: ${required}`);
}
for(const f of ['app.js','data.js','product-data.js'])new Script(readFileSync(new URL('../dist/'+f,import.meta.url),'utf8'),{filename:f});
const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
for(const file of ['styles.css','app.js','data.js','product-data.js']){
  assert.ok(html.includes(file),`Missing asset reference: ${file}`);
  assert.ok(existsSync(new URL('../dist/'+file,import.meta.url)),`Missing asset: ${file}`);
}
assert.match(html,/<html lang="vi">/);
assert.ok(tools.find(t=>t.id==='chatgpt').product.plans.some(p=>p.name==='Plus'));
assert.ok(tools.find(t=>t.id==='claude').product.groups.flatMap(g=>g.models).some(m=>m.name.includes('Sonnet')));
console.log(`Verified ${tools.length} unique records, ${categories.length} categories, ${layers.length} layers, requested tools, sources and JavaScript syntax.`);
