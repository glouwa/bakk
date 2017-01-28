{
    type: 'View',
    modelTypes: ['string'],
    ctor: function(model)
    {
        var view = htmlElement('input', 'primitiveValue', model)
            view.style.width = '45%'
            view.draggable = true
            view.ondragstart = ev=> ev.preventDefault()

        valueBinding(model, htmlVoc2View(view))
        return view
    }
}
