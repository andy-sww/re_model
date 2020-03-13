// TEMPLATE INTEGRITY CHECK
function checkIntegrity(tPath){
  // mandatory
  // check config JSON
  template.configFile = stabilize(tPath, 'config.json')
  if(!checkFile(template.configFile, "config.json")){return false}
  // check LESS template
  template.lessFile = stabilize(tPath, 'template.less')
  if(!checkFile(template.lessFile, "template.less")){return false}
  // check HTML template
  template.htmlFile = stabilize(tPath,  'template.html')
  if(!checkFile(template.htmlFile, "template.html")){return false}
  // not mandatory
  // declare JS template location
  template.jsFile = stabilize(tPath, 'template.js')
  // declare assets location for default assets
  template.assets = stabilize(tPath, 'assets')
  return true
}
// SELECT TEMPLATE
function selectTemplate(){
  // data loss prevention
  if(projectInit && !projectSaved){
    Notifier.dataLossWarning(config.template, 'load') // @notifier.js
    .then(response => {
      // promise resolved to aborting
      if(response=="abort"){
        return false
      }
      // promise resolved to continuing
      else if(response=="continue"){
        proceedWithSelect()
      }
    })
    .catch(err => { // error @ data loss prevention
      Notifier.notify("error", "General", "Error message:", err) // @notifier.js
    })
  }
  else {
    proceedWithSelect()
  }
  function proceedWithSelect(){
    // open template select dialog
    dialog.showOpenDialog({defaultPath: templatesLocation, properties: ['openDirectory']})
    .then(response => {
      if(response.canceled){
        return false
      }
      else{
        // empty displaying html elements
        resetContainerNodes() // @renderer.js
        // load template
        loadTemplate(response.filePaths[0])
      }
    })
    .catch(err => { // error @ open dialog
      Notifier.notify("error", "General", "Error message:", err) // @notifier.js
    })
  }
}
// LOAD TEMPLATE
function loadTemplate(templatePath){
  // check if template is configured correctly
  if(checkIntegrity(templatePath)){
    let file = fs.readFileSync(template.configFile, 'utf8', function (err, data) {
      if (err) {
        Notifier.notify("error", "Loading", `File konnte nicht geladen werden: ${file}`, err)
        return false
      }
      return data
    })
    if(!file){ return false }
    params = JSON.parse(file)
    // check if mandatory template name exists
    if(!check(params, 'template')){
     Notifier.notify("error", "Name", "Template hat keinen Namen.") // @notifier.js
     return false
    }
    makeConfigTable(params)
    templateLoaded = true
    projectPath = templatePath
  }
}
// CREATE CONFIG TABLE
function makeConfigTable(params){
  // initialize config object & subobjects
  config = params
  var code = config.code
  var text = config.text
  var links = config.links
  var pics = config.pics
  var css = config.css
  // WRITE NAME
  templateName.innerHTML = config.template
  // META
  Table.makeCategoryRow("Meta") // @table.js
  // title (mandatory for meta check)
  if(check(config.meta, "title")){
    Table.makeKeyValueRow("meta", "Title", "meta.title", config.meta.title) // @table.js
  }
  else {
    Notifier.templatingError("Meta Title fehlt", config.meta) // @notifier.js
  }
  // description (mandatory for meta check)
  if(check(config.meta, "description")){
    Table.makeKeyValueRow("meta", "Description", "meta.description", config.meta.description) // @table.js
  }
  else {
    Notifier.templatingError("Meta Description fehlt", config.meta) // @notifier.js
  }
  // CODE (code type handling in makeKeyValueRow()@table.js)
  // content (mandatory for content check)
  if(!check(config.code, "content")){
    Notifier.notify('warning', 'Content', 'Das Temlate besitzt keinen klar deklarierten Content. Ein Content-Transfer kann nicht durchgeführt werden.')
  }
  Table.makeCategoryRow("Code") // @table.js
  for (let item in code){
    let key = item
    let val = code[item]
    Table.makeKeyValueRow("code", normalizeString(key), `code.${key}`, val) // @table.js
  }
  // TEXT
  Table.makeCategoryRow("Text") // @table.js
  for (let item in text){
    let key = item
    let val = text[item]
    Table.makeKeyValueRow("text", normalizeString(key), `text.${key}`, val) // @table.js
  }
  // LINKS
  Table.makeCategoryRow("Links") // @table.js
  for (let item in links){
    var key = item
    var val = links[item]
    // single links
    if(typeof(val)=="object"&&!Array.isArray(val)){
      Table.makeMultipleKeyValueRow("links", normalizeString(key), `links.${key}`, val) // @table.js
    }
    // link arrays
    else if(typeof(val)=="object"&&Array.isArray(val)){
      for(let i=0; i<val.length; i++){
        let item = val[i]
        if(typeof(item)=="object"&&!Array.isArray(item)){
          Table.makeMultipleKeyValueRow("links", normalizeString(key)+`(${(i+1)})`, `links.${key}[${i}]`, item) // @table.js
        }
        // no support for deeper objects
        else if(typeof(item)=="object"&&Array.isArray(item)){
          Notifier.templatingError("Kein Suport für genesteten Arrays.", `links.${key}.${item}`) // @notifier.js
        }
      }
    }
    // nested
    else {
      Notifier.templatingError("Objekt wird nicht unterstützt.", `links.${key}`) // @notifier.js
    }
  }
  // PICS
  //makeCategoryRow("Pics")
  // no handling for pics yet

  // CSS / LESS
  Table.makeCategoryRow("CSS") // @table.js
  // if sub category colors -> color picker
  if(css.hasOwnProperty('colors')){
    var colors = css.colors
    for(let item in colors){
      let key = item
      let val = colors[item]
      let row = document.createElement("DIV")
      row.classList.add("css", "row")
      row.innerHTML = `<div>${normalizeString(key)}</div>
      <div><div><input class='less color editable' type='text' name='css.colors.${key}' value='${val}' readonly></div></div>`
      configTable.appendChild(row)
    }
    colorConfig()
  }
  else {
    for(let item in css){
      let key = item
      let val = css[item]
      let row = document.createElement("DIV")
      row.classList.add("css", "row")
      row.innerHTML = `<div>${normalizeString(key)}</div>
      <div><div><input class='less editable' type='text' name='css.${key}' value='${val}'</div></div>`
      configTable.appendChild(row)
    }
  }
  // color configuration for css input fields
  function colorConfig(){
    colorFields = configTable.querySelectorAll(".less.color")
    for(f=0; f<colorFields.length; f++){
      let node = colorFields[f]
      let val = node.value
      ColorPicker.renderColor(node, val) // @color-picker.js
      node.addEventListener("click", function initCP(){
        ColorPicker.startColorPicker(node, val) // @color-picker.js
        this.removeEventListener("click", initCP)
      })
    }
  }
  // ASSETS
  if(check(config, 'assets')){
    // if assets folder exists
    let assets = config.assets
    if(fs.existsSync(template.assets)){
      Table.makeCategoryRow('Assets')
      for(let item in assets){
        let asset = assets[item]
        // check if asset configuration is correct (name, type & url are mandatory)
        if(check(asset, ["name", "type", "url"])){
          //check if assets exists in asset folder
          if(Assets.checkAsset(asset.url, item)){ // @assets.js
            // handle asset
            let row = Assets.createAssetRow(asset) // @assets.js
            configTable.appendChild(row)
          }
        }
      }
    }
  }
  // ACTIVATE CODE EDITOR
  codeAreas = configTable.querySelectorAll(".code textarea")
  for(c=0; c<codeAreas.length; c++){
    let area = codeAreas[c]
    let name = area.getAttribute("data-name")
    area.setAttribute("data-index", c)
    area.addEventListener("click", function(){
      CodeEditor.editCode(name, this) // @code-editor.js
    })
  }
  // create preview render button
  var previewButton = document.createElement("BUTTON")
  previewButton.innerHTML = `${feather.icons.eye.toSvg()}<span>Vorschau</span>`
  previewButton.classList.add('green')
  // insert in DOM
  previewButtonContainer.appendChild(previewButton)
  previewButton.addEventListener("click", function(){previewSite()})
  // set editables
  editables = configTable.querySelectorAll(".editable")
  // bind save state change on editable change
  for(let e=0; e<editables.length; e++){
    let node = editables[e]
    node.onchange = function(){
      toggleSaveState(false)
    }
  }
  // toggle init state to actual state
  toggleInitState(projectInit)
  // if there are pages => load pages @base.js
  if(check(config, 'pages')){
    makePageTable(config.pages) // @base.js
  }
  // ref selection for links
  let pageLinks = configTable.querySelectorAll('.editable[name^=links][name$=href]')
  // only if there is a base path
  if(check(config, 'pagesConfig') && check(config.pagesConfig, 'basePath')){
    for(p=0; p<pageLinks.length; p++){
      let referer = document.createElement("span")
      referer.innerHTML = `${feather.icons['external-link'].toSvg()}`
      referer.classList.add('ref-selector')
      pageLinks[p].parentNode.insertBefore(referer, pageLinks[p].nextSibling)
      referer.addEventListener('click', function(){
        Table.getReferencePage()
        .then(value => {
          if(value) {
            this.previousSibling.value = value
            toggleSaveState(false)
          }
        })
        .catch(err => {
          Notifier.notify("error", "Link", `Automatisches Einfügen von Link-Referenz nicht möglich.
          Möglicherweise wurde ein File gewählt das nicht dem Basis Ordner entstammt.`, err)
        })
      })
    }
  }
  // create switcher
  switcher.innerHTML = `
    <div id='switch-template' class='active' onclick="toggleSwitcher('template')">Template / Projekt</div><div id='switch-base' onclick="toggleSwitcher('base')">Basis Seite</div>
  `
  // initialize Squirrelly helpers
  initSqrlHelpers() // @js/sqrl-helpers.js

  pageTable.style.display = "none"
} // END CREATION OF CONFIG TABLE

