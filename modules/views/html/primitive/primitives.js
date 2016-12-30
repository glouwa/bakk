/*var primitiveViews = {}
primitiveViews.type = 'Set<View>'

primitiveViews.null = {
    type: 'View',
    ctor: function(model)
    {
        var view = document.createElement('input')
            view.value = '␀'
            view.className = 'primitiveValue'
            view.style.width = '45%'
        return view
    }
}

primitiveViews.undefined = {
    type: 'View',
    ctor: function(model)
    {
        var view = document.createElement('input')
            view.value = 'undefined'
            view.className = 'primitiveValue'
            view.style.width = '45%'
        return view
    }
}

primitiveViews.string = {
    type: 'View',
    ctor: function(model)
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
}

primitiveViews.text = {
    type: 'View',
    ctor: function(model)
    {
        var view = document.createElement('span')
            view.className = 'textView'

            view.onchange = ()=> model.merge(view.value)
            view.update = ()=> view.innerText = model.valueOf()
            view.update()

        model.on('change', view.update)
        return view
    }
}

primitiveViews.number = {
    type: 'View',
    ctor: function(model)
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
}

primitiveViews.boolean = {
    type: 'View',
    ctor: function(model)
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
}

primitiveViews.Folder = {
    type: 'View',
    ctor: function(model)
    {
        var view = document.createElement('div')
            view.innerText = model.directory
            view.style.float = 'right'
            view.style.margin = '0 6 0 0'
            view.style.fontSize = '0.75em'
        return view
    }
}

primitiveViews.File = {
    type: 'View',
    ctor: function(model)
    {
        var view = document.createElement('div')
            view.innerText = model.fileName
            view.style.float = 'right'
            view.style.margin = '0 14 0 0'
            view.style.fontSize = '0.75em'
        return view
    }
}

primitiveViews.Job = {
    type: 'View',
    ctor: function(model)
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
}*/

function comboBox(psetModel, selectionModel, itemDelegate)
{
    var combo = document.createElement("div")
    var comboContent = document.createElement("div")
    var comboDropDown = document.createElement("ul")
    var comboIndicator = document.createElement("div")
    var comboSelectedItem = document.createElement("div")
    var selectedIndex = undefined

    combo.disabled = false
    combo.setAttribute('tabindex', 0)
    combo.onfocus = function () {}
    combo.onblur = function()
    {
        comboDropDown.style.display = 'none'
        comboContent.style.background = '-webkit-linear-gradient(bottom, #DEDEDE, #F6F6F6)'
    }
    combo.setValue = function(selectedModel, index)
    {
        if (selectedIndex != index)
        {
            var newSelectedItemView = itemDelegate(selectedModel)
            comboContent.replaceChild(newSelectedItemView, comboContent.childNodes[0])

            selectedIndex = index
            selectionModel.merge(index)
        }
        combo.onblur()
    }
    comboContent.id = 'content'
    comboContent.onclick = function()
    {
        comboDropDown.style.display =
            comboDropDown.style.display === 'none' && !combo.disabled ?
                'block' : 'none'

        comboContent.style.background =
            comboDropDown.style.display === 'none' ?
                '-webkit-linear-gradient(bottom, #DEDEDE, #F6F6F6)' :
                '-webkit-linear-gradient(top, #DEDEDE, #F6F6F6)'
    }

    comboIndicator.id = 'indicator'
    comboIndicator.innerText = '🞃'

    comboDropDown.className = 'cdd'
    comboDropDown.style.display = 'none'

    comboContent.appendChild(comboSelectedItem)
    comboContent.appendChild(comboIndicator)
    combo.appendChild(comboContent)
    combo.appendChild(comboDropDown)

    //--------------------------------------------------------------------------

    function updateSet(changes)
    {
        updateData = compositeUpdate({
            view:comboDropDown,
            itemDelegate:(v, k)=>
            {
                if (k == selectionModel.value)
                    combo.setValue(v, k)

                var li = document.createElement('li')
                    var liDiv = itemDelegate(v)
                        liDiv.id = v.mid
                        liDiv.onclick = ()=> combo.setValue(v, k)
                    li.appendChild(liDiv)
                return li
            }
        })

        if (changes.newMembers)
            if (changes.newMembers.data)
            {
                updateData({ newMembers:changes.newMembers.data })
                changes.newMembers.data.on('change', updateData)
            }
    }
    updateSet({ newMembers:psetModel })
    psetModel.on('change', updateSet)

    function updateSelection()
    {
        var newIdx = selectionModel.value
        combo.setValue(psetModel.data[newIdx], newIdx)
    }
    updateSelection()
    selectionModel.on('change', updateSelection)

    return combo
}

function labeledSlider(model, min, max, pre, post, precision, captionWidth)
{
    var slider = document.createElement("div")
        slider.style.height = 23
        slider.draggable = true
        slider.ondragstart = ev=> {
            ev.stopPropagation()
            ev.preventDefault()
        }
        var threshholdPrefix = document.createElement("div")
            threshholdPrefix.id = 'lslider-prefix'
            threshholdPrefix.innerText = pre
        var threshholdValue = document.createElement("div")
            threshholdValue.id = 'lslider-value'
            threshholdValue.innerText = slider.value
            threshholdValue.style.width = captionWidth
        var threshholdPostfix = document.createElement("div")
            threshholdPostfix.id = 'lslider-postfix'
            threshholdPostfix.innerText = post
        var threshholdSlider = document.createElement("input")
            threshholdSlider.id = 'lslider-slider'
            threshholdSlider.setAttribute('type', 'range')
            threshholdSlider.setAttribute('min', min*100)
            threshholdSlider.setAttribute('max', max*100)

    threshholdSlider.oninput = ()=> q.addRoot('on slider change', ()=> model.merge(threshholdSlider.value/100))
    slider.update = function() {
        var newValue = model.valueOf()
        threshholdSlider.value = newValue * 100
        threshholdValue.innerText = Number(newValue).toExponential(precision+1)
    }
    slider.update()
    model.on('change', slider.update)

    slider.appendChild(threshholdPrefix)
    slider.appendChild(threshholdValue)
    slider.appendChild(threshholdPostfix)
    slider.appendChild(threshholdSlider)
    return slider
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
            model.merge(func)
    })

    return code
}

