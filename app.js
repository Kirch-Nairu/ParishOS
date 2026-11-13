import {seedCases,advance,nextStep,allowed,toggleDocument,metrics,ROLE_NAMES,FINAL,WORKFLOWS} from './workflow.mjs';
import {CATALOG} from './system-data.mjs';
import {createShowcaseState,renderDesk,renderShowcase,isShowcaseRoute,onShowcaseClick,onShowcaseSubmit,updateShowcaseSearch,updateShowcaseFilter,updatePortalSearch,setPortalRef,renderShowcaseTable} from './system-ui.mjs';

const SECTIONS=[
 {group:'OFFICE OPERATIONS',items:[['workdesk','Office command center','▦'],['inbox','Office inbox','▤'],['requests','Service requests','▥'],['correspondence','Correspondence','✉'],['archive','Document archive','▧'],['audit','Activity & audit','◷']]},
 {group:'SACRAMENTS & RECORDS',items:[['registry','Sacramental registry','◫'],['certificates','Certificate center','▣'],['marriage','Wedding management','◇'],['baptism','Baptism management','◉'],['intentions','Mass intentions','✣'],['funerals','Funerals & sick calls','✚']]},
 {group:'PASTORAL & SCHEDULING',items:[['priest_schedule','Priest scheduling','◷'],['scheduling','Parish calendar','▦'],['catechism','Catechism & seminars','▤'],['chapels','Barangay chapels / BECs','⌂'],['ministries','Ministry management','♙']]},
 {group:'FINANCE & ADMIN',items:[['collections','Collections & donations','₱'],['finance','Parish finance','▦'],['facilities','Facilities & inventory','▧'],['rectory','Rectory administration','⌑'],['diocese','Diocesan coordination','⇥'],['personnel','Personnel administration','♧'],['cemetery','Cemetery / columbarium','◇']]},
 {group:'PUBLIC & COMPANION',items:[['public','Parishioner portal','◎'],['announcements','Announcements','◖'],['priest','Priest companion (mobile)','◉']]}
];
const TYPES={certificate:'Certificate',correspondence:'Correspondence',marriage:'Marriage file'};
const FIELDS={
 identityChecked:{label:'Requester identity or representative authorization verified',type:'checkbox'},
 sourceRef:{label:'Source register volume / page / entry',type:'text'},
 annotationChecked:{label:'Register annotations and restrictions reviewed',type:'checkbox'},
 draftRef:{label:'Certificate draft reference',type:'text',placeholder:'SAMPLE-CERT-0142'},
 reviewer:{label:'Send for approval',type:'select',options:['Parish administrator','Parish priest']},
 approvalAttested:{label:'Approval review completed in this preview',type:'checkbox'},
 recipientChecked:{label:'Recipient identity checked for release',type:'checkbox'},
 classification:{label:'Classification',type:'select',options:['Facilities','Pastoral','Administration','Diocesan correspondence']},
 owner:{label:'Responsible office staff',type:'select',options:['Office clerk','Parish secretary','Records officer','Office administrator']},
 dueDate:{label:'Assigned due date',type:'date'},
 actionNote:{label:'Action / response summary',type:'textarea',placeholder:'Record the action taken or response prepared'},
 outgoingRef:{label:'Outgoing correspondence reference',type:'text',placeholder:'OUT-2026-0074'},
 archiveRef:{label:'Archive location / file reference',type:'text',placeholder:'ARC-2026-0074'},
 followupNote:{label:'Follow-up instruction for missing documents',type:'textarea',placeholder:'List the outstanding requirements'},
 docsVerified:{label:'I confirmed every individual item in the checklist above',type:'checkbox'},
 interviewAttested:{label:'Marriage interview documented',type:'checkbox'},
 seminarAttested:{label:'Marriage preparation seminar reviewed',type:'checkbox'},
 bannsAttested:{label:'Marriage banns requirements reviewed',type:'checkbox'},
 reviewAttested:{label:'Office requirements review completed',type:'checkbox'},
 bookingDate:{label:'Proposed ceremony date',type:'date'},
 assignedPriest:{label:'Proposed celebrant',type:'select',options:['Fr. Mateo Cruz','Fr. Gabriel Santos']},
 conflictChecked:{label:'Celebrant availability and calendar conflicts checked',type:'checkbox'}
};
const $=s=>document.querySelector(s);
const safe=x=>String(x??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
let cases=seedCases(),role='administrator',route='workdesk',selectedId=null,query='',filter='All',toastTimer=null,lastFocus=null;
const showcase=createShowcaseState();
const displayDate=s=>s?safe(s):'—';
const tone=s=>/released|archived|confirmed|complete|verified/i.test(s)?'green':/awaiting|missing|received|follow-up/i.test(s)?'amber':'blue';
function pill(value){return '<span class="pill '+tone(value)+'">'+safe(value)+'</span>';}
function caseById(id){return cases.find(c=>c.id===id);}
function now(){return new Date().toLocaleString('en-PH',{dateStyle:'medium',timeStyle:'short'});}
function notice(t){const e=$('#toast');e.textContent=t;e.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>e.hidden=true,4500);}
function titleOf(r){const all=SECTIONS.flatMap(g=>g.items);return (all.find(x=>x[0]===r)||[])[1]||'Case detail';}
function nav(){
 $('#navigation').innerHTML=SECTIONS.map(g=>'<div class="nav-group"><span class="nav-label">'+g.group+'</span>'+g.items.map(([id,label,icon])=>'<button type="button" class="nav-button '+(route===id?'active':'')+'" data-nav="'+id+'" '+(route===id?'aria-current="page"':'')+'><span class="nav-icon" aria-hidden="true">'+icon+'</span><span>'+label+'</span>'+(id==='inbox'?'<span class="nav-count">'+metrics(cases).open+'</span>':'')+'</button>').join('')+'</div>').join('');
}
function closeMenu(){ $('#sidebar').classList.remove('shown');$('#backdrop').hidden=true;$('#openMenu').setAttribute('aria-expanded','false'); }
function openMenu(){ $('#sidebar').classList.add('shown');$('#backdrop').hidden=false;$('#openMenu').setAttribute('aria-expanded','true');$('#closeMenu').focus(); }
function go(view,id){
 route=view;selectedId=id||null;filter='All';closeMenu();render();window.scrollTo(0,0);$('#main').focus({preventScroll:true});
}
function header(kicker,title,sub,action=''){
 return '<div class="page-title"><div><span class="eyebrow">'+kicker+'</span><h1>'+title+'</h1><p>'+sub+'</p></div>'+action+'</div>';
}
function btnNew(){return '<button type="button" class="button primary" data-new>+ New intake</button>';}
function cardKpi(label,count,detail,mark){
 return '<div class="kpi"><div class="kpi-top"><span>'+label+'</span><b aria-hidden="true">'+mark+'</b></div><strong>'+count+'</strong><small>'+detail+'</small></div>';
}
function tableRows(list,showAction=true){
 if(!list.length)return '<tr><td colspan="'+(showAction?7:6)+'" class="empty-state">No matching cases. Try a different search or filter.</td></tr>';
 return list.map(c=>{const next=nextStep(c);return '<tr><td><button type="button" class="ref-button" data-open="'+safe(c.id)+'">'+safe(c.id)+'</button><span class="muted mini">'+safe(TYPES[c.kind])+'</span></td><td><strong>'+safe(c.subject)+'</strong><span class="muted mini">'+safe(c.summary)+'</span></td><td>'+pill(c.priority)+'</td><td>'+safe(c.owner)+'</td><td class="nowrap">'+displayDate(c.due)+'</td><td>'+pill(c.status)+'</td>'+(showAction?'<td><button type="button" class="button tiny outline" data-open="'+safe(c.id)+'">'+(next?'Process':'Inspect')+' <span aria-hidden="true">↗</span></button></td>':'')+'</tr>';}).join('');
}
function table(list,showAction=true){
 return '<p class="scroll-hint">Swipe table horizontally to view assigned staff, status and actions →</p><div class="table-scroll"><table><thead><tr><th>REFERENCE</th><th>SUBJECT / TYPE</th><th>PRIORITY</th><th>ASSIGNED TO</th><th>DUE</th><th>STATUS</th>'+(showAction?'<th>ACTION</th>':'')+'</tr></thead><tbody id="caseRows">'+tableRows(list,showAction)+'</tbody></table></div>';
}
function matches(c){return !query||[c.id,c.subject,c.summary,c.owner,c.status,c.sourceRef].join(' ').toLowerCase().includes(query.toLowerCase());}
function filtered(type=null){return cases.filter(c=>(!type||c.kind===type)&&matches(c)&&(filter==='All'||c.status===filter||c.priority===filter));}
function activityFeed(limit=7){
 const all=cases.flatMap(c=>c.history.map(h=>({...h,caseId:c.id}))).reverse().slice(0,limit);
 return '<ol class="activity">'+all.map(e=>'<li><span class="activity-dot"></span><div><strong>'+safe(e.what)+'</strong><p>'+safe(e.caseId)+' · '+safe(e.by)+'</p><small>'+safe(e.at)+' · '+safe(e.reference)+'</small></div></li>').join('')+'</ol>';
}
function dashboard(){
 const m=metrics(cases);
 const list=cases.filter(c=>c.status!==FINAL[c.kind]);
 return header('SECRETARIAT / DAILY OPERATIONS','Rectory office workdesk','Process paperwork, verify documents, resolve handoffs and keep every action traceable.',btnNew())+
 '<div class="kpis">'+cardKpi('Open office cases',m.open,'Still require staff action','▤')+cardKpi('Certificates ready for release',m.ready,'Certificates awaiting collection','▣')+cardKpi('Aging cases',m.overdue,'Past the target date','◷')+cardKpi('Active next steps',m.next,'Assigned across desk roles','↗')+'</div>'+
 '<div class="desk-grid"><section class="panel"><div class="panel-head"><div><span class="eyebrow">PRIORITY WORKLIST</span><h2>What needs processing?</h2><p>Open any case for next action and its custody history.</p></div><button class="text-action" data-nav="inbox">Full inbox ↗</button></div>'+table(list)+'</section>'+
 '<aside class="side-stack"><section class="panel pad"><span class="eyebrow">TODAY AT THE OFFICE</span><h2>Upcoming appointments</h2><div class="small-agenda"><div><b>09:00</b><span>Certificate verification<br><small>Records desk · Fictional</small></span></div><div><b>11:30</b><span>Marriage file interview<br><small>Office room · Fictional</small></span></div><div><b>15:00</b><span>Chapel coordination<br><small>Admin desk · Fictional</small></span></div></div><button class="text-action" data-nav="scheduling">Open schedule ↗</button></section><section class="panel pad"><span class="eyebrow">RECENT DOCUMENT ACTIONS</span><h2>Chain of custody</h2>'+activityFeed(3)+'<button class="text-action" data-nav="audit">Full audit view ↗</button></section></aside></div>'+
 '<div class="quick-links"><button data-nav="certificates"><strong>Certificates & records</strong><span>Verify sources and release logs ↗</span></button><button data-nav="correspondence"><strong>Correspondence</strong><span>Classify, route, dispatch and archive ↗</span></button><button data-nav="marriage"><strong>Marriage cases</strong><span>Requirements and follow-up ↗</span></button></div>';
}
function queue(view){
 const type=view==='certificates'?'certificate':view==='correspondence'?'correspondence':view==='marriage'?'marriage':null;
 const label=view==='certificates'?'Certificates & source records':view==='correspondence'?'Correspondence custody':view==='marriage'?'Marriage preparation cases':view==='requests'?'Service request register':'Office inbox';
 const sub=view==='certificates'?'Review register references, verify annotations and prepare certificate requests for release.':view==='correspondence'?'From receiving number to dispatched response and archived file.':view==='marriage'?'Manage requirements, interviews, approvals and ceremony preparations in one case file.':view==='requests'?'Register requests, monitor progress and coordinate follow-up with parishioners.':'Search, prioritize and open the next clerical action.';
 let note='';
 if(view==='certificates')note='<div class="info-strip"><strong>Register provenance:</strong> Certificate request CERT-0142 points to BAPT / VOL-02 / P.18 / 004. Verification is simulated; original registers remain authoritative.</div>';
 if(view==='marriage')note='<div class="info-strip"><strong>Separate obligations:</strong> Booking is not a ceremony. Civil filing and baptismal-parish annotations remain independently incomplete.</div>';
 return header('RECTORY OFFICE / '+view.toUpperCase(),safe(label),sub,btnNew())+
 '<section class="panel"><div class="panel-head"><div><span class="eyebrow">FILTERABLE WORK QUEUE</span><h2>'+safe(label)+'</h2></div><label class="filter-box">Status / priority<select id="queueFilter"><option value="All">All cases</option><option>High</option><option>Normal</option><option>Received</option><option>Missing requirements</option><option>Awaiting approval</option><option>Archived</option></select></label></div><div class="queue-note">Use the top search or open a reference to see document evidence, ownership, next action and history.</div>'+table(filtered(type))+'</section>'+note;
}
function formField(name,item){
 const f=FIELDS[name];if(!f)return '';
 const caption=safe(f.label);
 if(f.type==='checkbox')return '<label class="check-row"><input type="checkbox" name="'+name+'" value="true" required><span>'+caption+'</span></label>';
 if(f.type==='select')return '<label class="form-field">'+caption+'<select name="'+name+'" required><option value="">Choose…</option>'+f.options.map(x=>'<option>'+safe(x)+'</option>').join('')+'</select></label>';
 if(f.type==='textarea')return '<label class="form-field">'+caption+'<textarea name="'+name+'" rows="3" maxlength="300" required placeholder="'+safe(f.placeholder||'')+'"></textarea></label>';
 const value=name==='sourceRef'?item.sourceRef:name==='dueDate'?item.due:'';
 return '<label class="form-field">'+caption+'<input type="'+(f.type==='date'?'date':'text')+'" name="'+name+'" required maxlength="90" value="'+safe(value)+'" placeholder="'+safe(f.placeholder||'')+'"></label>';
}
function timeline(item){
 return '<ol class="timeline">'+item.history.slice().reverse().map((e,i)=>'<li><span class="timeline-marker"></span><div class="timeline-heading"><strong>'+safe(e.what)+'</strong><small>'+safe(e.at)+'</small></div><p>'+safe(e.note)+'</p><dl><div><dt>Actor</dt><dd>'+safe(e.by)+'</dd></div><div><dt>Reference</dt><dd>'+safe(e.reference)+'</dd></div>'+(e.from?'<div><dt>Transition</dt><dd>'+safe(e.from)+' → '+safe(e.to)+'</dd></div>':'')+'</dl></li>').join('')+'</ol>';
}
function caseDetail(){
 const c=caseById(selectedId);if(!c)return header('NOT FOUND','No case selected','Return to the office inbox.','<button data-nav="inbox" class="button outline">Office inbox</button>');
 const next=nextStep(c),permitted=allowed(c,role);
 const steps=WORKFLOWS[c.kind];
 const checklist=c.kind==='marriage'?'<div class="panel pad"><span class="eyebrow">REQUIREMENT CHECKLIST</span><h2>Documents and proof</h2><p class="subtle">Check each document received before the office review. Final ecclesiastical approvals remain separate.</p>'+c.documents.map(d=>'<label class="check-row doc-check"><input type="checkbox" data-doc="'+safe(d)+'" '+((c.verifiedDocs||[]).includes(d)?'checked ':'')+(c.step>1||role==='priest'||role==='finance'?'disabled ':'')+'><span>'+safe(d)+'</span></label>').join('')+'</div>':
 '<div class="panel pad"><span class="eyebrow">FILE / DOCUMENT REFERENCES</span><h2>Source and supporting files</h2><p class="subtle">Review the source reference and supporting documents associated with this case.</p><div class="source-ref">'+safe(c.sourceRef)+'</div>'+c.documents.map(d=>'<div class="doc-row"><span aria-hidden="true">▧</span> '+safe(d)+' <small>SAMPLE</small></div>').join('')+'</div>';
 const meta=c.kind==='marriage'?'<div class="note-box"><strong>Unfulfilled post-ceremony duties</strong><p>Ceremony held: No · Civil filing: No · Baptismal parish notified: No. These never auto-complete when a booking is confirmed.</p></div>':
 c.kind==='certificate'?'<div class="note-box"><strong>Canonical custody boundary</strong><p>Volume, page, entry and annotations must be checked by authorized staff. Official signing and sealing are outside this preview.</p></div>':
 '<div class="note-box"><strong>Reference chain</strong><p>Incoming reference '+safe(c.sourceRef)+'; dispatch and archive references are independently recorded in the case history.</p></div>';
 let actionHtml=next?'<section class="panel pad action-panel"><span class="eyebrow">NEXT CONTROLLED ACTION</span><h2>'+safe(next.title)+'</h2><p class="subtle">Case status: '+safe(c.status)+' · Action history is recorded for this session.</p>'+(!permitted?'<div class="warn-strip">Select the responsible staff role to complete this step. Role selection is for preview purposes only.</div>':
 '<form id="actionForm" data-case="'+safe(c.id)+'" data-action="'+safe(next.action)+'"><div class="fields">'+next.fields.map(f=>formField(f,c)).join('')+'</div><button type="submit" class="button primary">Record action & update history →</button></form>')+'</section>':
 '<section class="panel pad"><span class="eyebrow">CASE WORKFLOW COMPLETE</span><h2>'+safe(c.status)+'</h2><p>All steps in this workflow have been recorded. Review the activity history below.</p></section>';
 return '<div class="case-back"><button class="text-action" data-nav="inbox">← Back to office inbox</button></div>'+
 '<div class="case-heading"><div><span class="eyebrow">'+safe(TYPES[c.kind]).toUpperCase()+' / '+safe(c.id)+'</span><h1>'+safe(c.subject)+'</h1><p>'+safe(c.summary)+'</p></div><div>'+pill(c.status)+'</div></div>'+
 '<div class="case-stats"><div><span>Assigned owner</span><strong>'+safe(c.owner)+'</strong></div><div><span>Due date</span><strong>'+safe(c.due)+'</strong></div><div><span>Priority</span><strong>'+safe(c.priority)+'</strong></div><div><span>Next action</span><strong>'+safe(next?next.title:'Workflow complete')+'</strong></div></div>'+
 '<div class="case-layout"><div class="case-left">'+actionHtml+checklist+meta+
 (c.kind==='certificate'?'<button type="button" class="button outline" data-preview="'+safe(c.id)+'">Preview certificate layout ↗</button>':'')+
 '</div><aside class="panel history-panel"><div class="panel-head"><div><span class="eyebrow">AUDIT TRAIL / CUSTODY</span><h2>Document & case history</h2><p>Each activity includes the responsible staff member, timestamp and reference.</p></div></div>'+timeline(c)+'</aside></div>';
}
function simpleModule(view){
 if(view==='audit')return header('TRACEABILITY / AUDIT','Office activity & audit','Review case activity, status changes and document-handling history.')+
 '<section class="panel pad"><span class="eyebrow">LATEST CHAIN-OF-CUSTODY EVENTS</span><h2>Chronological office actions</h2>'+activityFeed(50)+'</section>';
 if(view==='archive')return header('RECORDS / ARCHIVE','Document archive','Find case references, related files and the recorded custody history.')+
 '<div class="module-cards">'+cases.map(c=>'<button type="button" class="module-card" data-open="'+safe(c.id)+'"><span class="eyebrow">'+safe(c.id)+'</span><strong>'+safe(c.subject)+'</strong><span>'+safe(c.sourceRef)+'</span><small>'+c.history.length+' custody events · View ↗</small></button>').join('')+'</div><div class="info-strip">Source-register corrections require a separate authorized records procedure.</div>';
 if(view==='scheduling')return header('COORDINATION / OFFICE','Scheduling & appointments','Office calendar for document appointments, ceremonies and assigned personnel.')+
 '<section class="panel"><div class="panel-head"><div><span class="eyebrow">ILLUSTRATIVE WEEK</span><h2>Clerk-managed calendar</h2><p>Appointments and assignments shown here are part of this illustrative schedule.</p></div></div><div class="agenda-list">'+[['16 Nov · 09:00','Certificate verification','Records desk','Records officer'],['17 Nov · 11:30','Marriage interview','Parish office','Parish secretary'],['19 Nov · 15:00','Chapel meeting','Pastoral hall','Office administrator'],['21 Nov · 10:00','First Communion','Main church','Fr. Mateo Cruz']].map(x=>'<div class="agenda-entry"><strong>'+x[0]+'</strong><div><b>'+x[1]+'</b><small>'+x[2]+' · '+x[3]+'</small></div>'+pill('Demo only')+'</div>').join('')+'</div></section>';
 if(view==='finance')return header('ADMINISTRATION / ACCOUNTABILITY','Finance & receipts','Illustrative stewardship summary, not a point-of-sale or accounting system.')+
 '<div class="kpis">'+cardKpi('General donations','₱8,250','General parish funds','₱')+cardKpi('Restricted project fund','₱12,000','Roof repair donations only','▣')+cardKpi('Office expenses','₱3,140','Expenses under review','▤')+cardKpi('Mass obligations','2','Not equal to payments received','✣')+'</div><section class="panel pad"><span class="eyebrow">FINANCIAL CUSTODY</span><h2>Separate classifications</h2><p>Donations, offerings, restricted project funds and actual business transactions have different obligations. Separate fund restrictions, vouchers and approvals are tracked by category.</p><div class="finance-rows">'+[['DON-003','General donation','Unrestricted','₱5,000'],['DON-004','Roof restoration','Restricted','₱12,000'],['EXP-009','Office supplies','Voucher pending review','₱1,450']].map(x=>'<div><strong>'+x[0]+'</strong><span>'+x[1]+'</span><small>'+x[2]+'</small><b>'+x[3]+'</b></div>').join('')+'</div></section>';
 if(view==='intentions')return header('SECONDARY / LITURGICAL OBLIGATIONS','Mass intentions','An offering is not proof of celebration; fulfillment needs a separate recorded event.')+
 '<section class="panel pad"><span class="eyebrow">INTENTION REGISTER</span><h2>Intentions</h2><div class="finance-rows">'+[['INT-011','Thanksgiving for a family','Requested','Offering separate'],['INT-012','For the departed','Assigned','Unfulfilled'],['INT-013','Special petition','Celebrated (sample)','Fulfillment noted']].map(x=>'<div><strong>'+x[0]+'</strong><span>'+x[1]+'</span><small>'+x[2]+'</small><b>'+x[3]+'</b></div>').join('')+'</div></section>';
 return header('SECONDARY / PRIEST','Priest approvals & assignments','Priest-facing functions support office workflow, rather than replacing it.')+
 '<section class="panel pad"><span class="eyebrow">APPROVAL PREVIEW</span><h2>Clergy coordination</h2><p>Priests can review upcoming assignments and decisions routed by the parish office.</p><div class="agenda-list">'+[['16 Nov · 07:00','Morning Mass','Main church','Fr. Mateo Cruz'],['17 Nov · 11:30','Marriage interview','Office room','Fr. Mateo Cruz'],['19 Nov · 14:30','Chapel blessing','Barangay chapel','Fr. Gabriel Santos']].map(x=>'<div class="agenda-entry"><strong>'+x[0]+'</strong><div><b>'+x[1]+'</b><small>'+x[2]+' · '+x[3]+'</small></div>'+pill('Demo')+'</div>').join('')+'</div></section>';
}
function render(){
 nav();$('#crumb').textContent=titleOf(route);document.title=titleOf(route)+' | ParishOS';
 $('#content').innerHTML=route==='workdesk'?renderDesk(showcase,cases):route==='case'?caseDetail():['inbox','requests','certificates','correspondence','marriage'].includes(route)?queue(route):isShowcaseRoute(route)?renderShowcase(route,showcase,cases,role):simpleModule(route);
 const f=$('#queueFilter');if(f)f.value=filter;
}
function showModal(id){lastFocus=document.activeElement;$('#'+id).showModal();const input=$('#'+id).querySelector('input:not([type="hidden"]),select,button');if(input)input.focus();}
function hideModal(dialog){dialog.close();if(lastFocus&&lastFocus.focus)lastFocus.focus();}
function preview(id){
 const c=caseById(id);if(!c||c.kind!=='certificate')return;
 $('#printContent').innerHTML='<div class="print-sheet"><div class="invalid-watermark">SAMPLE · INVALID</div><span class="eyebrow">PARISHOS / CERTIFICATE CENTER</span><h2 id="printTitle">Certificate preview</h2><p><strong>Subject:</strong> '+safe(c.subject)+'</p><p><strong>Record source:</strong> '+safe(c.sourceRef)+'</p><p><strong>Case reference:</strong> '+safe(c.id)+'</p><p><strong>Status:</strong> '+safe(c.status)+'</p><div class="paper-notice">NO OFFICIAL SEAL · NO SIGNATURE · NOT VALID FOR ANY CIVIL OR ECCLESIASTICAL PURPOSE</div></div>';
 showModal('printDialog');
}
function addNew(kind,subject,stayOnPortal=false){
 const base=seedCases().find(x=>x.kind===kind),copy=JSON.parse(JSON.stringify(base));
 if(!copy)return;
 const num=cases.length+1;copy.id=(kind==='certificate'?'CERT':kind==='marriage'?'MAR':'COR')+'-D'+String(num).padStart(3,'0');
 copy.subject=subject;copy.received='2026-11-13';copy.sourceRef='SYNTHETIC / NO SOURCE ENTRY';
 copy.history=[{id:copy.id+'-1',what:'Request registered',at:now(),by:ROLE_NAMES[role],reference:copy.id,note:'Request added to the preview queue.',from:'',to:''}];
 cases.unshift(copy);if(stayOnPortal){setPortalRef(showcase,copy.id);render();}else{go('case',copy.id);}notice(copy.id+' created temporarily. Reload to reset.');return copy.id;
}
document.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;
 if(b.dataset.nav){go(b.dataset.nav);return;}
 if(b.dataset.open){go('case',b.dataset.open);return;}
 if(b.dataset.new!==undefined){showModal('newCaseDialog');return;}
 if(b.dataset.preview){preview(b.dataset.preview);return;}
 if(b.dataset.closeDialog!==undefined){hideModal(b.closest('dialog'));return;}
 if(Object.keys(b.dataset).some(k=>k.startsWith('sys'))){
  if(b.dataset.sysReset!==undefined)cases=seedCases();
  const result=onShowcaseClick(b,showcase,role);
  if(!result)return;
  if(result.closeModal){hideModal(b.closest('dialog'));return;}
  if(result.openModal){showModal(result.openModal);return;}
  if(result.portalService){
   const s=$('#publicService');if(s)s.value=result.portalService;
   $('#publicRequestForm')?.scrollIntoView({behavior:'smooth',block:'start'});return;
  }
  if(result.printHtml){
   $('#printContent').innerHTML=result.printHtml;showModal('printDialog');return;
  }
  if(result.refresh)render();
  if(result.message)notice(result.message);
 }
});
document.addEventListener('submit',e=>{
 if(e.target.id==='publicForm'||e.target.id==='systemNewForm'){
   e.preventDefault();
   const result=onShowcaseSubmit(e.target,showcase,role);
   if(!result)return;
   if(result.portalCase){addNew(result.portalCase.kind,result.portalCase.subject,true);return;}
   if(result.closeModal){hideModal(e.target.closest('dialog'));}
   if(result.refresh)render();
   if(result.message)notice(result.message);
   return;
 }
 if(e.target.id==='newCaseForm'){
  e.preventDefault();const data=new FormData(e.target),subject=String(data.get('subject')||'').trim();if(!subject)return;
  const kind=String(data.get('kind'));hideModal($('#newCaseDialog'));e.target.reset();addNew(kind,subject);return;
 }
 if(e.target.id==='actionForm'){
  e.preventDefault();const c=caseById(selectedId);if(!c)return;
  const data=new FormData(e.target),payload={};
  for(const field of nextStep(c).fields)payload[field]=FIELDS[field].type==='checkbox'?data.has(field):String(data.get(field)||'').trim();
  const done=advance(c,e.target.dataset.action,payload,role,now());
  if(!done.ok){notice(done.error);return;}
  cases=cases.map(x=>x.id===c.id?done.item:x);render();notice(c.id+' updated. Activity added to the case history.');
 }
});
document.addEventListener('change',e=>{
 if(e.target.dataset.sysCheck!==undefined){
   const result=onShowcaseClick(e.target,showcase,role);
   if(result?.refresh)render();if(result?.message)notice(result.message);return;
 }
 if(e.target.dataset.sysFilter!==undefined){
   updateShowcaseFilter(showcase,e.target.dataset.sysFilter,e.target.value);
   const list=$('#sysResults');if(list)list.innerHTML=renderShowcaseTable(showcase,e.target.dataset.sysFilter);
   return;
 }
 if(e.target.dataset.sysPortalSearch!==undefined){
   updatePortalSearch(showcase,e.target.value);render();return;
 }
 if(e.target.id==='roleSelect'){role=e.target.value;render();notice('Viewing the '+ROLE_NAMES[role]+' workspace.');}
 if(e.target.id==='queueFilter'){filter=e.target.value;const type=route==='certificates'?'certificate':route==='correspondence'?'correspondence':route==='marriage'?'marriage':null;$('#caseRows').innerHTML=tableRows(filtered(type));}
 if(e.target.dataset.doc){
  const c=caseById(selectedId);if(!c)return;
  const update=toggleDocument(c,e.target.dataset.doc);
  if(!update.ok){notice(update.error);render();return;}
  cases=cases.map(x=>x.id===c.id?update.item:x);
  render();notice('Document checklist updated.');
 }
});
document.addEventListener('input',e=>{
 if(e.target.dataset.sysSearch!==undefined){
   updateShowcaseSearch(showcase,e.target.dataset.sysSearch,e.target.value);
   const list=$('#sysResults');if(list)list.innerHTML=renderShowcaseTable(showcase,e.target.dataset.sysSearch);
 }
});
$('#topSearch').addEventListener('input',e=>{
 query=e.target.value;
 if(!['inbox','requests','certificates','correspondence','marriage'].includes(route)){route='inbox';render();}
 else{const type=route==='certificates'?'certificate':route==='correspondence'?'correspondence':route==='marriage'?'marriage':null;$('#caseRows').innerHTML=tableRows(filtered(type));}
});
$('#openMenu').addEventListener('click',openMenu);
$('#closeMenu').addEventListener('click',closeMenu);
$('#backdrop').addEventListener('click',closeMenu);
$('#printButton').addEventListener('click',()=>window.print());
document.addEventListener('keydown',e=>{
 if(e.key==='Escape')closeMenu();
 if(e.key==='/'&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)&&!document.querySelector('dialog[open]')){e.preventDefault();$('#topSearch').focus();}
});
for(const dialog of document.querySelectorAll('dialog'))dialog.addEventListener('click',e=>{if(e.target===dialog)hideModal(dialog);});
$('#roleSelect').innerHTML=Object.entries(ROLE_NAMES).map(([id,name])=>'<option value="'+safe(id)+'">'+safe(name)+'</option>').join('');
$('#roleSelect').value=role;
render();
