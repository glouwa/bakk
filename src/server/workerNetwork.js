var config   = require('../config.js')
var messages = require('../messages.js')
var WebSocket = require('ws')

var network = {}
network.onMessage = undefined
network.onConnectionChanged = undefined
network.connections = {}
network.nextFreeConnectionId = 1
network.connectionCount = ()=> Object.keys(network.connections).length
network.sendMulticast = (receivers, msg)=>
{
    receivers.forEach(cid=> network.connections[cid].send(msg))
}
network.sendBroadcast = msg=>
{
    network.connections.forEach((conn, idx, cid)=> conn.send(msg))
}
network.connect = url=>
{
    network.ws = new WebSocket(url);
    var connection = {}

    network.ws.on('open', ()=>
    {
        console.log('on open')
        connection.id = 0 //network.nextFreeConnectionId++
        connection.close = ()=> ws.close()
        connection.send = msg=>
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
    network.ws.on('message', msg=>
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
    network.ws.on('close', (code, msg)=>
    {
        delete network.connections[connection.id]
        network.onConnectionChanged('Disconnected', connection)        
        setTimeout(()=> network.connect(url), config.client.reconnectIntervall)
    })
}
exports.network = network




