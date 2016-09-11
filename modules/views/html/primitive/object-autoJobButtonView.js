
function autoJobButtonLineView(model)
{
    var view = document.createElement('div')
        view.className = 'autoJobButtonView'
        view.style.height = 16
        view.style.paddingRight = 10

    view.update = compositeUpdate({
        view:view,
        filter:(v, k)=> typeof v === 'function' &&
                        k != 'onCall'   && k != 'onCancel' &&
                        k != 'onUpdate' && k != 'onReturn',
        itemDelegate:(v, k)=>
        {
            return jobRootButon({
                name:k,
                args:{},
                src:v,
                obj:model,
                className:'jobButton-line',
                noIcons:true
            })
        }
    })
    view.update({ newMembers:model })
    model.on('change', view.update)
    return view
}

function autoJobButtonView(model)
{
    var view = document.createElement('div')
        view.className = 'autoJobButtonView'
        view.style.backgroundColor = config.colors.paperBorder
        view.style.height = 18
        view.style.paddingRight = 10
        view.style.borderStyle = 'none none solid none'
        view.style.borderWidth = 1;
        view.style.borderColor = '#f2f2f2'

    view.update = compositeUpdate({
        view:view,
        filter:(v, k)=> typeof v === 'function' &&
                        k != 'onCall'   && k != 'onCancel' &&
                        k != 'onUpdate' && k != 'onReturn',
        itemDelegate:(v, k)=>
        {
            view.style.paddingTop = 20
            view.style.paddingBottom = 14

            return jobRootButon({
                name:k,
                args:{},
                src:v,
                obj:model,
                noIcons:true
            })
        }
    })
    view.update({ newMembers:model })
    model.on('change', view.update)
    return view
}
