function projectEdit(model)
{
    var view = document.createElement('div')
        view.className = 'projectEdit'

    function update(changes)
    {
        if (changes.newMembers)
            if (changes.newMembers.service)
            {
                view.appendChild(
                    a3View(model.service.args)
                )
                view.appendChild(
                    a3expander({
                    model:model.service.src,
                    expanded:true,
                    header:a3Frame(model.service.src),
                    contentFactory:()=> codeEdit(model.service.src)
                }))
            }
    }
    update({ newMembers:model })
    model.on('change', update)
    return view
}
