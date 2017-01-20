{
    type: 'View',
    icon:'⛁',
    modelTypes: ['object'],
    idx:0,
    ctor: function(model)
    {
        var viewSet = app.core.views.a4v.queryAll(modelType(model))
                    .concat([autoView, objectd3treeView /*objectd3graphView,*/ ])
        /*var viewSet =
        var more = app.core.views.a4v.queryAll(modelType(model))
        if (more)
            viewSet = viewSet.concat(more)*/

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

