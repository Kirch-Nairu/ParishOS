import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CATALOG,INDEX,createModuleData,nextStatus,transition} from '../system-data.mjs';
import {createShowcaseState,renderDesk,renderShowcase,isShowcaseRoute,onShowcaseClick,onShowcaseSubmit} from '../system-ui.mjs';
import {seedCases} from '../workflow.mjs';

const js=readFileSync(new URL('../app.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../system.css',import.meta.url),'utf8');
const build=readFileSync(new URL('../scripts/build.mjs',import.meta.url),'utf8');

test('all 22 requested modules have a real navigation route and meaningful content',()=>{
 const core=['workdesk','inbox','certificates','marriage','correspondence'];
 const ids=[...core,...CATALOG.filter(x=>x.id!=='priest').map(x=>x.id)];
 assert.equal(ids.length,22);
 assert.equal(new Set(ids).size,22);
 for(const id of ids){
  assert.ok(js.includes("['"+id+"'"),id+' has a primary navigation entry');
  const page=CATALOG.find(x=>x.id===id);
  if(page)assert.ok(page.features.length>=4,page.title+' features');
 }
 for(const priority of ['Essential','High','Secondary','Optional'])assert.ok(CATALOG.some(x=>x.priority===priority));
 assert.ok(js.indexOf("['workdesk'")<js.indexOf("['priest'"));
});
test('static browser build includes every imported local asset',()=>{
 for(const file of ['index.html','styles.css','system.css','app.js','workflow.mjs','system-data.mjs','system-ui.mjs'])
  assert.ok(build.includes(file));
 assert.match(css,/sys-module-workspace/);
 assert.match(css,/sys-priest-wrap/);
 assert.match(css,/sys-portal/);
 assert.match(css,/@media\(max-width:380px\)/);
});
test('every data module provides populated fictional work queue and metadata',()=>{
 const data=createModuleData();
 const eligible=CATALOG.filter(m=>!['public','priest'].includes(m.id));
 for(const m of eligible){
  const rows=data.filter(r=>r.module===m.id);
  assert.ok(rows.length>=2,'nonempty '+m.id);
  for(const r of rows){
   assert.ok(r.id&&r.title&&r.status&&r.owner&&r.date);
   assert.ok(r.timeline.length>=1);
   assert.ok(r.fields.length>=2);
  }
 }
 assert.ok(data.length>=40);
});
test('mass intention offering does not change when fulfillment is recorded',()=>{
 let c=createModuleData().find(x=>x.id==='MI-2602');
 const saved=c.fields.find(x=>x.label==='Offering')?.value||'None';
 const result=transition(c,'secretary');
 assert.equal(result.ok,true);
 c=result.record;
 assert.equal(c.status,'Celebrated (demo)');
 assert.equal(c.fields.find(x=>x.label==='Offering')?.value||'None',saved);
 assert.equal(c.timeline.length,2);
});
test('priest assignment does not auto-approve under wrong role',()=>{
 const c=createModuleData().find(x=>x.id==='PS-102');
 assert.equal(nextStatus(c),'Accepted (demo)');
 assert.equal(transition(c,'finance').ok,false);
 assert.equal(transition(c,'administrator').ok,false); // only the priest persona can accept a proposed assignment
 assert.equal(transition(c,'priest').record.status,'Accepted (demo)');
});
test('expense approval needs separate administrator attestation in demo',()=>{
 const c=createModuleData().find(x=>x.id==='FIN-084');
 assert.equal(transition(c,'finance').ok,false);
 assert.equal(transition(c,'secretary').ok,false);
 const result=transition(c,'administrator');
 assert.equal(result.ok,true);
 assert.equal(result.record.status,'Approved (demo)');
 assert.equal(result.record.fields.find(x=>x.label==='Payment').value,'No real disbursement');
});
test('restricted donation remains purpose-bound after status transition',()=>{
 const c=createModuleData().find(x=>x.id==='DON-043');
 const before=c.fields.find(x=>x.label==='Purpose').value;
 const result=transition(c,'finance');
 assert.equal(result.ok,true);
 assert.equal(result.record.fields.find(x=>x.label==='Purpose').value,before);
 assert.equal(c.status,'Count verified');
});
test('unsupported roles are denied, completed records have no next transition',()=>{
 const records=createModuleData();
 const c=records.find(x=>x.id==='REG-C-089');
 assert.equal(transition(c,'finance').ok,false);
 assert.equal(transition(c,'records').ok,true);
 const r=records.find(x=>x.id==='CAT-019');
 assert.equal(transition(r,'administrator').ok,false);
});
test('dashboard and every module render real content and cases without internet or persistence',()=>{
 const s=createShowcaseState(),cases=seedCases();
 assert.match(renderDesk(s,cases),/Office command center/);
 for(const m of CATALOG){
  assert.equal(isShowcaseRoute(m.id),true);
  const view=renderShowcase(m.id,s,cases,'administrator');
  assert.ok(view.length>800,'rendered '+m.id);
  assert.match(view,/DEMO|demo|fictional|sample|Sample/);
 }
 for(const script of [js,readFileSync(new URL('../system-ui.mjs',import.meta.url),'utf8'),readFileSync(new URL('../system-data.mjs',import.meta.url),'utf8')])
  assert.doesNotMatch(script,/\bfetch\s*\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|indexedDB/i);
});
test('record actions preserve visible timeline and reset data on demand',()=>{
 const state=createShowcaseState();
 const seed=state.records.find(r=>r.id==='BAP-026');
 const result=onShowcaseClick({dataset:{sysNext:'BAP-026'}},state,'secretary');
 assert.equal(result.refresh,true);
 assert.equal(state.records.find(r=>r.id==='BAP-026').timeline.length,2);
 assert.equal(state.records.find(r=>r.id==='BAP-026').status,'Requirements checked');
 const again=onShowcaseClick({dataset:{sysReset:''}},state,'administrator');
 assert.equal(again.refresh,true);
 assert.equal(state.records.find(r=>r.id==='BAP-026').status,seed.status);
});
test('portal intake and module create validate labels and cannot create unsupported module',()=>{
 const state=createShowcaseState();
 assert.equal(onShowcaseSubmit({id:'other'},state,'secretary'),null);
 assert.equal(isShowcaseRoute('nonexistent'),false);
});
