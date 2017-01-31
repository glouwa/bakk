{
    type: 'View',
    icon:'⌀',
    modelTypes: ['undefined'],
    ctor: function(model)
    {
        var view = document.createElement('input')
            view.value = 'undefined'
            view.className = 'primitiveValue'
            view.style.width = '45%'
        return view
    }
}

