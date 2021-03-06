{
    type: 'View',
    icon:'{}',
    modelTypes: ['object-auto'],
    ctor: function autoViewLine(model)
    {
        var view = document.createElement('div')
        view.className = 'autoLine'        
        view.appender = app.viewTypes.line.objectAppendView.ctor(model)
        view.appendChild(view.appender)

        compositeBinding({
            model:model,
            view:view,
            filter:(v, k)=> model.viewfilter(v, k),
            itemDelegate:(v, k)=> app.viewTypes.line.query(modelType(v))(v, k)
        })        
        return view
    }
}
