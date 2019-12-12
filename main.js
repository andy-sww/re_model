const {electron, app, BrowserWindow, ipcMain} = require('electron')
const { autoUpdater } = require('electron-updater')
const path = require('path')

autoUpdater.autoDownload = false
var updateOnClose = false

let win

//MAIN WIN
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
  //win.webContents.openDevTools()
  win.on('closed', () => {
    if(updateOnClose){
      autoUpdater.quitAndInstall()
    }
    else {
      win=null
      app.quit()
    }
  })
}

// APP
app.on('ready', () => {
  createWindow()
  autoUpdater.checkForUpdatesAndNotify()
})

app.on('window-all-closed', () => {
  if(updateOnClose){
    autoUpdater.quitAndInstall()
  }
  else {
    app.quit()
  }
})

// IPC
ipcMain.on('app_version', (event) => {
  event.sender.send('app_version', { version: app.getVersion() });
})

ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall()
})

ipcMain.on('update_pending', () => {
  updateOnClose = true
})

// AUTO UPDATER
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
