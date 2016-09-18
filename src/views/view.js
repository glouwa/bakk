function modelType(m)
{
    var              result = undefined
    if (m && m.type) result = m.type.valueOf()
    if (!result)     result = m === undefined ? 'undefined' : typeof m.valueOf()
    return result // fuction und view sollte hier unterschieden werden
}

function compositeUpdate(args)
{
    var childViews = {}
    return function(changes)
    {
        if (changes.deletedMembers === 'all'){
            args.view.innerText = ''
            childViews = {}
        }

        if (changes.deletedMembers)
            changes.deletedMembers.forEach((v, k, idx) => {
                if (k != 'type' && (!args.filter || args.filter(v, k, idx)))
                    if (args.view.contains(childViews[k]))
                        args.view.removeChild(childViews[k])
            })

        if (changes.newMembers)
            changes.newMembers.forEach((v, k, idx) => {
                if (k != 'type' && (!args.filter || args.filter(v, k, idx)))
                    args.view.insertBefore(childViews[k] = args.itemDelegate(v, k, idx),
                                           args.view.appender)
            })
    }
}

function listView(model, delegate, className, f)
{
    var view = document.createElement('div')
    if (className)
        view.className = className

    view.update = compositeUpdate({ view:view, itemDelegate:delegate, filter:f })
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
            var prev = jobRootButon({ name:'◃', args:{}, onCall:createJobHandler(-1), noIcons:true})
            var next = jobRootButon({ name:'▹', args:{}, onCall:createJobHandler(+1), noIcons:true})
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
