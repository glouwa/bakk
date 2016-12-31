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
    /*
    var typeViewMap = {
        'default':        [objectd3treeView, objectd3graphView, autoView],
        'function':       [autoView, codeEdit],
        Model:            [autoView, systemGraphView],
        Project:          [autoView, projectEdit],
        Job:              [jobStateTreeView, jobStateGraphView,
                            //jobStateGantViewWithProgress,
                            jobPlot],
        Network:          [autoView, systemView],
        Worker:           [autoView, networkNodeView],
        Client:           [autoView, networkNodeView],
        Server:           [autoView, networkNodeView],
        PrimeArgs:        [autoView, app.registry.views['primeParameterView'].ctor],
        PrimeResult:      [autoView, app.registry.views['primeResultView'].ctor],
        Model3dArgs:      [autoView, app.registry.views['model3dParameter'].ctor],
        model3dResultSet: [autoView, app.registry.views['model3dResultSet'].ctor],
        CmdResult:        [autoView, app.registry.views['cmdResult'].ctor],
    }

    var viewSet = typeViewMap[model.type] ? typeViewMap[model.type] : typeViewMap['default']

    return a3expander({
        model:model,
        expanded:true,
        header:a3Frame(model),
        contentFactory:()=> autoMultiView(model, viewSet)
    })

*/

    var contentDelegate = ()=> autoMultiView(model, [objectd3treeView, /*objectd3graphView,*/ autoView])

    if (model.type == 'Model')
        //contentDelegate = ()=> systemGraphView(model)
        contentDelegate = ()=> autoMultiView(model, [autoView, systemGraphView])

    if (model.type == 'Project')
        contentDelegate = ()=> autoMultiView(model, [autoView, projectEdit])

    if (model.type == 'Job')
        contentDelegate = ()=> autoMultiView(model,
            [autoView, jobStateTreeView, jobStateGraphView /*, jobStateGantViewWithProgress*/, jobPlot])

    if (model.type == 'Network')
        contentDelegate = ()=> autoMultiView(model, [autoView, systemView])

    if (modelType(model) == 'function')
        contentDelegate = ()=> autoMultiView(model, [autoView, codeEdit])

    if (model.type == 'Worker' ||
        model.type == 'Client' ||
        model.type == 'Server')
        contentDelegate = ()=> autoMultiView(model, [autoView, networkNodeView])

    if (model.type == 'PrimeArgs')
        contentDelegate = ()=>
            autoMultiView(model, [autoView, app.registry.views.a5['primeParameterView'].ctor])

    if (model.type == 'PrimeResult')
        contentDelegate = ()=>
            autoMultiView(model, [autoView, app.registry.views.a5['primeResultView'].ctor])

    if (model.type == 'Model3dArgs')
        contentDelegate = ()=>
            autoMultiView(model, [autoView, app.registry.views.a5['model3dParameter'].ctor])

    if (model.type == 'model3dResultSet')
        contentDelegate = ()=>
            autoMultiView(model, [autoView, app.registry.views.a5['model3dResultSet'].ctor])

    if (model.type == 'CmdResult')
        contentDelegate = ()=>
            autoMultiView(model, [autoView, app.registry.views.a5['cmdResult'].ctor])

    return a3expander({
        model:model,
        expanded:true,
        header:a3Frame(model),
        contentFactory:contentDelegate
    })
}
