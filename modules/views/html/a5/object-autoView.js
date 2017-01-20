function autoMultiView(model, viewsf)
{
    var view = document.createElement('div')
        view.className = 'autoMultiView'
        var views = btab()
            viewsf.forEach((v, k, idx)=> {
                var currentView = viewsf[k](model)
                var viewName = currentView.classList.item(currentView.classList.length-1)
                views.add(viewName, { content:currentView })
            })

    view.appendChild(views)
    return view
}

function a3View(model)
{
    var viewSet = [objectd3treeView, /*objectd3graphView,*/ autoView]

    if (model.type == 'Model')
        //contentDelegate = ()=> systemGraphView(model)
        viewSet = [autoView, systemGraphView]

    /*
    if (model.type == 'Project')
        viewSet = [autoView, projectEdit]*/


    if (model.type == 'Network')
        viewSet = [autoView, systemView]

    if (modelType(model) == 'function')
        viewSet = [autoView, codeEdit]

    if (model.type == 'Worker' ||
        model.type == 'Client' ||
        model.type == 'Server')
        viewSet = [autoView, networkNodeView]

    if (model.type == 'PrimeArgs')
        viewSet = [autoView, app.core.views.a5['primeParameterView'].ctor]

    if (model.type == 'PrimeResult')
        viewSet = [autoView, app.core.views.a5['primeResultView'].ctor]

    if (model.type == 'Model3dArgs')
        viewSet = [autoView, app.core.views.a5['model3dParameter'].ctor]

    if (model.type == 'model3dResultSet')
        viewSet = [autoView, app.core.views.a5['model3dResultSet'].ctor]

    if (model.type == 'CmdResult')
        viewSet = [autoView, app.core.views.a5['cmdResult'].ctor]

    return a3expander({
        model:model,
        expanded:true,
        header:a3Frame(model),
        contentFactory:()=> autoMultiView(model, viewSet)
    })
}
