/*app muss in mehreren schritten initiatiliert werden
- app muss existieren, da mvj.model merge verwendet
- es müssen alle typen für einen merge vorhanden sein, dh zu erst müssen built in geladen werden
  man kann beim ersten zb. kein registry oder model verwenden
*/

app = mvj.model('', { clientId: 'X', host:'unknown', types:{} })
app.merge({    
    config:config,
    viewTypes:{
        'primitive':{},
        'line':{},
        'd3':{},
        'a5h':{},
        'a4v':{},
        'a3h':{},
    },
    jobTypes:{},    
    ios:{
        hcsw:{
            reconnectIntervall: 100,
        },
        file:{},
        sql:{},
        mongo:{},
    },
    log:{
        runs:{},
        io:{},
        commits:{},
        merges:{},
        diffs:{},
    },
    running:{ stack:{} },


    rootJob:function(args){
        var jd = jf.job(args)
        app.mergePath('log.runs.'+jd.id, jd)
        var j = app.log.runs[jd.id.valueOf()]
        return j
    },
    callUiJob:function(args){
        q.addRoot('Message From UI ' + args.desc, ()=> {
            this.rootJob(args).call()
        })
    },
    init:function(args){        
        q.addRoot('App init', ()=> {
            app.types.merge(args.builtInTypes)

            app.merge(args.structure)
            app.callUiJob({
                icon:'🗝',
                desc:'app.init',
                params:{},
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
                onWsMessage:  (c, p, s)=> app.ios.hcsw.msgHandlers['on'+p.type](c, p),
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

            var n = app.ios.hcsw
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
            app.ios.hcsw.merge(parsed.network)
            app.ios.hcsw.connections.merge({ [servernid]:app.ios.hcsw[servernid] })
            app.commit('got my id')

            app.merge({ clientId:nid })
            app.ios.hcsw.merge({
                [nid]:{
                    type: type,
                    id: nid,
                    capabilitys: cap,
                    osType: ostype,
                    hostname:app.host.valueOf()
                }
            })

            app.ios.hcsw[servernid].send({
                type:'Ws',
                payload:{
                    type:'ClientHallo',
                    iam:nid,
                    network:{
                        [nid]:app.ios.hcsw[nid]
                    }
                }
            })

            app.commit('network += my properties')
            c.node = app.ios.hcsw[nid]
            c.connectJob.ret('ok', 'id = '+nid)
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
                    network: app.ios.hcsw.selectAll()
                }
            })
        },
        onDisconnected: function(c){
            app.ios.hcsw.merge({
                [c.node.id]:'deadbeef',
                connections:{ [c.node.id]:'deadbeef' }
            })
            app.ios.hcsw.sendBroadcast({
                type:'Ws',
                payload:{
                    type:'NetworkInfo',
                    path:'ios.hcsw',
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
            app.ios.hcsw.merge(parsed.network)
            app.ios.hcsw.connections.merge({ [clientnid]:app.ios.hcsw[clientnid] })
            app.commit('got my id')

            app.ios.hcsw.sendBroadcast({
                type:'Ws',
                payload:{
                    type:'NetworkInfo',
                    path:'ios.hcsw.'+clientnid,
                    diff:app.ios.hcsw[clientnid]
                }
            })

            c.node = app.ios.hcsw[clientnid]
            c.connectJob.ret('ok', 'got serverhallo and sent my nodeinfo')
        },
        onNetworkInfo: function(c, parsed){
            app.mergePath(parsed.path, parsed.diff)
            var r = Object.keys(app.ios.hcsw.connections).without([c.node.id.toString()])
            app.ios.hcsw.sendMulticast(r, {
                type:'Ws',
                payload:parsed
            })
        },
        onReload: function(c, parsed){
            app.ios.hcsw.sendBroadcast({
                type:'Ws',
                payload:parsed
            })
        }
    }
}
