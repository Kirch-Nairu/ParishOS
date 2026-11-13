// ParishOS R2 - transient, fictional clerical workflow simulator. No backend or canonical actions.
export const ROLE_NAMES = {administrator:'Office administrator',secretary:'Parish secretary',records:'Records officer',clerk:'Office clerk',finance:'Finance staff',priest:'Priest (secondary)'};
export const WORKFLOWS = {
  certificate:[
    {action:'verify_identity',title:'Verify requester',to:'Identity checked',roles:['administrator','secretary','records'],fields:['identityChecked']},
    {action:'verify_source',title:'Verify source register',to:'Register verified',roles:['administrator','records'],fields:['sourceRef','annotationChecked']},
    {action:'prepare_draft',title:'Prepare certificate draft',to:'Draft prepared',roles:['administrator','secretary','records'],fields:['draftRef']},
    {action:'queue_authorization',title:'Submit draft for approval',to:'Awaiting approval',roles:['administrator','secretary','records'],fields:['reviewer']},
    {action:'confirm_demo_approval',title:'Record approval decision',to:'Ready for release',roles:['administrator'],fields:['approvalAttested']},
    {action:'demo_release',title:'Record certificate release',to:'Demo released',roles:['administrator','secretary'],fields:['recipientChecked']}
  ],
  correspondence:[
    {action:'classify',title:'Classify incoming correspondence',to:'Classified',roles:['administrator','secretary','clerk'],fields:['classification']},
    {action:'assign',title:'Assign owner and due date',to:'Assigned',roles:['administrator','secretary'],fields:['owner','dueDate']},
    {action:'record_action',title:'Record office action',to:'Action recorded',roles:['administrator','secretary','clerk'],fields:['actionNote']},
    {action:'dispatch',title:'Record outgoing correspondence',to:'Dispatched',roles:['administrator','secretary'],fields:['outgoingRef']},
    {action:'archive',title:'Archive correspondence',to:'Archived',roles:['administrator','records'],fields:['archiveRef']}
  ],
  marriage:[
    {action:'request_followup',title:'Request missing documents',to:'Follow-up requested',roles:['administrator','secretary'],fields:['followupNote']},
    {action:'verify_requirements',title:'Verify document checklist',to:'Documents verified',roles:['administrator','secretary','records'],fields:['docsVerified']},
    {action:'record_interview',title:'Record interview completion',to:'Interview recorded',roles:['administrator','secretary'],fields:['interviewAttested']},
    {action:'office_review',title:'Complete office review',to:'Office review complete',roles:['administrator'],fields:['seminarAttested','bannsAttested','reviewAttested']},
    {action:'confirm_booking',title:'Confirm demonstration booking',to:'Booking confirmed',roles:['administrator','secretary'],fields:['bookingDate','assignedPriest','conflictChecked']}
  ]
};
const INITIAL = {
  certificate:'Received',correspondence:'Received',marriage:'Missing requirements'
};
function event(what,at,by,reference,note,from,to) {
  return {id:reference+'-'+what.toLowerCase().replace(/[^a-z0-9]+/g,'-'),what,at,by,reference,note:note||'',from:from||'',to:to||''};
}
export function seedCases(){
  return [
    {id:'CERT-0142',kind:'certificate',subject:'Ana Reyes',summary:'Baptismal certificate for marriage preparation',owner:'Records officer',priority:'High',received:'2026-11-10',due:'2026-11-14',status:'Received',step:0,sourceRef:'BAPT / VOL-02 / P.18 / 004',documents:['Request form','Authorization (if represented)','Register source'],metadata:{purpose:'Marriage preparation',annotations:'Restricted review pending',release:'Not issued'},history:[event('Request received','2026-11-10 09:12','Parish secretary','IN-0142','Front-desk intake recorded')]},
    {id:'CERT-0138',kind:'certificate',subject:'Luis Fernandez',summary:'Confirmation certificate ready for collection',owner:'Parish secretary',priority:'Normal',received:'2026-11-09',due:'2026-11-13',status:'Ready for release',step:5,sourceRef:'CONF / VOL-01 / P.42 / 011',documents:['Request form','Register source'],metadata:{purpose:'Parish requirement',annotations:'Reviewed in demonstration',release:'Awaiting collection'},history:[
       event('Request received','2026-11-09 09:05','Parish secretary','IN-0138','Intake registered'),
       event('Verify requester','2026-11-09 10:05','Records officer','IN-0138','Identity verification recorded'),
       event('Verify source register','2026-11-10 08:15','Records officer','CONF / VOL-01 / P.42 / 011','Register reference verified'),
       event('Prepare sample certificate','2026-11-10 09:00','Records officer','SAMPLE-CERT-0138','Certificate draft prepared'),
       event('Route for simulated authorization','2026-11-11 14:30','Parish secretary','SAMPLE-CERT-0138','Submitted for approval'),
       event('Record simulated approval clearance','2026-11-12 14:00','Office administrator','SAMPLE-CERT-0138','Approval review recorded')]
    },
    {id:'COR-0074',kind:'correspondence',subject:'North Chapel maintenance memorandum',summary:'Incoming chapel coordinator correspondence',owner:'Office clerk',priority:'Normal',received:'2026-11-11',due:'2026-11-12',status:'Received',step:0,sourceRef:'IN-2026-0074',documents:['Incoming letter','Supporting photograph'],metadata:{classification:'Unclassified',outgoing:'Not dispatched'},history:[event('Document received','2026-11-11 10:40','Office clerk','IN-2026-0074','Scanned document logged for routing')]},
    {id:'MAR-0019',kind:'marriage',subject:'Marco and Julia Santos',summary:'Marriage preparation and office readiness file',owner:'Parish secretary',priority:'High',received:'2026-11-08',due:'2026-11-19',status:'Missing requirements',step:0,sourceRef:'MAR-2026-0019',documents:['Baptismal certificates','Confirmation certificates','CENOMAR','Pre-Cana record'],verifiedDocs:['Baptismal certificates'],metadata:{ceremonyHeld:false,civilFiled:false,baptismParishNotified:false,booking:'Tentative only'},history:[event('Marriage file opened','2026-11-08 13:15','Parish secretary','MAR-2026-0019','Three requirements pending verification')]}
  ];
}
export const FINAL = {certificate:'Demo released',correspondence:'Archived',marriage:'Booking confirmed'};
export function nextStep(item){return (WORKFLOWS[item.kind]||[])[item.step]||null;}
export function allowed(item,role){const next=nextStep(item);return !!next&&next.roles.includes(role);}
export function advance(item,action,payload={},role='administrator',at='2026-11-13 15:00'){
  const next=nextStep(item);
  if(!next||next.action!==action)return {ok:false,error:'Invalid transition or already completed.'};
  if(!next.roles.includes(role))return {ok:false,error:'Select a staff role responsible for this step.'};
  for(const key of next.fields){
    const v=payload[key];
    if(v===false||v==null||String(v).trim()===''||v==='false')return {ok:false,error:'Required evidence missing: '+key+'.'};
  }
  if(action==='verify_requirements'){
    const docs=item.documents||[];
    if(!docs.every(d=>(item.verifiedDocs||[]).includes(d)))return {ok:false,error:'Every required document must be checked individually.'};
  }
  if(action==='assign'&&!/^\d{4}-\d{2}-\d{2}$/.test(payload.dueDate))return {ok:false,error:'Enter a valid due date.'};
  if(action==='confirm_booking'&&!/^\d{4}-\d{2}-\d{2}$/.test(payload.bookingDate))return {ok:false,error:'Enter a valid proposed booking date.'};
  const copy=JSON.parse(JSON.stringify(item));
  const old=copy.status;
  copy.step++;
  copy.status=next.to;
  if(payload.owner)copy.owner=payload.owner;
  if(payload.dueDate)copy.due=payload.dueDate;
  if(payload.classification)copy.metadata.classification=payload.classification;
  if(payload.outgoingRef)copy.metadata.outgoing=payload.outgoingRef;
  if(payload.bookingDate)copy.metadata.booking=payload.bookingDate+' (pending ceremony)';
  if(action==='verify_source')copy.metadata.annotations='Annotations reviewed';
  if(action==='demo_release')copy.metadata.release='Preview release recorded; no official certificate issued';
  const ref=payload.outgoingRef||payload.draftRef||payload.archiveRef||copy.sourceRef;
  const note=payload.actionNote||payload.followupNote||next.title;
  copy.history.push({...event(next.title,at,ROLE_NAMES[role],ref,note,old,next.to),id:copy.id+'-'+String(copy.history.length+1)});
  return {ok:true,item:copy};
}
export function toggleDocument(item,documentName){
  if(item.kind!=='marriage'||!item.documents.includes(documentName))return {ok:false,error:'Unknown checklist document.'};
  if(item.step>1)return {ok:false,error:'Document checklist is already verified.'};
  const copy=JSON.parse(JSON.stringify(item));
  const list=new Set(copy.verifiedDocs||[]);
  if(list.has(documentName))list.delete(documentName);else list.add(documentName);
  copy.verifiedDocs=[...list];
  return {ok:true,item:copy};
}
export function metrics(cases){
  return {
    open:cases.filter(c=>c.status!==FINAL[c.kind]).length,
    pending:cases.filter(c=>c.kind==='certificate'&&c.status!=='Demo released').length,
    ready:cases.filter(c=>c.kind==='certificate'&&c.status==='Ready for release').length,
    overdue:cases.filter(c=>c.due<'2026-11-13'&&c.status!==FINAL[c.kind]).length,
    next:cases.filter(c=>nextStep(c)).length
  };
}
