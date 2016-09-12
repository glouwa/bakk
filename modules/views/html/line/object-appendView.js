
function lineFrameAppender(name, model)
{
    im = { 'null':'␀', 'undefined':'␥', 'string':'𝕊', 'number':'ℕ', 'number':'ℝ', 'boolean':'𝔹' }

    var view = hoverDiv(model)
        view.className = 'lineFramePrimitive'

        var icon = document.createElement('div')
            icon.innerText = '+' //i
            icon.style.float = 'left'
            icon.style.width = 15
            icon.style.color = '#D0D0D0'
            icon.style.marginLeft = 6

        view.appendChild(icon)
    return view
}
