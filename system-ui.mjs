import {CATALOG, INDEX, FLOW_ROLES, createModuleData, transition, nextStatus} from './system-data.mjs';
import {FINAL,nextStep} from './workflow.mjs';

// All actions mutate this in-memory demonstration object only.
export function createShowcaseState(){
 return {records:createModuleData(),selected:{},filters:{},searches:{},checked:{},activeTab:{},portalRef:null,portalSearch:'',priestTab:'day',lastNotice:''};
}
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const color=s=>/assigned|scheduled|pending|requested|review|proposed|counted|draft|logged|inquiry|intake|registration|contacted|planned|new|open|conflict|await|missing/i.test(s)?'amber':/reconciled|complete|celebrated|approved|matched|reserved|confirmed|accepted|closed|published|archived|release|indexed|ordered/i.test(s)?'green':'blue';
const displayStatus=s=>String(s).replace(/\s*\(demo\)/gi,'').replace(/^Demo released$/i,'Released');
const badge=(s,small=false)=>'<span class="sys-badge '+color(s)+' '+(small?'mini':'')+'">'+esc(displayStatus(s))+'</span>';
const moneyValue=s=>{const m=String(s).match(/₱[\d,]+(?:\.\d+)?/);return m?m[0]:'—';};
const icon=(n)=>'<span class="sys-glyph" aria-hidden="true">'+(n||'▤')+'</span>';
const dateStr='FRIDAY · 13 NOV 2026';
const sections=['Rectory office','Sacraments & records','Pastoral & people','Finance & stewardship','Public & outreach','Optional services'];
const DIRECTORY=[
 {id:'workdesk',title:'Parish dashboard',section:'Rectory office',priority:'Essential',icon:'▦'},
 {id:'inbox',title:'Parish secretariat',section:'Rectory office',priority:'Essential',icon:'▤'},
 {id:'certificates',title:'Certificate center',section:'Sacraments & records',priority:'Essential',icon:'▣'},
 {id:'marriage',title:'Wedding management',section:'Sacraments & records',priority:'Essential',icon:'◇'},
 {id:'correspondence',title:'Correspondence',section:'Rectory office',priority:'High',icon:'✉'},
 ...CATALOG.filter(m=>m.id!=='priest')
];

