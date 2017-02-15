{
    type:'View',
    icon:'{}',
    modelTypes:['object'],
    idx:1,
    ctor:function(model)
    {
        var isHidden = k=> k!='onCall'
                        && k!='onCancel'
                        && k!='onUpdate'
                        && k!='onReturn'
                        && k!='loadJob'
                        && k!='runJob'
        var view = document.createElement('div')
            view.className = 'autoJobButtonView'
            view.style.paddingRight = 10            

        compositeBinding({
            model:model,
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
        return view
    }
}
