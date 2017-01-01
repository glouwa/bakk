/*app muss in mehreren schritten initiatiliert werden
- app muss existieren, da mvj.model merge verwendet
- es müssen alle typen für einen merge vorhanden sein, dh zu erst müssen built in geladen werden
  man kann beim ersten zb. kein registry oder model verwenden
*/

app = mvj.model('', {
    wsUrl: 'unknown',
    clientId: 'unknown',
    registry: {
        types:{}
    }
})

app.merge({
    wsUrl: 'unknown',
    clientId: 'unknown',
    registry: {
        //type:'Registry',
        views:{
            primitiveBound:{ index:{} },
            line:{},
            d3:{},
            a5:{},
            a4:{},
            a3:{},
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
        log: { type:'Set<Job>' },
        store: { type:'Store' },
        mods: projectFolder.create()
    },


    rootJob:function(args){
        var jd = jf.job(args)
        app.mergePath('model.jobs.'+jd.id, jd)
        return app.model.jobs[jd.id.valueOf()]
    },
    callUiJob:function(args){
        q.addRoot('Message From UI ' + args.desc, ()=> {
            this.rootJob(args).call()
        })
    },

    init:function(args){
        q.addRoot('App init', ()=> {
            sim.config = config.clientDefaultSimConfig

            this.merge({ wsUrl:args.wsUrl })

            // seitn wos schenas gschriem
            jf.workerId = undefined
            jf.host = args.host
            jf.nextFreeId = 0

            jf.jl = jl
            tj.jm = jf
            tj.config = config
            mvj.jm = jf           

            args.onInit()
        })
    },
    onMessage:function(c, parsed, pduSize){
        q.addRoot('app on "' + parsed.type + '" message ' + c.id + ' ('+pduSize+'b)', ()=>{
            console.info('job', '⟵', pduSize, JSON.stringify(parsed, 0, 4));
            ({
                onWsMessage:  (c, p, s)=> app.wsMessageHandlers['on'+p.type](c, p),
                onJobMessage: (c, p, s)=> jf.onReceive(c, p, code=> eval(code), app, s)
            })['on'+parsed.type+'Message'](c, parsed.payload, pduSize)
        })
    },
    onNetworkStateChange:function(state, connection){
        q.addRoot('Network state changed ' + connection.id + ' ('+state+')', ()=>{
            app.networkStateChangeHandlers['on'+state](connection)
        })
    }
})

// called by Net --------------------------------------------------------------------------

var consoleLogNetworkStateChangeHandler = {
    onConnecting:   connection=> console.info('...'),
    onConnected:    connection=> console.info('+ connected'),
    onDisconnected: connection=> console.info('- disconnected')
}

var clientMessageHandlerFactory = (shortType, type, cap, onConnected)=> ({
    onServerHallo: (c, parsed)=> {
        app.clientId = parsed.diff.clientId
        jf.workerId = shortType + Number(app.clientId).toSubscript()

        var mynodeInfo = {
            type: type,
            id: jf.workerId,
            capabilitys: cap,
            simconfig: config.clientDefaultSimConfig,
            osType: os.type(),
            hostname: os.hostname()
        }
        //app.networkInfo.merge(mynodeInfo)
        var msg = messages.networkInfoMsg('model.network.' + app.clientId, mynodeInfo)
        var channelMsg = messages.channelMsg('Ws', msg)
        network.connections[0].send(channelMsg)

        onConnected()
    },

    onNetworkInfo: (c, parsed)=> app.mergePath(parsed.path, parsed.diff),
    onReload:      (c, parsed)=> {}
})


