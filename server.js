require( 'console-group' ).install()
console.debug = ()=> {}
var fs       = require('fs')
var os       = require('os')
var jff      = require('./src/job/job.js')
var jl       = require('./src/job/workflows.js')
var tj       = require('./src/job/toolJobs.js')
var messages = require('./src/messages.js')
var mvj      = require('./src/mvj.js')
q            = require('./src/q.js')
var config   = require('./src/config.js')
var sim      = require('./src/sim.js')
var tools    = require('./src/tools.js')
var pSet          = require('./modules/types/pSet.js')
projectFolder     = require('./modules/types/projectFolder.js')
var network       = require('./modules/types/nodeWsNetwork.js').network

var osDir = os.type() == 'Linux' ? 'posix64' : 'dotnet'
var jf = jff.jm()
eval(fs.readFileSync('src/app.js')+'')
//eval(fs.readFileSync('src/types/project.js')+'')

var serverId = 'S₀'

app.initC({
    builtInTypes:{
        'Network':network,
    },
    structure:{
        type:'S',
        host:os.hostname(),
        clientId:serverId,
        binDir: 'bin/' + osDir + '/',        
        network:{
            type:'Network',
            port:config.server.wsport,
            [serverId]: {
                type: 'Server',
                id: serverId, // damed
                clientcount: 0,
                capabilitys: [],
                osType: os.type(),
                hostname: os.hostname()
            },
            stateChangeHandlers:{
                onConnected: function(c){
                    c.send({
                        type:'Ws',
                        payload:{
                            type: 'ServerHallo',                    
                            nr:c.idx,
                            iam:serverId,
                            network: app.selectAll()
                        }
                    })
                },
                onDisconnected: function(c){
                    var networkDiff = {
                        [c.node.id]:'deadbeef',
                        connections:{ [c.node.id]:'deadbeef' }
                    }
                    app.network.merge(networkDiff)
                    app.network.sendBroadcast({
                        type:'Ws',
                        payload:{
                            type:'NetworkInfo',
                            path:'network',
                            diff:networkDiff
                        }
                    })                    
                }
            },
            msgHandlers:{
                onReload: function(c, parsed){
                    app.network.sendBroadcast({
                        type:'Ws',
                        payload:parsed
                    })
                },
                onNetworkInfo: function(c, parsed){
                    app.mergePath(parsed.path, parsed.diff)
                    var r = Object.keys(app.network.connections).without([c.node.id.toString()])
                    app.network.sendMulticast(r, {
                        type:'Ws',
                        payload:parsed
                    })
                },
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
                }
            }
        }
    },
    onInit:j=> app.network.listen(j)
})

//-------------------------------------------------------------------------------------------

var connect = require('connect')
var serveStatic = require('serve-static')
connect().use(serveStatic('./')).listen(config.server.httpport)

//-------------------------------------------------------------------------------------------

function isNode(n){
    return true
    returnn.type && (
                n.type == 'Worker'
             || n.type == 'Server'
             || n.type == 'Client'
             || n.type == 'Overlord'
    )    
}

app.selectAll = function()
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
}

app.getNodesByCapability = function(criteria)
{
    console.log('getNodesByCapability(' + criteria + ')')
    var nodes = []
    app.network.connections.forEach(function(node, nkey, nidx)
    {
        if (isNode(node)) {
            node.capabilitys.forEach(function(cval, ckey, cidx)
            {
                if (cval.valueOf() == criteria)
                    nodes.push(app.network[nkey])
            })
        }
    })
    if (nodes.length == 0)
        throw new Error('no workers available')

    console.log(nodes)
    return nodes
}

app.getNodesByType = function(criteria, emptyResultIsOk)
{
    console.log('getNodesByType(' + criteria + ')')
    var nodes = []
    app.network.connections.forEach(function(nval, nkey, nidx)
    {        
        criteria.forEach(function(cval, ckey, cidx)
        {
            if (nval.type && nval.type.valueOf() == cval && cval != 'Server')
            {
                console.log(' + ' + nkey)
                nodes.push(app.network[nkey])
            }
        })
    })    
    if (nodes.length == 0 && !emptyResultIsOk)
        throw new Error('no nodes available')
    return nodes
}


