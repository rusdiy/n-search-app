const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openFile: (filePath) => ipcRenderer.send('open-file', filePath),
  onWhoamiResult: (callback) => {
    ipcRenderer.on('whoami-result', (event, result) => {
      callback(result);
    });
  },
  onMacAddressResult: (callback) => ipcRenderer.on('macaddress-result', (event, result) => callback(result)),
  getVersion: (callback) => ipcRenderer.on('app-version', (event, result) => callback(result)),
  getMetadata: (filePath) => ipcRenderer.send('get-metadata', filePath),
  showMetadata: (callback) => ipcRenderer.on('show-metadata', (event, result) => callback(result)),
  setMetadata: (metadata) => ipcRenderer.send('set-metadata', metadata),
});
