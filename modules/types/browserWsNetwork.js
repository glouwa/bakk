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

var cleanUpConnection =(n, c, url)=>
{
    onNetworkStateChange(n, c, 'Disconnected')
    if (url) setTimeout(()=> this['⛓'](j), config.client.reconnectIntervall)
}

function onNetworkStateChange(n, c, state){
    if (n.stateChangeHandlers)
        q.addRoot('Network state changed ' + c.id + ' ('+state+')', ()=>{
            n.stateChangeHandlers['on'+state](c)
        })
}

var wsBrowser = {
    type:'Network',
    connections:{},
    '⛓':function(j) {
        var n = this
        var c = { ws:null, node:null, connectJob:j }
            c.send = msg=> sendMsg(c, msg)
            c.close = j=> ws.close()
            c.ws = new WebSocket(this.endpoint)
            c.ws.onmessage = ev=> receiveMsg(c, ev.data)
            c.ws.onclose = ev=> cleanUpConnection(this, c)
            c.ws.onopen = ()=> onNetworkStateChange(n, c, 'Connected')
    },
    selectAll:function()
    {
        var nodes = {}
        app.network.forEach(function(node, nkey, nidx)
        {
            if (node.type && (
                node.type == 'Worker'
             || node.type == 'Server'
             || node.type == 'Client'
             || node.type == 'Overlord'))
                nodes[nkey] = app.network[nkey]
        })
        return nodes
    },
}
