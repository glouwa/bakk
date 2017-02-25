var config       = require('../../src/config.js')
var ClientSocket = require('ws')
var ServerSocket = require('ws').Server

// ------------------------------------------------------------------------------------------

function sendMsg(connection, msg)
{
    try
    {
        var data = JSON.stringify(msg, null, 4) // sollte nicht dem try sein
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
        var parsed = JSON.parse(msg)
        app.onMessage(connection, parsed, msg.length)
    }
    catch(e)
    {
        console.error(e.stack)
    }
}

function onConnectionOpen(n, c)
{
    n.merge({ reconnectIntervall:100 })
    onNetworkStateChange(n, c, 'Connected')
}

function cleanUpConnection(n, c, reconnect, m)
{
    if (!c.node) {
        c.connectJob.ret('failed', 'cant connect')
        if (n.reconnectIntervall.valueOf() < 3000)
            n.merge({ reconnectIntervall:n.reconnectIntervall*2 })
    }
    else
        onNetworkStateChange(n, c, 'Disconnected')

    if (reconnect)
        setTimeout(()=> {
            console.log('init reconnect '+m)
            app.callUiJob({
                desc:'reconnect',
                params:{},
                output:{},
                onCall:j=> n['⛓'](j)
            })},
            n.reconnectIntervall.valueOf())
}

function onNetworkStateChange(n, c, state){
    if (n.stateChangeHandlers)
        q.addRoot('Network state changed ' + c.id + ' ('+state+')', ()=>{
            n.stateChangeHandlers['on'+state](c)
        })
}

// ------------------------------------------------------------------------------------------

exports.network = {    
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
            c.ws.on('close', code=> cleanUpConnection(n, c, true, 'close'))
            c.ws.on('error', err=> cleanUpConnection(n, c, false, 'err'))
            c.ws.on('open', ()=> onConnectionOpen(n, c, 'Connected'))
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

                onNetworkStateChange(n, c, 'Connected')
            })

        j.ret('ok', 'listening on port ' + config.server.wsport)
    },
    selectAll:function()
    {
        var nodes = {}
        app.ios.hcsw.forEach(function(node, nkey, nidx)
        {
            if (node.type && (
                node.type == 'Worker'
             || node.type == 'Server'
             || node.type == 'Client'
             || node.type == 'Overlord'))
                nodes[nkey] = app.ios.hcsw[nkey]
        })
        return nodes
    },
    getNodesByCapability:function(criteria)
    {
        console.log('getNodesByCapability(' + criteria + ')')
        var nodes = []
        app.ios.hcsw.connections.forEach(function(node, nkey, nidx)
        {
            node.capabilitys.forEach(function(cval, ckey, cidx)
            {
                if (cval.valueOf() == criteria)
                    nodes.push(app.ios.hcsw[nkey])
            })

        })
        if (nodes.length == 0)
            throw new Error('no workers available')

        console.log(nodes)
        return nodes
    },
    getNodesByType:function(criteria, emptyResultIsOk)
    {
        console.log('getNodesByType(' + criteria + ')')
        var nodes = []
        app.ios.hcsw.connections.forEach(function(nval, nkey, nidx)
        {
            criteria.forEach(function(cval, ckey, cidx)
            {
                if (nval.type && nval.type.valueOf() == cval && cval != 'Server')
                {
                    console.log(' + ' + nkey)
                    nodes.push(app.ios.hcsw[nkey])
                }
            })
        })
        if (nodes.length == 0 && !emptyResultIsOk)
            throw new Error('no nodes available')
        return nodes
    }
}




