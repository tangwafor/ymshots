-- CreateEnum
CREATE TYPE "PlanTier" AS ENUM ('FREE', 'PRO', 'STUDIO');

-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('MOBILE', 'DESKTOP', 'TABLET');

-- CreateEnum
CREATE TYPE "Theme" AS ENUM ('LIGHT', 'DARK', 'SYSTEM');

-- CreateEnum
CREATE TYPE "ExportFormat" AS ENUM ('JPEG', 'TIFF', 'PNG', 'WEBP', 'RAW_XMP', 'HEIF');

-- CreateEnum
CREATE TYPE "GridSize" AS ENUM ('SMALL', 'MEDIUM', 'LARGE');

-- CreateEnum
CREATE TYPE "ShootType" AS ENUM ('WEDDING', 'PORTRAIT', 'COMMERCIAL', 'EVENT', 'STREET', 'PRODUCT', 'WILDLIFE', 'OTHER');

-- CreateEnum
CREATE TYPE "ShootStatus" AS ENUM ('IMPORTING', 'CULLING', 'EDITING', 'DELIVERING', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "FileFormat" AS ENUM ('RAW', 'JPEG', 'HEIF', 'PNG', 'TIFF');

-- CreateEnum
CREATE TYPE "FlagStatus" AS ENUM ('NONE', 'FLAGGED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ColorLabel" AS ENUM ('RED', 'YELLOW', 'GREEN', 'BLUE', 'PURPLE', 'NONE');

-- CreateEnum
CREATE TYPE "KeywordSource" AS ENUM ('USER', 'AI');

-- CreateEnum
CREATE TYPE "EditEngine" AS ENUM ('RAWPULSE', 'PIXELFORGE', 'GLOWKIT', 'FACECAST', 'CHROMADESK', 'GRAINLAB', 'SCENEDROP', 'CLEANSLATE');

-- CreateEnum
CREATE TYPE "LayerType" AS ENUM ('ADJUSTMENT', 'MASK', 'STAMP', 'HEALING', 'TEXT');

-- CreateEnum
CREATE TYPE "MaskType" AS ENUM ('SUBJECT', 'SKY', 'SKIN', 'LUMINOSITY', 'GRADIENT', 'BRUSH', 'AI_CUSTOM');

-- CreateEnum
CREATE TYPE "StyleShootType" AS ENUM ('WEDDING', 'PORTRAIT', 'COMMERCIAL', 'ALL');

-- CreateEnum
CREATE TYPE "PresetSource" AS ENUM ('USER', 'LOOKVAULT', 'MARKETPLACE');

-- CreateEnum
CREATE TYPE "BeautyTool" AS ENUM ('SMOOTH', 'BLEMISH', 'GLOW', 'TEETH', 'EYES', 'CONTOUR', 'RESHAPE', 'MAKEUP', 'HAIR_COLOR', 'HAIR_STYLE', 'BEARD', 'AGE_MORPH', 'GENDER_SWAP', 'TAN', 'PORE_REFINE');

-- CreateEnum
CREATE TYPE "GalleryStatus" AS ENUM ('DRAFT', 'ACTIVE', 'EXPIRED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'SENT', 'VIEWED', 'PAID', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ShootPhase" AS ENUM ('SHOOTING', 'IMPORTING', 'CULLING', 'EDITING', 'DELIVERING');

-- CreateEnum
CREATE TYPE "ConnectionType" AS ENUM ('USB', 'WIFI');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('QUEUED', 'PROCESSING', 'COMPLETE', 'FAILED');

-- CreateEnum
CREATE TYPE "SkillLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'MASTER');

-- CreateEnum
CREATE TYPE "LessonStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "AcademyLevel" AS ENUM ('BEGINNER', 'APPRENTICE', 'PROFESSIONAL', 'MASTER', 'LEGEND');

-- CreateEnum
CREATE TYPE "PitchSource" AS ENUM ('WELCOME', 'PLAN_GATE', 'ABOUT', 'SHARE_LINK', 'UPGRADE_NUDGE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "planTier" "PlanTier" NOT NULL DEFAULT 'FREE',
    "planExpiresAt" TIMESTAMP(3),
    "stripeCustomerId" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "locale" TEXT NOT NULL DEFAULT 'en-US',
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deviceName" TEXT,
    "deviceType" "DeviceType" NOT NULL,
    "refreshTokenHash" TEXT NOT NULL,
    "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_preferences" (
    "userId" TEXT NOT NULL,
    "theme" "Theme" NOT NULL DEFAULT 'SYSTEM',
    "soundEnabled" BOOLEAN NOT NULL DEFAULT true,
    "soundVolume" DECIMAL(3,2) NOT NULL DEFAULT 0.70,
    "hapticsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "defaultExportFormat" "ExportFormat" NOT NULL DEFAULT 'JPEG',
    "defaultExportQuality" INTEGER NOT NULL DEFAULT 92,
    "defaultColorProfile" TEXT NOT NULL DEFAULT 'sRGB',
    "gridSize" "GridSize" NOT NULL DEFAULT 'MEDIUM',
    "showHistogram" BOOLEAN NOT NULL DEFAULT true,
    "currency" CHAR(3) NOT NULL DEFAULT 'USD',
    "showCoachTips" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "shoots" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "clientId" TEXT,
    "name" TEXT NOT NULL,
    "shootType" "ShootType" NOT NULL,
    "shootDate" DATE,
    "locationName" TEXT,
    "locationLat" DECIMAL(9,6),
    "locationLng" DECIMAL(9,6),
    "totalPhotos" INTEGER NOT NULL DEFAULT 0,
    "flaggedCount" INTEGER NOT NULL DEFAULT 0,
    "status" "ShootStatus" NOT NULL DEFAULT 'IMPORTING',
    "coverPhotoId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shoots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "photos" (
    "id" TEXT NOT NULL,
    "shootId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "filenameOriginal" TEXT NOT NULL,
    "filenameStored" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "fileFormat" "FileFormat" NOT NULL,
    "cameraMake" TEXT,
    "cameraModel" TEXT,
    "lensModel" TEXT,
    "focalLengthMm" DECIMAL(6,1),
    "aperture" DECIMAL(4,1),
    "shutterSpeed" TEXT,
    "iso" INTEGER,
    "widthPx" INTEGER NOT NULL,
    "heightPx" INTEGER NOT NULL,
    "fileSizeBytes" BIGINT NOT NULL,
    "capturedAt" TIMESTAMP(3),
    "gpsLat" DECIMAL(9,6),
    "gpsLng" DECIMAL(9,6),
    "flagStatus" "FlagStatus" NOT NULL DEFAULT 'NONE',
    "starRating" SMALLINT,
    "colorLabel" "ColorLabel" NOT NULL DEFAULT 'NONE',
    "isInFocus" BOOLEAN,
    "faceCount" SMALLINT,
    "expressionScore" DECIMAL(3,2),
    "sharpnessScore" DECIMAL(3,2),
    "thumbnailPath" TEXT,
    "previewPath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "photo_keywords" (
    "photoId" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "source" "KeywordSource" NOT NULL,

    CONSTRAINT "photo_keywords_pkey" PRIMARY KEY ("photoId","keyword")
);

-- CreateTable
CREATE TABLE "photo_collections" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isSmart" BOOLEAN NOT NULL DEFAULT false,
    "smartFilterJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "photo_collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collection_photos" (
    "collectionId" TEXT NOT NULL,
    "photoId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "collection_photos_pkey" PRIMARY KEY ("collectionId","photoId")
);

-- CreateTable
CREATE TABLE "edit_sessions" (
    "id" TEXT NOT NULL,
    "photoId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "editVersion" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "edit_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "edit_adjustments" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "engine" "EditEngine" NOT NULL,
    "adjustmentKey" TEXT NOT NULL,
    "valueNumber" DECIMAL(10,4),
    "valueJson" JSONB,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "edit_adjustments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "edit_history" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "snapshotJson" JSONB NOT NULL,
    "label" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "edit_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "layers" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "LayerType" NOT NULL,
    "blendMode" TEXT NOT NULL DEFAULT 'normal',
    "opacity" DECIMAL(3,2) NOT NULL DEFAULT 1.00,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL,
    "paramsJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "layers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "masks" (
    "id" TEXT NOT NULL,
    "layerId" TEXT NOT NULL,
    "type" "MaskType" NOT NULL,
    "feather" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "density" DECIMAL(3,2) NOT NULL DEFAULT 1.00,
    "invert" BOOLEAN NOT NULL DEFAULT false,
    "maskDataPath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "masks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "style_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shootType" "StyleShootType" NOT NULL DEFAULT 'ALL',
    "confidenceScore" DECIMAL(3,2),
    "trainingPhotoCount" INTEGER NOT NULL DEFAULT 0,
    "modelVersion" TEXT,
    "modelPath" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "swatchColor" CHAR(7) NOT NULL DEFAULT '#D4537E',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "style_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "style_training_pairs" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "photoId" TEXT NOT NULL,
    "beforeEditJson" JSONB NOT NULL,
    "afterEditJson" JSONB NOT NULL,
    "qualityWeight" DECIMAL(3,2) NOT NULL DEFAULT 1.00,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "style_training_pairs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "presets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "source" "PresetSource" NOT NULL DEFAULT 'USER',
    "adjustmentsJson" JSONB NOT NULL,
    "thumbnailPath" TEXT,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "priceCents" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "presets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "face_sessions" (
    "id" TEXT NOT NULL,
    "photoId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "faceIndex" SMALLINT NOT NULL,
    "detectionBoxJson" JSONB NOT NULL,
    "landmarkJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "face_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beauty_adjustments" (
    "id" TEXT NOT NULL,
    "faceSessionId" TEXT NOT NULL,
    "tool" "BeautyTool" NOT NULL,
    "intensity" DECIMAL(3,2) NOT NULL,
    "paramsJson" JSONB,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "beauty_adjustments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "makeup_looks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "lookJson" JSONB NOT NULL,
    "thumbnailPath" TEXT,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "makeup_looks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "company" TEXT,
    "notes" TEXT,
    "totalSpentCents" BIGINT NOT NULL DEFAULT 0,
    "shootCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "galleries" (
    "id" TEXT NOT NULL,
    "shootId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "passwordHash" TEXT,
    "watermarkEnabled" BOOLEAN NOT NULL DEFAULT false,
    "watermarkText" TEXT,
    "downloadAllowed" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3),
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "status" "GalleryStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "galleries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gallery_photos" (
    "galleryId" TEXT NOT NULL,
    "photoId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "clientSelected" BOOLEAN NOT NULL DEFAULT false,
    "clientComment" TEXT,

    CONSTRAINT "gallery_photos_pkey" PRIMARY KEY ("galleryId","photoId")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "shootId" TEXT,
    "invoiceNumber" TEXT NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "subtotalCents" BIGINT NOT NULL,
    "taxRate" DECIMAL(5,4) NOT NULL,
    "taxCents" BIGINT NOT NULL,
    "totalCents" BIGINT NOT NULL,
    "currency" CHAR(3) NOT NULL,
    "dueDate" DATE,
    "paidAt" TIMESTAMP(3),
    "stripePaymentIntentId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_line_items" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(8,2) NOT NULL,
    "unitPriceCents" BIGINT NOT NULL,
    "totalCents" BIGINT NOT NULL,
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "invoice_line_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shoot_time_logs" (
    "id" TEXT NOT NULL,
    "shootId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "phase" "ShootPhase" NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3),
    "durationSeconds" INTEGER,

    CONSTRAINT "shoot_time_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_events" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventDataJson" JSONB,
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "revenue_snapshots" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "periodMonth" CHAR(7) NOT NULL,
    "totalRevenueCents" BIGINT NOT NULL,
    "invoicesSent" INTEGER NOT NULL,
    "invoicesPaid" INTEGER NOT NULL,
    "shootsCompleted" INTEGER NOT NULL,
    "avgJobValueCents" BIGINT NOT NULL,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "revenue_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tether_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "shootId" TEXT NOT NULL,
    "cameraMake" TEXT,
    "cameraModel" TEXT,
    "connectionType" "ConnectionType" NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "photosReceived" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "tether_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "export_jobs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "photoIdsJson" JSONB NOT NULL,
    "format" "ExportFormat" NOT NULL,
    "quality" SMALLINT,
    "longEdgePx" INTEGER,
    "colorProfile" TEXT,
    "sharpening" SMALLINT,
    "watermarkEnabled" BOOLEAN NOT NULL DEFAULT false,
    "stripMetadata" BOOLEAN NOT NULL DEFAULT false,
    "renamePattern" TEXT,
    "outputPath" TEXT,
    "status" "JobStatus" NOT NULL DEFAULT 'QUEUED',
    "progressPct" SMALLINT NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "export_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sound_events_log" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventKey" TEXT NOT NULL,
    "playedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "volumeAtTime" DECIMAL(3,2) NOT NULL,

    CONSTRAINT "sound_events_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academy_lessons" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "skillLevel" "SkillLevel" NOT NULL,
    "engine" "EditEngine",
    "durationSeconds" INTEGER NOT NULL,
    "xpReward" INTEGER NOT NULL DEFAULT 10,
    "sortOrder" INTEGER NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "contentJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academy_lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_academy_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "status" "LessonStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "completedAt" TIMESTAMP(3),
    "xpEarned" INTEGER NOT NULL DEFAULT 0,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "lastSeenAt" TIMESTAMP(3),

    CONSTRAINT "user_academy_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academy_challenges" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "samplePhotoPath" TEXT NOT NULL,
    "referenceEditJson" JSONB NOT NULL,
    "scoringEngine" TEXT NOT NULL DEFAULT 'signatureai',
    "xpReward" INTEGER NOT NULL DEFAULT 25,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "academy_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "challenge_submissions" (
    "id" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "editJson" JSONB NOT NULL,
    "similarityScore" DECIMAL(4,3) NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "challenge_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_academy_stats" (
    "userId" TEXT NOT NULL,
    "totalXp" INTEGER NOT NULL DEFAULT 0,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lessonsCompleted" INTEGER NOT NULL DEFAULT 0,
    "challengesPassed" INTEGER NOT NULL DEFAULT 0,
    "currentLevel" "AcademyLevel" NOT NULL DEFAULT 'BEGINNER',
    "lastActiveDate" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_academy_stats_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "pitch_views" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "source" "PitchSource" NOT NULL,
    "slideReached" INTEGER NOT NULL DEFAULT 1,
    "converted" BOOLEAN NOT NULL DEFAULT false,
    "planChosen" "PlanTier",
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pitch_views_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "galleries_slug_key" ON "galleries"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoiceNumber_key" ON "invoices"("invoiceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "revenue_snapshots_userId_periodMonth_key" ON "revenue_snapshots"("userId", "periodMonth");

-- CreateIndex
CREATE UNIQUE INDEX "academy_lessons_slug_key" ON "academy_lessons"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "user_academy_progress_userId_lessonId_key" ON "user_academy_progress"("userId", "lessonId");

-- AddForeignKey
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shoots" ADD CONSTRAINT "shoots_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shoots" ADD CONSTRAINT "shoots_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photos" ADD CONSTRAINT "photos_shootId_fkey" FOREIGN KEY ("shootId") REFERENCES "shoots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photo_keywords" ADD CONSTRAINT "photo_keywords_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "photos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_photos" ADD CONSTRAINT "collection_photos_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "photo_collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_photos" ADD CONSTRAINT "collection_photos_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "photos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "edit_sessions" ADD CONSTRAINT "edit_sessions_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "photos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "edit_adjustments" ADD CONSTRAINT "edit_adjustments_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "edit_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "edit_history" ADD CONSTRAINT "edit_history_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "edit_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "layers" ADD CONSTRAINT "layers_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "edit_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "masks" ADD CONSTRAINT "masks_layerId_fkey" FOREIGN KEY ("layerId") REFERENCES "layers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "style_profiles" ADD CONSTRAINT "style_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "style_training_pairs" ADD CONSTRAINT "style_training_pairs_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "style_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "style_training_pairs" ADD CONSTRAINT "style_training_pairs_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "photos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presets" ADD CONSTRAINT "presets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "face_sessions" ADD CONSTRAINT "face_sessions_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "photos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "face_sessions" ADD CONSTRAINT "face_sessions_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "edit_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beauty_adjustments" ADD CONSTRAINT "beauty_adjustments_faceSessionId_fkey" FOREIGN KEY ("faceSessionId") REFERENCES "face_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "galleries" ADD CONSTRAINT "galleries_shootId_fkey" FOREIGN KEY ("shootId") REFERENCES "shoots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "galleries" ADD CONSTRAINT "galleries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gallery_photos" ADD CONSTRAINT "gallery_photos_galleryId_fkey" FOREIGN KEY ("galleryId") REFERENCES "galleries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gallery_photos" ADD CONSTRAINT "gallery_photos_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "photos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_shootId_fkey" FOREIGN KEY ("shootId") REFERENCES "shoots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_line_items" ADD CONSTRAINT "invoice_line_items_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shoot_time_logs" ADD CONSTRAINT "shoot_time_logs_shootId_fkey" FOREIGN KEY ("shootId") REFERENCES "shoots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shoot_time_logs" ADD CONSTRAINT "shoot_time_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revenue_snapshots" ADD CONSTRAINT "revenue_snapshots_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tether_sessions" ADD CONSTRAINT "tether_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tether_sessions" ADD CONSTRAINT "tether_sessions_shootId_fkey" FOREIGN KEY ("shootId") REFERENCES "shoots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "export_jobs" ADD CONSTRAINT "export_jobs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sound_events_log" ADD CONSTRAINT "sound_events_log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_academy_progress" ADD CONSTRAINT "user_academy_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_academy_progress" ADD CONSTRAINT "user_academy_progress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "academy_lessons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_challenges" ADD CONSTRAINT "academy_challenges_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "academy_lessons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenge_submissions" ADD CONSTRAINT "challenge_submissions_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "academy_challenges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenge_submissions" ADD CONSTRAINT "challenge_submissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_academy_stats" ADD CONSTRAINT "user_academy_stats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

