var jf = jobFactory.jm()

var app = mvj.model('', {
    wsUrl: 'ws://' + document.location.hostname + ':' + config.server.wsport,
    clientId: 'unknown',
    model: {}
})

function rootJob(args)
{
    var jd = jf.job(args)
    app.update('model.jobs.'+jd.id, jd)
    return app.model.jobs[jd.id.valueOf()]
}

// called by GUI --------------------------------------------------------------------------

app.init = function()
{
    jf.jl = jl
    jf.workerId = undefined
    jf.nextFreeId = 0

    tj.jm = jf
    tj.config = config

    mvj.jm = jf

    sim.config = config.clientDefaultSimConfig

    app.clientId.on('change', function(changes)
    {
        jf.workerId = 'C' + Number(app.clientId).toSubscript()
        document.title = jf.workerId
        $('#thisId').text(jf.workerId)

        if (app.model.projects['↻'])
            rootJob({ onCall:j=> app.model.projects['↻'](j) }).call()
    })

    // network -----------------------------------------------------

    network.onConnectionChanged = app.onNetworkStateChange
    network.connect(app.wsUrl.valueOf())
    mvj.onCommit = function(path, diff)
    {
        if (network.isUp)
        {
            var msg = messages.networkInfoMsg(path, diff)
            var channelMsg = messages.channelMsg('Ws', msg)
            network.server.send(channelMsg)

            sim.log('app', 'log', '⟶', msg)
        }
        else
        {
            // todo:
        }
    }

    // end network -----------------------------------------------------

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
                    '⤑🐼': project('../../projects/serverBakk.js'),
                    '⤑💢': project('../../projects/serverFragmentFolder.js'),
                    '⤑❄':  project('../../projects/model3d.js'),
                    '⤑ℙ':  project('../../projects/primeCpp.js'),
                    '⤑🖥':  project('../../projects/serverWorkers.js'),
                    '⤑💻': project('../../projects/serverCmd.js'),
                    '⤑📂':  project('../../projects/serverFolder.js'),
                    '⤑🗩': project('../../projects/serverOuput.js'),
                    '❄':   project('../../projects/localSetIteration.js'),
                    '↷':   project('../../projects/localAjax.js'),
                    '🗩':  project('../../projects/localOutput.js'),
                })
                j.ret('ok', 'all projects created')
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
            //div.insertBefore(a3View(app.model.network), div.firstChild)
            div.appendChild(a3View(app.model.network))
    })

    $('#modelTab')[0].add('🌐', { content:div })
    $('#jobTab')[0].add('⥂', { content:a3View(app.model.jobs) })
}

// called by Net --------------------------------------------------------------------------

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

app.onMessage = function(c, parsed)
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

        onJobMessage: (c, parsed)=>
        {
            sim.log('job', 'log', '⟵', parsed)
            jf.onReceive(c, parsed, code=> eval(code), app)
        }

    }['on'+parsed.type+'Message'](c, parsed.payload)
}
