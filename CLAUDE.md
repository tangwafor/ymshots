# YmShotS — Master Project Blueprint
# Claude Code: read this file at the start of every session before doing anything.

---

## Project identity

- **App name:** YmShotS
- **Tagline:** your moments. your shots.
- **Version:** 1.0.0 (v1.0)
- **Signature:** Built by ta-tech
- **License:** Proprietary — do not reference or name any third-party competing apps in code, comments, or strings

---

## The product in one sentence

> You shoot. It learns your eye. Your work becomes unmistakable. Your clients feel the difference.

This is not an editing tool. It is a creative identity engine + premium workflow system for photographers who care about their craft. Every feature decision must serve this sentence.

---

## Product positioning

**YmShotS is the app that learns your eye and makes every photo look like you at your best.**

- VaultGrid is not a library — it is where your style learns from
- SignatureAI is not a feature — it is the product
- FinalPass is not an export engine — it is how your style reaches the world
- GalleryBox is not a delivery portal — it is how clients experience your eye
- PayShot and LensBiz are not admin tools — they make the business invisible so the creative can breathe

The app should behave like a ghost that makes photographers look better. Never compete with them for attention. YmShotS brand is invisible to clients. The photographer's brand is everything.

---

## Non-negotiables — never violate these

1. ALL AI inference runs on-device via ONNX Runtime — photos never leave the user's machine
2. Non-destructive editing always — original files are NEVER modified, ever
3. No ads anywhere in the app, no processing rate limits for paid users
4. SoundPulse respects system mute and the user's volume preference in user_preferences
5. Every AI slider must have an intensity value (0.0–1.0) and a reset-to-default action
6. Dark mode is always supported — every component must work in both light and dark
7. Offline-first — all core editing features work with zero internet connection
8. UUIDs everywhere — no integer primary keys
9. All timestamps are timestamptz (UTC) — never naive datetime
10. Money is always stored as integer cents — never floats
11. AcademyMode (training system) must be present from first launch — never an afterthought
12. The PitchDeck (self-selling flow) launches from every plan-gate and the welcome screen
13. The creator signature "Built by ta-tech" appears on splash, about, exports, gallery footer, invoice footer, and window title bar
14. GalleryBox client pages are always dark (#0A0A0A background) — never white
15. The photographer's name is always larger and more prominent than any YmShotS branding on client-facing pages
16. GalleryBox client pages have NO sound — silence is the right choice for client delivery

---

## Technology stack

### Desktop app
- Electron 28+
- React 18 + TypeScript 5
- Tailwind CSS 3 + CSS custom properties
- Zustand (global state) + React Query / TanStack Query (server state)
- Konva.js (2D canvas layer rendering)
- WebGL shaders (RAW image processing pipeline)
- Recharts (LensBiz analytics charts)

### Mobile app
- React Native 0.73 + Expo 50
- React Navigation 6
- expo-camera (camera roll import)
- expo-haptics (SoundPulse haptic triggers)
- expo-av (audio playback)
- expo-file-system + expo-image-manipulator
- react-native-usb (LiveTether USB connection)

### Backend API
- Node.js 20 LTS
- Fastify 4 (HTTP server)
- tRPC v11 (type-safe RPC layer)
- JWT + refresh tokens via jose
- Prisma 5 ORM
- Zod (all input validation)
- bcrypt (password hashing)

### Database & storage
- PostgreSQL 16 (primary database)
- pg_trgm extension (full-text search)
- Redis 7 (sessions, job queues via BullMQ)
- Local filesystem in dev, S3-compatible (Cloudflare R2) in production

### AI / ML
- ONNX Runtime (cross-platform on-device inference)
- MediaPipe (FaceCast face detection, GlowKit landmark detection)
- TensorFlow Lite + custom transfer learning (SignatureAI style training)
- Custom CNN (SharpEye: focus scoring, blink detection, expression scoring)
- rembg ONNX model (SceneDrop background removal)
- u2net ONNX model (MaskCraft subject segmentation)

### Payments
- Stripe (PayShot — invoices, Payment Links, webhooks)

### Infrastructure
- Docker + Docker Compose (local development)
- GitHub Actions (CI/CD)
- Railway.app or Render (API hosting)
- Cloudflare R2 (file storage in production)
- Sentry (error tracking)

---

## Monorepo structure

```
ymshots/
  apps/
    desktop/
      src/
        features/
          vault/          VaultGrid — library, cull, organize
          pixel-forge/    PixelForge — layers, masks, compositing
          chroma-desk/    ChromaDesk — color grading suite
          look-vault/     LookVault — presets and filters
          lens-biz/       LensBiz — business analytics
          frame-glow/     FrameGlow — video retouch
          live-tether/    LiveTether — camera tethering
          final-pass/     FinalPass — export engine
          academy/        AcademyMode — in-app training system
          pitch/          PitchDeck — self-selling pitch flow
        main/             Electron main process
        preload/          Electron preload / IPC bridge
    mobile/
      src/
        screens/
        features/
          academy/        AcademyMode mobile screens
    api/
      src/
        features/
          gallery/        GalleryBox
          invoicing/      PayShot
          analytics/      LensBiz API
          auth/           Auth routes
          academy/        Academy progress API
        router.ts
        index.ts
  packages/
    db/                   Prisma schema, migrations, seed
    rawpulse/             RawPulse — RAW decoding
      src/
        grain-lab/        GrainLab — film grain engine
    ai-core/
      src/
        sharp-eye/        SharpEye — cull AI
        face-cast/        FaceCast — face transformation AI
        glow-kit/         GlowKit — skin and beauty AI
        signature-ai/     SignatureAI — personal style training
        mask-craft/       MaskCraft — segmentation masks
        scene-drop/       SceneDrop — background removal
        clean-slate/      CleanSlate — object removal
        headshot-ai/      HeadshotAI — studio headshots
    soundpulse/           SoundPulse — Web Audio sound engine
    ui/                   Shared React component library
    types/                Shared TypeScript types
    utils/                Shared utilities
  tools/
    scripts/              DB seed, ONNX model download, dev helpers
    academy-content/      All lesson JSON files (structured content)
  CLAUDE.md               This file — always read first
  docker-compose.yml
  turbo.json
  pnpm-workspace.yaml
  package.json
```

---

## Engine name → code module map

| Engine name   | What it does                                      | Code location                          |
|---------------|---------------------------------------------------|----------------------------------------|
| YmShotS       | Main app shell (desktop + mobile)                 | apps/desktop, apps/mobile              |
| RawPulse      | RAW file decoding, tone, non-destructive pipeline | packages/rawpulse/                     |
| VaultGrid     | Library, catalog, import, cull, organize          | apps/desktop/src/features/vault/       |
| SharpEye      | AI cull: focus, blink, expression scoring         | packages/ai-core/src/sharp-eye/        |
| PixelForge    | Layers, blend modes, healing, compositing         | apps/desktop/src/features/pixel-forge/ |
| FaceCast      | Face transformation: age, hair, reshape, gender   | packages/ai-core/src/face-cast/        |
| GlowKit       | Skin smooth, blemish, teeth, eyes, contour        | packages/ai-core/src/glow-kit/         |
| SignatureAI   | Personal style DNA — trains on user edits         | packages/ai-core/src/signature-ai/     |
| GrainLab      | Film grain engine (emulsion simulation)           | packages/rawpulse/src/grain-lab/       |
| ChromaDesk    | HSL, tone curves, 3-way color wheels, LUTs        | apps/desktop/src/features/chroma-desk/ |
| MaskCraft     | AI subject, sky, skin, luminosity masks           | packages/ai-core/src/mask-craft/       |
| LookVault     | Cinematic presets, filter packs, LUT library      | apps/desktop/src/features/look-vault/  |
| SceneDrop     | Background remove, replace, blur, sky swap        | packages/ai-core/src/scene-drop/       |
| CleanSlate    | Object erase with contextual AI fill              | packages/ai-core/src/clean-slate/      |
| GalleryBox    | Client gallery delivery portal                    | apps/api/src/features/gallery/         |
| PayShot       | Invoicing, e-sign, Stripe payments                | apps/api/src/features/invoicing/       |
| LensBiz       | Revenue dashboard, time tracking, analytics       | apps/desktop/src/features/lens-biz/    |
| FrameGlow     | Video retouch — face+skin tools on video          | apps/desktop/src/features/frame-glow/  |
| LiveTether    | Camera → app live tethering (USB + Wi-Fi)         | apps/desktop/src/features/live-tether/ |
| FinalPass     | Export engine: format, ICC, metadata, batch       | apps/desktop/src/features/final-pass/  |
| HeadshotAI    | Studio-quality headshots from any photo           | packages/ai-core/src/headshot-ai/      |
| SoundPulse    | Web Audio API sound system + haptic triggers      | packages/soundpulse/                   |
| AcademyMode   | In-app training system for photographers          | apps/desktop/src/features/academy/     |
| PitchDeck     | Self-selling pitch flow — upgrades, onboarding    | apps/desktop/src/features/pitch/       |

---

## ═══════════════════════════════════════════════════════
## SIGNATUREAI — Emotional experience design
## ═══════════════════════════════════════════════════════

SignatureAI is the product. Everything else feeds it or delivers its output. Build every state exactly as specified. The emotional arc is the feature.

### The five states — build all of them

#### State 1: Dormant (0–9 edit pairs)

**What the photographer sees:** A quiet panel. Pair count and a calm progress ring. No confidence meter. No style card. No disabled "Train" button — a grayed-out button invites frustration; its absence invites natural behavior.

**Ambient copy:** "Edit your photos as you normally would. Your style is being noticed."

**UI behavior:**
- Panel is visible in sidebar from day one
- No "Train now" button exists in this state
- Only a pair counter and a small circular progress ring (0–9 fill)
- System collects training pairs silently on every editStore.save() call

**The feeling:** The app is paying attention without pressure. A great mentor watches before they speak.

---

#### State 2: Learning (10–29 edit pairs)

**Trigger at pair 10:** This is the first moment. The invisible becomes visible.

**What happens at pair 10:**
1. The style fingerprint bars animate in from zero, staggered 100ms apart, over 800ms total
2. `ai_processing_complete` chime plays
3. Copy appears: "Your eye is forming."
4. The fingerprint shows 4 bars: Warmth, Contrast, Clarity, Shadow lift — each grows as more pairs are added

**Style fingerprint:** Shows the photographer's emerging tendencies as simple labeled bars with values 0–100. Values should reflect actual computed averages from their EditState training pairs, not arbitrary numbers.

**The feeling:** Recognition. For the first time, the photographer sees their style as a shape.

---

#### State 3: Forming (30–49 edit pairs)

**Trigger at pair 30:** The style card appears for the first time.

**What happens at pair 30:**
1. Style card slides in beneath the fingerprint
2. Mood words animate in one by one (e.g. "Warm", "Soft contrast", "Natural", "Matte shadows")
3. "Your eye" vs "Default" comparison table appears showing their signature adjustments
4. "Apply my style" button appears for the first time — pink, prominent
5. `signatureai_applied` arpeggio plays

**Style card contents:**
- Mood words (derived from EditState averages — warm temperatures become "Warm", lifted blacks become "Matte shadows", etc.)
- Signature adjustment delta table: their average exposure, temperature, shadow lift vs the DEFAULT_EDIT_STATE

**Copy:** "After 30 edits, your style is defined. Apply it to any photo and see your eye at work."

**Plan gate:** "Apply my style" requires PRO. Show PlanGateModal if FREE. Do not hide the button — show it, gate it on tap.

---

#### State 4: Confident (50–99 edit pairs)

**Stats displayed:**
- Edit pair count
- Style match accuracy (percentage — improves as more pairs are added, starts ~78% at 50 pairs)
- Photos styled counter (cumulative batch applies)

**Core workflow unlocked — "Apply my style" to selection:**
1. User selects any number of photos in VaultGrid (1 or 500 — identical flow)
2. Taps "Apply my style"
3. AI applies SignatureAI to each photo sequentially
4. Progress streams in real time — each photo tile in VaultGrid updates as it completes
5. `signatureai_applied` arpeggio plays per batch of 10
6. Results are EditAdjustments — fully non-destructive, editable after apply

**Copy:** "50 edits in. SignatureAI knows your eye. Apply your style to any photo — one click, unmistakably you."

**The moment that makes the product irreplaceable:** Photographer selects 40 wedding photos. One click. They watch each thumbnail update to their colour palette in real time. This is where switching cost becomes permanent.

---

#### State 5: Expert (100+ edit pairs)

**Trigger at pair 100:** Full-screen milestone moment.
1. Dark overlay on the entire app
2. Large text: "100 edits. SignatureAI knows your eye."
3. Full style fingerprint animates in fully
4. Style export card appears (shareable)
5. `export_complete` triumph arpeggio plays — NOT the regular AI chime. This is a completion worth the biggest sound in the app.

**What unlocks at Expert:**
- **Style export card:** A shareable image showing their visual identity — mood words, signature adjustments, style name. Designed to share on social or send to clients. "My editing style, defined."
- **Per-shoot-type profiles:** A second SignatureAI profile can be trained for a different shoot type (wedding style vs portrait style vs commercial style)
- **Silent auto-apply (opt-in only):** Apply style automatically on import. Every photo imported gets SignatureAI applied in background before the photographer opens VaultGrid. OFF by default. This is a power user feature — never default.

**Copy:** "100 edits. SignatureAI knows exactly how you see the world. Every photo you import can now look unmistakably like you."

**Why this is the moat:** At Expert, switching to any other app means starting over. 100 edits of learned style, a named visual identity, a shareable style card — none of that transfers. The photographer doesn't just use YmShotS. They are YmShotS.

### The obsession loop

```
Edit naturally → Style forms → Apply in one click → Results impress clients → Edit more
```

Every save creates a training pair. Every training pair improves the model. Every improvement makes the next batch apply better. The product gets more valuable the more it is used.

### SignatureAI confidence computation

```typescript
function computeConfidence(pairCount: number): { score: number, label: string, state: 'dormant'|'learning'|'forming'|'confident'|'expert' } {
  if (pairCount < 10)  return { score: 0,                              label: "Your style is being noticed",      state: 'dormant'   }
  if (pairCount < 30)  return { score: (pairCount-10)/20,              label: "Your eye is forming",              state: 'learning'  }
  if (pairCount < 50)  return { score: 0.5 + (pairCount-30)/40,        label: "Your style is defined",            state: 'forming'   }
  if (pairCount < 100) return { score: 0.75 + (pairCount-50)/200,      label: "SignatureAI knows your eye",       state: 'confident' }
  return               { score: 1.0,                                    label: "Your eye is fully known",          state: 'expert'    }
}
```

---

## ═══════════════════════════════════════════════════════
## GALLERYBOX — Client arrival experience design
## ═══════════════════════════════════════════════════════

### The philosophy

The gallery is the photographer's face to their client. YmShotS is invisible. The photographer is everything. The client should feel they are receiving something precious — not opening a file sharing link.

**The client journey: 0s to wow**
- 0.0s — Link opens
- 0.4s — Photographer's name fades in on near-black screen
- 0.8s — Shoot name fades in beneath it
- 1.2s — Cover photo rises from below (slide up, not fade)
- 2.5s — Scroll hint chevron appears (no text, just gesture)
- 3–5s — Client scrolls, sees the gallery, says "wow"

### The 8 inviolable GalleryBox design rules

1. **The photographer's brand is everything. YmShotS is nothing.** No YmShotS logo in the hero. No "Powered by" visible. Footer credit is `11px, 20% white opacity` — invisible unless looking. The photographer should be able to say "I built this" and feel right about it.

2. **Dark background throughout.** `#0A0A0A` — not pure black (too harsh), not dark gray (too flat). This specific value. White backgrounds cheapen photos. Dark frames them.

3. **No sound on the client side.** The gallery is silent. SoundPulse is a photographer tool. Clients receive a luxury experience — they should not be surprised by audio.

4. **Never crop photos to squares.** Masonry preserves natural aspect ratios. Every composition is intact. Squares are for social media — not luxury delivery.

5. **No photo count displayed.** "247 photos" signals quantity over quality. The client should feel they are looking at a curated selection, not a dump.

6. **Mobile-first, always.** Clients open galleries on phones. Design for 390px. Desktop is a nice-to-have.

7. **Zero external dependencies.** The gallery HTML is self-contained — inline CSS, no CDN calls, no Google Fonts. Works on 3G. Loads under 2 seconds on a slow connection.

8. **Selections persist without login.** The gallery slug is the auth token. No account creation. If a password is set: one field, same dark aesthetic, nothing else.

### Phase 1: Arrival (0–1.2s)

```
Screen background: #0A0A0A
Element 1: Photographer name — white, large (22px), centered, fades in at 0.4s
Element 2: Shoot name — 13px, 40% white opacity, fades in at 0.8s
Element 3: Nothing else
```

No spinner. No logo. No loading state. If images aren't ready yet: a single thin progress line at the very bottom of the screen, 1px tall, pink, ambient.

### Phase 2: Reveal (1.2s–3s)

The cover photo rises from the bottom third of the screen over 600ms. Not a fade — a physical rise. `transform: translateY(100%) → translateY(0)` with `ease-out` timing.

As the photo rises, the photographer name moves to float above it — it stays on screen throughout. The photo slides beneath the name.

After 1s of stillness: a single down-pointing chevron fades in at the bottom center. No text. The gesture is enough.

**The feeling:** A cinema curtain opening. The client feels they are about to see something worth seeing.

### Phase 3: Browse

- Masonry grid — natural aspect ratios preserved
- Background: `#0A0A0A` throughout
- Photographer name: `top-left, 14px, 60% white opacity` — always visible, never intrusive
- Photos load progressively — each fades in individually as it loads. Never show a broken image placeholder.
- Lightbox on tap: full screen, no chrome. Swipe to navigate, tap anywhere to close.
- Select button: appears only on hover/tap of individual photo. Never permanently visible — it breaks the browse flow.

### Phase 4: Select

**Hearts, not checkboxes.** The selection is an emotional act. A heart icon on hover/tap. A checkbox feels like admin.

**Selected state:**
- Thin warm border (`1.5px, #D4537E`) around selected photos — not a checkmark overlay that covers the image
- Pink heart badge in the bottom-right corner of selected photo

**Selection count pill:**
- Floats bottom-center when 1+ photos are selected: "12 favourites"
- Tapping the pill reveals a horizontal strip of selected thumbnails

**Comment field:**
- Appears after first selection: "Add a note to [photographer first name]?" — first name only, never full name or "the photographer"
- Optional. Small. At the bottom.

**Selection complete screen:**
- Copy: "Your favourites are on their way to [first name]."
- Not "submitted". Not "sent". On their way. Warm. Human.

**Real-time photographer notification:**
- Each heart tap → POST /g/:slug/select → SSE → desktop app → `client_selected_photo` sound
- VaultGrid tile gets a pink heart badge immediately
- When client taps "Done selecting": desktop notification "[Client name] has chosen their N favourites." with one-click link to view them

### Gallery creation — what the photographer configures

Only these decisions matter. Nothing else:

| Setting | Default | Notes |
|---------|---------|-------|
| Cover photo | Highest sharpness portrait from shoot | Drag any photo to replace |
| Gallery title | Shoot name | e.g. "Smith Wedding" |
| Subtitle | Optional | e.g. "June 2025 · Malibu" |
| Password | Off | One toggle, one field |
| Download permission | Off | Download icon in lightbox only — never on grid |
| Expiry date | None | Expired page uses same dark aesthetic |

### GalleryBox → FinalPass → PayShot: the full loop

```
Photographer sends gallery
  → Client opens at 11pm
  → Taps hearts (each fires client_selected_photo sound in photographer's app)
  → Client taps "Done"
  → Desktop notification: "[Name] has chosen 24 favourites"
  → Photographer clicks "Export favourites" in VaultGrid
  → FinalPass exports selected photos
  → PayShot invoice sent
  → Client pays via Stripe
  → invoice_paid arpeggio plays
```

One seamless motion from gallery to paid. This loop is the business engine.

---

## ═══════════════════════════════════════════════════════
## ACADEMY MODE — In-app photographer training system
## ═══════════════════════════════════════════════════════

### Philosophy

AcademyMode is not a help section. It is a living mentor built into every corner of the app. It teaches photographers at the exact moment they need guidance — contextually, in the flow of real work, never interrupting unless invited.

### How it surfaces

1. **First-launch guided tour** — walks new users through the full workflow with real sample photos before they import anything
2. **Contextual coach tips** — small pulsing beacon on any tool the user hasn't used yet. Tap to see a 30-second animated lesson right there
3. **Lesson library** — dedicated Academy tab: full structured curriculum organised by skill level (Beginner → Intermediate → Advanced → Master)
4. **Challenge missions** — gamified exercises: "Edit this RAW photo to match this reference" — scored by SignatureAI similarity
5. **Progress tracker** — skills map showing what's been learned, what's unlocked next, XP points, and streak

### Full lesson curriculum

#### Track 1 — Beginner (unlock on install)
| # | Slug | Title | Engine | XP |
|---|------|-------|--------|-----|
| 1 | first-import | Your first import | VaultGrid | 10 |
| 2 | understand-raw | What is a RAW file | RawPulse | 10 |
| 3 | flag-and-cull | Culling like a pro | VaultGrid | 15 |
| 4 | exposure-basics | Exposure fundamentals | RawPulse | 15 |
| 5 | white-balance | White balance explained | RawPulse | 15 |
| 6 | first-export | Your first export | FinalPass | 10 |

#### Track 2 — Intermediate (unlock after all 6 beginner lessons)
| # | Slug | Title | Engine | XP |
|---|------|-------|--------|-----|
| 7 | tone-curves | Mastering tone curves | ChromaDesk | 25 |
| 8 | hsl-color | HSL color grading | ChromaDesk | 25 |
| 9 | ai-cull-workflow | SharpEye AI cull workflow | SharpEye | 20 |
| 10 | skin-smooth | Natural skin retouching | GlowKit | 25 |
| 11 | background-removal | Clean background removal | SceneDrop | 20 |
| 12 | masking-basics | AI masking introduction | MaskCraft | 25 |
| 13 | presets-workflow | Building your preset library | LookVault | 20 |
| 14 | film-grain | Film grain for authenticity | GrainLab | 20 |
| 15 | face-tools | Face enhancement naturally | FaceCast | 25 |

#### Track 3 — Advanced (unlock after any 9 intermediate lessons)
| # | Slug | Title | Engine | XP |
|---|------|-------|--------|-----|
| 16 | layer-compositing | Layer compositing deep dive | PixelForge | 40 |
| 17 | color-science | Professional color science | ChromaDesk | 40 |
| 18 | style-dna-train | Training your SignatureAI | SignatureAI | 50 |
| 19 | batch-workflow | Batch editing 500 photos | VaultGrid | 35 |
| 20 | tethered-shoot | Live tethered shooting | LiveTether | 40 |
| 21 | healing-retouch | Advanced healing & clone | PixelForge | 40 |
| 22 | lut-creation | Creating and using LUTs | ChromaDesk | 40 |
| 23 | gallery-delivery | Professional client delivery | GalleryBox | 35 |
| 24 | invoice-workflow | PayShot invoicing workflow | PayShot | 30 |

#### Track 4 — Master (unlock after any 16 advanced lessons)
| # | Slug | Title | Engine | XP |
|---|------|-------|--------|-----|
| 25 | signature-style | Defining your visual identity | SignatureAI | 75 |
| 26 | business-analytics | Reading your LensBiz data | LensBiz | 60 |
| 27 | headshot-workflow | HeadshotAI studio workflow | HeadshotAI | 75 |
| 28 | video-retouch | FrameGlow video retouching | FrameGlow | 75 |
| 29 | full-wedding-edit | Full wedding shoot edit | All engines | 100 |
| 30 | release-master | YmShotS mastery — finale | All engines | 150 |

### Coach tip triggers (all 8 — wire CoachBeacon to all of these)

```typescript
export const COACH_TIPS: Record<string, CoachTip> = {
  'vault.import_button': {
    headline: 'Import your first shoot',
    body: 'Drag a folder or connect your camera. YmShotS reads RAW, JPEG, HEIF, PNG — all at once.',
    lessonSlug: 'first-import', position: 'bottom',
  },
  'rawpulse.exposure_slider': {
    headline: 'Exposure is your foundation',
    body: 'Adjust exposure first, always. Then highlights and shadows. Never the other way around.',
    lessonSlug: 'exposure-basics', position: 'left',
  },
  'chromadesk.tone_curve': {
    headline: 'The curve is everything',
    body: 'An S-curve adds contrast. Lift the blacks for a matte look. Pull down highlights for cinema.',
    lessonSlug: 'tone-curves', position: 'left',
  },
  'signatureai.train_button': {
    headline: 'Train your personal AI',
    body: 'SignatureAI learns your edit fingerprint. After 50 pairs it can edit like you — automatically.',
    lessonSlug: 'style-dna-train', position: 'bottom',
  },
  'glowkit.smooth_slider': {
    headline: 'Less is always more',
    body: 'Keep smooth under 60. Texture preservation keeps skin looking real, not plastic.',
    lessonSlug: 'skin-smooth', position: 'left',
  },
  'grainlab.grain_slider': {
    headline: 'Add soul with grain',
    body: 'Real film grain is uneven — coarser in shadows, finer in highlights. GrainLab emulates that.',
    lessonSlug: 'film-grain', position: 'left',
  },
  'finalpass.export_button': {
    headline: 'Export like a professional',
    body: 'Always embed sRGB for web delivery. Send TIFF for print. One click sends to your client gallery.',
    lessonSlug: 'first-export', position: 'top',
  },
  'gallerybox.send_button': {
    headline: 'Deliver with your brand',
    body: 'GalleryBox galleries show your name, not ours. Clients pick favourites and you get notified.',
    lessonSlug: 'gallery-delivery', position: 'top',
  },
}
```

### Academy database tables (add to Prisma schema)

```prisma
model AcademyLesson {
  id              String     @id @default(uuid())
  slug            String     @unique
  title           String
  description     String
  skillLevel      SkillLevel
  engine          EditEngine?
  durationSeconds Int
  xpReward        Int        @default(10)
  sortOrder       Int
  isPublished     Boolean    @default(true)
  contentJson     Json
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt

  progress   UserAcademyProgress[]
  challenges AcademyChallenge[]

  @@map("academy_lessons")
}

model UserAcademyProgress {
  id           String       @id @default(uuid())
  userId       String
  lessonId     String
  status       LessonStatus @default(NOT_STARTED)
  completedAt  DateTime?
  xpEarned     Int          @default(0)
  attemptCount Int          @default(0)
  lastSeenAt   DateTime?

  user   User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  lesson AcademyLesson @relation(fields: [lessonId], references: [id])

  @@unique([userId, lessonId])
  @@map("user_academy_progress")
}

model AcademyChallenge {
  id                String   @id @default(uuid())
  lessonId          String
  title             String
  description       String
  samplePhotoPath   String
  referenceEditJson Json
  scoringEngine     String   @default("signatureai")
  xpReward          Int      @default(25)
  createdAt         DateTime @default(now())

  lesson      AcademyLesson         @relation(fields: [lessonId], references: [id])
  submissions ChallengeSubmission[]

  @@map("academy_challenges")
}

model ChallengeSubmission {
  id              String   @id @default(uuid())
  challengeId     String
  userId          String
  editJson        Json
  similarityScore Decimal  @db.Decimal(4, 3)
  passed          Boolean
  submittedAt     DateTime @default(now())

  challenge AcademyChallenge @relation(fields: [challengeId], references: [id])
  user      User             @relation(fields: [userId], references: [id])

  @@map("challenge_submissions")
}

model UserAcademyStats {
  userId            String       @id
  totalXp           Int          @default(0)
  currentStreak     Int          @default(0)
  longestStreak     Int          @default(0)
  lessonsCompleted  Int          @default(0)
  challengesPassed  Int          @default(0)
  currentLevel      AcademyLevel @default(BEGINNER)
  lastActiveDate    DateTime?
  updatedAt         DateTime     @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_academy_stats")
}

enum SkillLevel   { BEGINNER INTERMEDIATE ADVANCED MASTER }
enum LessonStatus { NOT_STARTED IN_PROGRESS COMPLETED }
enum AcademyLevel { BEGINNER APPRENTICE PROFESSIONAL MASTER LEGEND }
```

---

## ═══════════════════════════════════════════════════════
## PITCH DECK — Self-selling in-app pitch flow
## ═══════════════════════════════════════════════════════

### When PitchDeck appears
1. Welcome screen — first launch before onboarding choice
2. Plan gate — when a free user tries a PRO feature
3. About screen — always accessible from app menu
4. Share link — generates a web-based pitch page
5. Upgrade prompt — periodic gentle nudge (max once per 7 days)

### PitchDeck 7 slides

| Slide | Type | Key element |
|-------|------|-------------|
| 1 | Hero | YmShotS logo + tagline + animated shutter + CreatorSignature |
| 2 | Problem | "Every other app makes you choose." |
| 3 | Solution | Engine bullet list with live workspace preview |
| 4 | SignatureAI | "An AI that edits exactly like you." + stat: 96% less editing time |
| 5 | Academy | "Learn while you shoot." + 30 lessons stat |
| 6 | Release | Release badge + "Built by ta-tech" |
| 7 | Upgrade | Live pricing cards — FREE / PRO / STUDIO |

### Pricing

| Tier | Price | Key features |
|------|-------|-------------|
| FREE | $0 always | 15 AI edits/day, all manual RAW tools, 30 filters, export to 24MP |
| PRO | $9.99/mo or $79 one-time | Unlimited AI, SignatureAI, 150+ filters, GalleryBox, PayShot, Academy, mobile sync, video retouch |
| STUDIO | $24.99/mo | Everything Pro + 3 seats, shared style library, team analytics, white-label galleries |

---

## ═══════════════════════════════════════════════════════
## CREATOR SIGNATURE — Ym's mark on the app
## ═══════════════════════════════════════════════════════

### The 8 placements — all required

1. **Splash screen** — "Built by ta-tech" centered below logo, animated fade-in
2. **About screen** — full message block (see below)
3. **Welcome tour** — last slide of first-launch tour
4. **PitchDeck release slide** — with animated release badge
5. **Exported photo EXIF** — `Software: "YmShotS 1.0 by ta-tech"` + `Artist: user.fullName`
6. **GalleryBox footer** — `11px, 20% white opacity` — invisible unless looking
7. **Invoice footer** — "Powered by YmShotS"
8. **Window title bar** — "YmShotS — Built by ta-tech"

### About screen message

```
YmShotS was built by ta-tech — because every creative deserves tools as exceptional as their vision.
deserves tools as exceptional as their vision.
This is the v1.0. You flew it first.
— ta-tech
```

---

## Complete Prisma schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                  String    @id @default(uuid())
  email               String    @unique
  passwordHash        String
  fullName            String
  avatarUrl           String?
  planTier            PlanTier  @default(FREE)
  planExpiresAt       DateTime?
  stripeCustomerId    String?
  timezone            String    @default("UTC")
  locale              String    @default("en-US")
  onboardingCompleted Boolean   @default(false)
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt

  sessions             UserSession[]
  preferences          UserPreferences?
  shoots               Shoot[]
  clients              Client[]
  styleProfiles        StyleProfile[]
  presets              Preset[]
  galleries            Gallery[]
  invoices             Invoice[]
  tetherSessions       TetherSession[]
  exportJobs           ExportJob[]
  analyticsEvents      AnalyticsEvent[]
  timeLog              ShootTimeLog[]
  revenueSnaps         RevenueSnapshot[]
  soundLog             SoundEventLog[]
  academyProgress      UserAcademyProgress[]
  academyStats         UserAcademyStats?
  challengeSubmissions ChallengeSubmission[]

  @@map("users")
}

