function autoView(model)
{
    var view = document.createElement('div')
        view.classList.add('auto')
        //var treeRoot = autoViewLine(model)
        var treeRoot = app.core.views.line.query('object-auto')(model)
            treeRoot.style.padding = '20 0'
        view.appendChild(treeRoot)
    return view
}

function a3Frame(model)
{
    var view = document.createElement('div')
        view.className = 'a3Frame'
        view.style.backgroundColor = config.colors.paperBorder
        //view.draggable = true
        //view.ondragstart = ev=> onDragStart(ev, model)
        var n = model.path.valueOf().charAt(0).toUpperCase() + model.path.valueOf().slice(1)
        var name = document.createElement('div')
            name.innerText = n
            name.style.float = 'left'
            name.style.color = '#00ab56'// 'lightgray'
            name.style.margin = '4 10 3 5'
            //name.style.color = 'rgba(0, 204, 102, 0.8)'
            //name.style.color = '#ddd'
            name.style.fontSize = 9

    //appendObjInfo(view, model)

        var type = document.createElement('div')
            type.innerText = modelType(model)
            type.style.float = 'right'
            type.style.color = '#969696'//'#ddd'
            type.style.margin = '4 12 3 2'
            type.style.fontSize = 9
        var desc = document.createElement('div')
            desc.innerText = model.desc ? model.desc.valueOf() : ''
            desc.style.float = 'left'
            desc.style.clear = 'left'
            desc.style.marginTop = 4
            desc.style.marginLeft = 6
            desc.style.fontSize = '1em'
            desc.style.fontStyle = 'italic'
            desc.style.fontWeight = '800'
            desc.style.color = '#1FBF6F'
        var header = null
            if (modelType(model) == 'Job'){
                header = document.createElement('div')
                header.className = 'autoJobButtonView'

                header.style.width = '100%'
                header.appendChild(app.core.views.primitive.query('Job')(model))
            }
            else
                header = app.core.views.primitive.query('object',1)(model)

        view.appendChild(name)
        view.appendChild(type)
        view.appendChild(header)
    return view
}

function a3expander(args) // { header, conetentFactory, model, expanded } : onheaderClick -> conetentFactory()
{
    var h = args.header
    var c = undefined

    function getContent()
    {
        if (c) return c

        c = args.contentFactory()
        content.appendChild(c)

        if (args.model && args.model['↻'])
            app.callUiJob({
                icon:'↻',
                desc:'expand a3-6',
                onCall:j=> args.model['↻'](j),
                params:{},
                output:args.model
        })
        return c
    }

    var view = document.createElement('div')
        view.className = 'a3expander'
        view.expanded = args.expanded
        view.draggable = true
        view.ondragstart = ev=> onDragStart(ev, args.model)
        var content = document.createElement('div')
            content.className = 'a3expanderContent'
            content.style.backgroundColor = 'white'
            content.style.display = 'flex'
            content.style.flexDirection = 'column'
            content.style.flexGrow = 1
            //content.style.display = 'inline-block'
            //content.style.width = '100%'

    h.onclick = function toggle() // open/close fehlt
    {
        view.expanded = !view.expanded
        view.update()
    }

    view.update = function()
    {
        if (view.expanded)
            getContent()

        //content.style.display = view.expanded ? 'block' : 'none'
        content.style.display = view.expanded ? 'flex' : 'none'
    }
    view.update()

    view.appendChild(h)
    view.appendChild(content)
    return view
}

