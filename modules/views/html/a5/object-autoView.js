
function autoMultiView(model, viewsf)
{
    var view = document.createElement('div')
        var views = btab()
            viewsf.forEach((v, k, idx)=>
            {
                var currentView = viewsf[k](model)
                var viewName = currentView.classList.item(currentView.classList.length-1)
                views.add(viewName, { content:currentView })
            })
    view.appendChild(views)
    return view
}



function a3View(model)
{
    var contentDelegate = ()=> autoMultiView(model, [autoView])

    if (model.type == 'Model')
        //contentDelegate = ()=> systemGraphView(model)
        contentDelegate = ()=> autoMultiView(model, [autoView, systemGraphView])

    if (model.type == 'Project')
        contentDelegate = ()=> autoMultiView(model, [autoView, projectEdit])

    if (model.type == 'Job')
        contentDelegate = ()=> autoMultiView(model,
            [/*jobStateTreeView, jobStateGraphView , jobStateGantViewWithProgress*/, jobPlot])

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
            autoMultiView(model, [autoView, app.registry.views['primeParameterView'].ctor])

    if (model.type == 'PrimeResult')
        contentDelegate = ()=>
            autoMultiView(model, [autoView, app.registry.views['primeResultView'].ctor])

    if (model.type == 'Model3dArgs')
        contentDelegate = ()=>
            autoMultiView(model, [autoView, app.registry.views['model3dParameter'].ctor])

    if (model.type == 'model3dResultSet')
        contentDelegate = ()=>
            autoMultiView(model, [autoView, app.registry.views['model3dResultSet'].ctor])

    if (model.type == 'CmdResult')
        contentDelegate = ()=>
            autoMultiView(model, [autoView, app.registry.views['cmdResult'].ctor])

    return a3expander({
        model:model,
        expanded:true,
        header:a3Frame(model),
        contentFactory:contentDelegate
    })
}
