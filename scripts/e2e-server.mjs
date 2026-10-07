import {spawn} from 'node:child_process';
import {mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {DatabaseSync} from 'node:sqlite';
mkdirSync('work',{recursive:true});
const database=resolve('work/browser-tests.sqlite');
const db=new DatabaseSync(database);db.exec('DROP TABLE IF EXISTS entries; DROP TABLE IF EXISTS runs;');db.close();
const children=[spawn(process.execPath,['server/index.mjs'],{stdio:'inherit',env:{...process.env,PORT:'3002',DATABASE_PATH:database}}),spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--mode','test','--port','5174'],{stdio:'inherit',env:{...process.env,API_PROXY_TARGET:'http://127.0.0.1:3002'}})];
let stopping=false;function stop(code=0){if(stopping)return;stopping=true;for(const child of children)child.kill();process.exitCode=code;}
for(const child of children){child.on('error',e=>{console.error(e);stop(1);});child.on('exit',code=>stop(code??0));}
process.on('SIGINT',()=>stop());process.on('SIGTERM',()=>stop());
