// SQUIRRELLY HELPERS
function initSqrlHelpers(){
  // DWT
  //template begin/end
  Sqrl.defineHelper("template", function(obj, type){
    let out = ""
    if(check(obj, 'DWT')){
      if(obj.DWT.export && !obj.DWT.isTemplate){
        if(type=='begin'){
          let name = 'template'
          if(check(obj.DWT, 'name')){
            name = obj.DWT.name
          }
          out = `<!-- InstanceBegin template="/Templates/${name}.dwt" codeOutsideHTMLIsLocked="false" -->`
        }
        else if(type=='end'){
          out = `<!-- InstanceEnd -->`
        }
      }
    }
    return out
  })

  //instance begin/end
  Sqrl.defineHelper("editable", function(obj, type, name){
    let out = ""
    if(check(obj, 'DWT')){
      if(obj.DWT.export && !obj.DWT.isTemplate){
        if(type=='begin'){
          out = `<!-- InstanceBeginEditable name="${name}" -->`
        }
        else if(type=='end'){
          out = `<!-- InstanceEndEditable -->`
        }
      }
      else if(obj.DWT.export && obj.DWT.isTemplate){
        if(type=='begin'){
          out = `<!-- TemplateBeginEditable name="${name}" -->`
        }
        else if(type=='end'){
          out = `<!-- TemplateEndEditable -->`
        }
      }
    }
    return out
  })

}
