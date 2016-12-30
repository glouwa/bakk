function addStandardLine(view, name, model)
{
    view.appendChild(varName(name))

    appendObjInfo(view, model)

    var autoButtons =  app.registry.views.primitiveBound.query('object-buttons')(model)
        autoButtons.style.paddingRight = 4
        autoButtons.style.margin = '-1 0 -1 0'
    view.appendChild(autoButtons)

    var type = modelType(model)
    var primitive = app.registry.views.primitiveBound.query(type)(model)
    if (primitive)
        view.appendChild(primitive)
}

function lineObjectView(name, model)
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

function linePrimitiveView(k, model)
{/*
    // use for: null, undef, bool, string, text, number, file (as base)
    function primitiveHeader(name, model)
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

    function nonExpander(args){
        var view = hoverDiv(args.model)
            view.className = 'expander'

            var icon = document.createElement('div')
                icon.innerText = '•' //i
                icon.style.float = 'left'
                icon.style.width = 15
                icon.style.color = 'gray'
                icon.style.marginLeft = 6

        view.append(args.header)
        return view
    }

    return nonExpander({ // alias dot hoverdiv
        model: model,
        header:primitiveHeader(k, model)
    })
*/

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

function lineAppendView(model)
{
    var view = lineFrameAppender('', undefined)
        var varvalue = document.createElement('input')
            varvalue.className = 'primitiveValue'
            varvalue.style.width = 'calc(100% - 31px)'
            varvalue.style.textAlign= 'left'
            varvalue.draggable = true
            varvalue.ondragstart = ev=> ev.preventDefault()
        view.appendChild(varvalue)

    function addEvalToModel() {
        try {
            var diff = eval('({' + varvalue.value + '})')
            model.merge(diff)
            model.commit(diff)
            varvalue.value = ''
        }
        catch(e) {
           varvalue.value = e
        }
    }

    varvalue.onchange = ()=> addEvalToModel()
    varvalue.onkeypress = function(e) {
        var charCode = e.which || e.keyCode;
        if (charCode == '13') {
          addEvalToModel()
          return false;
        }
    }
    return view
}

function autoViewLine(model)
{
    var view = document.createElement('div')
    view.className = 'autoLine'
    view.appender = lineAppendView(model)
    view.appendChild(view.appender)

    view.update = compositeUpdate({
        view:view,
        filter: (v, k)=> typeof v !== 'function' && k != 'linkPath' && k != 'linkThatShit',
        itemDelegate:(v, k)=> {

            //console.log(modelType(v), app.registry.views.primitive?true:false)

            var t = modelType(v)
            if (   t=='number'
                || t=='string'
                //|| t=='Job'
                || t=='File' // zumindest wenns nicht weiter geladen ist. (vll sorgar ein json)
                || t=='string'
                || t=='string'
                || t=='string')
            {
                //console.log('primitive')
                return linePrimitiveView(k.toString(), v) // leaf
            }
            else {
                //console.log('object')
                return lineObjectView(k.toString(), v) // recirsion (maybe delayed)
            }
            //var viewFactory = app.registry.views.line[modelType(v) + 'View']
            //               || lineObjectView
            //return viewFactory(k.toString(), v)
        }
    })
    view.update({ newMembers:model })
    model.on('change', view.update)
    return view
}

function autoView(model)
{
    var view = document.createElement('div')
        view.classList.add('auto')
        var treeRoot = autoViewLine(model)
            treeRoot.style.padding = '20 0'
        view.appendChild(treeRoot)
    return view
}
