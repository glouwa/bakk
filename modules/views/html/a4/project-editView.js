{
    type:'View',
    icon:'{}',
    modelTypes:['Project'],
    ctor:function projectEdit(model)
    {
        var view = document.createElement('div')
            view.className = 'projectEdit'

        view.appendChild(
            app.core.views.a5h.query('object',4)(model.jobPrototype.args)
        )
        view.appendChild(
            a3expander({
            model:model.jobPrototype.onCall,
            expanded:true,
            header:a3Frame(model.jobPrototype.onCall),
            contentFactory:()=> codeEdit(model.jobPrototype.onCall)
        }))

        function update(changes)
        {
            if (changes.newMembers)
                if (changes.newMembers.jobPrototype)
                {

                }
        }
        update({ newMembers:model })
        model.on('change', update)
        return view
    }
}

