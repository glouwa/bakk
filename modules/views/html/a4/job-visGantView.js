function jobStateGantViewWithProgress(jobModel)
{
    var view = document.createElement('div')
        view.className = 'progress+gant'
        var pv = jobStateWithLogView(jobModel, jpViewFactory({ caption:false, log:true, width:'100%' }))
            pv.style.display = 'inline-block'
            pv.style.width = '100%'
            pv.style.margin = '32 0 -21 0'
        view.appendChild(pv)
        var gv = jobStateGantView(jobModel)
            gv.style.display = 'inline-block'
            gv.style.width = '100%'
            view.appendChild(gv)

    return view
}



function jobStateGantView(jobModel)
{
    var items = new vis.DataSet()
    var groups = new vis.DataSet()
    groups.add({ id:'?', content:'' })

    function addJob(jm)
    {
        var debug = jm.debugRemote ? jm.debugRemote : jm.debug
        var subgroup = debug.node ? debug.node.valueOf() : '?'
        var group = debug.host ? debug.host.valueOf() : '??'

        group += ' - ' + subgroup
        if (groups.get(group) == null)
            groups.add({ id:group, content:group })

        var bgColor = hexToRgb(config.getColor(jm.state), 0.8)
        var startTime = debug.callTime?new Date(debug.callTime.valueOf()):new Date()
        var endTime = debug.lastModification?new Date(debug.lastModification.valueOf()):undefined

        items.add({
            id:jm.path.valueOf(),
            model:jm,
            group:group,
            subgroup:subgroup,
            start:startTime,
            end:endTime,
            style:'background-color: '+bgColor+';' + 'border-color: '+config.getColor(jm.state)+';',
        })

        jm.state.on('change', function(changes)
        {
            var debug = jm.debugRemote ? jm.debugRemote : jm.debug
            var subgroup = debug.node ? debug.node.valueOf() : '?'
            var group = debug.host ? debug.host.valueOf() : '??'

            group += ' - ' + subgroup
            if (groups.get(group) == null)
                groups.add({ id:group, content:group })

            var bgColor = hexToRgb(config.getColor(jm.state), 0.8)
            var startTime = debug.callTime?new Date(debug.callTime.valueOf()):new Date()
            var endTime = debug.lastModification?new Date(debug.lastModification.valueOf()):undefined
            var stateColor = config.getColor(jm.state)

            items.update({
                id:jm.path.valueOf(),
                group:group,
                subgroup:subgroup,
                //start:startTime,
                end:endTime,
                style:'background-color: '+bgColor+';' + 'border-color: '+stateColor+';',
            })

            items.add({
                //id:jm.path.valueOf(),
                group:group,
                subgroup:subgroup,
                //start:startTime,
                start:new Date(),
                //style:'background-color: '+bgColor+';' + 'border-color: '+stateColor+';',
                type:'point',
                //style:'border-color: '+stateColor+';',
                style:'border-color:red;',
            })

            gView.timeline.fit()
            console.debug('############## gant update jobstate ' + jm.path)
        })


        console.debug('############## gant adding job ' + jm.path)

        if (gView)
            gView.timeline.fit()
    }

    function updateSubjobs(changes)
    {
        if (changes.newMembers)
            changes.newMembers.forEach(function(v, k, idx)
            {
                var pp1 = v.path.substr(0, v.path.lastIndexOf('.'))
                var parentPath = pp1.substr(0, pp1.lastIndexOf('.'))

                addJob(v)

                if (!v.isLeafType)
                {
                    updateJob({ newMembers:v }, v.path)
                    v.on('change', updateJob)
                }
                gView.timeline.fit()
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
        view.className = 'jobStateGantView'
        var gView = document.createElement('div')
            gView.timeline = new vis.Timeline(view, items, groups, {
            groupOrder: 'content',
            stack:true/*, throttleRedraw:1000*/,

        })
        var aView = undefined

    view.appendChild(gView)
    gView.timeline.on("select", function (params)
    {
        if (aView)
        {
            view.removeChild(aView)
            aView = undefined
        }

        if (params.items[0])
        {
            aView = autoView(items.get(params.items[0]).model)
            aView.style.borderStyle = 'dashed none none none'
            aView.style.borderWidth = 1;
            aView.style.borderColor = '#B0B0B0'
            view.appendChild(aView)
        }
    })

    addJob(jobModel)

    updateJob({ newMembers:jobModel }, jobModel.path)
    jobModel.on('change', updateJob)
    return view
}
