import { app, net } from 'electron';
import fs from 'fs';
import path from 'path';

/**
 * Offline Manager — Ensures YmShotS works with zero internet.
 *
 * What works offline:
 * - ALL RAW editing (RawPulse pipeline)
 * - ALL AI inference (ONNX models are local)
 * - SignatureAI training + apply
 * - Photo import, cull, flag, rate
 * - Edit sessions (saved locally)
 * - Presets (stored locally)
 * - SoundPulse (Web Audio, no network)
 * - AcademyMode lessons (cached locally after first load)
 *
 * What needs internet:
 * - GalleryBox (serving galleries to clients)
 * - ShotTalk (sending messages)
 * - PayShot (processing payments)
 * - Stripe/NotchPay webhooks
 * - Sync between devices
 * - Academy challenge submission scoring
 */
export class OfflineManager {
  private cacheDir: string;
  private isOnline = true;
  private pendingSync: PendingAction[] = [];

  constructor() {
    this.cacheDir = path.join(app.getPath('userData'), 'offline-cache');
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  checkConnectivity(): boolean {
    this.isOnline = net.isOnline();
    return this.isOnline;
  }

  getStatus(): OfflineStatus {
    return {
      isOnline: this.isOnline,
      pendingActions: this.pendingSync.length,
      lastSyncAt: this.getLastSyncTime(),
      cachedLessons: this.getCachedLessonCount(),
    };
  }

  /**
   * Queue an action for sync when back online.
   * Used for: gallery creation, message sending, invoice sending, etc.
   */
  queueAction(action: PendingAction) {
    this.pendingSync.push(action);
    this.savePendingQueue();
  }

  /**
   * Sync all pending actions when back online.
   */
  async syncPending(apiBase: string): Promise<{ synced: number; failed: number }> {
    if (!this.isOnline) return { synced: 0, failed: 0 };

    let synced = 0, failed = 0;
    const remaining: PendingAction[] = [];

    for (const action of this.pendingSync) {
      try {
        const res = await fetch(`${apiBase}${action.endpoint}`, {
          method: action.method,
          headers: {
            'Content-Type': 'application/json',
            ...(action.authToken ? { 'Authorization': `Bearer ${action.authToken}` } : {}),
          },
          body: action.body ? JSON.stringify(action.body) : undefined,
        });

        if (res.ok) {
          synced++;
        } else {
          remaining.push(action);
          failed++;
        }
      } catch {
        remaining.push(action);
        failed++;
      }
    }

    this.pendingSync = remaining;
    this.savePendingQueue();
    return { synced, failed };
  }

  /**
   * Cache academy lessons locally for offline access.
   */
  async cacheLessons(lessons: any[]) {
    const lessonsPath = path.join(this.cacheDir, 'lessons.json');
    fs.writeFileSync(lessonsPath, JSON.stringify(lessons, null, 2));
  }

  getCachedLessons(): any[] {
    const lessonsPath = path.join(this.cacheDir, 'lessons.json');
    if (!fs.existsSync(lessonsPath)) return [];
    return JSON.parse(fs.readFileSync(lessonsPath, 'utf-8'));
  }

  /**
   * Cache edit sessions locally.
   */
  saveEditSession(photoId: string, editState: any) {
    const sessionsDir = path.join(this.cacheDir, 'edit-sessions');
    if (!fs.existsSync(sessionsDir)) fs.mkdirSync(sessionsDir, { recursive: true });
    fs.writeFileSync(path.join(sessionsDir, `${photoId}.json`), JSON.stringify(editState));
  }

  loadEditSession(photoId: string): any | null {
    const filePath = path.join(this.cacheDir, 'edit-sessions', `${photoId}.json`);
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }

  private savePendingQueue() {
    const queuePath = path.join(this.cacheDir, 'pending-sync.json');
    fs.writeFileSync(queuePath, JSON.stringify(this.pendingSync));
  }

  private loadPendingQueue() {
    const queuePath = path.join(this.cacheDir, 'pending-sync.json');
    if (fs.existsSync(queuePath)) {
      this.pendingSync = JSON.parse(fs.readFileSync(queuePath, 'utf-8'));
    }
  }

  private getLastSyncTime(): string | null {
    const syncPath = path.join(this.cacheDir, 'last-sync.txt');
    if (fs.existsSync(syncPath)) return fs.readFileSync(syncPath, 'utf-8');
    return null;
  }

  private getCachedLessonCount(): number {
    const lessonsPath = path.join(this.cacheDir, 'lessons.json');
    if (!fs.existsSync(lessonsPath)) return 0;
    return JSON.parse(fs.readFileSync(lessonsPath, 'utf-8')).length;
  }

  init() {
    this.loadPendingQueue();
    this.checkConnectivity();

    // Re-check connectivity every 30 seconds
    setInterval(() => {
      const wasOffline = !this.isOnline;
      this.checkConnectivity();
      if (wasOffline && this.isOnline && this.pendingSync.length > 0) {
        // Auto-sync when coming back online
        this.syncPending(process.env.API_BASE || 'https://ymshots.com/api');
      }
    }, 30000);
  }
}

interface PendingAction {
  endpoint: string;
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: any;
  authToken?: string;
  queuedAt: string;
}

interface OfflineStatus {
  isOnline: boolean;
  pendingActions: number;
  lastSyncAt: string | null;
  cachedLessons: number;
}
