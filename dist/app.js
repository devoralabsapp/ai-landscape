'use strict';
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase();
const byId=new Map(TOOLS.map(t=>[t.id,t]));
const catById=new Map(CATEGORIES.map(c=>[c.id,c]));
const ended=t=>['Sunset','Đã đóng','API đã ngừng'].includes(t.status);
const hasCode=t=>['Có mã nguồn','Source-available','Hỗn hợp'].includes(t.openness);
const readStore=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}};
const writeStore=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));}catch{/* Storage may be unavailable in private browsing. */}};
const savedRaw=readStore('ai-atlas-saved',[]);
const saved=new Set(Array.isArray(savedRaw)?savedRaw.filter(id=>byId.has(id)):[]);
const compareRaw=readStore('ai-atlas-compare',[]);
let comparison=Array.isArray(compareRaw)?[...new Set(compareRaw)].filter(id=>byId.has(id)).slice(0,3):[];
let detailId=null,toastTimer;
const defaultFilters={q:'',category:'all',layer:'all',surface:'all',source:'all',field:'all',status:'all',savedOnly:false};
let state={...defaultFilters,view:'map'};
const initials=t=>t.name.split(/[\s.\/-]+/).filter(Boolean).slice(0,2).map(w=>w[0]).join('');
function avatar(t,extra=''){
 const logo=LOGOS[t.id];
 return `<span class="tool-avatar publisher-logo ${esc(t.id)} ${extra}" aria-hidden="true"><img src="${esc(logo.file)}" alt="" width="32" height="32" loading="lazy" decoding="async"><span class="logo-fallback">${esc(initials(t))}</span></span>`;
}
document.addEventListener('error',e=>{if(e.target.matches?.('.publisher-logo img'))e.target.parentElement.classList.add('logo-unavailable');},true);
function logoSource(t){
 const logo=LOGOS[t.id];
 const label=logo.scope==='publisher'?'Logo nhà phát hành':logo.scope==='family'?'Logo dùng chung trong họ sản phẩm':'Logo / icon sản phẩm';
 return `<div class="logo-source"><span class="source-label">NHẬN DIỆN & NGUỒN ẢNH</span><p>${label}</p>${productLink(logo.sourcePage,tr('Nguồn từ nhà phát hành'))}${productLink(logo.assetUrl,tr('Tệp ảnh gốc'))}<p>Logo và nhãn hiệu thuộc chủ sở hữu tương ứng. Đối chiếu ngày 08/11/2026.</p></div>`;
}
function statusChip(t){return t.status!=='Đang hoạt động'?`<span class="status-chip ${ended(t)?'ended':''}">${esc(t.status)}</span>`:'';}
function readURL(){
 const p=new URLSearchParams(location.search);
 state.q=p.get('q')||'';
 state.category=catById.has(p.get('category'))?p.get('category'):'all';
 state.layer=LAYERS.some(l=>l.id===p.get('layer'))?p.get('layer'):'all';
 state.surface=['Web','Desktop','Mobile','CLI','IDE','API','SDK','Messaging','Protocol'].includes(p.get('surface'))?p.get('surface'):'all';
 state.source=['code','local','service','protocol'].includes(p.get('source'))?p.get('source'):'all';
 state.field=Object.hasOwn(WORK_FIELDS,p.get('field'))?p.get('field'):'all';
 state.status=['current','changed','ended'].includes(p.get('status'))?p.get('status'):'all';
 state.view=p.get('view')==='list'?'list':'map';state.savedOnly=p.get('saved')==='1';
 return p.get('tool');
}
function updateURL(){
 const p=new URLSearchParams();
 p.set('lang',LANGUAGE);p.set('theme',document.documentElement.dataset.theme);
 for(const key of ['q','category','layer','surface','source','field','status','view']){
  if(state[key]&&state[key]!=='all'&&!(key==='view'&&state[key]==='map'))p.set(key,state[key]);
 }
 if(state.savedOnly)p.set('saved','1');
 if(detailId)p.set('tool',detailId);
 const query=p.toString();history.replaceState(null,'',location.pathname+(query?'?'+query:'')+location.hash);
}
function securitySearch(tool){
 const profile=SECURITY_PROFILES[tool.id];
 if(!profile)return [];
 return [profile.note,englishText(profile.note),...['cybersecurity',...profile.fields].map(field=>WORK_FIELDS[field].keywords)];
}
const searchable=new Map(TOOLS.map(t=>[t.id,norm([t.name,t.org,t.kind,t.description,t.best,t.note,t.hosting,...t.aliases,...[t.description,t.best,t.note,t.kind,catById.get(t.category).name].map(englishText),...modelNames(getProductProfile(t)),...getProductProfile(t).plans.map(p=>p.name),catById.get(t.category).name,...securitySearch(t)].join(' '))]));
const exactSecurityTerms=new Map([['soc',/\bsoc\b/],['osint',/\bosint\b/],['appsec',/\bappsec\b/]]);
function filtered(){
 const words=norm(state.q).trim().split(/\s+/).filter(Boolean);
 return TOOLS.filter(t=>{
  if(state.savedOnly&&!saved.has(t.id))return false;
  if(state.category!=='all'&&t.category!==state.category)return false;
  if(state.layer!=='all'&&catById.get(t.category).layer!==state.layer)return false;
  if(state.field!=='all'){
   const profile=SECURITY_PROFILES[t.id];
   if(!profile||(state.field!=='cybersecurity'&&!profile.fields.includes(state.field)))return false;
  }
  if(state.surface!=='all'&&!t.surfaces.includes(state.surface))return false;
  if(state.source==='code'&&!hasCode(t))return false;
  if(state.source==='local'&&!/local|self-host/i.test(t.hosting))return false;
  if(state.source==='service'&&!['Dịch vụ','Hỗn hợp','Source-available'].includes(t.openness))return false;
  if(state.source==='protocol'&&t.openness!=='Chuẩn mở')return false;
  if(state.status==='current'&&ended(t))return false;
  if(state.status==='changed'&&t.status==='Đang hoạt động')return false;
  if(state.status==='ended'&&!ended(t))return false;
  const text=searchable.get(t.id);
  return words.every(word=>exactSecurityTerms.get(word)?.test(text)??text.includes(word));
 });
}
function renderNav(){
 $('#category-nav').innerHTML=LAYERS.map(l=>`<div class="nav-group-title"><span>${esc(l.title.toUpperCase())}</span><span>${l.name}</span></div>${CATEGORIES.filter(c=>c.layer===l.id).map(c=>`<button class="category-button ${state.category===c.id?'active':''}" data-category="${c.id}" aria-pressed="${state.category===c.id}"><span class="category-icon" aria-hidden="true" style="color:${c.color}">${c.icon}</span><span>${esc(c.name)}</span><span class="count">${TOOLS.filter(t=>t.category===c.id).length}</span></button>`).join('')}`).join('');
 const all=$('[data-category="all"]');all.classList.toggle('active',state.category==='all'&&state.layer==='all');all.setAttribute('aria-pressed',String(state.category==='all'&&state.layer==='all'));
 $('#all-count').textContent=TOOLS.length;
}
function compareButton(t,klass='tile-check'){
 const selected=comparison.includes(t.id);
 return `<button class="${klass} ${selected?'selected':''}" data-compare="${t.id}" aria-pressed="${selected}" aria-label="${selected?'Bỏ':'Thêm'} ${esc(t.name)} ${selected?'khỏi':'vào'} so sánh" title="${selected?'Bỏ khỏi':'Thêm vào'} so sánh">${selected?'✓':'+'}</button>`;
}
function tile(t){return `<article class="tool-tile" data-entry="${t.id}"><span class="tile-status">${hasCode(t)?'<i class="legend-dot open" title="Có mã nguồn"></i>':''}${t.status!=='Đang hoạt động'?`<i class="legend-dot change" title="${esc(t.status)}"></i>`:''}</span><button class="tile-main" data-tool="${t.id}" aria-label="Xem ${esc(t.name)}${t.status!=='Đang hoạt động'?', '+esc(t.status):''}"><span class="tile-face">${avatar(t)}<span class="tool-name">${esc(t.name)}</span><span class="tile-org">${esc(t.org)}</span></span></button>${compareButton(t)}${saved.has(t.id)?'<span class="tile-saved" title="Đã lưu">◆</span>':''}</article>`;}
function renderMap(items){
 const activeLayers=LAYERS.filter(l=>items.some(t=>catById.get(t.category).layer===l.id));
 return `<div class="landscape ${activeLayers.length<4?'filtered':''}">${activeLayers.map(l=>`<div class="layer-column" style="--group:${l.color}"><div class="layer-heading"><span class="layer-number">${l.name}</span><div><h3>${esc(l.title)}</h3><p>${esc(l.desc)}</p></div></div>${CATEGORIES.filter(c=>c.layer===l.id).map(c=>{
  const group=items.filter(t=>t.category===c.id);if(!group.length)return '';
  return `<section class="category-group" data-motion-group="${c.id}" style="--group:${c.color}" aria-label="${esc(c.name)}"><button class="category-header" data-category="${c.id}" title="Chỉ xem nhóm ${esc(c.name)}"><span aria-hidden="true">${c.icon}</span><h4>${esc(c.name)}</h4><span class="group-count">${group.length}</span></button><div class="tiles">${group.map(tile).join('')}</div></section>`;
 }).join('')}</div>`).join('')}</div>`;
}
function renderList(items){return `<div class="list-view"><div class="list-header" aria-hidden="true"><span>Công cụ / nền tảng</span><span>Làm được gì?</span><span>Nhóm chức năng</span><span>±</span></div>${items.map(t=>`<article class="list-row" data-entry="${t.id}" style="--group:${catById.get(t.category).color}"><button class="list-title" data-tool="${t.id}"><span class="list-face">${avatar(t)}<span><b>${esc(t.name)}</b><small>${esc(t.org)}</small>${statusChip(t)}</span></span></button><div class="list-description">${esc(t.description)}</div><div class="list-category">${esc(catById.get(t.category).name)}<br><span style="color:#929d86">${esc(t.surfaces.join(' · '))}</span></div>${compareButton(t,'tile-check list-check')}</article>`).join('')}</div>`;}
function render(){
 const signature=JSON.stringify(state);
 atlasMotion.beforeResults(signature);
 const items=filtered();
 $('#stat-tools').textContent=TOOLS.length;
 $('#saved-count').textContent=saved.size;
 $('#saved-nav').setAttribute('aria-pressed',String(state.savedOnly));
 $('#search').value=state.q;$('#surface-filter').value=state.surface;$('#source-filter').value=state.source;$('#status-filter').value=state.status;
 $('#field-filter').value=state.field;
 $('#section-title').textContent=state.savedOnly?'Bộ sưu tập của bạn.':state.category!=='all'?catById.get(state.category).name:'Một hệ sinh thái. Nhiều khả năng.';
 for(const b of document.querySelectorAll('[data-view]'))b.setAttribute('aria-pressed',String(b.dataset.view===state.view));
 for(const b of document.querySelectorAll('[data-layer]'))b.classList.toggle('active',b.dataset.layer===state.layer);
 const hasFilters=Object.entries(defaultFilters).some(([key,value])=>state[key]!==value);
 $('#reset-filters').hidden=!hasFilters;
 const fieldLabel=state.field==='all'?'':` <span class="result-field">· ${esc(tr(WORK_FIELDS[state.field].label))}</span>`;
 $('#results-label').innerHTML=`<strong>${items.length}</strong> / ${TOOLS.length} mục${state.savedOnly?' · Đã lưu':''}${state.category!=='all'?' · '+esc(catById.get(state.category).name):''}${fieldLabel}`;
 $('#results').innerHTML=items.length?(state.view==='map'?renderMap(items):renderList(items)):`<div class="empty-state"><span aria-hidden="true">⌕</span><h3>${state.savedOnly&&!saved.size?'Bộ sưu tập đang để trống.':'Chưa tìm thấy công cụ phù hợp.'}</h3><p>${state.savedOnly&&!saved.size?'Mở một công cụ và chọn “Lưu công cụ” để tạo danh sách của bạn.':'Thử một từ khóa ngắn hơn hoặc bỏ bớt bộ lọc.'}</p><button data-action="reset">Khám phá toàn bộ bản đồ →</button></div>`;
 atlasMotion.reconcileResults();
 renderNav();renderCompareBar();updateURL();localizeDOM();atlasMotion.refresh();
}
function showToast(message){clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').hidden=false;localizeDOM($('#toast'));atlasMotion.toast();toastTimer=setTimeout(()=>$('#toast').hidden=true,3000);}
function renderCompareBar(){
 $('#compare-bar').hidden=!comparison.length;
 $('#compare-items').innerHTML=comparison.map(id=>`<span class="compare-pill"><span>${esc(byId.get(id).name)}</span><button data-compare="${id}" aria-label="Bỏ ${esc(byId.get(id).name)} khỏi so sánh">×</button></span>`).join('');
 $('#compare-open').disabled=comparison.length<2;
 $('#compare-open').innerHTML=`So sánh ${comparison.length}/3 <span>→</span>`;
 document.body.style.paddingBottom=comparison.length?(innerWidth<=600?'120px':'85px'):'';localizeDOM($('#compare-bar'));
}
function toggleComparison(id){
 if(!byId.has(id))return;
 if(comparison.includes(id))comparison=comparison.filter(x=>x!==id);
 else {if(comparison.length===3){showToast('Bạn có thể so sánh tối đa 3 mục. Bỏ một mục để chọn thêm.');return;}comparison.push(id);}
 writeStore('ai-atlas-compare',comparison);render();refreshDetailButtons();
 if($('#compare-dialog').open){if(comparison.length>=2)fillComparison();else $('#compare-dialog').close();}
}
function toggleSaved(id){
 if(!byId.has(id))return;
 const removing=saved.has(id);if(removing)saved.delete(id);else saved.add(id);
 writeStore('ai-atlas-saved',[...saved]);render();refreshDetailButtons();showToast(removing?'Đã bỏ khỏi bộ sưu tập.':'Đã lưu công cụ trên trình duyệt này.');
}
function refreshDetailButtons(){
 if(!detailId)return;
 const sb=$('#detail-save'),cb=$('#detail-compare');
 if(sb){sb.classList.toggle('selected',saved.has(detailId));sb.setAttribute('aria-pressed',String(saved.has(detailId)));sb.textContent=saved.has(detailId)?'◆ Đã lưu':'▱ Lưu công cụ';}
 if(cb){cb.classList.toggle('selected',comparison.includes(detailId));cb.setAttribute('aria-pressed',String(comparison.includes(detailId)));cb.textContent=comparison.includes(detailId)?'✓ Đã chọn so sánh':'+ So sánh';}
 localizeDOM($('#detail-dialog'));
}
function closeDialogs(except){for(const d of document.querySelectorAll('dialog'))if(d!==except&&d.open){atlasMotion.settleWithin(d);d.close();}}
const productLink=(url,label)=>`<a class="product-source" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)} ↗</a>`;
function securitySection(tool){
 const profile=SECURITY_PROFILES[tool.id];
 if(!profile)return '';
 const labels=profile.fields.map(field=>tr(WORK_FIELDS[field].label)).join(' / ');
 return `<section class="detail-section detail-note"><h3>Ứng dụng trong an ninh mạng</h3><p><b>${esc(tr(profile.role))}</b> · ${esc(labels)}</p><p>${esc(profile.note)}</p>${profile.source?productLink(profile.source,tr('Tài liệu tính năng')):''}</section>`;
}
const tierLabel=m=>m.status==='special'?'Chuyên biệt':({4:'Cao cấp nhất',3:'Chuyên sâu',2:'Cân bằng',1:'Nhanh / nhẹ',0:'Tự động'}[m.tier]);
function modelSection(p){
 const count=modelNames(p).length;
 const modes={native:'Model của nhà cung cấp',integrated:'Model / chế độ được tích hợp',external:'Kết nối model bên ngoài',managed:'Model do dịch vụ quản lý',infrastructure:'Hạ tầng AI',protocol:'Giao thức kết nối',ended:'Mục lịch sử'};
 const groupHtml=p.groups.map(g=>{
  const ordered=[...g.models].sort((a,b)=>{
   const stage=m=>m.status==='current'?0:m.status==='special'?2:1;
   return stage(a)-stage(b)||b.tier-a.tier;
  });
  return `<section class="model-group"><div class="model-group-head"><h4>${esc(g.name)}</h4>${productLink(g.source,'Nguồn')}</div><ol class="model-list">${ordered.map(m=>`<li class="model-row" data-model-search="${esc(norm([g.name,m.name,m.note,englishText(g.name),englishText(m.note)].join(' ')))}"><span class="model-level tier-${m.tier}" aria-hidden="true">${m.status==='special'?'✦':m.tier===0?'↻':m.tier}</span><div class="model-copy"><div class="model-name"><b>${esc(m.name)}</b>${m.status==='preview'?'<span class="model-tag">Preview</span>':m.status==='other'?'<span class="model-tag">Bản khác</span>':''}</div>${m.note?`<p>${esc(m.note)}</p>`:''}</div><span class="model-tier">${esc(g.relation==='routing'?'Chế độ định tuyến':tierLabel(m))}</span></li>`).join('')}</ol></section>`;
 }).join('');
 return `<div class="product-intro"><span class="product-eyebrow">${esc(modes[p.mode])}</span><h3>${count?'Danh mục model & phiên bản':'Model hoạt động thế nào?'}</h3><p>${esc(p.modelNote)}</p></div>${count?`<div class="model-order-note">↓ Cao xuống thấp trong cùng họ theo phân khúc. Các bản khác và model chuyên biệt xếp riêng; số tầng không phải điểm benchmark.</div><label class="model-search"><span aria-hidden="true">⌕</span><span class="sr-only">Tìm model trong mục này</span><input id="detail-model-search" type="search" placeholder="Tìm model, phiên bản…" autocomplete="off"></label><p class="model-result-count" id="model-result-count" role="status" aria-live="polite">${count} mục model / chế độ</p>${groupHtml}<p id="model-no-results" class="product-empty" hidden>Không có model khớp từ khóa. Thử tên ngắn hơn.</p>`:`<div class="product-empty">${p.mode==='protocol'?'Giao thức không có model hoặc gói Plus/Pro riêng.':p.mode==='infrastructure'?'Không có bộ model hội thoại riêng để xếp hạng.':p.mode==='ended'?'Không hiển thị như sản phẩm đang cung cấp.':'Bộ chọn đầy đủ cần xem tại nguồn hoặc trong ứng dụng.'}</div>`}${productLink(p.modelUrl,'Mở catalog / tài liệu model chính thức')}${p.providerTools?.length?`<div class="provider-catalogs"><h4>Tra cứu thêm họ model</h4><p>Link tham khảo; không khẳng định mọi model của hãng đều được hỗ trợ.</p><div class="related-links">${p.providerTools.filter(id=>byId.has(id)).map(id=>`<button data-tool="${id}">${esc(byId.get(id).name)} ↗</button>`).join('')}</div></div>`:''}`;
}
function plansSection(p){
 return `<div class="product-intro"><span class="product-eyebrow">THUÊ BAO & CHI PHÍ</span><h3>${p.plans.length?'Các gói sử dụng':'Không có gói đang cung cấp'}</h3><p>${esc(p.billingNote)}</p></div><div class="plans-grid">${p.plans.map(x=>`<article class="plan-card"><h4>${esc(x.name)}</h4><strong>${esc(x.price||'Xem tại nguồn')}</strong>${x.note?`<p>${esc(x.note)}</p>`:''}${x.type==='usage'?'<span class="plan-type">API / theo sử dụng</span>':x.type==='software'?'<span class="plan-type">Phần mềm / tự triển khai</span>':''}</article>`).join('')}</div><div class="plan-footer">Không mặc định mọi model đều có trong mọi gói. Quyền truy cập và hạn mức xem theo tài khoản, khu vực và ứng dụng.</div>${productLink(p.pricingUrl,'Xem gói & giá chính thức')}`;
}
function selectDetailTab(name,focus=false){
 const previous=atlasMotion.tabRect();
 for(const b of document.querySelectorAll('[data-detail-tab]')){
  const active=b.dataset.detailTab===name;
  b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;
  if(active&&focus)b.focus();
 }
 for(const panel of document.querySelectorAll('[data-detail-panel]'))panel.hidden=panel.dataset.detailPanel!==name;
 atlasMotion.tabTransition(name,previous);
}
function filterDetailModels(value){
 const words=norm(value).trim().split(/\s+/).filter(Boolean);let count=0;
 for(const row of document.querySelectorAll('.model-row')){row.hidden=!words.every(w=>row.dataset.modelSearch.includes(w));if(!row.hidden)count++;}
 for(const group of document.querySelectorAll('.model-group'))group.hidden=![...group.querySelectorAll('.model-row')].some(r=>!r.hidden);
 $('#model-result-count').textContent=`${count} / ${modelNames(getProductProfile(byId.get(detailId))).length} mục model / chế độ`;
 $('#model-no-results').hidden=count>0;localizeDOM($('#model-result-count'));
}
function openDetail(id){
 const t=byId.get(id);if(!t)return;
 const dialog=$('#detail-dialog');closeDialogs(dialog);detailId=id;
 const c=catById.get(t.category),p=getProductProfile(t),same=TOOLS.filter(x=>x.category===t.category&&x.id!==id&&!ended(x)).slice(0,4);
 dialog.innerHTML=`<div class="dialog-top"><span style="color:${c.color}">${c.icon} &nbsp;${esc(c.name)}</span><button class="close-btn" data-close="detail-dialog" aria-label="Đóng chi tiết">×</button></div><div class="detail-content"><div class="detail-identity">${avatar(t)}<div><h2 id="detail-title">${esc(t.name)}</h2><p>${esc(t.org)} · Đối chiếu ${esc(p.checked)}</p>${statusChip(t)}</div></div><p class="detail-description">${esc(t.description)}</p><div class="detail-tabs" role="tablist" aria-label="Chi tiết ${esc(t.name)}">${[['models','Model',modelNames(p).length],['plans','Gói sử dụng',p.plans.length],['overview','Tổng quan',null]].map(([key,label,n])=>`<button role="tab" id="detail-tab-${key}" data-detail-tab="${key}" aria-controls="detail-panel-${key}" aria-selected="${key==='models'}" tabindex="${key==='models'?0:-1}">${label}${n!==null?` <span>${n||'—'}</span>`:''}</button>`).join('')}</div><section id="detail-panel-models" role="tabpanel" aria-labelledby="detail-tab-models" tabindex="0" data-detail-panel="models">${modelSection(p)}</section><section id="detail-panel-plans" role="tabpanel" aria-labelledby="detail-tab-plans" tabindex="0" data-detail-panel="plans" hidden>${plansSection(p)}</section><section id="detail-panel-overview" role="tabpanel" aria-labelledby="detail-tab-overview" tabindex="0" data-detail-panel="overview" hidden><dl class="detail-meta"><div><dt>VAI TRÒ</dt><dd>${esc(t.kind)}</dd></div><div><dt>GIAO DIỆN</dt><dd>${esc(t.surfaces.join(' · '))}</dd></div><div><dt>TRIỂN KHAI</dt><dd>${esc(t.hosting)}</dd></div><div><dt>MÔ HÌNH CUNG CẤP</dt><dd>${esc(t.openness)}</dd></div></dl>${securitySection(t)}<section class="detail-section"><h3>Phù hợp khi</h3><p>${esc(t.best)}</p></section><section class="detail-section detail-note"><h3>Ghi chú biên tập</h3><p>${esc(t.note)}</p></section>${t.aliases.length?`<p class="alias-note">Tên liên quan / tên trước đây: ${esc(t.aliases.join(' · '))}</p>`:''}<div class="source-box"><span class="source-label">NGUỒN & MỐC ĐỐI CHIẾU</span>${productLink(t.url,new URL(t.url).hostname)}<p>Đối chiếu ngày 08/11/2026. Gợi ý và phân tầng model là nhận định biên tập từ định vị nhà cung cấp, không phải benchmark độc lập. Danh mục không tự cập nhật.</p>${logoSource(t)}</div>${same.length?`<div class="related-section"><h3>Khám phá cùng nhóm</h3><div class="related-links">${same.map(x=>`<button data-tool="${x.id}">${esc(x.name)} ↗</button>`).join('')}</div></div>`:''}</section><div class="detail-actions"><a class="primary" href="${esc(t.url)}" target="_blank" rel="noopener noreferrer">Trang chính thức ↗</a><button class="secondary" id="detail-save" data-save="${t.id}"></button><button class="secondary" id="detail-compare" data-compare="${t.id}"></button></div><div class="detail-bottom"><button data-action="share-tool">Sao chép link mục này ↗</button><button data-action="method">Cách phân loại & nguồn</button></div></div>`;
 refreshDetailButtons();updateURL();localizeDOM(dialog);if(!dialog.open)dialog.showModal();dialog.scrollTop=0;atlasMotion.dialogOpen(dialog);
}
function fillComparison(){
 const tools=comparison.map(id=>byId.get(id));
 const rows=[['Nhóm',t=>catById.get(t.category).name],['Vai trò',t=>t.kind],['Làm được gì?',t=>t.description],['Phù hợp khi',t=>t.best],['Giao diện',t=>t.surfaces.join(' · ')],['Triển khai',t=>t.hosting],['Mô hình cung cấp',t=>t.openness],['Trạng thái',t=>t.status],['Model / chế độ',t=>modelNames(getProductProfile(t)).join(' · ')||getProductProfile(t).modelNote],['Gói sử dụng',t=>getProductProfile(t).plans.map(p=>tr(p.name)+' ('+tr(p.price)+')').join(' · ')||'Không có gói đang cung cấp'],['Ghi chú biên tập',t=>t.note]];
 $('#compare-dialog').innerHTML=`<div class="dialog-top"><span>ĐỐI CHIẾU CÔNG CỤ</span><button class="close-btn" data-close="compare-dialog" aria-label="Đóng bảng so sánh">×</button></div><div class="compare-content"><h2 id="compare-title">Đặt các lựa chọn cạnh nhau.</h2><p>So sánh theo vai trò và cách sử dụng. Các công cụ khác nhóm có thể bổ sung cho nhau trong cùng một hệ thống.</p><div class="compare-scroll"><table class="compare-table"><thead><tr><th scope="col">${tools.length} LỰA CHỌN</th>${tools.map(t=>`<th scope="col">${avatar(t)}<h3>${esc(t.name)}</h3><small>${esc(t.org)}</small></th>`).join('')}</tr></thead><tbody>${rows.map(([label,fn])=>`<tr class="${label==='Ghi chú biên tập'?'compare-note':''}"><td>${label}</td>${tools.map(t=>`<td>${esc(fn(t))}</td>`).join('')}</tr>`).join('')}<tr><td>Nguồn chính thức</td>${tools.map(t=>`<td><a href="${esc(t.url)}" target="_blank" rel="noopener noreferrer">${esc(new URL(t.url).hostname)} ↗</a></td>`).join('')}</tr></tbody></table></div></div><div class="compare-foot">Snapshot 08/11/2026 · Nhận định biên tập, không chấm điểm hay xếp hạng chất lượng.</div>`;localizeDOM($('#compare-dialog'));
}
function openComparison(){if(comparison.length<2)return;const d=$('#compare-dialog');closeDialogs(d);fillComparison();d.showModal();atlasMotion.dialogOpen(d);}
function openInfo(type){
 const d=$('#info-dialog');closeDialogs(d);
 const content=type==='guide'?`<h2 id="info-title">Bắt đầu từ việc bạn muốn làm.</h2><p class="lead">Bản đồ chia theo vai trò chính, từ công cụ dùng ngay đến các thành phần để tự xây một hệ thống AI.</p><div class="guide-cards">${[
 ['01 / SỬ DỤNG','Tôi muốn AI hỗ trợ công việc.','Bắt đầu ở trợ lý đa năng. Chọn nhóm nghiên cứu nếu cần nguồn tài liệu, hoặc agent thực thi nếu muốn giao một đầu ra nhiều bước.','use','Khám phá trợ lý & công việc'],
 ['02 / XÂY DỰNG','Tôi muốn làm phần mềm.','Dùng coding agent khi đã có repo. Tìm app builder nếu muốn đi từ ý tưởng đến bản ứng dụng. Automation giúp nối các dịch vụ thành một luồng.','build','Khám phá công cụ xây sản phẩm'],
 ['03 / SÁNG TẠO','Tôi muốn tạo nội dung.','Chọn theo đầu ra: ảnh, video, avatar, giọng nói hay âm nhạc. Thử một mẫu thực tế để kiểm tra chất lượng và khả năng chỉnh sửa.','create','Khám phá công cụ sáng tạo'],
 ['04 / HẠ TẦNG','Tôi muốn tự xây agent.','Ghép framework, model/runtime, dữ liệu và đánh giá. MCP kết nối công cụ; A2A phục vụ giao tiếp giữa agent.','infra','Khám phá nền tảng AI']
 ].map(([n,h,p,l,b])=>`<article class="guide-card"><span>${n}</span><h3>${h}</h3><p>${p}</p><button data-pick-layer="${l}">${b} →</button></article>`).join('')}</div><h3>Đọc một mục như thế nào?</h3><p>Nhấn vào ô công cụ để xem công dụng, gợi ý tình huống sử dụng, ghi chú và nguồn. Nút “+” thêm vào bảng so sánh tối đa 3 mục. “Lưu công cụ” tạo bộ sưu tập trên trình duyệt hiện tại.</p><h3>Model, tool, agent và framework</h3><p>Model sinh đầu ra. Tool đóng gói khả năng để làm một công việc. Agent dùng model và công cụ để thực hiện nhiều bước. Framework giúp lập trình các hành vi đó. Một sản phẩm có thể đảm nhiệm nhiều vai trò; vị trí trên bản đồ thể hiện vai trò chính.</p><h3>Ba câu hỏi trước khi chọn</h3><ul><li><b>Đầu ra cần gì?</b> Một câu trả lời, file hoàn chỉnh, thay đổi trong repo hay hành động trong ứng dụng?</li><li><b>Chạy ở đâu?</b> Giao diện local không bảo đảm model và dữ liệu cũng được xử lý local.</li><li><b>Kiểm chứng bằng gì?</b> Dùng một tác vụ đại diện, xem nguồn, sửa được đầu ra và đo tổng chi phí.</li></ul>`:
 `<h2 id="info-title">Một bản đồ có nguồn.<br>Một phạm vi rõ ràng.</h2><p class="lead">${TOOLS.length} công cụ, nền tảng, họ model và giao thức trong ${CATEGORIES.length} nhóm. Biên tập bằng tiếng Việt, đối chiếu ngày 08/11/2026.</p><div class="method-grid"><div><strong>Phạm vi tuyển chọn</strong><p>Bao quát các vai trò chính và các tên được yêu cầu: ChatGPT, Claude, Gemini, Muse của Meta, Antigravity, OpenCode, OpenClaw và Qoder. Đây là snapshot mở rộng dần, không phải toàn bộ công cụ AI đang tồn tại.</p></div><div><strong>Phân loại theo công dụng</strong><p>Mỗi mục xuất hiện một lần ở nhóm chính. Một bộ sản phẩm có thể có nhiều giao diện và khả năng. Vị trí không thể hiện thị phần, độ phổ biến hay thứ hạng.</p></div><div><strong>Nguồn chính thức</strong><p>Ưu tiên trang sản phẩm, tài liệu và repository của nhà cung cấp. Mỗi mục có link để bạn kiểm tra trực tiếp. Ngày đối chiếu là ngày biên tập, không phải cam kết mọi tính năng đã được thử nghiệm.</p></div><div><strong>Nhận định biên tập</strong><p>“Phù hợp khi” và “Ghi chú” là gợi ý dựa trên vai trò, không phải benchmark độc lập. Giá, hạn mức, phiên bản model và mức truy cập theo quốc gia cần xem tại nguồn.</p></div></div><h3>Cách đọc nhãn</h3><ul><li><b>Có mã nguồn:</b> có thành phần công khai. Bộ lọc bao gồm cả sản phẩm hỗn hợp và source-available; không đồng nghĩa mọi phần đều có giấy phép OSI hay được dùng thương mại không điều kiện.</li><li><b>Local / self-host:</b> có thành phần có thể chạy trên máy hoặc hạ tầng riêng. Việc gọi model hay connector vẫn có thể đi lên cloud.</li><li><b>Đổi tên / sáp nhập / chuyển hướng:</b> ghi nhận thông tin trên nguồn chính thức. Alias giúp tìm bằng tên cũ; không mặc định hai sản phẩm tương đương.</li><li><b>Sunset / đã ngừng:</b> giữ để tra cứu lịch sử, cần xem chi tiết phạm vi. Ví dụ Sora 2 API ghi nhận trạng thái API, không khẳng định trạng thái mọi sản phẩm Sora.</li></ul><h3>Dữ liệu & cập nhật</h3><p>Dữ liệu được biên tập thủ công, không tự cập nhật. Bản này tập trung vào công cụ dùng phổ biến và hạ tầng agent; chưa bao quát mọi ngành dọc, plugin, model checkpoint hay nhà cung cấp địa phương. Để bổ sung, mở issue hoặc sửa danh mục trong repo.</p><p>Bộ sưu tập và mục so sánh lưu bằng localStorage trong trình duyệt, không đồng bộ tài khoản. Không cần API key để xem bản đồ. Tìm kiếm và bộ lọc chạy ngay trên thiết bị.</p><div class="detail-actions"><a class="primary" href="${LANGUAGE==='en'?'catalog.en.csv':'catalog.csv'}" download>Tải toàn bộ CSV ↓</a><a class="secondary" href="${LANGUAGE==='en'?'catalog.en.json':'catalog.json'}" download>Tải JSON ↓</a><a class="secondary" href="https://github.com/devoralabsapp/ai-landscape" target="_blank" rel="noopener noreferrer">GitHub ↗</a></div><p>Logo và icon lấy từ website, bộ nhận diện hoặc repo chính thức của nhà phát hành. Phần Tổng quan ghi rõ nguồn ảnh và trường hợp dùng logo nhà phát hành hoặc họ sản phẩm. Tên và nhãn hiệu thuộc chủ sở hữu tương ứng. Bản đồ lấy cảm hứng từ CNCF Landscape và không liên kết với CNCF.</p>`;
 d.innerHTML=`<div class="dialog-top"><span>AI ATLAS / ${type==='guide'?'HƯỚNG DẪN':'PHƯƠNG PHÁP'}</span><button class="close-btn" data-close="info-dialog" aria-label="Đóng thông tin">×</button></div><div class="info-content">${content}</div><div class="info-footer"><span>AI ATLAS · VIETNAMESE EDITION · 08.11.2026</span><a href="https://landscape.cncf.io/" target="_blank" rel="noopener noreferrer">Cảm hứng từ CNCF Landscape ↗</a></div>`;
 localizeDOM(d);d.showModal();atlasMotion.dialogOpen(d);
}
function reset(){Object.assign(state,defaultFilters);render();}
function setCategory(id){if(id!=='all'&&!catById.has(id))return;state.category=id;state.layer='all';state.savedOnly=false;render();hideMenu();$('#explore').scrollIntoView({behavior:'smooth'});}
function setLayer(id){if(id!=='all'&&!LAYERS.some(l=>l.id===id))return;state.layer=id;state.category='all';state.savedOnly=false;render();}
function hideMenu(){$('#sidebar').classList.remove('visible');$('.mobile-menu').setAttribute('aria-expanded','false');}
async function copyText(value){
 try{await navigator.clipboard.writeText(value);showToast('Đã sao chép link.');}
 catch{const input=document.createElement('textarea');input.value=value;input.style.cssText='position:fixed;opacity:0';document.body.append(input);input.select();let done=false;try{done=document.execCommand('copy');}catch{}input.remove();showToast(done?'Đã sao chép link.':'Không thể sao chép tự động. Bạn có thể lấy link từ thanh địa chỉ.');}
}
function downloadCSV(){
 const fields=[['Tên',t=>t.name],['Đơn vị',t=>t.org],['Nhóm',t=>catById.get(t.category).name],['Vai trò',t=>t.kind],['Giao diện',t=>t.surfaces.join(', ')],['Triển khai',t=>t.hosting],['Mô hình cung cấp',t=>t.openness],['Mô tả',t=>t.description],['Phù hợp khi',t=>t.best],['Ghi chú biên tập',t=>t.note],['Trạng thái',t=>t.status],['Nguồn chính thức',t=>t.url],['Đối chiếu',t=>t.checked],['Tên liên quan',t=>t.aliases.join(', ')],['Model / chế độ',t=>modelNames(getProductProfile(t)).join('; ')],['Gói sử dụng',t=>getProductProfile(t).plans.map(p=>tr(p.name)+' — '+tr(p.price)).join('; ')],['Nguồn model',t=>getProductProfile(t).modelUrl],['Nguồn gói',t=>getProductProfile(t).pricingUrl]];
 const cell=v=>'"'+tr(v).replace(/"/g,'""')+'"';
 const content='\uFEFF'+[fields.map(([n])=>cell(n)).join(','),...filtered().map(t=>fields.map(([,fn])=>cell(fn(t))).join(','))].join('\r\n');
 const url=URL.createObjectURL(new Blob([content],{type:'text/csv;charset=utf-8;'}));const link=document.createElement('a');link.href=url;link.download='ai-atlas-'+LANGUAGE+'-2026-11-08.csv';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);showToast(`Đã xuất ${filtered().length} mục theo bộ lọc hiện tại.`);
}
document.addEventListener('click',e=>{
 const b=e.target.closest('button,a');if(!b)return;
 if(b.dataset.detailTab){selectDetailTab(b.dataset.detailTab);return;}
 if(b.dataset.close){atlasMotion.settleWithin($('#'+b.dataset.close));$('#'+b.dataset.close).close();return;}
 if(b.dataset.tool){openDetail(b.dataset.tool);return;}
 if(b.dataset.compare){toggleComparison(b.dataset.compare);return;}
 if(b.dataset.save){toggleSaved(b.dataset.save);return;}
 if(b.dataset.category){setCategory(b.dataset.category);return;}
 if(b.dataset.layer){setLayer(b.dataset.layer);return;}
 if(b.dataset.pickLayer){$('#info-dialog').close();setLayer(b.dataset.pickLayer);$('#explore').scrollIntoView({behavior:'smooth'});return;}
 if(b.dataset.view){state.view=b.dataset.view;render();return;}
 switch(b.dataset.action){
  case 'guide':openInfo('guide');break;
  case 'method':openInfo('method');break;
  case 'saved':Object.assign(state,defaultFilters,{savedOnly:!state.savedOnly});render();$('#explore').scrollIntoView({behavior:'smooth'});break;
  case 'reset':reset();break;
  case 'menu':{const visible=$('#sidebar').classList.toggle('visible');b.setAttribute('aria-expanded',String(visible));break;}
  case 'export':downloadCSV();break;
  case 'compare':openComparison();break;
  case 'clear-compare':comparison=[];writeStore('ai-atlas-compare',[]);render();refreshDetailButtons();break;
  case 'share-tool':copyText(location.href);break;
 }
});
$('#detail-dialog').addEventListener('input',e=>{if(e.target.id==='detail-model-search')filterDetailModels(e.target.value);});
$('#detail-dialog').addEventListener('keydown',e=>{
 const tab=e.target.closest('[data-detail-tab]');if(!tab||!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
 e.preventDefault();const keys=['models','plans','overview'],index=keys.indexOf(tab.dataset.detailTab);
 selectDetailTab(keys[e.key==='Home'?0:e.key==='End'?2:(index+(e.key==='ArrowRight'?1:2))%3],true);
});
$('#search').addEventListener('input',e=>{state.q=e.target.value;render();});
for(const [id,key] of [['surface-filter','surface'],['source-filter','source'],['field-filter','field'],['status-filter','status']])$('#'+id).addEventListener('change',e=>{state[key]=e.target.value;render();});
for(const d of document.querySelectorAll('dialog')){
 d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});
}
$('#detail-dialog').addEventListener('close',()=>{detailId=null;updateURL();});
document.addEventListener('keydown',e=>{
 if(e.key==='/'&&!/input|textarea|select/i.test(document.activeElement?.tagName)&&!document.querySelector('dialog[open]')){e.preventDefault();$('#search').focus();}
 if(e.key==='Escape')hideMenu();
});
window.addEventListener('popstate',()=>{const tool=readURL();render();if(tool)openDetail(tool);else if($('#detail-dialog').open)$('#detail-dialog').close();});
window.addEventListener('resize',renderCompareBar);
$('#theme-select').innerHTML=ATLAS_THEMES.map(t=>`<option value="${t.id}">${esc(t.name)}</option>`).join('');
$('#theme-select').value=document.documentElement.dataset.theme;$('#language-select').value=LANGUAGE;
$('#theme-select').addEventListener('change',e=>{atlasMotion.stop();applyTheme(e.target.value);atlasMotion.refresh();});
$('#language-select').addEventListener('change',e=>{const lang=e.target.value;if(!['vi','en'].includes(lang))return;preferenceWrite('ai-atlas-language',lang);const url=new URL(location.href);url.searchParams.set('lang',lang);location.assign(url.href);});
applyTheme(document.documentElement.dataset.theme,{persist:false});
$('#field-filter').insertAdjacentHTML('beforeend',Object.entries(WORK_FIELDS).map(([id,field])=>`<option value="${id}">${esc(field.label)}</option>`).join(''));
const initialTool=readURL();render();if(initialTool&&byId.has(initialTool))openDetail(initialTool);

atlasMotion.start();
