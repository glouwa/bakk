function onDragStart(ev, model)
{
    ev.stopPropagation()
    ev.dataTransfer.effectAllowed = 'link'
    ev.dataTransfer.setData("text", model.path)
    console.log('ondragstart ' + model.path)
}

function hoverDiv(model)
{
    //var hoverDiv.actHover

    var view = document.createElement('div')
    view.draggable = true
    view.ondragstart = ev=> onDragStart(ev, model)
    view.onmouseenter = ()=>
    {
        if (hoverDiv.actHover)
        {
            hoverDiv.actHover.classList.remove('line-hover')
            view.stolenFrom = hoverDiv.actHover
        }

        view.classList.add('line-hover')
        hoverDiv.actHover = view
    }

    view.onmouseleave = ()=>
    {
        view.classList.remove('line-hover')
        hoverDiv.actHover = undefined

        if (view.stolenFrom)
        {
            hoverDiv.actHover = view.stolenFrom
            hoverDiv.actHover.classList.add('line-hover')
        }
    }
    return view
}

function lineFramePrimitive(name, model)
{
    var n = name.charAt(0).toUpperCase() + name.slice(1)        
    im = { 'null':'␀', 'undefined':'␥', 'string':'𝕊', 'number':'ℕ', 'number':'ℝ', 'boolean':'𝔹' }

    var view = hoverDiv(model)
        view.className = 'lineFramePrimitive'

        var icon = document.createElement('div')
            icon.innerText = '•' //i
            icon.style.float = 'left'
            icon.style.width = 15
            icon.style.color = 'gray'
            icon.style.marginLeft = 6
        var varname = document.createElement('div')
            varname.innerText = n
            varname.style.float = 'left'
            varname.style.color = '#00CC66'
        var type = document.createElement('div')
            type.innerText = im[modelType(model)] || modelType(model)            
            type.style.float = 'left'
            type.style.color = '#E6E6E6'
            type.style.marginTop = 5
            type.style.marginLeft = 2
            type.style.fontSize = 9

        view.appendChild(icon)
        view.appendChild(varname)
        view.appendChild(type)
    return view
}

function lineFrame(model, content)
{
    var view = document.createElement('div')
        view.className = 'lineFrame'
        //view.draggable = true
        //view.ondragstart = ev=> onDragStart(ev, model)
        var type = document.createElement('div')
            type.innerText = modelType(model)
            type.style.float = 'left'
            type.style.color = '#E6E6E6'
            type.style.marginTop = 5
            type.style.marginLeft = 2
            type.style.fontSize = 9
        var autoButtons = autoJobButtonLineView(model)
            autoButtons.style.paddingRight = 4
            autoButtons.style.margin = '-1 0 -1 0'

        view.appendChild(content)
        view.appendChild(type)
        view.appendChild(autoButtons)
        /*view.update = function(changes)
        {
            content.update(changes)
            type.innerText = modelType(model)
        }*/
    return view
}

function lineExpander(args)
{
    var h = args.header
    var c = undefined
    function getContent() {
        if (c) return c
        c = args.contentFactory()
        c.style.marginLeft = 15
        c.style.marginBottom = 12
        content.appendChild(c)
        console.info('creating expander Content')

        if (args.model && args.model['↻'])
            rootJob({ onCall:j=> args.model['↻'](j), params:{}}).call()

        return c
    }
    // args.expanded
    // args.contentIndent
    // args.treeLevel

    var view = hoverDiv(args.model)
        view.className = 'expander'
        view.expanded = false
        var header = document.createElement('div')
            header.className = 'expander-header'
            header.onclick = function() {
                view.expanded = !view.expanded
                view.update()
            }
            header.indicator = document.createElement('div')
            header.indicator.style.float = 'left'
            header.indicator.style.width = 15
            header.indicator.style.marginTop = 1
            header.indicator.style.color = '#D0D0D0'
            header.indicator.style.marginLeft = 6
        var content = document.createElement('div')
            content.style.display = 'inline-block'
            content.style.width = '100%'

    view.update = function() {
        if (view.expanded)
            getContent()

        content.style.display = view.expanded ? 'block' : 'none'
        header.indicator.innerText = view.expanded ? '🞃' : '🞂' //⌄⌵› ⯈⯆  🞃🞂
    }
    view.update()

        header.appendChild(header.indicator)
        header.appendChild(h)
    view.appendChild(header)        
    view.appendChild(content)
    return view
}


