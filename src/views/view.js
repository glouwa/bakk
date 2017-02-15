function modelType(m)
{
    var              result = undefined
    if (m && m.type) result = m.type.valueOf()
    if (!result)     result = m === undefined ? 'undefined' : typeof m.valueOf()
    return result // fuction und view sollte hier unterschieden werden
}

/*-------------------------------------------------------------------------------------------*/

function htmlVoc2View(view)
{
    view.get =()=> view.value
    view.set = v=> {
        if (view.value != v)
            view.value=v
    }
    view.onkeyup  = e=> {
        if (e.keyCode >= 45 ||
            e.keyCode == 8 ||
            e.keyCode == 9 ||
            e.keyCode == 13 ||
            e.keyCode == 32) {
            view.onChange(view.value)
            console.log(e, e.keyCode, e.metaKey)
        }
    }
    //view.onchange = e=> view.onChange(view.value)
    view.onChange = v=> console.warn('unrgistered view onchange')
    return view
}

function htmlIt2View(view)
{
    view.get =()=> view.innerText
    view.set = v=> {
        if (view.value != v)
            view.innerText=v
    }
    return view
}

/*-------------------------------------------------------------------------------------------*/

function d3compositeBinding(args) // { model, view, filter?, itemDelegate }
{
    d3compositeBinding.updatesRunning = d3compositeBinding.updatesRunning || 0
    var childViews = {}
    var filter = (v, k, idx)=> k != 'type' && (!args.filter || args.filter(v, k, idx))
    var update = function(changes)
    {
        if (d3compositeBinding.updatesRunning === 0)
            if (args.onchangeBegin)
                args.onchangeBegin()

        d3compositeBinding.updatesRunning++

        if (changes.deletedMembers === 'all') {
            args.layer.innerText = ''
            childViews = {}
        }

        if (changes.deletedMembers)
            changes.deletedMembers.forEach((v, k, idx) => {
                if (filter(v, k, idx))
                    if (args.layer.contains(childViews[k]))
                        args.layer.removeChild(childViews[k])
            })

        if (changes.newMembers)
            changes.newMembers.forEach((v, k, idx) => {
                if (filter(v, k, idx))
                    args.layer.appendChild(childViews[k] = args.itemDelegate(v, k, idx))
            })

        d3compositeBinding.updatesRunning--
    }
    update({ newMembers:args.model })
    args.model.on('change', update)
}

function compositeUpdate(args) // { view, filter, itemDelegate }
{
    var childViews = {}
    var filter = (v, k, idx)=> k != 'type' && (!args.filter || args.filter(v, k, idx))
    return function(changes)
    {
        if (changes.deletedMembers === 'all') {
            args.view.innerText = ''
            childViews = {}
        }

        if (changes.deletedMembers)
            changes.deletedMembers.forEach((v, k, idx) => {
                if (filter(v, k, idx))
                    if (args.view.contains(childViews[k]))
                        args.view.removeChild(childViews[k])
            })

        if (changes.newMembers)
            changes.newMembers.forEach((v, k, idx) => {
                if (filter(v, k, idx))
                    args.view.insertBefore(
                        childViews[k] = args.itemDelegate(v, k, idx),
                        args.view.appender
                    )
            })
    }
}

/*-------------------------------------------------------------------------------------------*/

function compositeBinding(args) // { model, view, filter?, itemDelegate }
{
    args.view.update = compositeUpdate({
        view:args.view,
        itemDelegate:args.itemDelegate,
        filter:args.filter
    })
    args.view.update({ newMembers:args.model })
    args.model.on('change', args.view.update)
}

function existanceBinding(){}
function typeBinding(){}
function transformBinding(m, v, mvTransform, vmTransform) // model { view, updateView :nv=>, changeEvent :=> }
{
    v.set(mvTransform(m).valueOf())
    v.onChange = v=> {
        m.merge(vmTransform(v))
        m.commit()
        console.log('v-change')
    }
    m.on('change', ()=> {
        v.set(mvTransform(m).valueOf())
        console.log('m-change')
    })
}

function valueBinding(m, v) // model { view, updateView :nv=>, changeEvent :=> }
{
    v.set(m.value.valueOf())
    v.onChange = v=> {
        m.merge(v)
        m.commit()
        console.log('v-change')
    }
    m.on('change', ()=> {
        v.set(m.valueOf())
        console.log('m-change')
    })
}

/*-------------------------------------------------------------------------------------------*/

function listView(model, delegate, className, f)
{
    var view = document.createElement('div')
    if (className)
        view.className = className

    view.update = compositeUpdate({
        view:view,
        itemDelegate:delegate,
        filter:f
    })
    view.update({ newMembers:model })
    model.on('change', view.update)
    return view
}

function itemGridView(psetModel, delegate)
{
    var createJobHandler = pageDelta=> j=>
    {
        j.params.begin = psetModel.begin + pageDelta*psetModel.size()
        j.params.end = psetModel.end + pageDelta*psetModel.size()
        j.params.level = 1
        psetModel.load(j)
    }

    var view =  document.createElement('div')
        view.id = 'database'
        var info =  document.createElement('div')
            info.id = 'info'
            var workers =  document.createElement('div')
                workers.id = 'workerJobs'
                workers.style.width = 80
                workers.style.height = 23
                workers.style.display = 'inline-block'
            var prev = jobRootButon({ name:'◃', args:{}, onCall:createJobHandler(-1), noIcons:true })
            var next = jobRootButon({ name:'▹', args:{}, onCall:createJobHandler(+1), noIcons:true })
        var entities = document.createElement('div')
            entities.id = 'entities'
            info.appendChild(workers)
            info.appendChild(next)
            info.appendChild(prev)
        view.appendChild(info)
        view.appendChild(entities)

    //--------------------------------------------------------------------------

    // todo
    /*
    compositeBinding({
        model:'model.data',
        view:entities,
        itemDelegate:delegate
    })
    */

    var updateData = compositeUpdate({ view:entities, itemDelegate:delegate })

    function update(changes)
    {
        if (changes.newMembers)
            if (changes.newMembers.data)
            {
                updateData({ newMembers:changes.newMembers.data })
                changes.newMembers.data.on('change', updateData)
            }
    }
    update({ newMembers:psetModel })
    psetModel.on('change', update)
    return view
}
