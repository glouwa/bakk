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
var projectFolder = require('./modules/types/projectFolder.js')
var network       = require('./modules/types/nodeWsNetwork.js').network

var osDir = os.type() == 'Linux' ? 'posix64' : 'dotnet'

var jf = jff.jm()
eval(fs.readFileSync('src/app.js')+'')

app.initC({
    builtInTypes:{
         'Network':network,
    },
    structure:{
        type:'O',
        host:os.hostname(),
        clientId:'O₀',
        binDir: 'bin/' + osDir + '/',
        network:{
            type:'Network',
            endpoint:'ws://' + config.server.wshost + ':' + config.server.wsport,
            msgHandlers:clientMessageHandlerFactory('O₀', 'Overlord', [], ()=>{}),

        },
        stateChangeHandlers:consoleLogNetworkStateChangeHandler
    },
    onInit:j=> app.network['⛓'](j)

})

