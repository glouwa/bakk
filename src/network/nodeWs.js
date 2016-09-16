var config       = require('../config.js')
var messages     = require('../messages.js')
var ClientSocket = require('ws')
var ServerSocket = require('ws').Server

var network = {}
network.connections = {}
network.nextFreeConnectionId = 1
network.allConnectionIds = ()=> Object.keys(network.connections)
network.connectionCount = ()=> Object.keys(network.connections).length
network.sendMulticast = (receivers, msg)=> receivers.forEach(cid=> network.connections[cid].send(msg))
network.sendBroadcast = msg=> network.connections.forEach((conn, idx, cid)=> conn.send(msg))

network.connect = function(url)
{
    var connection = {}
    connection.ws = new ClientSocket(url)
    connection.ws.on('message', msg=> receiveMsg(connection, msg))
    connection.ws.on('close', code=> cleanUpConnection(connection, url))
    connection.ws.on('error', err=> cleanUpConnection(connection, url))
    connection.ws.on('open', ()=>
    {
        connection.id = 0 //network.nextFreeConnectionId++
        connection.close = ()=> connection.ws.close()
        connection.send = msg=> sendMsg(connection, msg)

        network.connections[connection.id] = connection
        app.onNetworkStateChange('Connected', connection)
    })

    app.onNetworkStateChange('Connecting', connection)
}

network.listen = function()
{
    network.listener = new ServerSocket({ port:config.server.wsport })
    network.listener.on('error', err=> console.error('WebSocketServer error: ' + err))
    network.listener.on('connection', ws=>
    {
        var connection = {}
        connection.ws = ws
        connection.ws.on('message', msg=> receiveMsg(connection, msg))
        connection.ws.on('close', code=> cleanUpConnection(connection))
        connection.ws.on('error', err=> cleanUpConnection(connection))

        connection.id = network.nextFreeConnectionId++
        connection.close = ()=> connection.ws.close()
        connection.send = msg=> sendMsg(connection, msg)

        network.connections[connection.id] = connection
        app.onNetworkStateChange('Connected', connection)
    })
}

// ------------------------------------------------------------------------------------------

function sendMsg(connection, msg)
{
    try
    {
        var data = messages.stringify(msg) // sollte nicht dem try sein
        connection.ws.send(data)
        network.sim.log('net', 'log', '⟶', connection.id, msg)
        return data.length
    }
    catch(e)
    {
        connection.ws.close()
        throw e
    }
}

function receiveMsg(connection, msg)
{
    try
    {
        var parsed = messages.parse(msg)
        network.sim.log('net', 'log', '⟵', connection.id, parsed)
        app.onMessage(connection, parsed, msg.length)
    }
    catch(e)
    {
        console.error(e.stack)
    }
}

function cleanUpConnection(connection, url)
{
    delete network.connections[connection.id]
    if (url) setTimeout(()=> network.connect(url), config.client.reconnectIntervall)
    app.onNetworkStateChange('Disconnected', connection)
}

exports.network = network

