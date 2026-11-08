import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
// Test effective preferences and ownership without changing OS/browser settings.
class Surface extends EventTarget{}
const document=new Surface();document.hidden=false;document.documentElement={dataset:{}};document.querySelector=()=>null;document.querySelectorAll=()=>[];
const window=new Surface(),os=new Surface();os.matches=false;
let frameId=0,cancelled=0;const frames=new Map(),store=new Map();
const context=vm.createContext({document,window,matchMedia:()=>os,preferenceRead:()=>null,preferenceWrite:(key,value)=>store.set(key,value),tr:s=>s,AbortController,queueMicrotask,sessionStorage:{getItem:()=>null},requestAnimationFrame:fn=>{frames.set(++frameId,fn);return frameId;},cancelAnimationFrame:id=>frames.delete(id)});
vm.runInContext(readFileSync(new URL('../dist/motion.js',import.meta.url),'utf8'),context);
const motion=vm.runInContext('atlasMotion',context);
assert.equal(document.documentElement.dataset.motion,'full');
for(let i=0;i<20;i++)motion.schedule();assert.equal(frames.size,1,'Scroll work must coalesce');
let attempts=0;
const element={animate(){attempts++;return{finished:new Promise(()=>{}),cancel(){cancelled++;}};}};
motion.play(element,[{opacity:0},{opacity:1}]);assert.equal(motion.owned.size,1);
os.matches=true;os.dispatchEvent(new Event('change'));
assert.equal(document.documentElement.dataset.motion,'reduce');assert.equal(cancelled,1,'Preference change cancels owned motion');
motion.play(element,[{opacity:0},{opacity:1}]);assert.equal(attempts,1,'OS reduction prevents JS animation');
os.matches=false;motion.siteReduced=true;motion.syncPreference();assert.equal(document.documentElement.dataset.motion,'reduce','Voluntary reduction remains active');
motion.siteReduced=false;motion.syncPreference();assert.equal(document.documentElement.dataset.motion,'full');
motion.play(element,[{opacity:0},{opacity:1}]);motion.destroy();
assert.equal(motion.owned.size,0);assert.equal(frames.size,0);assert.equal(motion.abort.signal.aborted,true);
motion.play(element,[{opacity:0},{opacity:1}]);assert.equal(attempts,2,'Destroyed controller cannot restart');
console.log('Verified effective reduced motion, owned cancellation, single-frame scheduling and teardown.');
