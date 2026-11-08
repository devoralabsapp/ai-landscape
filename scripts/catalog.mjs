import {readFileSync} from 'node:fs';
import vm from 'node:vm';

export function loadCatalog(){
  const source=['data.js','product-data.js'].map(f=>readFileSync(new URL('../dist/'+f,import.meta.url),'utf8')).join('\n');
  return vm.runInNewContext(source+';({tools:TOOLS.map(t=>({...t,product:getProductProfile(t)})),categories:CATEGORIES,layers:LAYERS})',{}, {timeout:1000});
}
