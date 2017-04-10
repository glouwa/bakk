function makePaper(p, paperStack)
{
    p.flap = htmlElement('div', 'flap', p.model)
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
    if (paperStack.header.childNodes.length === 0 || p.highlight || paperStack.autoShow)
        p.setActive()
    return p
}

function paperStack(model, autoShow)
{
    var view = htmlElement('div', 'paperstack-top', model)
        view.header = htmlElement('div', 'header', model)
        view.header.ondragover = ev=> ev.preventDefault()
        view.header.ondrop = ev=>{
            ev.preventDefault()
            ev.stopPropagation()
            var m = mvj.traverse(ev.dataTransfer.getData("text"), app)
            view.add({
                icon:m.icon||'?',
                model:m,
                highlight:true,
                contentViewFactory:m=> app.viewTypes.a4v.objectSplitterView.ctor(m)
            })            
        }
        view.content = htmlElement('div', 'ps-content', model)
        view.active = undefined
        view.add = p=> view.header.appendChild(makePaper(p, view).flap)      
        view.autoShow = autoShow
        view.appendChild(view.header)
        view.appendChild(view.content)

    compositeBinding({
        model:model,
        view:view.header,
        itemDelegate:(v,k,idx)=> makePaper({
                icon:k,
                model:v,
                contentViewFactory:app.viewTypes.a4v.objectSplitterView.ctor
            },
            view).flap
    })
    return view
}

function btabLazy(model, viewPrototypeSet)
{    
    var view = htmlElement('div', 'paperstack-bottom', model)
        view.header = htmlElement('div', 'header', model)
        view.content = htmlElement('div', 'ps-content', model)
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
