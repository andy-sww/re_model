const {electron, app, BrowserWindow} = require('electron')
const path = require('path')

function createWindow() {

  let win = new BrowserWindow({
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
    //win=null
    app.quit()
  })
}

app.on('ready', () => {
  createWindow()
})

app.on('window-all-closed', () => {app.quit()})
