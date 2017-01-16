{
    type: 'View',
    modelTypes: 'null',
    ctor: function(model)
    {
        var view = document.createElement('input')
            view.value = '␀'
            view.className = 'primitiveValue'
            view.style.width = '45%'
        return view
    }
}

