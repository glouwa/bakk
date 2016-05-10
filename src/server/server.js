var fs = require('fs')

eval(fs.readFileSync('../app.js')+'')
eval(fs.readFileSync('../types/project.js')+'')

jf.workerId = 'S₀'

app.update({
    clientId: 0,
    model: {
        network: {
            '0': {
                type: 'Server',
                id: jf.workerId,
                clientcount: 0,
                capabilitys: [],
                simconfig: sim.config,
                osType: os.type(),
                hostname: os.hostname()
            }
        }
    }
})

app.model.network[0].simconfig.on('change', function(changes)
{
    console.log('simconfig.on change')
    sim.config = app.model.network[0].simconfig
})

app.getNodesByCapability = function(criteria)
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

app.getNodesByType = function(criteria, emptyResultIsOk)
{
    var nodes = []
    app.model.network.forEach(function(nval, nkey, nidx)
    {
        console.log('###############------')
        criteria.forEach(function(cval, ckey, cidx)
        {
            console.log('###############')
            console.log(nval.type.valueOf(), cval, nval.type.valueOf() == cval && cval != 'Server')
            if (nval.type.valueOf() == cval && cval != 'Server')
                nodes.push(network.connections[nkey])
        })
    })    
    if (nodes.length == 0 && !emptyResultIsOk)
        throw new Error('no nodes available')
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

            try { app.update(path, 'deadbeef') } catch(e) {}

            var msg = messages.networkInfoMsg(path, 'deadbeef')
            var channelMsg = messages.channelMsg('Ws', msg)
            network.sendBroadcast(channelMsg)
        }
    }
    stateHandlers['on'+state]()
}

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