model UserSession {
  id               String     @id @default(uuid())
  userId           String
  deviceName       String?
  deviceType       DeviceType
  refreshTokenHash String
  lastActiveAt     DateTime   @default(now())
  expiresAt        DateTime
  createdAt        DateTime   @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_sessions")
}

model UserPreferences {
  userId               String       @id
  theme                Theme        @default(SYSTEM)
  soundEnabled         Boolean      @default(true)
  soundVolume          Decimal      @default(0.70) @db.Decimal(3, 2)
  hapticsEnabled       Boolean      @default(true)
  defaultExportFormat  ExportFormat @default(JPEG)
  defaultExportQuality Int          @default(92)
  defaultColorProfile  String       @default("sRGB")
  gridSize             GridSize     @default(MEDIUM)
  showHistogram        Boolean      @default(true)
  currency             String       @default("USD") @db.Char(3)
  showCoachTips        Boolean      @default(true)
  updatedAt            DateTime     @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_preferences")
}

model Shoot {
  id            String      @id @default(uuid())
  userId        String
  clientId      String?
  name          String
  shootType     ShootType
  shootDate     DateTime?   @db.Date
  locationName  String?
  locationLat   Decimal?    @db.Decimal(9, 6)
  locationLng   Decimal?    @db.Decimal(9, 6)
  totalPhotos   Int         @default(0)
  flaggedCount  Int         @default(0)
  status        ShootStatus @default(IMPORTING)
  coverPhotoId  String?
  notes         String?
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  user         User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  client       Client?        @relation(fields: [clientId], references: [id])
  photos       Photo[]
  galleries    Gallery[]
  invoices     Invoice[]
  timeLogs     ShootTimeLog[]
  tethSessions TetherSession[]

  @@map("shoots")
}

