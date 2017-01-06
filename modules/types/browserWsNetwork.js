function sendMsg(connection, msg)
{
    try
    {
        var data = messages.stringify(msg) // sollte nicht dem try sein
        connection.ws.send(data)
        sim.log('net', 'log', '⟶', connection.id, msg)
        return data.length
    }
    catch(e)
    {
        connection.ws.close()
        throw e
    }
}

var receiveMsg=(c, msg)=>
{
    try
    {
        var parsed = messages.parse(msg)
        app.onMessage(c, parsed, msg.length)
    }
    catch(e)
    {
        console.error(e.stack)
    }
}

var cleanUpConnection =(network, connection, url)=>
{
    network.merge({
        [cid]:'deadbeef',
        connections: { [cid]:'deadbeef' }
    })

    if (url) setTimeout(()=> this['⛓'](j), config.client.reconnectIntervall)
}

var wsBrowser = {
    type:'Network',
    connections:{},
    select:function(p) { return this.connections.filter(p) },
    '⛓':function(j) {
        var n = this
        var c = { ws:null, node:null, connectJob:j }
            c.send = msg=> sendMsg(c, msg)
            c.close = j=> ws.close()
            c.ws = new WebSocket(this.endpoint)
            c.ws.onmessage = ev=> receiveMsg(c, ev.data)
            c.ws.onclose = ev=> cleanUpConnection(this, c)
            c.ws.onopen = ()=> {}
    }
}
