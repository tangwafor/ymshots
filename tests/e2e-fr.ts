/**
 * YmShotS — Suite de Tests E2E (Français)
 * Teste toutes les tables, routes API, et flux métier.
 * Exécuter: npx tsx tests/e2e-fr.ts
 */

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://heckailuvcwmnfdtubhd.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhlY2thaWx1dmN3bW5mZHR1YmhkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjAwNzY0NiwiZXhwIjoyMDkxNTgzNjQ2fQ.q3VTgieFr9dMzOEf2A0kjkZ4DoJwa-XY-Ro-D4hlE5w';

interface Resultat { nom: string; reussi: boolean; duree: number; erreur?: string }
const resultats: Resultat[] = [];

async function tester(nom: string, fn: () => Promise<void>) {
  const debut = Date.now();
  try {
    await fn();
    resultats.push({ nom, reussi: true, duree: Date.now() - debut });
    console.log(`  \u2713 ${nom} (${Date.now() - debut}ms)`);
  } catch (e: any) {
    resultats.push({ nom, reussi: false, duree: Date.now() - debut, erreur: e.message });
    console.log(`  \u2717 ${nom} (${Date.now() - debut}ms) — ${e.message}`);
  }
}

function verifier(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

async function requeteGet(table: string, params = ''): Promise<any> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}`, {
    headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}`, 'Prefer': 'return=representation' },
  });
  return res.json();
}

async function requetePost(table: string, data: any): Promise<any> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
    body: JSON.stringify(data),
  });
  return res.json();
}

async function requeteSupprimer(table: string, filtre: string): Promise<void> {
  await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filtre}`, {
    method: 'DELETE',
    headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` },
  });
}

// ═══════════════════════════════════════════════════════