const recordMatches=(r,q)=>([r.id,r.title,r.subtitle,r.status,r.owner,r.date,r.tag,...r.fields.map(x=>x.value)].join(' ').toLowerCase().includes(q.toLowerCase()));
function actionLabel(mod,next){
 if(!next)return 'No further actions';
 if(mod==='registry')return 'Queue annotation review';
 if(mod==='intentions')return next==='Celebrated (demo)'?'Record Mass fulfillment':'Assign celebrant';
 if(mod==='priest_schedule')return 'Accept assignment';
 if(mod==='collections')return next.includes('Deposit')?'Reconcile deposit':'Verify collection count';
 if(mod==='finance')return next.includes('Approved')?'Record approval':'Route expense voucher';
 if(mod==='funerals')return next.includes('Priest')?'Assign on-call priest':'Advance coordination';
 if(mod==='announcements')return next.includes('Published')?'Publish notice':'Schedule sample notice';
 return 'Record next stage: '+next;
}
function hasRole(mod,role,record){
 if(mod==='finance'&&record.status==='For approval')return role==='administrator';
 if(mod==='priest_schedule'&&record.status==='Proposed')return role==='priest';
 if(mod==='registry')return ['records','administrator'].includes(role);
 if(mod==='collections')return ['finance','administrator'].includes(role);
 if(mod==='personnel')return role==='administrator';
 return (FLOW_ROLES[mod]||[]).includes(role);
}
function moduleStats(m,items){
 const current=items.length;
 const active=items.filter(x=>!/published|complete|confirmed|approved|matched|celebrated|indexed|reserved|closed/i.test(x.status)).length;
 const pending=items.filter(x=>/pending|requested|draft|new|logged|inquiry|intake|proposed|registration|planned/i.test(x.status)).length;
 return [
  {title:'Total records',value:String(current).padStart(2,'0'),subtitle:'Records in this register'},
  {title:'In progress',value:String(active).padStart(2,'0'),subtitle:'Outstanding office actions'},
  {title:'Follow-up queue',value:String(pending).padStart(2,'0'),subtitle:'Attention required'},
 ];
}
function caseRow(c){
 const next=nextStep(c);
 return '<button class="sys-inbox-item" type="button" data-open="'+esc(c.id)+'"><span class="sys-ref">'+esc(c.id)+'</span><span class="sys-inbox-content"><strong>'+esc(c.subject)+'</strong><small>'+esc(c.summary)+'</small></span><span class="sys-owner">'+esc(c.owner)+'</span>'+badge(c.status,true)+'<span class="sys-row-arrow">↗</span></button>';
}
const getRecords=(state,mod)=>state.records.filter(r=>r.module===mod);
function filterRecords(state,mod){
 let rows=getRecords(state,mod);
 const q=state.searches[mod]||'';
 if(q)rows=rows.filter(r=>recordMatches(r,q));
 const filt=state.filters[mod]||'All';
 if(filt!=='All')rows=rows.filter(r=>r.status===filt||r.tag===filt);
 return rows;
}
export function renderDesk(state,cases){
 const all=getRecords(state,'priest_schedule');
 const pendingPriest=all.filter(r=>r.status==='Proposed').length;
 const urgent=getRecords(state,'funerals').filter(r=>r.tag==='Urgent'&&r.status!=='Closed (demo)').length;
 const unmatched=getRecords(state,'collections').filter(r=>r.status!=='Deposit matched (demo)').length;
 const open=cases.filter(c=>c.status!==FINAL[c.kind]);
 const ready=cases.filter(c=>c.status==='Ready for release').length;
 const workflowCards=[
  ['certificates','Certificate releases','Resolve identification and source verification','▣'],
  ['correspondence','Letters & correspondence','Assign, respond and archive incoming mail','✉'],
  ['marriage','Marriage file desk','Requirements, interviews and booked ceremonies','◇'],
  ['priest_schedule','Priest duty planning','See conflicts, coverage and availability','◷'],
  ['collections','Collections register','Track counts, funds and deposits','₱'],
  ['public','Parishioner services','View the other side of each request','◎']
 ];
 const recent=cases.flatMap(c=>c.history.map(h=>({...h,id:c.id}))).slice(-6).reverse();
 return '<div class="sys-topline"><span class="sys-live-dot"></span> PARISH OFFICE / OPERATIONS OVERVIEW <span class="sys-date">'+dateStr+'</span></div>'+
 '<section class="sys-desk-hero"><div><div class="sys-eyebrow">ST. GABRIEL · PARISH SECRETARIAT</div><h1>Parish office dashboard<span class="sys-title-dot">.</span></h1><p>Manage requests, documents, appointments and financial records from one workspace.</p><div class="sys-hero-actions"><button class="sys-btn solid" data-new type="button">+ New service request</button><button class="sys-btn light" data-nav="inbox" type="button">View office inbox ↗</button></div></div><div class="sys-hero-panel"><span class="sys-mini-label">WORKLOAD AT A GLANCE</span><div class="sys-operational"><i></i> Open requests <small>Office scenario</small></div><div class="sys-hero-stats"><span>Cases in progress <b>'+String(open.length).padStart(2,'0')+'</b></span><span>Release-ready <b>'+String(ready).padStart(2,'0')+'</b></span><span>Priest responses <b>'+String(pendingPriest).padStart(2,'0')+'</b></span></div><small>Office staff · Records · Finance</small></div></section>'+
 '<div class="sys-kpi-row">'+[
  ['Office cases',open.length,'Active requests / documents','inbox'],
  ['Ready for handover',ready,'Ready for release','certificates'],
  ['Pastoral urgency',urgent,'Urgent sick-call requests','funerals'],
  ['Collection follow-ups',unmatched,'Count / reconciliation pending','collections']
 ].map(([title,val,foot,view],i)=>'<button class="sys-kpi" data-nav="'+view+'"><span class="sys-kpi-visual">'+['▤','▣','✚','₱'][i]+'</span><small>'+title+'</small><b>'+String(val).padStart(2,'0')+'</b><span>'+foot+' <em>↗</em></span></button>').join('')+'</div>'+
 '<div class="sys-desk-split"><section class="sys-panel"><div class="sys-panel-heading"><div><div class="sys-eyebrow">FRONT DESK · CASE QUEUE</div><h2>Work requiring action</h2><p>Open a case to inspect requirements, next step and recorded custody.</p></div><button data-nav="inbox" class="sys-link">View all cases ↗</button></div><div class="sys-inbox-list">'+open.map(caseRow).join('')+'</div><div class="sys-panel-footer"><span>Tip: use / to search office case references</span><span>Activity shown for the selected office scenario</span></div></section>'+
 '<aside class="sys-side-column"><section class="sys-panel sys-urgent"><div class="sys-panel-heading"><div><div class="sys-eyebrow">PASTORAL COORDINATION</div><h2>Priority follow-up</h2></div><span class="sys-urgency">Urgent</span></div><div class="sys-urgent-detail"><span class="sys-red-dot"></span><div><strong>Home sick call · PAS-038</strong><p>Barangay 03 · On-call priest not assigned</p><button class="sys-link" data-nav="funerals">Open dispatch queue ↗</button></div></div></section><section class="sys-panel sys-next"><div class="sys-panel-heading"><div><div class="sys-eyebrow">COMING UP</div><h2>Today’s office agenda</h2></div><button class="sys-link" data-nav="priest_schedule">Calendar ↗</button></div><div class="sys-agenda">'+[['09:00','Certificates due','Records desk'],['11:30','Marriage interview','Parish office'],['14:00','Chapel coordination','BEC desk']].map(x=>'<div><span>'+x[0]+'</span><strong>'+x[1]+'<small>'+x[2]+'</small></strong></div>').join('')+'</div></section></aside></div>'+
 '<div class="sys-lower-grid"><section class="sys-panel"><div class="sys-panel-heading"><div><div class="sys-eyebrow">OPERATIONS / ACCESS</div><h2>Open a working module</h2><p>Explore every part of the connected parish system.</p></div><span class="sys-meta-tag">22 core modules</span></div><div class="sys-launch-grid">'+workflowCards.map(([id,title,sub,ic])=>'<button data-nav="'+id+'" type="button" class="sys-launch"><span class="sys-launch-icon">'+ic+'</span><strong>'+title+'</strong><small>'+sub+'</small><span>↗</span></button>').join('')+'</div></section>'+
 '<section class="sys-panel"><div class="sys-panel-heading"><div><div class="sys-eyebrow">DOCUMENT TRACEABILITY</div><h2>Latest recorded actions</h2><p>Actor, reference and case timeline.</p></div><button data-nav="audit" class="sys-link">Audit trail ↗</button></div><div class="sys-activity">'+recent.map(e=>'<div><span class="sys-activity-bullet"></span><p><strong>'+esc(e.what)+'</strong><small>'+esc(e.id)+' · '+esc(e.by)+'</small></p><time>'+esc(e.at)+'</time></div>').join('')+'</div></section></div>'+
 '<div class="sys-suite-heading"><div><span class="sys-eyebrow">MODULE DIRECTORY</span><h2>Parish management modules</h2><p>Open a module to review its records, responsibilities and next actions.</p></div><button class="sys-btn light" data-sys-reset type="button">↻ Reset preview</button></div>'+
 '<div class="sys-directory">'+DIRECTORY.map(m=>'<button data-nav="'+m.id+'" type="button"><span class="sys-dir-icon">'+m.icon+'</span><strong>'+esc(m.title)+'</strong><span>'+esc(m.section)+'</span><small>'+esc(m.priority)+' ↗</small></button>').join('')+'</div>';
}
function infoRows(r){return r.fields.map(f=>'<div class="sys-info"><dt>'+esc(f.label)+'</dt><dd>'+esc(f.value)+'</dd></div>').join('');}
function checklist(state,r){
 const checked=state.checked[r.id]||[];
 return '<div class="sys-inspect-group"><h4>Supporting documents & requirements <span>'+r.docs.length+'</span></h4>'+r.docs.map((d,i)=>'<label class="sys-doc-check"><input type="checkbox" data-sys-check="'+esc(r.id)+'" data-sys-doc="'+i+'" '+(checked.includes(i)?'checked':'')+'><span><strong>'+esc(d)+'</strong><small>'+(checked.includes(i)?'Reviewed':'Not verified')+'</small></span></label>').join('')+'</div>';
}
function inspector(state,r,role){
 const next=nextStatus(r);
 const conflictBlocked=r.module==='priest_schedule'&&r.status==='Proposed'&&getRecords(state,'priest_schedule').some(x=>x.id!==r.id&&x.owner===r.owner&&x.status==='Conflict'&&x.date.split(' · ')[0]===r.date.split(' · ')[0]);
 const allowed=hasRole(r.module,role,r)&&!conflictBlocked;
 const mod=INDEX[r.module];
 const intentionPicker=r.module==='intentions'&&r.status==='Requested'
 ?'<label class="sys-action-field">Select celebrant<select data-sys-celebrant="'+esc(r.id)+'"><option value="">Choose a priest</option><option value="Fr. Mateo Cruz">Fr. Mateo Cruz</option><option value="Fr. Gabriel Santos">Fr. Gabriel Santos</option></select></label>':'';
 const depositPicker=r.module==='collections'&&r.status==='Count verified'
 ?'<label class="sys-action-field">Deposit reference<input data-sys-deposit-ref="'+esc(r.id)+'" placeholder="SAMPLE-DEP-112" maxlength="36" autocomplete="off"></label>':'';
 return '<aside class="sys-inspector"><div class="sys-inspect-head"><span class="sys-eyebrow">CASE INSPECTOR / '+esc(mod.short).toUpperCase()+'</span><div class="sys-detail-ref">'+esc(r.id)+'</div><h3>'+esc(r.title)+'</h3><p>'+esc(r.subtitle)+'</p>'+badge(r.status)+'</div>'+
 '<div class="sys-inspect-scroll"><div class="sys-info-list"><div class="sys-info"><dt>Accountable owner</dt><dd>'+esc(r.owner)+'</dd></div><div class="sys-info"><dt>Schedule / due</dt><dd>'+esc(r.date)+'</dd></div><div class="sys-info"><dt>Category</dt><dd>'+esc(r.tag)+'</dd></div>'+infoRows(r)+'</div>'+
 checklist(state,r)+
 '<div class="sys-inspect-group"><h4>Custody / action history <span>'+r.timeline.length+'</span></h4><ol class="sys-timeline">'+r.timeline.slice().reverse().map(e=>'<li><b>'+esc(displayStatus(e.event))+'</b><span>'+esc(e.actor)+' · '+esc(e.at)+'</span><small>'+esc(String(e.note).replace(/\s*\(demo\)/gi,''))+'</small></li>').join('')+'</ol></div></div>'+
 '<div class="sys-inspect-footer">'+(next?'<p><b>Next action:</b> '+esc(displayStatus(next))+'</p>'+intentionPicker+depositPicker+'<button type="button" data-sys-next="'+esc(r.id)+'" class="sys-btn solid" '+(!allowed?'disabled aria-label="Switch to an authorized demo role to proceed"':'')+'>'+esc(actionLabel(r.module,next))+' →</button>'+(!allowed?'<small>'+(conflictBlocked?'Overlapping availability detected. Office coverage must be resolved first.':'Select the responsible office role to continue.')+'</small>':''):'<p>All available steps are complete, or an authorized review is required.</p><button class="sys-btn light" type="button" data-sys-report="'+esc(r.id)+'">Print sample case summary</button>')+'</div></aside>';
}
function moduleDataRows(state,mod){
 const rows=filterRecords(state,mod);
 if(!rows.length)return '<div class="sys-no-results">No records match your search. Clear the filter to see all entries.</div>';
 return rows.map(r=>'<button type="button" data-sys-open="'+esc(r.id)+'" class="sys-record '+(state.selected[mod]===r.id?'chosen':'')+'"><span class="sys-record-main"><b>'+esc(r.id)+'</b><strong>'+esc(r.title)+'</strong><small>'+esc(r.subtitle)+'</small></span><span class="sys-record-date">'+esc(r.date)+'</span><span class="sys-record-owner">'+esc(r.owner)+'</span>'+badge(r.status,true)+'<span class="sys-record-arrow">→</span></button>').join('');
}
function moduleFeatureList(m){
 return '<div class="sys-feature-row">'+m.features.map(f=>'<span><i>✓</i>'+esc(f)+'</span>').join('')+'</div>';
}
function moduleSpecial(m,state){
 const items=getRecords(state,m.id);
 if(m.id==='priest_schedule'){
  const days=[['SAT','14'],['SUN','15'],['MON','16'],['TUE','17'],['WED','18'],['THU','19'],['FRI','20']];
  return '<section class="sys-panel sys-calendar"><div class="sys-panel-heading"><div><div class="sys-eyebrow">ASSIGNMENT BOARD</div><h2>Priest availability · 14–20 November</h2><p>Masses, chapel visits, interviews and unavailable periods for the selected week.</p></div><span class="sys-warning-compact">1 conflict requires manual resolution</span></div><div class="sys-calendar-days">'+days.map((d,i)=>'<div class="sys-calendar-day"><span>'+d[0]+'</span><b>'+d[1]+'</b>'+(i===1?'<em>7:00 AM Mass</em>':i===2?'<em>10:00 Chapel</em>':i===3?'<em>11:30 Interview</em><em class="conflict">11:00 Recollection</em>':i===5?'<em>3:00 BEC visit</em>':'<small>—</small>')+'</div>').join('')+'</div></section>';
 }
 if(m.id==='registry'){
  return '<section class="sys-panel sys-registers"><div class="sys-panel-heading"><div><div class="sys-eyebrow">ORIGINAL REGISTER CUSTODY</div><h2>Sacramental index by book</h2></div><span class="sys-warning-compact">Authority remains with original source registers</span></div><div class="sys-register-grid">'+[['Baptism','VOL-02','142 indexed','◉'],['Confirmation','VOL-01','89 indexed','✣'],['Marriage','VOL-03','44 indexed','◇'],['Death','VOL-04','14 indexed','✚']].map(x=>'<div><span>'+x[3]+'</span><strong>'+x[0]+'</strong><small>'+x[1]+' · '+x[2]+' (fictional)</small></div>').join('')+'</div></section>';
 }
 if(m.id==='collections'||m.id==='finance'){
  return '<section class="sys-panel sys-finance-callout"><div><span class="sys-eyebrow">STEWARDSHIP CONTROLS</span><h2>Restricted funds are tracked by designated purpose.</h2><p>Collection verification, expense approvals and deposit reconciliation follow separate steps.</p></div><div class="sys-fund-chart"><div><label>General fund <b>₱8,250</b></label><span style="--bar:70%"></span></div><div><label>Roof restoration <b>₱12,000</b></label><span style="--bar:100%"></span></div><div><label>Office expenses <b>₱3,140</b></label><span style="--bar:27%"></span></div></div></section>';
 }
 if(m.id==='funerals')return '<div class="sys-attention"><strong>Urgent pastoral request PAS-038 needs assignment.</strong> Contact details and sensitive pastoral information are restricted to the responsible staff.</div>';
 if(m.id==='baptism')return '<div class="sys-attention neutral"><strong>Baptismal eligibility is not inferred from a booking.</strong> Sponsor requirements, preparation, and registration are separate from the rite and subsequent source-register entry.</div>';
 if(m.id==='diocese')return '<div class="sys-attention neutral"><strong>Local diocesan requirements are not configured.</strong> All templates, remittances and referral actions are fictional until separately confirmed with the relevant diocese.</div>';
 if(m.id==='cemetery')return '<div class="sys-attention neutral"><strong>Optional parish-operated service.</strong> Hide this module when the parish does not operate a cemetery, columbarium or memorial facility.</div>';
 if(m.id==='intentions')return '<div class="sys-attention neutral"><strong>Obligation safeguards:</strong> Recording an offering does not fulfill a Mass intention. Record the celebration separately when the assigned Mass has been fulfilled.</div>';
 if(m.id==='announcements')return '<div class="sys-attention neutral"><strong>Publication preview:</strong> Preview and review the notice before publishing through approved parish channels.</div>';
 return '';
}
function renderModule(state,m,role){
 const rows=getRecords(state,m.id),visible=filterRecords(state,m.id);
 const selected=rows.find(r=>r.id===state.selected[m.id])||rows[0];
 if(selected)state.selected[m.id]=selected.id;
 const statuses=['All',...new Set(rows.map(r=>r.status))];
 const stats=moduleStats(m,rows);
 return '<div class="sys-topline"><span class="sys-live-dot"></span> '+esc(m.section.toUpperCase())+' / '+esc(m.priority.toUpperCase())+' <span class="sys-date">'+dateStr+'</span></div>'+
 '<div class="sys-module-intro"><div><span class="sys-eyebrow">PARISHOS / '+esc(m.section.toUpperCase())+'</span><h1>'+esc(m.title)+'</h1><p>'+esc(m.summary)+'</p></div><div class="sys-intro-actions"><span class="sys-meta-tag">'+esc(m.priority)+' module</span><button class="sys-btn light" data-sys-report="'+esc(m.id)+'">↓ Report preview</button><button class="sys-btn solid" data-sys-create="'+esc(m.id)+'">+ Add record</button></div></div>'+
 '<div class="sys-module-metrics">'+stats.map((s,i)=>'<div><span>'+s.title+'</span><strong>'+s.value+'</strong><small>'+s.subtitle+'</small></div>').join('')+'</div>'+
 moduleSpecial(m,state)+
 '<div class="sys-module-workspace"><section class="sys-panel sys-records-panel"><div class="sys-records-head"><div><span class="sys-eyebrow">WORK QUEUE / '+esc(m.short).toUpperCase()+'</span><h2>Records & actions <span>'+visible.length+'</span></h2><p>'+esc(m.subtitle)+'</p></div><div class="sys-table-controls"><input data-sys-search="'+esc(m.id)+'" type="search" placeholder="Find a record…" value="'+esc(state.searches[m.id]||'')+'" aria-label="Search '+esc(m.title)+'"><select data-sys-filter="'+esc(m.id)+'" aria-label="Filter '+esc(m.title)+' by status">'+statuses.map(s=>'<option value="'+esc(s)+'" '+((state.filters[m.id]||'All')===s?'selected':'')+'>'+esc(displayStatus(s))+'</option>').join('')+'</select></div></div><div class="sys-record-legend"><span>RECORD & SUBJECT</span><span>DATE / SCHEDULE</span><span>ASSIGNED</span><span>STATUS</span><span>OPEN</span></div><div id="sysResults" class="sys-records">'+moduleDataRows(state,m.id)+'</div><div class="sys-records-foot">Select a record to inspect details, evidence and timeline. Changes exist only in this browser session.</div></section>'+
 (selected?inspector(state,selected,role):'')+'</div>'+
 '<section class="sys-module-capabilities"><div><span class="sys-eyebrow">BUSINESS CAPABILITY</span><h2>Included workflow concepts</h2></div>'+moduleFeatureList(m)+'</section>'+
 '<dialog id="systemNewDialog" class="sys-modal"><form id="systemNewForm" class="sys-dialog-form"><div class="sys-modal-title"><div><span class="sys-eyebrow">NEW RECORD</span><h2>New '+esc(m.short.toLowerCase())+' entry</h2></div><button data-sys-close type="button" aria-label="Close dialog">×</button></div><p>Use illustrative information only. This preview does not retain records after refresh.</p><input type="hidden" name="module" value="'+esc(m.id)+'"><label>Record title<input required maxlength="80" name="title" placeholder="Record or activity name"></label><label>Description<input required maxlength="100" name="subtitle" placeholder="Brief service or activity description"></label><label>Assigned desk / person<select name="owner"><option>Parish secretary</option><option>Records officer</option><option>Office administrator</option><option>Finance officer</option><option>Fr. Mateo Cruz</option><option>Fr. Gabriel Santos</option></select></label><div class="sys-modal-actions"><button class="sys-btn light" data-sys-close type="button">Cancel</button><button class="sys-btn solid" type="submit">Add fictional record</button></div></form></dialog>';
}
function portalExperience(state,cases){
 const own=state.portalRef?cases.find(c=>c.id===state.portalRef):null;
 const found=state.portalSearch?cases.find(c=>c.id.toLowerCase()===state.portalSearch.trim().toLowerCase()):own;
 const services=[['Baptismal certificate','certificate','Register verification and document release'],['Church wedding preparation','marriage','Documents, interview and readiness tracking'],['Incoming inquiry / letter','correspondence','Office correspondence routing']];
 return '<div class="sys-portal"><div class="sys-portal-nav"><div><span class="sys-portal-mark">✣</span><span><b>St. Gabriel Parish</b><small>Parishioner service desk</small></span></div><span>HOME &nbsp;&nbsp; SERVICES &nbsp;&nbsp; SCHEDULES &nbsp;&nbsp; CONTACT</span></div><section class="sys-public-hero"><div><span>WELCOME TO OUR PARISH SERVICE DESK</span><h1>Less time in line.<br>More time for parish life.</h1><p>View service requirements, send an inquiry and follow its progress with a reference number.</p><a href="#publicRequestForm" class="sys-btn solid">Start a request →</a></div><div class="sys-public-hero-art"><div class="sys-public-cross">✣</div><strong>Office hours</strong><p>Monday–Friday, 8:00 AM–5:00 PM</p><small>Illustrative schedule · Confirm parish hours</small><span>SACRAMENTAL & ADMINISTRATIVE SERVICES</span></div></section><div class="sys-public-intro"><div><span class="sys-eyebrow">COMMON REQUESTS</span><h2>How can the parish office help you?</h2><p>Choose a service to view requirements and begin a request.</p></div><div class="sys-service-grid">'+services.map(s=>'<button class="sys-service-card" type="button" data-sys-service="'+s[1]+'"><span>▣</span><strong>'+s[0]+'</strong><small>'+s[2]+'</small><em>Start request ↗</em></button>').join('')+'</div></div><div class="sys-public-bottom"><section class="sys-panel sys-public-form"><span class="sys-eyebrow">ONLINE REQUEST INTAKE</span><h2 id="publicRequestForm">Request a parish service</h2><p>Enter an example requester name to see how a submission reaches the parish office inbox.</p><form id="publicForm"><label>Service type<select name="kind" id="publicService"><option value="certificate">Sacramental certificate</option><option value="marriage">Wedding preparation</option><option value="correspondence">General office inquiry</option></select></label><label>Fictional requester label<input name="subject" maxlength="70" required placeholder="Sample Household Z" autocomplete="off"></label><button type="submit" class="sys-btn solid">Create demo request →</button></form></section><section class="sys-panel sys-public-track"><span class="sys-eyebrow">REQUEST STATUS</span><h2>Track your request</h2><p>Enter the reference provided at intake to check the request status.</p><label>Request number<input type="search" data-sys-portal-search value="'+esc(state.portalSearch||state.portalRef||'')+'" placeholder="e.g. CERT-0142" aria-label="Track fictional reference"></label>'+(found?'<div class="sys-tracking"><b>'+esc(found.id)+'</b><strong>'+esc(found.subject)+'</strong>'+badge(found.status)+'<small>Assigned: '+esc(found.owner)+'</small><span>'+esc(nextStep(found)?.title||'Simulated workflow complete')+'</span><button type="button" data-open="'+esc(found.id)+'" class="sys-link">Open office view ↗</button></div>':'<div class="sys-empty-track">Reference not found. Try CERT-0142 or register a new preview request.</div>')+'</section></div><div class="sys-public-footer">PARISHOS CONCEPT PREVIEW · No requests are submitted to an actual parish office.</div></div>';
}
function priestCompanion(state,role){
 const rows=getRecords(state,'priest_schedule');
 const pending=rows.filter(r=>r.status==='Proposed');
 const today=rows.filter(r=>r.owner==='Fr. Mateo Cruz'&&!r.status.includes('Conflict'));
 return '<div class="sys-priest-wrap"><div class="sys-priest-copy"><span class="sys-eyebrow">PRIEST COMPANION / MOBILE VIEW</span><h1>Your parish schedule, wherever you serve.</h1><p>View assigned Masses, appointments and pastoral visits. Respond to schedule requests without returning to the parish office.</p><div class="sys-priest-benefits"><div><b>01</b><span>See Masses, meetings and chapel visits in one calendar.</span></div><div><b>02</b><span>Review new assignments and confirm availability.</span></div><div><b>03</b><span>Check conflicting appointments and coverage requests.</span></div></div><button data-nav="priest_schedule" class="sys-btn light">Open full office scheduling ↗</button></div><div class="sys-phone"><div class="sys-phone-top"><span>9:41</span><span>●●● ▰</span></div><div class="sys-phone-app"><div class="sys-phone-brand"><span>✣ PARISHOS</span><b>◌</b></div><small>FRIDAY · 13 NOVEMBER</small><h2>Good morning,<br>Father.</h2><p>St. Gabriel Parish · Priest workspace</p><div class="sys-phone-next"><span>YOUR NEXT ASSIGNMENT</span><strong>Sunday Mass</strong><b>7:00 AM · Main church</b><small>Celebrant: Fr. Mateo Cruz</small></div><div class="sys-phone-section"><b>Upcoming assignments</b><span>THIS WEEK</span></div>'+today.map(x=>'<div class="sys-phone-item"><span>'+esc(x.date.split(' · ')[0])+'</span><div><strong>'+esc(x.title)+'</strong><small>'+esc(x.subtitle)+'</small></div><i>↗</i></div>').join('')+'<div class="sys-phone-section"><b>Awaiting your response</b><span>'+pending.length+' PENDING</span></div>'+pending.map(x=>'<div class="sys-phone-approval"><strong>'+esc(x.title)+'</strong><small>'+esc(x.date)+' · '+esc(x.owner)+'</small><button type="button" data-sys-phone-accept="'+esc(x.id)+'" '+(role!=='priest'||rows.some(y=>y.id!==x.id&&y.owner===x.owner&&y.status==='Conflict'&&y.date.split(' · ')[0]===x.date.split(' · ')[0])?'disabled':'')+'>'+(rows.some(y=>y.id!==x.id&&y.owner===x.owner&&y.status==='Conflict'&&y.date.split(' · ')[0]===x.date.split(' · ')[0])?'Conflict · office review required':'Accept assignment →')+'</button></div>').join('')+'<div class="sys-phone-nav"><span>⌂<small>Home</small></span><span>▦<small>Calendar</small></span><span>✓<small>Approvals</small></span><span>◌<small>Profile</small></span></div></div></div></div>'+
 '<div class="sys-attention neutral"><strong>Preview the connected workflow:</strong> Choose the priest role above and accept an assignment. The change will appear on the office scheduling board.</div>';
}
export function renderShowcase(route,state,cases,role){
 if(route==='public')return portalExperience(state,cases);
 if(route==='priest')return priestCompanion(state,role);
 const m=INDEX[route];return m?renderModule(state,m,role):'';
}
export function isShowcaseRoute(route){return route==='public'||route==='priest'||!!INDEX[route];}
export function onShowcaseClick(button,state,role){
 if(button.dataset.sysOpen!==undefined){const id=button.dataset.sysOpen;const found=state.records.find(r=>r.id===id);if(found){state.selected[found.module]=id;return {refresh:true};}}
 if(button.dataset.sysNext!==undefined||button.dataset.sysPhoneAccept!==undefined){
  const id=button.dataset.sysNext||button.dataset.sysPhoneAccept;
  const i=state.records.findIndex(r=>r.id===id);if(i<0)return {message:'Record not found.'};
  const r=state.records[i];
  if(!hasRole(r.module,role,r))return {message:'Switch to the appropriate fictional staff role before acting.'};
  if(r.module==='baptism'&&r.status==='Intake'&&(state.checked[r.id]||[]).length<r.docs.length)return {message:'Complete the sponsor and preparation checklist before advancing this baptism request.'};
  if(r.module==='collections'&&r.status==='Logged'&&(state.checked[r.id]||[]).length<r.docs.length)return {message:'Collection count and witness sheets must both be reviewed before confirming a count.'};
  if(r.module==='priest_schedule'&&r.status==='Proposed'&&state.records.some(x=>x.module==='priest_schedule'&&x.id!==r.id&&x.owner===r.owner&&x.status==='Conflict'&&x.date.split(' · ')[0]===r.date.split(' · ')[0]))return {message:'Calendar conflict: this priest has an overlapping unavailable block. Resolve coverage with the office first.'};
  let target=r;
  if(r.module==='intentions'&&r.status==='Requested'){
   const priest=typeof document!=='undefined'?document.querySelector('[data-sys-celebrant="'+id+'"]')?.value:'';
   if(!priest)return {message:'Select the celebrant before assigning this intention.'};
   target={...r,owner:priest,fields:r.fields.map(f=>f.label==='Assignee'?{...f,value:priest}:f)};
  }
  if(r.module==='collections'&&r.status==='Count verified'){
   const ref=typeof document!=='undefined'?document.querySelector('[data-sys-deposit-ref="'+id+'"]')?.value.trim():'';
   if(!/^SAMPLE-[A-Z0-9-]{5,32}$/i.test(ref))return {message:'Enter a preview deposit reference beginning with SAMPLE- before reconciling.'};
   target={...r,fields:r.fields.map(f=>f.label==='Deposit'?{...f,value:'Matched (demo) · '+ref}:f)};
  }
  const result=transition(target,role,new Date().toLocaleString('en-PH',{dateStyle:'medium',timeStyle:'short'}));
  if(!result.ok)return {message:result.error};
  state.records[i]=result.record;
  return {refresh:true,message:r.id+' updated: '+displayStatus(result.record.status)+'.'};
 }
 if(button.dataset.sysCheck!==undefined){
  const id=button.dataset.sysCheck,index=Number(button.dataset.sysDoc);
  if(!Number.isInteger(index))return {message:'Invalid checklist reference.'};
  const rec=state.records.find(r=>r.id===id);if(!rec||!rec.docs[index])return {message:'No such document.'};
  const list=new Set(state.checked[id]||[]);
  if(list.has(index))list.delete(index);else list.add(index);
  state.checked[id]=[...list];
  rec.timeline.push({at:new Date().toLocaleString('en-PH',{dateStyle:'medium',timeStyle:'short'}),actor:'Demo '+role,event:'Supporting evidence checklist changed',note:rec.docs[index]+' · '+(list.has(index)?'Marked reviewed':'Review flag cleared')+'. Not a source record change.'});
  return {refresh:true,message:'Document checklist updated.'};
 }
 if(button.dataset.sysReset!==undefined){state.records=createModuleData();state.selected={};state.checked={};state.filters={};state.searches={};state.portalRef=null;state.portalSearch='';return {refresh:true,message:'The original preview records have been restored.'};}
 if(button.dataset.sysCreate!==undefined)return {openModal:'systemNewDialog'};
 if(button.dataset.sysClose!==undefined)return {closeModal:true};
 if(button.dataset.sysService!==undefined)return {portalService:button.dataset.sysService};
 if(button.dataset.sysReport!==undefined){
  const id=button.dataset.sysReport;
  const r=state.records.find(x=>x.id===id);
  const m=INDEX[id];
  const heading=r?r.id+' — '+r.title:m?m.title:'ParishOS';
  const rows=r?[r]:getRecords(state,id);
  const html='<div class="print-sheet"><div class="invalid-watermark">SAMPLE · INVALID</div><span class="eyebrow">PARISHOS / REPORT PREVIEW</span><h2 id="printTitle">'+esc(heading)+'</h2><p>Illustrative report only. Not valid as an official parish or financial record.</p>'+rows.map(x=>'<p><strong>'+esc(x.id)+'</strong> · '+esc(x.title)+' · '+esc(displayStatus(x.status))+'</p>').join('')+'<div class="paper-notice">NOT VALID · NO PARISH SEAL · NO OFFICIAL FINANCIAL OR CANONICAL AUTHORITY</div></div>';
  return {printHtml:html};
 }
 return null;
}
export function onShowcaseSubmit(form,state,role){
 if(form.id==='publicForm'){
  const fields=new FormData(form),kind=String(fields.get('kind')||'certificate'),subject=String(fields.get('subject')||'').trim();
  if(!subject||!['certificate','marriage','correspondence'].includes(kind))return {message:'Enter a requester name and select a service.'};
  return {portalCase:{kind,subject}};
 }
 if(form.id==='systemNewForm'){
  const fields=new FormData(form),module=String(fields.get('module')),title=String(fields.get('title')||'').trim(),subtitle=String(fields.get('subtitle')||'').trim(),owner=String(fields.get('owner')||'Parish secretary');
  const mod=INDEX[module];
  if(!mod||!title||!subtitle)return {message:'Enter a title and description.'};
  const id=module.toUpperCase().replace(/[^A-Z]/g,'').slice(0,4)+'-D'+String(state.records.length+1).padStart(3,'0');
  state.records.unshift({module,id,title,subtitle,owner,date:'13 Nov 2026',tag:'New entry',status:mod.steps[0],fields:[{label:'Source',value:'Pending source verification'},{label:'Office decision',value:'Pending'}],docs:['Intake reference','Staff follow-up'],timeline:[{at:new Date().toLocaleString('en-PH',{dateStyle:'medium',timeStyle:'short'}),actor:'Demo '+role,event:'Record added',note:'Created in this preview session.'}]});
  state.selected[module]=id;
  return {refresh:true,closeModal:true,message:id+' added to the register.'};
 }
 return null;
}
export function updateShowcaseSearch(state,mod,text){state.searches[mod]=text;}
export function updateShowcaseFilter(state,mod,text){state.filters[mod]=text;}
export function updatePortalSearch(state,value){state.portalSearch=value;}
export function setPortalRef(state,id){state.portalRef=id;state.portalSearch=id;}
export function renderShowcaseTable(state,mod){
 const rows=filterRecords(state,mod);
 return moduleDataRows(state,mod);
}
