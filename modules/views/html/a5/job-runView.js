function jobHeaderView(jobModel)
{
    var view = document.createElement('div')
        view.className = 'autoJobButtonView'        
        view.style.width = '100%'

    var defaultAction = app.registry.views.primitiveBound.query('Job')(jobModel)
    view.appendChild(defaultAction)
    return view
}

function jobAllView(model)
{
    console.assert(model.output)
    var view = document.createElement('div')
    view.appendChild(a3Frame(model,  jobHeaderView))    
    view.appendChild(a3View(model))    
    view.appendChild(a3View(model.output))/*
    var view = a3Frame(model,  jobHeaderView) nicht besser?
    view.appendChild(a3View(model))
    view.appendChild(a3View(model.output))*/
    return view
}
