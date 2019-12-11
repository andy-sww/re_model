const { ipcRenderer } = require('electron')
const version = document.getElementById('version')
const updateNode = document.getElementById('update-checker')
var updateNote

ipcRenderer.send('app_version')

ipcRenderer.on('app_version', (event, arg) => {
ipcRenderer.removeAllListeners('app_version')
  version.innerText = `Version: ${arg.version}`
})

ipcRenderer.on('update_available', () => {
  ipcRenderer.removeAllListeners('update_available')
  updateChecker(true)
})

ipcRenderer.on('info', function(event, data){
  console.log(data.msg);
})

ipcRenderer.on('update_downloaded', () => {
  ipcRenderer.removeAllListeners('update_downloaded')
  updateChecker(false)
  showUpdateInstallScreen()
})

// UPDATE CHECK NOTIFICATION
function updateChecker(state){
  if(state){
    updateNode.style.display = 'inline'
    updateNote = window.setInterval( function() {
      var dotLoader = document.getElementById("dot-loader")
      if ( dotLoader.innerHTML.length > 3 ){
        dotLoader.innerHTML = ""
      }
      else {
        dotLoader.innerHTML += "."
      }
    }, 200)
  }
  else {
    updateNode.style.display = 'none'
    clearInterval(updateNote)
  }
}

function showUpdateInstallScreen(){
  let options = {
    type: 'info',
    buttons: [`Installieren`, `Später`],
    defaultId: 0,
    title: 'Auto Updater',
    detail: 'Ein neues Update ist verfügbar.'
  }
  dialog.showMessageBox(null, options, (response) => {
    // abort
    if(response == 1){
      return false
    }
    // continue
    if(response == 0){
      restartApp()
    }
  })
}

function restartApp() {
  ipcRenderer.send('restart_app');
}
