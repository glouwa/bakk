/*app muss in mehreren schritten initiatiliert werden
- app muss existieren, da mvj.model merge verwendet
- es müssen alle typen für einen merge vorhanden sein, dh zu erst müssen built in geladen werden
  man kann beim ersten zb. kein registry oder model verwenden
*/

app = mvj.model('', {    
    clientId: 'x',
    registry: {
        types:{}
    }
})

app.merge({
    workerId:function() { return this.clientId.valueOf() },
    registry: {
        views:{
            primitiveBound:{ index:{} },
            line:{},
            d3:{},
            a5:{},
            a4:{},
        },
        types:{            
            jobs:{ type:'Set<JobPrototype>' },
            workflows:{ type:'Set<Workflow>' },
            io:{ type:'Set<ObjIo>' }, // typ von index? oder nur r/w
        },
    },
    model:{        
        mods: projectFolder.create(),
        jobs:{},
        log: { type:'Set<Job>' },
        store: { type:'Store' },
    },
    network:{
        reconnectIntervall: 100,
        connections:{}
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
/*
*/
    init:function(args){
        q.addRoot('App init', ()=> {

            // seitn wos schenas gschriem
            jf.host = args.host
            jf.nextFreeId = 0

            jf.jl = jl
            tj.jm = jf
            tj.config = config
            mvj.jm = jf

            app.registry.types.merge(args.builtInTypes)
            app.merge(args.structure)
            app.callUiJob({
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

// called by Net --------------------------------------------------------------------------

function cleanUpAllConnections(c){

    var n = app.network
    var connectionId = Object.keys(n.connections)[0]
    var networkDiff = { connections:{ [connectionId]:'deadbeef' } }
    n.selectAll().forEach((v, k, idx)=> networkDiff[k]='deadbeef')
    n.merge(networkDiff)
}

function onServerHallo(fixedId, type, cap, c, parsed, ostype, oshostname)
{
    var cidx = parsed.nr
    var servernid = parsed.iam
    var nid = fixedId ? fixedId : ('C' + Number(cidx).toSubscript())

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
            hostname: oshostname
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
}

// ----------------------------------------------------------------------------------------

var clientProtocol = { // wird zur zeit im client selbst zusammengebaut
    stateChangeHandlers:{
        onConnected:function(c){},
        onDisconnected:function(c){}
    },
    msgHandlers:{
        onReload: function(c, parsed){},
        onNetworkInfo: function(c, parsed){},
        onClientHallo: (c, parsed)=> {}
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
        onClientHallo: (c, parsed)=> {
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
