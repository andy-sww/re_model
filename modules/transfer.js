// META & CONTENT TRANSFER & REPORTS
module.exports = {
  // Title
  getMetaTitle: function(file){
    let title
    let $ = cheerio.load(fs.readFileSync(file), {
      lowerCaseTags: true,
      lowerCaseAttributeNames: true
    })
    if($("title").html()){
      title = $("title").html()
      return [true, title]
    }
    else {
      return [false, null]
    }
  },
  // Description
  getMetaDescription: function(file){
    let description
    let $ = cheerio.load(fs.readFileSync(file), {
      lowerCaseTags: true,
      lowerCaseAttributeNames: true
    })
    if($("meta[name='description']").length > 0){
      description = $("meta[name='description']").attr("content")
      return[true, description]
    }
    else if($("meta[name='Description']").length > 0){
      description = $("meta[name='Description']").attr("content")
      return[true, description]
    }
    else if($("meta[name='DESCRIPTION']").length > 0){
      description = $("meta[name='DESCRIPTION']").attr("content")
      return[true, description]
    }
    else {
      return [false, null]
    }
  },
  // Content
  getContentData: function(file, identifier){
    let content
    // check identifier for hidden data splitted by comma
    let idArray = identifier.split(",")
    let $ = cheerio.load(fs.readFileSync(file), {
      lowerCaseTags: true,
      lowerCaseAttributeNames: true
    })
    if(idArray.length == 2){
      let item = idArray[0]
      let index = idArray[1]
      var result = $(item).slice(index).eq(0).html()
      if(result !== "undefined"){
        return [true, result]
      }
    }
    else if($(identifier).html()){
      return[true, $(identifier).html()]
    }
    else {
      return[false, null]
    }
  },
  // recheck data
  recheckData: function(type){
    return new Promise(function (resolve, reject){
      let options = {
        type: 'warning',
        buttons: ['Abbrechen', 'Fortfahren'],
        defaultId: 0,
        title: `${type} Daten bereits vorhanden.`,
        detail: `Seiten dieses Projektes besitzen bereits ${type} Daten.\n
        Beim Fortfahren werden diese überschrieben.`
      }
      dialog.showMessageBox(null, options, (response) => {
        // abort
        if(response == 0){
          resolve(false)
        }
        if(response == 1){
          resolve(true)
        }
      })
    })
  },
  // write html for report window
  makeReport: function(options){
    let type = options.type
    let array = options.array
    let identifier = options.identifier
    let limiter = options.limiter
    let html, length
    if(type=="content"){
      if(limiter){
        length = "(gekürzt)"
      }
      else {
        length = "(vollständig)"
      }
      html = `<html>
      <head>
        <meta charset='utf-8'>
      </head>
      <body style='font-family: monospace;'><h1 style='text-transform: uppercase;'>${type} report ${length}</h1><h3>Content wurde gesucht in [ ${identifier} ]</h3>`
    }
    if(type=="meta"){
      html = `<html><body style='font-family: monospace;'><h1 style='text-transform: uppercase;'>${type} report</h1>`
    }
    for(a=0; a<array.length; a++){
      let item = array[a]
      let line = ""
      for(let property in item){
        if(type=="meta"){
          if(property=='path'){
            line += `<span>Seite: </span><span><strong>${item[property]}</strong></span><br>`
          }
          else if(property=='metaTitle' || property=='metaDescription'){
            if(item[property] == null){
              line += `<span>${property}: </span><span style='color: red;'>NICHT GEFUNDEN!</span><br>`
            }
            else {
              line += `<span>${property}: </span><span style='color: green;'>${encodeURIComponent(item[property])}</span><br>`
            }
          }
        }
        if(type=="content"){
          if(property=='path'){
            line += `<span>Seite: </span><span><strong>${item[property]}</strong></span><br>`
          }
          else if(property=='content'){
            if(item[property] == null){
              line += `<span>Content: </span><span style='color: red;'>NICHT GEFUNDEN!</span></br>`
            }
            else {
              // first prettify raw html
              let raw = pretty(item[property])
              // ...then escape html characters ...
              let escaped = escapeHtml(raw)
              // ... then turn \n line breaks into <br> html breaks again (for readability)
              let breaks = escaped.replace(/\n/g, "<br>")
              // ... then turn \s whitespace into &nbsp; html space again (for readability)
              let prettier = breaks.replace(/\s/g, "&nbsp;")
              let content, spacer
              if(limiter){
                // use whitespace-less version for shortened output
                content = encodeURIComponent(breaks.substring(0,limiter))
                spacer = '[...]'
              }
              else {
                // use version with whitespace for detailed output
                content = encodeURIComponent(prettier)
                spacer = ''
              }
              line += `<span>Content: </span><span style='display: block; overflow: hidden; border: 3px solid green; padding: 5px;'>${content}${spacer}</span></br>`
            }
          }
        }
      }
      line += '<br><hr><br>'
      html += line
    }
    html += '</body></html>'
    // prettify output
    let output = pretty(html, {ocd: true})
    return output
  }
}
