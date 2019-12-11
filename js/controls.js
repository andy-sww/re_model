//CONTROLS
const remote = require('electron').remote
let controls = remote.getCurrentWindow()

function windowMinimize(){
  controls.minimize()
}

function windowMaximize(){
  controls.maximize()
  document.getElementById('control-maximize').style.display = "none"
  document.getElementById('control-unmaximize').style.display = "inline-block"
}

function windowUnmaximize(){
  controls.unmaximize()
  document.getElementById('control-unmaximize').style.display = "none"
  document.getElementById('control-maximize').style.display = "inline-block"
}

function windowClose(){
  controls.close()
}
