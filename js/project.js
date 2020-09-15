// SAVE STATE
// save state & save button state change
function toggleSaveState(state){
  if(state){
    projectSaved = true
    saveButton.disabled = true
  }
  else {
    projectSaved = false
    saveButton.disabled = false
  }
}
// INIT STATE
// initialize state & reconfigure init-only element
function toggleInitState(state){
  if(state){
    projectInit = true
  }
  else {
    projectInit = false
  }
  var inits = document.querySelectorAll('.init-only')
  for(o=0; o<inits.length; o++){
    let element = inits[o]
    if(projectInit){
      element.disabled = false
      element.classList.remove('tooltip')
    }
    else {
      element.disabled = true
      if(!element.classList.contains('tooltip')){
        element.classList.add('tooltip')
      }
    }
  }
}
// SAVE PROJECT
function saveProjectAs(){
  // check if there is an active template loaded
  if(templateLoaded){
    let filename = dialog.showSaveDialog(null, {defaultPath: projectsLocation})
      .then(result => {
        filename = result.filePath
        if(filename !== ""){
          // check if users tries to save a project into the default templates folder
          if(filename.includes(templatesLocation)){
            Notifier.notify("error", "Saving", `Ein Projekt kann nicht in den Default-Templates Ordner gespeichert werden.\n\nBitte einen anderen Speicherort wählen.`) // @notifier.js
            return false
          }
          // update template name in config to saved-file-name
          let array = path.normalize(filename).split("\\") // BUGGY: works only on windows
          let name = array[(array.length - 1)]
          config.template = name
          saveProject(filename)
        }
      }).catch(err => {
        Notifier.notify("error", "General", "Error message:", err) // @notifier.js
      })
  }
  // if there is no loaded template abort
  else{
    Notifier.notify('warning', 'Saving', 'Kein Template zu Speichern.\nEs muss erst ein Template geladen werden.') // @notifier.js
    return false
  }
}
// switch from 'save' to 'save as' if project hasn't been saved before
function saveProject(savePath){
  if(!projectInit){
    // if project hasn't been initialized => check if there is a valid save path...
    if(typeof savePath === "undefined" || savePath == projectPath){
      saveProjectAs()
      return false
    }
    // ...then copy template contents...
    fs.copy(projectPath, savePath)
    .then(() => {
      // ...then update config file...
      updateConfigAndSave()
      // ...then reload project...
      reloadProject(savePath)
    })
    .catch(err => {
      Notifier.copyError(err, `"${projectPath}" ==> "${savePath}"`) // @notifier.js
    })
  }
  else {
    // else update config file
    updateConfigAndSave()
  }
  // UPDATE CONFIG FILE
  function updateConfigAndSave(){
    // write page settings (if existant)
    if(check(config, 'pages')){
      updatePageSettings()
    }
    // update config object
    updateConfig()
    let saveConfig = JSON.stringify(config, null, 2)
    // overwrite config in saved project
    fs.writeFileSync(stabilize(savePath, 'config.json'), saveConfig)
    // reorganize after project was saved
    projectPath = savePath
    toggleSaveState(true)
    toggleInitState(true)
    // update name
    templateName.innerHTML = config.template
  }
}
// LOAD PROJECT
function loadProject(){
  // data loss prevention if user tries to load a new project while not saved
  if(projectInit && !projectSaved){
    Notifier.dataLossWarning(config.template, 'load') // @notifier.js
    .then(response => {
      // promise resolved to aborting
      if(response=="abort"){
        return false
      }
      // promise resolved to continuing
      else if(response=="continue"){
        proceedWithLoad()
      }
    })
    .catch(err => { // error @ data loss prevention
      Notifier.notify("error", "General", "Error message:", err) // @notifier.js
    })
  }
  else {
    proceedWithLoad()
  }
  function proceedWithLoad(){
    // open dialog
    dialog.showOpenDialog({defaultPath: projectsLocation, properties: ['openDirectory']})
    .then(response => {
      if(response.canceled){
        return false
      }
      else{
        let loadPath = response.filePaths[0]
        // check if user tries to load a project from default templates folder
        if(loadPath.includes(templatesLocation)){
          Notifier.notify("error", "Template", `Ein Projekt kann nicht aus dem Default-Templates Ordner geladen werden.\n\nZum Laden eines Default-Templates den "Template Laden" Button benutzen.`) // @notifier.js
          return false
        }
        // empty displaying html elements
        resetContainerNodes() // @renderer.js
        // load new project
        loadTemplate(loadPath) // @templating.js
        toggleSaveState(true)
        toggleInitState(true)
      }
    })
    .catch(err => {
      Notifier.notify("error", "General", "Error message:", err) // @notifier.js
    })
  }
}
// RELOAD PROJECT (this must only be called when project is saved & initialized)
function reloadProject(projectPath){
  resetContainerNodes() // @renderer.js
  loadTemplate(projectPath)
  toggleSaveState(true)
  toggleInitState(true)
}
// UPDATE PAGE SETTINGS
function updatePageSettings(){
  // dw template
  let dwChecked = document.getElementById("dw-export").checked
  if(check(config, 'DWT') && check(config.DWT, 'export')){
    config.DWT.export = dwChecked
  }
  // get state of checkboxes ...
  updateSelection('render-page', 'render')
  updateSelection('title-transfer', 'transferTitle')
  updateSelection('desc-transfer', 'transferDescription')
  updateSelection('content-transfer', 'transferContent')
  // ... and save checkbox state to config
  function updateSelection(selector, target){
    let selects = document.querySelectorAll(`input.${selector}`)
    for(s=0; s<selects.length; s++){
      let index = selects[s].getAttribute('data-index')
      let checkState = selects[s].checked
      config.pages[index][`${target}`] = checkState
    }
  }
}

