{
    type: 'View',
    icon:'⏷',
    modelTypes: ['object'],
    ctor: function lineViewExpandable(model, name)
    {
        // used for: lineObjectView/expanderheader,
        // has buttons
        function lineFrame(name, model)
        {
            var view = document.createElement('div')
                view.className = 'lineFrame'
            addStandardLine(view, name, model)
            return view
        }

        return lineExpander({
            model: model,
            expanded: name == 'subjobs' ||
                      name == 'mods' ||
                      //name == 'types' ||
                      //name == 'viewTypes' ||
                      name == 'jobTypes' ||
                      name == 'ios' ||
                      name == 'running',
            header: lineFrame(name, model),
            contentFactory: ()=> app.viewTypes.line.objectAutoView.ctor(model) //query('object-auto')(model)
        })
    }
}

