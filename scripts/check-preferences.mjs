import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(new URL('../dist/preferences.js',import.meta.url),'utf8');
function preferences(query='',saved={},blocked=false){
 const store={...saved};let current=new URL('https://atlas.example/'+query);
 const doc={documentElement:{dataset:{}},querySelector:()=>null};
 const context=vm.createContext({document:doc,URLSearchParams,location:{search:current.search,pathname:'/',hash:current.hash},localStorage:{getItem(key){if(blocked)throw Error('Unavailable');return store[key]||null;},setItem(key,value){if(blocked)throw Error('Unavailable');store[key]=value;}},history:{replaceState(_a,_b,url){current=new URL(url,current);}}});
 vm.runInContext(source,context);
 return {read:()=>vm.runInContext('({theme:THEME,lang:LANGUAGE,ids:ATLAS_THEMES.map(t=>t.id)})',context),apply:id=>vm.runInContext(`applyTheme(${JSON.stringify(id)})`,context),current:()=>current,store};
}
const p=preferences('?q=Opus&category=coding&tool=claude&theme=retro&lang=en#explore',{'ai-atlas-theme':'mono-os','ai-atlas-language':'vi'});
assert.equal(p.read().theme,'retro');assert.equal(p.read().lang,'en');
assert.equal(p.read().ids.join(','),'atlas,retro,mono-os,chapter-desk,afterhours-fm,margin-notes,sticker-sprint');
p.apply('afterhours-fm');
assert.equal(p.current().searchParams.get('q'),'Opus');assert.equal(p.current().searchParams.get('tool'),'claude');assert.equal(p.current().hash,'#explore');assert.equal(p.store['ai-atlas-theme'],'afterhours-fm');
assert.equal(preferences('',{'ai-atlas-theme':'margin-notes','ai-atlas-language':'en'}).read().theme,'margin-notes');
assert.equal(preferences('?theme=unknown&lang=xx').read().theme,'atlas');
assert.equal(preferences('?theme=unknown&lang=xx').read().lang,'vi');
assert.equal(preferences('',{},true).read().theme,'atlas');
console.log('Verified theme registry, URL/storage precedence, invalid values, blocked storage and preserved filters/deep links.');
