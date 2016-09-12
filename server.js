var fs = require('fs')

eval(fs.readFileSync('src/app.js')+'')
//eval(fs.readFileSync('src/types/project.js')+'')

jf.workerId = 'S₀'

//-------------------------------------------------------------------------------------------

var network = require('./src/network/nodeWs').network
network.onConnectionChanged = onNetworkStateChange
network.onMessage = appOnMessageDefault
network.sim = sim
network.listen()

//-------------------------------------------------------------------------------------------

var connect = require('connect')
var serveStatic = require('serve-static')
connect().use(serveStatic('./')).listen(config.server.httpport)

//-------------------------------------------------------------------------------------------



//-------------------------------------------------------------------------------------------

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
    console.log('getNodesByType(' + criteria + ')')
    var nodes = []
    app.model.network.forEach(function(nval, nkey, nidx)
    {        
        criteria.forEach(function(cval, ckey, cidx)
        {
            if (nval.type.valueOf() == cval && cval != 'Server')
            {
                console.log(' + ' + nkey)
                nodes.push(network.connections[nkey])
            }
        })
    })    
    if (nodes.length == 0 && !emptyResultIsOk)
        throw new Error('no nodes available')
    return nodes
}

// called by Net --------------------------------------------------------------------------

function onNetworkStateChange(state, connection)
{
    var stateHandlers =
    {
        onConnected: function()
        {
            console.log('+ connection ' + connection.id)
	  
            var msg = messages.serverHalloMsg(connection.id, app.model.network)
            var channelMsg = messages.channelMsg('Ws', msg)
            connection.send(channelMsg)
        },

        onDisconnected: function()
        {
            console.log('- connection ' + connection.id)

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


