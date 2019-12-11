// RESET BASE
function resetBase(){
  pageTable.innerHTML = ""
  count.innerHTML = ""
  pages = []
  baseButtonsContainer.innerHTML = ""
  delete config.pagesConfig
  renderButtonShows = false
}

// SELECTING BASE FOLDER

function selectSite(){
  if(!templateLoaded){
    Notifier.notify('warning', 'Template', 'Kein Template ausgewählt') // @notifier.js
    return false
  }
  else if(!projectSaved){
    Notifier.notify('warning', 'Open', 'Das Projekt muss erst gespeichert werden bevor eine Basis-Struktur ausgewählt werden kann.') // @notifier.js
    return false
  }
  else {
    // convert file type input to regex compatible string
    fileTypes = fileTypeInput.value.split(",").map(Function.prototype.call, String.prototype.trim).join("|")
    typeMatch = new RegExp("\\.(" + fileTypes + ")$")
    // open dialog for base folder selection
    dialog.showOpenDialog({properties: ['openDirectory']})
    .then(response => {
      if(response.canceled){
        return false
      }
      else{
        // check if pages and page-configuration have already been saved, give user option to cancel or continue
        if(check(config, 'pages')){
          Notifier.optionWarning("Das Projekt beinhaltet bereits eine Seitenstruktur.\nBeim Überschreiben gehen alle bisherigen Daten verloren.", "Überschreiben", "Abbrechen") // @notifier.js
          .then(response => {
            if(response=="abort"){
              return false
            }
            else if(response=="continue"){
              proceedBaseLoad()
            }
          })
        }
        else {
          proceedBaseLoad()
        }
        function proceedBaseLoad(){
          // set base path
          basePath = response.filePaths[0]
          let tree = dirTree(basePath, {
            extensions: ""
          })
          // clear existing pagesConfig
          resetBase()
          // read in file structure
          filterTree(tree)
        }
      }
    })
    .catch(err => {
      Notifier.notify("error", "General", "Error message:", err) // @notifier.js
    })
  }
}

function filterTree(tree){
  // use traverse to find path key/value pairs
  traverse(tree).forEach(function (val){
    if(this.notRoot){
      // get all path values
      if(this.key == "path"){
        // set path value relative to base path
        val = val.replace(basePath, "")
        // set level value like directory depth
        let level = this.level
        level = ((level*1)-3)/2
        // check path string and filter only matched file types
        if(level > -1 && val.match( typeMatch ) ){
          let page = {
            path: val,
            level: level
          }
          // push prop into array
          pages.push(page)
        }
      }
    }
  })
  // sort array by level
  pages.sort(function(a,b){
    return a.level - b.level
  })
  makePageTable(pages)
}

