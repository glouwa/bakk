var config   = require('../config.js')
var messages = require('../messages.js')
var WebSocket = require('ws')

var network = {}
network.onMessage = undefined
network.onConnectionChanged = undefined
network.connections = {}
network.nextFreeConnectionId = 1
network.connectionCount = function() { return Object.keys(network.connections).length }
network.sendMulticast = function(receivers, msg)
{
    receivers.forEach(function (cid)
    {
        network.connections[cid].send(msg)
    })
}
network.sendBroadcast = function(msg)
{
    network.connections.forEach(function (conn, idx, cid)
    {
        conn.send(msg)
    })
}
network.connect = function(url)
{
    network.ws = new WebSocket(url);
    var connection = {}

    network.ws.on('open', function()
    {
        console.log('on open')
        connection.id = 0 //network.nextFreeConnectionId++
        connection.close = function() { ws.close() }
        connection.send = function(msg)
        {            
            try
            {
                var data = messages.stringify(msg)
                network.ws.send(data)
                network.sim.log('net', 'log', '⟶', connection.id, msg)
            }
            catch(e)
            {
                network.ws.close()
                throw e
            }
        }
        network.connections[connection.id] = connection
        network.onConnectionChanged('Connected', connection)
    })
    network.ws.on('message', function(msg)
    {
        try
        {
            var parsed = messages.parse(msg)
            network.sim.log('net', 'log', '⟵', connection.id, parsed)
            network.onMessage(connection, parsed)
        }
        catch(e)
        {
            console.error(e.stack)
        }
    })
    network.ws.on('close', function(code, msg)
    {
        delete network.connections[connection.id]
        network.onConnectionChanged('Disconnected', connection)
    })
}
exports.network = network