async function lancerTests() {
  console.log('\n\u2550\u2550\u2550 YmShotS — Suite de Tests E2E (FR) \u2550\u2550\u2550\n');

  // ─── 1. VÉRIFICATION DES TABLES ───
  console.log('\n--- Vérification du schéma ---');

  const TABLES = [
    'users', 'user_sessions', 'user_preferences', 'shoots', 'photos',
    'photo_keywords', 'photo_collections', 'collection_photos',
    'edit_sessions', 'edit_adjustments', 'edit_history', 'layers', 'masks',
    'style_profiles', 'style_training_pairs', 'presets',
    'face_sessions', 'beauty_adjustments', 'makeup_looks',
    'clients', 'galleries', 'gallery_photos', 'invoices', 'invoice_line_items',
    'shoot_time_logs', 'analytics_events', 'revenue_snapshots',
    'tether_sessions', 'export_jobs', 'sound_events_log',
    'academy_lessons', 'user_academy_progress', 'academy_challenges',
    'challenge_submissions', 'user_academy_stats', 'pitch_views',
    'shottalk_threads', 'shottalk_messages', 'shottalk_attachments',
    'photo_annotations', 'styleforge_jobs', 'payments', 'payment_provider_configs',
  ];

  for (const table of TABLES) {
    await tester(`Table "${table}" existe`, async () => {
      const data = await requeteGet(table, 'select=*&limit=0');
      verifier(Array.isArray(data), `Table ${table} inaccessible`);
    });
  }

  // ─── 2. CYCLE DE VIE UTILISATEUR ───
  console.log('\n--- Cycle de vie utilisateur ---');

  const idUtilisateur = crypto.randomUUID();
  const email = `test-fr-${Date.now()}@ymshots.test`;

  await tester('Créer un utilisateur', async () => {
    const res = await requetePost('users', {
      id: idUtilisateur, email,
      "passwordHash": '$2b$12$test', "fullName": 'Photographe Test',
      "planTier": 'FREE', timezone: 'Africa/Douala', locale: 'fr-CM',
      "onboardingCompleted": false, "updatedAt": new Date().toISOString(),
    });
    verifier(Array.isArray(res) && res.length > 0, 'Échec création utilisateur: ' + JSON.stringify(res));
  });

  await tester('Lire l\'utilisateur', async () => {
    const data = await requeteGet('users', `id=eq.${idUtilisateur}`);
    verifier(data[0]?.email === email, 'Email incorrect');
    verifier(data[0]?.locale === 'fr-CM', 'Locale incorrecte');
  });

  // ─── 3. SHOOTING & PHOTOS ───
  console.log('\n--- Shooting & Photos ---');

  const idShooting = crypto.randomUUID();

  await tester('Créer un shooting', async () => {
    const res = await requetePost('shoots', {
      id: idShooting, "userId": idUtilisateur,
      name: 'Mariage Biya', "shootType": 'WEDDING', status: 'IMPORTING',
      "totalPhotos": 0, "flaggedCount": 0, "updatedAt": new Date().toISOString(),
    });
    verifier(Array.isArray(res) && res.length > 0, 'Échec création shooting');
  });

  const idPhoto = crypto.randomUUID();

  await tester('Créer une photo', async () => {
    const res = await requetePost('photos', {
      id: idPhoto, "shootId": idShooting, "userId": idUtilisateur,
      "filenameOriginal": 'IMG_0001.CR2', "filenameStored": `${idPhoto}.cr2`,
      "storagePath": `/storage/${idPhoto}.cr2`, "fileFormat": 'RAW',
      "widthPx": 6000, "heightPx": 4000, "fileSizeBytes": 30000000,
      "flagStatus": 'NONE', "colorLabel": 'NONE', "updatedAt": new Date().toISOString(),
    });
    verifier(Array.isArray(res) && res.length > 0, 'Échec création photo');
  });

  await tester('Marquer la photo (drapeau)', async () => {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/photos?id=eq.${idPhoto}`, {
      method: 'PATCH',
      headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
      body: JSON.stringify({ "flagStatus": 'FLAGGED', "starRating": 5, "updatedAt": new Date().toISOString() }),
    });
    const data = await res.json();
    verifier(data[0]?.flagStatus === 'FLAGGED', 'Drapeau non appliqué');
  });

  // ─── 4. SHOTTALK ───
  console.log('\n--- ShotTalk (Communication) ---');

  const idClient = crypto.randomUUID();
  await requetePost('clients', {
    id: idClient, "userId": idUtilisateur, "fullName": 'Marie Ngono',
    email: 'marie@exemple.cm', "totalSpentCents": 0, "shootCount": 0,
  });

  let idFil: string;

  await tester('Créer un fil de discussion', async () => {
    const res = await requetePost('shottalk_threads', {
      "userId": idUtilisateur, title: 'Discussion Mariage Biya',
      "clientId": idClient, "shootId": idShooting,
      status: 'ACTIVE', "updatedAt": new Date().toISOString(),
    });
    verifier(Array.isArray(res) && res.length > 0, 'Échec création fil');
    idFil = res[0].id;
  });

  let idMessage: string;

  await tester('Envoyer un message', async () => {
    const res = await requetePost('shottalk_messages', {
      "threadId": idFil, "senderId": idUtilisateur,
      "senderType": 'PHOTOGRAPHER', "senderName": 'Photographe Test',
      body: 'Bonjour Marie ! Votre galerie est prête.',
    });
    verifier(Array.isArray(res) && res.length > 0, 'Échec envoi message');
    idMessage = res[0].id;
  });

  await tester('Ajouter une annotation photo', async () => {
    const res = await requetePost('photo_annotations', {
      "messageId": idMessage, "photoId": idPhoto,
      "pinX": 0.35, "pinY": 0.70,
      note: 'Peut-on éclaircir cette zone ?',
    });
    verifier(Array.isArray(res) && res.length > 0, 'Échec annotation');
  });

  // ─── 5. STYLEFORGE ───
  console.log('\n--- StyleForge (Effets créatifs) ---');

  await tester('Créer un job aquarelle', async () => {
    const res = await requetePost('styleforge_jobs', {
      "userId": idUtilisateur, "photoId": idPhoto,
      effect: 'WATERCOLOR', intensity: 0.9, status: 'QUEUED',
    });
    verifier(Array.isArray(res) && res.length > 0, 'Échec job StyleForge');
  });

  await tester('Créer un job caricature', async () => {
    const res = await requetePost('styleforge_jobs', {
      "userId": idUtilisateur, "photoId": idPhoto,
      effect: 'CARICATURE', intensity: 0.75, status: 'QUEUED',
    });
    verifier(Array.isArray(res) && res.length > 0, 'Échec job caricature');
  });

  // ─── 6. PAIEMENTS ───
  console.log('\n--- Paiements ---');

  const idFacture = crypto.randomUUID();
  await requetePost('invoices', {
    id: idFacture, "userId": idUtilisateur, "clientId": idClient,
    "shootId": idShooting, "invoiceNumber": `YMS-FR-${Date.now()}`,
    status: 'DRAFT', "subtotalCents": 500000, "taxRate": 0.1925,
    "taxCents": 96250, "totalCents": 596250, currency: 'XAF',
  });

  await tester('Paiement MTN MoMo', async () => {
    const res = await requetePost('payments', {
      "invoiceId": idFacture, "userId": idUtilisateur,
      "amountCents": 596250, currency: 'XAF',
      method: 'MOBILE_MONEY_MTN', provider: 'NOTCHPAY',
      status: 'PENDING', "phoneNumber": '+237670123456',
      "updatedAt": new Date().toISOString(),
    });
    verifier(Array.isArray(res) && res.length > 0, 'Échec paiement MoMo');
  });

  await tester('Paiement espèces', async () => {
    const res = await requetePost('payments', {
      "invoiceId": idFacture, "userId": idUtilisateur,
      "amountCents": 596250, currency: 'XAF',
      method: 'CASH', provider: 'MANUAL',
      status: 'SUCCEEDED', "cashReceivedBy": 'Photographe Test',
      "cashNote": 'Payé au studio à Douala',
      "paidAt": new Date().toISOString(), "updatedAt": new Date().toISOString(),
    });
    verifier(Array.isArray(res) && res.length > 0, 'Échec paiement espèces');
  });

  // ─── 7. VÉRIFICATIONS NON-NÉGOCIABLES ───
  console.log('\n--- Vérifications non-négociables ---');

  await tester('Tous les IDs sont des UUID', async () => {
    const user = await requeteGet('users', `id=eq.${idUtilisateur}`);
    verifier(user[0].id.length === 36 && user[0].id.includes('-'), 'ID non UUID');
  });

  await tester('L\'argent est en centimes (BigInt)', async () => {
    const inv = await requeteGet('invoices', `id=eq.${idFacture}`);
    verifier(inv[0].totalCents === 596250, 'Montant en centimes incorrect');
  });

  await tester('Les timestamps sont en UTC', async () => {
    const user = await requeteGet('users', `id=eq.${idUtilisateur}`);
    verifier(user[0].createdAt.includes('T'), 'Timestamp non ISO');
  });

  // ─── 8. NETTOYAGE ───
  console.log('\n--- Nettoyage ---');

  await tester('Supprimer les données de test', async () => {
    await requeteSupprimer('users', `id=eq.${idUtilisateur}`);
    const check = await requeteGet('users', `id=eq.${idUtilisateur}`);
    verifier(Array.isArray(check) && check.length === 0, 'Nettoyage échoué');
  });

  // ─── RÉSUMÉ ───
  console.log('\n\u2550\u2550\u2550 Résultats \u2550\u2550\u2550');
  const reussis = resultats.filter(r => r.reussi).length;
  const echoues = resultats.filter(r => !r.reussi).length;
  const duree = resultats.reduce((s, r) => s + r.duree, 0);

  console.log(`\n  Total: ${resultats.length}`);
  console.log(`  Réussis: ${reussis} \u2713`);
  console.log(`  Échoués: ${echoues} ${echoues > 0 ? '\u2717' : ''}`);
  console.log(`  Durée: ${duree}ms\n`);

  if (echoues > 0) {
    console.log('  Tests échoués:');
    resultats.filter(r => !r.reussi).forEach(r => console.log(`    \u2717 ${r.nom}: ${r.erreur}`));
    process.exit(1);
  }

  console.log('  Tous les tests sont passés ! YmShotS est AU VERT.\n');
}

lancerTests().catch(e => { console.error('Suite de tests plantée:', e); process.exit(1); });
