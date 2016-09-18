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
                view.add('dnd', { content:a3View(m) })
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
            view.active.content.style.display = 'table'
        }

        view.appendChild(header)
        view.appendChild(content)
    return view
}

function splitter(v1, v2)
{
    var view = document.createElement('div')
        view.className = 'split'
        view.style.position = 'relative'
        view.style.minHeight = view.style.maxHeight = '380'
        var p1 = document.createElement('div')
            p1.style.position = 'absolute'
            p1.style.top = 10
            p1.style.left = 10
            p1.style.right = '68%'
            p1.style.bottom = 10
            p1.appendChild(v1)
        var p2 = document.createElement('div')
            p2.style.width = '68%'
            p2.style.float = 'right'
            p2.appendChild(v2)
        var c = document.createElement('div')
            c.style.clear = 'both'

    view.appendChild(p1)
    view.appendChild(p2)
    view.appendChild(c)
    return view
}

function btab()
{
    var view = document.createElement('div')
        view.style.marginBottom = -1
        var header = document.createElement('div')
            header.className = 'btab-header'
            header.style.backgroundColor = '#FDFDFD' // config.colors.paperBorder
            header.style.color = 'gray'
            header.style.clear = 'both'
        var content = document.createElement('div')
            //content.style.paddingTop = 20
            //content.style.paddingBottom = 20
        view.active = undefined
        view.style.clear = 'both'
        view.add = function(n, p)
        {
            p.flap = document.createElement('div')
            p.flap.innerText = n
            p.flap.onclick = ()=> view.activate(p)
            header.appendChild(p.flap)
            content.appendChild(p.content)
            view.activate(p)
            return p
        }
        view.activate = function(p)
        {
            if (view.active) view.active.flap.className = 'btab'
            if (view.active) view.active.content.style.display = 'none'
            view.active = p
            view.active.flap.className = 'btab-active'
            view.active.content.style.display = 'block'
        }
        view.appendChild(content)
        view.appendChild(header)
    return view
}