model Photo {
  id               String     @id @default(uuid())
  shootId          String
  userId           String
  filenameOriginal String
  filenameStored   String
  storagePath      String
  fileFormat       FileFormat
  cameraMake       String?
  cameraModel      String?
  lensModel        String?
  focalLengthMm    Decimal?   @db.Decimal(6, 1)
  aperture         Decimal?   @db.Decimal(4, 1)
  shutterSpeed     String?
  iso              Int?
  widthPx          Int
  heightPx         Int
  fileSizeBytes    BigInt
  capturedAt       DateTime?
  gpsLat           Decimal?   @db.Decimal(9, 6)
  gpsLng           Decimal?   @db.Decimal(9, 6)
  flagStatus       FlagStatus @default(NONE)
  starRating       Int?       @db.SmallInt
  colorLabel       ColorLabel @default(NONE)
  isInFocus        Boolean?
  faceCount        Int?       @db.SmallInt
  expressionScore  Decimal?   @db.Decimal(3, 2)
  sharpnessScore   Decimal?   @db.Decimal(3, 2)
  thumbnailPath    String?
  previewPath      String?
  createdAt        DateTime   @default(now())
  updatedAt        DateTime   @updatedAt

  shoot           Shoot               @relation(fields: [shootId], references: [id], onDelete: Cascade)
  keywords        PhotoKeyword[]
  collectionItems CollectionPhoto[]
  editSessions    EditSession[]
  faceSessions    FaceSession[]
  galleryPhotos   GalleryPhoto[]
  trainingPairs   StyleTrainingPair[]

  @@map("photos")
}

model PhotoKeyword {
  photoId String
  keyword String
  source  KeywordSource

  photo Photo @relation(fields: [photoId], references: [id], onDelete: Cascade)

  @@id([photoId, keyword])
  @@map("photo_keywords")
}

model PhotoCollection {
  id              String   @id @default(uuid())
  userId          String
  name            String
  isSmart         Boolean  @default(false)
  smartFilterJson Json?
  createdAt       DateTime @default(now())

  photos CollectionPhoto[]

  @@map("photo_collections")
}

model CollectionPhoto {
  collectionId String
  photoId      String
  sortOrder    Int

  collection PhotoCollection @relation(fields: [collectionId], references: [id], onDelete: Cascade)
  photo      Photo           @relation(fields: [photoId], references: [id], onDelete: Cascade)

  @@id([collectionId, photoId])
  @@map("collection_photos")
}

model EditSession {
  id          String   @id @default(uuid())
  photoId     String
  userId      String
  isActive    Boolean  @default(true)
  editVersion Int      @default(1)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  photo        Photo            @relation(fields: [photoId], references: [id], onDelete: Cascade)
  adjustments  EditAdjustment[]
  history      EditHistory[]
  layers       Layer[]
  faceSessions FaceSession[]

  @@map("edit_sessions")
}

model EditAdjustment {
  id            String     @id @default(uuid())
  sessionId     String
  engine        EditEngine
  adjustmentKey String
  valueNumber   Decimal?   @db.Decimal(10, 4)
  valueJson     Json?
  appliedAt     DateTime   @default(now())

  session EditSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  @@map("edit_adjustments")
}

model EditHistory {
  id           String   @id @default(uuid())
  sessionId    String
  snapshotJson Json
  label        String?
  createdAt    DateTime @default(now())

  session EditSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  @@map("edit_history")
}

model Layer {
  id         String    @id @default(uuid())
  sessionId  String
  name       String
  type       LayerType
  blendMode  String    @default("normal")
  opacity    Decimal   @default(1.00) @db.Decimal(3, 2)
  isVisible  Boolean   @default(true)
  sortOrder  Int
  paramsJson Json?
  createdAt  DateTime  @default(now())

  session EditSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  masks   Mask[]

  @@map("layers")
}

model Mask {
  id           String   @id @default(uuid())
  layerId      String
  type         MaskType
  feather      Decimal  @default(0) @db.Decimal(5, 2)
  density      Decimal  @default(1.00) @db.Decimal(3, 2)
  invert       Boolean  @default(false)
  maskDataPath String?
  createdAt    DateTime @default(now())

  layer Layer @relation(fields: [layerId], references: [id], onDelete: Cascade)

  @@map("masks")
}

model StyleProfile {
  id                 String         @id @default(uuid())
  userId             String
  name               String
  shootType          StyleShootType @default(ALL)
  confidenceScore    Decimal?       @db.Decimal(3, 2)
  trainingPhotoCount Int            @default(0)
  modelVersion       String?
  modelPath          String?
  isActive           Boolean        @default(true)
  isPublic           Boolean        @default(false)
  swatchColor        String         @default("#D4537E") @db.Char(7)
  createdAt          DateTime       @default(now())
  updatedAt          DateTime       @updatedAt

  user          User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  trainingPairs StyleTrainingPair[]

  @@map("style_profiles")
}

model StyleTrainingPair {
  id             String   @id @default(uuid())
  profileId      String
  photoId        String
  beforeEditJson Json
  afterEditJson  Json
  qualityWeight  Decimal  @default(1.00) @db.Decimal(3, 2)
  createdAt      DateTime @default(now())

  profile StyleProfile @relation(fields: [profileId], references: [id], onDelete: Cascade)
  photo   Photo        @relation(fields: [photoId], references: [id], onDelete: Cascade)

  @@map("style_training_pairs")
}

model Preset {
  id              String       @id @default(uuid())
  userId          String
  name            String
  category        String?
  source          PresetSource @default(USER)
  adjustmentsJson Json
  thumbnailPath   String?
  downloadCount   Int          @default(0)
  priceCents      Int          @default(0)
  createdAt       DateTime     @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("presets")
}

model FaceSession {
  id               String   @id @default(uuid())
  photoId          String
  sessionId        String
  faceIndex        Int      @db.SmallInt
  detectionBoxJson Json
  landmarkJson     Json?
  createdAt        DateTime @default(now())

  photo       Photo              @relation(fields: [photoId], references: [id], onDelete: Cascade)
  editSession EditSession        @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  adjustments BeautyAdjustment[]

  @@map("face_sessions")
}

model BeautyAdjustment {
  id            String     @id @default(uuid())
  faceSessionId String
  tool          BeautyTool
  intensity     Decimal    @db.Decimal(3, 2)
  paramsJson    Json?
  appliedAt     DateTime   @default(now())

  faceSession FaceSession @relation(fields: [faceSessionId], references: [id], onDelete: Cascade)

  @@map("beauty_adjustments")
}

