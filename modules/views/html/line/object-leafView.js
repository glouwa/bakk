function lineViewLeaf(k, model)
{
    // use for: null, undef, bool, string, text, number, file (as base)
    function lineFramePrimitive(name, model)
    {
        var view = hoverDiv(model)
            view.className = 'lineFramePrimitive'

            var icon = document.createElement('div')
                icon.innerText = '•' //i
                icon.style.float = 'left'
                icon.style.width = 15
                icon.style.color = 'gray'
                icon.style.marginLeft = 6

        view.appendChild(icon)
        addStandardLine(view, name, model)
        return view
    }

    return lineFramePrimitive(k, model)
}
