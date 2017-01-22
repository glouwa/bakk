function tab(id)
{
    var view = document.createElement('div')
        view.id = id
        var header = document.createElement('div')
            header.className = 'pheader'
            header.style.backgroundColor = '#00CC66'
            header.style.color = 'white'
            header.ondragover = ev=> ev.preventDefault()
            header.ondrop = ev=>
            {
                ev.preventDefault()
                ev.stopPropagation()
                var m = mvj.traverse(ev.dataTransfer.getData("text"), app)
                view.add('dnd', { content:app.core.views.a4v.query('object')(m) })
            }
        var content = document.createElement('div')
        view.active = undefined
        view.style.clear = 'both'
        view.add = function(n, p, inBg)
        {
            p.flap = document.createElement('div')
            p.flap.innerText = n.valueOf()
            p.flap.onclick = function() { view.activate(p) }
            p.flap.content = p.content
            p.flap.p = p
            p.flap.close = document.createElement('div')
            p.flap.close.className = 'close'
            p.flap.close.innerText = '✕' //ⓧ
            p.flap.close.onclick = (e)=>
            {
                event.stopPropagation()
                view.activate((p.flap.nextSibling || p.flap.previousSibling).p)
                header.removeChild(p.flap)
                content.removeChild(p.content)
            }
            p.flap.appendChild(p.flap.close)
            p.content.flap = p.flap

            p.flap.className = 'tab'
            p.content.style.display = 'none'
            p.content.style.borderWidth = 0
            p.content.style.width = '100%'
            p.content.style.height = 'calc(100% - 25px)'

            header.appendChild(p.flap)
            content.appendChild(p.content)
            if (!inBg) view.activate(p)
            return p
        }
        view.activate = function(p)
        {
            if (view.active) view.active.flap.className = 'tab'
            if (view.active) view.active.content.style.display = 'none'
            view.active = p
            view.active.flap.className = 'tab-active'
            //view.active.content.style.display = 'block'
            view.active.content.style.display = 'flex'
            view.active.content.style.flexDirection = 'column'
        }

        view.appendChild(header)
        view.appendChild(content)
    return view
}

function btabLazy(model, viewPrototypeSet)
{
    function setActive(p)
    {
        p.flap.className = 'btab-active'
        if (!p.content) {
            p.content = p.viewPrototype.ctor(model)
            content.appendChild(p.content)
        }
        p.content.style.display = 'block'
    }

    function setInactive(p)
    {
        p.flap.className = 'btab'
        if (p.content)
            p.content.style.display = 'none'
    }

    var view = document.createElement('div')
        view.className = 'btab-container'
        view.style.display = 'flex'
        view.style.flexDirection = 'column'
        view.style.flexGrow = 1
        view.style.marginBottom = -1
        var header = document.createElement('div')
            header.className = 'btab-header'
            header.style.backgroundColor = '#FDFDFD' // config.colors.paperBorder
            header.style.color = 'gray'
            header.style.clear = 'both'
        var content = document.createElement('div')
            content.className = 'btab-content'
            content.style.flexGrow = 1
            content.style.overflowY = 'auto'
            //content.style.paddingTop = 20
            //content.style.paddingBottom = 20
        view.active = undefined
        view.style.clear = 'both'
        view.add = function(p)
        {
            p.flap = document.createElement('div')
            p.flap.innerText = p.name
            p.flap.onclick = ()=> view.activate(p)
            header.appendChild(p.flap)
            view.active = view.active || p
            if (header.childNodes.length === 1)
                setActive(p)
            else
                setInactive(p)
            return p
        }
        view.activate = function(p)
        {
            setInactive(view.active)
            view.active = p
            setActive(view.active)
        }
        view.appendChild(content)
        view.appendChild(header)

    viewPrototypeSet.forEach((v, k, idx)=> view.add({
        name:viewPrototypeSet[k].icon + Number(k).toSubscript(),
        viewPrototype:viewPrototypeSet[k]
    }))
    return view
}
