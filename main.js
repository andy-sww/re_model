const {electron, app, BrowserWindow, ipcMain} = require('electron')
const { autoUpdater } = require('electron-updater')
const path = require('path')
autoUpdater.autoDownload = false

let win

function createWindow() {
  win = new BrowserWindow({
    width: 1180,
    height: 820,
    minWidth: 900,
    minHeight: 600,
    center: true,
    frame: false,
    backgroundColor: '#ffffff',
    webPreferences: {
      nodeIntegration: true
    }
  })

  win.loadFile('index.html')
  win.webContents.openDevTools()

  win.on('closed', () => {
    win=null
    app.quit()
  })
}

app.on('ready', () => {
  createWindow()
  autoUpdater.checkForUpdatesAndNotify()
})

app.on('window-all-closed', () => {app.quit()})

ipcMain.on('app_version', (event) => {
  event.sender.send('app_version', { version: app.getVersion() });
});

autoUpdater.on('update-available', (info) => {
  win.webContents.send('update_available')
  autoUpdater.downloadUpdate()
  .then(result => {
    win.webContents.send('info', {msg: result})
  })
  .catch(err => {
    win.webContents.send('info', {msg: err})
  })
})

autoUpdater.on('error', (err) => {
  win.webContents.send('info', {msg: err})
})

autoUpdater.on('update-downloaded', () => {
  win.webContents.send('update_downloaded')
})

ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall()
})
