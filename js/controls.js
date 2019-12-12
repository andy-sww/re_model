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
  // SAVE BEFORE QUIT
  if(!projectSaved){
    Notifier.dataLossWarning(config.template, 'close')
    .then(response => {
      if(response=='continue'){
        controls.close()
      }
      else {
        return false
      }
    })
  }
  else{
    controls.close()
  }
}
