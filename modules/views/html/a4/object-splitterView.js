{
    type:'View',
    icon:'⌹',
    modelTypes:['object'],
    ctor:function jobPlot(model)
    {
        var view = htmlElement('div', 'objectSplitterV', model)
            view.actual = app.viewTypes.a5h.objectExpanderMultiView.ctor(model)
            view.appendChild(view.actual)

        var aView = undefined
        view.onFocus = function(m) { //gv.d3handler.onFocus=
            if (aView) {
                view.removeChild(aView)
                aView = undefined
            }
            if (m) {
                aView =app.viewTypes.a5h.objectExpanderMultiView.ctor(m, 'objectAutoView')
                view.appendChild(aView)
            }            
        }
        return view
    }
}
