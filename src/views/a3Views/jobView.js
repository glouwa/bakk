function jobControlingButton(jobModel)
{
    var view = button('▸')

    var stateMap = {
        'idle':      { caption:'▸', disabled:false, onClick:() => jobModel.call() },
        'calling':   { caption:'■', disabled:false, onClick:() => jobModel.cancel() },
        'running':   { caption:'■', disabled:false, onClick:() => jobModel.cancel() },
        'canceling': { caption:'■', disabled:true,  onClick:undefined },
        'returned':  { caption:null,disabled:true,  onClick:undefined }
    }

    function unpdateButton()
    {
        view.state = stateMap[jobModel.state.type.valueOf()]

        view.caption.innerText = view.state.caption || config.getIcon(jobModel.state)
        view.onclick = view.state.onClick
        view.disable(view.state.disabled)
        view.setProgress(jobModel.state.progress, config.getColor(jobModel.state))
    }

    unpdateButton()
    jobModel.state.on('change', unpdateButton)
    view.onclick = function() { view.state.onClick()/*; unpdateButton() aber ohne gibts double cancels? nein. */}
    view.style.fontSize = 12
    return view
}

function jobHeaderView(jobModel)
{
    var view = document.createElement('div')
        view.className = 'autoJobButtonView'
        view.style.backgroundColor = config.colors.paperBorder
        view.style.height = 16
        view.style.paddingRight = 10
        view.style.borderStyle = 'none none solid none'
        view.style.borderWidth = 1;
        view.style.borderColor = '#fafafa'

    view.style.paddingTop = 20
    view.style.paddingBottom = 20

    var defaultAction = jobControlingButton(jobModel)
    view.appendChild(defaultAction)

    return view
}

function jobAllView(jobModel)
{    
    var tab = a3Frame(jobModel,  jobHeaderView)
        //tab.className = 'search'
        var starterArgs = a3View(jobModel.params)
        var statusTab = a3expander({
            model:jobModel,
            expanded:true,
            header:a3Frame(jobModel),
            contentFactory:()=> autoMultiView(jobModel, [jobStateGraphView])
        })

    function update(changes)
    {
        if (changes.newMembers)
            if (changes.newMembers.output)
            {
                var result = a3View(jobModel.output)
                    result.id = 'result'
                tab.appendChild(result)
            }
    }
    update({ newMembers:jobModel })
    jobModel.on('change', update)

    tab.appendChild(starterArgs)
    tab.appendChild(statusTab)
    return tab
}

