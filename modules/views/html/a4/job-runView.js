{
    type:'View',
    icon:'⛁',
    modelTypes:['Job'],
    idx:0,
    ctor:function jobAllView(model)
    {
        console.assert(model.output)
        var view = document.createElement('div')
        view.className = 'nice'
        view.appendChild(
            app.core.views.a4v.query('Job', 2)(model)
        )
        view.appendChild(a3expander({
            model:model.output,
            expanded:true,
            header:a3Frame(model.output),
            contentFactory:()=> autoView(model.output)
        }))
        return view
    }
}
