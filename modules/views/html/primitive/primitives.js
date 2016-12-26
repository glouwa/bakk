var primitiveViews = {}
primitiveViews.type = 'Set<View>'

primitiveViews.null = function(model)
{
    var view = document.createElement('input')
        view.value = '␀'
        view.className = 'primitiveValue'
        view.style.width = '45%'
    return view
}

primitiveViews.undefined = function(model)
{
    var view = document.createElement('input')
        view.value = 'undefined'
        view.className = 'primitiveValue'
        view.style.width = '45%'
    return view
}

primitiveViews.string = function(model)
{
    var view = document.createElement('input')
        view.className = 'primitiveValue'
        view.style.width = '45%'
        view.draggable = true
        view.ondragstart = ev=> ev.preventDefault()

        view.onchange = ()=> model.merge(view.value)
        view.update = ()=> view.value = model.valueOf()
        view.update()

    model.on('change', view.update)
    return view
}


primitiveViews.text = function(model)
{
    var view = document.createElement('span')
        view.className = 'textView'

        view.onchange = ()=> model.merge(view.value)
        view.update = ()=> view.innerText = model.valueOf()
        view.update()

    model.on('change', view.update)
    return view
}

primitiveViews.number = function(model)
{
    var view = document.createElement('input')
        view.className = 'primitiveValue'
        view.style.width = '45%'
        view.draggable = true
        view.ondragstart = ev=> ev.preventDefault()

        view.onchange = ()=> model.merge(view.value)
        view.update = ()=> view.value = model.valueOf()
        view.update()

    model.on('change', view.update)
    return view
}

primitiveViews.boolean = function(model)
{
    var view = document.createElement('input')
        view.type = 'checkbox'
        view.className = 'primitiveValue'

        view.onchange = ()=> model.merge(view.checked)
        view.update = ()=> view.checked = model.valueOf()
        view.update()

    model.on('change', view.update)    
    return view
}

primitiveViews.file = function(model)
{
    var view = document.createElement('div')
        view.innerText = model.path
    return view
}

primitiveViews.Job = function(model)
{
    var view = document.createElement('div')
        view.className = 'jobLineView'
        view.style.marginRight = '5'
        view.style.float = 'right'
        var desc = document.createElement('div')
            desc.className = 'textView'
            desc.style.float = 'right'            
            desc.style.marginLeft = 10
            desc.style.maxWidth = 100
            desc.style.whiteSpace = 'nowrap'
            desc.style.overflow = 'hidden'
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
        view.update = ()=>
        {
            var workTimeMs = jf.jobTime(model)

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
        view.update()

    model.on('change', view.update)
    return view
}
/* job
return lineExpander({
    model: model,
    header: lineFrame(name, model, view),
    contentFactory: ()=> autoViewLine(model)
})
*/

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
            model.merge(func)
    })

    return code
}
