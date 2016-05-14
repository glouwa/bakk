function jobStateGraphView(jobModel)
{
    var jobStateGraphConfig = {
        //autoResize: true,
        nodes: {
            shape:'dot',
            //size:25
        },
        layout: {
            hierarchical: {
                sortMethod: 'directed',
                direction: 'UD',
                blockShifting: false,
                edgeMinimization: false,
                levelSeparation:150
                //nodeSpacing:500

            }
        },
        physics: false,
        interaction: {
            hover: true,
            navigationButtons: true
        },
        height: '100',
        width: '100%'
    }

    var deviceColorMap = {
        'C':'rgba(241, 241, 7, 0.95)',
        'W':'rgba(176, 141, 130, 0.7)',
        'S':'rgba(123,225,65,0.7)'
    }

    var data = { nodes: new vis.DataSet([]), edges: new vis.DataSet([]) }
    data.nodes.add({
        id:jobModel.path.valueOf(),
        //label:jobModel.id.valueOf(),
        model:jobModel,
        font: {size:'32'},
        //borderWidth:2
    })
    jobModel.state.on('change', function(changes)
    {
        data.nodes.update({
            id:jobModel.path.valueOf(),
            color:config.getColor(jobModel.state),
            /*color:{
                background:config.getColor(jobModel.state),
                border:deviceColorMap[jobModel.state.lastWorker.valueOf().charAt(0)]
            }*/
        })
    })

    function updateSubjobs(changes)
    {
        if (changes.newMembers)
            changes.newMembers.forEach(function(v, k, idx)
            {                
                var pp1 = v.path.substr(0, v.path.lastIndexOf('.'))
                var parentPath = pp1.substr(0, pp1.lastIndexOf('.'))

                data.nodes.add({
                    id:v.path.valueOf(),
                    model:v,
                    font: {size:'32'},
                    color:config.getColor(v.state),
                    //borderWidth:2,
                    /*color:{
                        background:config.getColor(v.state),
                        border:deviceColorMap[v.state.lastWorker.valueOf().charAt(0)]
                    }*/
                })
                data.edges.add({
                    from:parentPath.valueOf(),
                    to:v.path.valueOf(),
                    color:'#848484'
                })

                v.state.on('change', function(changes)
                {
                    data.nodes.update({
                        id:v.path.valueOf(),
                        color:config.getColor(v.state),
                        /*color:{
                            background:config.getColor(v.state),
                            border:deviceColorMap[v.state.lastWorker.valueOf().charAt(0)]
                        }*/
                    })
                })

                if (!v.isLeafType)
                {
                    updateJob({ newMembers:v }, v.path)
                    v.on('change', updateJob)
                }
                gView.network.fit()
            })
    }

    function updateJob(changes, nodeId)
    {
        if (changes.newMembers)
            if (changes.newMembers.subjobs)
            {
                updateSubjobs({ newMembers:changes.newMembers.subjobs })
                changes.newMembers.subjobs.on('change', updateSubjobs)
            }
    }

    var view = document.createElement('div')
        //view.style.borderStyle = 'dashed none none none'
        //view.style.borderWidth = 1;
        //view.style.borderColor = '#B0B0B0'
        view.classList.add('graphView')
        var progressTree = jobStateTreeView(jobModel)
        var gView = onlyGraphView(jobModel, data, jobStateGraphConfig)
            gView.style.marginTop = -15
            gView.style.marginBottom = 5
        var aView = undefined

    view.appendChild(progressTree)
    view.appendChild(gView)

    gView.network.on("select", function (params)
    {
        if (aView)
        {
            view.removeChild(aView)
            aView = undefined
        }

        if (params.nodes[0])
        {
            aView = autoView(data.nodes.get(params.nodes[0]).model)
            aView.style.borderStyle = 'dashed none none none'
            aView.style.borderWidth = 1;
            aView.style.borderColor = '#B0B0B0'
            view.appendChild(aView)
        }
    })

    updateJob({ newMembers:jobModel }, jobModel.path)
    jobModel.on('change', updateJob)
    return view
}

function jobStateTreeView(jobModel)
{
    //var jobAndSubjobsView2 =(l)=> jobAndSubjobsView(jobModel, l)

    function jobAndSubjobsView(jobModel, l)
    {
        var view = document.createElement('div')
            view.className = 'jobAndSubjobs'
            var header = jobStateWithLogView(jobModel, l)
            var subjobs = undefined

        view.update = function(changes)
        {
            if (l < 2)
                if (changes.newMembers.subjobs)
                {
                    console.assert(!subjobs)
                    subjobs = listView(jobModel.subjobs, (v, k)=> jobAndSubjobsView(v, l+1), 'subjobs') // RECURSION
                    view.appendChild(subjobs)
                }
        }

        view.update({ newMembers:jobModel })
        jobModel.on('change', view.update)
        view.appendChild(header)
        return view
    }

    var view = document.createElement('div')
        view.className = 'jobStateTreeView'
        var treeRoot = jobAndSubjobsView(jobModel, 0)
            treeRoot.style.padding = '20 0'
    view.appendChild(treeRoot)
    return view
}

function jobStateWithLogView(jobModel, level)
{
    var view = document.createElement('div')        
        view.className = 'jobStateWithLog'
        var jobState = jobStateView(level)
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

        console.assert(keys.length <= 1, 'jdiff.subjobs.keys.lenght > 1 (multi orgin) ' + keys)

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

function jobStateView(level)
{
    var view = document.createElement('div')
        view.className = 'jobState'
        var caption = document.createElement('div')
            caption.style.float = 'left'
            caption.innerText = Number(level).toSubscript()
        var progress = document.createElement('div')
            progress.className = 'progress'
        var lastworker = document.createElement('div')
            lastworker.className = 'lastWorker'
        var lastlog = document.createElement('div')
            lastlog.className = 'lastLog'
        var state = document.createElement('div')
            state.className = 'state'
            state.innerText = 'no events observed'

    view.addEvent = function(jobModel, origin)
    {
        progress.addBlock(jobModel, origin)

        lastworker.innerText = (''+jobModel.state.lastWorker)!= 'undefined'?''+jobModel.state.lastWorker:'-'
        lastlog.innerText = jobModel.state.log//.valueOf()
        state.innerText = config.getIcon(jobModel.state)
    }

    progress.addBlock = function(jobModel, origin)
    {
        var color = config.getColor(origin.model.state)
        var prevProgress = progress.prevP
        progress.prevP  = jobModel.state.progress.valueOf()

        //console.debug(prevProgress, ' - ', progress.prevP, color)

        var left = prevProgress ? prevProgress * 130 : 0
        var width = Math.ceil(jobModel.state.progress.valueOf() * 130) - left

        var logBlock = document.createElement('div')
        logBlock.className = 'search-progress-block'
        logBlock.style.backgroundColor = color
        logBlock.style.left = Math.floor(left)
        logBlock.style.width = Math.ceil(width)
        progress.appendChild(logBlock)
    }

    //view.appendChild(caption)
    view.appendChild(progress)
    view.appendChild(lastworker)
    view.appendChild(lastlog)
    view.appendChild(state)
    return view
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
