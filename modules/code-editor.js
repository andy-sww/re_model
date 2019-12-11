// CODE MIRROR CODE EDITING
module.exports = {
  editCode: function(headline, e){
    // create modal with cm from textarea
    let index = e.getAttribute("data-index")
    let html = e.innerHTML
    var overlay = document.createElement("DIV")
    overlay.classList.add("overlay")
    overlay.innerHTML =
    `
    <div class='modal'>
      <h1>${headline}</h1>
      <textarea id='active-area' data-index='${index}'>${html}</textarea>
      <br>
      <button id="cm-save">Speichern</button><button id="cm-discard">Verwerfen</button>
    </div>
    `
    document.body.appendChild(overlay)
    document.getElementById("cm-save").addEventListener("click", function(){cmSave()})
    document.getElementById("cm-discard").addEventListener("click", function(){cmDiscard()})
    // init cm
    var mirror = CodeMirror.fromTextArea(document.getElementById("active-area"), {
      lineNumbers: true,
      lineWrapping: true,
      mode: "htmlmixed",
      theme: 'hopscotch'
    })
    mirror.focus()
    // save changes
    function cmSave(){
      mirror.toTextArea()
      let activeArea = document.getElementById("active-area")
      let val = activeArea.value
      let index = activeArea.getAttribute("data-index")
      codeAreas[index].innerHTML = val
      overlay.remove()
    }
    // discard changes
    function cmDiscard(){
      mirror.toTextArea()
      overlay.remove()
    }
  }
}
