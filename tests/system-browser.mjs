import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {chromium} from 'playwright';

const root=resolve(process.cwd(),'dist');
const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.txt':'text/plain'};
const server=createServer(async(req,res)=>{
 const target=(req.url||'/').split('?')[0];
 const file=resolve(root,target==='/'?'index.html':target.replace(/^\/+/,''));
 if(!file.startsWith(root+'/')){res.writeHead(403);res.end();return;}
 try{const bytes=await readFile(file);res.writeHead(200,{'Content-Type':mime[extname(file)]||'text/plain'});res.end(bytes);}
 catch{res.writeHead(404);res.end('Not found');}
});
await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
const errors=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
await mkdir('artifacts/system-browser',{recursive:true});
const url='http://127.0.0.1:'+server.address().port+'/';
const go=async(id)=>{await page.locator('#navigation [data-nav="'+id+'"]').click();};
const role=async(r)=>{await page.locator('#roleSelect').selectOption(r);};
const next=async(id)=>{await page.locator('[data-sys-next="'+id+'"]').click();};
try{
 await page.goto(url,{waitUntil:'networkidle'});
 await page.emulateMedia({reducedMotion:'reduce'});
 assert.match(await page.locator('h1').first().innerText(),/Office command center/);
 assert.ok(await page.locator('#navigation .nav-button').count()>=25);
 assert.equal(await page.locator('.sys-directory button').count(),22);
 const modules=['registry','certificates','marriage','baptism','intentions','collections','public','funerals','finance','correspondence','catechism','chapels','ministries','announcements','facilities','rectory','diocese','personnel','cemetery','priest_schedule','inbox','workdesk'];
 for(const id of modules)assert.equal(await page.locator('#navigation [data-nav="'+id+'"]').count(),1,'route '+id);
 for(const width of [320,390,768,1024,1440]){
  await page.setViewportSize({width,height:920});
  await page.waitForTimeout(260);
  const size=await page.evaluate(()=>({document:document.documentElement.scrollWidth,viewport:window.innerWidth}));
  assert.ok(size.document<=width+1,'dashboard overflow '+width+': '+JSON.stringify(size));
  await page.screenshot({path:'artifacts/system-browser/workdesk-'+width+'.png',fullPage:true});
 }
 await page.setViewportSize({width:1440,height:980});
 // Professional registry index, annotation review, and checklist audit.
 await go('registry');
 assert.match(await page.locator('h1').first().innerText(),/Sacramental registry/);
 assert.ok(await page.locator('.sys-register-grid > div').count()===4);
 await page.screenshot({path:'artifacts/system-browser/sacramental-registry.png',fullPage:true});
 await role('records');
 await page.locator('[data-sys-open="REG-C-089"]').click();
 await next('REG-C-089');
 assert.match(await page.locator('.sys-inspector').innerText(),/Review queued/);
 await page.locator('input[data-sys-check="REG-C-089"]').first().check();
 assert.match(await page.locator('.sys-timeline').innerText(),/Supporting evidence checklist changed/);
 // Distinct baptism prep module with realistic metadata.
 await go('baptism');
 assert.match(await page.locator('.sys-attention').innerText(),/Baptismal eligibility/);
 await role('secretary');
 await page.screenshot({path:'artifacts/system-browser/baptism-management.png',fullPage:true});
 await page.locator('[data-sys-next="BAP-026"]').click();
 assert.match(await page.locator('#toast').innerText(),/Check every sponsor/);
 for(let i=0;i<3;i++)await page.locator('input[data-sys-check="BAP-026"]').nth(i).check();
 await next('BAP-026');
 assert.match(await page.locator('.sys-inspector').innerText(),/Requirements checked/);
 // Mass intention fulfillment separate from financial offering.
 await go('intentions');
 await page.locator('[data-sys-open="MI-2601"]').click();
 await page.locator('[data-sys-celebrant="MI-2601"]').selectOption('Fr. Mateo Cruz');
 await next('MI-2601');
 await role('priest');await next('MI-2601');
 const intention=await page.locator('.sys-inspector').innerText();
 assert.match(intention,/Celebrated \(demo\)/);
 assert.match(intention,/₱100/);
 // Collection custody, wrong-role prevention, restricted fund display.
 await go('collections');
 await page.locator('[data-sys-open="COL-112"]').click();
 assert.equal(await page.locator('[data-sys-next="COL-112"]').isDisabled(),true);
 await role('finance');
 await page.locator('[data-sys-next="COL-112"]').click();
 assert.match(await page.locator('#toast').innerText(),/Collection count and witness/);
 for(let i=0;i<2;i++)await page.locator('input[data-sys-check="COL-112"]').nth(i).check();
 await next('COL-112');
 assert.match(await page.locator('.sys-inspector').innerText(),/Count verified/);
 await page.locator('[data-sys-deposit-ref="COL-112"]').fill('SAMPLE-DEP-112');
 await next('COL-112');
 assert.match(await page.locator('.sys-inspector').innerText(),/Deposit matched/);
 await page.screenshot({path:'artifacts/system-browser/collections.png',fullPage:true});
 await go('finance');await page.screenshot({path:'artifacts/system-browser/parish-finance.png',fullPage:true});
 // Priest phone experience interacts with the scheduling records.
 await go('priest');
 assert.match(await page.locator('.sys-phone').innerText(),/Good morning/);
 await role('priest');
 await page.screenshot({path:'artifacts/system-browser/priest-mobile-companion.png',fullPage:true});
 await page.locator('[data-sys-phone-accept="PS-102"]').click();
 await go('priest_schedule');
 await page.locator('[data-sys-open="PS-102"]').click();
 assert.match(await page.locator('.sys-inspector').innerText(),/Accepted \(demo\)/);
 await page.locator('[data-sys-open="PS-103"]').click();
 assert.equal(await page.locator('[data-sys-next="PS-103"]').isDisabled(),true);
 assert.match(await page.locator('.sys-inspector').innerText(),/Overlapping availability detected/);
 await page.screenshot({path:'artifacts/system-browser/priest-scheduling.png',fullPage:true});
 // Public portal connects a fictional request into the secretariat case system.
 await go('public');
 assert.match(await page.locator('.sys-public-hero').innerText(),/Less time in line/);
 await page.screenshot({path:'artifacts/system-browser/parishioner-portal.png',fullPage:true});
 await page.locator('#publicService').selectOption('certificate');
 await page.locator('#publicForm input[name="subject"]').fill('Sample Household Z');
 await page.locator('#publicForm button[type="submit"]').click();
 assert.match(await page.locator('.sys-tracking').innerText(),/Sample Household Z/);
 const ref=(await page.locator('.sys-tracking b').innerText()).trim();
 assert.match(ref,/^CERT-D\d+/);
 await page.locator('[data-open="'+ref+'"]').click();
 assert.match(await page.locator('.case-heading').innerText(),/Sample Household Z/);
 // print preview and other modules must render user-facing content.
 await go('finance');await page.locator('[data-sys-report="finance"]').click();
 assert.match(await page.locator('#printDialog').innerText(),/SAMPLE · INVALID/);
 await page.locator('#printDialog [data-close-dialog]').click();
 for(const id of ['funerals','catechism','chapels','ministries','announcements','facilities','rectory','diocese','personnel','cemetery']){
  await go(id);
  assert.ok(await page.locator('.sys-record').count()>=2,id+' queue');
  assert.ok(await page.locator('.sys-inspector').count()===1,id+' inspector');
 }
 // Check responsive module screens for horizontal overflow and visible detail.
 await go('registry');
 for(const width of [320,390,768]){
  await page.setViewportSize({width,height:920});await page.waitForTimeout(260);
  const size=await page.evaluate(()=>({document:document.documentElement.scrollWidth,viewport:window.innerWidth}));
  assert.ok(size.document<=width+1,'module overflow '+width+': '+JSON.stringify(size));
  await page.screenshot({path:'artifacts/system-browser/registry-'+width+'.png',fullPage:true});
 }
 assert.deepEqual(errors,[]);
 console.log('PASS ParishOS system: 22 modules, 5 dashboard widths, 3 module widths, registry, baptism, Mass obligations, collections, public-office bridge, priest mobile and calendar, finance, print, no browser errors.');
} finally {
 await browser.close();
 await new Promise(ok=>server.close(ok));
}
