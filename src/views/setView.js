function listView(model, delegate, className)
{
    var view = document.createElement('div')
    if (className)
        view.className = className

    view.update = compositeUpdate({ view:view, itemDelegate:delegate })
    view.update({ newMembers:model })
    model.on('change', view.update)
    return view
}

function itemGridView(psetModel, delegate)
{
    var createJobHandler = pageDelta=> j=>
    {
        j.params.begin = psetModel.begin + pageDelta*psetModel.size()
        j.params.end = psetModel.end + pageDelta*psetModel.size()
        j.params.level = 1
        psetModel.load(j)
    }

    var view =  document.createElement('div')
        view.id = 'database'        
        var info =  document.createElement('div')
            info.id = 'info'
            var workers =  document.createElement('div')
                workers.id = 'workerJobs'
                workers.style.width = 80
                workers.style.height = 23
                workers.style.display = 'inline-block'
            var prev = jobRootButon({ name:'◃', args:{config:{}}, src:createJobHandler(-1), noIcons:true})
            var next = jobRootButon({ name:'▹', args:{config:{}}, src:createJobHandler(+1), noIcons:true})
        var entities = document.createElement('div')
            entities.id = 'entities'
            info.appendChild(workers)
            info.appendChild(next)
            info.appendChild(prev)
        view.appendChild(info)
        view.appendChild(entities)

    //--------------------------------------------------------------------------

    var updateData = compositeUpdate({ view:entities, itemDelegate:delegate })

    function update(changes)
    {
        if (changes.newMembers)
            if (changes.newMembers.data)
            {
                updateData({ newMembers:changes.newMembers.data })
                changes.newMembers.data.on('change', updateData)
            }
    }
    update({ newMembers:psetModel })
    psetModel.on('change', update)

    return view
}


