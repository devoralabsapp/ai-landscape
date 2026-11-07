import {readFileSync} from 'node:fs';
import vm from 'node:vm';

export function loadCatalog(){
  const source=readFileSync(new URL('../dist/data.js',import.meta.url),'utf8');
  return vm.runInNewContext(source+';({tools:TOOLS,categories:CATEGORIES,layers:LAYERS})',{}, {timeout:1000});
}
