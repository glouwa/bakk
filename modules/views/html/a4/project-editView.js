function projectEdit(model)
{
    var view = document.createElement('div')
        view.className = 'projectEdit'

    function update(changes)
    {
        if (changes.newMembers)
            if (changes.newMembers.jobPrototype)
            {
                view.appendChild(
                    a3View(model.jobPrototype.args)
                )
                view.appendChild(
                    a3expander({
                    model:model.jobPrototype.onCall,
                    expanded:true,
                    header:a3Frame(model.jobPrototype.onCall),
                    contentFactory:()=> codeEdit(model.jobPrototype.onCall)
                }))
            }
    }
    update({ newMembers:model })
    model.on('change', update)
    return view
}
