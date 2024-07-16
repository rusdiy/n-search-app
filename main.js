const { app, BrowserWindow, ipcMain } = require('electron');
const { exec } = require('child_process');
const path = require('path');
const os = require('os');
const macaddress = require('macaddress');
const exiftool = require('node-exiftool')
const exiftoolBin = require('dist-exiftool')

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
    },
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'icon.ico')
  });

  mainWindow.loadFile('index.html')
    .then(() => {
      const platform = os.platform();
      let command;

      if (platform === 'win32') {
        command = `echo %USERNAME%`;
      } else {
        command = 'whoami';
      }
      exec(command, (err, stdout) => {
        if (err) {
          console.error('Error getting logon user:', err);
          return;
        }
        mainWindow.webContents.send('whoami-result', stdout.trim());
        return;
      });
    })
    .then(() => {
      macaddress.one((err, mac) => {
        if (err) {
          console.error('Error retrieving MAC address:', err);
          mainWindow.webContents.send('macaddress-result', 'Error retrieving MAC address');
          return;
        }
        mainWindow.webContents.send('macaddress-result', mac);
      });
    })
    .then(() => {
      mainWindow.webContents.send('app-version', app.getVersion());
    })
    .catch((error) => {
      console.error('Error loading index.html:', error);
    });

  return mainWindow;
}

app.whenReady().then(() => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// IPC handler to open a file with its default application based on the OS
ipcMain.on('open-file', (event, filePath) => {
  const platform = os.platform();
  let command;
  const ep = new exiftool.ExiftoolProcess(exiftoolBin)
  ep.open()
  .then(() => ep.readMetadata(filePath, ['-File:all']))
  .then(console.log, console.error)
  .then(() => ep.close())
  .catch(console.error)

  if (platform === 'win32') {
    command = `start "" "${filePath}"`;
  } else if (platform === 'linux') {
    command = `xdg-open "${filePath}"`;
  } else if (platform === 'darwin') {
    command = `open "${filePath}"`;
  } else {
    console.error('Unsupported platform:', platform);
    return;
  }

  exec(command, (err) => {
    if (err) {
      console.error('Error opening file:', err);
    }
  });
});
