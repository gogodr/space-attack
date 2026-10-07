import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'e2e',workers:1,timeout:30000,use:{baseURL:'http://127.0.0.1:5174',headless:true,viewport:{width:1440,height:1000},launchOptions:{args:['--enable-unsafe-swiftshader']}},webServer:{command:'node scripts/e2e-server.mjs',url:'http://127.0.0.1:5174',reuseExistingServer:false,timeout:30000}});
