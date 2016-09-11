function modelType(m)
{    
    var              result = undefined
    if (m && m.type) result = m.type.valueOf()
    if (!result)     result = m === undefined ? 'undefined' : typeof m.valueOf()
    return result // fuction und view sollte hier unterschieden werden
}

function jobControlingButton(jobModel) // der bekommt ein model
{
    var view = button('▸')

    var stateMap = {
        'idle':      { caption:'▸', disabled:false, onClick:() => jobModel.call() },
        'calling':   { caption:'■', disabled:false, onClick:() => jobModel.cancel() },
        'running':   { caption:'■', disabled:false, onClick:() => jobModel.cancel() },
        'canceling': { caption:'■', disabled:true,  onClick:undefined },
        'returned':  { caption:null,disabled:true,  onClick:undefined }
    }

    function unpdateButton()
    {
        view.state = stateMap[jobModel.state.type.valueOf()]

        view.caption.innerText = view.state.caption || config.getIcon(jobModel.state)
        view.onclick = view.state.onClick
        view.disable(view.state.disabled)
        view.setProgress(jobModel.state.progress, config.getColor(jobModel.state))
    }

    unpdateButton()
    jobModel.state.on('change', unpdateButton)
    view.onclick = function() { view.state.onClick()/*; unpdateButton() aber ohne gibts double cancels? nein. */}
    view.style.fontSize = 12
    return view
}

function jobRootButon(args)// name, args, src, noIcons, obj)   // der erstellt ein model
{
    var job = 'will be set after job creation, but before job call'
    var cap = icon=>
        (args.noIcons?'':(icon+' ')) +
        (args.noName?'':(args.name+' '))

    var view = button(cap('▸'), true, args.className)
    var stateMap = {
        'idle':      { caption:cap('▸'), disabled:true,  onClick:undefined         },
        'calling':   { caption:cap('■'), disabled:false, onClick:()=> job.cancel() },
        'running':   { caption:cap('■'), disabled:false, onClick:()=> job.cancel() },
        'canceling': { caption:cap('■'), disabled:true,  onClick:undefined         },
        'returned':  { caption:cap('▸'), disabled:false, onClick:()=> attachJob()  }
    }

    function attachJob() {
        function updateView() {
            var state = stateMap[job.state.type.valueOf()]
            if (state) {
                view.state = state
                view.caption.innerText = view.state.caption
                view.onclick = e=> {
                    e.stopPropagation()
                    view.state.onClick()
                }
                view.disable(view.state.disabled)
            }
            else
                console.error(false)

            view.setProgress(job.state.progress.valueOf(), config.getColor(job.state))
        }


        function createRootJob() {
            var jd = jf.job({
                desc: 'button ' + args.name,
                isRoot: true,
                params: args.args,
                onCall: (j, params)=> {
                    if (args.obj) args.obj[args.name](j, params)   // model obj method?
                    else          args.src(j, params)              // project service?
                }
            })
            app.update('model.jobs.'+jd.id, jd)
            job = app.model.jobs[jd.id.valueOf()]
            $('#jobTab')[0].add(job.id, { content:jobAllView(job) }/*, 'inBg'*/)
        }

        //if (jobModel)
        //    jobModel.state.off('change', unpdateButton) TODO

        q.addRoot('Message From UI ' + args.name, ()=>{
            createRootJob()
            updateView()
            job.state.on('change', updateView)
            view.onclick = e=> {
                e.stopPropagation()
                view.state.onClick() // ; unpdateButton() aber ohne gibts double cancels? nein.
            }
            job.call()            
            //job.commit('UI creates and calls job') // mach jetzt das ui update
            // ist es richtig das hier nur änderungen innerhalb von job entstehen können?
            // wie ist das bei project load?
        })
    }

    view.onclick = e=> { e.stopPropagation(); attachJob() }
    view.style.fontSize = 12
    view.title = args.name
    return view
}

function autoJobButtonLineView(model)
{
    var view = document.createElement('div')
        view.className = 'autoJobButtonView'
        view.style.height = 16
        view.style.paddingRight = 10

    view.update = compositeUpdate({
        view:view,
        filter:(v, k)=> typeof v === 'function' &&
                        k != 'onCall'   && k != 'onCancel' &&
                        k != 'onUpdate' && k != 'onReturn',
        itemDelegate:(v, k)=>
        {
            return jobRootButon({
                name:k,
                args:{},
                src:v,
                obj:model,
                className:'jobButton-line',
                noIcons:true
            })
        }
    })
    view.update({ newMembers:model })
    model.on('change', view.update)
    return view
}

