function sendMsg(connection, msg)
{
    try
    {
        var data = JSON.stringify(msg, null, 4) // sollte nicht dem try sein
        connection.ws.send(data)
        console.log('net', 'log', '⟶', connection.id, msg)
        return data.length
    }
    catch(e)
    {
        connection.ws.close()
        throw e
    }
}

function receiveMsg(c, msg)
{
    try
    {
        var parsed = JSON.parse(msg)
        app.onMessage(c, parsed, msg.length)
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

function cleanUpConnection(n, c, reconnect)
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

var wsBrowser = {
    type:'Network',
    '⛓':function(j) {
        var n = this
        var c = { ws:null, node:null, connectJob:j }
            c.send = msg=> sendMsg(c, msg)
            c.close = j=> ws.close()
            c.ws = new WebSocket(this.endpoint)
            c.ws.onmessage = ev=> receiveMsg(c, ev.data)
            c.ws.onclose = ev=> cleanUpConnection(this, c, true)
            c.ws.onopen = ()=> onConnectionOpen(n, c)
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
