import { app, BrowserWindow, ipcMain, shell, net } from 'electron';
import path from 'path';
import fs from 'fs';

const CREATOR_SIGNATURE = 'Built by ta-tech';
const APP_URL = 'https://ymshots.com/app';
const FALLBACK_URL = `file://${path.join(__dirname, '..', 'renderer', 'index.html')}`;

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: `YmShotS | ${CREATOR_SIGNATURE}`,
    backgroundColor: '#0A0A0A',
    icon: path.join(__dirname, '..', '..', 'resources', 'icon.png'),
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload', 'index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  // Try loading web app; fall back to local if offline
  if (net.isOnline()) {
    mainWindow.loadURL(APP_URL);
  } else {
    // Offline: load local bundled version
    const localPath = path.join(__dirname, '..', 'renderer', 'index.html');
    if (fs.existsSync(localPath)) {
      mainWindow.loadFile(localPath);
    } else {
      mainWindow.loadURL(APP_URL); // Try anyway
    }
  }

  // Handle offline/online transitions
  mainWindow.webContents.on('did-fail-load', () => {
    const localPath = path.join(__dirname, '..', 'renderer', 'index.html');
    if (fs.existsSync(localPath)) {
      mainWindow.loadFile(localPath);
    }
  });

  // Open external links in browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  // Dev tools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Register IPC handlers
ipcMain.handle('ymshots:get-platform', () => process.platform);
ipcMain.handle('ymshots:get-storage-dir', () => {
  return path.join(app.getPath('userData'), 'storage');
});
ipcMain.handle('ymshots:is-muted', () => false);
ipcMain.handle('ymshots:is-online', () => net.isOnline());
