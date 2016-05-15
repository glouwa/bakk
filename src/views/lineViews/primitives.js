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
    return lineFramePrimitive(name, model)
}

viewCollection.JobView = function(name, model)
{
    var view = document.createElement('div')
        view.style.marginRight = '5'
        view.style.float = 'right'
        var desc = document.createElement('div')
            desc.className = 'textView'
            desc.style.float = 'right'            
            desc.style.marginLeft = 10
        var sig = document.createElement('div')
            sig.className = 'textView'
            sig.style.float = 'right'
            sig.style.minWidth = 220
            sig.style.marginLeft = 15
        var time = document.createElement('div')
            time.className = 'textView'
            time.style.float = 'right'
            time.style.textAlign = 'right'
            time.style.minWidth = 50
        var state = document.createElement('div')
            state.className = 'textView'
            state.style.float = 'right'
            state.style.textAlign = 'right'
            state.style.minWidth = 40
        view.appendChild(state)
        view.appendChild(time)
        view.appendChild(sig)
        view.appendChild(desc)

    function updateView()
    {
        var workTimeMs = model.state.callTime ? jf.jobTime(model) : 0

        if (workTimeMs > 1000*60*60)
            time.innerText = ~~(workTimeMs/(1000*60*60)) + 'h'
        else if (workTimeMs > 1000*60)
            time.innerText = ~~(workTimeMs/(1000*60)) + 'm'
        else if (workTimeMs > 1000)
            time.innerText = ~~(workTimeMs/1000) + 's'
        else
            time.innerText = workTimeMs + 'ms'

        desc.innerText = model.desc + ':'//🠒🠆➞➡→
        sig.innerText =  '(…) → ' + model.state.log

        if (model.state.type == 'returned')
            state.innerText = config.getIcon(model.state)
        else
            state.innerText = (model.state.progress.valueOf()*100).toFixed(0) + '%'
    }

    updateView()
    model.on('change', updateView)

    return lineExpander(
    {
        model: model,
        header: lineFrame(name, model, view),
        contentFactory: ()=> autoViewLine(model)
    })
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
            maxLines: 200,
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
