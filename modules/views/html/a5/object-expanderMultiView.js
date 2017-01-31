{
    type:'View',
    icon:'*',
    modelTypes:['object'],
    idx:4,
    ctor: function(model, defView)
    {
        if (defView)
            var viewSet = [
                            app.core.views.a5h.queryByType('object', 0),
                            app.core.views.a5h.queryByType('object', 1),
                            app.core.views.a5h.queryByType('object', 2),
                            app.core.views.a5h.queryByType('object', 3)
                        ].concat(app.core.views.a5h.queryAll(modelType(model)))
        else
            var viewSet = app.core.views.a5h.queryAll(modelType(model))
                        .concat([
                            app.core.views.a5h.queryByType('object', 0),
                            app.core.views.a5h.queryByType('object', 1),
                            app.core.views.a5h.queryByType('object', 2),
                            app.core.views.a5h.queryByType('object', 3)
                        ])

        function autoMultiViewLazy(model, viewsf)
        {
            var view = document.createElement('div')
                view.className = 'autoMultiView'
                var views = btabLazy(model, viewsf)
            view.appendChild(views)
            return view
        }

        return a3expander({
            model:model,
            expanded:true,
            header:a3Frame(model),
            contentFactory:()=> autoMultiViewLazy(model, viewSet)
        })
    }
}

