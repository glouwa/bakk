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

    select.onchange = ()=> q.addRoot('pof select onchange', ()=> model.pof.merge(select.value))
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

    fatal.onclick = ()=> q.addRoot('on fatal click', ()=> model.value.merge('fatal'))
    recoverable.onclick = ()=> q.addRoot('on recoverable click', ()=> model.value.merge('recoverable'))
    var update = ()=> {
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

function networkNodeHeader(nodeModel)
{
    var header = document.createElement('div')
        header.className = 'header'
        var nodeName = document.createElement('div')
            nodeName.className = 'nodeHeaderName'
            nodeName.innerText = nodeModel.id.valueOf()
        var headerHost = document.createElement('div')
            headerHost.className = 'nodeHeaderName'
            if (nodeModel.osType)
                headerHost.innerText = nodeModel.osType + ', '
                                     + nodeModel.hostname
        var headerText = document.createElement('span')
            headerText.className = 'nodeHeaderText'
            headerText.innerText = nodeModel.capabilitys
                                 ? nodeModel.capabilitys.toString()
                                 : nodeModel.clientcount.valueOf() + ' clients connected'
        var headerTotal = document.createElement('span')
            headerTotal.className = 'nodeHeaderText'
            if (nodeModel.totalMem)
                headerTotal.innerText = nodeModel.totalCpus + ', '
                                     + nodeModel.totalMem + ', '
        var headerFree = document.createElement('div')
            headerFree.className = 'nodeHeaderFree'
            function updateFree() {
                headerFree.innerText = nodeModel.freeCpuPercent + 'cpu, '
                                     + nodeModel.freeMemPercent + 'ram'
            }
            if (nodeModel.freeMemPercent) {
                updateFree()
                nodeModel.freeMemPercent.on('change', updateFree)
            }
            //nodeModel.freeMemPercent.on('change', updateFree)
        var headerActions = app.registry.views.primitiveBound.query('object-buttons')(nodeModel)//autoJobButtonView(nodeModel)
            headerActions.style.float = 'right'
        var headerBar = document.createElement('div')
            headerBar.className = 'headerBar'
            headerBar.style.background = graphConfig(nodeModel).color

    header.appendChild(nodeName)
    header.appendChild(headerHost)
    header.appendChild(headerTotal)
    header.appendChild(headerText)
    header.appendChild(headerFree)
    header.appendChild(headerActions)
    header.appendChild(headerBar)
    return header
}

function networkNodeSimConfig(nodeModel)
{
    var viewFactory = {
        delayed:    model=> error.delaySlider(model),
        stopWork:   model=> error.pOfSelect(model),
        disconnect: model=> error.pOfSelect(model),
        exception:  model=> error.exceptionsSelect(model)
    }

    var view = document.createElement('div')
        var simControl = document.createElement('span')
            simControl.className = 'errorSimControl'
            simControl.update = compositeUpdate({
                view:simControl,
                itemDelegate:(v, k)=> {
                    var errorIcon = document.createElement('div')
                    errorIcon.className = 'buttonRight'
                    errorIcon.innerText = v.icon.valueOf()
                    errorIcon.title = v.text.valueOf()
                    errorIcon.onclick = ()=> q.addRoot('on error icon click', ()=> v.active.merge(!v.active.valueOf()))
                    errorIcon.update = ()=> errorIcon.style.color = v.active.valueOf() ? '#00CC66':'#aaa'
                    errorIcon.update()
                    v.active.on('change', errorIcon.update)
                    return errorIcon
                }
            })
            simControl.update({ newMembers:nodeModel.simconfig })
            nodeModel.simconfig.on('change', simControl.update)
        var simActiveList = document.createElement('ul')
            simActiveList.className = 'errorSimList'
            simActiveList.update = compositeUpdate({
                view:simActiveList,
                filter:(v, k)=> viewFactory[k],
                itemDelegate:(v, k)=> {
                    var errorView = document.createElement('li')
                        var errorIconActive = document.createElement('div')
                            errorIconActive.className = 'checkLeft'
                            errorIconActive.innerText = v.icon.valueOf()
                            errorIconActive.title = v.text.valueOf()
                        var errorText = document.createElement('div')
                            errorText.className = 'errorSimEntry'
                            errorText.style.marginRight = 3
                            errorText.innerText = v.text.valueOf()
                        var line = document.createElement('div')
                            line.style.height = 15
                            line.style.marginLeft = 5
                            line.style.overflow = 'hidden'
                            line.style.borderBottom = '1px dotted #e3e3e3'
                        var errorVal = viewFactory[k](v)
                            errorVal.style.float = 'right'

                    errorIconActive.onclick = errorText.onclick = line.onclick =
                        ()=> q.addRoot('on error icon click', ()=> v.active.merge(false))
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
            simActiveList.update({ newMembers:nodeModel.simconfig })
            nodeModel.simconfig.on('change', simActiveList.update)

    view.appendChild(simControl)
    view.appendChild(simActiveList)
    return view
}

function networkNodeView(nodeModel)
{   
    var view = a3expander({
            model:nodeModel,
            expanded:false,
            header:networkNodeHeader(nodeModel),
            contentFactory:()=> networkNodeSimConfig(nodeModel)
        })
        view.className = 'networkNode'
        if (nodeModel.id == jf.workerId)
            view.style.backgroundColor = '#FFFFD0'

    return view
}
