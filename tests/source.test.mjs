import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
const js = readFileSync(new URL('../app.js', import.meta.url), 'utf8');

test('eight navigation entries map to real semantic view sections', () => {
  const ids = [...html.matchAll(/data-nav="([^"]+)"/g)].map(m => m[1]);
  assert.equal(ids.length, 8);
  for (const id of ids) assert.match(html, new RegExp('id="view-' + id + '"'));
  assert.match(js, /function navigate\(view\)/);
});

test('explicit demo warning and invalid certificate markings', () => {
  assert.match(html, /All parish details, registers and transactions are fictional/);
  assert.match(html, /SAMPLE · INVALID/);
  assert.match(html, /NO OFFICIAL SEAL/);
  assert.match(html, /not a sacramental registry/i);
  assert.match(html, /No data leaves this page/);
});

test('no backend, payment submission, network call or persistent personal data in runtime code', () => {
  assert.doesNotMatch(js, /\bfetch\s*\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|indexedDB/i);
  assert.match(js, /event\.preventDefault\(\)/);
  assert.match(js, /function safe\(value\)/);
  assert.match(js, /replace\(\/\[&<>"'\]\/g/);
});

test('responsive and accessible interaction treatments are present', () => {
  assert.match(css, /@media\(max-width:820px\)/);
  assert.match(css, /@media\(max-width:600px\)/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(html, /aria-label="Primary navigation"/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /<dialog id="requestDialog"/);
});

test('separate obligation concepts: intentions, money and document custody', () => {
  assert.match(html, /An offering is not proof that the Mass was celebrated/);
  assert.match(html, /Historical corrections require documented authorization/);
  assert.match(html, /donations, restricted funds, expenses, and Mass obligations distinct/);
  assert.match(html, /confessional content/i);
});

test('request status and sample intention transitions are explicit', () => {
  for (const status of ['For review', 'In progress', 'Ready', 'Completed']) assert.ok(js.includes(status));
  for (const status of ['Requested', 'Assigned', 'Celebrated']) assert.ok(js.includes(status));
  assert.match(js, /function advanceRequest\(id\)/);
  assert.match(js, /renderIntentions\(\)/);
});
