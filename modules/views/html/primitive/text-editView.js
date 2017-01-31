{
    type: 'View',
    icon:'𝕊',
    modelTypes: ['Text'],
    ctor: function(model)
    {
        var view = document.createElement('span')
            view.className = 'textView'

            view.onchange = ()=> model.merge(view.value)
            view.update = ()=> view.innerText = model.valueOf()
            view.update()

        model.on('change', view.update)
        return view
    }
}

