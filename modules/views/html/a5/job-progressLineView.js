


// das ding transformiert ein model
// in dem fall wird der origin aus den subjobs abgeleitet
//
// der content erhält dann change event mit model und den neuen daten ~
function jobStateWithLogView(jobModel, contentFactory)
{
    var view = document.createElement('div')
        view.className = 'jobStateWithLog'
        var jobState = contentFactory()
        var jobLog = jobLogView()
            jobLog.id = 'j' + jobModel.id + 'jobLog'

    jobState.onclick = function()
    {
        $('.jobLog').not('#'+jobLog.id).hide()
        $('#'+jobLog.id).toggle()
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
