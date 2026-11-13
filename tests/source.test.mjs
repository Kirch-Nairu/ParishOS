import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const css=readFileSync(new URL('../styles.css',import.meta.url),'utf8');
const js=readFileSync(new URL('../app.js',import.meta.url),'utf8');
const workflow=readFileSync(new URL('../workflow.mjs',import.meta.url),'utf8');
test('R2 desk-first IA, secondary priest and meaningful case-route UI',()=>{
 for(const name of ['workdesk','inbox','requests','certificates','correspondence','marriage','scheduling','archive','finance','audit','intentions','priest'])
   assert.match(js,new RegExp("'"+name+"'"));
 assert.ok(js.indexOf("['workdesk'")<js.indexOf("['priest'"));
 assert.match(js,/function caseDetail\(/);
 assert.match(js,/function timeline\(/);
 assert.match(js,/data-open/);
});
test('demo safety, invalid print and no live data exchange',()=>{
 assert.match(html,/DEMO \/ INVALID/);
 assert.match(html,/No data is stored or sent/);
 assert.match(js,/SAMPLE · INVALID/);
 assert.match(js,/NO OFFICIAL SEAL/);
 assert.doesNotMatch(js,/\bfetch\s*\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|indexedDB/i);
 assert.doesNotMatch(workflow,/\bfetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|indexedDB/i);
});
test('three auditable journeys and guarded evidence fields appear in UI',()=>{
 for(const field of ['identityChecked','annotationChecked','draftRef','recipientChecked','classification','dueDate','outgoingRef','archiveRef','docsVerified','interviewAttested','bannsAttested','conflictChecked'])
  assert.match(js,new RegExp(field));
 assert.match(js,/history/);
 assert.match(js,/advance\(c,e\.target\.dataset\.action/);
});
test('responsive keyboard and accessibility primitives',()=>{
 assert.match(css,/@media\(max-width:990px\)/);
 assert.match(css,/@media\(max-width:680px\)/);
 assert.match(css,/@media\(max-width:380px\)/);
 assert.match(css,/:focus-visible/);
 assert.match(css,/prefers-reduced-motion/);
 assert.match(css,/@media print/);
 assert.match(html,/aria-label="Primary navigation"/);
 assert.match(html,/aria-live="polite"/);
 assert.match(html,/<dialog id="newCaseDialog"/);
 assert.match(js,/e\.key==='\/'/);
});
