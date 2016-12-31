var jf = jff.jm()
/*
model{
    registry:{
        views: some default, some loaded with project
        types: some default, some loaded with project
        jobs: some default, some loaded with project
        workflows: loaded with project?
        config: bound to file
    }
    model:{
        jobs: dynamic / log
        store: bound to folder
        projects: bound to folder
        network: dynamic
    }
}
*/
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
        types:{
            'Folder':Folder,
            'Folder<Mod>':ModuleFolder,
            'File<Mod>':FileMod,
            'Set<View>':ViewSet
        }
    })

    app.registry.merge({
        config:config,
        views:{            
            primitiveBound:{
                type:'Folder<Mod>',
                directory:'./modules/views/html/primitive/'
           }
       }
    })

    app.merge({
        wsMessageHandlers:{
            onServerHallo: (c, parsed)=> {
                app.merge(parsed.diff)  // pull
                app.commit('got my id') // für logging

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

                // server die eigene id bekannt geben
                // todo: überleg da was besseres
                var msg = messages.networkInfoMsg('model.network.' + app.clientId, mynodeInfo)
                var channelMsg = messages.channelMsg('Ws', msg)
                network.connections[0].send(channelMsg)

                // jobs ready to use?

                $('#modelTabPaper').append(tab('modelTab'))
                $('#jobTabPaper').append(tab('jobTab'))

                //load basic modules with ajax
                app.callUiJob({
                    desc:'load primitives',                    
                    params:{},
                    output:app.registry.views.primitiveBound,
                    onCall:j=> app.registry.views.primitiveBound['↻'](j),
                })

                setTimeout(()=> {

                    var initJ = app.model.jobs[jf.workerId + '\u208B' + Number(0).toSubscript()]
                    $('#jobTab')[0].add(initJ.id, { content:jobAllView(initJ) })

                    var projectsDiv = document.createElement('div')
                    projectsDiv.appendChild(a3View(app.model.mods))
                    projectsDiv.appendChild(a3View(app.model.network))

                    app.model.on('change', changes=> {
                        if (changes.newMembers && changes.newMembers.network)
                            projectsDiv.appendChild(a3View(app.model.network))

                        if (changes.deletedMembers && changes.deletedMembers.network)
                            projectsDiv.removeChild(projectsDiv.childNodes[1])
                    })

                    $('#modelTab')[0].add('☍', { content:a3View(app) })
                    $('#modelTab')[0].add('🌐', { content:projectsDiv })
                    $('#jobTab')  [0].add('⥂', { content:a3View(app.model.jobs) }, 'inBg')
                },200)
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



    network.connect(app.wsUrl.valueOf())
}

