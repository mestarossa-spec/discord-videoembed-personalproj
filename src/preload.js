const { contextBridge, ipcRenderer, webUtils } = require('electron');

contextBridge.exposeInMainWorld('api', {
  uploadVideo: (payload) => ipcRenderer.invoke('upload-video', payload),
  // webUtils.getPathForFile is the current (non-deprecated) way to get an absolute
  // filesystem path from a File object dropped/selected in the renderer.
  getPathForFile: (file) => webUtils.getPathForFile(file),
});
