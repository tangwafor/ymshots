CREATE TYPE "MessageSender" AS ENUM ('PHOTOGRAPHER', 'CLIENT', 'SYSTEM');
CREATE TYPE "ThreadStatus" AS ENUM ('ACTIVE', 'ARCHIVED', 'CLOSED');
CREATE TYPE "StyleForgeEffect" AS ENUM ('CARTOON', 'COMIC', 'WATERCOLOR', 'OIL_PAINTING', 'PENCIL_SKETCH', 'CHARCOAL', 'POP_ART', 'THREE_D_CHARACTER', 'ANIME', 'CARICATURE', 'MOSAIC', 'NEON_GLOW');

CREATE TABLE shottalk_threads (
  id TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  "clientId" TEXT,
  "shootId" TEXT,
  "galleryId" TEXT,
  title TEXT NOT NULL,
  status "ThreadStatus" NOT NULL DEFAULT 'ACTIVE',
  "lastMessageAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT shottalk_threads_pkey PRIMARY KEY (id),
  CONSTRAINT shottalk_threads_userId_fkey FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE shottalk_messages (
  id TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "threadId" TEXT NOT NULL,
  "senderId" TEXT,
  "senderType" "MessageSender" NOT NULL,
  "senderName" TEXT NOT NULL,
  body TEXT NOT NULL,
  "photoId" TEXT,
  "isRead" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT shottalk_messages_pkey PRIMARY KEY (id),
  CONSTRAINT shottalk_messages_threadId_fkey FOREIGN KEY ("threadId") REFERENCES shottalk_threads(id) ON DELETE CASCADE
);

CREATE TABLE shottalk_attachments (
  id TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "messageId" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "fileType" TEXT NOT NULL,
  "filePath" TEXT NOT NULL,
  "sizeBytes" BIGINT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT shottalk_attachments_pkey PRIMARY KEY (id),
  CONSTRAINT shottalk_attachments_messageId_fkey FOREIGN KEY ("messageId") REFERENCES shottalk_messages(id) ON DELETE CASCADE
);

CREATE TABLE photo_annotations (
  id TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "messageId" TEXT NOT NULL,
  "photoId" TEXT NOT NULL,
  "pinX" DECIMAL(5,4) NOT NULL,
  "pinY" DECIMAL(5,4) NOT NULL,
  note TEXT NOT NULL,
  resolved BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT photo_annotations_pkey PRIMARY KEY (id),
  CONSTRAINT photo_annotations_messageId_fkey FOREIGN KEY ("messageId") REFERENCES shottalk_messages(id) ON DELETE CASCADE
);

CREATE TABLE styleforge_jobs (
  id TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  "photoId" TEXT NOT NULL,
  effect "StyleForgeEffect" NOT NULL,
  intensity DECIMAL(3,2) NOT NULL DEFAULT 1.00,
  "paramsJson" JSONB,
  "outputPath" TEXT,
  status "JobStatus" NOT NULL DEFAULT 'QUEUED',
  "processingMs" INTEGER,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "completedAt" TIMESTAMPTZ,
  CONSTRAINT styleforge_jobs_pkey PRIMARY KEY (id),
  CONSTRAINT styleforge_jobs_userId_fkey FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT styleforge_jobs_photoId_fkey FOREIGN KEY ("photoId") REFERENCES photos(id) ON DELETE CASCADE
);
