var config   = require('../config.js')
var sim      = require('../sim.js')
var messages = require('../messages.js')
var jff      = require('../job/job.js')
var jl       = require('../job/jobLogic.js')
var tj       = require('../job/toolJobs.js')
var tools    = require('../tools.js')
var mvj      = require('../types/mvj.js')

sim.config = config.serverDefaultSimConfig

var jf = jff.jm()
jf.workerId = 'S₀'
jf.nextFreeId = 0
jf.jl = jl

tj.jm = jf
tj.config = config

mvj.jm = jf

//-------------------------------------------------------------------------------------------

var app = mvj.model('',{
    clientId: 0,
    model: {
        network: {
            '0': {
                type: 'Server',
                id: jf.workerId,
                clientcount: 0,
                capabilitys: [],
                simconfig: sim.config
            }
        }
    }
})

app.model.network[0].simconfig.on('change', function(changes)
{
    console.log('simconfig.on change')
    sim.config = app.model.network[0].simconfig
})

app.filterNodes = function(criteria)
{
    var nodes = []
    app.model.network.forEach(function(nval, nkey, nidx)
    {
        nval.capabilitys.forEach(function(cval, ckey, cidx)
        {
            if (cval.valueOf() == criteria)
                nodes.push(network.connections[nkey])
        })
    })
    if (nodes.length == 0)
        throw new Error('no workers available')
    return nodes
}

// called by Net --------------------------------------------------------------------------

app.onNetworkStateChange = function(state, connection)
{
    var stateHandlers =
    {
        onConnected: function()
        {
            var msg = messages.serverHalloMsg(connection.id, app.model.network)
            var channelMsg = messages.channelMsg('Ws', msg)
            connection.send(channelMsg)
        },

        onDisconnected: function()
        {
            var path = 'model.network.'+connection.id

            try
            {
                app.update(path, 'deadbeef')
            }
            catch(e)
            {
            }

            var msg = messages.networkInfoMsg(path, 'deadbeef')
            var channelMsg = messages.channelMsg('Ws', msg)
            network.sendBroadcast(channelMsg)
        }
    }
    stateHandlers['on'+state]()
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
                onReload: function(c, parsed)
                {
                    var channelMsg = messages.channelMsg('Ws', parsed)
                    network.sendBroadcast(channelMsg)
                },

                onNetworkInfo: function(c, parsed)
                {
                    app.update(parsed.path, parsed.diff)                    

                    var receivers = Object.keys(network.connections).without([c.id.toString()])
                    var channelMsg = messages.channelMsg('Ws', parsed)
                    network.sendMulticast(receivers, channelMsg)
                }

            }['on'+parsed.type](c, parsed)
        },

        onJobMessage: function(c, parsed, pduSize)
        {         
            //sim.log('job', 'log', '⟵', parsed)
            jf.onReceive(c, parsed, code=> eval(code), app, pduSize)
        }

    }['on'+parsed.type+'Message'](c, parsed.payload, pduSize)
}

//-------------------------------------------------------------------------------------------

var network = require('./network').network
network.onConnectionChanged = app.onNetworkStateChange
network.onMessage = app.onMessage
network.sim = sim
network.listen();

//-------------------------------------------------------------------------------------------

var connect = require('connect')
var serveStatic = require('serve-static')
connect().use(serveStatic('../../')).listen(config.server.httpport)
