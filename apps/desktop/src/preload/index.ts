import { contextBridge, ipcRenderer } from 'electron';

const api = {
  isMuted: () => ipcRenderer.invoke('ymshots:is-muted'),
  getStorageDir: () => ipcRenderer.invoke('ymshots:get-storage-dir'),
  getPlatform: () => ipcRenderer.invoke('ymshots:get-platform'),
  isOnline: () => ipcRenderer.invoke('ymshots:is-online'),
};

contextBridge.exposeInMainWorld('ymshots', api);
