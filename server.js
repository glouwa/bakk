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
projectFolder = require('./modules/types/projectFolder.js')
var network       = require('./src/network/nodeWs').network

var jf = jff.jm()
eval(fs.readFileSync('src/app.js')+'')
//eval(fs.readFileSync('src/types/project.js')+'')

app.init({
     host:os.hostname(),
     wsUrl:'ws://' + config.server.wshost + ':' + config.server.wsport,
     onInit:function(){
         var osDir = os.type() == 'Linux' ? 'posix64' : 'dotnet'

         jf.workerId = 'S₀'

         app.merge({
             type:'S',
             clientId: 0,             
             binDir: 'bin/' + osDir + '/',             
             network: {
                 '0': {
                     type: 'Server',
                     id: jf.workerId, // damed
                     clientcount: 0,
                     capabilitys: [],
                     simconfig: sim.config,
                     osType: os.type(),
                     hostname: os.hostname()
                 },
                 msgHandlers:{
                     onReload: function(c, parsed){
                         var channelMsg = messages.channelMsg('Ws', parsed)
                         network.sendBroadcast(channelMsg)
                     },
                     onNetworkInfo: function(c, parsed){
                         app.mergePath(parsed.path, parsed.diff)

                         var receivers = Object.keys(app.network).without([c.id.toString()])
                         console.log(receivers)
                         var channelMsg = messages.channelMsg('Ws', parsed)
                         network.sendMulticast(receivers, channelMsg)
                    }
                 }
             },
             networkStateChangeHandlers:{
                 onConnected: function(connection){
                     console.log('+ connection ' + connection.id)
                     var msg = messages.serverHalloMsg(connection.id, app.network)
                     var channelMsg = messages.channelMsg('Ws', msg)
                     connection.send(channelMsg)
                 },
                 onDisconnected: function(connection){
                     console.log('- connection ' + connection.id)
                     var path = 'network.'+connection.id

                     try { app.mergePath(path, 'deadbeef') } catch(e) {}

                     var msg = messages.networkInfoMsg(path, 'deadbeef')
                     var channelMsg = messages.channelMsg('Ws', msg)
                     network.sendBroadcast(channelMsg)
                 }
             }
         })

         app.network[0].simconfig.on('change', function(changes){
             console.log('simconfig.on change')
             sim.config = app.network[0].simconfig
         })

         network.onConnectionChanged =
         network.sim = sim
         network.listen()
    }
})

//-------------------------------------------------------------------------------------------

var connect = require('connect')
var serveStatic = require('serve-static')
connect().use(serveStatic('./')).listen(config.server.httpport)

//-------------------------------------------------------------------------------------------

function isNode(n){
    return n.type && (
           n.type == 'Worker'
        || n.type == 'Server'
        || n.type == 'Client'
        || n.type == 'Overlord'
    )
}

app.getNodesByCapability = function(criteria)
{
    console.log('getNodesByCapability(' + criteria + ')')
    var nodes = []
    app.network.forEach(function(node, nkey, nidx)
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
    app.network.forEach(function(nval, nkey, nidx)
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


