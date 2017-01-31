{
    type:'View',
    icon:'{}',
    modelTypes:['object'],
    idx:0,
    ctor:function autoView(model)
    {
        var view = document.createElement('div')
            view.classList.add('auto')
            //var treeRoot = autoViewLine(model)
            var treeRoot = app.core.views.line.query('object-auto')(model)
                treeRoot.style.padding = '20 0'
            view.appendChild(treeRoot)
        return view
    }
}
