function hexToRgb(hex)
{
    hex = hex.replace(/[^0-9A-F]/gi, '')
    var bigint = parseInt(hex, 16)
    var r = (bigint >> 16) & 255
    var g = (bigint >> 8) & 255
    var b = bigint & 255
    return 'rgba(' + [r, g, b].join() + ', 0.4)'
}

function div(className, caption)
{
    var view = document.createElement('div')
        if (className) view.className = className
        if (caption) view.innerText = caption
    return view
}

function button(caption, useReset, className)
{
    var cl = className || ' jobButton'

    var view = document.createElement('div')
        view.className = cl
        view.caption = document.createElement('div')
        view.caption.innerText = caption
        view.caption.style.position = 'relative'

    view.reset = function(dead)
    {
        dead.style.opacity = 0
        //todo: view.removeChild(dead)
    }

    view.initialize = function()
    {
        console.assert(!view.background)
        view.background = document.createElement('div')
        view.background.style.position = 'absolute'
        view.background.style.background = '#FFD900'
        view.background.style.left = view.background.style.right = '50%'
        view.background.style.top = view.background.style.bottom = '50%'
        view.insertBefore(view.background, view.caption)
        view.background.classList.add('jobButtonBackground')
    }

    view.setProgress = function(p, c)
    {       
        //console.log('setting button ' + p + ' -> ' + (1-p)*40, c + ' -> ' + hexToRgb(c))

        if (p == 0)
            view.initialize()

        console.assert(view.background)

        if (view.background)
        {
            view.background.style.background = hexToRgb(c)
            view.background.style.left = view.background.style.right = (1-p)*40+'%'
            view.background.style.top = view.background.style.bottom = (1-p)*40+'%'
            view.background.style.borderRadius = 10-p*10+'px' // 0%=10, 100%=3

            if (p == 1 && useReset)
            {
                var dead = view.background
                setTimeout(()=> view.reset(dead), 600)
                view.background = null
            }
        }
    }


    function updateStyle()
    {
        if (view.disabled)  view.className = cl + ' ' + cl + '-disabled'
        else if (view.down) view.className = cl + ' ' + cl + '-down'
        else                view.className = cl
    }

    view.disabled = false
    view.down = false

    view.disable = function(ed)                     { view.disabled = ed; updateStyle() }
    view.onmousedown = function()                   { view.down = true;   updateStyle() }
    view.onmouseup = view.onmouseleave = function() { view.down = false;  updateStyle() }
    //view.onmouseleave = () => view.class =

    //view.appendChild(view.background)
    view.appendChild(view.caption)    

    return view
}

function checkButton(caption, check, title)
{
    var view = div('buttonLeft', caption)
        view.innerText = caption
        view.style.fontSize = 15
        view.title = 'enable error recovering'
        view.value = function(newValue)
        {
            this.check = newValue
            this.style.color = this.check ?
                        config.colors.enabledIcon :
                        config.colors.disabledIcon
        }
        view.onclick = function()
        {
            view.value(!this.check)
        }
        view.value(check)
    return view
}

function diffBar(maxDiffWidth, matchItem)
{
    var result = document.createElement('div')
        var diffActual = document.createElement('div')
            diffActual.style.backgroundColor = '#80CCE6'
            diffActual.style.height = 5
            diffActual.style.width = maxDiffWidth - matchItem.diff * 2
            diffActual.style.top = 23
            diffActual.style.left = 7
            diffActual.style.position = 'absolute'
        var diffMax = document.createElement('div')
            diffMax.style.backgroundColor = '#e8e8e8'
            diffMax.style.height = 5
            diffMax.style.width = maxDiffWidth
            diffMax.style.top = 23
            diffMax.style.left = 7
            diffMax.style.position = 'absolute'
            diffMax.style.boxShadow = '0 1px 1px rgba(0, 0, 0, 0.15) inset'
        var diffVal = document.createElement('div')
            diffVal.innerText = matchItem.diff.valueOf().toFixed(1)
            diffVal.style.color = '#B1B1B1'
            diffVal.style.top = 21
            diffVal.style.left = 113
            diffVal.style.fontSize = 9
            diffVal.style.position = 'absolute'
        result.appendChild(diffVal)
        result.appendChild(diffMax)
        result.appendChild(diffActual)
    return result
}

function varName(name)
{
    var view = document.createElement('div')
    view.innerText = name.charAt(0).toUpperCase() + name.slice(1)
    view.style.float = 'left'
    view.style.color = '#00CC66'
    return view
}

function preView(factoryFunction)
{
    var html
    try
    {
        html = factoryFunction(factoryFunction.demoViewModel)
    }
    catch(e)
    {
        html = document.createElement('div')
        html.innerText = e.stack
        html.style.background = '#FFEFEF'
    }
    return html
}