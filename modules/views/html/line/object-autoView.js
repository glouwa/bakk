

function autoViewLine(model)
{
    var view = document.createElement('div')
    view.className = 'autoLine'
    view.appender = lineViewAppend(model)
    view.appendChild(view.appender)

    view.update = compositeUpdate({
        view:view,
        filter: (v, k)=> model.viewfilter(v, k),
        itemDelegate:(v, k)=> {

            //console.log(modelType(v), app.core.views.primitive?true:false)

            var t = modelType(v)
            if (   t=='number'
                || t=='string'
                //|| t=='Job'
                || t=='File' // zumindest wenns nicht weiter geladen ist. (vll sorgar ein json)
                || t=='string'
                || t=='string'
                || t=='string')
                return lineViewLeaf(k.toString(), v)
            else
                return lineViewExpandable(k.toString(), v) // recirsion (maybe delayed)
        }
    })
    view.update({ newMembers:model })
    model.on('change', view.update)
    return view
}

function autoView(model)
{
    var view = document.createElement('div')
        view.classList.add('auto')
        var treeRoot = autoViewLine(model)
            treeRoot.style.padding = '20 0'
        view.appendChild(treeRoot)
    return view
}
