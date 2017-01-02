var connectJob
function networkType()
{
    return {
        type:'Network',
        state:'idle',        
        '+4 worker': j=> app.model.mods.lib['🖥 Start workers']['▸'](j),
        '☠ worker': j=> app.model.mods.lib['☠ Kill all']['▸'](j, {}, { nodeType:['Worker']}),
        '☠ all': j=> app.model.mods.lib['☠ Kill all']['▸'](j, {}, { nodeType:['Server', 'Overlord', 'Worker']}),
        '↻ clients': j=> {
            var reloadmsg = messages.reloadMsg()
            var channelMsg = messages.channelMsg('Ws', reloadmsg)
            app.network[0].send(channelMsg)
            j.ret('ok', 'reload message sent')
        },
        '⛓':function(j) {

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

            var cleanUpConnection =(connection, url)=>
            {
                this.merge({
                    ['0']:'deadbeef',
                    state:'waiting for reconnect'
                })

                if (url) setTimeout(()=> this['⛓'](j), config.client.reconnectIntervall)
            }


            var connection = {}
            connection.ws = new WebSocket(this.endpoint)
            connection.ws.onmessage = ev=> receiveMsg(connection, ev.data)
            connection.ws.onclose = ev=> cleanUpConnection(connection, this.endpoint)
            connection.ws.onopen = ()=>
            {
                connection.send = msg=> sendMsg(connection, msg)

                this.merge({
                    state: 'connected',
                    ['0']:{
                        id: 0,
                        close:j=> connection.ws.close(),
                        send: msg=> sendMsg(connection, msg)
                    }
                })

                connectJob = j
                //j.ret('ok', 'wscconnectedion initialized')
            }

            this.merge({ state: 'connecting' })
        },
        msgHandlers:{
            onNetworkInfo: (c, parsed)=> app.mergePath(parsed.path, parsed.diff),
            onReload:      (c, parsed)=> location.reload(true),
            onServerHallo: (c, parsed)=> {
                app.merge(parsed.diff)  // pull
                app.commit('got my id') // für logging

                var mynodeInfo = {
                    type:'Client',
                    id:app.workerId(),
                    capabilitys:['JS'],
                    simconfig:config.clientDefaultSimConfig,
                    osType:'Browser',
                    hostname:''
                }

                var networkInfo = { [app.clientId]:mynodeInfo }

                app.network.merge(networkInfo)
                sim.config = app.network[app.clientId.valueOf()].simconfig
                app.commit('network += my properties')

                // server die eigene id bekannt geben
                // todo: überleg da was besseres
                var msg = messages.networkInfoMsg('network.' + app.clientId, mynodeInfo)
                var channelMsg = messages.channelMsg('Ws', msg)

                app.network[0].send(channelMsg)

                // jobs ready to use?
                connectJob.ret('ok', 'got serverhallo and sent my nodeinfo')
            }
        },
    }
}
