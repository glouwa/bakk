function labeledSlider(model, min, max, pre, post, precision, captionWidth)
{
    var slider = document.createElement("div")
        slider.style.height = 23
        slider.draggable = true
        slider.ondragstart = ev=> {
            ev.stopPropagation()
            ev.preventDefault()
        }
        var threshholdPrefix = document.createElement("div")
            threshholdPrefix.id = 'lslider-prefix'
            threshholdPrefix.innerText = pre
        var threshholdValue = document.createElement("div")
            threshholdValue.id = 'lslider-value'
            threshholdValue.innerText = slider.value
            threshholdValue.style.width = captionWidth
        var threshholdPostfix = document.createElement("div")
            threshholdPostfix.id = 'lslider-postfix'
            threshholdPostfix.innerText = post
        var threshholdSlider = document.createElement("input")
            threshholdSlider.id = 'lslider-slider'
            threshholdSlider.setAttribute('type', 'range')
            threshholdSlider.setAttribute('min', min*100)
            threshholdSlider.setAttribute('max', max*100)

    threshholdSlider.oninput = ()=> q.addRoot('on slider change', ()=> model.merge(threshholdSlider.value/100))
    slider.update = function() {
        var newValue = model.valueOf()
        threshholdSlider.value = newValue * 100
        threshholdValue.innerText = Number(newValue).toExponential(precision+1)
    }    
    slider.update()
    model.on('change', slider.update)

    slider.appendChild(threshholdPrefix)
    slider.appendChild(threshholdValue)
    slider.appendChild(threshholdPostfix)
    slider.appendChild(threshholdSlider)
    return slider
}


