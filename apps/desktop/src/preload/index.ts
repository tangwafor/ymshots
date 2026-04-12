import { contextBridge, ipcRenderer } from 'electron';
import type { YmShotsAPI } from '@ymshots/types';

const api: Pick<YmShotsAPI, 'isMuted' | 'getStorageDir' | 'getPlatform'> & Record<string, unknown> = {
  // System
  isMuted: () => ipcRenderer.invoke('ymshots:is-muted'),
  getStorageDir: () => ipcRenderer.invoke('ymshots:get-storage-dir'),
  getPlatform: () => ipcRenderer.invoke('ymshots:get-platform'),

  // File operations — will be wired in later phases
  // importPhotos, readThumbnail, readPreview, etc.

  // Events (main -> renderer)
  onTetherPhoto: (callback: (data: unknown) => void) => {
    const handler = (_event: unknown, data: unknown) => callback(data);
    ipcRenderer.on('ymshots:tether-photo', handler);
    return () => ipcRenderer.removeListener('ymshots:tether-photo', handler);
  },
  onExportProgress: (callback: (data: unknown) => void) => {
    const handler = (_event: unknown, data: unknown) => callback(data);
    ipcRenderer.on('ymshots:export-progress', handler);
    return () => ipcRenderer.removeListener('ymshots:export-progress', handler);
  },
  onAIProgress: (callback: (data: unknown) => void) => {
    const handler = (_event: unknown, data: unknown) => callback(data);
    ipcRenderer.on('ymshots:ai-progress', handler);
    return () => ipcRenderer.removeListener('ymshots:ai-progress', handler);
  },
};

contextBridge.exposeInMainWorld('ymshots', api);
