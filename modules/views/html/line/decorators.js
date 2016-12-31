function hoverDiv(model)
{    
    var alphaSteps = [1, 0.2, 0.15, 0.1, 0.05]

    function parentHoverDiv(view) {
        var parent = view.parentElement
        while(parent && !parent.isHoverDiv)
            parent = parent.parentElement
        return parent
    }

    function foreachParentHoverDivs(down, a) {
        while(down) {
            a(down)
            down = parentHoverDiv(down)
        }
    }

    var view = document.createElement('div')
    view.draggable = true
    view.isHoverDiv = true
    view.model = model
    view.ondragstart = ev=> onDragStart(ev, model)
    view.onmouseenter = ()=> {
        var i = 0
        foreachParentHoverDivs(view, element=> {
            a = alphaSteps[i++] || 0
            element.style.backgroundColor = 'rgba(252,252,252,'+a+')'
            element.style.borderColor = 'rgba(176,176,176,'+a+')'
        })
    }

    view.onmouseleave = ()=> {
        var i = 0
        foreachParentHoverDivs(parentHoverDiv(view), element=> {
            a = alphaSteps[i++] || 0
            element.style.backgroundColor = 'rgba(252,252,252,'+a+')'
            element.style.borderColor = 'rgba(176,176,176,'+a+')'
        })
        view.style.backgroundColor = 'initial'
        view.style.borderColor = 'transparent'

    }
    return view
}

function appendObjInfo(view, model)
{
    var im = { 'null':'␀', 'undefined':'␥', 'string':'𝕊', 'number':'ℕ', 'number':'ℝ', 'boolean':'𝔹' }
    var type = document.createElement('div')
        type.innerText = im[modelType(model)] || modelType(model)
        type.style.float = 'left'
        type.style.color = '#969696'
        type.style.marginTop = 5
        type.style.marginLeft = 5
        type.style.fontSize = 9

    if (model.isLink) {
        if (model.path == '') {
            var link = document.createElement('div')
                link.innerText = model.isLink.length + '→ '+model.path
                link.style.float = 'left'
                link.style.color = 'red'
                link.style.marginTop = 5
                link.style.marginLeft = 5
                link.style.fontSize = 9
        }
        else{
            var link = document.createElement('div')
                link.innerText = model.isLink.length + '→ '+model.path
                link.style.float = 'left'
                link.style.color = 'blue'
                link.style.marginTop = 5
                link.style.marginLeft = 5
                link.style.fontSize = 9
        }
        view.appendChild(link)
    }
    view.appendChild(type)
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

        if (args.model && args.model['↻'])
            app.callUiJob({
                desc:'lexpander',
                onCall:j=> args.model['↻'](j),
                params:{},
                output:args.model
            })
        return c
    }
    // args.expanded
    // args.contentIndent
    // args.treeLevel

    var view = hoverDiv(args.model)
        view.className = 'expander'
        view.expanded = args.expanded
        var header = document.createElement('div')
            header.className = 'expander-header'
            header.onclick = function() {
                view.expanded = !view.expanded
                view.update()
            }
            header.indicator = document.createElement('div')
            header.indicator.style.float = 'left'
            header.indicator.style.width = 15
            header.indicator.style.marginTop = 0
            header.indicator.style.color = '#D0D0D0'
            header.indicator.style.marginLeft = 4
        var content = document.createElement('div')
            content.style.display = 'inline-block'
            content.style.width = '100%'

    view.update = function() {
        if (view.expanded)
            getContent()

        content.style.display = view.expanded ? 'block' : 'none'
        header.indicator.innerText = view.expanded ? '⏷' : '⏵' //⌄⌵› 🞃⯈⯆  🞂🞃🞂
    }
    view.update()

        header.appendChild(header.indicator)
        header.appendChild(h)
    view.appendChild(header)        
    view.appendChild(content)
    //view.style.transition = 'height 1s ease'
    return view
}