model MakeupLook {
  id            String   @id @default(uuid())
  userId        String
  name          String
  lookJson      Json
  thumbnailPath String?
  isFavorite    Boolean  @default(false)
  createdAt     DateTime @default(now())

  @@map("makeup_looks")
}

model Client {
  id              String   @id @default(uuid())
  userId          String
  fullName        String
  email           String
  phone           String?
  company         String?
  notes           String?
  totalSpentCents BigInt   @default(0)
  shootCount      Int      @default(0)
  createdAt       DateTime @default(now())

  user     User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  shoots   Shoot[]
  invoices Invoice[]

  @@map("clients")
}

model Gallery {
  id               String        @id @default(uuid())
  shootId          String
  userId           String
  slug             String        @unique
  title            String
  subtitle         String?
  passwordHash     String?
  watermarkEnabled Boolean       @default(false)
  watermarkText    String?
  downloadAllowed  Boolean       @default(false)
  expiresAt        DateTime?
  viewCount        Int           @default(0)
  status           GalleryStatus @default(DRAFT)
  createdAt        DateTime      @default(now())

  shoot  Shoot          @relation(fields: [shootId], references: [id], onDelete: Cascade)
  user   User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  photos GalleryPhoto[]

  @@map("galleries")
}

model GalleryPhoto {
  galleryId      String
  photoId        String
  sortOrder      Int
  clientSelected Boolean @default(false)
  clientComment  String?

  gallery Gallery @relation(fields: [galleryId], references: [id], onDelete: Cascade)
  photo   Photo   @relation(fields: [photoId], references: [id], onDelete: Cascade)

  @@id([galleryId, photoId])
  @@map("gallery_photos")
}

model Invoice {
  id                    String        @id @default(uuid())
  userId                String
  clientId              String
  shootId               String?
  invoiceNumber         String        @unique
  status                InvoiceStatus @default(DRAFT)
  subtotalCents         BigInt
  taxRate               Decimal       @db.Decimal(5, 4)
  taxCents              BigInt
  totalCents            BigInt
  currency              String        @db.Char(3)
  dueDate               DateTime?     @db.Date
  paidAt                DateTime?
  stripePaymentIntentId String?
  notes                 String?
  createdAt             DateTime      @default(now())

  user      User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  client    Client            @relation(fields: [clientId], references: [id])
  shoot     Shoot?            @relation(fields: [shootId], references: [id])
  lineItems InvoiceLineItem[]

  @@map("invoices")
}

model InvoiceLineItem {
  id             String  @id @default(uuid())
  invoiceId      String
  description    String
  quantity       Decimal @db.Decimal(8, 2)
  unitPriceCents BigInt
  totalCents     BigInt
  sortOrder      Int

  invoice Invoice @relation(fields: [invoiceId], references: [id], onDelete: Cascade)

  @@map("invoice_line_items")
}

model ShootTimeLog {
  id              String     @id @default(uuid())
  shootId         String
  userId          String
  phase           ShootPhase
  startedAt       DateTime
  endedAt         DateTime?
  durationSeconds Int?

  shoot Shoot @relation(fields: [shootId], references: [id], onDelete: Cascade)
  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("shoot_time_logs")
}

model AnalyticsEvent {
  id            String   @id @default(uuid())
  userId        String
  eventType     String
  eventDataJson Json?
  sessionId     String?
  createdAt     DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("analytics_events")
}

model RevenueSnapshot {
  id                String   @id @default(uuid())
  userId            String
  periodMonth       String   @db.Char(7)
  totalRevenueCents BigInt
  invoicesSent      Int
  invoicesPaid      Int
  shootsCompleted   Int
  avgJobValueCents  BigInt
  calculatedAt      DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, periodMonth])
  @@map("revenue_snapshots")
}

model AcademyLesson {
  id              String     @id @default(uuid())
  slug            String     @unique
  title           String
  description     String
  skillLevel      SkillLevel
  engine          EditEngine?
  durationSeconds Int
  xpReward        Int        @default(10)
  sortOrder       Int
  isPublished     Boolean    @default(true)
  contentJson     Json
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt

  progress   UserAcademyProgress[]
  challenges AcademyChallenge[]

  @@map("academy_lessons")
}

model UserAcademyProgress {
  id           String       @id @default(uuid())
  userId       String
  lessonId     String
  status       LessonStatus @default(NOT_STARTED)
  completedAt  DateTime?
  xpEarned     Int          @default(0)
  attemptCount Int          @default(0)
  lastSeenAt   DateTime?

  user   User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  lesson AcademyLesson @relation(fields: [lessonId], references: [id])

  @@unique([userId, lessonId])
  @@map("user_academy_progress")
}

model AcademyChallenge {
  id                String   @id @default(uuid())
  lessonId          String
  title             String
  description       String
  samplePhotoPath   String
  referenceEditJson Json
  scoringEngine     String   @default("signatureai")
  xpReward          Int      @default(25)
  createdAt         DateTime @default(now())

  lesson      AcademyLesson         @relation(fields: [lessonId], references: [id])
  submissions ChallengeSubmission[]

  @@map("academy_challenges")
}

model ChallengeSubmission {
  id              String   @id @default(uuid())
  challengeId     String
  userId          String
  editJson        Json
  similarityScore Decimal  @db.Decimal(4, 3)
  passed          Boolean
  submittedAt     DateTime @default(now())

  challenge AcademyChallenge @relation(fields: [challengeId], references: [id])
  user      User             @relation(fields: [userId], references: [id])

  @@map("challenge_submissions")
}

model UserAcademyStats {
  userId            String       @id
  totalXp           Int          @default(0)
  currentStreak     Int          @default(0)
  longestStreak     Int          @default(0)
  lessonsCompleted  Int          @default(0)
  challengesPassed  Int          @default(0)
  currentLevel      AcademyLevel @default(BEGINNER)
  lastActiveDate    DateTime?
  updatedAt         DateTime     @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_academy_stats")
}

model PitchView {
  id           String      @id @default(uuid())
  userId       String?
  source       PitchSource
  slideReached Int         @default(1)
  converted    Boolean     @default(false)
  planChosen   PlanTier?
  viewedAt     DateTime    @default(now())

  @@map("pitch_views")
}

model TetherSession {
  id             String         @id @default(uuid())
  userId         String
  shootId        String
  cameraMake     String?
  cameraModel    String?
  connectionType ConnectionType
  startedAt      DateTime       @default(now())
  endedAt        DateTime?
  photosReceived Int            @default(0)

  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  shoot Shoot @relation(fields: [shootId], references: [id], onDelete: Cascade)

  @@map("tether_sessions")
}

model ExportJob {
  id               String       @id @default(uuid())
  userId           String
  photoIdsJson     Json
  format           ExportFormat
  quality          Int?         @db.SmallInt
  longEdgePx       Int?
  colorProfile     String?
  sharpening       Int?         @db.SmallInt
  watermarkEnabled Boolean      @default(false)
  stripMetadata    Boolean      @default(false)
  renamePattern    String?
  outputPath       String?
  status           JobStatus    @default(QUEUED)
  progressPct      Int          @default(0) @db.SmallInt
  startedAt        DateTime?
  completedAt      DateTime?
  createdAt        DateTime     @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("export_jobs")
}

model SoundEventLog {
  id           String   @id @default(uuid())
  userId       String
  eventKey     String
  playedAt     DateTime @default(now())
  volumeAtTime Decimal  @db.Decimal(3, 2)

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sound_events_log")
}

enum PlanTier       { FREE PRO STUDIO }
enum DeviceType     { MOBILE DESKTOP TABLET }
enum Theme          { LIGHT DARK SYSTEM }
enum ExportFormat   { JPEG TIFF PNG WEBP RAW_XMP HEIF }
enum GridSize       { SMALL MEDIUM LARGE }
enum ShootType      { WEDDING PORTRAIT COMMERCIAL EVENT STREET PRODUCT WILDLIFE OTHER }
enum ShootStatus    { IMPORTING CULLING EDITING DELIVERING ARCHIVED }
enum FileFormat     { RAW JPEG HEIF PNG TIFF }
enum FlagStatus     { NONE FLAGGED REJECTED }
enum ColorLabel     { RED YELLOW GREEN BLUE PURPLE NONE }
enum KeywordSource  { USER AI }
enum EditEngine     { RAWPULSE PIXELFORGE GLOWKIT FACECAST CHROMADESK GRAINLAB SCENEDROP CLEANSLATE }
enum LayerType      { ADJUSTMENT MASK STAMP HEALING TEXT }
enum MaskType       { SUBJECT SKY SKIN LUMINOSITY GRADIENT BRUSH AI_CUSTOM }
enum StyleShootType { WEDDING PORTRAIT COMMERCIAL ALL }
enum PresetSource   { USER LOOKVAULT MARKETPLACE }
enum BeautyTool     { SMOOTH BLEMISH GLOW TEETH EYES CONTOUR RESHAPE MAKEUP HAIR_COLOR HAIR_STYLE BEARD AGE_MORPH GENDER_SWAP TAN PORE_REFINE }
enum GalleryStatus  { DRAFT ACTIVE EXPIRED ARCHIVED }
enum InvoiceStatus  { DRAFT SENT VIEWED PAID OVERDUE CANCELLED }
enum ShootPhase     { SHOOTING IMPORTING CULLING EDITING DELIVERING }
enum ConnectionType { USB WIFI }
enum JobStatus      { QUEUED PROCESSING COMPLETE FAILED }
enum SkillLevel     { BEGINNER INTERMEDIATE ADVANCED MASTER }
enum LessonStatus   { NOT_STARTED IN_PROGRESS COMPLETED }
enum AcademyLevel   { BEGINNER APPRENTICE PROFESSIONAL MASTER LEGEND }
enum PitchSource    { WELCOME PLAN_GATE ABOUT SHARE_LINK UPGRADE_NUDGE }
```

---

## SoundPulse — all 21 events

Every sound synthesized via Web Audio API — no audio files.

```typescript
export const SOUND_EVENTS = {
  shutter_click:          { type: 'sine+noise', durationMs: 80,  freqStart: 800, freqEnd: 200,   haptic: 'medium' },
  shutter_burst:          { type: 'repeat',     count: 3, gapMs: 40, volumeEnvelope: [1.0,0.7,0.5], haptic: 'light_x3' },
  ai_processing_start:    { type: 'sweep',      durationMs: 200, freqStart: 440, freqEnd: 880,   haptic: 'none' },
  ai_processing_complete: { type: 'chime_pair', tones: [880,1320], durationMs: 120, gapMs: 60,   haptic: 'success' },
  signatureai_applied:    { type: 'arpeggio',   notes: ['C4','E4','G4'], durationMsEach: 80, reverbTailMs: 300, haptic: 'light_pulse' },
  slider_tick:            { type: 'tick',       durationMs: 12,  freq: 2000,                     haptic: 'selection' },
  reset_to_default:       { type: 'pop_down',   durationMs: 40,  freqStart: 600, freqEnd: 300,   haptic: 'rigid' },
  layer_add:              { type: 'ding',       durationMs: 60,  freq: 1200,                     haptic: 'light' },
  mask_detected:          { type: 'whoosh',     durationMs: 180,                                  haptic: 'none' },
  before_after_toggle:    { type: 'swish',      durationMs: 80,  pan: 'left_to_right',            haptic: 'selection' },
  flag_photo:             { type: 'stamp',      durationMs: 50,  freq: 400,                       haptic: 'medium_rigid' },
  reject_photo:           { type: 'pop',        durationMs: 40,  freq: 300,                       haptic: 'medium' },
  star_rating:            { type: 'multi_ding', noteHz: 523, durationMsEach: 40,                  haptic: 'selection_per_star' },
  export_started:         { type: 'launch',     durationMs: 200,                                  haptic: 'medium_notification' },
  export_complete:        { type: 'arpeggio_triumph', notes: ['C4','E4','G4','C5'], durationMsEach: 100, timbre: 'warm_bell', reverbMs: 400, haptic: 'success_heavy' },
  gallery_sent:           { type: 'whoosh_high', durationMs: 150,                                 haptic: 'medium_notification' },
  client_selected_photo:  { type: 'chime',      durationMs: 80,  freq: 1000,                     haptic: 'light' },
  invoice_paid:           { type: 'arpeggio_bright', notes: ['C5','E5','G5'], durationMsEach: 100, tail: true, haptic: 'success_heavy_x2' },
  error:                  { type: 'double_tap', count: 2, durationMs: 30, freq: 200,              haptic: 'error_x2' },
  sync_complete:          { type: 'confirm_pair', tones: [600,900], durationMs: 60,               haptic: 'light' },
  tether_connected:       { type: 'beep_ascending', count: 3, durationMs: 67,                    haptic: 'medium_x3' },
} as const;