// TOGGLE SWITCHER
function toggleSwitcher(target){
  if(target=='template'){
    document.getElementById('switch-template').classList.add('active')
    document.getElementById('switch-base').classList.remove('active')
    document.getElementById('template-interface').style.display = "block"
    document.getElementById('base-interface').style.display = "none"
    pageTable.style.display = "none"
    configTable.style.display = "flex"
    templateName.innerHTML = config.template
  }
  else if(target=='base'){
    document.getElementById('switch-base').classList.add('active')
    document.getElementById('switch-template').classList.remove('active')
    document.getElementById('template-interface').style.display = "none"
    document.getElementById('base-interface').style.display = "block"
    pageTable.style.display = "flex"
    configTable.style.display = "none"
    if(check(config, 'pagesConfig') && check(config.pagesConfig, 'basePath')){
      templateName.innerHTML = config.pagesConfig.basePath
    }
  }
}

// PREVIEWING SITE
function previewSite(){
  // update config from inputs before previewing
  updateConfig()
  // sanitize preview folder
  fs.emptyDirSync(previewPath, err => {
    if(err){
      Notifier.notify("error", "Cleanup", `Der Preview Ordner ${previewPath} konnte nicht geleert werden. Möglicherweise befindet sich eine Datei darin in Nutzung.`, err)
    }
  })
  // render html for preview
  var preview
  try {
    preview = Sqrl.renderFile(template.htmlFile, config)
  }
  catch(err){
    Notifier.previewError(err) // @notifier.js
    return false
  }
  fs.writeFileSync(stabilize(previewPath, 'default.html'), preview)
  // render css for preview
  let lessTemp = fs.readFileSync(template.lessFile, 'utf-8', function(err,data){
      if (err) {
        Notifier.fileError(err, template.lessFile) // @notifier.js
        return false
      }
      return data
    })
  let cssPreview = renderLess(lessTemp, config.css)
  fs.writeFileSync(stabilize(previewPath, 'default.css'), cssPreview)
  // check if assets exit & copy assets folder
  if(fs.existsSync(template.assets)){
    fs.copy(template.assets, previewPath, function(err){
      if(err){
        Notifier.copyError(err, template.assets) // @notifier.js
      }
    })
  }
  // OPEN PREVIEW IN NEW WINDOW
  previewWindow.loadFile(stabilize(previewPath, 'default.html'))
  previewWindow.show()
  previewWindow.maximize()
  // clear preview page storage data
  previewWindow.webContents.on('did-finish-load', () => {
    previewWindow.webContents.session.clearStorageData({
      storages: ['indexdb']
    })
    previewWindow.webContents.session.clearCache()
    if(initialPreview){
      previewWindow.reload()
      initialPreview = false
    }
  })
  previewWindow.on('closed', () =>{
    preparePreviewWindow()
  })
}
// UPDATE CONFIG OBJECT
function updateConfig(){
  for(let e=0; e<editables.length; e++){
    let item = editables[e]
    let keyString = item.getAttribute("name")
    let value = item.value
    let key = keyString.match(/[^\]\[.]+/g)
    objectPath.set(config, key, value)
  }
}
// RENDER LESS from template with modified variables
function renderLess(url, configCSS){
  var variables = ""
  var render = ""
  for(let item in configCSS){
    let key = item
    let val = configCSS[item]
    let string = `@${key}: ${val};`
    variables += string
  }
  if(configCSS.hasOwnProperty("colors")){
    for(let item in configCSS.colors){
      let key = item
      let val = configCSS.colors[item]
      let string = `@${key}: ${val};`
      variables += string
    }
  }
  less.render(variables + url, function(err,res){
    if(err){
      Notifier.notify("warning", "LESS", "LESS Daten konnten nicht gerendert werden.", err)
    }
    render = res.css
  })
  return render
}
