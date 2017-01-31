{
    type:'View',
    icon:'📖',
    modelTypes:['object'],
    ctor:function(model)
    {
        var view = htmlElement('div', 'root', model)
        compositeBinding({
            model:model,
            view:view,
            itemDelegate:(v,k,idx)=>  paperStack(v)
        })
        return view
    }
}

