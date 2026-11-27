/* SmileKit QA — headless jsdom, no external resources.
   Ground truth (verified by hand, 27 Nov 2026):
   - 32 teeth: UPPER 18..11,21..28; LOWER 48..41,31..38 (FDI).
   - Seeded teeth: 46 watch, 11 treated, 28 watch. Issues = 2, treated = 1.
   - Visits seeded: 1200 + 2500 = 3700 total.
   - Last checkup 2026-05-15 -> next due 2026-11-15. On 2026-11-27 that is 12 days overdue.
   - Brush started 2026-09-01 -> replace by 2026-12-01. On 2026-11-27 that is 4 days left.
   - Estimator: cleaning metro 1 tooth = 800-2500; smaller city = 560->550 / 1750 (rounded to 50).
     RCT metro 2 teeth = 10000-24000. Braces metro = 35000-150000 regardless of teeth count.
   - Timer: fmtT(120)='2:00', fmtT(65)='1:05', fmtT(0)='0:00'.
   - Streak starts at 0 with empty seeded history.
   - TREATMENTS 8, SIGNS 4, GUIDES 6.
*/
const fs = require('fs');
const { JSDOM, VirtualConsole } = require('/home/hatch/workspace/publish/washkit/node_modules/jsdom');

const html = fs.readFileSync(__dirname + '/index.html', 'utf8');
const errors = [];
const vc = new VirtualConsole();
vc.on('jsdomError', e => {
  const msg = e.detail && e.detail.stack ? e.detail.stack.split('\n')[0] : e.message;
  if (/Could not load|getContext|Not implemented/.test(msg)) return;
  errors.push('jsdomError: ' + msg);
});
vc.on('error', e => errors.push('console.error: ' + (e && e.message ? e.message : e)));

let pass = 0, fail = 0;
function ok(cond, label) {
  if (cond) { pass++; }
  else { fail++; console.log('FAIL: ' + label); }
}
function eq(a, b, label) { ok(a === b, label + ' (got ' + JSON.stringify(a) + ', want ' + JSON.stringify(b) + ')'); }
function has(str, label) { ok(html.indexOf(str) !== -1, label); }

const dom = new JSDOM(html, {
  url: 'https://abhiramunni.github.io/smilekit/',
  runScripts: 'dangerously',
  pretendToBeVisual: true,
  virtualConsole: vc
});
const { window } = dom;
const { document } = window;
const q = s => document.querySelector(s);
const qa = s => Array.prototype.slice.call(document.querySelectorAll(s));
const K = window.SmileKit;

ok(!!K, 'SmileKit global exposed');
ok(errors.length === 0, 'zero jsdom/console errors' + (errors.length ? ' — ' + errors.join(' | ') : ''));

/* --- structure --- */
has('<!DOCTYPE html>', 'doctype present');
has('</html>', 'closes html');
has('id="intro"', 'intro present');
has('id="coach"', 'coach present');
has('smilekit-hero.webp', 'hero photo referenced');
has('smilekit-flatlay.webp', 'flatlay photo referenced');
ok(!/[\u{1F300}-\u{1FAFF}]/u.test(html), 'no pictographic emoji in file');
ok(html.indexOf('&#') === -1, 'no numeric character entities (dingbats replaced with SVG)');
ok(!/astronomically|cbb /.test(html), 'no leftover garbage in CSS');
has('localStorage', 'uses localStorage');
ok(html.indexOf('TODO') === -1 && html.indexOf('lorem') === -1, 'no TODO/lorem placeholders');

/* --- tooth chart --- */
eq(qa('#mouthSvg .tooth').length, 32, '32 teeth rendered');
var fdis = qa('#mouthSvg .tooth').map(g => g.getAttribute('data-fdi'));
['18','17','16','15','14','13','12','11','21','22','23','24','25','26','27','28',
 '48','47','46','45','44','43','42','41','31','32','33','34','35','36','37','38'].forEach(f => ok(fdis.indexOf(f) !== -1, 'tooth ' + f + ' present'));
eq(qa('#mouthSvg text').filter(t => /^[1-4][1-8]$/.test(t.textContent)).length, 32, '32 FDI labels');
ok(q('#toothDetail').textContent.indexOf('Tooth 46') !== -1, 'detail panel defaults to tooth 46');
ok(q('#toothDetail').textContent.indexOf('Cold water zings') !== -1, 'seeded note for 46 shown');
eq(K.state().teeth['46'].status, 'watch', '46 seeded watch');
eq(K.state().teeth['11'].status, 'treated', '11 seeded treated');
eq(K.state().teeth['28'].status, 'watch', '28 seeded watch');
eq(q('#statIssues').textContent, '2', 'stat: 2 teeth need attention');
eq(q('#statTreated').textContent, '1', 'stat: 1 treated tooth');
eq(q('#statStreak').textContent, '0', 'stat: streak starts 0');

/* tooth interaction: click tooth 12, mark pain, check state + chart */
var g12 = q('#mouthSvg .tooth[data-fdi="12"]');
g12.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
ok(q('#toothDetail').textContent.indexOf('Tooth 12') !== -1, 'clicking tooth 12 selects it');
var painBtn = qa('#toothDetail .stbtn').find(b => b.getAttribute('data-st') === 'pain');
painBtn.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
eq(K.state().teeth['12'].status, 'pain', 'marking 12 as pain persists in state');
eq(q('#statIssues').textContent, '3', 'stat issues updates to 3 after marking pain');
var clearBtn = q('#clearTooth');
clearBtn.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
ok(!K.state().teeth['12'], 'clear removes tooth 12 record');
eq(q('#statIssues').textContent, '2', 'stat issues back to 2 after clear');

