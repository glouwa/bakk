{
    type: 'View',
    icon:'⏷',
    modelTypes: ['object'],
    ctor: function lineViewExpandable(model, name)
    {
        // used for: lineObjectView/expanderheader,
        // has buttons
        function lineExpanderHeader(name, model)
        {
            var view = htmlElement('div', 'line-expander-header-content', model)
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
            header: lineExpanderHeader(name, model),
            contentFactory: ()=> app.viewTypes.line.objectAutoView.ctor(model) //query('object-auto')(model)
        })
    }
}

