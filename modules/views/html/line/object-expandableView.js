function lineViewExpandable(name, model)
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
        expanded: name == 'subjobs',
        header: lineFrame(name, model),
        contentFactory: ()=> autoViewLine(model)
    })
}
