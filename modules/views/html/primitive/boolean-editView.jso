{
    type: 'View',
    modelTypes: 'boolean',
    ctor: function(model)
    {
        var view = document.createElement('input')
            view.type = 'checkbox'
            view.className = 'primitiveValue'

            view.onchange = ()=> model.merge(view.checked)
            view.update = ()=> view.checked = model.valueOf()
            view.update()

        model.on('change', view.update)
        return view
    }
}

