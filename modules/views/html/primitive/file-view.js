{
    type: 'View',
    modelTypes: ['File'],
    ctor: function(model)
    {
        var view = document.createElement('div')
            view.innerText = model.fileName
            view.style.float = 'right'
            view.style.margin = '0 14 0 0'
            view.style.fontSize = '0.75em'
        return view
    }
}