// MAKE PAGE TABLE
function makePageTable(sites){
  // dreamweaver option checkbox
  if(check(config, 'DWT') && check(config.DWT, 'export')){
    dwState = config.DWT.export
    var dwExport = document.createElement("DIV")
    dwExport.style.display = "block"
    dwExport.style.padding = "0.5em"
    dwExport.innerHTML = `Als Dreamweaver Template anlegen: <input type="checkbox" id="dw-export" />`
    pageTable.appendChild(dwExport)
  }
  // create pages list header
  var pHead = document.createElement("DIV")
  pHead.id = 'page-table-head'
  pHead.innerHTML = `
    <div>Render</div>
    <div>Level</div>
    <div>Pfad</div>
    <div>Title</div>
    <div>Description</div>
    <div>Content</div>
  `
  pageTable.appendChild(pHead)
  var allSel = document.createElement("DIV")
  allSel.id = 'select-all-row'
  allSel.innerHTML = `
    <div><input type='checkbox' class='all-selector' data-target='render-page'/></div>
    <div></div>
    <div></div>
    <div><input type='checkbox' class='all-selector' disabled data-target='title-transfer'/></div>
    <div><input type='checkbox' class='all-selector' disabled data-target='desc-transfer'/></div>
    <div><input type='checkbox' class='all-selector' disabled data-target='content-transfer'/></div>
  `
  pageTable.appendChild(allSel)
  // OUTPUT PAGES LIST
  if(!config.pages){
    // if it's a new base folder count hits
    count.innerHTML = ` => ${sites.length}Treffer gefunden für <code style='background: #f4f4f4'>[${fileTypes}]</code>:`
  }
  // if there are already saved file types replace input field
  else if(check(config, 'pagesConfig') && check(config.pagesConfig, 'fileTypes')){
    fileTypeInput.value = config.pagesConfig.fileTypes
    fileTypeInput.disabled = true
  }
  for(i=0; i<sites.length; i++){
    let site = sites[i]
    // CHECKBOX AUTO-CHECKING ON LOAD
    let renderFill, titleFill, descFill, contentFill, titleBg, descBg, contentBg, grayout = ""
    // render checkboxes
    if(check(site, 'render') && site.render){
      renderFill = 'checked'
      grayout = ""
    }
    else if(check(site, 'render') && !site.render){
      grayout = "grayout"
    }
    // title checkboxes
    if(check(site, 'metaTitle')){
      if(site.metaTitle != null){
        if(site.transferTitle){
          titleFill = 'checked'
        }
        titleBg = 'rgba(70,165,52,0.1)'
        pageTable.querySelectorAll('.all-selector[data-target="title-transfer"]')[0].disabled = false
      }
      else {
        titleFill = 'disabled'
        titleBg = 'rgba(206,20,52,0.1)'
      }
    }
    else {
      titleFill = 'disabled'
      titleBg = 'inherit'
    }
    // description checkboxes
    if(check(site, 'metaDescription')){
      if(site.metaDescription != null){
        if(site.transferDescription){
          descFill = 'checked'
        }
        descBg = 'rgba(70,165,52,0.1)'
        pageTable.querySelectorAll('.all-selector[data-target="desc-transfer"]')[0].disabled = false
      }
      else {
        descFill = 'disabled'
        descBg = 'rgba(206,20,52,0.1)'
      }
    }
    else {
      descFill = 'disabled'
      descBg = 'inherit'
    }
    // content checkboxes
    if(check(site, 'content')){
      if(site.content != null){
        if(site.transferTitle){
          contentFill = 'checked'
        }
        contentBg = 'rgba(70,165,52,0.1)'
        pageTable.querySelectorAll('.all-selector[data-target="content-transfer"]')[0].disabled = false
      }
      else {
        contentFill = 'disabled'
        contentBg = 'rgba(206,20,52,0.1)'
      }
    }
    else {
      contentFill = 'disabled'
      contentBg = 'inherit'
    }
    // WRITE PAGE ROW
    pageTable.innerHTML += `
    <div class='page-row ${grayout}' data-index=${i} data-level=${site.level} data-path="${site.path}">
      <div><input type='checkbox' class='render-page' ${renderFill} data-index=${i} /></div>
      <div>${site.level}</div>
      <div>${site.path}</div>
      <div style="background-color: ${titleBg}"><input type='checkbox' class='title-transfer' ${titleFill} data-index=${i} /></div>
      <div style="background-color: ${descBg}"><input type='checkbox' class='desc-transfer' ${descFill} data-index=${i} /></div>
      <div style="background-color: ${contentBg}"><input type='checkbox' class='content-transfer' ${contentFill} data-index=${i} /></div>
    </div>
    `
  }
  // CHECKBOX CHANGE
  pageTable.addEventListener('change',function(e){
    // checkbox all selectors
    if(e.target && e.target.classList.contains('all-selector')){
      let target = e.target.getAttribute('data-target')
      let state = e.target.checked
      let targets = pageTable.querySelectorAll(`.${target}`)
      for(t=0; t<targets.length; t++){
        if(!targets[t].disabled){
          targets[t].checked = state
        }
      }
      // handle grayouts on render-page all selector
      if(target=='render-page'){
        let pageRows = pageTable.querySelectorAll('.page-row')
        for(p=0; p<pageRows.length; p++){
          if(state){
            pageRows[p].classList.remove('grayout')
          }
          else {
            pageRows[p].classList.add('grayout')
          }
        }
      }
    }
    // handle grayout on single render checkboxes
    else if(e.target && e.target.classList.contains('render-page')){
      let index = e.target.getAttribute('data-index')
      let row = pageTable.querySelectorAll(`.page-row[data-index="${index}"]`)[0]
      if(e.target.checked){
         row.classList.remove('grayout')
      }
      else {
        row.classList.add('grayout')
      }
    }
  })
  // SAVE STATE CHANGE && CONFIG UPDATE ON ANY CHECKBOX CHANGE
  pageTable.addEventListener('change', function(e){
    if(e.target && e.target.nodeName == 'INPUT' && e.target.getAttribute('type') == 'checkbox'){
      toggleSaveState(false)
      updatePageSettings()
    }
  })
  // check dw template
  document.getElementById('dw-export').checked = dwState
  // write pages to config
  config.pages = sites
  // initialize page config if not existant
  if(!check(config, 'pagesConfig')){
    config.pagesConfig = {}
    config.pagesConfig.basePath = basePath
    config.pagesConfig.fileTypes = fileTypes
  }
  // set basePath if not existant
  else {
    if(!check(config.pagesConfig, 'basePath')){
      config.pagesConfig.basePath = basePath
    }
  }
  // CREATE META CHECK BUTTON
  let metaCheckButton = document.createElement("BUTTON")
  metaCheckButton.innerHTML = `${feather.icons.database.toSvg()}<span>Meta Check</span>`
  // mark if meta data has been check previously
  if(check(config.pagesConfig, 'metaChecked') && config.pagesConfig.metaChecked){
    metaCheckButton.classList.add('green')
    metaCheckButton.innerHTML += `&nbsp;&nbsp;${feather.icons.check.toSvg()}`
  }
  metaCheckButton.addEventListener('click', function(){
    // if meta data has been check previously ask if it should be rechecked on click
    if(check(config.pagesConfig, 'metaChecked') && config.pagesConfig.metaChecked){
      Transfer.recheckData("Meta")
      .then(response => {
        if(response){
          checkData("meta")
        }
      })
    }
    else {
      checkData("meta")
    }
  })
  baseButtonsContainer.appendChild(metaCheckButton)
  // CREATE CONTENT CHECK BUTTON
  let contentCheckButton = document.createElement("BUTTON")
  contentCheckButton.innerHTML = `${feather.icons.file.toSvg()}<span>Content Check</span>`
  // mark if content data has been check previously
  if(check(config.pagesConfig, 'contentChecked') && config.pagesConfig.contentChecked){
    contentCheckButton.classList.add('green')
    contentCheckButton.innerHTML += `&nbsp;&nbsp;${feather.icons.check.toSvg()}`
  }
  contentCheckButton.addEventListener('click', function(){
    // if content data has been check previously ask if it should be rechecked on click
    if(check(config.pagesConfig, 'contentChecked') && config.pagesConfig.contentChecked){
      Transfer.recheckData("Content")
      .then(response => {
        if(response){
          continueContentCheck()
        }
      })
    }
    else {
      continueContentCheck()
    }
    // open prompt for content identifier
    function continueContentCheck(){
      prompt({
        title: `Content Finder`,
        label: `Die Basis Seite wird auf Content durchsucht. Bitte Such-Identifikator eingeben.<br><code style="background: #f4f4f4;">.</code>
        für eine Klasse, <code style="background: #f4f4f4;">#</code> für eine ID mit eingeben!<br>
        Es kann auch nach TAG-Namen gesucht werden (z.Bsp. "main" oder "article")
        <br><br>
        Beispiele:<code style="background: #f4f4f4;">.meinKlasse</code><code style="background: #f4f4f4;">#meineID</code>
        <code style="background: #f4f4f4;">main</code>`,
        useHtmlLabel: true,
        resizable: true,
        height: 350,
        alwaysOnTop: true,
        value: "",
        inputAttrs: {
          type: 'text'
        }
      }).then((input) => {
        // canceled
        if(input == null) {
          return false // <- handle that !
        }
        else {
          checkData("content", input)
        }
      })
    }
  })
  baseButtonsContainer.appendChild(contentCheckButton)
  // FILL REPORT CONTAINER NODES
  if(check(config.pagesConfig, 'metaChecked') && config.pagesConfig.metaChecked){
    metaReports.innerHTML = `<h3>Meta Report</h3><a onclick="loadReport('meta')" href="#">Meta Report</a>`
  }
  if(check(config.pagesConfig, 'contentChecked') && config.pagesConfig.contentChecked){
    contentReports.innerHTML = `<h3>Content Report</h3><span>${feather.icons.anchor.toSvg()}${config.pagesConfig.contentIdentifier}</span><br>
    <a onclick="loadReport('content-short')" href="#">Content Report (gekürzt)</a><br>
    <a onclick="loadReport('content-full')" href="#">Content Report (vollständig)</a>`
  }
  // CHECK META / CONTENT DATA FUNCTION
  function checkData(type, identifier){
    // ensure base path
    if(check(config, 'pagesConfig') && check(config.pagesConfig, 'basePath')){
      for(p=0; p<config.pages.length; p++){
        let referencePage = stabilize(config.pagesConfig.basePath, config.pages[p].path)
        // prepare reports container
        if(type=="meta"){
          // META DATA
          // title
          let titleArray = Transfer.getMetaTitle(referencePage)
          if(titleArray[0]){
            config.pages[p].metaTitle = titleArray[1]
            setBox('title-transfer', p, true)
          }
          else {
            config.pages[p].metaTitle = null
            setBox('title-transfer', p, false)
          }
          // description
          let descArray = Transfer.getMetaDescription(referencePage)
          if(descArray[0]){
            config.pages[p].metaDescription = descArray[1]
            setBox('desc-transfer', p, true)
          }
          else {
            config.pages[p].metaDescription = null
            setBox('desc-transfer', p, false)
          }
        }
        if(type=="content"){
          // CONTENT
          let contentArray = Transfer.getContentData(referencePage, identifier)
          if(contentArray[0]){
            config.pages[p].content = contentArray[1]
            setBox('content-transfer', p, true)
          }
          else {
            config.pages[p].content = null
            setBox('content-transfer', p, false)
          }
        }
      }
      // create log folder if not existant
      fs.ensureDir(stabilize(projectPath, '/logs'))
      // when data is collected save data & make report
      if(type=="meta"){
        config.pagesConfig.metaChecked = true
        let metaReport = Transfer.makeReport({
          type: "meta",
          array: config.pages
        })
        reportWindow.loadURL("data:text/html;charset=utf-8," + metaReport)
        reportWindow.show()
        fs.writeFileSync(stabilize(projectPath, '/logs/meta-report.html'), decodeURIComponent(metaReport))
        // make report accesslible
        metaReports.innerHTML = `<h3>Meta Report</h3><a onclick="loadReport('meta')" href="#">Meta Report</a>`
      }
      if(type=="content"){
        config.pagesConfig.contentChecked = true
        config.pagesConfig.contentIdentifier = identifier
        // create content report (shorted)
        let contentReportShort = Transfer.makeReport({
          type: "content",
          array: config.pages,
          identifier: identifier,
          limiter: 200
        })
        reportWindow.loadURL("data:text/html;charset=utf-8," + contentReportShort)
        reportWindow.show()
        fs.writeFileSync(stabilize(projectPath, '/logs/content-report-short.html'), decodeURIComponent(contentReportShort))
        // create another content report with full content information
        let contentReportFull = Transfer.makeReport({
          type: "content",
          array: config.pages,
          identifier: identifier
        })
        fs.writeFileSync(stabilize(projectPath, '/logs/content-report-full.html'), decodeURIComponent(contentReportFull))
        // make reports accessible
        contentReports.innerHTML = `<h3>Content Report</h3><span>${feather.icons.anchor.toSvg()}${identifier}</span><br>
        <a onclick="loadReport('content-short')" href="#">Content Report (gekürzt)</a><br>
        <a onclick="loadReport('content-full')" href="#">Content Report (vollständig)</a>`
      }
      // reset ui elements
      baseButtonsContainer.innerHTML = ""
      renderButtonShows = false
      makePageTable(config.pages)
      toggleSaveState(false)
      reportWindow.on('closed', () =>{
        prepareReportWindow()
      })
    }
    else {
      Notifier.notify("error", "Basis", "Kein Basispfad gefunden.")
      return false
    }
  }
  // CREATE RENDER BUTTON
  if(!renderButtonShows){
    let renderButton = document.createElement("BUTTON")
    renderButton.innerHTML = `${feather.icons.cast.toSvg()}<span>Render</span>`
    renderButton.classList.add('violet')
    renderButton.addEventListener('click', function(){
      loader({create: true, target: renderButton, id: 'spinner'}) // will be destroyed in renderOutput()
      renderOutput() // @project.js
    })
    baseButtonsContainer.appendChild(renderButton)
    // make render headline
    let renderHeadline = document.createElement("H3")
    renderHeadline.innerHTML = "Render"
    baseButtonsContainer.insertBefore(renderHeadline, renderButton)
    renderButtonShows = true
  }
}

