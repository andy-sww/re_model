// TABLE CREATION FUNCTIONS
module.exports = {
  // category row
  makeCategoryRow: function(category){
    let row = document.createElement("DIV")
    row.classList.add("row", "category")
    row.innerHTML = category
    configTable.appendChild(row)
  },
  // standard input row
  makeKeyValueRow: function(category, name, key, value){
    let row = document.createElement("DIV")
    row.classList.add(category, "row")
    if(category=="code"){
      row.innerHTML = `<div>${name}</div><div><textarea class='editable' name='${key}' data-name='${name}'>${value}</textarea></div>`
    }
    else{
      row.innerHTML = `<div>${name}</div><div><div><input class='editable' type='text' name='${key}' value='${value}'></div></div>`
    }
    configTable.appendChild(row)
  },
  // multiple input row
  makeMultipleKeyValueRow: function(category, name, key, obj){
    let row = document.createElement("DIV")
    row.classList.add(category, "row")
    row.innerHTML = `<div>${name}</div>`
    let container = document.createElement("DIV")
    for(let item in obj){
      let itemKey = item
      let val = obj[itemKey]
      if(typeof(val)=="object"){
        Notifier.templatingError("Objekttiefe wird nicht unterstützt.", `${key}.${itemKey}.${val}`)
      }
      else{
        container.innerHTML += `<div>${normalizeString(itemKey)}:<br>
        <input class='editable' type='text' name='${key}.${itemKey}' value='${val}'</div>`
      }
    }
    row.appendChild(container)
    configTable.appendChild(row)
  },
  getReferencePage: function(){
    return new Promise(function (resolve, reject){
      let base = config.pagesConfig.basePath
      let filters = config.pagesConfig.fileTypes.split('|')
      // let user select a reference page of specified file type under config.pagesConfig.fileTypes
      dialog.showOpenDialog({
        defaultPath: base,
        filters: [
          {name: 'webpages', extensions: filters}
        ],
        properties: ['openFile']
      })
      .then(response => {
        if(response.canceled){
          resolve(false)
        }
        else{
          let refFilePath = response.filePaths[0]
          // create relative url
          let returnPath = relative.toBase(base, refFilePath)
          resolve(returnPath)
        }
      })
      .catch(err => { // error @ open dialog
        Notifier.notify("error", "General", "Error message:", err) // @notifier.js
      })
    })
  }
}
