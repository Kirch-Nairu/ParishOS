import {CATALOG, INDEX, createModuleData, transition, nextStatus} from './system-data.mjs';
import {FINAL,nextStep} from './workflow.mjs';

// All actions mutate this in-memory demonstration object only.
export function createShowcaseState(){
 return {records:createModuleData(),selected:{},filters:{},searches:{},checked:{},activeTab:{},portalRef:null,portalSearch:'',priestTab:'day',lastNotice:''};
}
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const color=s=>/assigned|scheduled|pending|requested|review|proposed|counted|draft|logged|inquiry|intake|registration|contacted|planned|new|open|conflict|await|missing/i.test(s)?'amber':/reconciled|complete|celebrated|approved|matched|reserved|confirmed|accepted|closed|published|archived|release|indexed|ordered/i.test(s)?'green':'blue';
const badge=(s,small=false)=>'<span class="sys-badge '+color(s)+' '+(small?'mini':'')+'">'+esc(s)+'</span>';
const moneyValue=s=>{const m=String(s).match(/₱[\d,]+(?:\.\d+)?/);return m?m[0]:'—';};
const icon=(n)=>'<span class="sys-glyph" aria-hidden="true">'+(n||'▤')+'</span>';
const dateStr='FRIDAY · 13 NOV 2026';
const sections=['Rectory office','Sacraments & records','Pastoral & people','Finance & stewardship','Public & outreach','Optional services'];
const recordMatches=(r,q)=>([r.id,r.title,r.subtitle,r.status,r.owner,r.date,r.tag,...r.fields.map(x=>x.value)].join(' ').toLowerCase().includes(q.toLowerCase()));
function actionLabel(mod,next){
 if(!next)return 'No further demo actions';
 if(mod==='registry')return 'Queue annotation review';
 if(mod==='intentions')return next==='Celebrated (demo)'?'Record fictional fulfillment':'Assign sample celebrant';
 if(mod==='priest_schedule')return 'Accept assignment (simulation)';
 if(mod==='collections')return next.includes('Deposit')?'Match deposit (demo)':'Confirm sample count';
 if(mod==='finance')return next.includes('Approved')?'Record fictional approval':'Route expense voucher';
 if(mod==='funerals')return next.includes('Priest')?'Assign on-call priest':'Advance coordination';
 if(mod==='announcements')return next.includes('Published')?'Publish sample notice':'Schedule sample notice';
 return 'Record next stage: '+next;
}
function hasRole(mod,role,record){
 if(mod==='finance'&&record.status==='For approval')return role==='administrator';
 if(mod==='priest_schedule'&&record.status==='Proposed')return role==='priest';
 if(mod==='registry')return ['records','administrator'].includes(role);
 if(mod==='collections')return ['finance','administrator'].includes(role);
 if(mod==='personnel')return role==='administrator';
 return ['administrator','secretary','records','clerk','finance','priest'].includes(role);
}
function moduleStats(m,items){
 const current=items.length;
 const active=items.filter(x=>!/published|complete|confirmed|approved|matched|celebrated|indexed|reserved|closed/i.test(x.status)).length;
 const pending=items.filter(x=>/pending|requested|draft|new|logged|inquiry|intake|proposed|registration|planned/i.test(x.status)).length;
 return [
  {title:'Sample records',value:String(current).padStart(2,'0'),subtitle:'In this module'},
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
 return '<div class="sys-topline"><span class="sys-live-dot"></span> PARISH OPERATIONS / LIVE DEMO <span class="sys-date">'+dateStr+'</span></div>'+
 '<section class="sys-desk-hero"><div><div class="sys-eyebrow">ST. GABRIEL · PARISH SECRETARIAT</div><h1>Office command center<span class="sys-title-dot">.</span></h1><p>A working overview of requests, records, assignments and financial custody. Every reference below is synthetic.</p><div class="sys-hero-actions"><button class="sys-btn solid" data-new type="button">+ Register office request</button><button class="sys-btn light" data-nav="inbox" type="button">Open work queue ↗</button></div></div><div class="sys-hero-panel"><span class="sys-mini-label">OFFICE STATUS</span><div class="sys-operational"><i></i> Desk operational <small>Demo session</small></div><div class="sys-hero-stats"><span>Pending handoffs <b>'+String(open.length).padStart(2,'0')+'</b></span><span>Release-ready <b>'+String(ready).padStart(2,'0')+'</b></span><span>Priest responses <b>'+String(pendingPriest).padStart(2,'0')+'</b></span></div><small>Role-aware presentation · In-memory only</small></div></section>'+
 '<div class="sys-kpi-row">'+[
  ['Office cases',open.length,'Active requests / documents','inbox'],
  ['Ready for handover',ready,'Simulated document clearance','certificates'],
  ['Pastoral urgency',urgent,'Urgent sick-call requests','funerals'],
  ['Collection follow-ups',unmatched,'Count / reconciliation pending','collections']
 ].map(([title,val,foot,view],i)=>'<button class="sys-kpi" data-nav="'+view+'"><span class="sys-kpi-visual">'+['▤','▣','✚','₱'][i]+'</span><small>'+title+'</small><b>'+String(val).padStart(2,'0')+'</b><span>'+foot+' <em>↗</em></span></button>').join('')+'</div>'+
 '<div class="sys-desk-split"><section class="sys-panel"><div class="sys-panel-heading"><div><div class="sys-eyebrow">FRONT DESK · CASE QUEUE</div><h2>Work requiring action</h2><p>Open a case to inspect requirements, next step and recorded custody.</p></div><button data-nav="inbox" class="sys-link">View all cases ↗</button></div><div class="sys-inbox-list">'+open.map(caseRow).join('')+'</div><div class="sys-panel-footer"><span>Tip: use / to search office case references</span><span>All records are fictional</span></div></section>'+
 '<aside class="sys-side-column"><section class="sys-panel sys-urgent"><div class="sys-panel-heading"><div><div class="sys-eyebrow">PASTORAL COORDINATION</div><h2>Needs attention</h2></div><span class="sys-urgency">1 urgent</span></div><div class="sys-urgent-detail"><span class="sys-red-dot"></span><div><strong>Home sick call · PAS-038</strong><p>Sample Barangay 03 · On-call priest not assigned</p><button class="sys-link" data-nav="funerals">Open dispatch queue ↗</button></div></div></section><section class="sys-panel sys-next"><div class="sys-panel-heading"><div><div class="sys-eyebrow">COMING UP</div><h2>Today's desk agenda</h2></div><button class="sys-link" data-nav="priest_schedule">Calendar ↗</button></div><div class="sys-agenda">'+[['09:00','Certificates due','Records desk'],['11:30','Marriage interview','Parish office'],['14:00','Chapel coordination','BEC desk']].map(x=>'<div><span>'+x[0]+'</span><strong>'+x[1]+'<small>'+x[2]+'</small></strong></div>').join('')+'</div></section></aside></div>'+
 '<div class="sys-lower-grid"><section class="sys-panel"><div class="sys-panel-heading"><div><div class="sys-eyebrow">OPERATIONS / ACCESS</div><h2>Open a working module</h2><p>Explore every part of the connected parish system.</p></div><span class="sys-meta-tag">22 core modules</span></div><div class="sys-launch-grid">'+workflowCards.map(([id,title,sub,ic])=>'<button data-nav="'+id+'" type="button" class="sys-launch"><span class="sys-launch-icon">'+ic+'</span><strong>'+title+'</strong><small>'+sub+'</small><span>↗</span></button>').join('')+'</div></section>'+
 '<section class="sys-panel"><div class="sys-panel-heading"><div><div class="sys-eyebrow">DOCUMENT TRACEABILITY</div><h2>Latest recorded actions</h2><p>Actor, reference and case timeline.</p></div><button data-nav="audit" class="sys-link">Audit trail ↗</button></div><div class="sys-activity">'+recent.map(e=>'<div><span class="sys-activity-bullet"></span><p><strong>'+esc(e.what)+'</strong><small>'+esc(e.id)+' · '+esc(e.by)+'</small></p><time>'+esc(e.at)+'</time></div>').join('')+'</div></section></div>'+
 '<div class="sys-suite-heading"><div><span class="sys-eyebrow">MODULE DIRECTORY</span><h2>The complete parish operations suite</h2><p>From sacramental records to logistics and diocesan reporting.</p></div><button class="sys-btn light" data-sys-reset type="button">↻ Reset fictional data</button></div>'+
 '<div class="sys-directory">'+CATALOG.filter(m=>!['priest','public'].includes(m.id)).map(m=>'<button data-nav="'+m.id+'" type="button"><span class="sys-dir-icon">'+m.icon+'</span><strong>'+esc(m.title)+'</strong><span>'+esc(m.section)+'</span><small>'+esc(m.priority)+' ↗</small></button>').join('')+'</div>';
}
function infoRows(r){return r.fields.map(f=>'<div class="sys-info"><dt>'+esc(f.label)+'</dt><dd>'+esc(f.value)+'</dd></div>').join('');}
function checklist(state,r){
 const checked=state.checked[r.id]||[];
 return '<div class="sys-inspect-group"><h4>Supporting documents & requirements <span>'+r.docs.length+'</span></h4>'+r.docs.map((d,i)=>'<label class="sys-doc-check"><input type="checkbox" data-sys-check="'+esc(r.id)+'" data-sys-doc="'+i+'" '+(checked.includes(i)?'checked':'')+'><span><strong>'+esc(d)+'</strong><small>'+(checked.includes(i)?'Simulated checked':'Not verified')+'</small></span></label>').join('')+'</div>';
}
function inspector(state,r,role){
 const next=nextStatus(r),allowed=hasRole(r.module,role,r);
 const mod=INDEX[r.module];
 return '<aside class="sys-inspector"><div class="sys-inspect-head"><span class="sys-eyebrow">CASE INSPECTOR / '+esc(mod.short).toUpperCase()+'</span><div class="sys-detail-ref">'+esc(r.id)+'</div><h3>'+esc(r.title)+'</h3><p>'+esc(r.subtitle)+'</p>'+badge(r.status)+'</div>'+
 '<div class="sys-inspect-scroll"><div class="sys-info-list"><div class="sys-info"><dt>Accountable owner</dt><dd>'+esc(r.owner)+'</dd></div><div class="sys-info"><dt>Schedule / due</dt><dd>'+esc(r.date)+'</dd></div><div class="sys-info"><dt>Category</dt><dd>'+esc(r.tag)+'</dd></div>'+infoRows(r)+'</div>'+
 checklist(state,r)+
 '<div class="sys-inspect-group"><h4>Custody / action history <span>'+r.timeline.length+'</span></h4><ol class="sys-timeline">'+r.timeline.slice().reverse().map(e=>'<li><b>'+esc(e.event)+'</b><span>'+esc(e.actor)+' · '+esc(e.at)+'</span><small>'+esc(e.note)+'</small></li>').join('')+'</ol></div></div>'+
 '<div class="sys-inspect-footer">'+(next?'<p><b>Next action:</b> '+esc(next)+'</p><button type="button" data-sys-next="'+esc(r.id)+'" class="sys-btn solid" '+(!allowed?'disabled aria-label="Switch to an authorized demo role to proceed"':'')+'>'+esc(actionLabel(r.module,next))+' →</button>'+(!allowed?'<small>Switch to an authorized role in the top bar. These are simulated permissions, not real access control.</small>':''):'<p>Sample workflow is complete or awaits policy-specific action.</p><button class="sys-btn light" type="button" data-sys-report="'+esc(r.id)+'">Print sample case summary</button>')+'</div></aside>';
}
function moduleDataRows(state,mod){
 const rows=filterRecords(state,mod);
 if(!rows.length)return '<div class="sys-no-results">No sample records match this filter. Clear the search or choose another status.</div>';
 return rows.map(r=>'<button type="button" data-sys-open="'+esc(r.id)+'" class="sys-record '+(state.selected[mod]===r.id?'chosen':'')+'"><span class="sys-record-main"><b>'+esc(r.id)+'</b><strong>'+esc(r.title)+'</strong><small>'+esc(r.subtitle)+'</small></span><span class="sys-record-date">'+esc(r.date)+'</span><span class="sys-record-owner">'+esc(r.owner)+'</span>'+badge(r.status,true)+'<span class="sys-record-arrow">→</span></button>').join('');
}
function moduleFeatureList(m){
 return '<div class="sys-feature-row">'+m.features.map(f=>'<span><i>✓</i>'+esc(f)+'</span>').join('')+'</div>';
}
function moduleSpecial(m,state){
 const items=getRecords(state,m.id);
 if(m.id==='priest_schedule'){
  const days=[['SAT','14'],['SUN','15'],['MON','16'],['TUE','17'],['WED','18'],['THU','19'],['FRI','20']];
  return '<section class="sys-panel sys-calendar"><div class="sys-panel-heading"><div><div class="sys-eyebrow">ASSIGNMENT BOARD</div><h2>Priest availability · 14–20 November</h2><p>Sample Masses, chapel visits, interview and out-of-parish commitments.</p></div><span class="sys-warning-compact">1 conflict requires manual resolution</span></div><div class="sys-calendar-days">'+days.map((d,i)=>'<div class="sys-calendar-day"><span>'+d[0]+'</span><b>'+d[1]+'</b>'+(i===1?'<em>7:00 AM Mass</em>':i===2?'<em>10:00 Chapel</em>':i===3?'<em>11:30 Interview</em><em class="conflict">11:00 Recollection</em>':i===5?'<em>3:00 BEC visit</em>':'<small>—</small>')+'</div>').join('')+'</div></section>';
 }
 if(m.id==='registry'){
  return '<section class="sys-panel sys-registers"><div class="sys-panel-heading"><div><div class="sys-eyebrow">ORIGINAL REGISTER CUSTODY</div><h2>Sacramental index by book</h2></div><span class="sys-warning-compact">Authority remains with original source registers</span></div><div class="sys-register-grid">'+[['Baptism','VOL-02','142 indexed','◉'],['Confirmation','VOL-01','89 indexed','✣'],['Marriage','VOL-03','44 indexed','◇'],['Death','VOL-04','14 indexed','✚']].map(x=>'<div><span>'+x[3]+'</span><strong>'+x[0]+'</strong><small>'+x[1]+' · '+x[2]+' (fictional)</small></div>').join('')+'</div></section>';
 }
 if(m.id==='collections'||m.id==='finance'){
  return '<section class="sys-panel sys-finance-callout"><div><span class="sys-eyebrow">STEWARDSHIP CONTROLS</span><h2>Purpose-bound funds are not general revenue.</h2><p>Counts, authorizations and accounting are separate. The demo does not receive money or post transactions.</p></div><div class="sys-fund-chart"><div><label>General fund <b>₱8,250</b></label><span style="--bar:70%"></span></div><div><label>Roof restoration <b>₱12,000</b></label><span style="--bar:100%"></span></div><div><label>Office expenses <b>₱3,140</b></label><span style="--bar:27%"></span></div></div></section>';
 }
 if(m.id==='funerals')return '<div class="sys-attention"><strong>Urgent pastoral request PAS-038 needs assignment.</strong> No confessional, diagnosis or private medical information is displayed. Contact details are intentionally omitted from this demo.</div>';
 if(m.id==='baptism')return '<div class="sys-attention neutral"><strong>Baptismal eligibility is not inferred from a booking.</strong> Sponsor requirements, preparation, and registration are separate from the rite and subsequent source-register entry.</div>';
 if(m.id==='diocese')return '<div class="sys-attention neutral"><strong>Local diocesan requirements are not configured.</strong> All templates, remittances and referral actions are fictional until separately confirmed with the relevant diocese.</div>';
 if(m.id==='cemetery')return '<div class="sys-attention neutral"><strong>Optional parish-operated service.</strong> Hide this module when the parish does not operate a cemetery, columbarium or memorial facility.</div>';
 if(m.id==='intentions')return '<div class="sys-attention neutral"><strong>Obligation safeguards:</strong> Recording an offering does not fulfill a Mass intention. Only a distinct demonstration celebration event advances the sample obligation.</div>';
 if(m.id==='announcements')return '<div class="sys-attention neutral"><strong>Publication preview:</strong> “Published (demo)” does not send a message, update a real parish site or notify parishioners.</div>';
 return '';
}
function renderModule(state,m,role){
 const rows=getRecords(state,m.id),visible=filterRecords(state,m.id);
 const selected=rows.find(r=>r.id===state.selected[m.id])||rows[0];
 if(selected)state.selected[m.id]=selected.id;
 const statuses=['All',...new Set(rows.map(r=>r.status))];
 const stats=moduleStats(m,rows);
 return '<div class="sys-topline"><span class="sys-live-dot"></span> '+esc(m.section.toUpperCase())+' / '+esc(m.priority.toUpperCase())+' <span class="sys-date">'+dateStr+'</span></div>'+
 '<div class="sys-module-intro"><div><span class="sys-eyebrow">PARISHOS / '+esc(m.section.toUpperCase())+'</span><h1>'+esc(m.title)+'</h1><p>'+esc(m.summary)+'</p></div><div class="sys-intro-actions"><span class="sys-meta-tag">'+esc(m.priority)+' module</span><button class="sys-btn light" data-sys-report="'+esc(m.id)+'">↓ Sample report</button><button class="sys-btn solid" data-sys-create="'+esc(m.id)+'">+ New sample entry</button></div></div>'+
 '<div class="sys-module-metrics">'+stats.map((s,i)=>'<div><span>'+s.title+'</span><strong>'+s.value+'</strong><small>'+s.subtitle+'</small></div>').join('')+'</div>'+
 moduleSpecial(m,state)+
 '<div class="sys-module-workspace"><section class="sys-panel sys-records-panel"><div class="sys-records-head"><div><span class="sys-eyebrow">WORK QUEUE / '+esc(m.short).toUpperCase()+'</span><h2>Records & actions <span>'+visible.length+'</span></h2><p>'+esc(m.subtitle)+'</p></div><div class="sys-table-controls"><input data-sys-search="'+esc(m.id)+'" type="search" placeholder="Find a record…" value="'+esc(state.searches[m.id]||'')+'" aria-label="Search '+esc(m.title)+'"><select data-sys-filter="'+esc(m.id)+'" aria-label="Filter '+esc(m.title)+' by status">'+statuses.map(s=>'<option value="'+esc(s)+'" '+((state.filters[m.id]||'All')===s?'selected':'')+'>'+esc(s)+'</option>').join('')+'</select></div></div><div class="sys-record-legend"><span>RECORD & SUBJECT</span><span>DATE / SCHEDULE</span><span>ASSIGNED</span><span>STATUS</span><span>OPEN</span></div><div id="sysResults" class="sys-records">'+moduleDataRows(state,m.id)+'</div><div class="sys-records-foot">Select a record to inspect details, evidence and timeline. Changes exist only in this browser session.</div></section>'+
 (selected?inspector(state,selected,role):'')+'</div>'+
 '<section class="sys-module-capabilities"><div><span class="sys-eyebrow">BUSINESS CAPABILITY</span><h2>Included workflow concepts</h2></div>'+moduleFeatureList(m)+'</section>'+
 '<dialog id="systemNewDialog" class="sys-modal"><form id="systemNewForm" class="sys-dialog-form"><div class="sys-modal-title"><div><span class="sys-eyebrow">SAMPLE DATA / INTAKE</span><h2>New '+esc(m.short.toLowerCase())+' entry</h2></div><button data-sys-close type="button" aria-label="Close dialog">×</button></div><p>Do not enter real names, personal details or financial information. This demonstration resets on reload.</p><input type="hidden" name="module" value="'+esc(m.id)+'"><label>Fictional record title<input required maxlength="80" name="title" placeholder="Sample entry / case label"></label><label>Fictional context<input required maxlength="100" name="subtitle" placeholder="Brief service or activity description"></label><label>Assigned desk / person<select name="owner"><option>Parish secretary</option><option>Records officer</option><option>Office administrator</option><option>Finance officer</option><option>Sample Priest A</option><option>Sample Priest B</option></select></label><div class="sys-modal-actions"><button class="sys-btn light" data-sys-close type="button">Cancel</button><button class="sys-btn solid" type="submit">Add fictional record</button></div></form></dialog>';
}
function portalExperience(state,cases){
 const own=state.portalRef?cases.find(c=>c.id===state.portalRef):null;
 const found=state.portalSearch?cases.find(c=>c.id.toLowerCase()===state.portalSearch.trim().toLowerCase()):own;
 const services=[['Baptismal certificate','certificate','Register verification and document release'],['Church wedding preparation','marriage','Documents, interview and readiness tracking'],['Incoming inquiry / letter','correspondence','Office correspondence routing']];
 return '<div class="sys-portal"><div class="sys-portal-nav"><div><span class="sys-portal-mark">✣</span><span><b>St. Gabriel Parish</b><small>Public parishioner services · fictional</small></span></div><span>HOME &nbsp;&nbsp; SERVICES &nbsp;&nbsp; SCHEDULES &nbsp;&nbsp; CONTACT</span></div><section class="sys-public-hero"><div><span>WELCOME TO OUR PARISH SERVICE DESK</span><h1>Less time in line.<br>More time for parish life.</h1><p>Browse requirements, register fictional inquiries and track office progress. No real request is ever submitted.</p><a href="#publicRequestForm" class="sys-btn solid">Start a demo request →</a></div><div class="sys-public-hero-art"><div class="sys-public-cross">✣</div><strong>Office hours</strong><p>Monday–Friday, 8:00 AM–5:00 PM</p><small>Sample hours · Confirm locally</small><span>SACRAMENTAL & ADMINISTRATIVE SERVICES</span></div></section><div class="sys-public-intro"><div><span class="sys-eyebrow">COMMON REQUESTS</span><h2>How can the parish office help you?</h2><p>Select a service to see a sample intake and requirements workflow.</p></div><div class="sys-service-grid">'+services.map(s=>'<button class="sys-service-card" type="button" data-sys-service="'+s[1]+'"><span>▣</span><strong>'+s[0]+'</strong><small>'+s[2]+'</small><em>Start request ↗</em></button>').join('')+'</div></div><div class="sys-public-bottom"><section class="sys-panel sys-public-form"><span class="sys-eyebrow">ONLINE REQUEST INTAKE</span><h2 id="publicRequestForm">Try a sample service request</h2><p>Use a fabricated title only. This creates a temporary case in the office queue, demonstrating the two connected sides of ParishOS.</p><form id="publicForm"><label>Service type<select name="kind" id="publicService"><option value="certificate">Sacramental certificate</option><option value="marriage">Wedding preparation</option><option value="correspondence">General office inquiry</option></select></label><label>Fictional requester label<input name="subject" maxlength="70" required placeholder="Sample Household Z" autocomplete="off"></label><button type="submit" class="sys-btn solid">Create demo request →</button></form></section><section class="sys-panel sys-public-track"><span class="sys-eyebrow">REQUEST STATUS</span><h2>Track a sample reference</h2><p>Type a DEMO reference from the office queue, or submit a sample request on the left.</p><label>Request number<input type="search" data-sys-portal-search value="'+esc(state.portalSearch||state.portalRef||'')+'" placeholder="e.g. CERT-0142" aria-label="Track fictional reference"></label>'+(found?'<div class="sys-tracking"><b>'+esc(found.id)+'</b><strong>'+esc(found.subject)+'</strong>'+badge(found.status)+'<small>Assigned: '+esc(found.owner)+'</small><span>'+esc(nextStep(found)?.title||'Simulated workflow complete')+'</span><button type="button" data-open="'+esc(found.id)+'" class="sys-link">Open office view ↗</button></div>':'<div class="sys-empty-track">No matching fictional request. Try CERT-0142 or create a demo entry.</div>')+'</section></div><div class="sys-public-footer">SAMPLE WEBSITE — NOT A REAL PARISH SERVICE PORTAL · All data fabricated.</div></div>';
}
function priestCompanion(state,role){
 const rows=getRecords(state,'priest_schedule');
 const pending=rows.filter(r=>r.status==='Proposed');
 const today=rows.filter(r=>r.owner==='Sample Priest A'&&!r.status.includes('Conflict'));
 return '<div class="sys-priest-wrap"><div class="sys-priest-copy"><span class="sys-eyebrow">SECONDARY EXPERIENCE / MOBILE PWA CONCEPT</span><h1>The priest’s day, in one place.</h1><p>Assignments originate from the secretariat, with proposed changes and conflict flags visible to the assigned priest. This is not the primary office dashboard.</p><div class="sys-priest-benefits"><div><b>01</b><span>See Masses, interviews and chapel visits without calling the desk.</span></div><div><b>02</b><span>Accept an office-proposed assignment in a mobile-first view.</span></div><div><b>03</b><span>Know when leave or travel creates a schedule conflict.</span></div></div><button data-nav="priest_schedule" class="sys-btn light">Open full office scheduling ↗</button></div><div class="sys-phone"><div class="sys-phone-top"><span>9:41</span><span>●●● ▰</span></div><div class="sys-phone-app"><div class="sys-phone-brand"><span>✣ PARISHOS</span><b>◌</b></div><small>FRIDAY · 13 NOVEMBER</small><h2>Good morning,<br>Father.</h2><p>St. Gabriel Parish · Sample account</p><div class="sys-phone-next"><span>YOUR NEXT ASSIGNMENT</span><strong>Sunday Mass</strong><b>7:00 AM · Main church</b><small>Celebrant: Sample Priest A</small></div><div class="sys-phone-section"><b>Upcoming assignments</b><span>THIS WEEK</span></div>'+today.map(x=>'<div class="sys-phone-item"><span>'+esc(x.date.split(' · ')[0])+'</span><div><strong>'+esc(x.title)+'</strong><small>'+esc(x.subtitle)+'</small></div><i>↗</i></div>').join('')+'<div class="sys-phone-section"><b>Awaiting your response</b><span>'+pending.length+' PENDING</span></div>'+pending.map(x=>'<div class="sys-phone-approval"><strong>'+esc(x.title)+'</strong><small>'+esc(x.date)+' · '+esc(x.owner)+'</small><button type="button" data-sys-phone-accept="'+esc(x.id)+'" '+(role!=='priest'?'disabled':'')+'>Accept sample assignment →</button></div>').join('')+'<div class="sys-phone-nav"><span>⌂<small>Home</small></span><span>▦<small>Calendar</small></span><span>✓<small>Approvals</small></span><span>◌<small>Profile</small></span></div></div></div></div>'+
 '<div class="sys-attention neutral"><strong>How to try this:</strong> Switch the simulated role to “Priest (secondary)” in the global top bar, accept an assignment here, then open the office scheduling module to see the same record updated. No actual notification is sent.</div>';
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
  const result=transition(r,role,new Date().toLocaleString('en-PH',{dateStyle:'medium',timeStyle:'short'}));
  if(!result.ok)return {message:result.error};
  state.records[i]=result.record;
  return {refresh:true,message:r.id+' updated to '+result.record.status+' (demo only).'};
 }
 if(button.dataset.sysCheck!==undefined){
  const id=button.dataset.sysCheck,index=Number(button.dataset.sysDoc);
  if(!Number.isInteger(index))return {message:'Invalid checklist reference.'};
  const rec=state.records.find(r=>r.id===id);if(!rec||!rec.docs[index])return {message:'No such document.'};
  const list=new Set(state.checked[id]||[]);
  if(list.has(index))list.delete(index);else list.add(index);
  state.checked[id]=[...list];
  rec.timeline.push({at:new Date().toLocaleString('en-PH',{dateStyle:'medium',timeStyle:'short'}),actor:'Demo '+role,event:'Supporting evidence checklist changed',note:rec.docs[index]+' · '+(list.has(index)?'Marked reviewed':'Review flag cleared')+'. Not a source record change.'});
  return {refresh:true,message:'Document checklist updated only for this demonstration.'};
 }
 if(button.dataset.sysReset!==undefined){state.records=createModuleData();state.selected={};state.checked={};state.filters={};state.searches={};state.portalRef=null;state.portalSearch='';return {refresh:true,message:'All fictional module records reset to the original showcase.'};}
 if(button.dataset.sysCreate!==undefined)return {openModal:'systemNewDialog'};
 if(button.dataset.sysClose!==undefined)return {closeModal:true};
 if(button.dataset.sysService!==undefined)return {portalService:button.dataset.sysService};
 if(button.dataset.sysReport!==undefined){
  const id=button.dataset.sysReport;
  const r=state.records.find(x=>x.id===id);
  const m=INDEX[id];
  const heading=r?r.id+' — '+r.title:m?m.title:'ParishOS';
  const rows=r?[r]:getRecords(state,id);
  const html='<div class="print-sheet"><div class="invalid-watermark">SAMPLE · INVALID</div><span class="eyebrow">PARISHOS · FICTIONAL REPORT</span><h2 id="printTitle">'+esc(heading)+'</h2><p>Generated for visual demonstration only. No official document, financial report or register is issued.</p>'+rows.map(x=>'<p><strong>'+esc(x.id)+'</strong> · '+esc(x.title)+' · '+esc(x.status)+'</p>').join('')+'<div class="paper-notice">NOT VALID · NO PARISH SEAL · NO OFFICIAL FINANCIAL OR CANONICAL AUTHORITY</div></div>';
  return {printHtml:html};
 }
 return null;
}
export function onShowcaseSubmit(form,state,role){
 if(form.id==='publicForm'){
  const fields=new FormData(form),kind=String(fields.get('kind')||'certificate'),subject=String(fields.get('subject')||'').trim();
  if(!subject||!['certificate','marriage','correspondence'].includes(kind))return {message:'Enter a fictional label and valid service.'};
  return {portalCase:{kind,subject}};
 }
 if(form.id==='systemNewForm'){
  const fields=new FormData(form),module=String(fields.get('module')),title=String(fields.get('title')||'').trim(),subtitle=String(fields.get('subtitle')||'').trim(),owner=String(fields.get('owner')||'Parish secretary');
  const mod=INDEX[module];
  if(!mod||!title||!subtitle)return {message:'Enter a fictional title and context.'};
  const id=module.toUpperCase().replace(/[^A-Z]/g,'').slice(0,4)+'-D'+String(state.records.length+1).padStart(3,'0');
  state.records.unshift({module,id,title,subtitle,owner,date:'13 Nov 2026',tag:'New sample',status:mod.steps[0],fields:[{label:'Source',value:'Unverified fictional intake'},{label:'Office decision',value:'Pending'}],docs:['Intake reference','Staff follow-up'],timeline:[{at:new Date().toLocaleString('en-PH',{dateStyle:'medium',timeStyle:'short'}),actor:'Demo '+role,event:'Fictional module entry created',note:'No data sent to a server or persisted.'}]});
  state.selected[module]=id;
  return {refresh:true,closeModal:true,message:id+' added for this browser session. No data was sent.'};
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
