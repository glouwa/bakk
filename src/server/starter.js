var config   = require('../config.js')
var sim      = require('../sim.js')
var messages = require('../messages.js')
var jff      = require('../job/job.js')
var jl       = require('../job/jobLogic.js')
var tj       = require('../job/toolJobs.js')
var tools    = require('../tools.js')
var mvj      = require('../types/mvj.js')
var pSet     = require('../types/pSet.js')
var fs       = require('fs')
eval(fs.readFileSync('../types/project.js')+'')

sim.config = config.clientDefaultSimConfig

// nicht hin schaun
var jf = jff.jm()
jf.jl = jl
jf.workerId = undefined
jf.nextFreeId = 0
tj.jm = jf
tj.config = config
mvj.jm = jf

//-------------------------------------------------------------------------------------------

var app = mvj.model('', {
    wsUrl: 'ws://' + config.server.wshost + ':' + config.server.wsport,
    clientId: 'unknown',
    model: {}
})

function rootJob(args)
{
    var jd = jf.job(args)
    app.update('model.jobs.'+jd.id, jd)
    return app.model.jobs[jd.id.valueOf()]
}

function aProjectJob()
{    
    app.model.update({
        type: 'Model',
        jobs: { type:'Set<Job>' },
        store: { type:'Store' },
        projects: // fileset(path, 'Set<Project>', (filename)=> project.ctor(filename))
        {
            type:'Set<Project>',
            'ℙ Find prime numbers with C++ on workers':project('../../projects/' + process.argv[2] + '.js', 'noWiew')
        },
        registry:
        {
            type:'Registry',
            config: config,
            types: { type:'Set<Type>' }
        },
    })

    function printjobUpdate(j)
    {
        process.stdout.clearLine()
        process.stdout.cursorTo(0)
        process.stdout.write(j.state.progress.valueOf().toFixed(2))
    }

    function printjobResult(j)
    {
        var workTimeMs = j.state.lastModification.valueOf() - j.state.callTime.valueOf()
        process.stdout.clearLine()
        process.stdout.cursorTo(0)
        console.log(j.state.detail + ' ' + workTimeMs + 'ms ' + j.state.log.valueOf())
        fs.appendFileSync('100' + process.argv[2] + '.csv', workTimeMs + '\n')
        process.exit()
    }

    return rootJob({
        desc:'cli',
        onCall:j=> app.model.projects['ℙ Find prime numbers with C++ on workers']['▸'](j),
        onUpdate:j=> printjobUpdate(j),
        onReturn:j=> printjobResult(j)
    })
}

// called by Net --------------------------------------------------------------------------

app.onMessage = function(c, parsed, pduSize)
{
    var channelHandlers =
    {
        onWsMessage: function(c, parsed)
        {
            sim.log('app', 'log', '⟵', parsed)

            var messageHandlers =
            {
                onServerHallo: function(c, parsed)
                {                    
                    app.clientId = parsed.diff.clientId
                    jf.workerId = 'C' + Number(app.clientId).toSubscript()

                    var mynodeInfo = {
                        type: 'Client',
                        id: jf.workerId,
                        capabilitys: [],
                        simconfig: config.clientDefaultSimConfig,
                    }

                    //app.networkInfo.update(mynodeInfo)
                    var msg = messages.networkInfoMsg('model.network.'+app.clientId, mynodeInfo)
                    var channelMsg = messages.channelMsg('Ws', msg)
                    network.connections[0].send(channelMsg)

                    // do stuff
                    aProjectJob().call()
                },

                onNetworkInfo: function(c, parsed){},
                onReload: function(c, parsed){}

            }['on'+parsed.type](c, parsed)
        },

        onJobMessage: function(c, parsed, pduSize)
        {
            jf.onReceive(c, parsed, code=> eval(code), app, pduSize)
        }

    }['on'+parsed.type+'Message'](c, parsed.payload, pduSize)
}

app.onNetworkStateChange = function(state, connection)
{
    var stateHandlers =
    {
        onConnecting:  ()=> {},
        onConnected:   ()=> {}, //console.log('connected to ' + 'ws://' + config.server.wshost + ':' + config.server.wsport),
        onDisconnected:()=> {} //console.log('disconnected')
    }
    stateHandlers['on'+state]()
}


//-------------------------------------------------------------------------------------------

var network = require('./network').network
network.onConnectionChanged = app.onNetworkStateChange
network.onMessage = app.onMessage
network.sim = sim
network.connect(app.wsUrl.valueOf())


