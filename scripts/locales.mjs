import {readFileSync} from 'node:fs';
import vm from 'node:vm';
export const englishDictionary=JSON.parse(readFileSync(new URL('../dist/translations.en.json',import.meta.url),'utf8'));
const context=vm.createContext({EN_TEXT:englishDictionary,LANGUAGE:'en'});
vm.runInContext(readFileSync(new URL('../dist/i18n.js',import.meta.url),'utf8'),context);
const translate=vm.runInContext('englishText',context);
export function englishCatalog(value){
 if(typeof value==='string')return translate(value);
 if(Array.isArray(value))return value.map(englishCatalog);
 if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,englishCatalog(item)]));
 return value;
}
