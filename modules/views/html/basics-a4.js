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