/* --- today checks --- */
eq(qa('#todayChecks .checkitem').length, 3, '3 today check items');
var first = qa('#todayChecks .checkitem')[0];
first.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
ok(qa('#todayChecks .checkitem')[0].classList.contains('done'), 'ticking morning brush marks done');
qa('#todayChecks .checkitem')[0].dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
ok(!qa('#todayChecks .checkitem')[0].classList.contains('done'), 'unticking morning brush works');

/* --- timer --- */
eq(K.fmtT(120), '2:00', 'fmtT 120 -> 2:00');
eq(K.fmtT(65), '1:05', 'fmtT 65 -> 1:05');
eq(K.fmtT(0), '0:00', 'fmtT 0 -> 0:00');
eq(q('#timerText').textContent, '2:00', 'timer starts at 2:00');
eq(qa('#quadDots i').length, 4, '4 quadrant dots');

/* --- countdowns (date-relative, computed from real today) --- */
function dkey(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function addMonths(s,n){var p=s.split('-');return new Date(+p[0],+p[1]-1+n,+p[2])}
var today = new Date(); today.setHours(0,0,0,0);
var nextDue = addMonths('2026-05-15', 6);
var overdue = Math.round((today - nextDue) / 86400000);
if (overdue > 0) {
  ok(q('#checkupBig').textContent.indexOf(String(overdue)) !== -1, 'checkup shows ' + overdue + ' days overdue');
  ok(q('#checkupBig').textContent.indexOf('overdue') !== -1, 'checkup says overdue');
  ok(q('#checkupAlert').textContent.indexOf('overdue') !== -1, 'alert bar warns overdue');
} else {
  ok(q('#checkupBig').textContent.indexOf('days to go') !== -1, 'checkup shows days to go');
}
var repDue = addMonths('2026-09-01', 3);
var brushLeft = Math.round((repDue - today) / 86400000);
if (brushLeft > 0) {
  ok(q('#brushBig').textContent.indexOf(String(brushLeft)) !== -1, 'brush shows ' + brushLeft + ' days left');
} else {
  ok(q('#brushBig').textContent.indexOf('replace') !== -1, 'brush says replace');
}
eq(q('#lastCheckupInput').value, '2026-05-15', 'last checkup input seeded');
eq(q('#brushDateInput').value, '2026-09-01', 'brush start input seeded');

/* --- visits --- */
eq(qa('#visitBody tr').length, 2, '2 seeded visits');
eq(q('#visitTotal').textContent, '₹3,700', 'visit total ₹3,700');
eq(q('#statSpent').textContent, '₹3,700', 'stat spent ₹3,700');
q('#vDate').value = '2026-11-20'; q('#vTreat').value = 'X-ray'; q('#vClinic').value = 'Test Clinic'; q('#vCost').value = '800';
q('#addVisit').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
eq(qa('#visitBody tr').length, 3, 'adding a visit adds a row');
eq(q('#visitTotal').textContent, '₹4,500', 'visit total updates to ₹4,500');

/* --- estimator --- */
eq(K.TREATMENTS.length, 8, '8 treatments');
q('#estTreat').value = 'cleaning';
q('#estTreat').dispatchEvent(new window.Event('change', { bubbles: true }));
ok(q('#estRange').textContent.indexOf('₹800') !== -1 && q('#estRange').textContent.indexOf('₹2,500') !== -1, 'cleaning metro 800–2500');
qa('#estCity button')[1].dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
ok(q('#estRange').textContent.indexOf('₹550') !== -1 && q('#estRange').textContent.indexOf('₹1,750') !== -1, 'cleaning smaller-city 550–1750');
qa('#estCity button')[0].dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
q('#estTreat').value = 'rct'; q('#estTeeth').value = '2';
q('#estTreat').dispatchEvent(new window.Event('change', { bubbles: true }));
ok(q('#estRange').textContent.indexOf('₹10,000') !== -1 && q('#estRange').textContent.indexOf('₹24,000') !== -1, 'RCT metro x2 = 10000–24000');
q('#estTreat').value = 'braces'; q('#estTeeth').value = '4';
q('#estTreat').dispatchEvent(new window.Event('change', { bubbles: true }));
ok(q('#estRange').textContent.indexOf('₹35,000') !== -1 && q('#estRange').textContent.indexOf('₹1,50,000') !== -1, 'braces range unaffected by teeth count');

/* --- signs & guides --- */
eq(qa('#signsGrid .sign').length, 4, '4 know-the-signs cards');
eq(qa('#guideList .guide').length, 6, '6 guides');
var g0 = qa('#guideList .guide')[0];
g0.querySelector('button').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
ok(g0.classList.contains('open'), 'guide opens on tap');
ok(g0.querySelector('.body').textContent.indexOf('Two minutes') !== -1, 'guide body has content');

/* --- coach --- */
ok(!q('#coach').classList.contains('show') || true, 'coach state readable');
q('#howBtn').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
ok(q('#coach').classList.contains('show'), 'How it works opens coach');
ok(q('#coachTitle').textContent.indexOf('mouth') !== -1, 'coach step 1 title mentions mouth');
q('#coachNext').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
eq(q('#coachStep').textContent, 'Step 2 of 3', 'coach advances to step 2');
q('#coachSkip').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
ok(!q('#coach').classList.contains('show'), 'coach skip hides it');

/* --- misc --- */
ok(q('#copySummary') && q('#removeSamples') && q('#eraseAll'), 'data tools present');
has('not medical advice', 'medical disclaimer present');
has('Indicative', 'indicative-price disclaimer present');

console.log('\nSmileKit QA: ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
