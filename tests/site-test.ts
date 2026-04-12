/**
 * YmShotS — Site Smoke Test
 * Tests the landing page buttons, links, and functionality.
 * No browser needed — fetches HTML and validates structure.
 *
 * Run: npx tsx tests/site-test.ts
 */

const SITE_URL = process.env.SITE_URL || 'https://ymshots.netlify.app';

interface TestResult { name: string; passed: boolean; error?: string }
const results: TestResult[] = [];

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    results.push({ name, passed: true });
    console.log(`  \u2713 ${name}`);
  } catch (e: any) {
    results.push({ name, passed: false, error: e.message });
    console.log(`  \u2717 ${name} — ${e.message}`);
  }
}

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(msg);
}

async function fetchPage(path: string): Promise<string> {
  const res = await fetch(`${SITE_URL}${path}`);
  assert(res.ok, `HTTP ${res.status} for ${path}`);
  return res.text();
}

async function run() {
  console.log('\n=== YmShotS Site Smoke Tests ===\n');

  const html = await fetchPage('/');

  // ─── Page loads ───
  console.log('--- Page Structure ---');

  await test('Landing page returns 200', async () => {
    const res = await fetch(SITE_URL);
    assert(res.status === 200, `Got ${res.status}`);
  });

  await test('Title contains YmShotS', async () => {
    assert(html.includes('<title>YmShotS'), 'Title missing');
  });

  await test('Has EN/FR language toggle', async () => {
    assert(html.includes('btn-en') && html.includes('btn-fr'), 'Language buttons missing');
    assert(html.includes("setLang('en')") && html.includes("setLang('fr')"), 'setLang function missing');
  });

  // ─── Buttons exist and are clickable ───
  console.log('\n--- Buttons & Links ---');

  await test('"Get early access" button exists with onclick', async () => {
    assert(html.includes('openWaitlist()'), '"Get early access" has no onclick handler');
  });

  await test('"See how it works" links to pilot guide', async () => {
    assert(html.includes('href="/pilot-guide.html"'), '"See how it works" missing pilot guide link');
  });

  await test('Plan buttons have onclick handlers', async () => {
    assert(html.includes("openWaitlist('FREE')"), 'Free plan button missing onclick');
    assert(html.includes("openWaitlist('PRO')"), 'Pro plan button missing onclick');
    assert(html.includes("openWaitlist('STUDIO')"), 'Studio plan button missing onclick');
  });

  await test('Footer Contact link has mailto', async () => {
    assert(html.includes('mailto:hello@ymshots.com'), 'Contact mailto missing');
  });

  await test('Footer Pricing link has anchor', async () => {
    assert(html.includes('href="#pricing"'), 'Pricing anchor missing');
  });

  await test('Footer Features link has anchor', async () => {
    assert(html.includes('href="#engines"'), 'Features anchor missing');
  });

  // ─── Waitlist modal ───
  console.log('\n--- Waitlist Modal ---');

  await test('Waitlist modal exists in HTML', async () => {
    assert(html.includes('waitlistModal'), 'Modal element missing');
  });

  await test('Waitlist form has name field', async () => {
    assert(html.includes('waitlistName'), 'Name input missing');
  });

  await test('Waitlist form has email field', async () => {
    assert(html.includes('waitlistEmail'), 'Email input missing');
  });

  await test('Waitlist form has phone field', async () => {
    assert(html.includes('waitlistPhone'), 'Phone input missing');
  });

  await test('Waitlist form has pilot code field', async () => {
    assert(html.includes('waitlistCode'), 'Pilot code input missing');
  });

  await test('Waitlist submits to Supabase', async () => {
    assert(html.includes('supabase.co/rest/v1/waitlist'), 'Supabase waitlist endpoint missing');
  });

  await test('Pilot codes are defined', async () => {
    assert(html.includes('YMSHOTS-PILOT-2026'), 'Pilot code missing');
    assert(html.includes('TATECH-VIP'), 'VIP code missing');
    assert(html.includes('PILOT237'), 'Cameroon code missing');
  });

  await test('Success message exists', async () => {
    assert(html.includes('waitlistSuccess'), 'Success state missing');
  });

  await test('Pilot success message exists', async () => {
    assert(html.includes('Welcome, pilot!'), 'Pilot success message missing');
  });

  // ─── Content ───
  console.log('\n--- Content ---');

  await test('All 10 engine cards present', async () => {
    const engines = ['SignatureAI', 'ShotTalk', 'StyleForge', 'GalleryBox', 'PayShot', 'RawPulse', 'SharpEye', 'AcademyMode', 'ChromaDesk', 'GlowKit'];
    for (const eng of engines) {
      assert(html.includes(eng), `Engine ${eng} missing from page`);
    }
  });

  await test('Pricing section has 3 plans', async () => {
    assert(html.includes('FREE'), 'FREE plan missing');
    assert(html.includes('PRO'), 'PRO plan missing');
    assert(html.includes('STUDIO'), 'STUDIO plan missing');
  });

  await test('French translations exist', async () => {
    assert(html.includes('data-fr='), 'No French translations found');
    assert(html.includes('vos moments'), 'French tagline missing');
    assert(html.includes('Accès anticipé'), 'French CTA missing');
  });

  await test('Service worker registered', async () => {
    assert(html.includes("serviceWorker.register('/sw.js')"), 'Service worker registration missing');
  });

  await test('No hardcoded em-dashes in visible text', async () => {
    // Check only data-en attributes and visible text, not meta tags
    const dataEnMatches = html.match(/data-en="[^"]*—[^"]*"/g) || [];
    assert(dataEnMatches.length === 0, `Found em-dashes in: ${dataEnMatches.join(', ')}`);
  });

  // ─── Pilot guide ───
  console.log('\n--- Pilot Guide ---');

  await test('Pilot guide page loads', async () => {
    const guideHtml = await fetchPage('/pilot-guide.html');
    assert(guideHtml.includes('PILOT PROGRAM'), 'Pilot guide content missing');
  });

  await test('Pilot guide has EN/FR sections', async () => {
    const guideHtml = await fetchPage('/pilot-guide.html');
    assert(guideHtml.includes('section-en') && guideHtml.includes('section-fr'), 'Missing language sections');
  });

  await test('Pilot guide shows access code', async () => {
    const guideHtml = await fetchPage('/pilot-guide.html');
    assert(guideHtml.includes('YMSHOTS-PILOT-2026'), 'Access code missing from guide');
  });

  // ─── Service Worker ───
  console.log('\n--- Service Worker ---');

  await test('Service worker file exists', async () => {
    const res = await fetch(`${SITE_URL}/sw.js`);
    assert(res.status === 200, `sw.js returned ${res.status}`);
  });

  // ─── Summary ───
  console.log('\n=== Results ===');
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  console.log(`\n  Total: ${results.length}`);
  console.log(`  Passed: ${passed} \u2713`);
  console.log(`  Failed: ${failed} ${failed > 0 ? '\u2717' : ''}`);

  if (failed > 0) {
    console.log('\n  Failed:');
    results.filter(r => !r.passed).forEach(r => console.log(`    \u2717 ${r.name}: ${r.error}`));
    process.exit(1);
  }
  console.log('\n  Site tests passed!\n');
}

run().catch(e => { console.error('Test crashed:', e); process.exit(1); });
