function makePaper(p, paperStack)
{
    p.flap = htmlElement('div', p.model, 'flap')
    p.flap.innerText = p.icon.valueOf()
    p.flap.onclick = ()=> p.setActive()
    p.flap.p = p
    p.setActive = function setActive()
    {
        if (this.paperStack.active)
            this.paperStack.active.setInactive()

        this.paperStack.active = this

        this.flap.className = 'flap-active'
        if (!this.content) {
            this.content = this.contentViewFactory(this.model)
            this.content.flap = this.flap
            this.content.flap.content = this.content
            this.content.classList.add('ps-content')
            this.paperStack.content.appendChild(this.content)
        }
        this.content.classList.remove('cm')
        this.content.classList.add('cm-active')
    }
    p.setInactive = function setInactive()
    {
        this.flap.className = 'flap'
        this.content.classList.remove('cm-active')
        this.content.classList.add('cm')
    }
    p.paperStack = paperStack
    if (paperStack.header.childNodes.length === 0 || p.highlight)
        p.setActive()
    return p
}

function paperStack(model)
{
    var view = htmlElement('div', model, 'paperstack-top')
        view.header = htmlElement('div', model, 'header')
        view.header.ondragover = ev=> ev.preventDefault()
        view.header.ondrop = ev=>{
            ev.preventDefault()
            ev.stopPropagation()
            var m = mvj.traverse(ev.dataTransfer.getData("text"), app)
            view.add({
                icon:m.icon||'?',
                model:m,
                contentViewFactory:m=> app.core.views.a4v.query(modelType(m))(m)
            })
        }
        view.content = htmlElement('div', model, 'ps-content')
        view.active = undefined
        view.add = p=> view.header.appendChild(makePaper(p, view).flap)
        view.appendChild(view.header)
        view.appendChild(view.content)

    /*compositeBinding({
        model:model,
        view:view,
        itemDelegate:(v,k,idx)=>app.core.views.a4v.query(modelType(v))(v)
    })*/
    return view
}

function btabLazy(model, viewPrototypeSet)
{    
    var view = htmlElement('div', model, 'paperstack-bottom')
        view.header = htmlElement('div', model, 'header')
        view.content = htmlElement('div', model, 'ps-content')
        view.active = undefined
        view.add = p=> view.header.appendChild(makePaper(p, view).flap)
        view.appendChild(view.content)
        view.appendChild(view.header)

    viewPrototypeSet.forEach((v, k, idx)=> view.add({
        icon:viewPrototypeSet[k].icon + Number(k).toSubscript(),
        model:model,
        contentViewFactory:viewPrototypeSet[k].ctor
    }))
    return view
}

/*
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
}*/
