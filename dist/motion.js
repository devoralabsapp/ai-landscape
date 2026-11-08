/* AI Atlas motion, adapted from Web Motion System Skill:
 * 033 line reveal, 077 vector draw, 081 scroll reveal, 091 FLIP,
 * 099 tab transition, 111 press feedback, 238 stagger.
 * Finite UI motion and separately owned ambient illustration loops. No app-state mutations.
 */
class AtlasMotion {
 constructor(){
  this.owned=new Map();this.ambient=new Map();this.artVisible=false;this.channels=new WeakMap();this.seen=new Set();this.observed=new WeakSet();this.snapshots=new Map();
  this.abort=new AbortController();this.frame=0;this.destroyed=false;this.ready=false;
  this.os=matchMedia('(prefers-reduced-motion: reduce)');this.siteReduced=preferenceRead('ai-atlas-motion')==='reduce';
  this.onPreference=()=>this.syncPreference();this.os.addEventListener('change',this.onPreference);
  const listen=(target,type,fn,options={})=>target.addEventListener(type,fn,{...options,signal:this.abort.signal});
  listen(window,'scroll',()=>this.schedule(),{passive:true});
  listen(window,'resize',()=>{this.stop();this.placeTabIndicator();if(this.ready)this.observeArt();this.schedule();});
  listen(document,'visibilitychange',()=>{if(document.hidden)this.stop();else this.schedule();this.syncAmbient();});
  listen(window,'pagehide',e=>{if(e.persisted){this.stop();this.pauseAmbient();this.observer?.disconnect();this.observed=new WeakSet();}else this.destroy();});
  listen(window,'pageshow',e=>{if(e.persisted)this.refresh();});
  listen(document,'pointerdown',e=>this.settleWithin(e.target.closest('.tool-tile,.list-row,[role="tabpanel"]')),{capture:true});
  listen(document,'focusin',e=>this.settleWithin(e.target.closest('.tool-tile,.list-row,[role="tabpanel"],dialog')));
  listen(document,'keydown',e=>{if(e.key==='Escape')this.stop();});
  listen(document,'click',e=>{
   const feedback=e.target.closest('[data-compare],[data-save]');
   if(feedback){const id=feedback.dataset.compare||feedback.dataset.save;queueMicrotask(()=>this.feedback(id));}
   const button=e.target.closest('button');if(!button)return;
   if(button.id==='motion-replay')this.intro();
   if(button.id==='motion-toggle'){this.siteReduced=!this.siteReduced;preferenceWrite('ai-atlas-motion',this.siteReduced?'reduce':'full');this.syncPreference();}
   if(button.id==='motion-notice-close'){document.querySelector('#motion-notice').hidden=true;try{sessionStorage.setItem('ai-atlas-motion-notice','dismissed');}catch{}}
  });
  this.syncPreference();
 }
 get reduced(){return this.os.matches||this.siteReduced;}
 play(element,keyframes,options={},channel='entrance'){
  if(!element||this.reduced||document.hidden||this.destroyed||!element.animate)return null;
  let channels=this.channels.get(element);if(!channels){channels=new Map();this.channels.set(element,channels);}
  channels.get(channel)?.cancel();
  const animation=element.animate(keyframes,{duration:520,easing:'cubic-bezier(.2,.75,.25,1)',...options});
  channels.set(channel,animation);this.owned.set(animation,{element,channel});
  const cleanup=()=>{this.owned.delete(animation);if(channels.get(channel)===animation)channels.delete(channel);};
  animation.finished.then(cleanup,cleanup);
  return animation;
 }
 settleWithin(root){if(!root)return;for(const [animation,{element}] of this.owned)if(root.contains(element))animation.cancel();}
 stop(){
  cancelAnimationFrame(this.frame);this.frame=0;
  for(const animation of this.owned.keys())animation.cancel();this.owned.clear();
 }
 syncPreference(){
  document.documentElement.dataset.motion=this.reduced?'reduce':'full';
  this.stop();
  this.observer?.disconnect();this.observed=new WeakSet();
  const toggle=document.querySelector('#motion-toggle');
  if(toggle){toggle.setAttribute('aria-pressed',String(this.reduced));toggle.disabled=this.os.matches;toggle.title=tr(this.os.matches?'Hệ thống đang bật giảm chuyển động':'Giảm chuyển động');}
  const notice=document.querySelector('#motion-notice');let dismissed=false;
  try{dismissed=sessionStorage.getItem('ai-atlas-motion-notice')==='dismissed';}catch{}
  if(notice)notice.hidden=!this.reduced||dismissed;
  const replay=document.querySelector('#motion-replay');if(replay)replay.disabled=this.reduced;
  if(this.ready)this.refresh();this.syncAmbient();this.schedule();
 }
 intro(){
  if(this.reduced)return;
  const hero=document.querySelector('.hero');this.settleWithin(hero);
  hero.querySelectorAll('.hero-line').forEach((line,i)=>this.play(line,[{opacity:.15,transform:'translateY(26px)',clipPath:'inset(0 -8% 100% -8%)'},{opacity:1,transform:'none',clipPath:'inset(-22% -8% -22% -8%)'}],{duration:820,delay:i*90},'hero'));
  hero.querySelectorAll('.hero-copy>.eyebrow,.hero-copy>p,.hero-actions .text-link>span,.hero-stats>div,.ai-atlas-art').forEach((element,i)=>this.play(element,[{opacity:.25,translate:'0 13px'},{opacity:1,translate:'0 0'}],{duration:650,delay:Math.min(i,7)*55},'hero'));
  hero.querySelectorAll('.ai-track').forEach((line,i)=>this.play(line,[{strokeDashoffset:1,opacity:.2},{strokeDashoffset:0,opacity:1}],{duration:1100,delay:i*130},'hero'));
 }
 schedule(){if(!this.frame&&!document.hidden&&!this.destroyed)this.frame=requestAnimationFrame(()=>{this.frame=0;this.measure();});}
 measure(){
  const progress=document.querySelector('#reading-progress'),max=document.documentElement.scrollHeight-innerHeight;
  if(progress)progress.style.transform=`scaleX(${max>0?Math.min(1,scrollY/max):0})`;
 }
 loop(element,keyframes,options){
  if(!element?.animate||this.destroyed||this.reduced)return;
  const animation=element.animate(keyframes,{iterations:Infinity,easing:'linear',...options});
  this.ambient.set(animation,element);
 }
 createAmbient(art){
  const orbits=[{name:'a',rx:151,ry:76,tilt:-28,phase:0,duration:16000},{name:'b',rx:143,ry:85,tilt:48,phase:120,duration:21000},{name:'c',rx:139,ry:112,tilt:8,phase:245,duration:28000}];
  for(const orbit of orbits){
   const tilt=orbit.tilt*Math.PI/180;
   const frames=Array.from({length:97},(_,i)=>{
    const theta=(orbit.phase+i*360/96)*Math.PI/180;
    const x=180+orbit.rx*Math.cos(theta)*Math.cos(tilt)-orbit.ry*Math.sin(theta)*Math.sin(tilt);
    const y=180+orbit.rx*Math.cos(theta)*Math.sin(tilt)+orbit.ry*Math.sin(theta)*Math.cos(tilt);
    return {transform:`translate(${x.toFixed(3)}px,${y.toFixed(3)}px)`};
   });
   this.loop(art.querySelector(`[data-orbit="${orbit.name}"]`),frames,{duration:orbit.duration});
  }
  this.loop(art.querySelector('.ai-halo'),[{transform:'rotate(0deg)'},{transform:'rotate(-360deg)'}],{duration:60000});
  this.loop(art.querySelector('.ai-trace'),[{strokeDashoffset:1},{strokeDashoffset:0}],{duration:18000});
  this.loop(art.querySelector('.ai-heart'),[{transform:'translateY(-3px) scale(.985)'},{transform:'translateY(3px) scale(1.015)'}],{duration:4400,direction:'alternate',easing:'ease-in-out'});
  this.loop(art.querySelector('.ai-star-one'),[{opacity:.4},{opacity:1}],{duration:3800,direction:'alternate',easing:'ease-in-out'});
 }
 pauseAmbient(){for(const animation of this.ambient.keys())animation.pause();}
 cancelAmbient(){for(const animation of this.ambient.keys())animation.cancel();this.ambient.clear();}
 syncAmbient(){
  const art=document.querySelector('.ai-illustration');if(!art)return;
  if(this.destroyed||this.reduced){this.cancelAmbient();art.dataset.ambient=this.reduced?'reduced':'stopped';return;}
  const active=this.artVisible&&!document.hidden;
  if(active&&!this.ambient.size)this.createAmbient(art);
  for(const animation of this.ambient.keys()){
   if(active&&animation.playState==='paused')animation.play();
   else if(!active&&animation.playState!=='paused')animation.pause();
  }
  art.dataset.ambient=active?'running':'paused';
 }
 observeArt(){
  const art=document.querySelector('.ai-illustration');if(!art)return;
  if(typeof IntersectionObserver==='undefined')this.artVisible=true;
  else if(!this.artObserver||this.artInset!==Math.ceil(document.querySelector('.topbar')?.getBoundingClientRect().height||0)){
   this.artObserver?.disconnect();this.artInset=Math.ceil(document.querySelector('.topbar')?.getBoundingClientRect().height||0);
   this.artObserver=new IntersectionObserver(entries=>{for(const entry of entries){this.artVisible=entry.isIntersecting;this.syncAmbient();}},{threshold:0,rootMargin:`-${this.artInset}px 0px 0px 0px`});
   this.artObserver.observe(art);
  }
  this.syncAmbient();
 }
 beforeResults(signature){
  this.resultsChanged=this.resultSignature!==undefined&&signature!==this.resultSignature;
  this.resultSignature=signature;this.snapshots.clear();
  const rows=[...document.querySelectorAll('#results [data-entry]')];
  // Read all old geometry before cancelling animation or rebuilding layout.
  for(const row of rows)this.snapshots.set(row.dataset.entry,{node:row,rect:row.getBoundingClientRect(),list:row.classList.contains('list-row')});
  this.settleWithin(document.querySelector('#results'));
  this.observer?.disconnect();this.observed=new WeakSet();
 }
 reconcileResults(){
  const replacements=[];
  for(const row of document.querySelectorAll('#results [data-entry]')){
   const old=this.snapshots.get(row.dataset.entry);
   if(old&&old.list===row.classList.contains('list-row'))replacements.push({row,old});
  }
  for(const {row,old} of replacements){
   // Keep article identity across filtering. Only changed state markup is updated.
   if(old.node.innerHTML!==row.innerHTML)old.node.innerHTML=row.innerHTML;
   row.replaceWith(old.node);
  }
  if(this.resultsChanged&&!this.reduced){
   const movements=[];
   for(const row of document.querySelectorAll('#results [data-entry]')){
    const rect=row.getBoundingClientRect(),old=this.snapshots.get(row.dataset.entry);
    if(rect.bottom<0||rect.top>innerHeight)continue;
    const visual=row.querySelector('.tile-face')||row.querySelector('.list-face');
    if(old){
     const dx=old.rect.left-rect.left,dy=old.rect.top-rect.top;
     if(Math.abs(dx)>1||Math.abs(dy)>1)movements.push({visual,dx:Math.max(-80,Math.min(80,dx)),dy:Math.max(-65,Math.min(65,dy))});
    }else movements.push({visual,dx:0,dy:10});
   }
   for(const {visual,dx,dy} of movements)this.play(visual,[{translate:`${dx}px ${dy}px`,opacity:.6},{translate:'0 0',opacity:1}],{duration:380},'layout');
  }
  this.snapshots.clear();
 }
 reveal(wrapper){
  const key=wrapper.dataset.motionGroup||wrapper.dataset.motionSection;
  if(this.seen.has(key))return;
  this.seen.add(key);
  if(this.reduced)return;
  const children=wrapper.matches('.category-group')?[wrapper.querySelector('.category-header h4'),...wrapper.querySelectorAll('.tile-face')]:[...wrapper.children];
  children.filter(Boolean).forEach((child,i)=>this.play(child,[{opacity:.25,translate:'0 18px'},{opacity:1,translate:'0 0'}],{duration:640,delay:Math.min(i,8)*28},'reveal'));
 }
 refresh(){
  if(this.destroyed)return;
  // Intersection targets remain untransformed. Entrances are one-shot per category.
  if(!this.observer&&typeof IntersectionObserver!=='undefined')this.observer=new IntersectionObserver(entries=>{
   for(const entry of entries)if(entry.isIntersecting){this.reveal(entry.target);this.observer.unobserve(entry.target);}
  },{rootMargin:'0px 0px -36px 0px',threshold:0});
  document.querySelectorAll('.understanding article').forEach((el,i)=>el.dataset.motionSection='term-'+i);
  for(const wrapper of document.querySelectorAll('[data-motion-group],[data-motion-section]')){
   const key=wrapper.dataset.motionGroup||wrapper.dataset.motionSection;
   if(this.seen.has(key)||this.observed.has(wrapper))continue;
   this.observed.add(wrapper);
   if(this.reduced||!this.observer)this.seen.add(key);else this.observer.observe(wrapper);
  }
  const bar=document.querySelector('#compare-bar');
  if(bar&&!bar.hidden&&this.barHidden!==false)this.play(bar,[{opacity:.2,translate:'0 16px'},{opacity:1,translate:'0 0'}],{duration:380},'bar');
  this.barHidden=bar?.hidden;
  this.syncAmbient();this.schedule();
 }
 feedback(id){
  const avatar=[...document.querySelectorAll('[data-entry]')].find(row=>row.dataset.entry===id)?.querySelector('.tool-avatar');
  this.play(avatar,[{scale:1},{scale:1.16,offset:.4},{scale:1}],{duration:360},'feedback');
 }
 toast(){this.play(document.querySelector('#toast'),[{opacity:.2,translate:'0 10px'},{opacity:1,translate:'0 0'}],{duration:260},'toast');}
 dialogOpen(dialog){
  this.settleWithin(dialog);
  const parts=dialog.querySelectorAll('.detail-identity,.detail-description,.product-intro,.model-row .model-copy,.plan-card,.info-content>h2,.info-content>p,.compare-content>h2');
  [...parts].filter(el=>!el.closest('[hidden]')).slice(0,14).forEach((el,i)=>this.play(el,[{opacity:.3,translate:'18px 0'},{opacity:1,translate:'0 0'}],{duration:420,delay:Math.min(i,6)*26},'dialog'));
  this.placeTabIndicator();
 }
 tabRect(){
  const tab=document.querySelector('[data-detail-tab][aria-selected="true"]');
  return tab?{left:tab.offsetLeft,width:tab.offsetWidth}:null;
 }
 placeTabIndicator(){
  const tabs=document.querySelector('.detail-tabs'),rect=this.tabRect();if(!tabs||!rect)return;
  let indicator=tabs.querySelector('.tab-indicator');
  if(!indicator){indicator=document.createElement('span');indicator.className='tab-indicator';indicator.setAttribute('aria-hidden','true');tabs.append(indicator);}
  indicator.style.transform=`translateX(${rect.left}px) scaleX(${rect.width})`;
 }
 tabTransition(name,previous){
  const panel=document.querySelector(`[data-detail-panel="${name}"]`);if(!panel)return;
  this.settleWithin(document.querySelector('#detail-dialog'));this.placeTabIndicator();
  const next=this.tabRect(),indicator=document.querySelector('.tab-indicator');
  if(previous&&next)this.play(indicator,[{transform:`translateX(${previous.left}px) scaleX(${previous.width})`},{transform:`translateX(${next.left}px) scaleX(${next.width})`}],{duration:330},'tabs');
  panel.querySelectorAll('.product-intro,.model-copy,.plan-card,.detail-meta,.detail-section').forEach((el,i)=>this.play(el,[{opacity:.35,translate:'0 9px'},{opacity:1,translate:'0 0'}],{duration:300,delay:Math.min(i,5)*20},'tab-panel'));
 }

 start(){this.ready=true;this.observeArt();this.intro();this.refresh();}
 destroy(){if(this.destroyed)return;this.destroyed=true;this.stop();this.cancelAmbient();this.artObserver?.disconnect();this.abort.abort();this.os.removeEventListener('change',this.onPreference);this.observer?.disconnect();}
}
const atlasMotion=new AtlasMotion();
