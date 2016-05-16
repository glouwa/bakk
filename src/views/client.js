var jf = jobFactory.jm()

var app = mvj.model('', {
    wsUrl: 'ws://' + document.location.hostname + ':' + config.server.wsport,
    clientId: 'unknown',
    model: {}
})

function rootJob(args)
{
    // todo: use this in view.createRootJob
    args.isRoot = true
    var jd = jf.job(args)
    app.update('model.jobs.'+jd.id, jd)
    return app.model.jobs[jd.id.valueOf()]
}

// called by GUI --------------------------------------------------------------------------

app.init = function()
{
    sim.config = config.clientDefaultSimConfig

    // nicht hin schaun
    jf.jl = jl
    jf.workerId = undefined
    jf.nextFreeId = 0
    tj.jm = jf
    tj.config = config
    mvj.jm = jf

    app.clientId.on('change', function(changes)
    {
        jf.workerId = 'C' + Number(app.clientId).toSubscript()
        document.title = jf.workerId
        $('#thisId').text(jf.workerId)

        if (app.model.projects['↻'])
        {
            rootJob({ desc:'cidChange.↻:', onCall:j=> app.model.projects['↻'](j) }).call()
            console.assert();
        }
    })

    // network -----------------------------------------------------

    network.onMessage = app.onMessage
    network.onConnectionChanged = app.onNetworkStateChange
    network.connect(app.wsUrl.valueOf())
    mvj.onCommit = function(path, diff)
    {
        if (network.connections[0])
        {
            var msg = messages.networkInfoMsg(path, diff)
            var channelMsg = messages.channelMsg('Ws', msg)
            node: network.connections[0].send(channelMsg)

            sim.log('app', 'log', '⟶', msg)
        }
        else
        {
            // todo:
        }
    }

    // projects ----------------------------------------------------

    app.model.update({
        type: 'Model',
        jobs: { type:'Set<Job>' },
        store: { type:'Store' },
        projects: // fileset(path, 'Set<Project>', (filename)=> project(filename))
        {
            type:'Set<Project>',
            '↻': function(j)
            {
                this.update({
                    '↻': 'deadbeef',
                    '✕': function free(j) {},
                    '🐼 Process fragment folder on workers':     project('../../projects/workerBacc0.js'),
                    '🐁 Process empty job':                      project('../../projects/workerBacc1.js'),
                    '💢 Show fragment folder':                   project('../../projects/serverFragmentFolder.js'),
                    '❄ Find similar 3d models on worker':        project('../../projects/workerModel3d.js'),
                    'ℙ Find prime numbers with C++ on workers':  project('../../projects/workerPrimeCpp.js'),
                    '🖥 Run some workers on server':              project('../../projects/overlordWorkers.js'),
                    '☠ Kill sys':                       project('../../projects/workerKill.js'),
                    '💻 Spawn process on server':       project('../../projects/serverCmd.js'),
                    '📂 Show server folder':             project('../../projects/serverFolder.js'),
                    '🗩 Generate some output at server': project('../../projects/serverOutput.js'),
                    '❄ Find similar 3d models locally':  project('../../projects/localSetIteration.js'),
                    '↷ Multiple AJAX calls loaclly':    project('../../projects/localAjax.js'),
                    '🗩 Generate some output locally':  project('../../projects/localOutput.js'),
                })
                j.ret('ok', '+11 projects')
            }
        },
        registry:
        {
            type:'Registry',
            config: config,
            views: viewCollection,
            types: { type:'Set<Type>' }
        },
    })

    $('#modelTabPaper').append(tab('modelTab'))    
    $('#projectTabPaper').append(tab('projectTab'))
    $('#jobTabPaper').append(tab('jobTab'))

    $('#modelTab')[0].add('☍', { content:a3View(app.model) })

    var div = document.createElement('div')
    div.appendChild(a3View(app.model.projects))
    app.model.on('change', changes=>
    {
        if (changes.newMembers && changes.newMembers.network)
            div.appendChild(a3View(app.model.network))

        if (changes.deletedMembers && changes.deletedMembers.network)
            div.removeChild(div.childNodes[1])
    })

    $('#modelTab')[0].add('🌐', { content:div })
    $('#jobTab')[0].add('⥂', { content:a3View(app.model.jobs) })
}

// called by Net --------------------------------------------------------------------------

app.onMessage = function(c, parsed, pduSize)
{
    var channelHandlers =
    {
        onWsMessage: (c, parsed)=>
        {
            sim.log('app', 'log', '⟵', parsed)
            var messageHandlers =
            {
                onServerHallo: (c, parsed)=> {
                    app.update(parsed.diff)

                    var mynodeInfo = {
                        type: 'Client',
                        id: jf.workerId,
                        capabilitys: ['JS'],
                        simconfig: config.clientDefaultSimConfig,
                        osType: 'Browser',
                        hostname: ''
                    }                    

                    app.commit('model.network.' + app.clientId, mynodeInfo)
                    sim.config = app.model.network[app.clientId.valueOf()].simconfig
                },

                onNetworkInfo: (c, parsed)=> app.update(parsed.path, parsed.diff),
                onReload:      (c, parsed)=> location.reload(true)

            }['on'+parsed.type](c, parsed)
        },

        onJobMessage: (c, parsed, pduSize)=>
        {
            sim.log('job', 'log', '⟵', pduSize, parsed)
            jf.onReceive(c, parsed, code=> eval(code), app, pduSize)
        }

    }['on'+parsed.type+'Message'](c, parsed.payload, pduSize)
}

app.onNetworkStateChange = function(state, connection)
{
    var functionOfState =
    {
        onConnecting:()=>
        {
            $('#thisId').text()
            $('#connectionState').text('Auto reconnect to ' + app.wsUrl.valueOf()+ ' \u21c4')
        },
        onConnected:()=>
        {
            $('#thisId').text('Connected')
            $('#connectionState').text('Connected to ' + app.wsUrl.valueOf())
            $('#connectionDate').text('since ' + new Date())
            app.model.update({ network:networkType() })
        },
        onDisconnected:()=>
        {
            $('#thisId').text('')
            $('#connectionState').text('Disconnected')
            $('#connectionDate').text('')
            app.model.update({ network:'deadbeef' })
        }

    }['on'+state]()
}
