{
    type:'View',
    icon:'🛰️',
    modelTypes:['object'],
    idx:3,
    ctor:function(model)
    {
        var view = d3View('d3graph', model)
            view.d3handler = objectd3graph(view, model)
        return view
    }
}
