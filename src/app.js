/*app muss in mehreren schritten initiatiliert werden
- app muss existieren, da mvj.model merge verwendet
- es müssen alle typen für einen merge vorhanden sein, dh zu erst müssen built in geladen werden
  man kann beim ersten zb. kein registry oder model verwenden
*/

app = mvj.model('', {    
    clientId: 'unknown',
    registry: {
        types:{}
    }
})

app.merge({    
    clientId: 'unknown',
    workerId:function() { return this.clientId.valueOf() },
    registry: {
        //type:'Registry',
        views:{
            primitiveBound:{ index:{} },
            line:{},
            d3:{},
            a5:{},
            a4:{},
            //a3:{},
        },
        types:{
            //type:'Set<Type>',
            jobs:{ type:'Set<JobPrototype>' },
            workflows:{ type:'Set<Workflow>' },
            io:{ type:'Set<ObjIo>' }, // typ von index? oder nur r/w
        },
    },
    model:{
        //type: 'Model',
        mods: projectFolder.create(),
        jobs:{},
        log: { type:'Set<Job>' },
        store: { type:'Store' },
    },
    network:{
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
    initC:function(args){
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

var consoleLogNetworkStateChangeHandler = {
    onConnecting:   connection=> console.info('...'),
    onConnected:    connection=> console.info('+ connected'),
    onDisconnected: connection=> console.info('- disconnected')
}

var clientMessageHandlerFactory = (fixedId, type, cap)=> ({
    onServerHallo: (c, parsed)=> onServerHallo(fixedId, type, cap, c, parsed, os.type(), os.hostname()),
    onNetworkInfo: (c, parsed)=> app.mergePath(parsed.path, parsed.diff),
    onReload:      (c, parsed)=> {}
})


