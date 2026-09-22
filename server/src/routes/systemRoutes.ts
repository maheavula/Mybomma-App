import { Router } from 'express';
import os from 'os';
import { persistenceService } from '../services/persistenceService.js';

const router = Router();

// GET /api/system/health
router.get('/health', (req, res) => {
  const memory = process.memoryUsage();
  const uptimeSeconds = Math.floor(process.uptime());

  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(uptimeSeconds / 3600)}h ${Math.floor((uptimeSeconds % 3600) / 60)}m ${uptimeSeconds % 60}s`,
    uptimeSeconds,
    diskWriteLock: persistenceService.getDiskLockStatus(),
    memory: {
      rssMb: (memory.rss / (1024 * 1024)).toFixed(2),
      heapTotalMb: (memory.heapTotal / (1024 * 1024)).toFixed(2),
      heapUsedMb: (memory.heapUsed / (1024 * 1024)).toFixed(2),
      systemFreeMemMb: (os.freemem() / (1024 * 1024)).toFixed(2),
      systemTotalMemMb: (os.totalmem() / (1024 * 1024)).toFixed(2)
    }
  });
});

// GET /api/system/info
router.get('/info', (req, res) => {
  const metadata = persistenceService.getData().metadata;

  res.json({
    success: true,
    platform: metadata.platform,
    version: metadata.version,
    region: metadata.region,
    streamingStatus: metadata.streamingStatus,
    protocols: ['HLS (HTTP Live Streaming)', 'DASH', 'Progressive MP4', 'Dolby Atmos Pass-Through'],
    videoCodecs: ['H.264 / AVC', 'H.265 / HEVC', 'AV1'],
    audioCodecs: ['AAC-LC', 'Dolby Digital Plus (E-AC-3)', 'Dolby Atmos']
  });
});

export default router;
