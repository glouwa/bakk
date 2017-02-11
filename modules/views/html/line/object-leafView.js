{
    type:'View',
    icon:'•',
    modelTypes:['number', 'string'/*, 'File'*/],
    ctor:function lineViewLeaf(model, name)
    {
        var view = hoverDiv(model)
            view.className = 'line-leaf'
            var icon = htmlElement('div', 'indicator', model)
                icon.innerText = '•'

        view.appendChild(icon)
        addStandardLine(view, name, model)
        return view
    }
}
