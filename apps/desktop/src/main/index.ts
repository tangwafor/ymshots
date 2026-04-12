import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';

const CREATOR_SIGNATURE = 'Built by ta-tech';

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: `YmShotS \u2014 ${CREATOR_SIGNATURE}`,
    backgroundColor: '#0A0A0A',
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload', 'index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  // In dev, load from vite dev server; in prod, load the built index.html
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));
  }

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });
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
registerIpcHandlers();

function registerIpcHandlers() {
  ipcMain.handle('ymshots:get-platform', () => process.platform);
  ipcMain.handle('ymshots:get-storage-dir', () => {
    return path.join(app.getPath('userData'), 'storage');
  });
  ipcMain.handle('ymshots:is-muted', () => false);

  // File operations, RAW processing, AI inference, export, tethering
  // will be registered here as packages are built in later phases
}
