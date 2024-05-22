const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openFile: (filePath) => ipcRenderer.send('open-file', filePath),
  onWhoamiResult: (callback) => {
    ipcRenderer.on('whoami-result', (event, result) => {
      callback(result);
    });
  }
});
