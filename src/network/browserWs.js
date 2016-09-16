var network = {}
network.isUp = false
network.connections = {}
network.nextFreeConnectionId = 0
network.allConnectionIds = ()=> Object.keys(network.connections)

network.connect = url=>
{
    var connection = {}
    connection.ws = new WebSocket(url)
    connection.ws.onmessage = ev=> receiveMsg(connection, ev.data)
    connection.ws.onclose = ev=> cleanUpConnection(connection, url)
    connection.ws.onopen = ()=>
    {
        connection.id = 0
        connection.close = ()=> connection.ws.close()
        connection.send = msg=> sendMsg(connection, msg)

        network.isUp = true
        network.connections[connection.id] = connection
        app.onNetworkStateChange('Connected', connection)
    }

    app.onNetworkStateChange('Connecting', connection)
}

// ------------------------------------------------------------------------------------------

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

function receiveMsg(connection, msg)
{    
    try
    {
        var parsed = messages.parse(msg)
        sim.log('net', 'log', '⟵', connection.id, msg.length, parsed)        
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
    if (network.isUp)
    {
        network.isUp = false
        app.onNetworkStateChange('Disconnected', connection)
    }
    else
    {
        console.assert(false, 'isUp is not useless :(')
    }
}
