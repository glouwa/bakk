function lineObjectView(name, model)
{
    return lineExpander({
        model: model,
        expanded: name == 'subjobs',
        header: lineFrame(name, model /*nix, gar nix*/),
        contentFactory: ()=> autoViewLine(model)
    })
}

function autoViewLine(model)
{
    var view = document.createElement('div')
    view.className = 'autoLine'
    view.appender = app.registry.views.lineViews['appendView'](model)
    view.appendChild(view.appender)

    view.update = compositeUpdate({
        view:view,
        filter:v=> typeof v !== 'function',
        itemDelegate:(v, k)=> {
            var viewFactory = app.registry.views.lineViews[modelType(v) + 'View']
                           || lineObjectView
            return viewFactory(k.toString(), v)
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
