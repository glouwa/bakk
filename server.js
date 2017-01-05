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
        clientId:0,
        binDir: 'bin/' + osDir + '/',
        host:os.hostname(),
        network:{
            type:'Network',
            port:config.server.wsport,
            '0': {
                type: 'Server',
                id: serverId, // damed
                clientcount: 0,
                capabilitys: [],
                osType: os.type(),
                hostname: os.hostname()
            },
            msgHandlers:{
                onReload: function(c, parsed){
                    network.sendBroadcast({
                       type:'Ws',
                       payload:parsed
                    })
                },
                onNetworkInfo: function(c, parsed){
                    app.mergePath(parsed.path, parsed.diff)
                    console.log('app.network.connection')
                    console.log(app.network.connections)
                    console.log(c.id)
                    var r = Object.keys(app.network.connections).without([c.id.toString()])
                    console.log(r)
                    network.sendMulticast(r, {
                       type:'Ws',
                       payload:parsed
                    })
                }
            }
        },
        stateChangeHandlers:{
            onConnected: function(connection){
                console.log('+ connection ' + connection.id)
                connection.send({
                    type:'Ws',
                    payload:{
                        type: 'ServerHallo',
                        diff: {
                            clientId: connection.id,
                            network: app.selectAll()
                        }
                    }
                })
            },
            onDisconnected: function(connection){
                console.log('- connection ' + connection.id)
                var path = 'network.'+connection.id

                try { app.mergePath(path, 'deadbeef') } catch(e) {}

                network.sendBroadcast({
                    type:'Ws',
                    payload:{
                        type:'NetworkInfo',
                        path:path,
                        diff:'deadbeef'
                    }
                })
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