// enable transfer checkboxes for checked meta & content data
function setBox(selector, index, valid){
  let target = pageTable.querySelectorAll(`.${selector}[data-index="${index}"]`)
  if(valid){
    target[0].removeAttribute("disabled")
    target[0].parentNode.style.backgroundColor = "rgba(70,165,52,0.1)"
    pageTable.querySelectorAll(`.all-selector[data-target="${selector}"]`)[0].disabled = false
  }
  else{
    target[0].parentNode.style.backgroundColor = "rgba(206,20,52,0.1)"
  }
}

// LOADING REPORTS
function loadReport(type){
  if(type=="meta"){
    reportWindow.loadURL(stabilize(projectPath, '/logs/meta-report.html'))
  }
  else if(type=="content-full"){
    reportWindow.loadURL(stabilize(projectPath, '/logs/content-report-full.html'))
  }
  else if(type=="content-short"){
    reportWindow.loadURL(stabilize(projectPath, '/logs/content-report-short.html'))
  }
  else {
    reportWindow.loadURL("data:text/html;charset=utf-8," + "<html><body><h1>Kein Report gefunden</h1></body></html>")
  }
  reportWindow.show()
  reportWindow.on('closed', () =>{
    prepareReportWindow()
  })
}

// RENDER SPINNER LOADER
function loader(options){
  if(options.create){
    let loader = document.createElement("IMG")
    loader.src = stabilize(root, 'img/loadspinner.gif')
    loader.id = options.id
    loader.classList.add('loader')
    options.target.appendChild(loader)
    return true
  }
  if(options.destroy){
    let loader = document.getElementById(options.id)
    loader.remove()
    return true
  }
}