export type SoundEventKey = keyof typeof SOUND_EVENTS;
```

**Note on SignatureAI milestone sounds:**
- Pair 10 (first fingerprint): `ai_processing_complete`
- Pair 30 (style card appears): `signatureai_applied`
- Batch apply complete: `signatureai_applied`
- Pair 100 (Expert milestone): `export_complete` — the full triumph arpeggio, not the AI chime. This is a celebration.

---

## API conventions

- All routes prefixed: `/api/v1/`
- Auth header: `Authorization: Bearer <jwt>`
- Pagination: `?page=1&limit=50`
- Response envelope: `{ data, meta, error }`
- Timestamps: ISO 8601 UTC
- IDs: UUID v4 everywhere

## Core API routes

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
GET    /api/v1/users/me
PATCH  /api/v1/users/me
PATCH  /api/v1/users/me/preferences
GET    /api/v1/shoots
POST   /api/v1/shoots
GET    /api/v1/shoots/:id
PATCH  /api/v1/shoots/:id
DELETE /api/v1/shoots/:id
GET    /api/v1/shoots/:id/photos
POST   /api/v1/shoots/:id/photos/import
PATCH  /api/v1/photos/:id
DELETE /api/v1/photos/:id
POST   /api/v1/photos/:id/flag
POST   /api/v1/photos/:id/rate
POST   /api/v1/photos/batch/flag
POST   /api/v1/photos/batch/sharpeye
GET    /api/v1/photos/:id/edit
POST   /api/v1/photos/:id/edit/adjust
POST   /api/v1/photos/:id/edit/undo
POST   /api/v1/photos/:id/edit/redo
POST   /api/v1/photos/:id/edit/reset
GET    /api/v1/photos/:id/edit/history
GET    /api/v1/style-profiles
POST   /api/v1/style-profiles
POST   /api/v1/style-profiles/:id/train
POST   /api/v1/style-profiles/:id/apply
DELETE /api/v1/style-profiles/:id
GET    /api/v1/clients
POST   /api/v1/clients
GET    /api/v1/clients/:id
PATCH  /api/v1/clients/:id
GET    /api/v1/galleries
POST   /api/v1/galleries
GET    /api/v1/galleries/:id
PATCH  /api/v1/galleries/:id
POST   /api/v1/galleries/:id/send
GET    /api/v1/galleries/:id/events    (SSE — photographer subscribes for client selections)
GET    /g/:slug                         (public gallery — no auth, dark #0A0A0A, photographer brand only)
POST   /g/:slug/select                  (client heart tap — fires SSE to photographer)
GET    /api/v1/invoices
POST   /api/v1/invoices
GET    /api/v1/invoices/:id
PATCH  /api/v1/invoices/:id
POST   /api/v1/invoices/:id/send
POST   /api/v1/invoices/:id/payment-link
POST   /api/v1/webhooks/stripe
GET    /api/v1/analytics/revenue
GET    /api/v1/analytics/shoots
GET    /api/v1/analytics/time
GET    /api/v1/analytics/style-trends
POST   /api/v1/export-jobs
GET    /api/v1/export-jobs/:id
GET    /api/v1/presets
POST   /api/v1/presets
DELETE /api/v1/presets/:id
GET    /api/v1/academy/lessons
GET    /api/v1/academy/lessons/:slug
GET    /api/v1/academy/progress
POST   /api/v1/academy/progress/:lessonId/complete
GET    /api/v1/academy/stats
POST   /api/v1/academy/challenges/:id/submit
POST   /api/v1/pitch/view
```

---

## Build order for Claude Code

Work through phases in order. Complete each phase fully — including the verification checklist — before starting the next.

At the start of every Claude Code session, paste this:

```
Read CLAUDE.md before doing anything.
You are working on Phase [N]: [Phase Title].
Do not touch code outside this phase's scope.
Non-negotiables: UUIDs, timestamptz, BigInt cents, on-device AI only, originals untouched.
```

1.  Monorepo scaffold (Turborepo + pnpm workspaces)
2.  packages/db — full Prisma schema, migration, seed
3.  apps/api — Fastify server, auth, tRPC router, all routes
4.  packages/rawpulse — RAW decoding + non-destructive edit pipeline
5.  apps/desktop shell — Electron main + preload + React skeleton + CreatorSignature component
6.  PitchDeck — 7-slide pitch flow (wraps the welcome screen)
7.  WelcomeTour — 6-step guided first-launch tour
8.  VaultGrid — import, EXIF, thumbnails, cull UI
9.  packages/ai-core — ONNX wrappers: SharpEye, FaceCast, GlowKit, MaskCraft, SceneDrop
10. packages/soundpulse — Web Audio synth engine, all 21 events
11. AcademyMode — lesson player, coach beacons, progress tracker, challenge system
12. PixelForge — layer system, blend modes, healing brush
13. ChromaDesk — HSL, tone curves, color wheels, LUTs
14. GrainLab — film grain emulsion engine
15. SignatureAI — all 5 emotional states, training pipeline, on-device inference, style card, milestone moments
16. GalleryBox — arrival experience (dark, photographer-brand-first), public routes, SSE, client selection with hearts
17. PayShot — invoice CRUD, Stripe checkout, webhook handler
18. LensBiz — analytics dashboard, time tracking, revenue charts
19. LiveTether — USB + Wi-Fi camera connection
20. FinalPass — export engine, batch processing, ICC profiles, EXIF signature
21. apps/mobile — React Native + Expo, full feature parity, AcademyMode mobile
22. End-to-end QA, Academy content population, release build

---

## The 10 most common Claude Code mistakes — check every output

| Mistake | What to grep for |
|---------|-----------------|
| Integer IDs in migrations | Any `@id` without `@default(uuid())` |
| Float money | Any "price", "total", "amount" as Float or Decimal — must be BigInt |
| Naive DateTime | "timestamp without time zone" in migration SQL |
| External AI calls | Any `fetch()` or `axios` inside `ai-core` |
| Modifying originals | Any `fs.writeFile` to the same path as `storagePath` |
| Missing plan gate | PRO features without `usePlanGate()` call |
| Hardcoded colors | Any `#hex` or `rgb()` in component CSS |
| Missing sound events | Flag, reject, export, AI complete, invoice paid — all need `play()` calls |
| Missing CoachBeacon | All 8 coach tip elements need beacons |
| Missing creator signature | All 8 placement locations must have it |
| GalleryBox with white background | Client gallery must be `#0A0A0A` throughout |
| Gallery showing YmShotS brand | Photographer name is the only brand clients see |
| Photo count on gallery | Never display "N photos" to clients |
| SignatureAI disabled button | Dormant state has NO "Train" button — absence, not disabled |

---

## Phase gate checklist (run before every phase transition)

```
☐  All files compile without TypeScript errors (pnpm typecheck)
☐  All tests pass (pnpm test --filter=@ymshots/[package])
☐  Feature works end-to-end in development (pnpm dev)
☐  No blocking TODOs
☐  Non-negotiables verified: UUIDs, timestamptz, BigInt cents, AI on-device, originals untouched
☐  SoundPulse events wired for all new user actions
☐  CoachBeacons on all first-use UI elements
☐  Dark mode tested for all new components
☐  CreatorSignature on any new public-facing surface
☐  SignatureAI: all 5 state transitions implemented and tested
☐  GalleryBox: client pages verified dark, photographer-brand-first, no photo count
```

---

## Performance targets

| Operation               | Target              |
|-------------------------|---------------------|
| RAW file decode         | < 2 seconds         |
| Thumbnail generation    | < 300ms             |
| AI cull (per photo)     | < 500ms             |
| Face detection          | < 200ms             |
| Style DNA apply (batch) | < 30s / 500 photos  |
| Export (JPEG, 24MP)     | < 1s per photo      |
| App cold start          | < 3 seconds         |
| UI interaction response | < 16ms (60fps)      |
| Academy lesson load     | < 200ms             |
| Pitch deck slide change | < 100ms             |
| Gallery first paint     | < 2s on 3G          |
| Client selection → photographer sound | < 2s via SSE |

---

## Keyboard shortcuts (desktop)

```
P            Flag photo
X            Reject photo
U            Unflag photo
1-5          Star rating
G            Grid view
E            Edit view
L            Loupe / zoom
Z            Toggle zoom 100% / fit
Cmd+Z        Undo
Cmd+Shift+Z  Redo
Cmd+E        Export selected
Cmd+S        Save edit session
Space        Before/after compare (hold)
Tab          Next photo
Shift+Tab    Previous photo
Cmd+A        Select all
Cmd+D        Deselect all
Cmd+?        Open AcademyMode
```

---

## Environment variables

```env
DATABASE_URL=postgresql://ymshots:password@localhost:5432/ymshots
REDIS_URL=redis://localhost:6379
JWT_SECRET=<256-bit-random-secret>
JWT_REFRESH_SECRET=<256-bit-random-secret>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STORAGE_DRIVER=local
S3_BUCKET=ymshots-storage
S3_ENDPOINT=https://...
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
ONNX_MODEL_DIR=/opt/ymshots/models
NODE_ENV=development
API_PORT=3001
API_HOST=0.0.0.0
FRONTEND_URL=http://localhost:3000
SENTRY_DSN=https://...
```

---
*YmShotS — v1.0. Built by ta-tech.*

---

## ═══════════════════════════════════════════════════════
## CRITICAL TYPE DEFINITIONS — copy these exactly
## ═══════════════════════════════════════════════════════

### EditState — the central type of the entire app

Every editor panel, every adjustment slider, every AI apply, every export reads and writes this shape. Never invent it — use this exact definition.

```typescript
// packages/types/src/edit.ts

export interface EditState {
  // Tone (RawPulse)
  exposure:       number   // -5.0 to +5.0,   default 0
  highlights:     number   // -100 to +100,    default 0
  shadows:        number   // -100 to +100,    default 0
  whites:         number   // -100 to +100,    default 0
  blacks:         number   // -100 to +100,    default 0
  contrast:       number   // -100 to +100,    default 0
  clarity:        number   // -100 to +100,    default 0
  vibrance:       number   // -100 to +100,    default 0
  saturation:     number   // -100 to +100,    default 0

  // Color (ChromaDesk)
  temperature:    number   // 2000–16000K,     default 5500
  tint:           number   // -150 to +150,    default 0
  hsl:            HslAdjustments
  toneCurve:      ToneCurve
  colorWheels:    ColorWheels

  // Detail
  sharpening:     number   // 0–150,           default 0
  noiseReduction: number   // 0–100,           default 0

  // GrainLab
  grainAmount:    number   // 0–100,           default 0
  grainSize:      number   // 0–100,           default 0
  grainRoughness: number   // 0–100,           default 0
  grainLuminance: boolean  // default true
}

export interface HslAdjustments {
  red:     { hue: number; saturation: number; luminance: number }
  orange:  { hue: number; saturation: number; luminance: number }
  yellow:  { hue: number; saturation: number; luminance: number }
  green:   { hue: number; saturation: number; luminance: number }
  aqua:    { hue: number; saturation: number; luminance: number }
  blue:    { hue: number; saturation: number; luminance: number }
  purple:  { hue: number; saturation: number; luminance: number }
  magenta: { hue: number; saturation: number; luminance: number }
}

export interface ToneCurve {
  rgb:  CurvePoint[]   // master curve
  red:  CurvePoint[]
  green: CurvePoint[]
  blue: CurvePoint[]
}

export interface CurvePoint { x: number; y: number }  // both 0–255

export interface ColorWheels {
  shadows:    { hue: number; saturation: number; luminance: number }
  midtones:   { hue: number; saturation: number; luminance: number }
  highlights: { hue: number; saturation: number; luminance: number }
}

export const DEFAULT_HSL: HslAdjustments = {
  red: {hue:0,saturation:0,luminance:0}, orange: {hue:0,saturation:0,luminance:0},
  yellow: {hue:0,saturation:0,luminance:0}, green: {hue:0,saturation:0,luminance:0},
  aqua: {hue:0,saturation:0,luminance:0}, blue: {hue:0,saturation:0,luminance:0},
  purple: {hue:0,saturation:0,luminance:0}, magenta: {hue:0,saturation:0,luminance:0},
}

export const DEFAULT_CURVE: ToneCurve = {
  rgb:   [{x:0,y:0},{x:255,y:255}],
  red:   [{x:0,y:0},{x:255,y:255}],
  green: [{x:0,y:0},{x:255,y:255}],
  blue:  [{x:0,y:0},{x:255,y:255}],
}

export const DEFAULT_WHEELS: ColorWheels = {
  shadows:    {hue:0,saturation:0,luminance:0},
  midtones:   {hue:0,saturation:0,luminance:0},
  highlights: {hue:0,saturation:0,luminance:0},
}

export const DEFAULT_EDIT_STATE: EditState = {
  exposure:0, highlights:0, shadows:0, whites:0, blacks:0,
  contrast:0, clarity:0, vibrance:0, saturation:0,
  temperature:5500, tint:0,
  hsl: DEFAULT_HSL, toneCurve: DEFAULT_CURVE, colorWheels: DEFAULT_WHEELS,
  sharpening:0, noiseReduction:0,
  grainAmount:0, grainSize:0, grainRoughness:0, grainLuminance:true,
}
```

### LessonContent — the Academy lesson JSON schema

```typescript
// packages/types/src/academy.ts

export interface LessonContent {
  intro:          string           // One-sentence hook — makes them want to learn this
  steps:          LessonStep[]     // 4–6 steps, each ~30 seconds of reading/doing
  tip:            string           // Pro tip at the end — the thing professionals know
  relatedLessons: string[]         // Lesson slugs (2–3)
}

export interface LessonStep {
  stepNumber:       number
  title:            string         // Short verb phrase: "Open the Tone Curves panel"
  instruction:      string         // What the user does — conversational, no jargon
  highlightEngine:  string         // e.g. "chromadesk", "glowkit", "vault"
  highlightElement: string         // CSS selector of the element to spotlight
  animationHint:    'pulse' | 'zoom_to' | 'slide_in' | 'none'
  beforeValue?:     number         // For slider demos: starting value
  afterValue?:      number         // For slider demos: ending value (animates between them)
  soundEvent?:      SoundEventKey  // SoundPulse event to play during this step
  image?:           string         // Optional reference image path
}
```

