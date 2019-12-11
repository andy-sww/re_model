// ASSET HANDLING
module.exports = {
  // check if asset exists
  checkAsset: function(url, name){
    let checkPath = stabilize(template.assets, url)
    let errorPath = stabilize('assets', url)
    try {
      let test = fs.readFileSync(checkPath)
    }
    catch (err){
      Notifier.assetError(name, errorPath, err)
      return false
    }
    return true
  },
  createAssetRow: function(asset){
    let row = document.createElement("DIV")
    row.classList.add("asset", "row")
    row.innerHTML = `<div>${asset.name}</div>`
    let container = document.createElement("DIV")
    let wrapper = document.createElement("DIV")
    // images
    if(asset.type == 'image'){
      container.innerHTML = `<div>${feather.icons.image.toSvg()}</div><div class='asset-url' data-url="${asset.url}">(${asset.url})</div>`
      // create image preview button
      let imgPreviewButton = document.createElement("BUTTON")
      imgPreviewButton.innerHTML = "Vorschau"
      imgPreviewButton.classList.add('green')
      imgPreviewButton.addEventListener("click", function initPreview(){
        assetWindow.loadFile(stabilize(template.assets, asset.url))
        assetWindow.show()
        assetWindow.on('closed', () =>{
          prepareAssetWindow()
        })
      })
      // append preview button to wrapper
      wrapper.appendChild(imgPreviewButton)
    }
    // append "show-in-explorer" button
    let explorerButton = document.createElement("BUTTON")
    explorerButton.innerHTML = 'Im Explorer anzeigen'
    explorerButton.classList.add('init-only')
    explorerButton.addEventListener("click", function initEditor(){
      // find asset location inside asset folder
      let assetLocation = asset.url.match(/(.*)[\/\\]/)[1]||''
      // show in explorer
      openExplorer(stabilize(template.assets, assetLocation), function(err){
        if(err){
          Notifier.notify("warning", "Explorer",
          `Der angegebene Pfad "${stabilize(template.assets, assetLocation)}" konnte nicht geöffnet werden`, err) // @notifier.js
        }
      })
    })
    wrapper.appendChild(explorerButton)
    // append "Rename" button
    let renameButton = document.createElement("BUTTON")
    renameButton.innerHTML = 'Umbenennen'
    renameButton.classList.add('init-only')
    renameButton.addEventListener("click", function renameAsset(){
      let fileName = asset.url.replace(/^.*[\\\/]/, '')
      let solePath = asset.url.match(/(.*)[\/\\]/)[1]||''
      let soleName = fileName.split('.')[0]
      let fileType = fileName.split('.')[1]
      prompt({
        title: `Umbenennen`,
        label: `Bisheriger Filename: <strong>${soleName}</strong> <code style="background: #f4f4f4;">[.${fileType}]</code>
        <br>Pfad: <code style="background: #f4f4f4;">${asset.url}</code><br><br>Neuen Namen eingeben:`,
        useHtmlLabel: true,
        resizable: true,
        height: 250,
        alwaysOnTop: true,
        value: soleName,
        inputAttrs: {
          type: 'text'
        }
      })
      .then((input) =>{
        // user cancelled
        if(input === null) {
          return false
        }
        else {
          // new name == old name
          if(input == soleName){
            return false
          }
          // rename
          let newUrl = stabilize(solePath, `${input}.${fileType}`)
          let oldFile = stabilize(projectPath, 'assets', asset.url)
          let newFile = stabilize(projectPath, 'assets', newUrl)
          fs.rename(oldFile, newFile, (err) => {
            if(err) {
              Notifier.notify("error", "Rename", `Datei konnte nicht umbenannt werden: "${oldFile}"`, err)
              return false
            }
            let nodes = document.querySelectorAll(`[data-url="${asset.url}"]`)
            let element = nodes[0]
            element.setAttribute('data-url', newUrl)
            element.innerHTML = `(${newUrl})`
            // save new path in config object
            asset.url = newUrl
            // save project
            saveProject(projectPath)
          })
        }
      })
      .catch((err) => {
        Notifier.notify("error", "Rename", `Datei konnte nicht umbenannt werden: "${fileName}"`, err)
      })
    })
    wrapper.appendChild(renameButton)
    // set up row structure
    container.appendChild(wrapper)
    row.appendChild(container)
    // return row
    return row
  }
// end of module
}
