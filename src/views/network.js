var network = {}
network.isUp = false
network.connections = {}
network.nextFreeConnectionId = 0 // zählt einfach hoch, nur zum debugen
network.onMessage = undefined
network.onConnectionChanged = undefined
network.allConnectionIds = ()=> Object.keys(network.connections)

network.connect = url=>
{
    var connection = {}
    connection.ws = new WebSocket(url)
    connection.ws.onmessage = ev=> receiveMsg(connection, ev.data)
    connection.ws.onclose = ev=> cleanUpConnection(connection)
    connection.ws.onopen = ()=>
    {
        connection.id = network.nextFreeConnectionId++
        connection.close = ()=> connection.ws.close()
        connection.send = msg=> sendMsg(connection, msg)

        network.isUp = true
        network.connections[connection.id] = connection
        network.onConnectionChanged('Connected', connection)
    }

    network.onConnectionChanged('Connecting', connection)
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
        network.onMessage(connection, parsed, msg.length)
    }
    catch(e)
    {
        console.error(e.stack)
    }
}

function cleanUpConnection(connection)
{
    delete network.connections[connection.id]
    setTimeout(()=> network.connect(url), config.client.reconnectIntervall)
    if (network.isUp)
    {
        network.isUp = false
        network.onConnectionChanged('Disconnected', connection)
    }
}
