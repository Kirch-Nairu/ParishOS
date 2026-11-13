// ParishOS R3 — synthetic, transient parish office product-demonstration dataset.
// Every person, reference and financial entry is fictional. No live canonical or diocesan authority.
export const CATALOG = [
 {id:'registry',title:'Sacramental registry',short:'Registers',section:'Sacraments & records',icon:'◫',priority:'Essential',
  subtitle:'Baptism, confirmation, marriage and death indexes',summary:'Locate the originating register, inspect annotations and prepare an authorized records workflow.',
  columns:['Register reference','Record / event','Register type','Custodian','Status'],kpis:['Indexed records','Annotation reviews','Volume references'],features:['Baptism & confirmation registers','Marriage & death entries','Annotation review trail','Volume / page / entry traceability'],steps:['Indexed','Review requested','Review queued']},
 {id:'baptism',title:'Baptism management',short:'Baptisms',section:'Sacraments & records',icon:'◉',priority:'Essential',
  subtitle:'Child and adult requests, sponsors and preparation',summary:'Coordinate requirements, godparents, preparation and schedules before separate register follow-up.',
  columns:['Booking reference','Applicant / household','Category','Coordinator','Status'],kpis:['New applications','Preparations pending','Bookings scheduled'],features:['Infant / adult applications','Godparent documents','Preparation & sponsor checks','Schedule and register follow-up'],steps:['Intake','Requirements checked','Preparation arranged','Scheduled (demo)']},
 {id:'intentions',title:'Mass intentions',short:'Mass intentions',section:'Sacraments & records',icon:'✣',priority:'Essential',
  subtitle:'Intentions, offerings and actual fulfillment',summary:'Maintain an obligation ledger in which a recorded offering never counts as a celebrated Mass.',
  columns:['Obligation no.','Intention','Celebration date','Assigned celebrant','Status'],kpis:['Unfulfilled intentions','Celebrations assigned','Fulfilled intentions'],features:['Individual intention ledger','Requested date and celebrant','Offering classification','Fulfillment recorded separately'],steps:['Requested','Assigned','Celebrated (demo)']},
 {id:'collections',title:'Collections & donations',short:'Collections & donations',section:'Finance & stewardship',icon:'₱',priority:'Essential',
  subtitle:'Mass collections, gifts and purpose-restricted funds',summary:'Separate counting, stewardship and deposit confirmation. Restricted gifts stay restricted.',
  columns:['Receipt reference','Collection / donor','Fund category','Counter / custodian','Status'],kpis:['Unreconciled entries','Restricted donations','Reconciled collections'],features:['Offertory count sheets','Restricted fund purposes','Deposit reconciliation','Donation acknowledgements'],steps:['Logged','Count verified','Deposit matched (demo)']},
 {id:'public',title:'Parishioner portal',short:'Parishioner portal',section:'Public & outreach',icon:'◎',priority:'Essential',
  subtitle:'Public service requests, requirements and tracking',summary:'Give parishioners a clear path to submit requests, check requirements and follow up with the office.',
  columns:[],kpis:[],features:['Service catalogue & requirements','Submit service request','Track request status','Parish announcements & office hours'],steps:[]},
 {id:'funerals',title:'Funerals & sick calls',short:'Funerals & sick calls',section:'Pastoral & people',icon:'✚',priority:'High',
  subtitle:'Sensitive urgent intake and priest coordination',summary:'Record minimum necessary details, triage urgency, assign a responder and follow through respectfully.',
  columns:['Request reference','Pastoral request','Urgency','Responding coordinator','Status'],kpis:['Awaiting response','Urgent dispatches','Assigned pastoral calls'],features:['Urgency classification','On-call priest assignment','Coordination and follow-up','Minimal-data privacy protections'],steps:['New','Contacted','Priest assigned','Closed (demo)']},
 {id:'catechism',title:'Catechism & seminars',short:'Catechism & seminars',section:'Pastoral & people',icon:'▤',priority:'High',
  subtitle:'Batches, attendance, preparation and completion',summary:'Manage Pre-Cana, baptism preparation, First Communion and confirmation cohorts.',
  columns:['Batch / session','Formation programme','Participants','Facilitator','Status'],kpis:['Open formation batches','Participants registered','Sessions complete'],features:['Participant rosters','Batch calendars','Attendance','Completion evidence'],steps:['Registration','Attendance open','Completed (preview)']},
 {id:'chapels',title:'Barangay chapels & BECs',short:'Chapels & BECs',section:'Pastoral & people',icon:'⌂',priority:'High',
  subtitle:'Chapel calendars, service coverage and coordinators',summary:'Coordinate outlying chapel Masses, priest visits and Basic Ecclesial Community activities.',
  columns:['Chapel reference','Community / chapel','Area','Coordinator','Status'],kpis:['Chapel activities','Priest visits pending','Visits confirmed'],features:['Barangay chapel directory','BEC coordinators','Travel-aware priest assignments','Chapel program calendar'],steps:['Planned','Coordinator contacted','Coverage confirmed']},
 {id:'ministries',title:'Ministry management',short:'Ministries & rosters',section:'Pastoral & people',icon:'♙',priority:'High',
  subtitle:'Lectors, altar servers, choirs and volunteers',summary:'Publish coordinated ministry duty rosters and track substitutions without manual phone chains.',
  columns:['Roster reference','Ministry / team','Date / event','Coordinator','Status'],kpis:['Draft rosters','Volunteer assignments','Published schedules'],features:['Member directories','Duty rosters','Substitution requests','Coordinator updates'],steps:['Draft','Assignments reviewed','Published (demo)']},
 {id:'announcements',title:'Parish announcements',short:'Announcements',section:'Public & outreach',icon:'◖',priority:'High',
  subtitle:'Mass changes, feast days and advisories',summary:'Draft, schedule and preview parish notices for public-facing channels.',
  columns:['Notice reference','Announcement','Publish window','Editor','Status'],kpis:['Pending notices','Scheduled advisories','Published notices'],features:['Mass schedule changes','Feast day announcements','Scheduled publishing','Public preview'],steps:['Draft','Scheduled','Published (demo)']},
 {id:'facilities',title:'Facilities & inventory',short:'Facilities & inventory',section:'Finance & stewardship',icon:'▧',priority:'Secondary',
  subtitle:'Rooms, church equipment, maintenance and supplies',summary:'Route hall bookings, low-stock supplies and work orders to the appropriate office custodian.',
  columns:['Asset / request','Facility or supply','Type','Custodian','Status'],kpis:['Open work orders','Pending bookings','Low-stock items'],features:['Church hall reservations','Equipment custody','Maintenance tickets','Supply requisitions'],steps:['Requested','Reviewed','Scheduled / ordered']},
 {id:'rectory',title:'Rectory administration',short:'Rectory operations',section:'Finance & stewardship',icon:'⌑',priority:'Secondary',
  subtitle:'Household needs, procurement and staff tasks',summary:'Keep rectory repairs, procurement and routine operational responsibilities accountable.',
  columns:['Admin reference','Administrative item','Category','Assigned staff','Status'],kpis:['Tasks assigned','Procurement drafts','Completed tasks'],features:['Household expense requests','Repairs and maintenance','Office procurement','Assigned staff tasks'],steps:['Logged','Assigned','Completed (preview)']},
 {id:'diocese',title:'Diocesan coordination',short:'Diocesan coordination',section:'Finance & stewardship',icon:'⇥',priority:'Secondary',
  subtitle:'Circulars, returns, referrals and remittance',summary:'Track reports and official correspondence sent to diocesan offices without inventing prescribed templates.',
  columns:['Reference','Reporting / referral item','Category','Owner','Status'],kpis:['Reports due','Referrals pending','Submitted reports'],features:['Incoming circular register','Diocesan referrals','Configurable return templates','Remittance traceability'],steps:['Draft','Reviewed','Submitted (demo)']},
 {id:'personnel',title:'Personnel administration',short:'Personnel',section:'Pastoral & people',icon:'♧',priority:'Secondary',
  subtitle:'Parish workers, leave and responsibility coverage',summary:'Coordinate parish employees and authorized office assignments with minimum necessary information.',
  columns:['Personnel ref','Staff coordination item','Type','Owner','Status'],kpis:['Staffing requests','Leave covers','Reviewed assignments'],features:['Employee work rosters','Leave and substitution','Assigned office responsibilities','Limited HR documentation'],steps:['Submitted','Office reviewed','Approved (demo)']},
 {id:'cemetery',title:'Cemetery / columbarium',short:'Cemetery / columbarium',section:'Optional services',icon:'◇',priority:'Optional',
  subtitle:'Interment bookings and plot/niche administration',summary:'Manage interment inquiries, reservations and niche records where the parish operates these facilities.',
  columns:['Booking reference','Interment inquiry','Site / niche','Custodian','Status'],kpis:['Active inquiries','Documents needed','Reserved sites'],features:['Burial inquiry','Niche or plot availability','Interment scheduling','Custody and document references'],steps:['Inquiry','Requirements checked','Reserved (demo)']},
 {id:'priest_schedule',title:'Priest scheduling',short:'Priest assignments',section:'Pastoral & people',icon:'◷',priority:'Essential',
  subtitle:'Personal calendars, leave, conflicts and covering priests',summary:'The rectory office proposes assignments; the priest confirms them through a secondary mobile experience.',
  columns:['Assignment','Celebration / visit','Time / place','Priest','Status'],kpis:['Pending acceptance','Conflicts flagged','Confirmed assignments'],features:['Priest-specific calendar','Leave and out-of-parish time','Scheduling conflict checks','Mobile acceptance / reassignment'],steps:['Proposed','Accepted (demo)']},
 {id:'finance',title:'Parish finance',short:'Finance & budgets',section:'Finance & stewardship',icon:'▦',priority:'High',
  subtitle:'Budgets, approvals, vouchers and reconciliations',summary:'Manage expenses, budget approvals and restricted funds through an accountable parish workflow.',
  columns:['Voucher reference','Purpose / payee','Fund / amount','Accountable officer','Status'],kpis:['Vouchers pending','Budget categories','Reconciled entries'],features:['Expense voucher queue','Approval controls','Restricted fund allocation','Monthly reconciliation & reports'],steps:['Draft','For approval','Approved (demo)']},
 {id:'priest',title:'Priest companion',short:'Priest companion',section:'Clergy & mobility',icon:'◉',priority:'Essential',
  subtitle:'A mobile-first itinerary and delegated actions',summary:'A mobile companion for clergy schedules, assignments, pastoral visits and pending approvals.',
  columns:[],kpis:[],features:['Daily schedule','Mobile approvals','Conflict alerts','Assigned visits & travel details'],steps:[]}
];

