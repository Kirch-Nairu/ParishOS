import {seedCases,advance,nextStep,allowed,toggleDocument,metrics,ROLE_NAMES,FINAL,WORKFLOWS} from './workflow.mjs';

const SECTIONS=[
 {group:'OPERATIONS',items:[['workdesk','Workdesk','▦'],['inbox','Office inbox','▤'],['requests','Service requests','▥'],['certificates','Certificates & records','▣'],['correspondence','Correspondence','✉'],['marriage','Marriage cases','◇'],['scheduling','Scheduling','▦'],['archive','Document archive','▧'],['finance','Finance & receipts','₱'],['audit','Activity & audit','◷']]},
 {group:'SECONDARY',items:[['intentions','Mass intentions','✣'],['priest','Priest approvals','✦']]}
];
const TYPES={certificate:'Certificate',correspondence:'Correspondence',marriage:'Marriage file'};
const FIELDS={
 identityChecked:{label:'I inspected the requester ID or valid representative authorization (simulation)',type:'checkbox'},
 sourceRef:{label:'Source register volume / page / entry',type:'text'},
 annotationChecked:{label:'I inspected applicable annotations and restrictions (simulation)',type:'checkbox'},
 draftRef:{label:'Fictional document draft reference',type:'text',placeholder:'SAMPLE-CERT-0142'},
 reviewer:{label:'Routing target',type:'select',options:['Parish administrator','Parish priest (simulated queue)']},
 approvalAttested:{label:'Authorized approval was simulated; no official signing occurred',type:'checkbox'},
 recipientChecked:{label:'Recipient identity and release were simulated',type:'checkbox'},
 classification:{label:'Classification',type:'select',options:['Facilities','Pastoral','Administration','Diocesan correspondence']},
 owner:{label:'Responsible office staff',type:'select',options:['Office clerk','Parish secretary','Records officer','Office administrator']},
 dueDate:{label:'Assigned due date',type:'date'},
 actionNote:{label:'Action / response summary',type:'textarea',placeholder:'Describe the fictional action taken'},
 outgoingRef:{label:'Outgoing correspondence reference',type:'text',placeholder:'OUT-2026-0074'},
 archiveRef:{label:'Archive location / file reference',type:'text',placeholder:'ARC-2026-0074'},
 followupNote:{label:'Follow-up instruction for missing documents',type:'textarea',placeholder:'Specify fictional requirements to supply'},
 docsVerified:{label:'I confirmed every individual item in the checklist above',type:'checkbox'},
 interviewAttested:{label:'Canonical interview completion recorded in this simulation',type:'checkbox'},
 seminarAttested:{label:'Preparation seminar evidence reviewed in this simulation',type:'checkbox'},
 bannsAttested:{label:'Marriage banns requirement reviewed in this simulation',type:'checkbox'},
 reviewAttested:{label:'Office review simulated; no canonical determination made',type:'checkbox'},
 bookingDate:{label:'Fictional ceremony date',type:'date'},
 assignedPriest:{label:'Assigned celebrant (fictional)',type:'select',options:['Sample Priest A','Sample Priest B']},
 conflictChecked:{label:'I checked the sample calendar for conflicts',type:'checkbox'}
};
const $=s=>document.querySelector(s);
const safe=x=>String(x??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
let cases=seedCases(),role='administrator',route='workdesk',selectedId=null,query='',filter='All',toastTimer=null,lastFocus=null;
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
 if(!list.length)return '<tr><td colspan="'+(showAction?7:6)+'" class="empty-state">No fictional cases match. Adjust the search or filter.</td></tr>';
 return list.map(c=>{const next=nextStep(c);return '<tr><td><button type="button" class="ref-button" data-open="'+safe(c.id)+'">'+safe(c.id)+'</button><span class="muted mini">'+safe(TYPES[c.kind])+'</span></td><td><strong>'+safe(c.subject)+'</strong><span class="muted mini">'+safe(c.summary)+'</span></td><td>'+pill(c.priority)+'</td><td>'+safe(c.owner)+'</td><td class="nowrap">'+displayDate(c.due)+'</td><td>'+pill(c.status)+'</td>'+(showAction?'<td><button type="button" class="button tiny outline" data-open="'+safe(c.id)+'">'+(next?'Process':'Inspect')+' <span aria-hidden="true">↗</span></button></td>':'')+'</tr>';}).join('');
}
function table(list,showAction=true){
 return '<div class="table-scroll"><table><thead><tr><th>REFERENCE</th><th>SUBJECT / TYPE</th><th>PRIORITY</th><th>ASSIGNED TO</th><th>DUE</th><th>STATUS</th>'+(showAction?'<th>ACTION</th>':'')+'</tr></thead><tbody id="caseRows">'+tableRows(list,showAction)+'</tbody></table></div>';
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
 '<div class="kpis">'+cardKpi('Open office cases',m.open,'Still require staff action','▤')+cardKpi('Certificates in custody',m.pending,'Verification / approval / release','▣')+cardKpi('Aging cases',m.overdue,'Synthetic due-date check','◷')+cardKpi('Active next steps',m.next,'Assigned across desk roles','↗')+'</div>'+
 '<div class="desk-grid"><section class="panel"><div class="panel-head"><div><span class="eyebrow">PRIORITY WORKLIST</span><h2>What needs processing?</h2><p>Open any case for next action and its custody history.</p></div><button class="text-action" data-nav="inbox">Full inbox ↗</button></div>'+table(list)+'</section>'+
 '<aside class="side-stack"><section class="panel pad"><span class="eyebrow">TODAY AT THE OFFICE</span><h2>Upcoming appointments</h2><div class="small-agenda"><div><b>09:00</b><span>Certificate verification<br><small>Records desk · Fictional</small></span></div><div><b>11:30</b><span>Marriage file interview<br><small>Office room · Fictional</small></span></div><div><b>15:00</b><span>Chapel coordination<br><small>Admin desk · Fictional</small></span></div></div><button class="text-action" data-nav="scheduling">Open schedule ↗</button></section><section class="panel pad"><span class="eyebrow">RECENT DOCUMENT ACTIONS</span><h2>Chain of custody</h2>'+activityFeed(3)+'<button class="text-action" data-nav="audit">Full audit view ↗</button></section></aside></div>'+
 '<div class="quick-links"><button data-nav="certificates"><strong>Certificates & records</strong><span>Verify sources and release logs ↗</span></button><button data-nav="correspondence"><strong>Correspondence</strong><span>Classify, route, dispatch and archive ↗</span></button><button data-nav="marriage"><strong>Marriage cases</strong><span>Requirements and follow-up ↗</span></button></div>';
}
function queue(view){
 const type=view==='certificates'?'certificate':view==='correspondence'?'correspondence':view==='marriage'?'marriage':null;
 const label=view==='certificates'?'Certificates & source records':view==='correspondence'?'Correspondence custody':view==='marriage'?'Marriage preparation cases':view==='requests'?'Service request register':'Office inbox';
 const sub=view==='certificates'?'Indexed references are samples; no canonical register can be edited.':view==='correspondence'?'From receiving number to dispatched response and archived file.':view==='marriage'?'Track missing requirements without pretending a wedding is complete.':view==='requests'?'Front-desk intake and status tracking for fictional cases.':'Search, prioritize and open the next clerical action.';
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
 const checklist=c.kind==='marriage'?'<div class="panel pad"><span class="eyebrow">REQUIREMENT CHECKLIST</span><h2>Documents and proof</h2><p class="subtle">Use only fictional checkbox confirmations. Checking a document does not constitute diocesan approval.</p>'+c.documents.map(d=>'<label class="check-row doc-check"><input type="checkbox" data-doc="'+safe(d)+'" '+((c.verifiedDocs||[]).includes(d)?'checked ':'')+(c.step>1||role==='priest'||role==='finance'?'disabled ':'')+'><span>'+safe(d)+'</span></label>').join('')+'</div>':
 '<div class="panel pad"><span class="eyebrow">FILE / DOCUMENT REFERENCES</span><h2>Source and supporting files</h2><p class="subtle">Sources are fictional. Historical edits are not available.</p><div class="source-ref">'+safe(c.sourceRef)+'</div>'+c.documents.map(d=>'<div class="doc-row"><span aria-hidden="true">▧</span> '+safe(d)+' <small>SAMPLE</small></div>').join('')+'</div>';
 const meta=c.kind==='marriage'?'<div class="note-box"><strong>Unfulfilled post-ceremony duties</strong><p>Ceremony held: No · Civil filing: No · Baptismal parish notified: No. These never auto-complete when a booking is confirmed.</p></div>':
 c.kind==='certificate'?'<div class="note-box"><strong>Canonical custody boundary</strong><p>Volume, page, entry and annotations must be checked by authorized staff. This demo cannot issue or sign a sacramental certificate.</p></div>':
 '<div class="note-box"><strong>Reference chain</strong><p>Incoming reference '+safe(c.sourceRef)+'; dispatch and archive references are independently recorded in the case history.</p></div>';
 let actionHtml=next?'<section class="panel pad action-panel"><span class="eyebrow">NEXT CONTROLLED ACTION</span><h2>'+safe(next.title)+'</h2><p class="subtle">Current stage: '+safe(c.status)+' · Role-aware UI demonstration only.</p>'+(!permitted?'<div class="warn-strip">This step is assigned to another demo role. Switch to an authorized office role to continue. This is not real access control.</div>':
 '<form id="actionForm" data-case="'+safe(c.id)+'" data-action="'+safe(next.action)+'"><div class="fields">'+next.fields.map(f=>formField(f,c)).join('')+'</div><button type="submit" class="button primary">Record action & update history →</button></form>')+'</section>':
 '<section class="panel pad"><span class="eyebrow">SIMULATED WORKFLOW COMPLETE</span><h2>'+safe(c.status)+'</h2><p>No further transitions are enabled for this sample case. All history remains inspectable.</p></section>';
 return '<div class="case-back"><button class="text-action" data-nav="inbox">← Back to office inbox</button></div>'+
 '<div class="case-heading"><div><span class="eyebrow">'+safe(TYPES[c.kind]).toUpperCase()+' / '+safe(c.id)+'</span><h1>'+safe(c.subject)+'</h1><p>'+safe(c.summary)+'</p></div><div>'+pill(c.status)+'</div></div>'+
 '<div class="case-stats"><div><span>Assigned owner</span><strong>'+safe(c.owner)+'</strong></div><div><span>Due date</span><strong>'+safe(c.due)+'</strong></div><div><span>Priority</span><strong>'+safe(c.priority)+'</strong></div><div><span>Next action</span><strong>'+safe(next?next.title:'Workflow complete')+'</strong></div></div>'+
 '<div class="case-layout"><div class="case-left">'+actionHtml+checklist+meta+
 (c.kind==='certificate'?'<button type="button" class="button outline" data-preview="'+safe(c.id)+'">Preview INVALID sample certificate ↗</button>':'')+
 '</div><aside class="panel history-panel"><div class="panel-head"><div><span class="eyebrow">AUDIT TRAIL / CUSTODY</span><h2>Document & case history</h2><p>Every simulated transition records actor, time and reference.</p></div></div>'+timeline(c)+'</aside></div>';
}
function simpleModule(view){
 if(view==='audit')return header('TRACEABILITY / AUDIT','Office activity & audit','All simulated case transitions remain visible until the page is reloaded.')+
 '<section class="panel pad"><span class="eyebrow">LATEST CHAIN-OF-CUSTODY EVENTS</span><h2>Chronological office actions</h2>'+activityFeed(50)+'</section>';
 if(view==='archive')return header('RECORDS / ARCHIVE','Document archive','Search historical source references and inspect complete fictional custody trails.')+
 '<div class="module-cards">'+cases.map(c=>'<button type="button" class="module-card" data-open="'+safe(c.id)+'"><span class="eyebrow">'+safe(c.id)+'</span><strong>'+safe(c.subject)+'</strong><span>'+safe(c.sourceRef)+'</span><small>'+c.history.length+' custody events · View ↗</small></button>').join('')+'</div><div class="info-strip">Correction of source registers is intentionally unavailable. The demo records administrative events only.</div>';
 if(view==='scheduling')return header('COORDINATION / OFFICE','Scheduling & appointments','Office calendar for document appointments, ceremonies and assigned personnel.')+
 '<section class="panel"><div class="panel-head"><div><span class="eyebrow">ILLUSTRATIVE WEEK</span><h2>Clerk-managed calendar</h2><p>Dates and people are samples, not real confirmed parish bookings.</p></div></div><div class="agenda-list">'+[['16 Nov · 09:00','Certificate verification','Records desk','Records officer'],['17 Nov · 11:30','Marriage interview','Parish office','Parish secretary'],['19 Nov · 15:00','Chapel meeting','Pastoral hall','Office administrator'],['21 Nov · 10:00','First Communion','Main church','Sample Priest A']].map(x=>'<div class="agenda-entry"><strong>'+x[0]+'</strong><div><b>'+x[1]+'</b><small>'+x[2]+' · '+x[3]+'</small></div>'+pill('Demo only')+'</div>').join('')+'</div></section>';
 if(view==='finance')return header('ADMINISTRATION / ACCOUNTABILITY','Finance & receipts','Illustrative stewardship summary, not a point-of-sale or accounting system.')+
 '<div class="kpis">'+cardKpi('General donations','₱8,250','Fictional unrestricted examples','₱')+cardKpi('Restricted project fund','₱12,000','Roof repair donations only','▣')+cardKpi('Office expenses','₱3,140','Illustrative vouchers','▤')+cardKpi('Mass obligations','2','Not equal to payments received','✣')+'</div><section class="panel pad"><span class="eyebrow">FINANCIAL CUSTODY</span><h2>Separate classifications</h2><p>Donations, offerings, restricted project funds and actual business transactions have different obligations. These are static examples only.</p><div class="finance-rows">'+[['DON-003','General donation','Unrestricted','₱5,000'],['DON-004','Roof restoration','Restricted','₱12,000'],['EXP-009','Office supplies','Voucher pending review','₱1,450']].map(x=>'<div><strong>'+x[0]+'</strong><span>'+x[1]+'</span><small>'+x[2]+'</small><b>'+x[3]+'</b></div>').join('')+'</div></section>';
 if(view==='intentions')return header('SECONDARY / LITURGICAL OBLIGATIONS','Mass intentions','An offering is not proof of celebration; fulfillment needs a separate recorded event.')+
 '<section class="panel pad"><span class="eyebrow">ILLUSTRATIVE BOOK</span><h2>Intentions</h2><div class="finance-rows">'+[['INT-011','Thanksgiving for a family','Requested','Offering separate'],['INT-012','For the departed','Assigned','Unfulfilled'],['INT-013','Special petition','Celebrated (sample)','Not an official record']].map(x=>'<div><strong>'+x[0]+'</strong><span>'+x[1]+'</span><small>'+x[2]+'</small><b>'+x[3]+'</b></div>').join('')+'</div></section>';
 return header('SECONDARY / PRIEST','Priest approvals & assignments','Priest-facing functions support office workflow, rather than replacing it.')+
 '<section class="panel pad"><span class="eyebrow">APPROVAL PREVIEW</span><h2>Clergy coordination</h2><p>Priests can review a sample itinerary and see requests routed for their attention. This mockup never grants a real canonical authorization.</p><div class="agenda-list">'+[['16 Nov · 07:00','Morning Mass','Main church','Sample Priest A'],['17 Nov · 11:30','Marriage interview','Office room','Sample Priest A'],['19 Nov · 14:30','Chapel blessing','Barangay chapel','Sample Priest B']].map(x=>'<div class="agenda-entry"><strong>'+x[0]+'</strong><div><b>'+x[1]+'</b><small>'+x[2]+' · '+x[3]+'</small></div>'+pill('Demo')+'</div>').join('')+'</div></section>';
}
function render(){
 nav();$('#crumb').textContent=titleOf(route);document.title=titleOf(route)+' · ParishOS Demo';
 $('#content').innerHTML=route==='workdesk'?dashboard():route==='case'?caseDetail():['inbox','requests','certificates','correspondence','marriage'].includes(route)?queue(route):simpleModule(route);
 const f=$('#queueFilter');if(f)f.value=filter;
}
function showModal(id){lastFocus=document.activeElement;$('#'+id).showModal();const input=$('#'+id).querySelector('input:not([type="hidden"]),select,button');if(input)input.focus();}
function hideModal(dialog){dialog.close();if(lastFocus&&lastFocus.focus)lastFocus.focus();}
function preview(id){
 const c=caseById(id);if(!c||c.kind!=='certificate')return;
 $('#printContent').innerHTML='<div class="print-sheet"><div class="invalid-watermark">SAMPLE · INVALID</div><span class="eyebrow">PARISHOS / INTERNAL SHOWCASE</span><h2 id="printTitle">Fictional certificate preview</h2><p><strong>Subject:</strong> '+safe(c.subject)+'</p><p><strong>Record source:</strong> '+safe(c.sourceRef)+'</p><p><strong>Case reference:</strong> '+safe(c.id)+'</p><p><strong>Status:</strong> '+safe(c.status)+'</p><div class="paper-notice">NO OFFICIAL SEAL · NO SIGNATURE · NOT VALID FOR ANY CIVIL OR ECCLESIASTICAL PURPOSE</div></div>';
 showModal('printDialog');
}
function addNew(kind,subject){
 const base=seedCases().find(x=>x.kind===kind),copy=JSON.parse(JSON.stringify(base));
 if(!copy)return;
 const num=cases.length+1;copy.id=(kind==='certificate'?'CERT':kind==='marriage'?'MAR':'COR')+'-D'+String(num).padStart(3,'0');
 copy.subject=subject;copy.received='2026-11-13';copy.sourceRef='SYNTHETIC / NO SOURCE ENTRY';
 copy.history=[{id:copy.id+'-1',what:'Fictional intake created',at:now(),by:ROLE_NAMES[role],reference:copy.id,note:'No data submitted to a server.',from:'',to:''}];
 cases.unshift(copy);go('case',copy.id);notice(copy.id+' created temporarily. Reload to reset.');
}
document.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;
 if(b.dataset.nav){go(b.dataset.nav);return;}
 if(b.dataset.open){go('case',b.dataset.open);return;}
 if(b.dataset.new!==undefined){showModal('newCaseDialog');return;}
 if(b.dataset.preview){preview(b.dataset.preview);return;}
 if(b.dataset.closeDialog!==undefined){hideModal(b.closest('dialog'));return;}
});
document.addEventListener('submit',e=>{
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
  cases=cases.map(x=>x.id===c.id?done.item:x);render();notice(c.id+' updated · custody event recorded in demo history.');
 }
});
document.addEventListener('change',e=>{
 if(e.target.id==='roleSelect'){role=e.target.value;render();notice('Role switched to '+ROLE_NAMES[role]+'. Permissions are UI-only simulation.');}
 if(e.target.id==='queueFilter'){filter=e.target.value;const type=route==='certificates'?'certificate':route==='correspondence'?'correspondence':route==='marriage'?'marriage':null;$('#caseRows').innerHTML=tableRows(filtered(type));}
 if(e.target.dataset.doc){
  const c=caseById(selectedId);if(!c)return;
  const update=toggleDocument(c,e.target.dataset.doc);
  if(!update.ok){notice(update.error);render();return;}
  cases=cases.map(x=>x.id===c.id?update.item:x);
  render();notice('Checklist updated in memory. Source evidence remains fictional.');
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
