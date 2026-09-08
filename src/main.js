const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

const { uploadToCatbox } = require('./providers/catbox');
const { uploadToLitterbox } = require('./providers/litterbox');

// Formats Discord reliably inline-embeds (playable in-chat). .mov is deliberately
// excluded: it works inconsistently across desktop/mobile clients.
const ALLOWED_EXTENSIONS = new Set(['.mp4', '.webm']);

const MAX_SIZE_BYTES = {
  catbox: 200 * 1024 * 1024, // 200MB
  litterbox: 1024 * 1024 * 1024, // 1GB
};

function createWindow() {
  const win = new BrowserWindow({
    width: 540,
    height: 460,
    resizable: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

ipcMain.handle('upload-video', async (_event, { filePath, provider, litterboxTime }) => {
  try {
    if (!filePath) {
      return { ok: false, error: 'No file selected.' };
    }

    const ext = path.extname(filePath).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return {
        ok: false,
        error: `Unsupported file type "${ext || '(none)'}". Only .mp4 and .webm are supported for reliable Discord embedding.`,
      };
    }

    if (provider !== 'catbox' && provider !== 'litterbox') {
      return { ok: false, error: 'Choose a host provider before uploading.' };
    }

    const stat = fs.statSync(filePath);
    const limit = MAX_SIZE_BYTES[provider];
    if (stat.size > limit) {
      const limitMB = Math.floor(limit / (1024 * 1024));
      return {
        ok: false,
        error: `File is ${(stat.size / (1024 * 1024)).toFixed(1)}MB, which exceeds the ${limitMB}MB limit for ${provider}.`,
      };
    }

    const url =
      provider === 'catbox'
        ? await uploadToCatbox(filePath)
        : await uploadToLitterbox(filePath, litterboxTime);

        // Wrap the raw file link through Autocompressor's embed tool. Discord's own
    // link-preview crawler often fails to inline-embed a bare hotlinked video
    // (especially from smaller/throttled hosts); this wrapper serves the
    // metadata Discord's crawler actually needs to render it inline.
    // A fixed thumbnail image is used for every upload (avoids aspect-ratio
    // gaps between the embed and the next message vs. Autocompressor's default).
    const THUMBNAIL_URL = 'https://staticdelivery.nexusmods.com/mods/8522/images/headers/10_1776223959.jpg';
    const embedUrl = `https://autocompressor.net/av1?v=${encodeURIComponent(url)}&i=${encodeURIComponent(THUMBNAIL_URL)}`;
    
    return { ok: true, url, embedUrl };
  } catch (err) {
    console.error('Upload error:', err);
    if (err.cause) console.error('Cause:', err.cause);
    return { ok: false, error: err.message || 'Upload failed for an unknown reason.' };
  }
});
