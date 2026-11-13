import test from 'node:test';
import assert from 'node:assert/strict';
import {seedCases,advance,toggleDocument,nextStep,metrics,FINAL} from '../workflow.mjs';
const at='2026-11-13 15:30';
function run(c,a,p={},role='administrator'){return advance(c,a,p,role,at);}
test('certificate custody: guarded, ordered, immutable source, sample-only release and replay denial',()=>{
 let c=seedCases().find(x=>x.id==='CERT-0142'),before=JSON.stringify(c);
 assert.equal(run(c,'demo_release',{}).ok,false);
 assert.equal(run(c,'verify_identity',{identityChecked:false}).ok,false);
 assert.equal(JSON.stringify(c),before);
 c=run(c,'verify_identity',{identityChecked:true},'secretary').item;
 assert.equal(run(c,'verify_source',{sourceRef:c.sourceRef,annotationChecked:false},'records').ok,false);
 c=run(c,'verify_source',{sourceRef:c.sourceRef,annotationChecked:true},'records').item;
 c=run(c,'prepare_draft',{draftRef:'SAMPLE-CERT-0142'},'records').item;
 c=run(c,'queue_authorization',{reviewer:'Parish administrator'},'secretary').item;
 assert.equal(run(c,'demo_release',{recipientChecked:true},'secretary').ok,false);
 assert.equal(run(c,'confirm_demo_approval',{approvalAttested:false}).ok,false);
 c=run(c,'confirm_demo_approval',{approvalAttested:true}).item;
 assert.equal(c.status,'Ready for release');
 assert.equal(run(c,'demo_release',{recipientChecked:true},'records').ok,false);
 c=run(c,'demo_release',{recipientChecked:true},'secretary').item;
 assert.equal(c.status,FINAL.certificate);
 assert.equal(c.history.length,7);
 assert.match(c.metadata.release,/no official certificate issued/);
 assert.equal(run(c,'demo_release',{approvalAttested:true,recipientChecked:true}).ok,false);
});
test('correspondence: assign before dispatch, due date, outgoing ref and final archive trail',()=>{
 let c=seedCases().find(x=>x.id==='COR-0074');
 assert.equal(run(c,'assign',{owner:'Office clerk',dueDate:'2026-11-16'}).ok,false);
 c=run(c,'classify',{classification:'Facilities'}).item;
 assert.equal(run(c,'assign',{owner:'Office clerk',dueDate:'bad-date'}).ok,false);
 c=run(c,'assign',{owner:'Office clerk',dueDate:'2026-11-16'}).item;
 assert.equal(run(c,'dispatch',{outgoingRef:'OUT-2026-040'}).ok,false);
 c=run(c,'record_action',{actionNote:'Simulated inspection scheduled'}).item;
 assert.equal(run(c,'dispatch',{outgoingRef:''}).ok,false);
 c=run(c,'dispatch',{outgoingRef:'OUT-2026-040'}).item;
 c=run(c,'archive',{archiveRef:'ARC-2026-074'}).item;
 assert.equal(c.status,FINAL.correspondence);
 assert.equal(c.history.length,6);
 assert.equal(c.metadata.outgoing,'OUT-2026-040');
});
test('marriage: missing checklist blocks review and civil/post-ceremony obligations remain separate',()=>{
 let c=seedCases().find(x=>x.id==='MAR-0019');
 c=run(c,'request_followup',{followupNote:'Please submit missing documents'}).item;
 assert.equal(run(c,'verify_requirements',{docsVerified:true}).ok,false);
 for(const doc of c.documents){if(!c.verifiedDocs.includes(doc))c=toggleDocument(c,doc).item;}
 c=run(c,'verify_requirements',{docsVerified:true},'records').item;
 assert.equal(toggleDocument(c,'CENOMAR').ok,false);
 c=run(c,'record_interview',{interviewAttested:true}).item;
 assert.equal(run(c,'office_review',{seminarAttested:true,bannsAttested:false,reviewAttested:true}).ok,false);
 c=run(c,'office_review',{seminarAttested:true,bannsAttested:true,reviewAttested:true}).item;
 assert.equal(run(c,'confirm_booking',{bookingDate:'2026-12-05',assignedPriest:'Sample priest',conflictChecked:false}).ok,false);
 c=run(c,'confirm_booking',{bookingDate:'2026-12-05',assignedPriest:'Sample priest',conflictChecked:true}).item;
 assert.equal(c.status,FINAL.marriage);
 assert.equal(c.metadata.ceremonyHeld,false);
 assert.equal(c.metadata.civilFiled,false);
 assert.equal(c.metadata.baptismParishNotified,false);
 assert.equal(c.history.length,6);
});
test('seeds are fictional and fresh; queues derived from case states',()=>{
 const a=seedCases(),b=seedCases();
 assert.notEqual(a[0],b[0]);assert.equal(a.length,4);
 assert.equal(metrics(a).open,4);
 assert.equal(metrics(a).ready,1);
 assert.equal(metrics(a).overdue,1);
 assert.equal(nextStep(a[0]).action,'verify_identity');
 assert.equal(toggleDocument(a[0],'CENOMAR').ok,false);
});
