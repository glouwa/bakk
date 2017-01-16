function lineViewAppend(model)
{
    function lineFrameAppender(name, model)
    {
        im = { 'null':'␀', 'undefined':'␥', 'string':'𝕊', 'number':'ℕ', 'number':'ℝ', 'boolean':'𝔹' }

        var view = hoverDiv(model)
            view.className = 'lineFramePrimitive'

            var icon = document.createElement('div')
                icon.innerText = '›' //i
                icon.style.float = 'left'
                icon.style.width = 15
                icon.style.color = '#D0D0D0'
                icon.style.marginLeft = 6

            view.appendChild(icon)
        return view
    }

    var view = lineFrameAppender('', undefined)
        var varvalue = document.createElement('input')
            varvalue.className = 'primitiveValue'
            varvalue.style.width = 'calc(100% - 31px)'
            varvalue.style.textAlign= 'left'
            varvalue.draggable = true
            varvalue.ondragstart = ev=> ev.preventDefault()
        view.appendChild(varvalue)

    function addEvalToModel() {
        try {
            var diff = eval('({' + varvalue.value + '})')
            model.merge(diff)
            model.commit(diff)
            varvalue.value = ''
        }
        catch(e) {
           varvalue.value = e
        }
    }

    varvalue.onchange = ()=> addEvalToModel()
    varvalue.onkeypress = function(e) {
        var charCode = e.which || e.keyCode;
        if (charCode == '13') {
          addEvalToModel()
          return false;
        }
    }
    return view
}

