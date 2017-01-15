/*app muss in mehreren schritten initiatiliert werden
- app muss existieren, da mvj.model merge verwendet
- es müssen alle typen für einen merge vorhanden sein, dh zu erst müssen built in geladen werden
  man kann beim ersten zb. kein registry oder model verwenden
*/

app = mvj.model('', { clientId: 'X', host:'unknown', core: { types:{} }})
app.merge({
    core: {
        views:{
            'primitive':{ index:{} },
            'line':{},
            'd3':{},
            'a5-h':{},
            'a4-v':{},
        },        
        config:config
    },
    model:{        
        mods: projectFolder.create(),
        jobs:{},
        log: { type:'Set<Job>' },
        store: { type:'Store' },
    },
    network:{        
        connections:{},
        reconnectIntervall: 100,
    },



    rootJob:function(args){
        var jd = jf.job(args)
        app.mergePath('model.jobs.'+jd.id, jd)
        var j = app.model.jobs[jd.id.valueOf()]
        if (args.show)
            $('#jobTab')[0].add(j.id, { content:jobAllView(j) })
        return j
    },
    callUiJob:function(args){
        q.addRoot('Message From UI ' + args.desc, ()=> {
            this.rootJob(args).call()
        })
    },
    init:function(args){        
        q.addRoot('App init', ()=> {
            app.core.types.merge(args.builtInTypes)
            app.merge(args.structure)
            app.callUiJob({
                icon:'🗝',
                desc:'app.init',
                params:{},
                show:false,
                output:{},
                onCall:j=> args.onInit(j)
            })
        })
    },


    // TODO remove (to network)
    onMessage:function(c, parsed, pduSize){
        q.addRoot('app on "' + parsed.type + '" message ' + c.id + ' ('+pduSize+'b)', ()=>{
            console.info('job', '⟵', pduSize, JSON.stringify(parsed, 0, 4));
            ({
                onWsMessage:  (c, p, s)=> app.network.msgHandlers['on'+p.type](c, p),
                onJobMessage: (c, p, s)=> jf.onReceive(c, p, code=> eval(code), app, s)
            })['on'+parsed.type+'Message'](c, parsed.payload, pduSize)
        })
    }
})

// ----------------------------------------------------------------------------------------

var clientProtocol = { // wird zur zeit im client selbst zusammengebaut
    stateChangeHandlers:{
        onConnected: undefined,
        onDisconnected: function cleanUpAllConnections(c){

            var n = app.network
            var connectionId = Object.keys(n.connections)[0]
            var networkDiff = { connections:{ [connectionId]:'deadbeef' } }
            n.selectAll().forEach((v, k, idx)=> networkDiff[k]='deadbeef')
            n.merge(networkDiff)
        }
    },
    msgHandlers:{
        onClientHallo: undefined,
        onServerHallo: function onServerHallo(fixedId, type, cap, c, parsed, ostype)
        {
            var cidx = parsed.nr
            var servernid = parsed.iam
            var nid = fixedId ? fixedId : (type.charAt(0) + Number(cidx).toSubscript())

            parsed.network[servernid].send = msg=> c.send(msg)
            parsed.network[servernid].close = j=> c.close(j)
            app.network.merge(parsed.network)
            app.network.connections.merge({ [servernid]:app.network[servernid] })
            app.commit('got my id')

            app.merge({ clientId:nid })
            app.network.merge({
                [nid]:{
                    type: type,
                    id: nid,
                    capabilitys: cap,
                    osType: ostype,
                    hostname:app.host.valueOf()
                }
            })

            app.network[servernid].send({
                type:'Ws',
                payload:{
                    type:'ClientHallo',
                    iam:nid,
                    network:{
                        [nid]:app.network[nid]
                    }
                }
            })

            app.commit('network += my properties')
            c.node = app.network[nid]
            c.connectJob.ret('ok', 'got serverhallo and sent my nodeinfo')
        },
        onNetworkInfo: undefined,
        onReload: undefined
    }
}

var serverProtocol = {
    stateChangeHandlers:{
        onConnected: function(c){
            c.send({
                type:'Ws',
                payload:{
                    type: 'ServerHallo',
                    nr:c.idx,
                    iam:serverId,
                    network: app.network.selectAll()
                }
            })
        },
        onDisconnected: function(c){
            app.network.merge({
                [c.node.id]:'deadbeef',
                connections:{ [c.node.id]:'deadbeef' }
            })
            app.network.sendBroadcast({
                type:'Ws',
                payload:{
                    type:'NetworkInfo',
                    path:'network',
                    diff:{ [c.node.id]:'deadbeef' }
                }
            })
        }
    },
    msgHandlers:{
        onServerHallo: undefined,
        onClientHallo: function(c, parsed) {
            var clientnid = parsed.iam

            parsed.network[clientnid].send = msg=> c.send(msg)
            parsed.network[clientnid].close = j=> c.close(j)
            app.network.merge(parsed.network)
            app.network.connections.merge({ [clientnid]:app.network[clientnid] })
            app.commit('got my id')

            app.network.sendBroadcast({
                type:'Ws',
                payload:{
                    type:'NetworkInfo',
                    path:'network.'+clientnid,
                    diff:app.network[clientnid]
                }
            })

            c.node = app.network[clientnid]
            c.connectJob.ret('ok', 'got serverhallo and sent my nodeinfo')
        },
        onNetworkInfo: function(c, parsed){
            app.mergePath(parsed.path, parsed.diff)
            var r = Object.keys(app.network.connections).without([c.node.id.toString()])
            app.network.sendMulticast(r, {
                type:'Ws',
                payload:parsed
            })
        },
        onReload: function(c, parsed){
            app.network.sendBroadcast({
                type:'Ws',
                payload:parsed
            })
        }
    }
}
