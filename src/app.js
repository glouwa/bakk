require( 'console-group' ).install()
console.debug = ()=> {}

var os       = require('os')

var config   = require('./src/config.js')
var sim      = require('./src/sim.js')
var messages = require('./src/messages.js')
var tools    = require('./src/tools.js')

var jff      = require('./src/job/job.js')
var jl       = require('./src/job/workflows.js')
var tj       = require('./src/job/toolJobs.js')

var mvj      = require('./src/mvj.js')
var pSet     = require('./modules/types/pSet.js')

//-------------------------------------------------------------------------------------------

q            = require('./src/q.js')

app = mvj.model('', {
    wsUrl: 'ws://' + config.server.wshost + ':' + config.server.wsport,
    clientId: 'unknown',
    model: {}
})

sim.config = config.clientDefaultSimConfig

var osDir = os.type() == 'Linux' ? 'posix64' : 'dotnet'
var binDir = 'bin/' + osDir + '/'
// nicht hin schaun
var jf = jff.jm()
jf.jl = jl
jf.workerId = undefined
jf.nextFreeId = 0
jf.host = os.hostname()
tj.jm = jf
tj.config = config
mvj.jm = jf
mvj.app = app
q.app = app

function rootJob(args)
{
    // hmmmm das wird vermutlich nur auf ui losen verwendet
    // unddie starten keine jobs (cli?)
    args.desc = 'GUI RootJob'
    var jd = jf.job(args)
    app.mergePath('model.jobs.'+jd.id, jd)
    return app.model.jobs[jd.id.valueOf()]
}

// called by Net --------------------------------------------------------------------------

appOnMessageDefault = function(c, parsed, pduSize)
{
    var channelHandlers =
    {
        onWsMessage: function(c, parsed)
        {
            sim.log('app', 'log', '⟵', parsed)
            messageHandlers['on'+parsed.type](c, parsed)
        },

        onJobMessage: function(c, parsed, pduSize)
        {
            q.addRoot('Message from Connection ' + c.id, ()=> {
                sim.log('job', 'log', '⟵', pduSize, parsed)
                jf.onReceive(c, parsed, code=> eval(code), app, pduSize)
            })
        }

    }['on'+parsed.type+'Message'](c, parsed.payload, pduSize)
}

function appOnNetworkStateChangeWithLog(state, connection)
{
    var stateHandlers =
    {
        onConnecting:  ()=> console.info('...'),
        onConnected:   ()=> console.info('+ connected'),
        onDisconnected:()=> console.info('- disconnected')
    }
    stateHandlers['on'+state]()
}

var clientMessageHandlerFactory = (shortType, type, cap, onConnected)=> { return {
    onServerHallo: function(c, parsed)
    {
        app.clientId = parsed.diff.clientId
        jf.workerId = shortType + Number(app.clientId).toSubscript()

        var mynodeInfo = {
            type: type,
            id: jf.workerId,
            capabilitys: cap,
            simconfig: config.clientDefaultSimConfig,
            osType: os.type(),
            hostname: os.hostname()
        }

        //app.networkInfo.merge(mynodeInfo)
        var msg = messages.networkInfoMsg('model.network.' + app.clientId, mynodeInfo)
        var channelMsg = messages.channelMsg('Ws', msg)
        network.connections[0].send(channelMsg)

        onConnected()
    },

    onNetworkInfo: (c, parsed)=> app.mergePath(parsed.path, parsed.diff),
    onReload: (c, parsed) => {}
}}


