const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openFile: (filePath) => ipcRenderer.send('open-file', filePath),
  getWhoami: () => ipcRenderer.send('get-whoami'),
  onWhoamiResult: (callback) => ipcRenderer.on('whoami-result', (event, result) => callback(result))
});
