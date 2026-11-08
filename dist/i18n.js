/* Explicit, reviewed text catalog shared by UI and English downloads.
 * Stable tool IDs, filter values, model names and source URLs are never translated. */
const EN_LOOKUP=new Map(Object.entries(EN_TEXT));
for(const [vi,en] of Object.entries(EN_TEXT))EN_LOOKUP.set(vi.toLocaleUpperCase('vi'),en.toUpperCase());
function englishText(value){
 const original=String(value??''),s=original.trim();
 if(EN_LOOKUP.has(s))return original.replace(s,EN_LOOKUP.get(s));
 const patterns=[
  [/^Chỉ xem nhóm (.+)$/,(_,name)=>'Show only '+englishText(name)],
  [/^Xem (.+)$/, (_,name)=>'View '+englishText(name)],
  [/^Thêm (.+) vào so sánh$/,(_,name)=>'Add '+name+' to comparison'],
  [/^Bỏ (.+) khỏi so sánh$/,(_,name)=>'Remove '+name+' from comparison'],
  [/^Bỏ (.+) khỏi$/,(_,name)=>'Remove '+name+' from'],
  [/^(\d+) \/ (\d+) mục model \/ chế độ$/,(_,a,b)=>`${a} / ${b} model / mode entries`],
  [/^(\d+) mục model \/ chế độ$/,(_,n)=>`${n} model / mode entries`],
  [/^So sánh (\d)\/3$/,(_,n)=>`Compare ${n}/3`],
  [/^Đã xuất (\d+) mục theo bộ lọc hiện tại\.$/,(_,n)=>`Exported ${n} entries matching the current filters.`],
  [/^Chi tiết (.+)$/,(_,name)=>name+' details'],
  [/^AI ATLAS \/ (.+)$/,(_,part)=>'AI ATLAS / '+englishText(part)]
 ];
 for(const [pattern,replace] of patterns)if(pattern.test(s))return original.replace(s,s.replace(pattern,replace));
 // Composite labels contain names, dates or counts; translate only explicit UI fragments.
 let result=s.replace(/Đối chiếu /g,'Reviewed ').replace(/, (Đổi tên|Chuyển hướng|Sáp nhập|Lộ trình ngừng IDE|Đã đóng|API đã ngừng)/g,(_,status)=>', '+englishText(status));
 if(/^\/?\s*\d+ mục/.test(result)||/^\d+ \/ \d+ mục/.test(result))result=result.replace(/ mục/g,' entries');
 result=result.replace(/ · Đã lưu/g,' · Saved');
 result=result.replace(/(✳|↗|⌕|⌘|▧|⑂|▤|▥|◉|◈|♬|≋|⊞|⤳)\s+(.+)$/,(_,icon,text)=>icon+' '+englishText(text));
 result=result.replace(/Tên liên quan \/ tên trước đây: /g,'Related / former names: ');
 result=result.replace(/(\d+) LỰA CHỌN/g,'$1 OPTIONS');
 result=result.replace(/\/người/g,'/person').replace(/\/ghế/g,'/seat').replace(/\/tháng/g,'/month').replace(/\/năm/g,'/year');
 result=result.replace(/\(([^()]+)\)/g,(_,part)=>'('+englishText(part)+')');
 // A number followed by a translated category or filter label.
 if(result.includes(' · '))result=result.split(' · ').map(part=>EN_LOOKUP.get(part)||part).join(' · ');
 return original.replace(s,result);
}
const tr=value=>LANGUAGE==='en'?englishText(value):String(value??'');
function localizeDOM(root=document){
 if(LANGUAGE!=='en')return;
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(node){return /^(SCRIPT|STYLE|NOSCRIPT)$/.test(node.parentElement?.tagName||'')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT;}});
 let node;while((node=walker.nextNode())){const value=englishText(node.nodeValue);if(value!==node.nodeValue)node.nodeValue=value;}
 for(const el of root.querySelectorAll('[aria-label],[title],[placeholder],meta[name="description"],meta[property="og:description"],meta[property="og:title"]')){
  for(const attr of ['aria-label','title','placeholder','content'])if(el.hasAttribute(attr)){const original=el.getAttribute(attr),value=englishText(original);if(value!==original)el.setAttribute(attr,value);}
 }
 if(root instanceof Element)for(const attr of ['aria-label','title','placeholder'])if(root.hasAttribute(attr))root.setAttribute(attr,englishText(root.getAttribute(attr)));
 document.title=tr('AI Atlas — Bản đồ hệ sinh thái AI');
}
