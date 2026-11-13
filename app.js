/* ParishOS NEST R1 — self-contained showcase. No API, storage, or live parish records. */
(function () {
  'use strict';

  const iconPaths = {
    'x':'<path d="M18 6 6 18M6 6l12 12"/>',
    'menu':'<path d="M4 7h16M4 12h16M4 17h16"/>',
    'church':'<path d="M12 2v5m-3-2h6M4 22V10l8-4 8 4v12M2 22h20M9 22v-7h6v7M8 12h.01M16 12h.01"/>',
    'chevrons-up-down':'<path d="m7 10 5-5 5 5m-10 4 5 5 5-5"/>',
    'layout-dashboard':'<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
    'inbox':'<path d="M4 4h16l2 12v4H2v-4L4 4Z"/><path d="M2 16h6l2 3h4l2-3h6"/>',
    'book-open':'<path d="M12 7v14M3 18V5a2 2 0 0 1 2-2h2c2.5 0 5 1 5 4 0-3 2.5-4 5-4h2a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2h-2c-2.5 0-5 .2-5 1-0-.8-2.5-1-5-1H5a2 2 0 0 1-2-2Z"/>',
    'calendar-days':'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>',
    'heart-handshake':'<path d="M20 13 12 21l-8-8a5 5 0 0 1 7-7l1 1 1-1a5 5 0 0 1 7 7Z"/>',
    'hand-heart':'<path d="M3 15c2-2 4-2 6-1l3 2h4a2 2 0 0 1 0 4H9l-5-2-2 1M12 8l3 3 3-3a3 3 0 0 0-3-5 3 3 0 0 0-3 5Z"/>',
    'file-badge':'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h8m0-20 6 6h-6V2ZM8 13h5M8 17h3"/><circle cx="17" cy="17" r="4"/><path d="m15 17 1.4 1.4L19 16"/>',
    'wallet':'<rect x="2" y="5" width="20" height="16" rx="2"/><path d="M2 9h20M17 15h2M5 5V3h14"/>',
    'users':'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m18 0v-2a4 4 0 0 0-3-3.87M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8-7.87a4 4 0 0 1 0 7.75"/>',
    'shield-check':'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
    'arrow-up-right':'<path d="M7 17 17 7M8 7h9v9"/>',
    'arrow-right':'<path d="M5 12h14m-6-6 6 6-6 6"/>',
    'more-horizontal':'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
    'search':'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    'bell':'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4"/>',
    'info':'<circle cx="12" cy="12" r="10"/><path d="M12 11v6M12 7h.01"/>',
    'plus':'<path d="M12 5v14M5 12h14"/>',
    'file-check':'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z"/><path d="M14 2v6h6m-12 8 2 2 4-4"/>',
    'calendar-check':'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18m-12 6 2 2 4-4"/>',
    'lock-keyhole':'<rect x="4" y="10" width="16" height="12" rx="2"/><path d="M8 10V6a4 4 0 0 1 8 0v4m-4 5v2"/>',
    'sparkles':'<path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3Zm7 14 .6 1.4L21 19l-1.4.6L19 21l-.6-1.4L17 19l1.4-.6L19 17Z"/>',
    'clipboard-plus':'<rect x="5" y="4" width="14" height="18" rx="2"/><path d="M9 4V2h6v2M12 10v7m-3-3.5h6"/>',
    'file-text':'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z"/><path d="M14 2v6h6M8 13h8M8 17h8"/>',
    'droplets':'<path d="M12 2s-7 8-7 13a7 7 0 0 0 14 0c0-5-7-13-7-13ZM9 16a3 3 0 0 0 3 3"/>',
    'scroll-text':'<path d="M18 18h-8a4 4 0 0 1-4-4V4h14v14a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4v-2h8v2M9 8h8M9 12h8"/>',
    'rings':'<circle cx="9" cy="13" r="6"/><circle cx="16" cy="11" r="6"/>',
    'alert-circle':'<circle cx="12" cy="12" r="10"/><path d="M12 7v6m0 4h.01"/>',
    'map-pin':'<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2"/>',
    'hand-heart':'<path d="M3 15c2-2 4-2 6-1l3 2h4a2 2 0 0 1 0 4H9l-5-2-2 1M12 8l3 3 3-3a3 3 0 0 0-3-5 3 3 0 0 0-3 5Z"/>',
    'eye':'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    'shield-alert':'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="M12 8v5m0 3h.01"/>'
  };

  function fillIcons() {
    document.querySelectorAll('[data-icon]').forEach(function (el) {
      const name = el.getAttribute('data-icon');
      el.innerHTML = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + (iconPaths[name] || iconPaths.info) + '</svg>';
    });
  }
  const $ = function (selector) { return document.querySelector(selector); };
  const $$ = function (selector) { return Array.from(document.querySelectorAll(selector)); };
  const safe = function (value) { return String(value).replace(/[&<>"']/g, function (char) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]; }); };

  const navigation = {
    overview:'Overview',requests:'Service requests',records:'Sacramental records',
    calendar:'Parish calendar',intentions:'Mass intentions',documents:'Certificates & files',
    finance:'Finance overview',ministries:'Ministries & BECs'
  };
  const requests = [
    {id:'DEM-001',name:'Sample Person A',service:'Baptismal certificate',date:'12 Nov',status:'For review'},
    {id:'DEM-002',name:'Sample Family B',service:'Church wedding inquiry',date:'11 Nov',status:'In progress'},
    {id:'DEM-003',name:'Sample Person C',service:'Confirmation certificate',date:'10 Nov',status:'Ready'},
    {id:'DEM-004',name:'Sample Person D',service:'Mass intention',date:'09 Nov',status:'For review'},
    {id:'DEM-005',name:'Sample Group E',service:'Parish facility request',date:'08 Nov',status:'In progress'},
    {id:'DEM-006',name:'Sample Person F',service:'Pastoral visit',date:'07 Nov',status:'Ready'}
  ];
  const intentions = [
    {id:'INT-001',title:'Thanksgiving for a family',date:'16 Nov',status:'Requested'},
    {id:'INT-002',title:'For the departed',date:'17 Nov',status:'Assigned'},
    {id:'INT-003',title:'Special petition',date:'15 Nov',status:'Celebrated'}
  ];
  let activeView = 'overview';
  let recentFilter = 'All';
  let lastFocus = null;
  let toastTimer;

  function closeSidebar() {
    $('#sidebar').classList.remove('is-open');
    $('#backdrop').hidden = true;
    $('#menuToggle').setAttribute('aria-expanded', 'false');
    document.body.classList.remove('drawer-open');
  }
  function openSidebar() {
    $('#sidebar').classList.add('is-open');
    $('#backdrop').hidden = false;
    $('#menuToggle').setAttribute('aria-expanded', 'true');
    $('#closeSidebar').focus();
  }
  function navigate(view) {
    if (!Object.prototype.hasOwnProperty.call(navigation, view)) return;
    activeView = view;
    $$('.view').forEach(function (section) { section.classList.toggle('is-visible', section.id === 'view-' + view); });
    $$('[data-nav]').forEach(function (button) {
      const selected = button.dataset.nav === view;
      button.classList.toggle('is-active', selected);
      if (selected) button.setAttribute('aria-current','page'); else button.removeAttribute('aria-current');
    });
    $('#breadcrumb').textContent = navigation[view];
    document.title = navigation[view] + ' · ParishOS Demo';
    closeSidebar();
    window.scrollTo({top:0,behavior:'instant'});
    $('#mainContent').focus({preventScroll:true});
    if (view === 'requests') renderAllRequests();
  }
  function statusClass(status) {
    return ({'For review':'pending','In progress':'progress','Ready':'ready','Completed':'done','Requested':'pending','Assigned':'progress','Celebrated':'done'})[status] || 'pending';
  }
  function renderRequest(item, includeDate) {
    const isDone = item.status === 'Completed';
    return '<tr><td><strong>' + safe(item.name) + '</strong><small>' + safe(item.id) + '</small></td>' +
      '<td class="type-cell">' + safe(item.service) + '</td>' +
      (includeDate ? '<td>' + safe(item.date) + '</td>' : '') +
      '<td><span class="status ' + statusClass(item.status) + '">' + safe(item.status) + '</span></td>' +
      '<td class="right-cell"><button class="row-action" type="button" data-advance="' + safe(item.id) + '" ' + (isDone ? 'disabled aria-label="Request completed"' : 'aria-label="Advance ' + safe(item.id) + ' in demo workflow"') + '>' + (isDone ? 'Complete' : 'Advance') + '</button></td></tr>';
  }
  function renderRecent() {
    const visible = requests.filter(function (item) { return recentFilter === 'All' || item.status === recentFilter; }).slice(0,5);
    $('#overviewRequestRows').innerHTML = visible.length ? visible.map(function (item) { return renderRequest(item,false); }).join('') : '<tr><td class="empty-row" colspan="4">No demo requests match this filter.</td></tr>';
  }
  function renderAllRequests() {
    const query = $('#requestSearch').value.trim().toLowerCase();
    const visible = requests.filter(function (item) {
      return [item.id,item.name,item.service,item.status].some(function (value) { return value.toLowerCase().includes(query); });
    });
    $('#allRequestRows').innerHTML = visible.length ? visible.map(function (item) {return renderRequest(item,true);}).join('') : '<tr><td class="empty-row" colspan="5">No matching demo requests. Try a different search.</td></tr>';
  }
  function updateCounts() {
    $('#statOpen').textContent = String(requests.filter(function (item) {return item.status !== 'Completed';}).length);
    $('#statCerts').textContent = String(requests.filter(function (item) {return item.service.toLowerCase().includes('certificate') && item.status !== 'Completed';}).length);
    $('#requestNavCount').textContent = String(requests.filter(function (item) {return item.status !== 'Completed';}).length);
    $('#statIntentions').textContent = String(intentions.length);
  }
  function showToast(message) {
    const el = $('#toast');
    el.textContent = message;
    el.hidden = false;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {el.hidden = true;},3200);
  }
  function advanceRequest(id) {
    const item = requests.find(function (row) {return row.id === id;});
    if (!item) return;
    const states = ['For review','In progress','Ready','Completed'];
    const i = states.indexOf(item.status);
    if (i < 0 || i === states.length-1) return;
    item.status = states[i+1];
    renderRecent();
    renderAllRequests();
    updateCounts();
    showToast(item.id + ' moved to "' + item.status + '". Demo state only.');
  }
  function renderIntentions() {
    $('#overviewIntentions').innerHTML = intentions.map(function (item) {
      return '<div class="intention-preview-row"><div><strong>' + safe(item.title) + '</strong><small>' + safe(item.id) + ' · ' + safe(item.date) + '</small></div><span class="status ' + statusClass(item.status) + '">' + safe(item.status) + '</span></div>';
    }).join('');
    $('#intentionRows').innerHTML = intentions.map(function (item) {
      return '<div class="intention-row"><span class="intention-symbol"><span aria-hidden="true">✳</span></span><div class="intention-copy"><strong>' + safe(item.title) + '</strong><small>' + safe(item.id) + ' · Sample scheduled date: ' + safe(item.date) + ' · No payment or offering processed</small></div>' +
       '<span class="status ' + statusClass(item.status) + '">' + safe(item.status) + '</span>' +
       '<button type="button" class="intention-button" data-fulfill="' + safe(item.id) + '"' + (item.status==='Celebrated'?' disabled':'') + '>' + (item.status==='Celebrated'?'Demo complete':'Mark sample celebrated') + '</button></div>';
    }).join('');
  }
  function openDialog(id) {
    lastFocus = document.activeElement;
    const dialog = $(id);
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open','');
    const input = dialog.querySelector('input:not([type="hidden"]),button');
    if (input) input.focus();
  }
  function closeDialog(dialog) {
    if (!dialog) return;
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  }
  function isTyping(target) {
    return target && (target.matches('input, textarea, select') || target.isContentEditable);
  }

  document.addEventListener('click', function (event) {
    const btn = event.target.closest('button');
    if (!btn) return;
    if (btn.matches('[data-nav]')) navigate(btn.dataset.nav);
    if (btn.matches('[data-go]')) navigate(btn.dataset.go);
    if (btn.hasAttribute('data-open-request')) openDialog('#requestDialog');
    if (btn.hasAttribute('data-close-dialog')) closeDialog(btn.closest('dialog'));
    if (btn.hasAttribute('data-advance')) advanceRequest(btn.dataset.advance);
    if (btn.hasAttribute('data-fulfill')) {
      const item = intentions.find(function (entry) {return entry.id === btn.dataset.fulfill;});
      if (item && item.status !== 'Celebrated') {item.status = 'Celebrated';renderIntentions();showToast('Intention updated within this demo only. No canonical record changed.');}
    }
  });
  $('#menuToggle').addEventListener('click', openSidebar);
  $('#closeSidebar').addEventListener('click', closeSidebar);
  $('#backdrop').addEventListener('click', closeSidebar);
  $('#notificationsButton').addEventListener('click', function () {showToast('No new notifications in this fictional workspace.');});
  $('#previewCertificate').addEventListener('click', function () {openDialog('#certificateDialog');});
  $('#globalSearch').addEventListener('input', function () {
    $('#requestSearch').value = this.value;
    if (this.value.trim().length) navigate('requests');
    else if (activeView === 'requests') renderAllRequests();
  });
  $('#requestSearch').addEventListener('input',renderAllRequests);
  $$('[data-filter]').forEach(function (button) {
    button.addEventListener('click',function () {
      recentFilter = this.dataset.filter;
      $$('[data-filter]').forEach(function (item) {
        const active = item === button;
        item.classList.toggle('is-selected',active);
        item.setAttribute('aria-pressed',String(active));
      });
      renderRecent();
    });
  });
  $('#requestForm').addEventListener('submit',function (event) {
    event.preventDefault();
    const label = $('#requestName').value.trim();
    if (!label) {$('#requestName').focus();return;}
    const id = 'DEM-' + String(requests.length+1).padStart(3,'0');
    const now = new Date();
    requests.unshift({
      id:id,name:label,service:$('#requestService').value,status:'For review',
      date:now.toLocaleDateString('en-PH',{day:'2-digit',month:'short'})
    });
    $('#requestName').value = '';
    closeDialog($('#requestDialog'));
    recentFilter = 'All';
    $$('[data-filter]').forEach(function (button) {
      const active = button.dataset.filter === 'All';
      button.classList.toggle('is-selected',active);
      button.setAttribute('aria-pressed',String(active));
    });
    renderRecent();renderAllRequests();updateCounts();navigate('requests');
    showToast(id + ' added to the fictional service queue. No data was sent or saved.');
  });
  $$('dialog').forEach(function (dialog) {
    dialog.addEventListener('click',function (event) { if (event.target === dialog) closeDialog(dialog); });
  });
  document.addEventListener('keydown',function (event) {
    if (event.key==='/' && !isTyping(event.target) && !$$('dialog[open]').length) { event.preventDefault();$('#globalSearch').focus(); }
    if (event.key==='Escape') closeSidebar();
  });
  const today = new Date();
  $('#currentDate').textContent = today.toLocaleDateString('en-PH',{weekday:'short',month:'short',day:'numeric'});
  fillIcons();renderRecent();renderAllRequests();renderIntentions();updateCounts();
})();