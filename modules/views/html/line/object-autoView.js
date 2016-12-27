function lineObjectView(name, model)
{
    var type = modelType(model)
    var primitive = app.registry.views.primitive[type]
                  ?  app.registry.views.primitive[type].ctor(model)
                  : undefined
    return lineExpander({
        model: model,
        expanded: name == 'subjobs',
        header: lineFrame(name, model, primitive),
        contentFactory: ()=> autoViewLine(model)
    })
}

function linePrimitiveView(k, model)
{
    console.log('adding leaf!')
    var type = modelType(model)
    var view = lineFramePrimitive(k, model)
        //view.className = 'lineLeaf'
        view.primitive = app.registry.views.primitive[type].ctor(model)
        view.appendChild(view.primitive)
    return view
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
        filter:v=> typeof v !== 'function',
        itemDelegate:(v, k)=> {

            console.log(modelType(v), app.registry.views.primitive?true:false)

            var t = modelType(v)
            if (   t=='number'
                || t=='string'
                //|| t=='Job'
                || t=='File' // zumindest wenns nicht weiter geladen ist. (vll sorgar ein json)
                || t=='string'
                || t=='string'
                || t=='string')
            {
                console.log('primitive')
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
