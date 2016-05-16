var os       = require('os')
var config   = require('../config.js')
var sim      = require('../sim.js')
var messages = require('../messages.js')
var jff      = require('../job/job.js')
var jl       = require('../job/jobLogic.js')
var tj       = require('../job/toolJobs.js')
var tools    = require('../tools.js')
var mvj      = require('../types/mvj.js')
var pSet     = require('../types/pSet.js')

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

// called by Net --------------------------------------------------------------------------

app.onMessage = function(c, parsed, pduSize)
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
            sim.log('job', 'log', '⟵', pduSize, parsed)
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

        //app.networkInfo.update(mynodeInfo)
        var msg = messages.networkInfoMsg('model.network.' + app.clientId, mynodeInfo)
        var channelMsg = messages.channelMsg('Ws', msg)
        network.connections[0].send(channelMsg)

        onConnected()
    },

    onNetworkInfo: (c, parsed)=> app.update(parsed.path, parsed.diff),
    onReload: (c, parsed) => {}
}}

var osDir = os.type() == 'Linux' ? 'posix64' : 'dotnet'
var binDir = '../../bin/' + osDir + '/'
