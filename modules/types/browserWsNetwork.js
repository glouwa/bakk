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
    network.connections.merge({
        ['0']:'deadbeef'
    })

    if (url) setTimeout(()=> this['⛓'](j), config.client.reconnectIntervall)
}


var wsBrowser = {
    type:'Network',
    connections:{},
    select:function(p) { return this.connections.filter(p) },
    '⛓':function(j) {
        var network = this
        var cid = '0'
        network.merge({ [cid]:{ id:cid, state:'connecting' }})
        var connection = network[cid]
        var ws = new WebSocket(this.endpoint)
        ws.onmessage = ev=> receiveMsg(connection, ev.data)
        ws.onclose = ev=> cleanUpConnection(this, connection, this.endpoint)
        ws.onopen = ()=>
        {
            connection.connectJob = j
            connection.merge({
                state:'connected',
                close:j=> connection.ws.close(),
                send:msg=> sendMsg(connection, msg)
            })
            network.connections.merge({ [cid]:connection })
        }

        Object.defineProperty(connection, 'ws', { writable:true, value:ws })
        Object.defineProperty(connection, 'connectJob', { writable:true, value:null })
    }
}
