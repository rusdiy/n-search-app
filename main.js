const { app, BrowserWindow, ipcMain } = require('electron');
const { exec } = require('child_process');
const path = require('path');
const os = require('os');
const macaddress = require('macaddress');
const ExifTool = require("exiftool-vendored").ExifTool

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

ipcMain.on('get-metadata', (event, filePath) => {
  const exiftool = new ExifTool({ taskTimeoutMillis: 50000 });
  exiftool
    .read(filePath)
    .then((data) => {
      data['FilePath'] = filePath;
      event.sender.send('show-metadata', data);
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      exiftool.end();
    });
});

ipcMain.on('set-metadata', (event, metadata) => {
  filePath = metadata['FilePath'];
  delete metadata['FilePath'];
  const exiftool = new ExifTool({ taskTimeoutMillis: 50000 });
  exiftool
    .write(filePath, metadata)
    .then((res) => {
      console.log(res)
      event.sender.send('metadata-set', res);
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      exiftool.end();
    });
})
