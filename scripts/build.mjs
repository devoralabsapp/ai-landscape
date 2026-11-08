import './check.mjs';
import {writeFileSync} from 'node:fs';
import {loadCatalog} from './catalog.mjs';
import {englishDictionary,englishCatalog} from './locales.mjs';

const catalog=loadCatalog();
writeFileSync(new URL('../dist/logos.js',import.meta.url),'/* Generated from logo-sources.json by npm run build. */\nconst LOGOS='+JSON.stringify(Object.fromEntries(catalog.tools.map(t=>[t.id,t.logo])))+';\n');
writeFileSync(new URL('../dist/translations.en.js',import.meta.url),'/* Generated from translations.en.json by npm run build. */\nconst EN_TEXT='+JSON.stringify(englishDictionary)+';\n');
const date='2026-11-08';
const byCategory=new Map(catalog.categories.map(c=>[c.id,c]));
const fields=[['Tên','name'],['Đơn vị','org'],['Nhóm',t=>byCategory.get(t.category).name],['Vai trò','kind'],['Giao diện',t=>t.surfaces.join(', ')],['Triển khai','hosting'],['Mô hình cung cấp','openness'],['Mô tả','description'],['Phù hợp khi','best'],['Ghi chú biên tập','note'],['Trạng thái','status'],['Nguồn chính thức','url'],['Đối chiếu','checked'],['Tên liên quan',t=>t.aliases.join(', ')],['Model / chế độ',t=>t.product.groups.flatMap(g=>g.models.map(m=>m.name)).join('; ')],['Gói sử dụng',t=>t.product.plans.map(p=>p.name+' — '+p.price).join('; ')],['Nguồn model',t=>t.product.modelUrl],['Nguồn gói',t=>t.product.pricingUrl]];
const cell=v=>'"'+String(v).replace(/"/g,'""')+'"';
const csv='\uFEFF'+[fields.map(([n])=>cell(n)).join(','),...catalog.tools.map(t=>fields.map(([,fn])=>cell(typeof fn==='function'?fn(t):t[fn])).join(','))].join('\n')+'\n';
writeFileSync(new URL('../dist/catalog.csv',import.meta.url),csv);
writeFileSync(new URL('../dist/catalog.json',import.meta.url),JSON.stringify({snapshot:date,scope:'Curated, not exhaustive. Descriptions are sourced; suitability and notes are editorial. Availability and pricing must be checked with the provider.',...catalog},null,2)+'\n');
let md=`# AI Atlas — Bản đồ hệ sinh thái AI\n\nSnapshot: **08/11/2026** · **${catalog.tools.length} mục** · **${catalog.categories.length} nhóm**.\n\nDanh mục tuyển chọn, không phải toàn bộ công cụ AI đang tồn tại hoặc bảng xếp hạng. Mô tả dựa trên nguồn chính thức; “Phù hợp khi” và “Ghi chú” là nhận định biên tập, không phải benchmark độc lập. Giá, quota và quyền truy cập cần kiểm tra trực tiếp.\n\nCó mã nguồn không đồng nghĩa mọi thành phần đều có giấy phép mở; local không bảo đảm mọi lời gọi model đều chạy local. Các nhãn vòng đời chỉ áp dụng trong phạm vi ghi chú.\n\n`;
for(const layer of catalog.layers){
  md+=`## ${layer.name}. ${layer.title}\n\n${layer.desc}.\n\n`;
  for(const c of catalog.categories.filter(c=>c.layer===layer.id)){
    md+=`### ${c.name}\n\n${c.desc}\n\n`;
    for(const t of catalog.tools.filter(t=>t.category===c.id)){
      md+=`#### ${t.name}\n\n${t.description}\n\n- **Đơn vị / vai trò:** ${t.org} · ${t.kind}\n- **Giao diện / triển khai:** ${t.surfaces.join(', ')} · ${t.hosting}\n- **Mô hình cung cấp:** ${t.openness}\n- **Phù hợp khi:** ${t.best}\n- **Ghi chú:** ${t.note}\n- **Trạng thái:** ${t.status}\n- **Nguồn:** [${new URL(t.url).hostname}](${t.url}) · đối chiếu ${t.checked}\n${t.aliases.length?'- **Tên liên quan:** '+t.aliases.join(', ')+'\n':''}\n`;
      md+=`**Model & phiên bản:** ${t.product.modelNote}\n\n`;
      for(const g of t.product.groups)md+=`- [${g.name}](${g.source}): ${[...g.models].sort((a,b)=>b.tier-a.tier).map(m=>m.name+(m.status==='current'?'':' ['+m.status+']')).join(' → ')}\n`;
      md+=`\n[Catalog model](${t.product.modelUrl}) · snapshot ${t.product.checked}. Thứ tự theo phân khúc trong cùng họ, không phải benchmark.\n\n**Gói sử dụng:** ${t.product.plans.map(p=>p.name+' ('+(p.price||'Xem tại nguồn')+')').join(' · ')||'Không có gói đang cung cấp'}.\n\n${t.product.billingNote} [Nguồn gói & giá](${t.product.pricingUrl}).\n\n`;
    }
  }
}
writeFileSync(new URL('../AI-Landscape.vi.md',import.meta.url),md.trimEnd()+'\n');
const en=englishCatalog(catalog);
const enCategories=new Map(en.categories.map(c=>[c.id,c]));
const enFields=fields.map(([label,fn])=>[label,label==='Nhóm'?(t=>enCategories.get(t.category).name):fn]);
const enCsv='\uFEFF'+[fields.map(([n])=>cell(englishCatalog(n))).join(','),...en.tools.map(t=>enFields.map(([,fn])=>cell(englishCatalog(typeof fn==='function'?fn(t):t[fn]))).join(','))].join('\n')+'\n';
writeFileSync(new URL('../dist/catalog.en.csv',import.meta.url),enCsv);
writeFileSync(new URL('../dist/catalog.en.json',import.meta.url),JSON.stringify({snapshot:date,language:'en',...en},null,2)+'\n');
console.log('Built catalog.csv, catalog.json and AI-Landscape.vi.md. Static site is ready in dist/.');
