// COLOR PICKER
module.exports = {
  startColorPicker: function(node, defaultColor){
    if(pickerActive){
      node.addEventListener("click", function initCP(){
        ColorPicker.startColorPicker(node, defaultColor) // @color-picker.js
        this.removeEventListener("click", initCP)
      })
      return false
    }
    pickerActive = true
    if(!defaultColor){
      defaultColor = "#ffffff"
    }
    // create picker instance
    var picker = document.createElement("DIV")
    var currentColor
    picker.classList.add("picker-instance")
    picker.innerHTML =
    `
    <div class="picker"
      acp-color="${defaultColor}"
      acp-show-rgb="no"
      acp-show-hsl="no"
      acp-show-hex="yes"
    ></div>
    <button id="cp-save" disabled>Übernehmen</button><button id="cp-discard">Verwerfen</button>
    `
    // insert after context input field
    node.parentNode.insertBefore(picker, node.nextSibling);
    Picker.from('.picker')
    .on('change', (picker, color) => {
      document.getElementById("cp-save").removeAttribute("disabled")
      currentColor = color
    });
    document.getElementById("cp-save").addEventListener("click", function(){cpSave()})
    document.getElementById("cp-discard").addEventListener("click", function(){cpDiscard()})
    // save changes
    function cpSave(){
      let newColor = Picker.parseColor(currentColor, "hex")
      node.setAttribute('value', newColor)
      module.exports.renderColor(node, newColor)
      node.addEventListener("click", function initCp (){
        module.exports.startColorPicker(node, newColor)
        this.removeEventListener("click", initCp)
      })
      picker.remove()
      toggleSaveState(false)
      pickerActive = false
    }
    // discard changes
    function cpDiscard(){
      node.addEventListener("click", function initCp (){
        module.exports.startColorPicker(node, defaultColor)
        this.removeEventListener("click", initCp)
      })
      picker.remove()
      pickerActive = false
    }
  },
  // rendering background color for input field
  renderColor: function(node, color){
    if(!color){
      color = node.value
    }
    node.style.backgroundColor = color
    // amplify text to black or white depending on background
    let invertColor = invert(color, true)
    node.style.color = invertColor
  }
}