### ImageFeatures — what SignatureAI model sees

```typescript
// packages/ai-core/src/signature-ai/features.ts

export interface ImageFeatures {
  luminanceHist:  Float32Array  // 64-bin normalized histogram — [64]
  rMean: number; gMean: number; bMean: number  // channel means, 0.0–1.0
  rStd:  number; gStd:  number; bStd:  number  // channel standard deviations
  colorTemp:      number        // estimated Kelvin
  contrastRatio:  number        // p95 luminance / p5 luminance
  saturationMean: number        // average saturation 0.0–1.0
  sharpness:      number        // Laplacian variance estimate
}
// IMPORTANT: The model NEVER sees raw pixel data. Only this feature vector.
// Extracting features on 64×64 downscaled image keeps batch inference under 30s/500 photos.
```

---

## ═══════════════════════════════════════════════════════
## IPC BRIDGE CONTRACT — Electron main ↔ renderer
## ═══════════════════════════════════════════════════════

### The three runtime environments

| Environment | Runtime | Can import | Cannot import |
|-------------|---------|------------|---------------|
| Electron main | Node.js | rawpulse, ai-core, soundpulse (synth), fs, path | React, DOM, Web Audio |
| Electron renderer | Chromium | React, Zustand, TanStack Query, Konva, Web Audio | rawpulse, ai-core, onnxruntime-node |
| Fastify API | Node.js | Prisma, Redis, tRPC, BullMQ | Electron APIs |

**Critical rule:** The renderer NEVER imports rawpulse or ai-core directly. All heavy processing goes through IPC. Never import onnxruntime-node in the renderer — it will fail silently.

### window.ymshots — the full preload contract

```typescript
// apps/desktop/src/preload/index.ts
// contextBridge.exposeInMainWorld('ymshots', { ... })

interface YmShotsAPI {
  // System
  isMuted(): Promise<boolean>
  getStorageDir(): Promise<string>
  getPlatform(): Promise<'darwin' | 'win32' | 'linux'>

  // File operations (ALL go through main — renderer has no fs access)
  importFiles(folderPath: string, shootId: string): Promise<ImportResult[]>
  copyToStorage(sourcePath: string, destDir: string): Promise<string>  // returns storagePath

  // Edit pipeline
  renderPreview(args: {
    photoId: string
    storagePath: string
    editState: EditState
    maxDimension: number
  }): Promise<Uint8Array>  // returns JPEG bytes

  // Export
  exportPhoto(args: {
    storagePath: string
    editState: EditState
    format: ExportFormat
    quality: number
    longEdgePx: number | null
    colorProfile: string
    sharpening: number
    outputPath: string
    exifArtist: string
  }): Promise<void>

  // AI — all on-device
  scorePhoto(imagePath: string): Promise<SharpEyeResult>
  extractFeatures(imagePath: string): Promise<ImageFeatures>
  applyStyle(args: { imagePath: string; profileId: string; modelPath: string }): Promise<EditState>

  // Shell
  openFolder(path: string): Promise<void>
  showSaveDialog(options: Electron.SaveDialogOptions): Promise<string | null>
  showOpenDialog(options: Electron.OpenDialogOptions): Promise<string[] | null>
}
```

### IPC event channels (main → renderer, one-way)

```typescript
// apps/desktop/src/preload/index.ts
// These are events the main process sends to the renderer

ipcRenderer.on('photo:imported',     (_, data: { photoId: string; shootId: string; thumbnailPath: string }) => {})
ipcRenderer.on('photo:scored',       (_, data: { photoId: string; result: SharpEyeResult }) => {})
ipcRenderer.on('export:progress',    (_, data: { jobId: string; progressPct: number }) => {})
ipcRenderer.on('export:complete',    (_, data: { jobId: string }) => {})
ipcRenderer.on('tether:photo',       (_, data: { photoId: string; thumbnailPath: string }) => {})
ipcRenderer.on('tether:connected',   (_, data: { cameraMake: string; cameraModel: string }) => {})
ipcRenderer.on('tether:disconnected', (_, {}) => {})
```

---

## ═══════════════════════════════════════════════════════
## UNDO / REDO ARCHITECTURE — snapshot-based, not deletion
## ═══════════════════════════════════════════════════════

**Design decision:** Undo is NOT implemented by deleting EditAdjustment rows. It uses EditHistory snapshots — the entire EditState JSON is saved as a blob. Undo = load previous snapshot. This is simpler, faster, and correct.

```typescript
// When to save a history snapshot (after any of these):
// - Slider release (mouseup / touchend — NOT every change event)
// - Reset to default
// - SignatureAI apply
// - Preset apply
// - Undo/redo (to maintain the forward stack)
// - Cmd+S save

async function saveHistorySnapshot(sessionId: string, label: string) {
  const state = editStore.getState().editState
  await trpc.edit.saveSnapshot.mutate({ sessionId, snapshotJson: state, label })
}

// Undo: load second-to-last snapshot
async function undo(sessionId: string) {
  const history = await trpc.edit.history.query({ sessionId })
  if (history.length < 2) return
  const target = history[history.length - 2]
  editStore.setState({ editState: target.snapshotJson })
  await trpc.edit.deleteSnapshot.mutate({ id: history[history.length - 1].id })
  debouncedPreview(editStore.getState().editState)
}

// History panel: list all EditHistory rows with labels
// User can click any point for non-linear undo (jump to any state)
```

---

## ═══════════════════════════════════════════════════════
## PREVIEW RENDER PIPELINE — debounce + abort pattern
## ═══════════════════════════════════════════════════════

**This is what makes the editor feel instant.** Get this right or every slider drag will feel laggy.

```typescript
// apps/desktop/src/renderer/hooks/useEditPreview.ts

const renderRef = useRef<AbortController | null>(null)

const requestPreview = useMemo(() => debounce(async (state: EditState) => {
  // Cancel any in-flight render
  renderRef.current?.abort()
  renderRef.current = new AbortController()

  try {
    const jpegBytes = await window.ymshots.renderPreview({
      photoId: currentPhotoId,
      storagePath: currentPhoto.storagePath,
      editState: state,
      maxDimension: 2048,
    })

    const blob = new Blob([jpegBytes], { type: 'image/jpeg' })
    const url = URL.createObjectURL(blob)

    // Revoke previous URL — critical for memory management
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
    previewUrlRef.current = url
    setPreviewUrl(url)

  } catch (e) {
    if ((e as Error).name === 'AbortError') return  // cancelled — normal, ignore
    console.error('Preview render failed:', e)
  }
}, 80), [currentPhotoId])  // 80ms debounce — feels responsive, doesn't thrash

// Before/after: render both on mount, swap URLs instantly (no re-render)
// Space key → setShowBefore(true), Space release → setShowBefore(false) + play('before_after_toggle')
```

---

## ═══════════════════════════════════════════════════════
## MONEY HANDLING — exact patterns
## ═══════════════════════════════════════════════════════

```typescript
// packages/types/src/money.ts

// RULE: Every monetary value is integer cents (BigInt in DB, number in JS)
// RULE: Never store as Float. Never compute as Float. Never display raw.

// Computing invoice totals — all in integer cents
function computeInvoiceTotals(
  lineItems: Array<{ quantity: number; unitPriceCents: bigint }>,
  taxRate: number  // e.g. 0.0875 for 8.75%
): { subtotalCents: bigint; taxCents: bigint; totalCents: bigint } {
  const subtotalCents = lineItems.reduce((sum, item) => {
    return sum + BigInt(Math.round(item.quantity)) * item.unitPriceCents
  }, 0n)

  // Math.floor — always round down on tax (never collect more than owed)
  const taxCents = BigInt(Math.floor(Number(subtotalCents) * taxRate))

  return { subtotalCents, taxCents, totalCents: subtotalCents + taxCents }
}

// Displaying money — always Intl.NumberFormat
function formatMoney(cents: bigint, currency: string, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency })
    .format(Number(cents) / 100)
}
// formatMoney(9999n, 'USD') → "$99.99"

// Passing to Stripe — convert BigInt to Number (Stripe expects number type)
stripe.paymentIntents.create({
  amount: Number(invoice.totalCents),     // BigInt → number for Stripe
  currency: invoice.currency.toLowerCase(),
})

// Zod validation — reject any non-integer at the API boundary
const centsSchema = z.number().int().nonnegative()  // integer cents only

// Invoice number format
// YM-{YEAR}-{5-digit-zero-padded}: YM-2025-00001, YM-2025-00042
```

---

## ═══════════════════════════════════════════════════════
## WORKER THREAD STRATEGY — keep UI at 60fps
## ═══════════════════════════════════════════════════════

Three types of work MUST leave the main thread. Without this, every import or AI cull freezes the UI.

```typescript
// apps/desktop/src/main/workers.ts

import Piscina from 'piscina'  // npm install piscina

// 1. RAW decoding — up to 2s per file
export const rawWorker = new Piscina({
  filename: path.join(__dirname, 'workers/raw-decode.js'),
  maxThreads: 2,  // one decode + one in queue
})

// 2. ONNX inference — CPU-intensive
export const aiWorker = new Piscina({
  filename: path.join(__dirname, 'workers/ai-inference.js'),
  maxThreads: 4,  // concurrency 4 for batch scoring
})

// 3. Export pipeline — disk I/O + CPU
export const exportWorker = new Piscina({
  filename: path.join(__dirname, 'workers/export.js'),
  maxThreads: 2,
})

// Usage: all worker calls return Promises — await them in ipcMain handlers
ipcMain.handle('edit:renderPreview', async (_, args) => {
  return await rawWorker.run({ task: 'applyEdits', ...args })
})
```

| Worker | What it handles | Max threads |
|--------|----------------|-------------|
| raw-decode | RAW decode, thumbnail generation, EXIF extract | 2 |
| ai-inference | SharpEye, SignatureAI feature extraction + inference | 4 |
| export | FinalPass export pipeline, ICC embed, EXIF write | 2 |

**ONNX model sessions are loaded once in the ai-inference worker at startup and cached. Never load a session per-photo.**

---

## ═══════════════════════════════════════════════════════
## GRAINLAB — luminance-based grain algorithm
## ═══════════════════════════════════════════════════════

The grain must be non-uniform to feel like real film emulsion. This is what separates it from "add noise."

```typescript
// packages/rawpulse/src/grain-lab/index.ts

export interface GrainParams {
  amount:     number   // 0–100
  size:       number   // 0–100
  roughness:  number   // 0–100 (irregularity of distribution)
  luminance:  boolean  // when true: coarser in shadows, finer in highlights
}

export function applyGrain(
  data: Uint8Array, width: number, height: number,
  params: GrainParams,
  seed: number  // derived from photo UUID hash — MUST be stable per photo
): Uint8Array {
  const rng = seededRandom(seed)  // deterministic random for consistent grain

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i+1], b = data[i+2]
    const lum = 0.2126*r + 0.7152*g + 0.0722*b  // perceived luminance

    let grainScale = params.amount / 100
    if (params.luminance) {
      // Shadows (lum < 80): 1.5× grain — coarser, like real film
      // Highlights (lum > 180): 0.5× grain — finer
      // Midtones: base grain
      if (lum < 80)       grainScale *= 1.5
      else if (lum > 180) grainScale *= 0.5
    }

    const noise = (rng() * 2 - 1) * grainScale * 30
    data[i]   = clamp(r + noise, 0, 255)
    data[i+1] = clamp(g + noise, 0, 255)
    data[i+2] = clamp(b + noise, 0, 255)
  }
  return data
}

// Seed from photo UUID — grain is consistent across re-renders
function uuidToSeed(uuid: string): number {
  return uuid.split('').reduce((acc, c) => acc * 31 + c.charCodeAt(0), 0) >>> 0
}
```

---

## ═══════════════════════════════════════════════════════
## PLAN GATE — which features require which tier
## ═══════════════════════════════════════════════════════

```typescript
// apps/desktop/src/hooks/usePlanGate.ts

export const PLAN_GATES: Record<string, PlanTier> = {
  // PRO features
  'signatureai.train':        'PRO',
  'signatureai.apply':        'PRO',
  'glowkit.any':              'PRO',
  'facecast.any':             'PRO',
  'grainlab.advanced':        'PRO',  // amount > 20
  'gallerybox.send':          'PRO',
  'payshot.send_invoice':     'PRO',
  'academy.tracks_2_3_4':     'PRO',
  'lookvault.premium_packs':  'PRO',
  'finalpass.raw_xmp':        'PRO',
  'frameflow.any':            'PRO',
  'livetether.any':           'PRO',
  'headshotai.any':           'PRO',
  'mobile.sync':              'PRO',

  // STUDIO features
  'team.seats':               'STUDIO',
  'team.shared_library':      'STUDIO',
  'gallerybox.white_label':   'STUDIO',
  'lensbiz.team_analytics':   'STUDIO',
}

// Usage:
// const { checkGate } = usePlanGate()
// if (!checkGate('signatureai.apply', 'PRO')) return  // shows PlanGateModal automatically

// FREE tier limits:
// - 15 AI edits per day (SharpEye cull + auto-edits combined)
// - All manual RAW tools: unlimited
// - 30 LookVault filters (not the premium packs)
// - Export up to 24MP JPEG/PNG
// - GalleryBox: create galleries (not send)
// - Academy: Track 1 Beginner only
```

---

## ═══════════════════════════════════════════════════════
## WELCOME TOUR — 6 steps, exact spec
## ═══════════════════════════════════════════════════════

