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
    mvj.jm = jf

    sim.config = config.clientDefaultSimConfig

    app.clientId.on('change', function(changes)
    {
        jf.workerId = 'C' + Number(app.clientId).toSubscript()
        document.title = jf.workerId
        $('#thisId').text(jf.workerId)

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
            '↻': function(j) // muss ein service sein wegen timeout ! nein, params.config narchträglich setzen!
            {
                this.update({
                    '↻': 'deadbeef',
                    '✕': function free(j) {},
                    '🗩': project('../../projects/localOutput.js'),
                    '↷': project('../../projects/localAjax.js'),
                    '❄': project('../../projects/localSetIteration.js'),
                    '⤑🗩': project('../../projects/serverOuput.js'),
                    '⤑🖥': project('../../projects/serverWorkers.js'),
                    '⤑❄': project('../../projects/model3d.js'),
                    '⤑ℙ': project('../../projects/primeCpp.js'),
                    '⤑📂': project('../../projects/serverFolder.js'),
                    '⤑💻': project('../../projects/serverCmd.js'),
                    '⤑💢': project('../../projects/serverFragmentFolder.js'),
                    '⤑🐼': project('../../projects/serverBakk.js') //⌨
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
        '++client':function(j)
        {
            window.open('./view.html', '_blank')
            j.ret('ok', "window.open('./view.html', '_blank') called")
        },
        '++worker':function(j)
        {
            j.params.amount = 4
            j.delegateToSequence(
                ()=> jf.job({ onCall:sj=> app.model.projects['⤑🖥']['↻'](sj) }),
                ()=> jf.job({ onCall:sj=> app.model.projects['⤑🖥'].service.src(sj), params:j.params })
            )
        },
        '↻ server':function(j)
        {
            j.delegateToOne({ job:()=> jf.remoteProxyJob({
                args: j.params,
                node: network.server,
                realJob: js=> {
                    js.ret('ok', 'will exit now')
                    process.exit(0)
                }
            })})
        },
        '↻ clients':function(j)
        {
            var msg = messages.reloadMsg()
            var channelMsg = messages.channelMsg('Ws', msg)
            network.server.send(channelMsg)
            j.ret('ok', 'reload message sent')
        },
    })

    $('#modelTabPaper').append(tab('modelTab'))    
    $('#projectTabPaper').append(tab('projectTab'))
    $('#jobTabPaper').append(tab('jobTab'))

    $('#modelTab')[0].add('☍', { content:a3View(app.model) })
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
            app.model.update({ network:{ type:'Network' }})
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
        onWsMessage: function(c, parsed)
        {
            sim.log('app', 'log', '⟵', parsed)

            var messageHandlers =
            {
                onServerHallo: function(c, serverHallo) {
                    app.update(serverHallo.diff)

                    var mynodeInfo = {
                        type: 'Client',
                        id: jf.workerId,
                        capabilitys: ['JS'],
                        simconfig: config.clientDefaultSimConfig
                    }                    

                    app.commit('model.network.'+app.clientId, mynodeInfo)
                    sim.config = app.model.network[app.clientId.valueOf()].simconfig
                },

                onNetworkInfo: function(c, parsed) {
                    app.update(parsed.path, parsed.diff)
                },

                onReload: function(c, parsed) {
                    location.reload(true)
                }

            }['on'+parsed.type](c, parsed)
        },

        onJobMessage: function(c, parsed)
        {
            sim.log('job', 'log', '⟵', parsed)
            jf.onReceive(c, parsed, code=> eval(code), app)
        }

    }['on'+parsed.type+'Message'](c, parsed.payload)
}
