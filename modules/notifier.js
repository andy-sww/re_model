// NOTIFICATION FUNCTIONS
module.exports = {
  // BASE FUNCTION
  notify: function(type, context, message, err){
    if(err){
      message += `\n\n${err}`
    }
    let options = {
      type: type,
      title: `${context} ${normalizeString(type)}`,
      message: message
    }
    if(!inDev){
      dialog.showMessageBox(options)
    }
    else {
      // console colors & message for in-development logs
      let color, bgColor
      if(type=="error"){
        color = "white"
        bgColor = "#FF4136"
      }
      else if(type=="warning"){
        color = "black"
        bgColor = "#FFDC00"
      }
      else if(type=="info" || type=="question"){
        color = "white"
        bgColor = "#0074D9"
      }
      else if(type=="none"){
        color = "black"
        bgColor = "transparent"
      }
      else {
        console.error(`@NOTIFIER:\nMessage Type falsch deklariert.\nDer Typ "${type}" existiert nicht.\nUnterstützte Typen:\n["none"], ["info"], ["error"], ["question"] oder ["warning"]`)
        return false
      }
      console.log(`\n%cNOTIFIER: (${type}, ${context})%c\n\n${message}`, `background: ${bgColor}; color: ${color}; padding: 2px; border:1px solid black;`, 'color: black;')
    }
    if(err){
      throw err
    }
  },
  /***************************************
  ####### ######  ######  ####### ######
  #       #     # #     # #     # #     #
  #       #     # #     # #     # #     #
  #####   ######  ######  #     # ######
  #       #   #   #   #   #     # #   #
  #       #    #  #    #  #     # #    #
  ####### #     # #     # ####### #     #
  ***************************************/
  // missing file error
  fileError: function(err, file){
    let message = `File nicht gefunden: ${file}`
    module.exports.notify("error", "File", message, err)
  },
  // warning if files couldn't be copied
  copyError: function(err, context){
    let message = `Kopiervorgang nicht erfolgreich:\n${context}`
    module.exports.notify("error", "Copy", message, err)
  },
  // warning if folder couldnt be emptied
  deletionError: function(err, context){
    let message = `Die Inhalte des Ordners konnten nicht ordnunsgemäß gelöscht werden:\n${context}`
    module.exports.notify("error", "Deletion", message, err)
  },
  // missing asset error
  assetError: function(name, url, err){
    let message = `Das Asset "${name}" kann unter der angegebenen URL "${url}" nicht gefunden werden.`
    module.exports.notify("error", "Asset", message, err)
  },
  // missing asset edtior file
  editError: function(err, asset, editor, editorFile){
    let message = `Zum Asset "${asset}" ist eine Editor Option für den Editor "${editor}" angegeben.
    \nEin kompatibles Editor File "${editorFile}" existiert jedoch nicht.`
    module.exports.notify("error", "Editor", message, err)
  },
  // preview error
  previewError: function(err){
    let message = `Preview kann nicht erstellt werden.\ntemplate.html entählt nicht definierte Elemente.`
    module.exports.notify("error", "Preview", message, err)
  },
  // project saving error
  savingError: function(path, err){
    let message = `Project konnte nicht gespeichert werden.`
    module.exports.notify("error", "Saving", message, err)
  },

  /***************************************************
  #     #    #    ######  #     # ### #     #  #####
  #  #  #   # #   #     # ##    #  #  ##    # #     #
  #  #  #  #   #  #     # # #   #  #  # #   # #
  #  #  # #     # ######  #  #  #  #  #  #  # #  ####
  #  #  # ####### #   #   #   # #  #  #   # # #     #
  #  #  # #     # #    #  #    ##  #  #    ## #     #
   ## ##  #     # #     # #     # ### #     #  #####
  ***************************************************/
  // warning for missing keys in property
  propertyError: function(key, property){
    let message = `Achtung!\nDer Key "${key}" fehlt im Property "${property}"`
    module.exports.notify("warning", "Key/Property", message)
  },
  // warning message for unsupported objects in config.json
  templatingError: function(reason, key){
    let message = `Folgendes Template-Item kann nicht verwendet werden:\n\n${key}\n\nBegründung: ${reason}`
    module.exports.notify("warning", "Template", message)
  },
  // warning with yes no options
  optionWarning: function(message, yes, no){
    return new Promise(function (resolve, reject){
      let options = {
        type: 'warning',
        buttons: [`${yes}`, `${no}`],
        defaultId: 0,
        title: 'Warning',
        detail: message
      }
      dialog.showMessageBox(null, options, (response) => {
        // abort
        if(response == 1){
          resolve("abort")
        }
        // continue
        if(response == 0){
          resolve("continue")
        }
      })
    })
  },
  // data loss warning with option buttons
  dataLossWarning: function(name){
    return new Promise(function (resolve, reject){
      let options = {
        type: 'warning',
        buttons: ['Abbrechen', 'Speichern', 'Änderungen Verwerfen'],
        defaultId: 0,
        title: 'Datei nicht gespeichert',
        detail: `Das Projekt "${name}" wurde nicht gespeichet.
        \nUngespeicherte Daten können verloren gehen wenn ein neues Projekt oder Template geladen wird.
        \n\nWas soll vor dem Laden getan werden?\n`
      }
      dialog.showMessageBox(null, options, (response) => {
        // abort
        if(response == 0){
          resolve("abort")
        }
        // save
        if(response == 1){
          saveProject(projectPath)
          resolve("continue")
        }
        // discard
        if(response == 2){
          resolve("continue")
        }
      })
    })
  }
}