function autoJobButtonView(model)
{
    var view = document.createElement('div')
        view.className = 'autoJobButtonView'
        view.style.backgroundColor = config.colors.paperBorder
        view.style.height = 18
        view.style.paddingRight = 10
        view.style.borderStyle = 'none none solid none'
        view.style.borderWidth = 1;
        view.style.borderColor = '#f2f2f2'

    view.update = compositeUpdate({
        view:view,
        filter:(v, k)=> typeof v === 'function' &&
                        k != 'onCall'   && k != 'onCancel' &&
                        k != 'onUpdate' && k != 'onReturn',
        itemDelegate:(v, k)=>
        {
            view.style.paddingTop = 20
            view.style.paddingBottom = 14

            return jobRootButon({
                name:k,
                args:{},
                src:v,
                obj:model,
                noIcons:true
            })
        }
    })
    view.update({ newMembers:model })
    model.on('change', view.update)
    return view
}

// line ----------

function lineObjectView(name, model)
{
    return lineExpander(
    {
        model: model,
        expanded: name == 'subjobs',
        header: lineFrame(name, model /*nix, gar nix*/),
        contentFactory: ()=> autoViewLine(model)
    })
}

function autoViewLine(model)
{
    var view = document.createElement('div')
    view.className = 'autoLine'
    view.appender = viewCollection['appendView'](model)
    view.appendChild(view.appender)

    view.update = compositeUpdate({
        view:view,
        filter:v=> typeof v !== 'function',
        itemDelegate:(v, k)=>
        {
            var viewFactory = viewCollection[modelType(v) + 'View'] || lineObjectView
            return viewFactory(k.toString(), v)
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

// a3 ----------

function autoMultiView(model, viewsf)
{
    var view = document.createElement('div')
        var views = btab()
            viewsf.forEach((v, k, idx)=>
            {
                var currentView = viewsf[k](model)
                var viewName = currentView.classList.item(currentView.classList.length-1)
                views.add(viewName, { content:currentView })
            })
    view.appendChild(views)
    return view
}

function a3View(model)
{
    var contentDelegate = ()=> autoMultiView(model, [autoView])

    if (model.type == 'Model')
        //contentDelegate = ()=> systemGraphView(model)
        contentDelegate = ()=> autoMultiView(model, [autoView, systemGraphView])

    if (model.type == 'Project')
        contentDelegate = ()=> autoMultiView(model, [autoView, projectEdit])

    if (model.type == 'Job')
        contentDelegate = ()=> autoMultiView(model,
            [/*jobStateTreeView, jobStateGraphView, jobStateGantViewWithProgress,*/ jobPlot])

    if (model.type == 'Network')
        contentDelegate = ()=> autoMultiView(model, [autoView, systemView])

    if (modelType(model) == 'function')
        contentDelegate = ()=> autoMultiView(model, [autoView, codeEdit])

    if (model.type == 'Worker' ||
        model.type == 'Client' ||
        model.type == 'Server')
        contentDelegate = ()=> autoMultiView(model, [autoView, networkNodeView])

    if (model.type == 'PrimeArgs')
        contentDelegate = ()=>
            autoMultiView(model, [autoView, app.model.registry.views['primeParameterView'].ctor])

    if (model.type == 'PrimeResult')
        contentDelegate = ()=>
            autoMultiView(model, [autoView, app.model.registry.views['primeResultView'].ctor])

    if (model.type == 'Model3dArgs')
        contentDelegate = ()=>
            autoMultiView(model, [autoView, app.model.registry.views['model3dParameter'].ctor])

    if (model.type == 'model3dResultSet')        
        contentDelegate = ()=>
            autoMultiView(model, [autoView, app.model.registry.views['model3dResultSet'].ctor])

    if (model.type == 'CmdResult')
        contentDelegate = ()=>
            autoMultiView(model, [autoView, app.model.registry.views['cmdResult'].ctor])

    return a3expander({
        model:model,
        expanded:true,
        header:a3Frame(model),
        contentFactory:contentDelegate
    })
}