Show only when `User.onboardingCompleted = false`. On completion or skip: `PATCH /api/v1/users/me { onboardingCompleted: true }`.

```typescript
export const WELCOME_TOUR_STEPS = [
  {
    step: 1,
    title: 'Welcome to YmShotS',
    instruction: 'The app that learns your eye and makes every photo look unmistakably like you. Let\'s take 2 minutes to see how it works.',
    highlightElement: null,  // full screen, no spotlight
    animationHint: 'none',
  },
  {
    step: 2,
    title: 'Import your first shoot',
    instruction: 'Drag a folder of photos here, or click Import. YmShotS reads RAW, JPEG, HEIF, and PNG files. Your originals are never touched.',
    highlightElement: '.vault-import-button',
    animationHint: 'pulse',
  },
  {
    step: 3,
    title: 'Let SharpEye find the best shots',
    instruction: 'Click "Auto-cull with AI" and SharpEye scores every photo for sharpness, faces, and expression. The winners rise to the top.',
    highlightElement: '.sharpeye-cull-button',
    animationHint: 'pulse',
  },
  {
    step: 4,
    title: 'Edit with ChromaDesk',
    instruction: 'Tone, colour, grain — all here. Every slider remembers what you do. After a few sessions, SignatureAI will start learning your style.',
    highlightElement: '.chromadesk-panel',
    animationHint: 'slide_in',
  },
  {
    step: 5,
    title: 'Deliver to your client',
    instruction: 'One click sends a beautiful gallery — dark, fast, mobile-ready. Your name on it. Your brand. Clients pick their favourites and you\'re notified instantly.',
    highlightElement: '.gallerybox-send-button',
    animationHint: 'pulse',
  },
  {
    step: 6,
    title: "You're ready.",
    instruction: null,
    highlightElement: null,
    animationHint: 'none',
    showCreatorSignature: true,  // render CreatorSignature splash variant here
    ctaText: 'Start shooting',
  },
]
```

---

## ═══════════════════════════════════════════════════════
## GALLERYBOX — gallery slug format + expiry page
## ═══════════════════════════════════════════════════════

```typescript
// Slug generation — apps/api/src/features/gallery/slug.ts
function generateGallerySlug(photographerName: string, shootName: string): string {
  const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const year = new Date().getFullYear()
  const random = Math.random().toString(36).slice(2, 6)
  return `${clean(photographerName)}-${clean(shootName)}-${year}-${random}`
  // e.g. "sarah-chen-smith-wedding-2025-x7k2"
}

// Expiry page — same dark aesthetic as gallery, same font treatment
// Text: "This gallery has closed."
// Subtext: "Contact [photographer first name] for access."
// Background: #0A0A0A
// Photographer name: same position as live gallery header
// No YmShotS branding anywhere on the expired page
```

---

## ═══════════════════════════════════════════════════════
## FINALPASS — EXIF write contract
## ═══════════════════════════════════════════════════════

```typescript
// packages/rawpulse/src/exif-writer.ts

export interface ExifWriteSpec {
  Software:         string   // Always: "YmShotS 1.0 by ta-tech"
  Artist:           string   // User's fullName from their profile
  Copyright:        string   // User's copyright string (optional, set in Settings)
  ImageDescription: string   // Optional — from photo caption if set
  // Original capture metadata (from import): PRESERVED unchanged
  // Make, Model, LensModel, ExposureTime, FNumber, ISO, DateTimeOriginal, GPS: DO NOT overwrite
}

// When stripMetadata is true (export setting):
// Remove: GPS, all personal metadata
// Keep: Make, Model, LensModel, ExposureTime, FNumber, ISO, DateTimeOriginal
// Always keep: Software, Artist, Copyright (these are the photographer's identity)
```

---

## ═══════════════════════════════════════════════════════
## BULLMQ JOBS — background job specifications
## ═══════════════════════════════════════════════════════

```typescript
// apps/api/src/jobs/

// Job 1: Nightly revenue snapshot
// Queue: 'analytics'
// Schedule: '0 1 * * *' (1:00 AM UTC daily)
// What it does:
//   For each user with at least 1 invoice this month:
//     - Count invoicesSent (status != DRAFT)
//     - Count invoicesPaid (status = PAID)
//     - Sum totalRevenueCents from PAID invoices
//     - Count shootsCompleted (status = ARCHIVED or DELIVERING)
//     - Compute avgJobValueCents = totalRevenueCents / invoicesPaid (or 0)
//     - Upsert RevenueSnapshot { userId, periodMonth: 'YYYY-MM', ... }

// Job 2: Export processing
// Queue: 'exports'
// Triggered by: POST /api/v1/export-jobs
// What it does:
//   1. Set ExportJob.status = PROCESSING
//   2. For each photoId in photoIdsJson:
//      a. Load EditSession + EditAdjustments from DB
//      b. Hydrate EditState
//      c. IPC to main process: apply edits → write file
//      d. Update ExportJob.progressPct = (done/total * 100)
//   3. Set ExportJob.status = COMPLETE, completedAt = now()
//   4. Play export_complete sound via SSE to desktop app

// Job 3: SignatureAI training
// Queue: 'ai-training'
// Triggered by: POST /api/v1/style-profiles/:id/train
// What it does:
//   1. Load all StyleTrainingPairs for profile
//   2. Validate: minimum 10 pairs required
//   3. Run TFLite training in ai-inference worker
//   4. Save model to modelPath
//   5. Update StyleProfile: confidenceScore, trainingPhotoCount, modelVersion, updatedAt
```

---

## ═══════════════════════════════════════════════════════
## PITCHDECK — full slide content spec
## ═══════════════════════════════════════════════════════

```typescript
// apps/desktop/src/features/pitch/slides.ts

export const PITCH_SLIDES = [
  {
    id: 'hero',
    headline: 'YmShotS',
    subheadline: 'your moments. your shots.',
    body: 'The only app built for the complete photographer — from the first shutter click to the paid invoice.',
    visual: 'animated_shutter',   // CSS animation of camera shutter opening
    cta: null,
    signature: 'Built by ta-tech',
  },
  {
    id: 'problem',
    headline: 'Every other app makes you choose.',
    body: 'RAW power or beautiful face tools. Professional grading or easy mobile editing. Client delivery or invoicing. You deserve all of it in one place.',
    visual: 'fragmented_apps',   // 5 app-icon shapes flying apart animation
    cta: null,
  },
  {
    id: 'solution',
    headline: 'One app. Every tool. Zero compromise.',
    bullets: [
      { engine: 'rawpulse',    text: 'RAW processing as powerful as any desktop suite' },
      { engine: 'facecast',    text: 'Face & skin AI that learns to look natural, not filtered' },
      { engine: 'signatureai', text: 'Your personal AI trains on your edits and works like you' },
      { engine: 'grainlab',    text: 'Film grain from real emulsion data — not digital noise' },
      { engine: 'gallerybox',  text: 'Client galleries, e-sign, and Stripe payments built right in' },
    ],
    visual: 'workspace_preview',  // live screenshot of edit UI
    cta: null,
  },
  {
    id: 'signatureai',
    headline: 'An AI that edits exactly like you.',
    body: 'SignatureAI trains on your before-and-after photo pairs. After 50 edits it knows your colour palette, your retouching style, your film preferences. Drop 500 wedding photos. One tap. Done in minutes. Every photo looks like you edited it.',
    visual: 'dna_animation',      // animated fingerprint bars growing
    stat: { value: '96%', label: 'less editing time reported by release users' },
    cta: null,
  },
  {
    id: 'academy',
    headline: 'Learn while you shoot.',
    body: 'AcademyMode is a mentor built into every tool. 30 structured lessons, live coach tips, and real-photo challenges that teach professional techniques in the flow of your actual work. Never leave the app to watch a tutorial again.',
    visual: 'academy_preview',    // animated lesson player
    stat: { value: '30', label: 'lessons from first import to master editor' },
    cta: null,
  },
  {
    id: 'release',
    headline: 'v1.0 — fly it first.',
    body: 'You are seeing this because you were chosen for the YmShotS release. No ads. No rate limits. No surprises. Just the most thoughtful photo app ever built for photographers who care about their craft.',
    visual: 'release_badge',        // animated release wings SVG
    signature: 'Built by ta-tech',
    cta: null,
  },
  {
    id: 'upgrade',
    headline: 'Choose your plan.',
    visual: 'pricing_cards',      // live PricingCards component
    plans: [
      {
        tier: 'FREE', price: '$0', period: 'always free — no ads, no watermark',
        features: ['15 AI edits/day', 'All manual RAW tools', '30 filters', 'Export up to 24MP'],
      },
      {
        tier: 'PRO', price: '$9.99', period: 'per month — or $79 one-time, yours forever',
        featured: true,
        features: ['Unlimited AI edits', 'SignatureAI training', '150+ filters + GrainLab',
                   'Client gallery + PayShot', 'Full AcademyMode', 'Desktop + mobile sync', 'Video retouch'],
      },
      {
        tier: 'STUDIO', price: '$24.99', period: 'per month — 3 photographer seats',
        features: ['Everything in Pro', '3 photographer seats', 'Shared style library',
                   'Team analytics', 'White-label galleries'],
      },
    ],
    cta: 'Start with Pro',
    ctaSecondary: 'Continue with Free',
  },
]
```


---

## ═══════════════════════════════════════════════════════
## INTERACTIVE PITCH — Full in-app experience spec
## ═══════════════════════════════════════════════════════

This is the complete spec for the interactive PitchDeck as built and approved. Claude Code must implement this exactly — every slide, every voice script, every stat, every layout detail.

### Architecture

```
apps/desktop/src/features/pitch/
  PitchDeckModal.tsx        Full-screen modal, dark #0D0D0D bg, 6 slides
  slides/
    Slide0Overview.tsx      Stats + feature list
    Slide1Engines.tsx       22-engine grid
    Slide2SignatureAI.tsx    5-state progression
    Slide3Academy.tsx        Lesson list + tracks
    Slide4Deliver.tsx        Gallery + payment loop
    Slide5Plans.tsx          Pricing cards
  VoiceGuide.tsx            Shared voice bar component
  usePitchVoice.ts          Voice playback hook (word-by-word highlight)
  PlanGateModal.tsx         3-slide abbreviated pitch on feature gate
```

### Global pitch UI rules

- Background: `#0D0D0D` — not pure black, not dark gray
- Top bar: app logo left, slide nav pills right, tagline center
- Nav pills: inactive = `rgba(255,255,255,0.15)` border, `rgba(255,255,255,0.5)` text; active = `#D4537E` fill
- Slide progress dots: inactive `rgba(255,255,255,0.15)`, active `#D4537E` widened to 16px
- Prev/Next buttons: outlined; Next on last slide changes to "Start free ↗" and calls upgrade flow
- Every slide has a VoiceGuide bar pinned to the bottom of the slide content
- `PitchView` row logged to DB on every slide change: `{ userId, source, slideReached, converted }`

### VoiceGuide component

```typescript
// apps/desktop/src/features/pitch/VoiceGuide.tsx

interface VoiceGuideProps {
  slideIndex: number
  script: string          // Full voice script for this slide
  shortDesc: string       // Shown before play: "Tap play to hear..."
}

// Behaviour:
// - Play button: pink circle, white play/pause icon
// - On play: words highlight left-to-right at ~380ms per word
//   Spoken words: rgba(255,255,255,0.85)
//   Upcoming words: rgba(255,255,255,0.25)
// - Progress bar: 2px, #D4537E, fills bottom of voice bar as script plays
// - Animated dots (3): pulse pink while playing, gray when stopped
// - Pause: tap play again — preserves position
// - Stop on slide change: always stop voice when navigating away
// - DO NOT use browser SpeechSynthesis — the word-highlight animation IS the voice guide
//   The text scrolling creates the reading experience. No audio required.
```

### Voice scripts — all 6, word-for-word

These are the exact scripts. Claude Code must store them in `PITCH_VOICE_SCRIPTS` and pass them to `VoiceGuide`.

