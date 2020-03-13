// MODULES
// electron
const { app , dialog, getCurrentWindow, BrowserWindow } = require('electron').remote
// paths
const root = app.getAppPath()
const path = require('path')
const userConfigPath = stabilize(app.getPath('userData'), 'user.json')
const previewPath = stabilize(app.getPath('userData'), 'preview')
const os = require('os')
// npm externals
const fs = require('fs-extra')
const dirTree = require("directory-tree")
const traverse = require('traverse')
const relative = require('relative')
const objectPath = require('object-path')
const cheerio = require('cheerio')
const openExplorer = require('open-file-explorer')
const prompt = require('electron-prompt')
const less = require('less')
const pretty = require('pretty')
const invert = require('invert-color')
const feather = require('feather-icons')
const Picker = require('a-color-picker')
  require('codemirror/mode/htmlmixed/htmlmixed')
var CodeMirror = require('codemirror')
var Sqrl = require('squirrelly')
    Sqrl.autoEscaping(false)
// own modules
// !! these modules interact with global variables & can't function outside this scope !!
const modulePath = stabilize(root, 'modules')
const Notifier = require(stabilize(modulePath, 'notifier'))
const Table = require(stabilize(modulePath, 'table'))
const CodeEditor = require(stabilize(modulePath, 'code-editor'))
const ColorPicker = require(stabilize(modulePath, 'color-picker'))
const Assets = require(stabilize(modulePath, 'assets'))
const Transfer = require(stabilize(modulePath, 'transfer'))
const Settings = require(stabilize(modulePath, 'settings'))

// DEFINITIONS
// nodes
var templateName = document.getElementById('template-name')
var fileTypeInput = document.getElementById('filetypes')
var pageTable = document.getElementById('page-table')
var count = document.getElementById('count')
var configTable = document.getElementById('config-table')
var saveButton = document.getElementById('save-button')
var previewButtonContainer = document.getElementById('preview-button-container')
var baseButtonsContainer = document.getElementById('base-buttons-container')
var metaReports = document.getElementById('meta-reports')
var contentReports = document.getElementById('content-reports')
var switcher = document.getElementById('switcher')
var userSettings = document.getElementById('user-settings')
var defaultTemplatePath = document.getElementById('default-template-path')
var defaultProjectPath = document.getElementById('default-project-path')
var defaultBasePath = document.getElementById('default-base-path')
var devMode = document.getElementById('dev-mode')
var resetNodes = document.querySelectorAll("[data-reset]")

// VARIABLES
// windows
var previewWindow, assetWindow, reportWindow, initialPreview
// variables
var basePath, typeMatch, fileTypes, config, codeAreas, colorFields, projectPath, editables, dwState, userConfig, templatesLocation, baseDefaultLocation
// objects
var template = {}
var project = {}
var plugins = {}
// arrays
var pages = []
// bools
var pickerActive = false
var templateLoaded = false
var projectSaved = false
var projectInit = false
var renderButtonShows = false
// other
var parser = new DOMParser
// DEVELOPMENT / DEBUG
var inDev

// USER SETTINGS
Settings.checkUserSettings()
  .then(valid => {
    if(valid){
      Settings.getUserData() // @settings.js
    }
  })

//WINDOWS
function preparePreviewWindow(){
  initialPreview = true
  previewWindow = new BrowserWindow({ frame: true, show: false })
}
function prepareAssetWindow(){
  assetWindow = new BrowserWindow({ frame: true, show:false })
}
function prepareReportWindow(){
  reportWindow = new BrowserWindow({ frame: true, show:false })
}
preparePreviewWindow()
prepareAssetWindow()
prepareReportWindow()

// HELPERS
// reset HTML CONTAINER NODES
function resetContainerNodes(){
  for(r=0; r<resetNodes.length; r++){
    let item = resetNodes[r]
    let state = item.getAttribute("data-reset")
    if(state){
      item.innerHTML = ""
    }
  }
}
// normalize string = underscore to empty space & capitalize string
function normalizeString(string){
  string = string.replace(/_/g, " ")
  return string.charAt(0).toUpperCase() + string.slice(1);
}
// combination: normalize and join path (function takes any number of arguments)
function stabilize(){
  var array = []
  for(arg = 0; arg<arguments.length; arg++){
    array.push(arguments[arg])
  }
  let res = path.normalize(path.join.apply(null, array))
  return res
}
// check for property key
function check(item, prop){
  // for use with single properties
  if(typeof(prop)=="string"){
    if(item.hasOwnProperty(prop)){
      // returns true if property is found
      return true
    }
    else {
      // returns false if not
      return false
    }
  }
  // for use with arrays
  else if(Array.isArray(prop)){
    for(let i=0; i<prop.length; i++){
      if(!item.hasOwnProperty(prop[i])){
        Notifier.propertyError(prop[i], item)
        return false
      }
    }
    // returns true if all properties are found
    return true
  }
}

// check if file exists
function checkFile(filePath, name){
  try {
    let test = fs.readFileSync(filePath)
  }
  catch (err){
    Notifier.fileError(err, filePath) // @notifier.js
    return false
  }
  return true
}

// escape HTML chars
function escapeHtml(text) {
  var map = {
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
    'Ü': '&Uuml;',
    "ü": '&uuml;',
    'Ö': '&Ouml;',
    "ö": '&ouml;',
    'Ä': '&Auml;',
    "ä": '&auml;',
  };
  return text.replace(/[<>"'ÜüÖöÄä]/g, function(m) { return map[m]; });
}
