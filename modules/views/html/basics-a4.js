function paperStack(id, model)
{
    function setActive()
    {
        if (!this.content) {
            this.content = this.contentViewFactory(this.model)
            this.content.flap = this.flap
            this.content.flap.content = this.content
            this.content.style.display = 'none'
            this.content.style.borderWidth = 0
            this.content.style.width = '100%'
            this.content.style.height = 'calc(100% - 25px)'
            this.paperStack.content.appendChild(this.content)
        }
        this.flap.className = 'tab-active'
        this.content.style.display = 'flex'
        this.content.style.flexDirection = 'column'
    }

    function setInactive()
    {
        this.flap.className = 'tab'
        if (this.content)
            this.content.style.display = 'none'
    }

    function makePaper(p, paperStack)
    {
        p.flap = document.createElement('div')
        p.flap.className = 'tab'
        p.flap.innerText = p.icon.valueOf()
        p.flap.onclick = ()=> paperStack.activate(p)
        p.flap.p = p
        p.setActive = setActive
        p.setInactive = setInactive
        p.paperStack = paperStack

        if (paperStack.header.childNodes.length === 0 || !p.inBg) {
            paperStack.active = p
            p.setActive()
        }
        else
            p.setInactive()

        view.header.appendChild(p.flap)
        //view.content.appendChild(p.content)
        return p
    }

    var view = document.createElement('div')
        view.id = id
        view.style.clear = 'both'
        view.header = document.createElement('div')
        view.header.className = 'pheader'
        view.header.style.backgroundColor = '#00CC66'
        view.header.style.color = 'white'
        view.header.ondragover = ev=> ev.preventDefault()
        view.header.ondrop = ev=>
        {
            ev.preventDefault()
            ev.stopPropagation()
            var m = mvj.traverse(ev.dataTransfer.getData("text"), app)
            view.add({
                icon:m.icon||'?',
                model:m,
                inBg:true,
                contentViewFactory:m=> app.core.views.a4v.query(modelType(m))(m)
            })
        }
        view.content = document.createElement('div')
        view.active = undefined
        view.add = function(p)
        {
            return makePaper(p, view)
        }
        view.activate = function(p)
        {
            view.active.setInactive()
            view.active = p
            view.active.setActive()
        }

        view.appendChild(view.header)
        view.appendChild(view.content)
    return view
}

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
    function setActive()
    {        
        if (!this.content) {
            this.content = this.viewPrototype.ctor(this.model)
            this.paperStack.content.appendChild(this.content)
        }
        this.flap.className = 'btab-active'
        this.content.style.display = 'block'
    }

    function setInactive()
    {
        this.flap.className = 'btab'
        if (this.content)
            this.content.style.display = 'none'
    }

    function makePaper(p, paperStack)
    {
        p.flap = document.createElement('div')
        p.flap.innerText = p.name
        p.flap.onclick = ()=> paperStack.activate(p)
        p.setActive = setActive
        p.setInactive = setInactive
        p.paperStack = paperStack

        paperStack.header.appendChild(p.flap)
        paperStack.active = paperStack.active || p

        if (paperStack.header.childNodes.length === 1)
            p.setActive()
        else
            p.setInactive()
        return p
    }

    var view = document.createElement('div')
        view.className = 'btab-container'
        view.style.display = 'flex'
        view.style.flexDirection = 'column'
        view.style.flexGrow = 1
        view.style.marginBottom = -1
        view.style.clear = 'both'
        view.header = document.createElement('div')
        view.header.className = 'btab-header'
        view.header.style.backgroundColor = '#FDFDFD' // config.colors.paperBorder
        view.header.style.color = 'gray'
        view.header.style.clear = 'both'
        view.content = document.createElement('div')
        view.content.className = 'btab-content'
        view.content.style.flexGrow = 1
        view.content.style.overflowY = 'auto'

        view.active = undefined
        view.add = function(p)
        {
            return makePaper(p, view)
        }
        view.activate = function(p)
        {
            view.active.setInactive()
            view.active = p
            view.active.setActive()
        }
        view.appendChild(view.content)
        view.appendChild(view.header)

    viewPrototypeSet.forEach((v, k, idx)=> view.add({
        name:viewPrototypeSet[k].icon + Number(k).toSubscript(),
        model:model,
        viewPrototype:viewPrototypeSet[k]
    }))
    return view
}
