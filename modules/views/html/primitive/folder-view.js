{
    type: 'View',
    modelTypes: ['Folder'],
    ctor: function(model)
    {
        var view = document.createElement('div')
            view.innerText = model.directory
            view.style.float = 'right'
            view.style.margin = '0 6 0 0'
            view.style.fontSize = '0.75em'
        return view
    }
}

