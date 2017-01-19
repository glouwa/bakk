{
    type: 'View',
    icon:'⛁',
    modelTypes: ['object'],
    idx:0,
    ctor: function(model)
    {
        var viewSet = [objectd3treeView, /*objectd3graphView,*/ autoView]

        var more = app.core.views.a4v.queryAll(modelType(model))
        console.log('MORE',more)
        if (more)
            viewSet = viewSet.concat(more)

        return a3expander({
            model:model,
            expanded:true,
            header:a3Frame(model),
            contentFactory:()=> autoMultiView(model, viewSet)
        })
    }
}

