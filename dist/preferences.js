/* Adapted from Creative Theme System's first six gallery entries.
 * https://github.com/devoralabsapp/creative-theme-system-skill */
const ATLAS_THEMES=[
 {id:'atlas',name:'AI Atlas · Original',color:'#f6f7f5'},
 {id:'retro',name:'Playful Retro Neo-Brutalism',color:'#faf6e9'},
 {id:'mono-os',name:'Mono OS',color:'#d9d9d9'},
 {id:'chapter-desk',name:'Chapter Desk',color:'#f4e9d5'},
 {id:'afterhours-fm',name:'Afterhours FM',color:'#101010'},
 {id:'margin-notes',name:'Margin Notes',color:'#f0e9df'},
 {id:'sticker-sprint',name:'Sticker Sprint',color:'#fff8ec'}
];
const preferenceRead=key=>{try{return localStorage.getItem(key);}catch{return null;}};
const preferenceWrite=(key,value)=>{try{localStorage.setItem(key,value);}catch{/* URL selection still works. */}};
const prefQuery=new URLSearchParams(location.search);
const selectedTheme=prefQuery.get('theme')||preferenceRead('ai-atlas-theme')||'atlas';
const THEME=ATLAS_THEMES.some(t=>t.id===selectedTheme)?selectedTheme:'atlas';
const selectedLanguage=prefQuery.get('lang')||preferenceRead('ai-atlas-language')||'vi';
const LANGUAGE=['vi','en'].includes(selectedLanguage)?selectedLanguage:'vi';
document.documentElement.dataset.theme=THEME;
document.documentElement.lang=LANGUAGE;
function applyTheme(id,{persist=true}={}){
 const theme=ATLAS_THEMES.find(t=>t.id===id);if(!theme)return;
 document.documentElement.dataset.theme=id;
 document.querySelector('meta[name="theme-color"]')?.setAttribute('content',theme.color);
 const picker=document.querySelector('#theme-select');if(picker)picker.value=id;
 if(persist)preferenceWrite('ai-atlas-theme',id);
 const params=new URLSearchParams(location.search);params.set('theme',id);
 history.replaceState(null,'',location.pathname+'?'+params+location.hash);
 const announcement=document.querySelector('#preferences-status');
 if(announcement)announcement.textContent=(LANGUAGE==='en'?'Theme: ':'Giao diện: ')+theme.name;
}
