error = {}
error.delaySlider = function(model)
{
    return labeledSlider(model.value, 10, 300, '', 'ms', 0, 45)
}

error.pOfSelect = function(model)
{
    var select = document.createElement('select')
        select.style.height = 21
        select.style.float = 'right'
        select.style.marginLeft = 10
        select.style.marginTop = 0
        select.options.add(new Option("☏ before request", "beforeRequest"))
        select.options.add(new Option("☎ after request",  "afterRequest"))
        select.options.add(new Option("⚒ before work",    "beforeWork"))
        select.options.add(new Option("⚒ at work",        "atWork"))
        select.options.add(new Option(" on response",   "onResponse"))
        select.options.add(new Option("⇥ on terminate",   "onTerminate"))

    select.onchange = ()=> model.pof.commit(select.value)
    select.update = ()=> select.value = model.pof.valueOf()
    select.update()
    model.pof.on('change', select.update)

    return select
}

error.exceptionsSelect = function(model)
{
    var div = document.createElement('div')
        var pofSelect = this.pOfSelect(model)
        var fatal = document.createElement('div')
            fatal.className = 'checkLeft'
            fatal.innerText = '⚡'
            fatal.title = 'fatal exception'
            fatal.style.marginRight = 3
            fatal.style.width = 20
        var recoverable = document.createElement('div')
            recoverable.className = 'checkLeft'
            recoverable.innerText = '⛈'
            recoverable.title = 'recoverable exception'
            recoverable.style.marginTop = -2
            recoverable.style.color = 'lightgray'
            recoverable.style.width = 20

    fatal.onclick = ()=> model.value.commit('fatal')
    recoverable.onclick = ()=> model.value.commit('recoverable')
    var update = ()=>
    {
        recoverable.style.color = model.value.valueOf() === 'fatal' ? config.colors.disabledIcon : config.colors.enabledIcon
        fatal.style.color = model.value.valueOf() === 'fatal' ? config.colors.enabledIcon : config.colors.disabledIcon
    }
    update()
    model.value.on('change', update)

    div.appendChild(pofSelect)
    div.appendChild(recoverable)    
    div.appendChild(fatal)
    return div
}

function networkNodeView(nodeModel)
{
    var viewFactory =
    {
        delayed:    function(model) { return error.delaySlider(model)      },
        stopWork:   function(model) { return error.pOfSelect(model)        },
        disconnect: function(model) { return error.pOfSelect(model)        },
        exception:  function(model) { return error.exceptionsSelect(model) }
    }

    function setToString(set)
    {
        var r = ''
        for (k in set)
            if (typeof set[k].valueOf() === 'string')
                r += ', ' + set[k].valueOf()
        return r
    }

    var view = document.createElement('div')
        view.className = 'networkNode'
        if (nodeModel.id == jf.workerId)
            view.style.backgroundColor = '#FFFFD0'
        var header = document.createElement('div')
            header.className = 'header'            
            var nodeName = document.createElement('div')
                nodeName.className = 'nodeHeaderText'
                nodeName.innerText = nodeModel.id.valueOf()
            var headerText = document.createElement('div')
                headerText.className = 'nodeHeaderText'
                headerText.innerText = nodeModel.capabilitys ? setToString(nodeModel.capabilitys) : nodeModel.clientcount.valueOf() + ' clients connected'
            header.update = compositeUpdate({
                view:header,
                itemDelegate:(v, k)=>
                {
                    var errorIcon = document.createElement('div')
                    errorIcon.className = 'buttonRight'
                    errorIcon.innerText = v.icon.valueOf()
                    errorIcon.title = v.text.valueOf()

                    errorIcon.onclick = function(){

                        v.active.commit(!v.active.valueOf())
                    }
                    errorIcon.update = ()=> errorIcon.style.color = v.active.valueOf() ? '#00CC66':'#aaa'
                    errorIcon.update()
                    v.active.on('change', errorIcon.update)
                    return errorIcon
                }
            })
            header.update({ newMembers:nodeModel.simconfig })
            nodeModel.simconfig.on('change', header.update)
        var list = document.createElement('ul')
            list.className = 'errorSimList'
            list.update = compositeUpdate({
                view:list,
                filter:(v, k)=> viewFactory[k],
                itemDelegate:(v, k)=>
                {
                    var errorView = document.createElement('li')
                        var errorIconActive = document.createElement('div')
                            errorIconActive.className = 'checkLeft'
                            errorIconActive.innerText = v.icon.valueOf()
                            errorIconActive.title = v.text.valueOf()
                        var errorText = document.createElement('div')
                            errorText.className = 'nodeHeaderText'
                            errorText.style.marginRight = 3
                            errorText.innerText = v.text.valueOf()
                        var line = document.createElement('div')
                            line.style.height = 15
                            line.style.marginLeft = 5
                            line.style.overflow = 'hidden'
                            line.style.borderBottom = '1px dotted #C3C3C3'
                        var errorVal = viewFactory[k](v)
                            errorVal.style.float = 'right'

                    errorIconActive.onclick = errorText.onclick = line.onclick = ()=> v.active.commit(false)
                    errorText.update = ()=> errorView.style.display = v.active.valueOf() ? 'block':'none'
                    errorText.update()
                    v.active.on('change', errorText.update)

                    errorView.appendChild(errorIconActive)
                    errorView.appendChild(errorVal)
                    errorView.appendChild(errorText)
                    errorView.appendChild(line)
                    return errorView
                }
            })
            list.update({ newMembers:nodeModel.simconfig })
            nodeModel.simconfig.on('change', list.update)
        var headerBar = document.createElement('div')
            headerBar.className = 'headerBar'
            headerBar.style.background = graphConfig(nodeModel).color

        header.appendChild(nodeName)
        header.appendChild(headerText)
        header.appendChild(headerBar)
    view.appendChild(header)
    view.appendChild(list)
    return view
}