require( 'console-group' ).install()
console.debug = ()=> {}
var fs       = require('fs')
var os       = require('os')
var jff      = require('./src/job/job.js')
var jl       = require('./src/job/workflows.js')
var tj       = require('./src/job/toolJobs.js')
var mvj      = require('./src/mvj.js')
q            = require('./src/q.js')
var config   = require('./src/config.js')
var tools    = require('./src/tools.js')
var pSet          = require('./modules/types/pSet.js')
projectFolder     = require('./modules/types/projectFolder.js')
var network       = require('./modules/types/nodeWsNetwork.js').network

var osDir = os.type() == 'Linux' ? 'posix64' : 'dotnet'
var jf = jff.jm()
eval(fs.readFileSync('src/app.js')+'')
//eval(fs.readFileSync('src/types/project.js')+'')

var serverId = 'S₀'

app.init({
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
            [serverId]:{
                type:'Server',
                id:serverId, // damed
                clientcount:0,
                capabilitys:[],
                osType:os.type(),
                hostname:os.hostname()
            },
            stateChangeHandlers:serverProtocol.stateChangeHandlers,
            msgHandlers:serverProtocol.msgHandlers
        }
    },
    onInit:j=> app.network.listen(j)
})

//-------------------------------------------------------------------------------------------

var connect = require('connect')
var serveStatic = require('serve-static')
connect().use(serveStatic('./')).listen(config.server.httpport)
