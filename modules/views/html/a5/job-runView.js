function jobHeaderView(jobModel)
{
    var view = document.createElement('div')
        view.className = 'autoJobButtonView'
        view.style.paddingRight = 10

    var defaultAction = app.registry.views.primitiveBound.query('jobfunctions')(jobModel)
    view.appendChild(defaultAction)
    return view
}

function jobAllView(model)
{
    console.assert(model.output)

    var view = document.createElement('div')
    view.appendChild(a3Frame(model,  jobHeaderView))    
    view.appendChild(a3View(model))
    view.appendChild(a3View(model.output))
    return view
}
