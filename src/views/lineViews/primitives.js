var viewCollection = {}
viewCollection.type = 'Set<View>'

viewCollection.nullView = function(name, value)
{
    var view = lineFramePrimitive(name, value)
        var varvalue = document.createElement('input')
            varvalue.value = '␀'
            varvalue.className = 'primitiveValue'
            varvalue.style.width = '60%'
    view.appendChild(varvalue)

    return view
}

viewCollection.undefinedView = function(name, value)
{
    var view = lineFramePrimitive(name, value)
        var varvalue = document.createElement('input')
            varvalue.value = 'undefined'
            varvalue.className = 'primitiveValue'
            varvalue.style.width = '60%'
    view.appendChild(varvalue)

    return view
}

viewCollection.stringView = function(name, model)
{    
    var view = lineFramePrimitive(name, model)
        var varvalue = document.createElement('input')
            varvalue.className = 'primitiveValue'    
            varvalue.style.width = '60%'
            varvalue.draggable = true
            varvalue.ondragstart = ev=> ev.preventDefault()
        view.appendChild(varvalue)

    varvalue.onchange = ()=> model.update(varvalue.value)
    var update = ()=> varvalue.value = model.valueOf()
    update()
    model.on('change', update)
    return view
}

viewCollection.textView = function(name, model)
{
    var view = lineFramePrimitive(name, model)
        var varvalue = document.createElement('span')
            varvalue.className = 'textView'
        view.appendChild(varvalue)

    varvalue.onchange = ()=> model.update(varvalue.value)
    var update = ()=> varvalue.value = model.valueOf()
    update()
    model.on('change', update)
    return view
}

viewCollection.numberView = function(name, model)
{    
    var view = lineFramePrimitive(name, model) //ℝ
        var varvalue = document.createElement('input')
            varvalue.className = 'primitiveValue'
            varvalue.style.width = '60%'
            varvalue.draggable = true
            varvalue.ondragstart = ev=> ev.preventDefault()
        view.appendChild(varvalue)

    varvalue.onchange = ()=> model.update(varvalue.value)
    var update = ()=> varvalue.value = model.valueOf()
    update()
    model.on('change', update)
    return view
}

viewCollection.booleanView = function(name, model)
{    
    var view = lineFramePrimitive(name, model)
        var varvalue = document.createElement('input')
            varvalue.type = 'checkbox'
            varvalue.className = 'primitiveValue'            
        view.appendChild(varvalue)

    varvalue.onchange = ()=> model.update(varvalue.checked)
    view.update = ()=> varvalue.checked = model.valueOf()
    view.update()
    model.on('change', view.update)    
    return view
}

viewCollection.FileView = function(name, model)
{
    var view = lineFramePrimitive(name, model)
    return view
}

function codeEdit(model)
{
    if (typeof codeEdit.counter == 'undefined' ) codeEdit.counter = 0

    var code = document.createElement('pre')
        code.id = 'aceEdit' + codeEdit.counter++
        code.style.clear = 'both'
        code.style.margin = '0 1 0 0'        
    var editor = ace.edit(code)
        editor.session.setMode("ace/mode/javascript")
        editor.setTheme("ace/theme/tomorrow")
        editor.setValue(model.toString(), -1)
        editor.setOptions({
            maxLines: 55,
            fontFamily: "Monospace",
            fontSize: "8pt"
        })

    editor.getSession().on('change', function(e)
    {
        var functionCode = editor.getSession().getValue()
        var func = eval('('+functionCode+')')
        console.log(func.toString())

        if (func)
            model.update(func)
    })

    return code
}
