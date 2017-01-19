{
    type:'View',
    icon:'⛁',
    modelTypes:['Job'],
    idx:1,
    ctor:function jobAllView(model)
    {
        function jobHeaderView(jobModel)
        {
            var view = document.createElement('div')
                view.className = 'autoJobButtonView'
                view.style.width = '100%'

            var defaultAction = app.core.views.primitive.query('Job')(jobModel)
            view.appendChild(defaultAction)
            return view
        }

        console.assert(model.output)
        var view = document.createElement('div')
        view.className = 'nice'
        view.appendChild(a3Frame(model,  jobHeaderView))
        view.appendChild(a3View(model))
        view.appendChild(a3View(model.output))/*
        var view = a3Frame(model,  jobHeaderView) nicht besser?
        view.appendChild(a3View(model))
        view.appendChild(a3View(model.output))*/
        return view
    }
}
