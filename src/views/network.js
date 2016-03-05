var network = {}
network.isUp = false
network.nextFreeConnectionId = 0 // zählt einfach hoch, nur zum debugen
network.onConnectionChanged = undefined
network.allConnectionIds = ()=> Object.keys(network.connections)
network.server = {}
network.server.send  = ()=> { throw new Error("Websocket never opened") }
network.server.close = ()=> {} // nothing to do
network.connect   = (url)=>
{
    try
    {        
        var ws = new WebSocket(url)
        network.onConnectionChanged('Connecting', network.server)

        ws.onopen = () =>
        {            
            network.server = {}
            network.server.id = network.nextFreeConnectionId++
            network.server.close = () => ws.close()
            network.server.send = (msg) =>
            {
                try
                {
                    var data = messages.stringify(msg)
                    console.info('sending ' + data.length + ' bytes')
                    ws.send(data)
                    sim.log('net', 'log', '⟶', msg)
                }
                catch(e)
                {
                    ws.close()
                    throw e
                }
            }

            network.isUp = true
            network.onConnectionChanged('Connected', network.server)
        }
        ws.onmessage = (ev) =>
        {
            try
            {
                console.info('received ' + ev.data.length + ' bytes')
                var parsed = messages.parse(ev.data)
                sim.log('net', 'log', '⟵', parsed)
                app.onMessage(network.server, parsed)
            }
            catch(e)
            {
                console.error(e.stack)
            }
        }
        ws.onclose = (ev) =>
        {
            if (network.isUp)
            {
                network.isUp = false
                network.onConnectionChanged('Disconnected', network.server)
            }
            setTimeout(() => network.connect(url), config.client.reconnectIntervall)
        }
    }
    catch(e)
    {
        console.error(e.stack)

        if (network.isUp)
        {
            network.isUp = false
            network.onConnectionChanged('Disconnected', network.server)
        }
    }
}