// RENDER OUTPUT
function renderOutput(){
  updatePageSettings()
  updateConfig()
  // ensure output path
  let outputPath = stabilize(projectPath, 'output')
  fs.ensureDir(outputPath)
  // sanitize output folder
  fs.emptyDirSync(outputPath, err => {
    if(err){
      Notifier.notify("error", "Cleanup", `Der Output Ordner ${outputPath} konnte nicht geleert werden. Möglicherweise befindet sich eine Datei darin in Nutzung.`, err)
    }
  })
  // render css for output
  let lessTemp = fs.readFileSync(template.lessFile, 'utf-8', function(err,data){
      if (err) {
        Notifier.fileError(err, template.lessFile) // @notifier.js
        return false
      }
      return data
    })
  let cssOutput = renderLess(lessTemp, config.css) // @templating.js
  fs.writeFileSync(stabilize(outputPath, 'style.css'), cssOutput)
  // check if assets exit & copy assets folder
  if(fs.exists(template.assets)){
    fs.copy(template.assets, outputPath, function(err){
      if(err){
        Notifier.copyError(err, template.assets) // @notifier.js
      }
    })
  }
  // check if dreamwaever template is needed
  if(check(config, 'DWT') && config.DWT.export){
    if(check(config.DWT, 'isTemplate') && check(config.DWT, 'name')){
      // if needed => create
      fs.ensureDir(stabilize(outputPath, 'Templates'))
      let renderPage = {}
      renderPage.path = `/Templates/${config.DWT.name}.dwt`
      // JSON hack to keep original config object integrity
      let noMutateObj = JSON.stringify(config)
      let renderPageConfig = JSON.parse(noMutateObj)
      renderPageConfig.root = '../'
      renderPageConfig.DWT.isTemplate = true
      delete renderPageConfig.pages
      renderPageConfig.default = false
      makeOutputFile(renderPage, renderPageConfig, outputPath)
    }
    else{
      Notifier.notify('warning', 'Dreamweaver', 'Dreamweaver Template Optionen nicht richtig konfiguriert') // @notifier.js
    }
  }
  // RENDERING FOR SINGLE PAGES
  for(p=0; p<config.pages.length; p++){
    let renderPage = config.pages[p]
    if(check(renderPage, 'render') && renderPage.render){
      // JSON hack to keep original config object integrity
      let noMutateObj = JSON.stringify(config)
      let renderPageConfig = JSON.parse(noMutateObj)
      // set link paths
      let pathToRoot = ""
      for(r=0; r<renderPage.level; r++){
        pathToRoot += '../'
      }
      // check title transfer
      if(check(renderPage, 'transferTitle') && renderPage.transferTitle){
        renderPageConfig.meta.title = renderPage.metaTitle
      }
      // check description transfer
      if(check(renderPage, 'transferDescription') && renderPage.transferDescription){
        renderPageConfig.meta.description = renderPage.metaDescription
      }
      // check content transfer
      if(check(renderPage, 'transferContent') && renderPage.transferContent){
        renderPageConfig.code.content = renderPage.content
      }
      renderPageConfig.root = pathToRoot
      delete renderPageConfig.pages
      renderPageConfig.default = false
      makeOutputFile(renderPage, renderPageConfig, outputPath)
    }
  }
  // let loader spin for a minimum of 1 second for visual feedback then open output folder
  setTimeout(function(){
    loader({destroy: true, id: 'spinner'})
    openExplorer(outputPath, function(err){
      if(err){
        Notifier.notify("warning", "Explorer",
        `Der angegebene Pfad "${outputPath}" konnte nicht geöffnet werden`, err) // @notifier.js
      }
    })
  }, 1000);
}

// MAKE SINGLE OUTPUT FILE
function makeOutputFile(page, settings, outputPath){
  let output
  try {
    output = Sqrl.renderFile(template.htmlFile, settings)
  }
  catch(err){
    Notifier.notify('error', 'Output', `File kann nicht gerendert werden: ${page.path}`, err) // @notifier.js
    return false
  }
  // render prettyfied output
  fs.outputFileSync(stabilize(outputPath, page.path), pretty(output, {ocd: true}))
}
