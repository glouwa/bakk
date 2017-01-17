function a3Frame(model, headerFactory)
{
    var origHf = headerFactory
    headerFactory = headerFactory || app.core.views.primitive.query('object',1)

    var n = model.path.valueOf().charAt(0).toUpperCase() + model.path.valueOf().slice(1)

    var view = document.createElement('div')
        view.className = 'a3Frame'
        view.style.backgroundColor = config.colors.paperBorder
        //view.draggable = true
        //view.ondragstart = ev=> onDragStart(ev, model)
        var name = document.createElement('div')
            name.innerText = n
            name.style.float = 'left'
            name.style.color = 'lightgray'
            name.style.margin = '4 10 3 5'
            //name.style.color = 'rgba(0, 204, 102, 0.8)'
            name.style.color = '#ddd'
            name.style.fontSize = 9

    //appendObjInfo(view, model)

        var type = document.createElement('div')
            type.innerText = modelType(model)
            type.style.float = 'right'
            type.style.color = '#ddd'
            type.style.margin = '4 12 3 2'
            type.style.fontSize = 9
        var desc = document.createElement('div')
            desc.innerText = model.desc ? model.desc.valueOf() : ''
            desc.style.float = 'left'
            desc.style.clear = 'left'
            desc.style.marginTop = 4
            desc.style.marginLeft = 6
            desc.style.fontSize = '1em'
            desc.style.fontStyle = 'italic'
            desc.style.fontWeight = '800'
            desc.style.color = '#1FBF6F'
        var header = headerFactory(model)            
            //buttonHeader.style.marginBottom = 20
        view.appendChild(name)
        view.appendChild(type)       
        view.appendChild(header)
    return view
}

function a3expander(args) // { header, conetentFactory, model, expanded } : onheaderClick -> conetentFactory()
{
    var h = args.header
    var c = undefined

    function getContent()
    {
        if (c) return c

        c = args.contentFactory()        
        content.appendChild(c)

        if (args.model && args.model['↻'])
            app.callUiJob({ desc:'expander ↻', onCall:j=> args.model['↻'](j), params:{} })

        return c
    }

    var view = document.createElement('div')
        view.className = 'a3expander'
        view.expanded = args.expanded
        view.draggable = true
        view.ondragstart = ev=> onDragStart(ev, args.model)
        var content = document.createElement('div')
            content.className = 'a3expanderContent'
            content.style.backgroundColor = 'white'
            content.style.display = 'flex'
            content.style.flexDirection = 'column'
            content.style.flexGrow = 1
            //content.style.display = 'inline-block'
            //content.style.width = '100%'

    h.onclick = function toggle() // open/close fehlt
    {
        view.expanded = !view.expanded
        view.update()
    }

    view.update = function()
    {
        if (view.expanded)
            getContent()

        //content.style.display = view.expanded ? 'block' : 'none'
        content.style.display = view.expanded ? 'flex' : 'none'
    }
    view.update()

    view.appendChild(h)
    view.appendChild(content)
    return view
}
