import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding YmShotS database...');

  // Seed academy lessons (all 30 from the curriculum)
  const lessons = [
    { slug: 'first-import', title: 'Your first import', description: 'Learn how to import your first shoot into VaultGrid.', skillLevel: 'BEGINNER' as const, engine: 'RAWPULSE' as const, durationSeconds: 180, xpReward: 10, sortOrder: 1 },
    { slug: 'understand-raw', title: 'What is a RAW file', description: 'Understand why RAW files matter and how RawPulse handles them.', skillLevel: 'BEGINNER' as const, engine: 'RAWPULSE' as const, durationSeconds: 240, xpReward: 10, sortOrder: 2 },
    { slug: 'flag-and-cull', title: 'Culling like a pro', description: 'Master the art of selecting your best shots efficiently.', skillLevel: 'BEGINNER' as const, engine: 'RAWPULSE' as const, durationSeconds: 300, xpReward: 15, sortOrder: 3 },
    { slug: 'exposure-basics', title: 'Exposure fundamentals', description: 'Learn the foundation of every great edit: exposure.', skillLevel: 'BEGINNER' as const, engine: 'RAWPULSE' as const, durationSeconds: 300, xpReward: 15, sortOrder: 4 },
    { slug: 'white-balance', title: 'White balance explained', description: 'Get your colors right from the start.', skillLevel: 'BEGINNER' as const, engine: 'RAWPULSE' as const, durationSeconds: 240, xpReward: 15, sortOrder: 5 },
    { slug: 'first-export', title: 'Your first export', description: 'Export your edited photos for the world to see.', skillLevel: 'BEGINNER' as const, engine: 'RAWPULSE' as const, durationSeconds: 180, xpReward: 10, sortOrder: 6 },
    { slug: 'tone-curves', title: 'Mastering tone curves', description: 'The single most powerful tool in photo editing.', skillLevel: 'INTERMEDIATE' as const, engine: 'CHROMADESK' as const, durationSeconds: 420, xpReward: 25, sortOrder: 7 },
    { slug: 'hsl-color', title: 'HSL color grading', description: 'Target individual colors for cinematic results.', skillLevel: 'INTERMEDIATE' as const, engine: 'CHROMADESK' as const, durationSeconds: 420, xpReward: 25, sortOrder: 8 },
    { slug: 'ai-cull-workflow', title: 'SharpEye AI cull workflow', description: 'Let AI help you pick your best shots.', skillLevel: 'INTERMEDIATE' as const, engine: null, durationSeconds: 360, xpReward: 20, sortOrder: 9 },
    { slug: 'skin-smooth', title: 'Natural skin retouching', description: 'Retouch skin without making it look plastic.', skillLevel: 'INTERMEDIATE' as const, engine: 'GLOWKIT' as const, durationSeconds: 420, xpReward: 25, sortOrder: 10 },
    { slug: 'background-removal', title: 'Clean background removal', description: 'Remove backgrounds cleanly with AI.', skillLevel: 'INTERMEDIATE' as const, engine: 'SCENEDROP' as const, durationSeconds: 360, xpReward: 20, sortOrder: 11 },
    { slug: 'masking-basics', title: 'AI masking introduction', description: 'Target specific areas of your photo with precision.', skillLevel: 'INTERMEDIATE' as const, engine: null, durationSeconds: 420, xpReward: 25, sortOrder: 12 },
    { slug: 'presets-workflow', title: 'Building your preset library', description: 'Create reusable looks that define your style.', skillLevel: 'INTERMEDIATE' as const, engine: null, durationSeconds: 360, xpReward: 20, sortOrder: 13 },
    { slug: 'film-grain', title: 'Film grain for authenticity', description: 'Add soul to your photos with realistic grain.', skillLevel: 'INTERMEDIATE' as const, engine: 'GRAINLAB' as const, durationSeconds: 300, xpReward: 20, sortOrder: 14 },
    { slug: 'face-tools', title: 'Face enhancement naturally', description: 'Enhance faces without losing the person.', skillLevel: 'INTERMEDIATE' as const, engine: 'FACECAST' as const, durationSeconds: 420, xpReward: 25, sortOrder: 15 },
    { slug: 'layer-compositing', title: 'Layer compositing deep dive', description: 'Build complex edits with layers and blend modes.', skillLevel: 'ADVANCED' as const, engine: 'PIXELFORGE' as const, durationSeconds: 600, xpReward: 40, sortOrder: 16 },
    { slug: 'color-science', title: 'Professional color science', description: 'Understand the science behind beautiful color.', skillLevel: 'ADVANCED' as const, engine: 'CHROMADESK' as const, durationSeconds: 600, xpReward: 40, sortOrder: 17 },
    { slug: 'style-dna-train', title: 'Training your SignatureAI', description: 'Teach AI to edit exactly like you.', skillLevel: 'ADVANCED' as const, engine: null, durationSeconds: 480, xpReward: 50, sortOrder: 18 },
    { slug: 'batch-workflow', title: 'Batch editing 500 photos', description: 'Edit hundreds of photos in minutes, not hours.', skillLevel: 'ADVANCED' as const, engine: 'RAWPULSE' as const, durationSeconds: 540, xpReward: 35, sortOrder: 19 },
    { slug: 'tethered-shoot', title: 'Live tethered shooting', description: 'Connect your camera and see photos appear live.', skillLevel: 'ADVANCED' as const, engine: null, durationSeconds: 600, xpReward: 40, sortOrder: 20 },
    { slug: 'healing-retouch', title: 'Advanced healing & clone', description: 'Remove distractions with precision tools.', skillLevel: 'ADVANCED' as const, engine: 'PIXELFORGE' as const, durationSeconds: 600, xpReward: 40, sortOrder: 21 },
    { slug: 'lut-creation', title: 'Creating and using LUTs', description: 'Build your own cinematic look-up tables.', skillLevel: 'ADVANCED' as const, engine: 'CHROMADESK' as const, durationSeconds: 600, xpReward: 40, sortOrder: 22 },
    { slug: 'gallery-delivery', title: 'Professional client delivery', description: 'Deliver photos that wow your clients.', skillLevel: 'ADVANCED' as const, engine: null, durationSeconds: 480, xpReward: 35, sortOrder: 23 },
    { slug: 'invoice-workflow', title: 'PayShot invoicing workflow', description: 'Get paid faster with beautiful invoices.', skillLevel: 'ADVANCED' as const, engine: null, durationSeconds: 420, xpReward: 30, sortOrder: 24 },
    { slug: 'signature-style', title: 'Defining your visual identity', description: 'Your style is your brand. Make it unmistakable.', skillLevel: 'MASTER' as const, engine: null, durationSeconds: 720, xpReward: 75, sortOrder: 25 },
    { slug: 'business-analytics', title: 'Reading your LensBiz data', description: 'Understand your business through numbers.', skillLevel: 'MASTER' as const, engine: null, durationSeconds: 600, xpReward: 60, sortOrder: 26 },
    { slug: 'headshot-workflow', title: 'HeadshotAI studio workflow', description: 'Create studio-quality headshots from any photo.', skillLevel: 'MASTER' as const, engine: null, durationSeconds: 720, xpReward: 75, sortOrder: 27 },
    { slug: 'video-retouch', title: 'FrameGlow video retouching', description: 'Apply face and skin tools to video.', skillLevel: 'MASTER' as const, engine: null, durationSeconds: 720, xpReward: 75, sortOrder: 28 },
    { slug: 'full-wedding-edit', title: 'Full wedding shoot edit', description: 'Edit an entire wedding shoot using every engine.', skillLevel: 'MASTER' as const, engine: null, durationSeconds: 900, xpReward: 100, sortOrder: 29 },
    { slug: 'release-master', title: 'YmShotS mastery — finale', description: 'You have mastered YmShotS. Your eye is fully yours.', skillLevel: 'MASTER' as const, engine: null, durationSeconds: 600, xpReward: 150, sortOrder: 30 },
  ];

  for (const lesson of lessons) {
    await prisma.academyLesson.upsert({
      where: { slug: lesson.slug },
      update: lesson,
      create: {
        ...lesson,
        contentJson: { intro: '', steps: [], tip: '', relatedLessons: [] },
      },
    });
  }

  console.log(`Seeded ${lessons.length} academy lessons.`);
  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
