var config       = require('../../src/config.js')
var messages     = require('../../src/messages.js')
var ClientSocket = require('ws')
var ServerSocket = require('ws').Server

// ------------------------------------------------------------------------------------------

function sendMsg(connection, msg)
{
    try
    {
        var data = messages.stringify(msg) // sollte nicht dem try sein
        connection.ws.send(data)
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
        app.onMessage(connection, parsed, msg.length)
    }
    catch(e)
    {
        console.error(e.stack)
    }
}

function cleanUpConnection(network, connection, url)
{
    delete network.connections[connection.id]
  //  if (url) setTimeout(()=> network.connect(url), config.client.reconnectIntervall)

    //if(app.onNetworkStateChange)
    app.onNetworkStateChange('Disconnected', connection)
}

// ------------------------------------------------------------------------------------------

var network = {}
network.connections = {}
network.nextFreeConnectionId = 1
network.allConnectionIds = ()=> Object.keys(network.connections)
network.connectionCount = ()=> Object.keys(network.connections).length
network.sendMulticast = (receivers, msg)=> receivers.forEach(cid=> {
                                                                 console.log(Object.keys(app.network))
                                                                 console.log(Object.keys(app.network.connections))
                                                                 if(app.network.connections[cid]){
                                                                    app.network.connections[cid].send(msg)
                                                                     console.log('sendign')
                                                                 }
                                                                 })
network.sendBroadcast = msg=> network.connections.forEach((conn, idx, cid)=> conn.send(msg))

network['⛓'] = function(j) {
    var network = this
    var cid = '0'; network.merge({ [cid]:{ id:cid, state:'connecting' }})
    var connection = network[cid]
    var ws = new ClientSocket(network.endpoint.valueOf())
        ws.on('message', msg=> receiveMsg(connection, msg))
        ws.on('close', code=> cleanUpConnection(network, connection, network.endpoint.valueOf()))
        ws.on('error', err=> cleanUpConnection(network, connection, network.endpoint.valueOf()))
        ws.on('open', ()=>
        {
            connection.connectJob = j
            connection.merge({
                state:'connected',
                close:j=> connection.ws.close(),
                send:msg=> sendMsg(connection, msg)
            })
            network.connections.merge({ [cid]:connection })
        })

    Object.defineProperty(connection, 'ws', { writable:true, value:ws })
    Object.defineProperty(connection, 'connectJob', { writable:true, value:null })
}


network.listen = function(j)
{
    var n = this
    var listener = new ServerSocket({ port:config.server.wsport })
        listener.on('error', err=> console.error('WebSocketServer error: ' + err))
        listener.on('connection', ws=>
        {
            var cid = network.nextFreeConnectionId++
            n.merge({
                [cid]:{
                    id:cid, state:'connecting'
                }
            })

            var connection = n[cid]
            ws.on('message', msg=> receiveMsg(connection, msg))
            ws.on('close', code=> cleanUpConnection(n, connection))
            ws.on('error', err=> cleanUpConnection(n, connection))

            connection.merge({
                close: ()=> connection.ws.close(),
                send: msg=> sendMsg(connection, msg)
            })
            n.connections.merge({ [cid]:connection })

            Object.defineProperty(connection, 'ws', { writable:true, value:ws })
            //if(app.onNetworkStateChange)
            app.onNetworkStateChange('Connected', connection)
        })

    j.ret('ok', 'listening on port ' + config.server.wsport)
}



exports.network = network