// das ding transformiert ein model
// in dem fall wird der origin aus den subjobs abgeleitet
//
// der content erhält dann change event mit model und den neuen daten ~
function jobProgressWithLogView(jobModel, contentFactory)
{
    function jobLogView(jobModel, originChain)
    {
        var jobLog = document.createElement('ul')
            jobLog.className = 'jobLog'
            jobLog.openTime = new Date()

        jobLog.addEvent = function(jobModel, originChain)
        {
           var li = document.createElement('li')
            function insertHop(hj)
            {
                var head = document.createElement('div')
                head.innerText = hj.id.valueOf()
                head.className = 'head'
                head.title = hj.id.valueOf() + ':\n' + JSON.stringify(hj.state, null, 4)
                head.style.borderLeftColor = config.getColor(hj.state)
                li.appendChild(head)
            }

            for (var k in originChain)
                insertHop(originChain[k].model)

            var originJob = originChain[originChain.length-1].model

            var logText = document.createElement('div')

            logText.innerText = (originJob.state.lastWorker||'-')  + ' ' + originJob.state.log
            logText.className = 'logText'

            var logState = document.createElement('div')
            logState.innerText = config.getIcon(originJob.state)
            logState.className = 'logText'
            logState.style.float = 'right'

            var logProgress = document.createElement('div')
            logProgress.innerText = jobModel.state.progress.valueOf().toFixed(2)
            logProgress.className = 'logText'
            logProgress.style.float = 'right'

            var logTime = document.createElement('div')
            logTime.innerText = new Date() - jobLog.openTime
            logTime.className = 'logText'
            logTime.style.float = 'right'

            li.appendChild(logTime)
            li.appendChild(logProgress)
            li.appendChild(logText)
            li.appendChild(logState)
            jobLog.appendChild(li)
        }
        return jobLog
    }

    var view = document.createElement('div')
        view.className = 'jobProgressWithLog'
        var jobState = contentFactory()
        var jobLog = jobLogView()
            var jidOhneSubscript = String(jobModel.id).removeSubscript()
            //var jidOhneSubscript = String(jobModel.id)
            var jobLogid = 'j' + jidOhneSubscript + 'jobLog'
            jobLog.classList.add(jobLogid)
            //jobLog.style.display = 'block'

    jobState.onclick = function()
    {
        //$('.jobLog:not(.'+jobLogid+')').hide()
        //$('.'+jobLogid).toggle()
        //$('#'+jobLog.id)[0].style.display = 'block'
        //jobLog.style.display = 'block'
    }

    function getOrgin(current)
    {
        if (!current.diff || !current.diff.subjobs)
            return

        var keys = Object.keys(current.diff.subjobs)

        if (keys.length == 0)
            return

        //console.warn(keys.length <= 1, 'jdiff.subjobs.keys.lenght > 1 (multi orgin) ' + keys)

        return { model:current.model.subjobs[keys[0]], diff:current.diff.subjobs[keys[0]] }
    }

    view.update = function(changes)
    {
        //console.log('v-' + jobModel.id + ' update')
        //console.log(jobModel.id.valueOf(), s2s(jobModel.state))

        var originChain = []
        var origin = { model:jobModel, diff:changes.diff }
        originChain.push(origin)

        do
        {
            var test = getOrgin(origin)
            if (test)
            {
                origin = test
                originChain.push(origin)
            }
        }
        while (test)

        // assert( orginChain contains no undefineds, origin points to last chain element )

        jobState.addEvent(jobModel, origin)
        jobLog.addEvent(jobModel, originChain, origin)
    }

    view.update({ newMembers:jobModel })
    jobModel.on('change', view.update)

    view.appendChild(jobState)
    view.appendChild(jobLog)
    return view
}

//jpViewFactory({ caption:false, log:true, width:'100%', level:level })
//jpViewFactory({ caption:true,  log:true, width:'130',  level:level })

function jpViewFactory(args)
{
    args.progress = args.progress === undefined || true
    return function jobStateView()
    {
        var view = document.createElement('div')
            view.className = 'jobState'
            if (args.level) {
                var caption = document.createElement('div')
                    caption.style.float = 'left'
                    caption.innerText = Number(args.level).toSubscript()
                view.appendChild(caption)
            }
            if (args.progress) {
                var progress = document.createElement('div')
                    progress.className = 'progress'
                    progress.style.width = args.width
                    progress.style.height = args.height = 12
                    progress.style.position = 'relative'
                    view.appendChild(progress)
            }
            if (args.caption) {
                var lastworker = document.createElement('div')
                    lastworker.className = 'lastWorker'
                var lastlog = document.createElement('div')
                    lastlog.className = 'lastLog'
                var state = document.createElement('div')
                    state.className = 'state'
                    state.innerText = 'no events observed'
                view.appendChild(lastworker)
                view.appendChild(lastlog)
                view.appendChild(state)
            }

        view.addEvent = function(jobModel, origin)
        {
            progress.addBlock(jobModel, origin)
            //lastworker.innerText = (''+jobModel.state.lastWorker)!= 'undefined'?''+jobModel.state.lastWorker:'-'

            if (args.caption) {
                var locationInfo = ''
                if (jobModel.debug)        locationInfo += jobModel.debug.node.valueOf()
                if (jobModel.debugRemote)  locationInfo +=  ' ↷ ' + jobModel.debugRemote.node.valueOf()

                lastworker.innerText = locationInfo
                lastlog.innerText = jobModel.state.log//.valueOf()
                state.innerText = config.getIcon(jobModel.state)
            }
        }

        progress.addBlock = function(jobModel, origin)
        {
            var color = config.getColor(origin.model.state)
            var prevProgress = progress.prevP
            progress.prevP  = jobModel.state.progress.valueOf()

            //console.debug(prevProgress, ' - ', progress.prevP, color)
/*
            var width = 130 //args.width
            var left = prevProgress ? prevProgress * width : 0
            var width = Math.ceil(jobModel.state.progress.valueOf() * width) - left

            var logBlock = document.createElement('div')
            logBlock.className = 'search-progress-block'
            logBlock.style.backgroundColor = color
            logBlock.style.left = Math.floor(left)
            logBlock.style.width = Math.ceil(width)
*/
            var p = jobModel.state.progress.valueOf()
            var pP = prevProgress ? prevProgress : 0

            var logBlock = document.createElement('div')
            logBlock.className = 'search-progress-block'
            logBlock.style.backgroundColor = color
            logBlock.style.left = pP*100 + '%'//Math.floor(left)
            logBlock.style.width = (p - pP)*100 + '%' //Math.ceil(width)

            progress.appendChild(logBlock)
        }

        return view
    }
}

