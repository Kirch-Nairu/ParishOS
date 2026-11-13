// Real browser checks against exported static files. All demo data is fictional.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile, mkdir} from 'node:fs/promises';
import {resolve, extname} from 'node:path';
import {chromium} from 'playwright';

const root=resolve(process.cwd(),'dist');
const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.txt':'text/plain'};
const server=createServer(async(req,res)=>{
 const target=(req.url||'/').split('?')[0];
 const filename=resolve(root,target==='/'?'index.html':target.replace(/^\/+/,''));
 if(!filename.startsWith(root+'/')){res.writeHead(403);res.end('Forbidden');return;}
 try{const bytes=await readFile(filename);res.writeHead(200,{'content-type':mime[extname(filename)]||'application/octet-stream'});res.end(bytes);}
 catch{res.writeHead(404);res.end('Not found');}
});
await new Promise(resolveServer=>server.listen(0,'127.0.0.1',resolveServer));
const port=server.address().port;
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:1440,height:960},deviceScaleFactor:1});
const errors=[];
page.on('pageerror',e=>errors.push('PAGE: '+e.message));
page.on('console',m=>{if(m.type()==='error')errors.push('CONSOLE: '+m.text());});
await mkdir('artifacts/browser',{recursive:true});
const gotoDesk=async()=>{await page.goto('http://127.0.0.1:'+port+'/',{waitUntil:'networkidle'});await page.locator('h1').first().waitFor();};
const submit=async()=>{await page.locator('#actionForm button[type=submit]').click();};
try{
 await gotoDesk();
 await page.emulateMedia({reducedMotion:'reduce'});
 assert.match(await page.locator('h1').first().innerText(),/Rectory office workdesk/);
 assert.equal(await page.locator('#navigation [data-nav="workdesk"]').getAttribute('aria-current'),'page');
 assert.equal(await page.locator('#navigation [data-nav="priest"]').count(),1);
 // Viewports, screenshots, overflow, navigation at mobile size.
 for(const width of [320,390,768,1024,1440]){
  await page.setViewportSize({width,height:960});
  await page.waitForTimeout(300);
  const dims=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,inner:innerWidth,body:document.body.scrollWidth}));
  assert.ok(dims.scroll<=width+1,'Document overflow at '+width+': '+JSON.stringify(dims));
  await page.screenshot({path:'artifacts/browser/workdesk-'+width+'.png',fullPage:true});
 }
 // Keyboard shortcut and mobile menu.
 await page.setViewportSize({width:390,height:844});
 await page.keyboard.press('/');
 assert.equal(await page.locator('#topSearch').evaluate(e=>document.activeElement===e),true);
 await page.locator('#openMenu').click();
 assert.equal(await page.locator('#sidebar').evaluate(e=>e.classList.contains('shown')),true);
 await page.keyboard.press('Escape');
 assert.equal(await page.locator('#sidebar').evaluate(e=>e.classList.contains('shown')),false);
 await page.setViewportSize({width:1440,height:960});
 // Role affordances are UI-only simulation.
 await page.locator('[data-open="CERT-0142"]').first().click();
 await page.locator('#roleSelect').selectOption('finance');
 assert.match(await page.locator('#content').innerText(),/another demo role/);
 assert.equal(await page.locator('#actionForm').count(),0);
 await page.locator('#roleSelect').selectOption('administrator');
 // Certificate: verify -> source -> draft -> authorization queue -> fictional release.
 await page.locator('input[name="identityChecked"]').check();await submit();
 await page.locator('input[name="annotationChecked"]').check();await submit();
 await page.locator('input[name="draftRef"]').fill('SAMPLE-CERT-0142');await submit();
 await page.locator('select[name="reviewer"]').selectOption({label:'Parish administrator'});await submit();
 await page.locator('input[name="approvalAttested"]').check();await submit();
 assert.match(await page.locator('.case-heading').innerText(),/Ready for release/);
 await page.locator('input[name="recipientChecked"]').check();await submit();
 assert.match(await page.locator('.case-heading').innerText(),/Demo released/);
 assert.equal(await page.locator('.timeline li').count(),7);
 await page.locator('[data-preview="CERT-0142"]').click();
 assert.match(await page.locator('#printDialog').innerText(),/SAMPLE · INVALID/);
 await page.screenshot({path:'artifacts/browser/certificate-sample-print-preview.png',fullPage:true});
 await page.locator('#printDialog [data-close-dialog]').click();
 // Correspondence must preserve outgoing ref and archived activity.
 await page.locator('#navigation [data-nav="correspondence"]').click();
 await page.locator('[data-open="COR-0074"]').first().click();
 await page.locator('select[name="classification"]').selectOption({label:'Facilities'});await submit();
 await page.locator('select[name="owner"]').selectOption({label:'Office clerk'});
 await page.locator('input[name="dueDate"]').fill('2026-11-17');await submit();
 await page.locator('textarea[name="actionNote"]').fill('Fictional response prepared');await submit();
 await page.locator('input[name="outgoingRef"]').fill('OUT-2026-0074');await submit();
 await page.locator('input[name="archiveRef"]').fill('ARC-2026-0074');await submit();
 assert.match(await page.locator('.case-heading').innerText(),/Archived/);
 assert.match(await page.locator('.timeline').innerText(),/OUT-2026-0074/);
 await page.screenshot({path:'artifacts/browser/correspondence-timeline.png',fullPage:true});
 // Marriage: missing documents block advancement until individual checks exist.
 await page.locator('#navigation [data-nav="marriage"]').click();
 await page.locator('[data-open="MAR-0019"]').first().click();
 await page.locator('textarea[name="followupNote"]').fill('Please supply pending fictional documents');await submit();
 await page.locator('input[name="docsVerified"]').check();await submit();
 assert.match(await page.locator('#toast').innerText(),/Every required document/);
 for(const d of ['Confirmation certificates','CENOMAR','Pre-Cana record']){
  await page.locator('.doc-check input[data-doc="'+d+'"]').check();
 }
 await page.locator('input[name="docsVerified"]').check();await submit();
 await page.locator('input[name="interviewAttested"]').check();await submit();
 for(const name of ['seminarAttested','bannsAttested','reviewAttested'])await page.locator('input[name="'+name+'"]').check();
 await submit();
 await page.locator('input[name="bookingDate"]').fill('2026-12-05');
 await page.locator('select[name="assignedPriest"]').selectOption({label:'Sample Priest A'});
 await page.locator('input[name="conflictChecked"]').check();await submit();
 const marriageText=await page.locator('#content').innerText();
 assert.match(marriageText,/Booking confirmed/);
 assert.match(marriageText,/Civil filing: No/);
 assert.match(marriageText,/Baptismal parish notified: No/);
 await page.screenshot({path:'artifacts/browser/marriage-case-audit.png',fullPage:true});
 // Findability, empty state and in-memory reset on reload.
 await page.locator('#navigation [data-nav="inbox"]').click();
 await page.locator('#topSearch').fill('NO-MATCH-REF');
 assert.match(await page.locator('#caseRows').innerText(),/No fictional cases match/);
 await page.reload({waitUntil:'networkidle'});
 assert.match(await page.locator('#content').innerText(),/Rectory office workdesk/);
 assert.equal(await page.locator('.kpi').first().innerText().then(t=>t.includes('4')),true);
 assert.deepEqual(errors,[]);
 console.log('PASS: real Chromium desk, 5 viewport screenshots/no overflow, shortcut/menu, denied role, all 3 case journeys, audit, print preview, reset.');
}finally{
 await browser.close();
 await new Promise(done=>server.close(done));
}
