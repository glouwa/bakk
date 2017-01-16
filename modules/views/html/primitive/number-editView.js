{
    type: 'View',
    modelTypes: ['number'],
    ctor: function(model)
    {
        var view = document.createElement('input')
            view.className = 'primitiveValue'
            view.style.width = '45%'
            view.draggable = true
            view.ondragstart = ev=> ev.preventDefault()

            view.onchange = ()=> model.merge(view.value)
            view.update = ()=> view.value = model.valueOf()
            view.update()

        model.on('change', view.update)
        return view
    }
}

