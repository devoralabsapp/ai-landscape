import {readFileSync} from 'node:fs';
import vm from 'node:vm';

export function loadCatalog(){
  const source=['data.js','product-data.js','security-data.js'].map(f=>readFileSync(new URL('../dist/'+f,import.meta.url),'utf8')).join('\n');
  const catalog=vm.runInNewContext(source+';({tools:TOOLS.map(t=>({...t,product:getProductProfile(t),security:SECURITY_PROFILES[t.id]})),categories:CATEGORIES,layers:LAYERS,workFields:WORK_FIELDS})',{}, {timeout:1000});
  const {logos}=JSON.parse(readFileSync(new URL('../dist/logo-sources.json',import.meta.url),'utf8'));
  catalog.tools=catalog.tools.map(t=>({...t,logo:logos[t.id]}));
  return catalog;
}
