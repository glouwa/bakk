var jf = jff.jm()

function onInit() {
    app.clientId.on('change', changes=> {
        jf.workerId = 'C' + Number(app.clientId).toSubscript()
        jf.host = 'Browser'
        document.title = jf.workerId
        $('#thisId').text(jf.workerId)
    })

    mvj.onCommit = function(path, diff) {
        /*if (network.connections[0]) {
            var msg = messages.networkInfoMsg(path, diff)
            var channelMsg = messages.channelMsg('Ws', msg)
            node: network.connections[0].send(channelMsg)

            sim.log('app', 'log', '⟶', msg)
        }
        else{
            // todo:
        }*/
    }

    app.registry.merge({
        config:config,
        views:viewCollection
    })

    app.merge({
        wsMessageHandlers:{
            onServerHallo: (c, parsed)=> {
                app.merge(parsed.diff) // pull
                app.commit('got my id')

                var mynodeInfo = {
                  type:'Client',
                  id:jf.workerId,
                  capabilitys:['JS'],
                  simconfig:config.clientDefaultSimConfig,
                  osType:'Browser',
                  hostname:''
                }

                var networkInfo = { [app.clientId]:mynodeInfo }

                app.model.network.merge(networkInfo)
                sim.config = app.model.network[app.clientId.valueOf()].simconfig
                app.commit('network += my properties')

                // todo: überleg da was besseres
                var msg = messages.networkInfoMsg('model.network.' + app.clientId, mynodeInfo)
                var channelMsg = messages.channelMsg('Ws', msg)
                network.connections[0].send(channelMsg)
            },
            onNetworkInfo: (c, parsed)=> app.mergePath(parsed.path, parsed.diff),
            onReload:      (c, parsed)=> location.reload(true)
        },
        networkStateChangeHandlers:{
            onConnecting:()=>{
                $('#thisId').text()
                $('#connectionState').text('Auto reconnect to ' + app.wsUrl.valueOf()+ ' ⇄')
            },
            onConnected:()=>{
                $('#thisId').text('Connected')
                $('#connectionState').text('Connected to ' + app.wsUrl.valueOf())
                $('#connectionDate').text('since ' + new Date())
                app.model.merge({ network:networkType() })
            },
            onDisconnected:()=>{
                $('#thisId').text('')
                $('#connectionState').text('Disconnected')
                $('#connectionDate').text('')
                app.model.merge({ network:'deadbeef' })
            }
        }
    })

    app.commit('ui needs model')

    $('#modelTabPaper').append(tab('modelTab'))
    $('#jobTabPaper').append(tab('jobTab'))
    //$('#modelTab')[0].add('☍', { content:a3View(app.model) })

    var projectsDiv = document.createElement('div')
    projectsDiv.appendChild(a3View(app.model.projects))
    app.model.on('change', changes=> {
      if (changes.newMembers && changes.newMembers.network)
          projectsDiv.appendChild(a3View(app.model.network))

      if (changes.deletedMembers && changes.deletedMembers.network)
          projectsDiv.removeChild(projectsDiv.childNodes[1])
    })
    $('#modelTab')[0].add('☍', { content:a3View(app) })
    $('#modelTab')[0].add('🌐', { content:projectsDiv })
    $('#jobTab')  [0].add('⥂', { content:a3View(app.model.jobs) })

    network.connect(app.wsUrl.valueOf())
}

