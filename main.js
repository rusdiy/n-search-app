const { app, BrowserWindow, ipcMain } = require('electron');
const { exec } = require('child_process');
const path = require('path');
const os = require('os');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
    },
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
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

// IPC handler to execute 'whoami' command
ipcMain.on('get-whoami', (event) => {
  exec('whoami', (err, stdout) => {
    if (err) {
      console.error('Error executing whoami:', err);
      event.reply('whoami-result', 'Error retrieving username');
      return;
    }
    event.reply('whoami-result', stdout.trim());
  });
});