export const INDEX = Object.fromEntries(CATALOG.map(m=>[m.id,m]));
const record=(module,id,title,subtitle,status,owner,date,tag,fields,docs=[])=>({
 module,id,title,subtitle,status,owner,date,tag,
 fields:Object.entries(fields).map(([label,value])=>({label,value:String(value)})),
 docs,
 timeline:[{at:'13 Nov 2026 · 08:30',actor:'Parish office',event:'Record received',note:'Initial register entry'}]
});
export function createModuleData(){
 return [
  record('registry','REG-B-142','Ana Reyes','Baptism — volume 02 / page 18 / entry 004','Indexed','Records officer','12 Nov 2026','Baptism',{Register:'Baptism',Volume:'02',Page:'18',Entry:'004',Annotations:'Check before issuance',Custody:'Original parish register'},['Source register index','Related annotation review']),
  record('registry','REG-C-089','Luis Fernandez','Confirmation — volume 01 / page 42 / entry 011','Review requested','Records officer','11 Nov 2026','Confirmation',{Register:'Confirmation',Volume:'01',Page:'42',Entry:'011',Annotations:'Pending annotation review',Custody:'Register archive'},['Confirmation register']),
  record('registry','REG-M-044','Marco and Julia Santos','Marriage — volume 03 / page 06 / entry 002','Indexed','Records officer','10 Nov 2026','Marriage',{Register:'Marriage',Volume:'03',Page:'06',Entry:'002',Banns:'Reference only',Custody:'Original register'},['Marriage register']),
  record('registry','REG-D-014','Pedro Garcia','Death — volume 04 / page 22 / entry 018','Indexed','Records officer','09 Nov 2026','Death',{Register:'Death',Volume:'04',Page:'22',Entry:'018',Custody:'Original register',Note:'Parish register reference only'},['Death record index']),
  record('baptism','BAP-026','Sofia Reyes','Infant baptism · requested by Reyes family','Intake','Parish secretary','21 Nov 2026','Child',{Sponsor:'Rafael Reyes',Parents:'Fictional Household A',Preparation:'Pending orientation',Booking:'Tentative',RegistryFollowUp:'Not started'},['Parent inquiry','Sponsor eligibility checklist','Baptism preparation']),
  record('baptism','BAP-027','Miguel Valdez','Adult baptism preparation','Requirements checked','Catechism coordinator','28 Nov 2026','Adult',{Sponsor:'Elena Valdez',Preparation:'In progress',Interview:'Required',RegistryFollowUp:'Not started'},['Formation record','Sponsor form']),
  record('baptism','BAP-028','Isabella Navarro','Barangay chapel baptism','Preparation arranged','Parish secretary','05 Dec 2026','Child',{Sponsor:'Maria Navarro',Venue:'Barangay chapel',Preparation:'Completed (preview)',RegistryFollowUp:'Not yet recorded'},['Requirements checklist','Preparation attendance']),
  record('intentions','MI-2601','Thanksgiving for a family','Requested for Sunday Mass','Requested','Mass intention clerk','15 Nov · 07:00','Thanksgiving',{Offering:'₱100',Assignee:'Unassigned',Obligation:'Unfulfilled',Posting:'Not financial settlement'},['Intention request']),
  record('intentions','MI-2602','For the faithful departed','Evening Mass intention','Assigned','Fr. Mateo Cruz','16 Nov · 18:00','Deceased',{Offering:'No offering recorded',Assignee:'Fr. Mateo Cruz',Obligation:'Unfulfilled',Posted:'No'},['Assignment memorandum']),
  record('intentions','MI-2603','Special petition','Celebration recorded','Celebrated (demo)','Fr. Gabriel Santos','12 Nov · 06:00','Petition',{Offering:'₱50',Obligation:'Sample fulfilled',Posted:'No real record'},['Fulfillment note']),
  record('collections','COL-112','Sunday 7:00 AM offertory','Mass collection count sheet','Logged','Cash count team','15 Nov 2026','Unrestricted',{Amount:'₱8,250.00',Classification:'General offertory',Fund:'Unrestricted',Deposit:'Not matched'},['Collection count sheet','Counting witnesses']),
  record('collections','DON-043','Roof restoration contribution','Restricted-project donation','Count verified','Finance officer','13 Nov 2026','Restricted',{Amount:'₱12,000.00',Classification:'Restricted gift',Purpose:'Roof restoration only',Deposit:'Pending'},['Donation acknowledgement','Fund designation']),
  record('collections','COL-113','Saturday evening offertory','Mass collection count sheet','Deposit matched (demo)','Finance officer','14 Nov 2026','Unrestricted',{Amount:'₱4,620.00',Fund:'General parish fund',Deposit:'Deposit reference matched'},['Count sheet','Deposit matching reference']),
  record('funerals','PAS-038','Urgent home sick call','Parishioner requires pastoral visit','New','On-call secretary','13 Nov · ASAP','Urgent',{Urgency:'Urgent',Area:'Barangay 03',Contact:'Held in confidential office record (not shown)',Priest:'Not yet assigned'},['Minimum detail request']),
  record('funerals','FUN-012','Funeral liturgy coordination','Garcia family','Contacted','Parish secretary','16 Nov · 10:00','Funeral',{Urgency:'Scheduled',Location:'Main church',Priest:'Pending acceptance',Documentation:'External civil docs not issued here'},['Family request','Service requirements']),
  record('funerals','PAS-039','Homebound communion visit','Navarro family','Priest assigned','Pastoral coordinator','17 Nov · 14:00','Visit',{Urgency:'Normal',Area:'Barangay chapel area',Priest:'Fr. Gabriel Santos',Content:'Restricted pastoral details'},['Coordination reference']),
  record('catechism','CAT-018','First Communion Batch A','Children’s Sunday formation','Attendance open','Catechetical coordinator','Sundays · 09:00','31 registrants',{Participants:'31 participants',Attendance:'27 present last session',Coordinator:'Catechist Maria',Completion:'Pending'},['Class roster','Attendance register']),
  record('catechism','SEM-011','Marriage preparation / Pre-Cana','Saturday seminar cohort','Registration','Formation facilitator','21 Nov · 08:00','12 couples',{Participants:'12 couples',Attendance:'Not yet recorded',Coordinator:'Formation facilitator',Completion:'Pending'},['Registration forms','Session schedule']),
  record('catechism','CAT-019','Confirmation Class B','Weekend cohort','Completed (preview)','Catechetical coordinator','12 Nov · 13:00','24 registrants',{Participants:'24 students',Attendance:'Complete (demo)',Coordinator:'Catechist Teresa'},['Attendance summary']),
  record('chapels','BEC-006','Barangay North Chapel','Sunday pastoral visit and community Mass','Planned','Chapel coordinator A','22 Nov · 06:00','Chapel',{Area:'Barangay North',Celebrant:'Unassigned',Travel:'25-min sample travel buffer',Contact:'Chapel coordinator A'},['Chapel calendar','Local coordinator brief']),
  record('chapels','BEC-009','Barangay Riverside Chapel','BEC formation and prayer meeting','Coordinator contacted','Chapel coordinator B','18 Nov · 16:00','BEC',{Area:'Barangay Riverside',Celebrant:'Fr. Gabriel Santos',Facility:'Chapel hall',Contact:'Chapel coordinator B'},['BEC meeting notes']),
  record('chapels','BEC-012','Barangay Hill Chapel','Monthly visit coordination','Coverage confirmed','Chapel coordinator C','29 Nov · 08:00','Chapel',{Area:'Barangay Hill',Celebrant:'Fr. Mateo Cruz',Travel:'45-minute buffer'},['Duty schedule']),
  record('ministries','MIN-074','Sunday 7 AM lector roster','Reader and psalmist duty allocations','Draft','Liturgy coordinator','15 Nov · 07:00','Lectors',{Members:'6 assigned',Vacancies:'1 substitute',Venue:'Main church'},['Duty roster','Substitute requests']),
  record('ministries','MIN-075','Choir service plan','Feast-day singers and instrumentation','Assignments reviewed','Choir coordinator','21 Nov · 18:00','Choir',{Members:'14 planned',Vacancies:'None',Venue:'Main church'},['Duty roster']),
  record('ministries','MIN-076','Altar server schedule','Weekend formation and assignments','Published (demo)','Altar server leader','22 Nov · 09:00','Servers',{Members:'8 assigned',Vacancies:'None',Venue:'Main church'},['Duty roster']),
  record('announcements','ANN-021','Advent schedule consultation','Draft Mass and event schedule changes','Draft','Parish secretary','20 Nov 2026','Schedule',{Channel:'Notice board + parish page',Audience:'All parishioners',Publish:'Not yet scheduled'},['Editorial copy','Schedule source']),
  record('announcements','ANN-022','Chapel outreach advisory','Barangay outreach advisory','Scheduled','Pastoral secretary','16 Nov 2026','Advisory',{Channel:'Church notice board',Audience:'Chapels & BECs',Publish:'16 November — demo'},['Announcement draft']),
  record('announcements','ANN-023','Office document window notice','Parish office hours information','Published (demo)','Parish secretary','13 Nov 2026','Office',{Channel:'Portal preview',Audience:'Walk-in parishioners',Publish:'Simulation only'},['Notice draft']),
  record('facilities','FAC-042','Pastoral hall reservation','Pre-Cana seminar room request','Requested','Office administrator','21 Nov · 08:00','Booking',{Facility:'Pastoral Hall',Capacity:'70 persons',Conflict:'None in sample calendar'},['Room request']),
  record('facilities','INV-011','Sacristy supplies reorder','Candles and maintenance supplies','Reviewed','Store custodian','17 Nov 2026','Inventory',{Item:'Candles',Stock:'8 packs remaining',Threshold:'10 packs',Requested:'12 packs'},['Stock count','Purchase request']),
  record('facilities','MNT-023','Chapel roof inspection','Preventive maintenance work order','Scheduled / ordered','Maintenance custodian','19 Nov 2026','Maintenance',{Facility:'North chapel',Priority:'Normal',Work:'Visual inspection'},['Maintenance order']),
  record('rectory','REC-022','Rectory water system repair','Maintenance assignment','Logged','Office administrator','18 Nov 2026','Maintenance',{Location:'Rectory utilities',Priority:'Normal',Estimate:'₱1,400'},['Maintenance ticket']),
  record('rectory','REC-023','Office printer consumables','Procurement draft','Assigned','Office clerk','17 Nov 2026','Procurement',{Item:'Printer toner',Quantity:'2 units',Approval:'Pending'},['Requisition form']),
  record('rectory','REC-024','Kitchen provisions schedule','Routine household coordination','Completed (preview)','Rectory staff','14 Nov 2026','Household',{Category:'Household supplies',Budget:'Household supplies budget'},['Task record']),
  record('diocese','DIO-014','Monthly finance return','Illustrative diocesan reporting item','Draft','Parish finance officer','30 Nov 2026','Report',{Template:'Pending diocesan confirmation',Period:'November 2026',Authorization:'Unknown local policy'},['Draft report cover']),
  record('diocese','DIO-015','Sacramental reference inquiry','Parish-to-diocese referral','Reviewed','Records officer','18 Nov 2026','Referral',{Office:'Diocesan chancery',Scope:'Records clarification',Authority:'Requires local policy'},['Referral letter']),
  record('diocese','DIO-016','Circular acknowledgement','Incoming diocesan circular','Submitted (demo)','Office administrator','12 Nov 2026','Circular',{Office:'Diocesan office',Scope:'Administrative update',Authority:'Pending original document'},['Circular acknowledgement']),
  record('personnel','PER-041','Secretary leave coverage','Office reception coverage request','Submitted','Office administrator','23–25 Nov','Leave',{AffectedTeam:'Parish secretariat',Coverage:'Office clerk proposed',Approval:'Not given'},['Leave request']),
  record('personnel','PER-042','Weekend office duty roster','Staff shift coordination','Office reviewed','Office administrator','21–22 Nov','Roster',{AffectedTeam:'Front desk',Coverage:'3 staff members',Approval:'Pending'},['Shift roster']),
  record('personnel','PER-043','Volunteer orientation','Staff and ministry briefing','Approved (demo)','Office administrator','14 Nov 2026','Training',{AffectedTeam:'Volunteers',Coverage:'12 participants'},['Orientation log']),
  record('cemetery','CEM-008','Navarro family interment inquiry','Parish-operated cemetery (if available)','Inquiry','Cemetery clerk','20 Nov 2026','Burial',{Location:'Section A',Niche:'Not reserved',Availability:'Requires office check'},['Inquiry form','Document checklist']),
  record('cemetery','CEM-009','Luna family columbarium request','Optional niche availability','Requirements checked','Cemetery clerk','25 Nov 2026','Columbarium',{Location:'Wall B',Niche:'Tentative',Availability:'Not confirmed'},['Niche inquiry','Requirements checklist']),
  record('cemetery','CEM-010','Memorial schedule inquiry','Sample cemetery service booking','Reserved (demo)','Parish office','28 Nov 2026','Memorial',{Location:'Memorial hall',Niche:'Not applicable',Availability:'Demo hold only'},['Booking reference']),
  record('priest_schedule','PS-101','Sunday morning Mass','Main church · 07:00–08:00','Accepted (demo)','Fr. Mateo Cruz','15 Nov · 07:00','Mass',{Venue:'Main church',Time:'07:00–08:00',Preparation:'30 min',Travel:'None'},['Weekly celebration roster']),
  record('priest_schedule','PS-102','Chapel blessing assignment','Barangay North · 10:00–11:00','Proposed','Fr. Gabriel Santos','16 Nov · 10:00','Blessing',{Venue:'North Chapel',Time:'10:00–11:00',Preparation:'15 min',Travel:'25 min'},['Assignment request','Chapel contact']),
  record('priest_schedule','PS-103','Marriage canonical interview','Parish office · 11:30–12:15','Proposed','Fr. Mateo Cruz','17 Nov · 11:30','Interview',{Venue:'Parish office',Time:'11:30–12:15',Preparation:'15 min',Travel:'None'},['Interview schedule']),
  record('priest_schedule','PS-104','Diocesan recollection','Out-of-parish blocked availability','Conflict','Fr. Mateo Cruz','17 Nov · 11:00','Leave / duty',{Venue:'Diocesan center',Time:'11:00–15:00',Conflict:'Overlaps PS-103',Travel:'45-minute buffer'},['Availability block']),
  record('finance','FIN-083','Office supplies voucher','Printer paper and archive folders','Draft','Finance officer','17 Nov 2026','Unrestricted',{Amount:'₱1,450.00',Fund:'General administration',Approval:'Not recorded',Payment:'Payment not initiated'},['Expense voucher','Supply request']),
  record('finance','FIN-084','Chapel roof repair approval','Project-specific expense request','For approval','Office administrator','21 Nov 2026','Restricted',{Amount:'₱4,600.00',Fund:'Roof restoration only',Approval:'Pending',Payment:'Payment not initiated'},['Project request','Budget line']),
  record('finance','FIN-085','Utilities expense reconciliation','Recorded office utility bill','Approved (demo)','Finance officer','13 Nov 2026','Unrestricted',{Amount:'₱2,340.00',Fund:'Office utilities',Approval:'Simulated',Payment:'Payment not initiated'},['Voucher','Sample receipt']),
 ];
}
export const FLOW_ROLES={
 registry:['records','administrator'], baptism:['secretary','administrator'],intentions:['secretary','priest','administrator'],collections:['finance','administrator'],
 funerals:['secretary','administrator','priest'],catechism:['clerk','administrator','secretary'],chapels:['secretary','administrator','priest'],
 ministries:['clerk','administrator','secretary'],announcements:['secretary','administrator'],facilities:['administrator','clerk'],rectory:['administrator','clerk'],
 diocese:['administrator','records','finance'],personnel:['administrator'],cemetery:['administrator','clerk'],priest_schedule:['priest','administrator'],finance:['administrator','finance']
};
export function nextStatus(record){
 const mod=INDEX[record.module];
 if(!mod||!mod.steps.length)return null;
 const i=mod.steps.indexOf(record.status);
 return i>=0 && i<mod.steps.length-1?mod.steps[i+1]:null;
}
export function transition(record,role,now='13 Nov 2026 · 16:00'){
 const next=nextStatus(record);
 if(!next)return {ok:false,error:'There is no available next step for this record.'};
 if(!(FLOW_ROLES[record.module]||[]).includes(role))return {ok:false,error:'The selected demo role is not assigned to this workflow.'};
 if(record.module==='priest_schedule'&&record.status==='Conflict')return {ok:false,error:'Resolve the overlapping duty before accepting.'};
 if(record.module==='priest_schedule'&&record.status==='Proposed'&&role!=='priest')return {ok:false,error:'Only the selected priest persona can accept this proposed assignment in the demo.'};
 if(record.module==='finance'&&record.status==='For approval'&&role!=='administrator')return {ok:false,error:'A distinct simulated office administrator must review this voucher. The finance clerk cannot self-approve.'};
 if(record.module==='registry'&&next==='Review queued'&&role!=='records')return {ok:false,error:'Only the records desk may queue register annotation review.'};
 if(record.module==='intentions'&&record.status==='Requested'&&!record.fields.some(f=>f.label==='Assignee'&&/^(?:Fr\. Mateo Cruz|Fr\. Gabriel Santos)$/.test(f.value)))return {ok:false,error:'Assign a fictional celebrant before proceeding.'};
 if(record.module==='intentions'&&record.status==='Assigned'&&!['priest','administrator'].includes(role))return {ok:false,error:'Mass fulfillment requires separate celebrant/authorized office attestation in this demonstration.'};
 if(record.module==='collections'&&record.status==='Count verified'&&!record.fields.some(f=>f.label==='Deposit'&&/^Matched \(demo\) · SAMPLE-/i.test(f.value)))return {ok:false,error:'A separate fictional deposit reference is required for reconciliation.'};
 const before=record.status;
 const copy={...record,status:next, timeline:[...record.timeline,{at:now,actor:'Demo '+role,event:'Moved to '+next,note:'Simulated transition: '+before+' → '+next+'. No external or canonical state changed.'}]};
 return {ok:true,record:copy};
}
