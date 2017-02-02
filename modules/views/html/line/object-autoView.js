{
    type: 'View',
    icon:'{}',
    modelTypes: ['object-auto'],
    ctor: function autoViewLine(model)
    {
        var view = document.createElement('div')
        view.className = 'autoLine'
        //view.appender = lineViewAppend(model)
        view.appender = app.core.views.line.objectAppendView.ctor(model)
        view.appendChild(view.appender)

        view.update = compositeUpdate({
            view:view,
            filter: (v, k)=> model.viewfilter(v, k),
            itemDelegate:(v, k)=> app.core.views.line.query(modelType(v))(v, k)
        })
        view.update({ newMembers:model })
        model.on('change', view.update)
        return view
    }
}
