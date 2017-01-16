{
    type: 'View',
    icon:'⛁',
    modelTypes: ['object-auto'],
    ctor: function autoViewLine(model)
    {
        var view = document.createElement('div')
        view.className = 'autoLine'
        //view.appender = lineViewAppend(model)
        view.appender = app.core.views.line.query('object-append')(model)
        view.appendChild(view.appender)

        view.update = compositeUpdate({
            view:view,
            filter: (v, k)=> model.viewfilter(v, k),
            itemDelegate:(v, k)=> {
                var t = modelType(v)
                return app.core.views.line.query(t)(v, k)
                /*if (t=='number' ||
                    t=='string' ||
                    t=='File')
                    return lineViewLeaf(v, k.toString())
                else
                    return lineViewExpandable(v, k.toString())*/
                // recirsion (maybe delayed)
            }
        })
        view.update({ newMembers:model })
        model.on('change', view.update)
        return view
    }
}
