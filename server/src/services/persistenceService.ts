import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { RuntimeData, User, Movie, Plan, SubscriptionOrder, Watchlist, Session, PlatformMetadata } from '../types/schema.js';
import { createInitialSeedData } from './seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../../data');
const DATA_FILE = path.join(DATA_DIR, 'runtime.json');
const TMP_FILE = path.join(DATA_DIR, 'runtime.json.tmp');

class PersistenceService {
  private memoryCache: RuntimeData | null = null;
  private writeQueue: Promise<void> = Promise.resolve();
  private isWriting: boolean = false;
  private diskWriteLock: boolean = false;

  constructor() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  public getDiskLockStatus(): boolean {
    return this.diskWriteLock;
  }

  public async init(): Promise<void> {
    if (!fs.existsSync(DATA_FILE)) {
      console.log('⚡ [Persistence] runtime.json not found. Generating fresh seed data...');
      const seed = await createInitialSeedData();
      await this.save(seed);
      this.memoryCache = seed;
      return;
    }

    try {
      const raw = await fs.promises.readFile(DATA_FILE, 'utf-8');
      this.memoryCache = JSON.parse(raw);
      console.log('✅ [Persistence] Loaded valid runtime.json database.');
    } catch (err) {
      console.error('⚠️ [Persistence] Corrupt or unreadable runtime.json encountered:', err);
      const timestamp = Date.now();
      const corruptBackup = path.join(DATA_DIR, `runtime.corrupt.${timestamp}.json`);
      try {
        await fs.promises.copyFile(DATA_FILE, corruptBackup);
        console.log(`🛡️ [Persistence] Corrupt file archived to: ${corruptBackup}`);
      } catch (backupErr) {
        console.error('Failed to archive corrupt file:', backupErr);
      }

      console.log('🔄 [Persistence] Auto-recovering baseline state from seed definitions...');
      const seed = await createInitialSeedData();
      await this.save(seed);
      this.memoryCache = seed;
    }
  }

  public getData(): RuntimeData {
    if (!this.memoryCache) {
      throw new Error('PersistenceService not initialized. Call init() first.');
    }
    return this.memoryCache;
  }

  /**
   * Sequential atomic write operation.
   * Write serialized JSON to .tmp, sync to disk, then rename.
   */
  public async mutate<T>(mutationFn: (data: RuntimeData) => Promise<T> | T): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.writeQueue = this.writeQueue
        .then(async () => {
          this.diskWriteLock = true;
          this.isWriting = true;
          try {
            const data = this.getData();
            const result = await mutationFn(data);
            await this.save(data);
            resolve(result);
          } catch (err) {
            reject(err);
          } finally {
            this.diskWriteLock = false;
            this.isWriting = false;
          }
        })
        .catch((err) => {
          this.diskWriteLock = false;
          this.isWriting = false;
          reject(err);
        });
    });
  }

  private async save(data: RuntimeData): Promise<void> {
    const serialized = JSON.stringify(data, null, 2);
    // 1. Write to tmp file
    const fileHandle = await fs.promises.open(TMP_FILE, 'w');
    try {
      await fileHandle.writeFile(serialized, 'utf-8');
      await fileHandle.sync(); // Flush buffer to storage
    } finally {
      await fileHandle.close();
    }

    // 2. Atomic rename
    await fs.promises.rename(TMP_FILE, DATA_FILE);
  }

  // Helper selectors
  public getUserById(id: string): User | undefined {
    return this.getData().users.find((u) => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.getData().users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public getSession(sessionId: string): Session | undefined {
    return this.getData().sessions.find((s) => s.id === sessionId);
  }

  public getMovieById(id: string): Movie | undefined {
    return this.getData().movies.find((m) => m.id === id);
  }

  public getPlans(): Plan[] {
    return this.getData().plans;
  }

  public getPlanById(id: string): Plan | undefined {
    return this.getData().plans.find((p) => p.id === id);
  }

  public getWatchlistForUser(userId: string): Watchlist[] {
    return this.getData().watchlists.filter((w) => w.userId === userId);
  }

  public getSubscriptionsForUser(userId: string): SubscriptionOrder[] {
    return this.getData().subscriptions.filter((s) => s.userId === userId);
  }
}

export const persistenceService = new PersistenceService();
