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

function cleanUpConnection(n, connection, url)
{    
    if (n[connection.id])
        n.merge({ [connection.id]:'deadbeef' })

    if (n.connections[connection.id]) {
        n.connections.merge({ [connection.id]:'deadbeef' })
        console.warn('index not clean')
    }

    //var url = n.endpoint.valueOf()
  //  if (url) setTimeout(()=> network.connect(url), config.client.reconnectIntervall)

    //if(app.onNetworkStateChange)
    onNetworkStateChange(n, 'Disconnected', connection)
}

function onNetworkStateChange(n, state, c){
    if (n.stateChangeHandlers)
        q.addRoot('Network state changed ' + c.id + ' ('+state+')', ()=>{
            n.stateChangeHandlers['on'+state](c)
        })
}

// ------------------------------------------------------------------------------------------

exports.network = {
    connections: {},
    nextFreeIdx: 1,
    allConnectionIds:function() { return Object.keys(this.connections) },
    connectionCount:function()  { return Object.keys(this.connections).length },
    sendBroadcast:function(msg) { this.connections.forEach((v, k, idx)=> v.send(msg)) },
    sendMulticast:function(receivers, msg) {
        return receivers.forEach(cid=> {
            if(this.connections[cid])
                this.connections[cid].send(msg)
        })
    },
    ['⛓']:function(j) {
        var n = this
        var c = { cidx:n.nextFreeIdx++, ws:null, node:null, connectJob:j }
            c.send = msg=> sendMsg(c, msg)
            c.close = j=> ws.close()
            c.ws = new ClientSocket(n.endpoint.valueOf())
            c.ws.on('message', msg=> receiveMsg(c, msg))
            c.ws.on('close', code=> cleanUpConnection(n, c))
            c.ws.on('error', err=> cleanUpConnection(n, c))
            c.ws.on('open', ()=> {})
    },
    listen:function(j)
    {
        var n = this
        var listener = new ServerSocket({ port:config.server.wsport })
            listener.on('error', err=> console.error('WebSocketServer error: ' + err))
            listener.on('connection', ws=>
            {                
                var c = { idx:n.nextFreeIdx++, ws:ws, node:null, connectJob:j }
                    c.send = msg=> sendMsg(c, msg)
                    c.close = j=> ws.close()
                    c.ws.on('message', msg=> receiveMsg(c, msg))
                    c.ws.on('close', code=> cleanUpConnection(n, c))
                    c.ws.on('error', err=> cleanUpConnection(n, c))

                onNetworkStateChange(n, 'Connected', c)
            })

        j.ret('ok', 'listening on port ' + config.server.wsport)
    }
}