```typescript
// apps/desktop/src/features/pitch/voiceScripts.ts

export const PITCH_VOICE_SCRIPTS: Record<number, { script: string; shortDesc: string }> = {
  0: {
    shortDesc: 'Tap play to hear what makes YmShotS different from every other photo app.',
    script: `Most photo apps give you one piece of the puzzle. A powerful editor that cannot deliver to clients. A gallery tool that cannot edit. An AI feature that is just a preset with extra steps. YmShotS is different because it was designed as a single system — not a collection of tools bolted together. Every engine talks to every other engine. When SharpEye scores your photos, that data feeds VaultGrid's filter. When you edit, SignatureAI is learning. When you export, your name goes into the EXIF. One motion from first import to paid invoice.`,
  },
  1: {
    shortDesc: 'Tap play to learn how the 22 engines work together as one connected system.',
    script: `There are 22 engines inside YmShotS, and none of them are accidents. RawPulse handles decoding and the non-destructive pipeline — your originals are never touched, ever. ChromaDesk gives you professional-grade HSL, tone curves, and three-way colour wheels. GlowKit handles skin and beauty retouching with landmarks from MediaPipe — natural, not filtered. GrainLab simulates real film emulsion — the grain is coarser in shadows and finer in highlights, the way actual film responds to light. And SignatureAI sits at the centre of all of it, learning from everything you do.`,
  },
  2: {
    shortDesc: 'Tap play to understand the five SignatureAI states and what happens at each milestone.',
    script: `SignatureAI has five states, and each one is a milestone. In Dormant, it watches — no buttons, no pressure, just silent observation. At 10 pairs, the style fingerprint appears for the first time. The bars animate in and the photographer sees their aesthetic as a shape — warm, contrasty, airy, matte. At 30 pairs, the Apply button appears and the real magic begins. At 50 pairs it is confident — drop 500 wedding photos and apply your style to all of them in under 30 seconds. At 100 pairs it knows your eye completely. There is a shareable style card. A full-screen moment. The triumph arpeggio plays. At that point, switching to another app means starting from zero. The photographer does not just use YmShotS. They are YmShotS.`,
  },
  3: {
    shortDesc: 'Tap play to hear how AcademyMode teaches you inside the real app — not in a separate tutorial.',
    script: `AcademyMode is not a help section. It is a living mentor woven into every tool in the app. When you open a slider for the first time, a small pink beacon pulses. Tap it and a 30-second animated lesson plays — right there, in context, while you are doing the actual work. The tone curves lesson walks you through creating an S-curve step by step. The skin smooth lesson teaches restraint — keep the slider under 60, preserve texture, look real. Challenge missions give you a RAW file and a reference edit, and score your attempt using SignatureAI similarity. The goal is a photographer who never needs to leave YmShotS to learn how to use YmShotS.`,
  },
  4: {
    shortDesc: 'Tap play to walk through the complete gallery-to-payment loop and hear what clients experience.',
    script: `The GalleryBox client experience was designed around one question: what does it feel like to receive these photos at 11pm? The answer became the spec. The link opens on a near-black screen. Your name fades in first — large, centred, nothing else. Then the cover photo rises from below like a curtain opening. Then, only then, a small chevron invites the scroll. The gallery is masonry — photos at their natural aspect ratios, never cropped to squares. Clients tap hearts, not checkboxes. Each tap fires a chime on the photographer's desktop instantly via Server-Sent Events. When the client taps Done, the photographer gets a notification, clicks Export Favourites, the photos go through FinalPass, and the PayShot invoice gets sent. Gallery to paid. One motion.`,
  },
  5: {
    shortDesc: 'Tap play to hear which plan is right for where you are in your photography business right now.',
    script: `The free plan is genuinely useful — not a demo. All manual RAW tools, 30 filters, export to 24 megapixels, and 15 AI edits per day. No watermarks, no ads, no expiry. Pro unlocks everything that makes YmShotS a business tool — SignatureAI training and apply, GalleryBox delivery, PayShot invoicing, the full AcademyMode with all 30 lessons, desktop and mobile sync, and video retouching with FrameGlow. That is 9 dollars and 99 cents per month. Or 79 dollars once, yours forever. Studio adds three photographer seats, a shared style library, and white-label galleries for 24.99 per month. The v1.0 has no rate limits and no ads. You flew it first.`,
  },
}
```

### Slide 0 — Overview

```
Tag:        "v1.0"
Headline:   "The app that learns your eye."
            "eye" in #D4537E
Subtext:    "YmShotS is not an editing tool. It is a creative identity engine.
             It watches how you edit, builds a model of your aesthetic, and applies
             it to every photo you touch — automatically, on your device, in complete privacy."

Stats row (4 cards, equal width):
  { value: "22",   label: "engines built in" }
  { value: "30",   label: "training lessons" }
  { value: "$0",   label: "to start, forever" }
  { value: "100%", label: "on-device AI" }

Feature list (4 items, each with pink dot):
  1. "Import → Cull → Edit → Export → Deliver → Invoice — one seamless motion, no app-switching"
  2. "SignatureAI trains on your before/after edits and learns your personal colour palette, retouching style, and film preferences"
  3. "GalleryBox sends luxury client galleries — dark, fast, mobile-ready — with your name on them, not ours"
  4. "No ads. No cloud uploads. No rate limits on paid plans. Your photos never leave your machine for AI processing."
```

### Slide 1 — Engines

```
Tag:        "22 engines — one app"
Headline:   "Every tool a photographer needs. Built as one system."
Subtext:    "Each engine is purpose-built and deeply integrated. They talk to each other.
             VaultGrid feeds SignatureAI. SignatureAI feeds FinalPass. FinalPass feeds
             GalleryBox. Nothing is isolated."

Engine grid (3 columns × 4 rows, 12 engines shown):
Each engine card: coloured dot + name (bold) + one-line description

Row 1:
  RawPulse     #EF9F27  "RAW decode, non-destructive pipeline, EXIF. Originals never touched."
  SignatureAI  #D4537E  "Learns your personal edit style from before/after pairs. The centerpiece."
  SharpEye     #7F77DD  "AI cull: focus score, blink detection, expression scoring per photo."

Row 2:
  ChromaDesk   #1D9E75  "HSL, tone curves, 3-way color wheels, LUT import. Full color suite."
  GlowKit      #D85A30  "Skin smooth, blemish, teeth, eyes, contour. Natural, not plastic."
  PixelForge   #378ADD  "Layer system, blend modes, healing brush, AI mask compositing."

Row 3:
  GrainLab     #888780  "Film grain from real emulsion data. Coarser in shadows, finer in highlights."
  MaskCraft    #D4537E  "AI subject, sky, skin, luminosity masks. One click, edge-precise."
  SceneDrop    #1D9E75  "Background removal, replacement, blur, sky swap. Runs on-device."

Row 4:
  GalleryBox   #7F77DD  "Client delivery portal. Dark, fast, branded with the photographer's name."
  PayShot      #EF9F27  "Invoicing, Stripe payments, e-sign. From gallery to paid in one loop."
  FinalPass    #D85A30  "Batch export, ICC profiles, EXIF write. Your name embedded in every file."
```

### Slide 2 — SignatureAI

```
Tag:        "The centerpiece — SignatureAI"
Headline:   "An AI that edits exactly like you."
            "exactly" in #D4537E
Subtext:    "Every time you save an edit, YmShotS captures a before/after pair. After enough
             pairs, it trains a model of your personal aesthetic — on your machine, completely
             private. Then it applies your style to any photo. One click."

Five state rows (stacked, each with: numbered circle + label + description + fill bar):

State 1 — Dormant
  circle bg: rgba(136,135,128,0.2), color: #888780, number: "0"
  label: "Dormant"
  desc:  "0–9 pairs · watching silently. Edit naturally."
  bar fill: 5%, color: #888780

State 2 — Learning
  circle bg: rgba(239,159,39,0.15), color: #EF9F27, number: "10"
  label: "Learning"
  desc:  "10–29 pairs · style fingerprint appears for the first time"
  bar fill: 30%, color: #EF9F27

State 3 — Forming
  circle bg: rgba(212,83,126,0.15), color: #D4537E, number: "30"
  label: "Forming"
  desc:  "30–49 pairs · style card + Apply button unlocks"
  bar fill: 55%, color: #D4537E

State 4 — Confident
  circle bg: rgba(29,158,117,0.15), color: #1D9E75, number: "50"
  label: "Confident"
  desc:  "50–99 pairs · batch apply to 500 photos in 30 seconds"
  bar fill: 78%, color: #1D9E75

State 5 — Expert  (border: rgba(212,83,126,0.3))
  circle bg: rgba(212,83,126,0.2), color: #D4537E, number: "100"
  label: "Expert"  (label color: #D4537E)
  desc:  "100+ pairs · shareable style card · auto-apply on import"
  bar fill: 100%, color: #D4537E

Moat callout below states:
  bg: rgba(212,83,126,0.06), border: rgba(212,83,126,0.2)
  text: "At 100 pairs: switching to any other app means starting over. The photographer
         doesn't just use YmShotS. They are YmShotS."
  "They are YmShotS" in rgba(255,255,255,0.8)
```

### Slide 3 — Academy

```
Tag:        "AcademyMode — built into every tool"
Headline:   "Learn while you shoot."
            "shoot" in #D4537E
Subtext:    "30 structured lessons from first import to master editor. Coach beacons pulse
             on every tool you haven't used. Challenges score your edits against a reference
             using SignatureAI. You never leave the app to learn."

Lesson list (scrollable, shows first 8 + locked row):

Track header: "Track 1 — Beginner · always unlocked"
  Lesson 01  icon bg: rgba(29,158,117,0.15)  "Your first import"         +10 XP
  Lesson 02  icon bg: rgba(29,158,117,0.15)  "What is a RAW file"        +10 XP
  Lesson 03  icon bg: rgba(29,158,117,0.15)  "Culling like a pro"        +15 XP
  Lesson 04  icon bg: rgba(29,158,117,0.15)  "Exposure fundamentals"     +15 XP
  Lesson 05  icon bg: rgba(29,158,117,0.15)  "White balance explained"   +15 XP
  Lesson 06  icon bg: rgba(29,158,117,0.15)  "Your first export"         +10 XP

Track header: "Track 2 — Intermediate · unlocks after Track 1"
  Lesson 07  icon bg: rgba(212,83,126,0.12)  "Mastering tone curves"     +25 XP
  Lesson 08  icon bg: rgba(212,83,126,0.12)  "HSL color grading"         +25 XP
  Lesson ··· icon muted                       "+ 22 more lessons through Master"  "locked"

Lesson row on click: sendPrompt about that lesson (for demo purposes in pitch only)
```

### Slide 4 — Deliver

```
Tag:        "GalleryBox + PayShot — the full loop"
Headline:   "From gallery to paid. One motion."
            "paid" in #D4537E
Subtext:    "Send a link. Client opens a cinematic dark gallery with your name on it. They
             tap hearts on their favourites. You hear a chime. You export those photos.
             Invoice sent. Paid via Stripe. Done."

Feature list (5 items, pink dots):
  1. "Arrival experience: Near-black screen → your name fades in → cover photo rises from
     below. Clients feel they are about to see something worth seeing."
  2. "Hearts, not checkboxes. Selection is an emotional act. Each tap fires a real-time
     sound on your desktop. Watch your client choose their favourites live."
  3. "Your brand. Not ours. Photographer name is the only brand clients see. YmShotS
     footer credit is 11px at 20% opacity — invisible unless you know to look."
  4. "PayShot: Line-item invoices, Stripe Payment Links, automatic PAID status on webhook.
     Revenue tracked in LensBiz. Every job profitable and accounted for."
  5. "No photo count shown to clients. No '247 photos' label. They see a curated
     selection, not a dump. Luxury delivery is about restraint, not volume."
```

### Slide 5 — Plans

```
Tag:        "Choose your plan"
Headline:   "Start free. Go Pro when you're ready."
            "Pro" in #D4537E
Subtext:    "No trial periods. No watermarks. No surprise charges. The free plan is
             genuinely useful — and Pro unlocks SignatureAI, GalleryBox delivery,
             PayShot, and the full AcademyMode."

Pricing grid (3 columns):

FREE card:
  badge: "FREE"
  name: "Free"
  price: "$0"
  period: "always free · no ads · no watermark"
  features: 15 AI edits per day / All manual RAW tools / 30 filters /
             Export up to 24MP / Academy Track 1
  CTA button: "Start free ↗" → calls sendPrompt for demo, real app starts signup

PRO card (featured — #D4537E border, rgba(212,83,126,0.06) bg):
  badge: "MOST POPULAR"
  name: "Pro"
  price: "$9.99"
  period: "per month — or $79 one-time, yours forever"
  features: Unlimited AI edits / SignatureAI training + apply /
             150+ filters + GrainLab / GalleryBox delivery /
             PayShot invoicing / Full AcademyMode (30 lessons) /
             Desktop + mobile sync / Video retouch (FrameGlow)
  CTA button: "Start with Pro ↗" (pink fill) → upgrade flow

STUDIO card:
  badge: "STUDIO"
  name: "Studio"
  price: "$24.99"
  period: "per month · 3 photographer seats"
  features: Everything in Pro / 3 photographer seats /
             Shared style library / Team analytics / White-label galleries
  CTA button: "Team plan ↗" → calls upgrade flow for Studio

Below grid:
  CreatorSignature: "Built by ta-tech"
  font-size: 11px, color: rgba(255,255,255,0.2), italic, centered
```

### PlanGateModal — abbreviated 3-slide pitch

Shown when a FREE user taps a PRO-gated feature. Uses the same dark aesthetic.

```
Slide A — Feature spotlight
  "You just tried [featureName]."
  "That is a Pro feature."
  Brief one-sentence description of what the feature does.

Slide B — SignatureAI or relevant engine spotlight
  Engine name + the key emotional promise for that engine
  e.g. for SignatureAI gate: "An AI that edits exactly like you."

Slide C — Upgrade
  Same pricing cards as Slide 5 but condensed (name + price + key features only)
  Two CTAs: "Unlock Pro" (pink) | "Keep Free" (outlined)
  "Unlock Pro" logs PitchView { source: 'PLAN_GATE', converted: true } and opens upgrade
```

### Pitch navigation keyboard shortcuts

```
ArrowRight / ArrowDown  → Next slide
ArrowLeft / ArrowUp     → Previous slide
Space                   → Play/pause voice guide on current slide
Escape                  → Close PitchDeckModal
```

### PitchView logging

```typescript
// Log on every slide change — non-blocking, fire and forget
trpc.pitch.logView.mutate({
  source: pitchSource,        // where pitch was opened from
  slideReached: slideIndex,   // 0-indexed, so max = 5
  converted: false,           // set to true on plan selection
})

// On plan selection:
trpc.pitch.logView.mutate({
  source: pitchSource,
  slideReached: 5,
  converted: true,
  planChosen: selectedTier,
})
```

