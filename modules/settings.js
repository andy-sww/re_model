module.exports = {
  getUserData: function(){
    let file = fs.readFileSync(userConfigPath, 'utf8', function (err, data) {
      if (err) {
        Notifier.notify("error", "Loading", `User Daten konnte nicht geladen werden: ${file}`, err)
        return false
      }
      return data
    })
    userConfig = JSON.parse(file)
    // open user settings if default paths haven't been specified
    if(userConfig.defaultTemplatePath == null || userConfig.defaultProjectPath == null){
      module.exports.openUserSettings()
    }
    else{
      module.exports.updateUserInfo()
    }
  },
  checkUserSettings: function(){
    return new Promise(function (resolve, reject){
      // check if userPath exists
      if(fs.existsSync(userConfigPath)){
        resolve(true)
      }
      else {
        // if it doesn't -> create
        let userInit = {
          defaultTemplatePath: null,
          defaultProjectPath: null,
          devMode: false
        }
        fs.writeFile(userConfigPath, JSON.stringify(userInit, null, 2), (err) => {
          if (err){
            Notifier.notify("error", "User", `User File konnte nicht angelegt werden`, err)
            return false
          }
          else{
            // open user settings on init to make user change unspecified default paths
            userConfig = userInit
            module.exports.openUserSettings()
          }
        })
      }
    })
  },
  openUserSettings: function(){
    userSettings.style.display = "block"
    defaultTemplatePath.value = userConfig.defaultTemplatePath
    defaultProjectPath.value = userConfig.defaultProjectPath
    devMode.checked = userConfig.devMode
  },
  closeUserSettings: function(){
    if(userConfig.defaultTemplatePath == null || userConfig.defaultProjectPath == null){
      Notifier.notify("info", "User", "Es müssen ein gültiger Default-Template-Pfad und Default-Projekt-Pfad eingegeben werden.")
    }
    else {
      userSettings.style.display = "none"
    }
  },
  saveUserSettings: function(){
    if(defaultTemplatePath.value.length <= 0){
      userConfig.defaultTemplatePath = null
    }
    else {
      userConfig.defaultTemplatePath = defaultTemplatePath.value
    }
    if(defaultProjectPath.value.length <= 0){
      userConfig.defaultProjectPath = null
    }
    else {
      userConfig.defaultProjectPath = defaultProjectPath.value
    }
    userConfig.devMode = devMode.checked
    fs.writeFile(userConfigPath, JSON.stringify(userConfig, null, 2), (err) => {
      if (err){
        Notifier.notify("error", "User", `User File konnte nicht gespeichert werden.`, err)
        return false
      }
      else{
        module.exports.updateUserInfo()
        module.exports.closeUserSettings()
      }
    })
  },
  openDialog: function(node){
    let currentDefaultPath
    if(node.id == 'default-template-path'){
      if(userConfig.defaultTemplatePath != null){
        currentDefaultPath = userConfig.defaultTemplatePath
      }
      else {
        currentDefaultPath = path.join(os.homedir())
      }
    }
    else if(node.id == 'default-project-path'){
      if(userConfig.defaultProjectPath != null){
        currentDefaultPath = userConfig.defaultProjectPath
      }
      else {
        currentDefaultPath = path.join(os.homedir())
      }
    }
    else {
      currentDefaultPath = path.join(os.homedir())
    }
    dialog.showOpenDialog({defaultPath: currentDefaultPath, properties: ['openDirectory']})
    .then(response => {
      if(response.canceled){
        return false
      }
      else{
        node.value = response.filePaths[0]
      }
    })
    .catch(err => { // error @ open dialog
      Notifier.notify("error", "General", "Error message:", err) // @notifier.js
    })
  },
  updateUserInfo: function(){
    inDev = userConfig.devMode
    templatesLocation = path.normalize(userConfig.defaultTemplatePath)
    projectsLocation = path.normalize(userConfig.defaultProjectPath)
  }
}
