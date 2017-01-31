{
    type:'View',
    icon:'{}',
    modelTypes:['object'],
    idx:1,
    ctor:function(model)
    {
        var isHidden = k=> k!='onCall' && k!='onCancel' && k!='onUpdate' && k!='onReturn'
        var view = document.createElement('div')
            view.className = 'autoJobButtonView'
            view.style.paddingRight = 10            

        view.update = compositeUpdate({
            view:view,
            filter:(v, k)=> typeof v === 'function' && isHidden(k),
            itemDelegate:(v, k)=> jobRootButon({
                name:k,
                args:{},
                src:v,
                obj:model,
                className:'jobButton-line',
                noIcons:true
            })
        })
        view.update({ newMembers:model })
        model.on('change', view.update)
        return view
    }
}
